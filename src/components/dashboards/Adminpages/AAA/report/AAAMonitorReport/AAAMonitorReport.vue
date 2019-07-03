<template>
  <div class="row g-0">
    <div class="col-md-2">
      <div class="card h-100">
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
          <button @click="generateChart" class="btn btn-primary mt-3">Generate</button>
        </div>
      </div>
    </div>
    <div class="col-md-10">
      <div class="card h-100">
        <div class="card-body">
          <div v-if="selectedOptions.length === 0" class="text-center">
            <p class="text-primary mb-3 d-flex justify-content-center align-items-center">
              Note: Please select the parameters
            </p>
            <p class="text-secondary d-flex justify-content-center align-items-center">
              Note: The report will be shown only when the generate button is pressed.
            </p>
          </div>
          <div v-else>
            <div v-if="showTable" class="showtable">
              <AAATableLayer />
            </div>
            <canvas v-else ref="chartCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, inject } from 'vue'
import Chart from 'chart.js/auto'
import AAATableLayer from './AAATableLayer.vue'

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

  dataOptions.forEach((option) => {
    result[option.value] = {}
  })

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

  if (selectedOptions.value.length === 0) {
    return // Don't generate chart if no options are selected
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
