<template>
  <div class="card">
    <h3 class="text-center font-bold text-xl mb-4" style="color: #2c6975">Mental Health Risk Level</h3>
    <div class="card-body">
      <div class="flex flex-col md:flex-row">
        <div class="w-full md:w-1/3 mb-4 md:mb-0">
          <div class="flex flex-wrap gap-2">
            <Button @click="setActiveButton('Depression')"
              :class="{ 'p-button-primary': activeButton === 'Depression' }">
              Depression
            </Button>
            <Button @click="setActiveButton('Anxiety')" :class="{ 'p-button-primary': activeButton === 'Anxiety' }">
              Anxiety
            </Button>
            <Button @click="setActiveButton('ACE')" :class="{ 'p-button-primary': activeButton === 'ACE' }">
              ACE
            </Button>
            <Button @click="setActiveButton('Suicidal Behaviours')"
              :class="{ 'p-button-primary': activeButton === 'Suicidal Behaviours' }">
              Suicidal Behaviours
            </Button>
          </div>
        </div>
        <div class="w-full md:w-2/3">
          <DataTable :value="tableData" :paginator="false" :rows="5">
            <Column field="riskLevel" header="Risk Level"></Column>
            <Column field="count" header="Count"></Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

const activeButton = ref('Depression'); // Set default active button

// Helper function to safely parse JSON string
const safeJSONParse = (jsonString, defaultValue = null) => {
  try {
    return jsonString && jsonString !== '{}' ? JSON.parse(jsonString) : defaultValue;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
};

// Updated count functions to handle the screening_data structure
const phqCounts = computed(() => {
  const counts = {
    severe: 0,
    minimal: 0,
    moderate: 0,
    moderately_severe: 0,
    mild: 0,
  };

  props.filteredData.forEach(item => {
    const screeningData = item.screening_data;
    if (screeningData && screeningData.phq_score !== undefined) {
      const score = screeningData.phq_score;

      if (score >= 20) counts.severe++;
      else if (score >= 15) counts.moderately_severe++;
      else if (score >= 10) counts.moderate++;
      else if (score >= 5) counts.mild++;
      else counts.minimal++;
    }
  });

  return counts;
});

const gadCounts = computed(() => {
  const counts = {
    severe: 0,
    minimal: 0,
    moderate: 0,
    mild: 0,
  };

  props.filteredData.forEach(item => {
    const screeningData = item.screening_data;
    if (screeningData && screeningData.gad_score !== undefined) {
      const score = screeningData.gad_score;

      if (score >= 15) counts.severe++;
      else if (score >= 10) counts.moderate++;
      else if (score >= 5) counts.mild++;
      else counts.minimal++;
    }
  });

  return counts;
});

const aceCounts = computed(() => {
  const counts = {
    high_risk: 0,
    intermediate_risk: 0,
    low_risk: 0,
  };

  props.filteredData.forEach(item => {
    const screeningData = item.screening_data;
    if (screeningData && screeningData.ace_score !== undefined) {
      const score = screeningData.ace_score;

      if (score >= 4) counts.high_risk++;
      else if (score >= 2) counts.intermediate_risk++;
      else counts.low_risk++;
    }
  });

  return counts;
});

const suicidalCounts = computed(() => {
  const counts = {
    nearlyeveryday: 0,
    more_than_half_the_days: 0,
    several_days: 0,
  };

  props.filteredData.forEach(item => {
    const screeningData = item.screening_data;
    if (screeningData && screeningData.phq_data) {
      const phqData = safeJSONParse(screeningData.phq_data);
      if (phqData && phqData.responses) {
        const suicideQuestion = phqData.responses.find(r =>
          r.question?.toLowerCase().includes('thoughts that you would be better off dead') ||
          r.question?.toLowerCase().includes('suicide')
        );

        if (suicideQuestion) {
          const option = suicideQuestion.selectedOption?.toLowerCase() || '';
          if (option.includes('nearly every day')) {
            counts.nearlyeveryday++;
          } else if (option.includes('more than half')) {
            counts.more_than_half_the_days++;
          } else if (option.includes('several days')) {
            counts.several_days++;
          }
        }
      }
    }
  });

  return counts;
});

const setActiveButton = (buttonName) => {
  activeButton.value = buttonName;
};

const tableData = computed(() => {
  switch (activeButton.value) {
    case 'Depression':
      return [
        { riskLevel: 'Severe', count: phqCounts.value.severe },
        { riskLevel: 'Moderately Severe', count: phqCounts.value.moderately_severe },
        { riskLevel: 'Moderate', count: phqCounts.value.moderate },
        { riskLevel: 'Mild', count: phqCounts.value.mild },
        { riskLevel: 'Minimal', count: phqCounts.value.minimal },
      ];
    case 'Anxiety':
      return [
        { riskLevel: 'Severe', count: gadCounts.value.severe },
        { riskLevel: 'Moderate', count: gadCounts.value.moderate },
        { riskLevel: 'Mild', count: gadCounts.value.mild },
        { riskLevel: 'Minimal', count: gadCounts.value.minimal },
      ];
    case 'ACE':
      return [
        { riskLevel: 'High Risk', count: aceCounts.value.high_risk },
        { riskLevel: 'Intermediate Risk', count: aceCounts.value.intermediate_risk },
        { riskLevel: 'Low Risk', count: aceCounts.value.low_risk },
      ];
    case 'Suicidal Behaviours':
      return [
        { riskLevel: 'Nearly Everyday', count: suicidalCounts.value.nearlyeveryday },
        { riskLevel: 'More Than Half The Days', count: suicidalCounts.value.more_than_half_the_days },
        { riskLevel: 'Several Days', count: suicidalCounts.value.several_days },
      ];
    default:
      return [];
  }
});

// Watch for data changes and ensure default selection
watch(() => props.filteredData, () => {
  if (!activeButton.value) {
    setActiveButton('Depression');
  }
}, { immediate: true });
</script>

<style scoped>
.p-button {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.p-button-primary {
  background-color: #2c6975 !important;
  border-color: #2c6975 !important;
}
</style>