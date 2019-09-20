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
            <p class="fs-5 fw-bold mx-auto">Male: {{ maleCountClustered }}</p>
            <p class="fs-5 fw-bold mx-auto">Female: {{ femaleCountClustered }}</p>
            <p class="fs-5 fw-bold mx-auto">Total: {{ totalCountClustered }}</p>
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
            <p class="fs-5 fw-bold mx-auto">Male: {{ maleCountIndependent }}</p>
            <p class="fs-5 fw-bold mx-auto">Female: {{ femaleCountIndependent }}</p>
            <p class="fs-5 fw-bold mx-auto">Total: {{ totalCountIndependent }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Chart from 'primevue/chart';
import { useDashboardStore } from '@/stores/dashboardStore'; // Adjust the import path as needed

const dashboardStore = useDashboardStore();

const chartType = 'doughnut';

// Computed properties for clustered screening
const clusteredData = computed(() => {
  const filteredData = dashboardStore.filteredData.filter(item =>
    item.measurement && item.measurement_assist
  );

  const maleCount = filteredData.filter(item => item.user?.fields?.gender === 'Male').length;
  const femaleCount = filteredData.filter(item => item.user?.fields?.gender === 'Female').length;

  return {
    labels: ['Male', 'Female'],
    datasets: [{
      data: [maleCount, femaleCount],
      backgroundColor: ['#2c6975', '#64ac99']
    }]
  };
});

const maleCountClustered = computed(() => clusteredData.value.datasets[0].data[0]);
const femaleCountClustered = computed(() => clusteredData.value.datasets[0].data[1]);
const totalCountClustered = computed(() => maleCountClustered.value + femaleCountClustered.value);

// Computed properties for independent screening
const independentData = computed(() => {
  const filteredData = dashboardStore.filteredData.filter(item =>
    item.agency_name === 'Event Base Clients' || item.agency_name === 'Case Base Clients'
  );

  const maleCount = filteredData.filter(item => item.user?.fields?.gender === 'Male').length;
  const femaleCount = filteredData.filter(item => item.user?.fields?.gender === 'Female').length;

  return {
    labels: ['Male', 'Female'],
    datasets: [{
      data: [maleCount, femaleCount],
      backgroundColor: ['#2c6975', '#64ac99']
    }]
  };
});

const maleCountIndependent = computed(() => independentData.value.datasets[0].data[0]);
const femaleCountIndependent = computed(() => independentData.value.datasets[0].data[1]);
const totalCountIndependent = computed(() => maleCountIndependent.value + femaleCountIndependent.value);

// Chart options
const donutOptions = ref({
  plugins: {
    legend: {
      labels: {
        cutout: '60%',
        color: '#242424'
      }
    }
  }
});

// Fetch data when component is mounted
onMounted(() => {
  if (dashboardStore.reportData.length === 0) {
    dashboardStore.fetchReportData();
  }
});
</script>

<style scoped>
.graph2 {
  margin-left: 300px;
}
</style>