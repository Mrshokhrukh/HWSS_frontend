<template>
  <h1 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975;">Current Status in Bhutan</h1>
  <div v-if="isLoading" class="text-center">
    <p>Loading...</p> 
  </div>
  <div v-else-if="error" class="text-center text-danger">
    <p>{{ error }}</p>
  </div>
  <div v-else>
    <canvas ref="chartCanvas"></canvas> 
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import axios from 'axios';
import endpoints from '@/api';

// Local state variables for loading, error, and report data
const isLoading = ref(false);
const error = ref(null);
const reportData = ref([]);

// Canvas reference
const chartCanvas = ref(null);
let chart = null;

// Define a set of colors for the chart
const backgroundColors = [
  'rgba(44, 105, 117, 1)', 'rgba(114, 190, 203, 1)', 'rgba(104, 178, 160, 1)', 'rgba(180, 213, 191, 1)',
  'rgba(0, 0, 0, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(199, 199, 199, 1)',
  'rgba(83, 102, 255, 1)', 'rgba(170, 159, 64, 1)', 'rgba(235, 64, 52, 1)', 'rgba(64, 199, 86, 1)',
  'rgba(214, 133, 159, 1)', 'rgba(64, 66, 255, 1)', 'rgba(192, 192, 192, 1)', 'rgba(64, 64, 199, 1)'
];

// Function to count occurrences of each follow_up value from the fetched data
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

// Function to create or update the chart
function createOrUpdateChart(data) {
  const followUpCounts = countFollowUpValues(data);
  const labels = Object.keys(followUpCounts);
  const chartData = Object.values(followUpCounts);
  
  const dynamicColors = backgroundColors.slice(0, labels.length);
  
  const ctx = chartCanvas.value.getContext('2d');
  
  const chartConfig = {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        label: 'Follow Up Data',
        data: chartData,
        backgroundColor: dynamicColors,
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  };

  if (chart) {
    chart.data = chartConfig.data;
    chart.update();
  } else {
    chart = new Chart(ctx, chartConfig);
  }
}

// Fetch report data directly in the component
async function fetchReportData() {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await axios.get(endpoints.getReport); // Replace with actual API endpoint
    if (response.data && response.data.reporting_model_data) {
      reportData.value = response.data.reporting_model_data;
      createOrUpdateChart(reportData.value); // Call the chart update function after data fetch
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

// Fetch data and render chart on component mount
onMounted(() => {
  fetchReportData();
});

// Watch for changes in reportData and update the chart accordingly
watch(reportData, (newData) => {
  if (newData.length) {
    createOrUpdateChart(newData);
  }
}, { deep: true });
</script>

<style scoped>
canvas {
  width: 100%;
  height: 400px; /* Adjust size as necessary */
}
</style>
