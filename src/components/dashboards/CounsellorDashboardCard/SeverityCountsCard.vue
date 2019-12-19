<template>
  <div class="severity-dashboard">
    <div class="row">
      <h4 class="col-12 mb-3 text-start dashboard-title">Severity</h4>
      <div v-for="(item, index) in SEVERITY_ITEMS" :key="index" class="col-md-2 mx-auto mb-4">
        <div @click="setActiveIndex(index)" :class="['severity-card', { 'active-card': isActive(index) }]">
          <div class="card-body d-flex flex-column align-items-center justify-content-center">
            <div class="count-circle">{{ item.count }}</div>
            <h6 class="mt-3 text-uppercase">{{ item.title }}</h6>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4" v-if="activeItem.title !== 'Assist'">
      <div class="col-md-4">
        <div class="card-container">
          <SeverityIndicatorCard v-if="activeItem" :cardTitle="activeItem.title" :filteredData="getRelevantData"
            :isLoading="isLoading" :severityCounts="severityCounts" />
        </div>
      </div>
      <div class="col-md-8">
        <div class="card-container">
          <SeverityGraphCard v-if="activeItem" :cardTitle="activeItem.title" :filteredData="getRelevantData"
            :isLoading="isLoading" />
        </div>
      </div>
    </div>

    <div class="row mt-4" v-if="activeItem.title === 'Assist'">
      <div class="col-12">
        <div class="card-container">
          <AssistSeverityAndGraph :data="assistStructuredData" :isLoading="isLoading" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue';
import axios from 'axios';
import endpoints from '@/api';

import SeverityGraphCard from './SeverityGraphCard.vue';
import AssistSeverityAndGraph from './AssistSeverityAndGraph.vue';
import SeverityIndicatorCard from './SeverityIndicatorCard.vue';

const SEVERITY_ITEMS = ref([
  {
    count: '0',
    title: 'Suicidal Behavior',
    field: 'phq_data',
    threshold: value => {
      try {
        // If it's an array format
        if (Array.isArray(value)) {
          // Find the suicidal thoughts question (usually last question)
          const suicidalQuestion = value.find(q =>
            q.question && q.question.toLowerCase().includes('thoughts that you would be better off dead')
          );
          return suicidalQuestion && suicidalQuestion.score >= 1 && suicidalQuestion.selectedOption?.toLowerCase() !== 'not at all';
        }
        // If it's a string, try to parse it
        if (typeof value === 'string') {
          const phqData = JSON.parse(value);
          if (phqData.responses) {
            const suicidalQuestion = phqData.responses.find(q =>
              q.question && q.question.toLowerCase().includes('thoughts that you would be better off dead')
            );
            return suicidalQuestion && suicidalQuestion.score >= 1 && suicidalQuestion.selectedOption?.toLowerCase() !== 'not at all';
          }
        }
        // If it's already an object
        if (value && value.responses) {
          const suicidalQuestion = value.responses.find(q =>
            q.question && q.question.toLowerCase().includes('thoughts that you would be better off dead')
          );
          return suicidalQuestion && suicidalQuestion.score >= 1 && suicidalQuestion.selectedOption?.toLowerCase() !== 'not at all';
        }


        return false;
      } catch (e) {
        console.error('Error evaluating suicidal behavior threshold:', e);
        return false;
      }
    }
  },
  {
    count: '0',
    title: 'Depression',
    field: 'phq_score',
    threshold: value => value >= 10
  },
  {
    count: '0',
    title: 'Anxiety',
    field: 'gad_score',
    threshold: value => value >= 10
  },
  {
    count: '0',
    title: 'ACE',
    field: 'ace_score',
    threshold: value => value >= 4
  },
  {
    count: '0',
    title: 'Assist',
    field: 'assist_data',
    threshold: value => {
      if (!value) return false;

      try {
        const assistData = typeof value === 'string' ? JSON.parse(value) : value;

        if (Array.isArray(assistData)) {
          return assistData.some(item => item?.risk_flag && item.risk_flag !== 'none');
        }

        return Object.keys(assistData).some(key =>
          key.includes('_flag') && assistData[key] !== 'none'
        );
      } catch (error) {
        console.error('Error parsing assist_data:', error);
        return false;
      }
    }
  }
]);

const activeIndex = ref(0);
const activeItem = computed(() => SEVERITY_ITEMS.value[activeIndex.value]);
const filteredData = ref([]);
const assistStructuredData = ref({
  total: 0,
  substances: {}
});
const isLoading = ref(true);
const error = ref(null);
const severityCounts = ref({}); // Added severityCounts ref

const getRelevantData = computed(() => {
  if (!activeItem.value || !filteredData.value.length) return [];
  return filteredData.value;
});

