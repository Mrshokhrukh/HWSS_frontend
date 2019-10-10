<template>
  <div class="screening-visualization">
    <h3 class="visualization-title">Screening Data Visualization</h3>
    <div class="chart-container">
      <!-- Clustered Screening Donut Graph -->
      <div class="chart-card">
        <h4 class="chart-title">Clustered Screening</h4>
        <div class="chart-content">
          <Chart :type="chartType" :data="clusteredData" :options="donutOptions" />
          <div class="chart-stats">
            <p class="stat-item"><span class="stat-label">Male:</span> {{ maleCountClustered }}</p>
            <p class="stat-item"><span class="stat-label">Female:</span> {{ femaleCountClustered }}</p>
            <p class="stat-item"><span class="stat-label">Total:</span> {{ totalCountClustered }}</p>
          </div>
        </div>
      </div>

      <!-- Independent Donut Graph -->
      <div class="chart-card">
        <h4 class="chart-title">Independent Screening</h4>
        <div class="chart-content">
          <Chart :type="chartType" :data="independentData" :options="donutOptions" />
          <div class="chart-stats">
            <p class="stat-item"><span class="stat-label">Male:</span> {{ maleCountIndependent }}</p>
            <p class="stat-item"><span class="stat-label">Female:</span> {{ femaleCountIndependent }}</p>
            <p class="stat-item"><span class="stat-label">Total:</span> {{ totalCountIndependent }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Chart from 'primevue/chart';
import { useDashboardStore } from '@/stores/dashboardStore';

const dashboardStore = useDashboardStore();

const chartType = 'doughnut';

// Clustered screening data
const clusteredData = computed(() => ({
  labels: ['Male', 'Female'],
  datasets: [{
    data: [
      dashboardStore.filteredData.filter(item => item.measurement && item.measurement_assist && item.user?.fields?.gender === 'Male').length,
      dashboardStore.filteredData.filter(item => item.measurement && item.measurement_assist && item.user?.fields?.gender === 'Female').length
    ],
    backgroundColor: ['#2B656F', '#64ac99']
  }]
}));

const maleCountClustered = computed(() => clusteredData.value.datasets[0].data[0]);
const femaleCountClustered = computed(() => clusteredData.value.datasets[0].data[1]);
const totalCountClustered = computed(() => maleCountClustered.value + femaleCountClustered.value);

// Independent screening data
const independentData = computed(() => ({
  labels: ['Male', 'Female'],
  datasets: [{
    data: [
      dashboardStore.filteredData.filter(item => ['Event Base Clients', 'Case Base Clients'].includes(item.agency_name) && item.user?.fields?.gender === 'Male').length,
      dashboardStore.filteredData.filter(item => ['Event Base Clients', 'Case Base Clients'].includes(item.agency_name) && item.user?.fields?.gender === 'Female').length
    ],
    backgroundColor: ['#2B656F', '#64ac99']
  }]
}));

const maleCountIndependent = computed(() => independentData.value.datasets[0].data[0]);
const femaleCountIndependent = computed(() => independentData.value.datasets[0].data[1]);
const totalCountIndependent = computed(() => maleCountIndependent.value + femaleCountIndependent.value);

// Chart options
const donutOptions = ref({
  cutout: '60%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#2B656F',
        font: {
          weight: 'bold'
        }
      }
    }
  }
});

onMounted(() => {
  if (dashboardStore.reportData.length === 0) {
    dashboardStore.fetchReportData();
  }
});
</script>

<style scoped>
.screening-visualization {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.visualization-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2B656F;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.chart-container {
  display: flex;
  gap: 2rem;
  justify-content: space-between;
}

.chart-card {
  flex: 1;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.chart-content {
  padding: 1rem;
}

.chart-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 0.5rem;
}

.stat-item {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2B656F;
}

.stat-label {
  font-weight: normal;
  color: #64ac99;
}

@media (max-width: 768px) {
  .chart-container {
    flex-direction: column;
  }
}
</style>