<template>
  <div class="card mt-3 b-0">
    <h3 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975;">SUD Risk Level</h3>
    <div class="card-body">
      <div class="row">
        <div class="col">
          <div class="d-flex flex-column">
            <div v-for="(substanceGroup, index) in substanceGroups" :key="index" class="row mb-2">
              <div class="col">
                <button v-for="substance in substanceGroup" :key="substance" type="button" class="btn mb-2 me-2"
                  :class="{ 'btn-primary': activeButton === substance }" @click="setActiveButton(substance)">
                  {{ substance }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="col text-center">
          <h4 class="text-capitalize">Severe Risk Count by gender</h4>
          <div class="w-100">
            <apexchart type="donut" :options="donutOptionsTotal" :series="donutSeriesTotal"></apexchart>
          </div>
        </div>
        <div class="col text-center">
          <h4 class="text-capitalize">Moderate Risk Count by gender</h4>
          <div class="w-100">
            <apexchart type="donut" :options="donutOptionsModerate" :series="donutSeriesModerate"></apexchart>
          </div>
        </div>
        <div class="col">
          <apexchart type="bar" height="350" :options="barOptions" :series="barSeries"></apexchart>
        </div>
        <div v-if="activeButton === 'Table'">
          <cecdSUDSeverityTable :filteredData="filteredData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import cecdSUDSeverityTable from './cecdSUDSeverityTable.vue'


const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

const activeButton = ref('Tobacco');

const substances = [
  'Tobacco', 'Alcohol', 'Cannabis', 'Cocaine', 'Amphetamine-type',
  'Inhalant', 'Sedative', 'Hallucinate', 'Opioids', 'Others', 'Table'
];

const substanceGroups = [
  ['Tobacco', 'Alcohol'],
  ['Cannabis', 'Cocaine'],
  ['Amphetamine-type', 'Inhalant'],
  ['Sedative', 'Hallucinate'],
  ['Opioids', 'Others', 'Table']
];

const substanceMapping = {
  'Tobacco': 'Tobacco products',
  'Alcohol': 'Alcoholic beverages',
  'Cannabis': 'Cannabis',
  'Cocaine': 'Cocaine',
  'Amphetamine-type': 'Amphetamine-type stimulants',
  'Inhalant': 'Inhalants',
  'Sedative': 'Sedatives or Sleeping Pills',
  'Hallucinate': 'Hallucinogens',
  'Opioids': 'Opioids',
  'Others': 'Other - specify'
};

const donutOptionsTotal = ref({
  chart: { type: 'donut' },
  labels: ['Male', 'Female'],
  colors: ['#2c6975', '#000000'],
  legend: { position: 'bottom' }
});

const donutOptionsModerate = ref({
  chart: { type: 'donut' },
  labels: ['Male', 'Female'],
  colors: ['#2c6975', '#000000'],
  legend: { position: 'bottom' }
});

const barOptions = ref({
  chart: { type: 'bar', stacked: true },
  xaxis: { categories: ['Severe Risk', 'Moderate Risk'] },
  colors: ['#2c6975', '#000000'],
  legend: { position: 'bottom' }
});

const donutSeriesTotal = ref([0, 0]);
const donutSeriesModerate = ref([0, 0]);
const barSeries = ref([]);

function countRiskLevels(data) {
  const counts = {};
  substances.forEach(substance => {
    counts[substance] = {
      severe_male: 0, severe_female: 0,
      moderate_male: 0, moderate_female: 0,
      mild_male: 0, mild_female: 0,
      none_male: 0, none_female: 0
    };
  });

  data.forEach(person => {
    const gender = person.user?.gender?.toLowerCase() || 'unknown';
    const assistData = person.screening_data?.assist_data || [];

    if (Array.isArray(assistData)) {
      assistData.forEach(substance => {
        const substanceKey = Object.entries(substanceMapping).find(([key, value]) =>
          substance.substance__name.includes(value)
        )?.[0];

        if (substanceKey && substance.risk_flag && (gender === 'male' || gender === 'female')) {
          const riskLevel = substance.risk_flag.toLowerCase();
          const riskKey = `${riskLevel}_${gender}`;
          if (counts[substanceKey] && counts[substanceKey][riskKey] !== undefined) {
            counts[substanceKey][riskKey]++;
          }
        }
      });
    }
  });

  return counts;
}

function updateCharts() {
  if (!activeButton.value || activeButton.value === 'Table') return;

  const counts = countRiskLevels(props.filteredData);
  const data = counts[activeButton.value];

  if (!data) return;

  donutSeriesTotal.value = [
    data.severe_male || 0,
    data.severe_female || 0
  ];

  donutSeriesModerate.value = [
    data.moderate_male || 0,
    data.moderate_female || 0
  ];

  barSeries.value = [
    {
      name: 'Male',
      data: [data.severe_male || 0, data.moderate_male || 0]
    },
    {
      name: 'Female',
      data: [data.severe_female || 0, data.moderate_female || 0]
    }
  ];
}

const setActiveButton = (buttonName) => {
  activeButton.value = buttonName;
  updateCharts();
};

// Watch for changes in filteredData
watch(() => props.filteredData, () => {
  if (!activeButton.value) {
    setActiveButton('Tobacco');
  } else {
    updateCharts();
  }
}, { immediate: true, deep: true });

// Initial update
updateCharts();
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