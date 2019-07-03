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
              <AAACasereportTable />
            </div>
            <canvas v-else ref="chartCanvas" class="d-flex justify-content-center align-items-center"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, inject } from 'vue'
import Chart from 'chart.js/auto'
import AAACasereportTable from './AAACasereportTable.vue'

const chartCanvas = ref(null)
const reportData = inject('filteredData')

const dataOptions = [
  { label: 'ALL', value: 'all' },
  { label: 'Case Ongoing', value: 'ongoing' },
  { label: 'Case Closed', value: 'closed' },
  { label: 'Case Discontinued', value: 'discontinued' }
]

const selectedOptions = ref([])
const showTable = ref(false)
let chart = null

const counts = computed(() => {
  const result = {
    ongoing: {},
    closed: {},
    discontinued: {}
  }

  reportData.value.forEach((item) => {
    if (item.service_and_treatment?.case_status === 'On Going') {
      result.ongoing['On Going'] = (result.ongoing['On Going'] || 0) + 1
    } else if (item.service_and_treatment?.case_status === 'Case Closed') {
      result.closed['Case Closed'] = (result.closed['Case Closed'] || 0) + 1
    } else if (item.service_and_treatment?.case_status === 'Case Discontinued') {
      result.discontinued['Case Discontinued'] = (result.discontinued['Case Discontinued'] || 0) + 1
    }
  })

  return result
})

const handleCheckboxChange = (value) => {
  if (value === 'all') {
    selectedOptions.value = ['all']
  } else {
    selectedOptions.value = [value]
  }

  const checkboxes = ['all', 'ongoing', 'closed', 'discontinued']
  checkboxes.forEach((checkbox, index) => {
    if (checkbox !== value) {
      const checkboxElement = document.getElementById(`check${index}`)
      checkboxElement.checked = false
    }
  })
}

const generateChart = () => {
  if (chart) {
    chart.destroy()
  }

  if (selectedOptions.value.length === 0) {
    showTable.value = false
    return
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
.card {
  margin-top: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

li {
  margin-bottom: 4px;
}
</style>
