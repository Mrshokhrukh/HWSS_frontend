<template>
  <div class="container">
    <div class="row d-flex justify-content-center">
      <!-- Clustered Screening Donut Graph -->
      <div class="col-md-4 mx-auto">
        <h4 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975">Clustered Screening</h4>
        <div class="card">
          <div class="card-body">
            <Chart :type="chartType" :data="clusteredData" :options="donutOptions" legend="bottom"
              loading="Loading..." />
          </div>
          <div class="d-flex align-items-center">
            <p class="fs-5 fw-bold mx-auto">Male: {{ male_Count_clustered }}</p>
            <p class="fs-5 fw-bold mx-auto">Female: {{ femaleCount_clustered }}</p>
            <p class="fs-5 fw-bold mx-auto">Total: {{ totalCount_clustered }}</p>
          </div>
        </div>
      </div>

      <!-- Independent Donut Graph -->
      <div class="col-md-4 mx-auto">
        <h4 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975">Independent Screening</h4>
        <div class="card">
          <div class="card-body">
            <Chart :type="chartType" :data="independentData" :options="donutOptions" />
          </div>
          <div class="d-flex align-items-center">
            <p class="fs-5 fw-bold mx-auto">Male: {{ data1 }}</p>
            <p class="fs-5 fw-bold mx-auto">Female: {{ data2 }}</p>
            <p class="fs-5 fw-bold mx-auto">Total: {{ total }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Chart from 'primevue/chart'

const male_Count_clustered = ref(0)
const femaleCount_clustered = ref(0)
const totalCount_clustered = ref(0)
const data1 = ref(0)
const data2 = ref(0)
const total = ref(0)

const clusteredData = ref([])
const independentData = ref([])
const donutOptions = ref({})
const chartType = 'doughnut'

// logic
const reportData = ref(JSON.parse(sessionStorage.getItem('reportData')) || [])
const clusteredDatas = ref([])
const independentDatas = ref([])

// Filter data when component is mounted
onMounted(() => {
  // filtering clustered data
  clusteredDatas.value = reportData.value.filter(
    (item) =>
      item.measurement?.fields?.user !== undefined ||
      (null && item.measurement_assist?.fields?.user !== undefined) ||
      null
  )

  // filtering independent data
  independentDatas.value = reportData.value.filter(
    (item) =>
      item.event_screenings?.fields?.user !== undefined ||
      (null && item.case_screenings?.fields?.user !== undefined) ||
      null
  )

  // Log filtered data to the console
  console.log('Filtered clusteredData Data:', clusteredDatas.value)
  console.log('Filtered independentData Data:', independentDatas.value)

  countGender()
})

const countGender = () => {
  let maleCount = 0
  let femaleCount = 0

  clusteredDatas.value.forEach((item) => {
    const gender = item.user?.fields?.gender
    if (gender === 'Male') {
      maleCount++
    } else if (gender === 'Female') {
      femaleCount++
    }
  })

  male_Count_clustered.value = maleCount
  femaleCount_clustered.value = femaleCount
  totalCount_clustered.value = maleCount + femaleCount

  console.log('Male Count:', maleCount)
  console.log('Female Count:', femaleCount)
}

const setChartData = () => {
  clusteredData.value = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [male_Count_clustered.value, femaleCount_clustered.value],
        backgroundColor: ['#2c6975', '#64ac99']
      }
    ]
  }

  independentData.value = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [data1.value, data2.value],
        backgroundColor: ['#2c6975', '#64ac99']
      }
    ]
  }
}

const setChartOptions = () => {
  // Set common options for both charts here
  donutOptions.value = {
    plugins: {
      legend: {
        labels: {
          cutout: '60%',
          color: '#242424'
        }
      }
    }
  }
}

onMounted(() => {
  setChartData()
  setChartOptions()
})
</script>

<style scoped>
.graph2 {
  margin-left: 300px;
}
</style>
