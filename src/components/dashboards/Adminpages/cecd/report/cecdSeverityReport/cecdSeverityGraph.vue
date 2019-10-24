<template>
  <div class="card mt-5 b-0">
    <h3 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975">Mental Health Risk Level</h3>
    <div class="card-body">
      <div class="row">
        <div class="col">
          <div class="d-flex flex-column">
            <div class="row">
              <div class="col">
                <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Depression' }"
                  @click="setActiveButton('Depression')">
                  Depression
                </button>
                <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Anxiety' }"
                  @click="setActiveButton('Anxiety')">
                  Anxiety
                </button>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'ACE' }"
                  @click="setActiveButton('ACE')">
                  ACE
                </button>
                <button type="button" class="btn mb-2"
                  :class="{ 'btn-primary': activeButton === 'Suicidal Behaviours' }"
                  @click="setActiveButton('Suicidal Behaviours')">
                  Suicidal Behaviours
                </button>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Table' }"
                  @click="setActiveButton('Table')">
                  Table
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="col">
          <div v-if="activeButton === 'Table'">
            <AAASeverityTable :filteredData='filteredData' />
          </div>
          <div v-else>
            <apexchart type="bar" height="350" :options="chartOptions" :series="series"></apexchart>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import cecdSeverityTable from './cecdSeverityTable.vue'

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
})

const activeButton = ref(null)
const chartOptions = ref({
  chart: {
    type: 'bar',
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      endingShape: 'rounded'
    },
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: [],
  },
  yaxis: {
    title: {
      text: 'Count'
    }
  },
  fill: {
    opacity: 1,
    colors: ['#2c6975']
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val
      }
    }
  }
})

const series = ref([{
  name: 'Count',
  data: []
}])

// Helper function to safely parse JSON string
const safeJSONParse = (jsonString, defaultValue = null) => {
  try {
    return jsonString && jsonString !== '{}' ? JSON.parse(jsonString) : defaultValue;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
};

// PHQ-9 Counts
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
})

// GAD-7 Counts
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
})

// ACE Counts
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
})

// Suicidal Behaviours Counts
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
})

const setActiveButton = (buttonName) => {
  activeButton.value = buttonName
  if (buttonName !== 'Table') {
    updateChart(buttonName)
  }
}

const updateChart = (buttonName) => {
  let categories = []
  let data = []

  if (buttonName === 'Depression') {
    categories = ['Severe', 'Minimal', 'Moderate', 'Moderately Severe', 'Mild']
    data = [phqCounts.value.severe, phqCounts.value.minimal, phqCounts.value.moderate,
    phqCounts.value.moderately_severe, phqCounts.value.mild]
  } else if (buttonName === 'Anxiety') {
    categories = ['Severe', 'Minimal', 'Moderate', 'Mild']
    data = [gadCounts.value.severe, gadCounts.value.minimal, gadCounts.value.moderate,
    gadCounts.value.mild]
  } else if (buttonName === 'ACE') {
    categories = ['High Risk', 'Intermediate Risk', 'Low Risk']
    data = [aceCounts.value.high_risk, aceCounts.value.intermediate_risk,
    aceCounts.value.low_risk]
  } else if (buttonName === 'Suicidal Behaviours') {
    categories = ['Nearly Everyday', 'More Than Half The Days', 'Several Days']
    data = [suicidalCounts.value.nearlyeveryday, suicidalCounts.value.more_than_half_the_days,
    suicidalCounts.value.several_days]
  }

  chartOptions.value = {
    ...chartOptions.value,
    xaxis: {
      ...chartOptions.value.xaxis,
      categories: categories
    }
  }

  series.value = [{
    name: `${buttonName} Counts`,
    data: data
  }]
}

// Watch for data changes
watch(() => props.filteredData, () => {
  if (activeButton.value && activeButton.value !== 'Table') {
    updateChart(activeButton.value)
  }
}, { deep: true })

// Initial chart setup
watch(activeButton, (newValue) => {
  if (newValue && newValue !== 'Table') {
    updateChart(newValue)
  }
}, { immediate: true })
</script>

<style scoped>
.custom-card {
  background-color: #d3e2e4;
}

.btn {
  height: 50px;
  width: 150px;
}

.btn-primary {
  background-color: #2c6975 !important;
}
</style>