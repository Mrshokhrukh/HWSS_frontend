<template>
  <div class="row">
    <div class="col-md-3 text-center">
      <div class="card option">
        <div class="card-body">
          <p class="card-text">Data Set</p>
          <div class="form-check text-start">
            <input class="form-check-input" type="checkbox" value="all" id="checkAll" @change="handleCheckboxChange('all')">
            <label class="form-check-label" for="checkAll">
              ALL
            </label>
          </div>
          <div class="form-check text-start">
            <input class="form-check-input" type="checkbox" value="ongoing" id="checkOngoing" @change="handleCheckboxChange('ongoing')">
            <label class="form-check-label" for="checkOngoing">
              Case Ongoing
            </label>
          </div>
          <div class="form-check text-start">
            <input class="form-check-input" type="checkbox" value="closed" id="checkClosed" @change="handleCheckboxChange('closed')">
            <label class="form-check-label" for="checkClosed">
              Case Closed
            </label>
          </div>
          <div class="form-check text-start">
            <input class="form-check-input" type="checkbox" value="discontinued" id="checkDiscontinued" @change="handleCheckboxChange('discontinued')">
            <label class="form-check-label" for="checkDiscontinued">
              Case Discontinued
            </label>
          </div>

          <button type="button" class="btn btn-primary mt-3" @click="generateChart">Generate</button>
        </div>
      </div>
    </div>
    <div class="col-md-9 text-center">
      <div class="card option">
        <div class="card-body">
          <canvas ref="chartCanvas"></canvas>
          <div v-if="showTable" class="showtable">
            <MHCaseTable />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, inject } from 'vue'
import Chart from 'chart.js/auto'
import MHCaseTable from './MHCaseTableReport.vue'

const chartCanvas = ref(null)
const reportData = inject('filteredData')

const selectedOptions = ref([])
const showTable = ref(false)
let chart = null

const counts = computed(() => {
  const result = {
    ongoing: {},
    closed: {},
    discontinued: {}
  }

  // Fill result object with counts
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

  // Uncheck other checkboxes
  const checkboxes = ['all', 'ongoing', 'closed', 'discontinued']
  checkboxes.forEach((checkbox) => {
    if (checkbox !== value) {
      const checkboxElement = document.getElementById(`check${checkbox.charAt(0).toUpperCase() + checkbox.slice(1)}`)
      checkboxElement.checked = false
    }
  })
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
