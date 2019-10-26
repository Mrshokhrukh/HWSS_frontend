<template>
  <div v-if="!serviceAndTreatmentData?.length" class="screening-visualization">
    <p>Loading...</p>
  </div>
  <div v-else class="screening-visualization">
    <h3 class="visualization-title">Screening Data Visualization</h3>
    <div class="chart-container">
      <!-- Clustered Screening Donut Graph -->
      <div class="chart-card">
        <h4 class="chart-title">Clustered Screening</h4>
        <div class="chart-content">
          <Chart type="doughnut" :data="clusteredData" :options="chartOptions" />
          <div class="chart-stats">
            <p class="stat-item"><span class="stat-label">Male:</span> {{ maleCountClustered }}</p>
            <p class="stat-item"><span class="stat-label">Female:</span> {{ femaleCountClustered }}</p>
            <p class="stat-item"><span class="stat-label">Other:</span> {{ otherCountClustered }}</p>
            <p class="stat-item"><span class="stat-label">Total:</span> {{ totalCountClustered }}</p>
          </div>
        </div>
      </div>

      <!-- Independent Donut Graph -->
      <div class="chart-card">
        <h4 class="chart-title">Independent Screening</h4>
        <div class="chart-content">
          <Chart type="doughnut" :data="independentData" :options="chartOptions" />
          <div class="chart-stats">
            <p class="stat-item"><span class="stat-label">Male:</span> {{ maleCountIndependent }}</p>
            <p class="stat-item"><span class="stat-label">Female:</span> {{ femaleCountIndependent }}</p>
            <p class="stat-item"><span class="stat-label">Other:</span> {{ otherCountIndependent }}</p>
            <p class="stat-item"><span class="stat-label">Total:</span> {{ totalCountIndependent }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { inject } from 'vue';
import Chart from 'primevue/chart';

// Inject the data
const serviceAndTreatmentData = inject('serviceAndTreatmentData');
console.log("serviceAndTreatmentData cecd", serviceAndTreatmentData)
// Helper functions
const hasValidScreeningData = (item) => {
  return typeof item?.screening_data === 'object' &&
    item.screening_data !== null &&
    item.screening_data !== "Data not available";
};

const hasScreeningDataWithScores = (item) => {
  return hasValidScreeningData(item) &&
    (
      item.screening_data.phq9_score !== undefined ||
      item.screening_data.gad7_score !== undefined
    );
};

const isRegularScreeningData = (item) => {
  return hasValidScreeningData(item) && item.screening_data.id !== undefined;
};

const isIndependentScreening = (item) => {
  if (!isRegularScreeningData(item)) return false;
  return item.screening_data.case !== undefined ||
    item.screening_data.event !== undefined;
};

const isClusteredScreening = (item) => {
  return hasScreeningDataWithScores(item) ||
    (isRegularScreeningData(item) &&
      !item.screening_data.case &&
      !item.screening_data.event);
};

const getGender = (item) => {
  if (item?.user?.gender) {
    return item.user.gender.toLowerCase();
  } else if (hasValidScreeningData(item) && item.screening_data.gender) {
    const gender = item.screening_data.gender.toLowerCase();
    if (gender === 'm') return 'male';
    if (gender === 'f') return 'female';
    return 'other';
  }
  return 'other';
};

// Chart data computation
const computeChartData = (screeningFilter) => {
  if (!serviceAndTreatmentData?.value) return {
    labels: ['Male', 'Female', 'Other'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#2B656F', '#64ac99', '#90CAF9'] }]
  };

  const counts = serviceAndTreatmentData.value.reduce((acc, item) => {
    if (screeningFilter(item)) {
      const gender = getGender(item);
      acc[gender] = (acc[gender] || 0) + 1;
    }
    return acc;
  }, { male: 0, female: 0, other: 0 });

  return {
    labels: ['Male', 'Female', 'Other'],
    datasets: [{
      data: [counts.male, counts.female, counts.other],
      backgroundColor: ['#2B656F', '#64ac99', '#90CAF9']
    }]
  };
};

// Clustered screening data
const clusteredData = computed(() => computeChartData(isClusteredScreening));
const maleCountClustered = computed(() => clusteredData.value.datasets[0].data[0] || 0);
const femaleCountClustered = computed(() => clusteredData.value.datasets[0].data[1] || 0);
const otherCountClustered = computed(() => clusteredData.value.datasets[0].data[2] || 0);
const totalCountClustered = computed(() =>
  maleCountClustered.value + femaleCountClustered.value + otherCountClustered.value
);

// Independent screening data
const independentData = computed(() => computeChartData(isIndependentScreening));
const maleCountIndependent = computed(() => independentData.value.datasets[0].data[0] || 0);
const femaleCountIndependent = computed(() => independentData.value.datasets[0].data[1] || 0);
const otherCountIndependent = computed(() => independentData.value.datasets[0].data[2] || 0);
const totalCountIndependent = computed(() =>
  maleCountIndependent.value + femaleCountIndependent.value + otherCountIndependent.value
);

// Chart options
const chartOptions = ref({
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