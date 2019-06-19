<template>
  <div class="container">
    <div class="row d-flex justify-content-center">
      <!-- Clustered Screening Donut Graph -->
      <div class="col-md-4 mx-auto">
        <h4 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975;">Clustered Screening</h4>
        <div class="card">
          <div class="card-body">
            <Chart :type="chartType" :data="clusteredChartData" :options="donutOptions" legend="bottom" />
          </div>
          <div class="d-flex align-items-center">
            <p class="fs-5 fw-bold mx-auto">Male: {{ clusterMaleCount }}</p>
            <p class="fs-5 fw-bold mx-auto">Female: {{ clusterFemaleCount }}</p>
            <p class="fs-5 fw-bold mx-auto">Total: {{ clusterTotalCount }}</p>
          </div>
        </div>
      </div>

      <!-- Independent Donut Graph -->
      <div class="col-md-4 mx-auto">
        <h4 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975;">Independent Screening</h4>
        <div class="card">
          <div class="card-body">
            <Chart :type="chartType" :data="independentChartData" :options="donutOptions" />
          </div>
          <div class="d-flex align-items-center">
            <p class="fs-5 fw-bold mx-auto">Male: {{ independentMaleCount }}</p>
            <p class="fs-5 fw-bold mx-auto">Female: {{ independentFemaleCount }}</p>
            <p class="fs-5 fw-bold mx-auto">Total: {{ independentTotalCount }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import Chart from 'primevue/chart';

const reportData = JSON.parse(sessionStorage.getItem('reportData'));

const clusteredData = ref([]);
const independentData = ref([]);
const donutOptions = ref({});
const chartType = 'doughnut';

const clusterMaleCount = ref(0);
const clusterFemaleCount = ref(0);
const clusterTotalCount = ref(0);

const independentMaleCount = ref(0);
const independentFemaleCount = ref(0);
const independentTotalCount = ref(0);

const clusteredChartData = ref({});
const independentChartData = ref({});

onMounted(() => {
  processReportData();
  setChartOptions();
});

const processReportData = () => {
  const clustered = reportData.filter(entry => Array.isArray(entry.case_screenings) && entry.case_screenings.length === 0);
  const independent = reportData.filter(entry => Array.isArray(entry.case_screenings) && entry.case_screenings.length > 0);

  clusterMaleCount.value = calculateGenderCount(clustered, 'Male');
  clusterFemaleCount.value = calculateGenderCount(clustered, 'Female');
  clusterTotalCount.value = clusterMaleCount.value + clusterFemaleCount.value;

  independentMaleCount.value = calculateGenderCount(independent, 'Male');
  independentFemaleCount.value = calculateGenderCount(independent, 'Female');
  independentTotalCount.value = independentMaleCount.value + independentFemaleCount.value;

  clusteredChartData.value = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [clusterMaleCount.value, clusterFemaleCount.value],
        backgroundColor: ['#2c6975', '#64ac99']
      }
    ]
  };

  independentChartData.value = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [independentMaleCount.value, independentFemaleCount.value],
        backgroundColor: ['#2c6975', '#64ac99']
      }
    ]
  };
};

const setChartOptions = () => {
  donutOptions.value = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#242424'
        }
      }
    },
    cutout: '60%'
  };
};

const calculateGenderCount = (data, gender) => {
  return data.reduce((count, entry) => {
    const user = entry.user && JSON.parse(entry.user)[0];
    if (user?.fields?.gender === gender) {
      return count + 1;
    }
    return count;
  }, 0);
};
</script>


<style scoped>
.container {
  padding-top: 20px;
}

.card {
  margin-top: 20px;
}

.fs-5 {
  margin: 0 10px;
}
</style>
