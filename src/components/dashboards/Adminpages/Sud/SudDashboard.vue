<template>
  <h1 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975;">Current Status in Bhutan</h1>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import Chart from 'chart.js/auto';
import { useDashboardStore } from '@/stores/dashboardStore'; // Adjust the import path as needed

const chartCanvas = ref(null);
const dashboardStore = useDashboardStore();

// Use a computed property to get the filtered data from the store
const filteredReportData = computed(() => dashboardStore.filteredData);

// Function to extract follow_up values dynamically from service_and_treatment
function extractFollowUpValues(data) {
  const followUpValues = new Set();
  data.forEach(item => {
    if (item.service_and_treatment?.follow_up) {
      followUpValues.add(item.service_and_treatment.follow_up);
    }
  });
  return Array.from(followUpValues);
}

// Function to count occurrences of each follow_up value
function countFollowUpValues(data) {
  const counts = {};
  data.forEach(item => {
    if (item.service_and_treatment?.follow_up) {
      const value = item.service_and_treatment.follow_up;
      counts[value] = (counts[value] || 0) + 1;
    }
  });
  return counts;
}

// Define a larger set of colors
const backgroundColors = [
  'rgba(44, 105, 117, 1)',
  'rgba(114, 190, 203, 1)',
  'rgba(104, 178, 160, 1)',
  'rgba(180, 213, 191, 1)',
  'rgba(0, 0, 0, 1)',
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
  'rgba(199, 199, 199, 1)',
  'rgba(83, 102, 255, 1)',
  'rgba(170, 159, 64, 1)',
  'rgba(235, 64, 52, 1)',
  'rgba(64, 199, 86, 1)',
  'rgba(214, 133, 159, 1)',
  'rgba(64, 66, 255, 1)',
  'rgba(192, 192, 192, 1)',
  'rgba(64, 64, 199, 1)'
];

let chart = null;

onMounted(async () => {
  // Ensure the data is fetched
  if (dashboardStore.reportData.length === 0) {
    await dashboardStore.fetchReportData();
  }

  createOrUpdateChart();
});

// Watch for changes in filteredReportData
watch(filteredReportData, () => {
  createOrUpdateChart();
}, { deep: true });

function createOrUpdateChart() {
  const followUpCounts = countFollowUpValues(filteredReportData.value);
  const labels = Object.keys(followUpCounts);
  const data = Object.values(followUpCounts);

  // Ensure there are enough colors
  const dynamicColors = backgroundColors.slice(0, labels.length);

  const chartData = {
    labels,
    datasets: [{
      label: 'Follow Up Data',
      data,
      backgroundColor: dynamicColors,
      borderWidth: 1,
    }]
  };

  const ctx = chartCanvas.value.getContext('2d');

  if (chart) {
    chart.data = chartData;
    chart.update();
  } else {
    chart = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
}
</script>

<style scoped>
/* Add any custom styles for the chart canvas here */
</style>