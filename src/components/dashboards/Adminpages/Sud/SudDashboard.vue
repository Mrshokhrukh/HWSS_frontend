<template>
  <div class="screening-data-container">
    <h1 class="text-center fw-bold mb-4" style="color: #2c6975;">Current Status in Bhutan</h1>
    <div class="card shadow-sm outer-card">
      <div class="card-body">
        <div class="card inner-card">
          <div class="card-body">
            <div v-if="isLoading" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="error" class="alert alert-danger" role="alert">
              {{ error }}
            </div>
            <div v-else class="chart-container">
              <canvas ref="chartCanvas"></canvas> 
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import axios from 'axios';
import endpoints from '@/api';

const isLoading = ref(true);
const error = ref(null);
const chartData = ref(null);
const chartCanvas = ref(null);
let chart = null;

const backgroundColors = [
  'rgba(44, 105, 117, 1)', 'rgba(114, 190, 203, 1)', 'rgba(104, 178, 160, 1)', 'rgba(180, 213, 191, 1)',
  'rgba(0, 0, 0, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(199, 199, 199, 1)',
  'rgba(83, 102, 255, 1)', 'rgba(170, 159, 64, 1)', 'rgba(235, 64, 52, 1)', 'rgba(64, 199, 86, 1)',
  'rgba(214, 133, 159, 1)', 'rgba(64, 66, 255, 1)', 'rgba(192, 192, 192, 1)', 'rgba(64, 64, 199, 1)'
];

function countFollowUpValues(data) {
  return data.reduce((counts, item) => {
    const value = item.service_and_treatment?.follow_up;
    if (value) {
      counts[value] = (counts[value] || 0) + 1;
    }
    return counts;
  }, {});
}

function createOrUpdateChart() {
  if (!chartData.value || !chartCanvas.value) return;

  nextTick(() => {
    const ctx = chartCanvas.value.getContext('2d');
    const config = {
      type: 'doughnut',
      data: chartData.value,
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    };

    if (chart) {
      chart.data = chartData.value;
      chart.update();
    } else {
      chart = new Chart(ctx, config);
    }
  });
}

async function fetchReportData() {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await axios.get(endpoints.getReport);
    console.log('API response:', response.data);

    if (response.data && response.data.reporting_model_data) {
      const followUpCounts = countFollowUpValues(response.data.reporting_model_data);
      const labels = Object.keys(followUpCounts);
      const data = Object.values(followUpCounts);
      
      chartData.value = {
        labels,
        datasets: [{
          data,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderWidth: 1,
        }]
      };
    } else {
      throw new Error('No data received from the API');
    }
  } catch (err) {
    console.error('Error fetching report data:', err);
    error.value = err.message || 'An error occurred while fetching report data';
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchReportData();
});

watchEffect(() => {
  if (chartData.value) {
    createOrUpdateChart();
  }
});
</script>

<style scoped>
.outer-card {
  background-color: #28565f;
  padding: 20px;
 
}

.inner-card {
  background-color: #ecf5f7;
  height: 400px;
}

.chart-container {
  height: 100%;
  width: 100%;
}

canvas {
  max-height: 100%;
  max-width: 100%;
}

@media (min-width: 768px) {
  .outer-card {
    padding-left: 60px;
    padding-right: 60px;
  }
}

@media (min-width: 992px) {
  .outer-card {
    padding-left: 120px;
    padding-right: 120px;
  }
}

@media (min-width: 1200px) {
  .outer-card {
    padding-left: 260px;
    padding-right: 260px;
  }
}
</style>