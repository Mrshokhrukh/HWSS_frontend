<template>
  <div class="row">
    <div class="col-md-2 text-center">
      <div class="card option">
        <div class="card-body">
          <p class="card-text">Data Set</p>
          <div v-for="(option, index) in dataOptions" :key="index" class="form-check text-start">
            <input
              class="form-check-input"
              type="checkbox"
              :value="option.value"
              :id="'check' + index"
              v-model="selectedOptions"
              @change="handleCheckboxChange(option.value)"
            />
            <label class="form-check-label" :for="'check' + index">
              {{ option.label }}
            </label>
          </div>
          <button @click="generateReport" class="btn btn-primary mt-auto">Generate</button>
        </div>
      </div>
    </div>
    <div class="col-md-10 text-center">
      <div class="card option">
        <div class="card">
          <div>
            <canvas ref="chartCanvas"></canvas>
          </div>
          <div v-if="showTable" class="showtable">
            <MHMonitorTable />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, inject } from 'vue'
import Chart from 'chart.js/auto'
import MHMonitorTable from './MHMonitorTable.vue'

const chartCanvas = ref(null)
const reportData = inject('filteredData')

const dataOptions = [
  { label: 'All', value: 'all' },
  { label: 'Rescreening Count', value: 'rescreened' },
  { label: 'Counseling', value: 'counseling' },
  { label: 'Assessment', value: 'assessment_status' },
  { label: 'Referral', value: 'referred' },
  { label: 'Follow-up', value: 'follow_up' }
]

const selectedOptions = ref([])
const showTable = ref(false)

let chart = null

const counts = computed(() => {
  const result = {}

  // Initialize result object with empty arrays for each option
  dataOptions.forEach((option) => {
    result[option.value] = {}
  })

  // Fill result object with counts
  reportData.value.forEach((item) => {
    dataOptions.forEach((option) => {
      const key = option.value
      const value = item.service_and_treatment?.[key] || item.rescreened?.toString() || 'NA'
      result[key][value] = (result[key][value] || 0) + 1
    })
  })

  return result
})

const handleCheckboxChange = (value) => {
  if (selectedOptions.value.length > 1) {
    selectedOptions.value = [value]
  }
}

const generateChart = () => {
  if (chart) {
    chart.destroy()
  }

  if (selectedOptions.value.includes('all')) {
    showTable.value = true
    return
  } else {
    showTable.value = false
  }

  const datasets = selectedOptions.value.map((option) => {
    const data = counts.value[option]
    return {
      label: option,
      data: Object.values(data),
      backgroundColor: getRandomColor()
    }
  })

  const labels = selectedOptions.value.flatMap((option) => Object.keys(counts.value[option]))

  const ctx = chartCanvas.value.getContext('2d')
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          stepSize: 1
        }
      }
    }
  })
}

function getRandomColor() {
  const r = Math.floor(Math.random() * 255)
  const g = Math.floor(Math.random() * 255)
  const b = Math.floor(Math.random() * 255)
  return `rgba(${r}, ${g}, ${b}, 0.7)`
}

onMounted(() => {
  if (chartCanvas.value) {
    generateChart()
  }
})
</script>

<style scoped>
/* Add scoped styles as needed */
</style>
