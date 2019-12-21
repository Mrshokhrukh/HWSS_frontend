<template>
  <div class="severity-dashboard p-4">
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

    <div class="row mt-4" v-if="activeItem && activeItem.title !== 'Assist'">
      <div class="col-md-4">
        <div class="card-container">
          <SeverityIndicatorCard v-if="activeItem && dataReady" :cardTitle="activeItem.title"
            :filteredData="getRelevantData" :isLoading="isLoading" :severityCounts="severityCounts"
            :key="activeItem.title + 'indicator'" />
        </div>
      </div>
      <div class="col-md-8">
        <div class="card-container">
          <SeverityGraphCard v-if="activeItem && dataReady" :cardTitle="activeItem.title" :filteredData="getRelevantData"
            :isLoading="isLoading" :key="activeItem.title + 'graph'" />
        </div>
      </div>
    </div>

    <div class="row mt-4" v-if="activeItem && activeItem.title === 'Assist'">
      <div class="col-12">
        <div class="card-container">
          <AssistSeverityAndGraph v-if="activeItem && dataReady" :data="assistStructuredData" :isLoading="isLoading"
            :totalRiskUsers="assistStructuredData.total" :key="activeItem.title + 'assist'" />
        </div>
      </div>
    </div>
    <div v-if="isLoading">
      Loading...
    </div>
    <div v-else-if="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect, nextTick } from 'vue';
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
        if (Array.isArray(value)) {
          const suicidalQuestion = value.find(q =>
            q.question && q.question.toLowerCase().includes('thoughts that you would be better off dead')
          );
          return suicidalQuestion && suicidalQuestion.score >= 1 && suicidalQuestion.selectedOption?.toLowerCase() !== 'not at all';
        }
        if (typeof value === 'string') {
          const phqData = JSON.parse(value);
          if (phqData.responses) {
            const suicidalQuestion = phqData.responses.find(q =>
              q.question && q.question.toLowerCase().includes('thoughts that you would be better off dead')
            );
            return suicidalQuestion && suicidalQuestion.score >= 1 && suicidalQuestion.selectedOption?.toLowerCase() !== 'not at all';
          }
        }
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
const severityCounts = ref({});
const dataReady = ref(false);


const getRelevantData = computed(() => {
  if (!activeItem.value || !filteredData.value.length) return [];
  return filteredData.value;
});

const extractRiskLevel = (riskFlag) => {
  if (!riskFlag) return 'low';
  const lowerCaseFlag = riskFlag.toLowerCase();
  if (lowerCaseFlag.includes('severe') || lowerCaseFlag.includes('high')) return 'high';
  if (lowerCaseFlag.includes('moderate') || lowerCaseFlag.includes('moderately severe')) return 'moderate';
  return 'low'

};

const processAssistData = () => {
    const structured = {
        total: 0,
        substances: {}
    };

    filteredData.value.forEach(item => {
        let hasNonNoneRisk = false;
        const allAssistData = [];

        // Collect risk data from all possible locations
        if (item.case_substance_risks) {
            allAssistData.push(...item.case_substance_risks);
        }
        if (item.event_substance_risks) {
            allAssistData.push(...item.event_substance_risks);
        }
        if (item.screening_data?.assist_data) {
            let assistData = item.screening_data.assist_data;
            if (assistData) {
                if (typeof assistData === 'string') {
                    assistData = JSON.parse(assistData);
                }
                if (Array.isArray(assistData)) {
                  allAssistData.push(...assistData);
                }
              else if (typeof assistData === 'object') {
                    // If assistData is an object, check its keys
                     hasNonNoneRisk = Object.values(assistData).some(value =>
                         typeof value === 'string' && value.toLowerCase() !== 'none'
                     );
                }

            }
        }


        if (allAssistData.length > 0) {
             hasNonNoneRisk = allAssistData.some(data => {
                return extractRiskLevel(data.risk_flag) !== 'low'
             })
        }

        if (hasNonNoneRisk) {
            structured.total++; // Increment total only if any risk data is found
            allAssistData.forEach(data => {
                let name = data.substance__name || data.substance_name || 'Unknown Substance';
                const risk = extractRiskLevel(data.risk_flag);
                const normalizedSubstance = normalizeSubstanceName(name);
                if (!structured.substances[normalizedSubstance]) {
                    structured.substances[normalizedSubstance] = { high: 0, moderate: 0, low: 0 };
                }
                if (risk === 'high') structured.substances[normalizedSubstance].high++;
                else if (risk === 'moderate') structured.substances[normalizedSubstance].moderate++;
                else structured.substances[normalizedSubstance].low++;
            });
        }

    });
    assistStructuredData.value = structured;
};

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
  };
  return substanceMap[name] || name;
};
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
  };
  return substanceMap[key] || key;
};
function isActive(index) {
  return index === activeIndex.value;
}

async function setActiveIndex(index) {
  if (isLoading.value) return;
  activeIndex.value = index;

  await nextTick();

  // Short timeout to ensure clean transition
  setTimeout(() => {
    dataReady.value = true;
    isLoading.value = false;
  }, 100);
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

    // Log the raw data fetched from the API
    console.log("Raw data fetched from API:", dataArray);


    filteredData.value = dataArray.filter(item => {
      const agencyMatch = item.user?.active_agency?.agency_name === agencyName;
      const screeningData = item.screening_data;
      const submissionYear = screeningData?.submission_date
        ? new Date(screeningData.submission_date).getFullYear()
        : null;


      return agencyMatch && screeningData && submissionYear === currentYear;
    });


    // Log filtered data after applying agency and year filters
    console.log("Filtered data after agency and year filters:", filteredData.value);


    updateSeverityCounts();
    processAssistData();
    dataReady.value = true;
    isLoading.value = false;
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = 'Failed to load data';
    isLoading.value = false;
  }
};

const updateSeverityCounts = () => {
  const counts = {};
  SEVERITY_ITEMS.value.forEach(item => {
    counts[item.title] = {};
  });

  filteredData.value.forEach(entry => {
    const screeningData = entry.screening_data;
    if (!screeningData || screeningData === "Data not available") return;
    SEVERITY_ITEMS.value.forEach(item => {
      let measurement = null;

      if (item.field === 'assist_data') {
        let hasRisk = false;
        // Check case_substance_risks
        if (entry.case_substance_risks && entry.case_substance_risks.length > 0) {
          hasRisk = entry.case_substance_risks.some(risk =>
            extractRiskLevel(risk.risk_flag) !== 'low'
          );
        }
        // Check event_substance_risks
        if (!hasRisk && entry.event_substance_risks && entry.event_substance_risks.length > 0) {
          hasRisk = entry.event_substance_risks.some(risk =>
            extractRiskLevel(risk.risk_flag) !== 'low'
          );
        }
        // Check screening_data.assist_data
        if (!hasRisk && screeningData?.assist_data) {
          try {
            let assistValue = screeningData.assist_data;
            if (assistValue) {
              if (typeof assistValue === 'string') {
                assistValue = JSON.parse(assistValue);
              }
              if (Array.isArray(assistValue)) {
                hasRisk = assistValue.some(data => extractRiskLevel(data.risk_flag) !== 'low');
              } else {
                hasRisk = item.threshold(assistValue)
              }
            }

          }
          catch (error) {
            console.error(`Error evaluating assist data:`, error);
          }
        }
        if (hasRisk) {
          measurement = 'Has Risk';
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