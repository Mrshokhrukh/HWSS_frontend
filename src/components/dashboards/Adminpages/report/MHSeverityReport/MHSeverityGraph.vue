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
            <MHDAASeverityTable :filteredData='filteredData' />
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
import MHDAASeverityTable from './MHDAASeverityTable.vue'

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

// Update filterData function to use props.filteredData
const filterData = (type, level) => props.filteredData.filter(item => item.measurement?.fields[`${type}_measurement`] === level).length
// Data counts
const gadCounts = computed(() => ({
  severe: filterData('gad', 'severe'),
  minimal: filterData('gad', 'minimal'),
  moderate: filterData('gad', 'moderate'),
  mild: filterData('gad', 'mild'),
}))

const phqCounts = computed(() => ({
  severe: filterData('phq', 'severe'),
  minimal: filterData('phq', 'minimal'),
  moderate: filterData('phq', 'moderate'),
  moderately_severe: filterData('phq', 'moderately severe'),
  mild: filterData('phq', 'mild'),
}))

const aceCounts = computed(() => ({
  high_risk: filterData('ace', 'high risk'),
  intermediate_risk: filterData('ace', 'intermediate risk'),
  low_risk: filterData('ace', 'low risk'),
}))

const suicidalCounts = computed(() => ({
  nearlyeveryday: filterData('suicidal', 'nearly everyday'),
  more_than_half_the_days: filterData('suicidal', 'more than half the days'),
  several_days: filterData('suicidal', 'several days'),
}))

// Set active button and update chart
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
    data = [phqCounts.value.severe, phqCounts.value.minimal, phqCounts.value.moderate, phqCounts.value.moderately_severe, phqCounts.value.mild]
  } else if (buttonName === 'Anxiety') {
    categories = ['Severe', 'Minimal', 'Moderate', 'Mild']
    data = [gadCounts.value.severe, gadCounts.value.minimal, gadCounts.value.moderate, gadCounts.value.mild]
  } else if (buttonName === 'ACE') {
    categories = ['High Risk', 'Intermediate Risk', 'Low Risk']
    data = [aceCounts.value.high_risk, aceCounts.value.intermediate_risk, aceCounts.value.low_risk]
  } else if (buttonName === 'Suicidal Behaviours') {
    categories = ['Nearly Everyday', 'More Than Half The Days', 'Several Days']
    data = [suicidalCounts.value.nearlyeveryday, suicidalCounts.value.more_than_half_the_days, suicidalCounts.value.several_days]
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