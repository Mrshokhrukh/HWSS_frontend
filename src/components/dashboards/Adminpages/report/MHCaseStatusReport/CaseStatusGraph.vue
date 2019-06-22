<template>
  <div class="row justify-content-center mb-3">
    <div class="col-md-6 text-center">
      <div class="card option">
        <div class="card-body">
          <h1 class="text-center fw-bold mb-4" style="color: #2c6975;">Follow-up Status</h1>
          <div>
            <canvas ref="followUpChartCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';
import { inject } from 'vue';

const followUpChartCanvas = ref(null);
const reportData = inject('filteredData');

// Ensure reportData is an array
const data = Array.isArray(reportData.value) ? reportData.value : [];

// Follow-up

// Function to extract follow_up values dynamically from service_and_treatment
function extractFollowUpValues(data) {
  const case_statusValues = new Set(); // Use a Set to ensure uniqueness
  data.forEach(item => {
    if (item.service_and_treatment?.case_status) {
      case_statusValues.add(item.service_and_treatment.case_status);
    }
  });
  return Array.from(case_statusValues); // Convert Set to Array for easy manipulation
}

// Function to count occurrences of each follow_up value
function countcase_statusValues(data) {
  const counts = {};
  data.forEach(value => {
    counts[value] = (counts[value] || 0) + 1;
  });
  return counts;
}

// Extract follow_up values and count them
const followUpOptions = extractFollowUpValues(data);
const followUpCounts = countcase_statusValues(data.map(item => item.service_and_treatment?.case_status).filter(Boolean));

// Prepare data for Chart.js
const followUpLabels = Object.keys(followUpCounts);
const followUpData = Object.values(followUpCounts);

// Define a larger set of colors
const followUpBackgroundColors = [
  'rgba(44, 105, 117, 1)',
  'rgba(114, 190, 203, 1)',
  'rgba(104, 178, 160, 1)',
];

// Ensure there are enough colors
const followUpDynamicColors = followUpBackgroundColors.slice(0, followUpLabels.length);

const followUpChartData = {
  labels: followUpLabels,
  datasets: [{
    label: 'Follow-up Counts',
    data: followUpData,
    backgroundColor: followUpDynamicColors,
  }]
};

// Initialize the bar chart for Follow-up Status
const initializeFollowUpChart = () => {
  const ctx = followUpChartCanvas.value.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: followUpChartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// Initialize charts on mount
onMounted(() => {
  if (followUpChartCanvas.value) {
    initializeFollowUpChart();
  }
});
</script>

<style>
/* Add any custom styles for the chart canvas here */
</style>
