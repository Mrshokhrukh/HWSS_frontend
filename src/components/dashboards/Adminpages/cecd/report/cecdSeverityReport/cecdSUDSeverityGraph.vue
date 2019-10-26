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

        <div v-if="hasData && activeButton !== 'Table'" class="col text-center">
          <h4 class="text-capitalize">High Risk Count by Gender</h4>
          <div class="w-100">
            <apexchart type="donut" :options="donutOptionsTotal" :series="donutSeriesTotal" />
          </div>
        </div>

        <div v-if="hasData && activeButton !== 'Table'" class="col text-center">
          <h4 class="text-capitalize">Low Risk Count by Gender</h4>
          <div class="w-100">
            <apexchart type="donut" :options="donutOptionsModerate" :series="donutSeriesModerate" />
          </div>
        </div>

        <div v-if="hasData && activeButton !== 'Table'" class="col">
          <apexchart type="bar" height="350" :options="barOptions" :series="barSeries" />
        </div>

        <div v-if="!hasData" class="col-12 text-center">
          <p>No data available for the selected substance</p>
        </div>

        <div v-if="activeButton === 'Table'" class="col-12">
          <cecdSUDSeverityTable :filteredData="filteredData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import cecdSUDSeverityTable from './cecdSUDSeverityTable.vue';

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

const activeButton = ref('Tobacco');
const hasData = ref(false);

const substanceGroups = [
  ['Tobacco', 'Alcohol'],
  ['Cannabis', 'Cocaine'],
  ['Amphetamine-type', 'Inhalant'],
  ['Sedative', 'Hallucinate'],
  ['Opioids', 'Others', 'Table']
];

const flagMapping = {
  'red': 'high risk',
  'blue': 'low risk',
  'green': 'moderate risk'
};

const substanceFieldMapping = {
  'Tobacco': 'tobacco',
  'Alcohol': 'alcoholic',
  'Cannabis': 'cannabis',
  'Cocaine': 'cocaine',
  'Amphetamine-type': 'amphetamine',
  'Inhalant': 'inhalants',
  'Sedative': 'sedatives',
  'Hallucinate': 'hallucinogens',
  'Opioids': 'opioids',
  'Others': 'other'
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
  xaxis: {
    categories: ['High Risk', 'Low Risk', 'Moderate Risk'],
  },
  colors: ['#2c6975', '#000000'],
  legend: { position: 'bottom' }
});

const donutSeriesTotal = ref([0, 0]);
const donutSeriesModerate = ref([0, 0]);
const barSeries = ref([]);

function countRiskLevels() {
  const counts = {
    high_risk: { male: 0, female: 0 },
    low_risk: { male: 0, female: 0 },
    moderate_risk: { male: 0, female: 0 }
  };

  props.filteredData.forEach(record => {
    if (!record.screening_data?.assist_data) return;

    const gender = record.user?.gender?.toLowerCase() ||
      record.screening_data?.gender?.toLowerCase() === 'm' ? 'male' : 'female';

    const substanceField = substanceFieldMapping[activeButton.value];
    if (!substanceField) return;

    const flag = record.screening_data.assist_data[`${substanceField}_flag`];
    const measurement = record.screening_data.assist_data[`${substanceField}_measurement`];

    if (flag === 'red' || measurement === 'high risk') {
      counts.high_risk[gender]++;
    } else if (flag === 'blue' || measurement === 'low risk') {
      counts.low_risk[gender]++;
    } else if (flag === 'green' || measurement === 'moderate risk') {
      counts.moderate_risk[gender]++;
    }
  });

  return counts;
}

function updateCharts() {
  if (!activeButton.value || activeButton.value === 'Table') {
    hasData.value = false;
    return;
  }

  const counts = countRiskLevels();

  // Check if we have any data
  const totalCount = Object.values(counts).reduce((sum, genderCounts) =>
    sum + genderCounts.male + genderCounts.female, 0);

  hasData.value = totalCount > 0;

  if (!hasData.value) return;

  // Update charts
  donutSeriesTotal.value = [
    counts.high_risk.male,
    counts.high_risk.female
  ];

  donutSeriesModerate.value = [
    counts.low_risk.male,
    counts.low_risk.female
  ];

  barSeries.value = [
    {
      name: 'Male',
      data: [
        counts.high_risk.male,
        counts.low_risk.male,
        counts.moderate_risk.male
      ]
    },
    {
      name: 'Female',
      data: [
        counts.high_risk.female,
        counts.low_risk.female,
        counts.moderate_risk.female
      ]
    }
  ];
}

const setActiveButton = (buttonName) => {
  activeButton.value = buttonName;
  updateCharts();
};

// Watch for changes in filteredData
watch(() => props.filteredData, () => {
  updateCharts();
}, { immediate: true, deep: true });

// Watch for changes in activeButton
watch(activeButton, () => {
  updateCharts();
});

onMounted(() => {
  updateCharts();
});
</script>

<style scoped>
.btn {
  height: 50px;
  width: 150px;
}

.btn-primary {
  background-color: #2c6975 !important;
}
</style>