const processAssistData = () => {
  const structured = {
    total: 0,
    substances: {}
  };

  filteredData.value.forEach(item => {
    const assistData = item.screening_data?.assist_data;

    if (assistData) {
      structured.total++;

      // Parse and normalize assist data
      const parsedAssistData = typeof assistData === 'string' ? JSON.parse(assistData) : assistData;

      if (Array.isArray(parsedAssistData)) {
        // Handle array format (Type 1)
        parsedAssistData.forEach(substance => {
          const name = substance.substance__name || substance.substance_name || 'Unknown Substance';
          const risk = substance.risk_flag ? substance.risk_flag.toLowerCase() : 'low';

          // Normalize substance names
          const normalizedSubstance = normalizeSubstanceName(name);

          if (!structured.substances[normalizedSubstance]) {
            structured.substances[normalizedSubstance] = { high: 0, moderate: 0, low: 0 };
          }

          if (risk === 'severe' || risk === 'high') structured.substances[normalizedSubstance].high++;
          else if (risk === 'moderate') structured.substances[normalizedSubstance].moderate++;
          else structured.substances[normalizedSubstance].low++;
        });
      } else if (typeof parsedAssistData === 'object') {
        // Handle object format (Type 2)
        Object.keys(parsedAssistData).forEach(key => {
          if (key.endsWith('_flag') && parsedAssistData[key]) {
            const substanceKey = key.replace('_flag', '');
            const measurementKey = `${substanceKey}_measurement`;

            const risk = parsedAssistData[measurementKey]
              ? parsedAssistData[measurementKey].toLowerCase()
              : parsedAssistData[key].toLowerCase();

            // Map substanceKey to substance name
            const normalizedSubstance = mapSubstanceKeyToName(substanceKey);

            if (!structured.substances[normalizedSubstance]) {
              structured.substances[normalizedSubstance] = { high: 0, moderate: 0, low: 0 };
            }

            if (risk === 'severe' || risk === 'high risk' || risk === 'red') {
              structured.substances[normalizedSubstance].high++;
            } else if (risk === 'moderate' || risk === 'moderate risk' || risk === 'yellow') {
              structured.substances[normalizedSubstance].moderate++;
            } else {
              structured.substances[normalizedSubstance].low++;
            }
          }
        });
      }
    }
  });

  assistStructuredData.value = structured;
};

// Helper function to normalize substance names from Type 1
const normalizeSubstanceName = (name) => {
  const substanceMap = {
    'Tobacco products (cigarettes, chewing tobacco etc)': 'Tobacco',
    'Alcoholic beverages (beer, wine, spirits, ara etc.)': 'Alcohol',
    'Cannabis (marijuana, pot, grass, hash, black etc.)': 'Cannabis',
    'Opioids (heroin, morphine, fentanyl, codeine, SP+, tramadol, BS etc.)': 'Opioids',
    'Cocaine': 'Cocaine',
    'Amphetamine-type stimulants (meth, ecstasy, yebe, diet pills etc.)': 'Amphetamines',
    'Inhalants (dendrite, glue, petrol, paint thinner, etc.)': 'Inhalants',
    'Sedatives or Sleeping Pills (N-10, diazepam etc.)': 'Sedatives',
    'Hallucinogens (LSD, trips, Ketamine, etc.)': 'Hallucinogens',
    'Other - specify': 'Other',
    'Any Drug': 'Any Drug'
    // Add more mappings as needed
  };

  return substanceMap[name] || name;
};

// Helper function to map substance keys from Type 2 to names
const mapSubstanceKeyToName = (key) => {
  const substanceMap = {
    tobacco: 'Tobacco',
    alcoholic: 'Alcohol',
    cannabis: 'Cannabis',
    opioids: 'Opioids',
    cocaine: 'Cocaine',
    amphetamine: 'Amphetamines',
    inhalants: 'Inhalants',
    sedatives: 'Sedatives',
    hallucinogens: 'Hallucinogens',
    injection: 'Injection',
    other: 'Other'
    // Add more mappings as needed
  };

  return substanceMap[key] || key;
};


function isActive(index) {
  return index === activeIndex.value;
}

function setActiveIndex(index) {
  activeIndex.value = index;
}

const getUserDetailsFromStorage = () => {
  const userDetailsString = localStorage.getItem('userDetailsStore');
  if (!userDetailsString) {
    console.error('No userDetailsStore found in localStorage');
    return { agencyName: 'Unknown Agency' };
  }

  try {
    const userDetails = JSON.parse(userDetailsString);
    return { agencyName: userDetails?.agency?.agencyName || 'Unknown Agency' };
  } catch (error) {
    console.error('Error parsing user details:', error);
    return { agencyName: 'Unknown Agency' };
  }
};

const fetchAndFilterData = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await axios.get(endpoints.newServiceAndTreatment);
    const dataArray = response.data || [];
    const { agencyName } = getUserDetailsFromStorage();
    const currentYear = new Date().getFullYear();
    filteredData.value = dataArray.filter(item => {
      const agencyMatch = item.user?.active_agency?.agency_name === agencyName;
      const screeningData = item.screening_data;
      const submissionYear = screeningData?.submission_date
        ? new Date(screeningData.submission_date).getFullYear()
        : null;

      return agencyMatch && screeningData && submissionYear === currentYear;
    });

    updateSeverityCounts();
    processAssistData();
    isLoading.value = false;
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = 'Failed to load data';
    isLoading.value = false;
  }
};

