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
          <h4 class="text-capitalize">High Risk Count by Sex</h4>
          <div class="w-100">
            <apexchart type="donut" :options="donutOptionsTotal" :series="donutSeriesTotal"></apexchart>
          </div>
        </div>
        <div class="col text-center">
          <h4 class="text-capitalize">Moderate Risk Count by Sex</h4>
          <div class="w-100">
            <apexchart type="donut" :options="donutOptionsModerate" :series="donutSeriesModerate"></apexchart>
          </div>
        </div>
        <div class="col">
          <apexchart type="bar" height="350" :options="barOptions" :series="barSeries"></apexchart>
        </div>
        <div v-if="activeButton === 'Table'">
          <AAASUDSeverityTable :filteredData="filteredData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import AAASUDSeverityTable from './AAASUDSeverityTable.vue'

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

const activeButton = ref(null);

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

const extractedData = ref([]);

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
  xaxis: { categories: ['High Risk', 'Moderate Risk'] },
  colors: ['#2c6975', '#000000'],
  legend: { position: 'bottom' }
});

const donutSeriesTotal = ref([]);
const donutSeriesModerate = ref([]);
const barSeries = ref([]);

function extractMeasurementData(data) {
  return data.map(person => {
    const measurementAssist = person.measurement_assist?.fields;
    const gender = person.user?.fields?.gender || "unknown";
    if (measurementAssist) {
      return {
        gender: gender,
        alcoholic: measurementAssist.alcoholic_measurement || "no data",
        amphetamine: measurementAssist.amphetamine_measurement || "no data",
        cannabis: measurementAssist.cannabis_measurement || "no data",
        cocaine: measurementAssist.cocaine_measurement || "no data",
        hallucinogens: measurementAssist.hallucinogens_measurement || "no data",
        inhalants: measurementAssist.inhalants_measurement || "no data",
        opioids: measurementAssist.opioids_measurement || "no data",
        sedatives: measurementAssist.sedatives_measurement || "no data",
        tobacco: measurementAssist.tobacco_measurement || "no data",
        other: measurementAssist.other_measurement || "no data"
      };
    }
    return null;
  }).filter(Boolean);
}

function countRiskLevels(data) {
  const counts = {};
  substances.forEach(substance => {
    counts[substance.toLowerCase()] = {
      moderate_male: 0, moderate_female: 0,
      high_male: 0, high_female: 0
    };
  });

  data.forEach(personData => {
    substances.forEach(substance => {
      const substanceKey = substance.toLowerCase().replace('-type', '');
      const riskLevel = personData[substanceKey];
      if (riskLevel === 'moderate risk' || riskLevel === 'high risk') {
        const key = `${riskLevel === 'moderate risk' ? 'moderate' : 'high'}_${personData.gender.toLowerCase()}`;
        counts[substanceKey][key]++;
      }
    });
  });

  return counts;
}

function updateCharts() {
  const counts = countRiskLevels(extractedData.value);
  if (!activeButton.value || !counts[activeButton.value.toLowerCase()]) return;

  const data = counts[activeButton.value.toLowerCase()];

  donutSeriesTotal.value = [data.high_male, data.high_female];
  donutSeriesModerate.value = [data.moderate_male, data.moderate_female];

  barSeries.value = [
    { name: 'Male', data: [data.high_male, data.moderate_male] },
    { name: 'Female', data: [data.high_female, data.moderate_female] }
  ];
}

const setActiveButton = (buttonName) => {
  activeButton.value = buttonName;
  updateCharts();
};

// Computed property for dummy data (if still needed)
// const dummyData = computed(() => {
//   const counts = countRiskLevels(extractedData.value);
//   return substances.reduce((acc, substance) => {
//     const substanceKey = substance.toLowerCase().replace('-type', '');
//     acc[substance] = {
//       'High-risk total male': counts[substanceKey].high_male,
//       'High-risk total female': counts[substanceKey].high_female,
//       'Moderate-risk total male': counts[substanceKey].moderate_male,
//       'Moderate-risk total female': counts[substanceKey].moderate_female,
//     };
//     return acc;
//   }, {});
// });

// Watch for changes in filteredData
watch(() => props.filteredData, (newData) => {
  extractedData.value = extractMeasurementData(newData);
  updateCharts();
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