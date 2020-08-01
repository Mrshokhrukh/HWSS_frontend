<template>
  <div class="screening-data-container">
    <h1 class="text-center fw-bold mb-4" style="color: #2c6975;">Current Status in Bhutan</h1>
    <div class="card shadow-sm outer-card">
      <div class="card-body">
        <div class="card inner-card">
          <div class="card-body">
            <div v-if="!treatmentData" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
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
import { ref, onMounted, inject, watchEffect, nextTick } from 'vue';
import Chart from 'chart.js/auto';

const treatmentData = inject('serviceAndTreatmentData');
const chartCanvas = ref(null);
let chart = null;

const backgroundColors = [
  'rgba(44, 105, 117, 1)', 'rgba(114, 190, 203, 1)',
  'rgba(104, 178, 160, 1)', 'rgba(180, 213, 191, 1)',
  'rgba(0, 0, 0, 1)', 'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'
];

function countFollowUpValues(data) {
  return data.reduce((counts, item) => {
    const value = item.follow_up;
    if (value && value.trim() !== '') {
      counts[value] = (counts[value] || 0) + 1;
    }
    return counts;
  }, {});
}

function createOrUpdateChart() {
  if (!treatmentData.value || !chartCanvas.value) return;

  nextTick(() => {
    const ctx = chartCanvas.value.getContext('2d');

    const followUpCounts = countFollowUpValues(treatmentData.value);
    const labels = Object.keys(followUpCounts);
    const data = Object.values(followUpCounts);

    const chartConfig = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    if (chart) {
      chart.destroy();
    }
    chart = new Chart(ctx, chartConfig);
  });
}

watchEffect(() => {
  if (treatmentData.value) {
    createOrUpdateChart();
  }
});

onMounted(() => {
  if (treatmentData.value) {
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
  position: relative;
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