const updateSeverityCounts = () => {
  const counts = {};
  // Reset the counts first
  SEVERITY_ITEMS.value.forEach(item => {
    counts[item.title] = {};
  });

  filteredData.value.forEach(entry => {
    const screeningData = entry.screening_data;
    if (!screeningData || screeningData === "Data not available") return;


    SEVERITY_ITEMS.value.forEach(item => {
      let measurement = null;

      if (item.field === 'assist_data') {
        try {
          let assistValue = screeningData[item.field];
          let hasRisk = false;

          if (assistValue) {
            if (typeof assistValue === 'string') {
              assistValue = JSON.parse(assistValue);
            }
            if (item.threshold(assistValue)) {
              hasRisk = true;
            }
          }

          if (!hasRisk && entry.event_substance_risks?.length > 0) {
            hasRisk = entry.event_substance_risks.some(risk =>
              risk.risk_flag && !risk.risk_flag.toLowerCase().includes('none')
            );
          }

          if (!hasRisk && entry.case_substance_risks?.length > 0) {
            hasRisk = entry.case_substance_risks.some(risk =>
              risk.risk_flag && !risk.risk_flag.toLowerCase().includes('none')
            );
          }
          if (hasRisk) {
            measurement = 'Has Risk';
          }
        }
        catch (error) {
          console.error(`Error evaluating assist data:`, error);
        }
      } else if (item.field === 'phq_data') {
        try {
          let value = screeningData[item.field];
          if (typeof value === 'string') {
            value = JSON.parse(value);
          }

          let hasSuicidalThoughts = false;

          if (Array.isArray(value)) {
            const suicideQuestion = value.find(q =>
              q.question && q.question.toLowerCase().includes('thoughts that you would be better off dead')
            );
            hasSuicidalThoughts = suicideQuestion?.score >= 1 && suicideQuestion.selectedOption?.toLowerCase() !== 'not at all';
          } else if (value?.responses) {
            const suicideQuestion = value.responses.find(q =>
              q.question && q.question.toLowerCase().includes('thoughts that you would be better off dead')
            );
            hasSuicidalThoughts = suicideQuestion?.score >= 1 && suicideQuestion.selectedOption?.toLowerCase() !== 'not at all';
          }
          if (hasSuicidalThoughts) {
            measurement = 'Has Suicidal Thoughts'
          }
        } catch (error) {
          console.error(`Error evaluating PHQ data:`, error);
        }

      } else {
        let value = screeningData[item.field];
        if (value === undefined || value === null) return;

        try {
          if (typeof value === 'string' && item.field !== 'phq_score' && item.field !== 'gad_score') {
            value = JSON.parse(value);
          }

          if (item.threshold(value)) {
            if (item.title === 'Depression') {
              measurement = screeningData.phq_interpretation || null;
            } else if (item.title === 'Anxiety') {
              measurement = screeningData.gad_interpretation || null;
            } else if (item.title === 'ACE') {
              measurement = screeningData.ace_interpretation || null;
            } else {
              measurement = 'Has Risk';
            }
          }
        } catch (error) {
          console.error(`Error evaluating threshold for ${item.title}:`, error);
        }
      }

      if (measurement) {
        counts[item.title][measurement] = (counts[item.title][measurement] || 0) + 1;
      }
    });
  });
  SEVERITY_ITEMS.value.forEach(item => {
    let total = 0;
    for (let key in counts[item.title]) {
      total += counts[item.title][key];
    }
    item.count = total.toString();
  });
  severityCounts.value = counts;
};


onMounted(async () => {
  await fetchAndFilterData();
});

watchEffect(() => {
  if (filteredData.value.length > 0) {
    processAssistData();
    updateSeverityCounts();
  }
});
</script>


<style scoped>
.severity-dashboard {
  padding: 2rem;
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(43, 101, 111, 0.1);
}

.dashboard-title {
  color: #2B656F;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.severity-card {
  background: linear-gradient(135deg, #ffffff, #f0f7f8);
  border: 2px solid transparent;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  box-shadow: 0 4px 6px rgba(43, 101, 111, 0.1);
}

.severity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(43, 101, 111, 0.15);
}

.active-card {
  border-color: #2B656F;
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.active-card .card-body h6,
.active-card .count-circle {
  color: #ffffff;
}

.card-body {
  padding: 1.25rem;
}

.count-circle {
  background-color: rgba(43, 101, 111, 0.1);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2B656F;
  margin-bottom: 0.5rem;
}

.card-body h6 {
  color: #2B656F;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.card-container {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(43, 101, 111, 0.1);
  height: 100%;
  transition: all 0.3s ease;
}

.card-container:hover {
  box-shadow: 0 6px 12px rgba(43, 101, 111, 0.15);
}

@media (max-width: 768px) {
  .severity-dashboard {
    padding: 1rem;
  }

  .count-circle {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }

  .card-body h6 {
    font-size: 0.7rem;
  }
}
</style>