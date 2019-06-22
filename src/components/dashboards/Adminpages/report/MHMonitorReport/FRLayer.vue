<template>
  <div class="row justify-content-center mb-3">
    <div class="col-md-6 text-center">
      <div class="card option">
        <div class="card-body">
          <h1 class="text-center fw-bold mb-4" style="color: #2c6975">Referral Status</h1>
          <div>
            <canvas ref="referralChartCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>
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
import { inject } from 'vue'

const referralChartCanvas = ref(null);
const followUpChartCanvas = ref(null);
const reportData = inject('filteredData')

// Ensure reportData is an array
const data = Array.isArray(reportData.value) ? reportData.value : [];

// Referred
const referredCount = ref(0)
const referredDataFilter = ref([])
referredDataFilter.value = data.filter(item => item.service_and_treatment?.referred === 'Referred');
referredCount.value = referredDataFilter.value.length;

// Not Referred
const notReferredCount = ref(0)
const notReferredDataFilter = ref([])
notReferredDataFilter.value = data.filter(item => item.service_and_treatment?.referred === 'Not Referred');
notReferredCount.value = notReferredDataFilter.value.length;

// Initialize the pie chart for Referral Status
const initializeReferralChart = () => {
  const ctx = referralChartCanvas.value.getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Referred', 'Not Referred'],
      datasets: [{
        data: [referredCount.value, notReferredCount.value],
        backgroundColor: ['#2c6975', '#d1edc4'],
        hoverBackgroundColor: ['#145454', '#b3e19d']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.raw}`;
            }
          }
        }
      }
    }
  });
}

// Follow-up

// Function to extract follow_up values dynamically from service_and_treatment
function extractFollowUpValues(data) {
  const followUpValues = new Set(); // Use a Set to ensure uniqueness
  data.forEach(item => {
    if (item.service_and_treatment?.follow_up) {
      followUpValues.add(item.service_and_treatment.follow_up);
    }
  });
  return Array.from(followUpValues); // Convert Set to Array for easy manipulation
}

// Function to count occurrences of each follow_up value
function countFollowUpValues(data) {
  const counts = {};
  data.forEach(value => {
    counts[value] = (counts[value] || 0) + 1;
  });
  return counts;
}

// Extract follow_up values and count them
const followUpOptions = extractFollowUpValues(data);
const followUpCounts = countFollowUpValues(data.filter(item => followUpOptions.includes(item.service_and_treatment?.follow_up)));

// Prepare data for Chart.js
const followUpLabels = Object.keys(followUpCounts);
const followUpData = Object.values(followUpCounts);

// Define a larger set of colors
const followUpBackgroundColors = [
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

// Ensure there are enough colors
const followUpDynamicColors = followUpBackgroundColors.slice(0, followUpLabels.length);

const followUpChartData = {
  labels: followUpLabels,
  datasets: [{
    label: followUpLabels,
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
  if (referralChartCanvas.value && followUpChartCanvas.value) {
    initializeReferralChart();
    initializeFollowUpChart();
  }
});
</script>

<style>
/* Add any custom styles for the chart canvas here */
</style>
