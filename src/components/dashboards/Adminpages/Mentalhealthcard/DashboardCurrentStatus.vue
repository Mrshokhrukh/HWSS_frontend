<template>
  <h3 class="text-center fw-bold my-4 hwss-primary">Current Status in Bhutan</h3>
  <div class="row d-flex justify-content-center">
    <div v-for="(status, index) in statuses" :key="index" class="card col-3 bg-light mx-auto h-100"
      style="border-radius: 15px;">
      <h4 class="card-title text-center fw-bold mt-3">{{ status.title }}</h4>
      <div class="card-body text-center d-flex align-items-center justify-content-center">
        <span class="material-symbols-outlined hwss-primary display-3">{{ status.iconClass }}</span>
        <p class="card-text display-3 fw-bold me-2 ms-2">{{ formatNumber(status.count) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const statuses = ref([
  { title: 'Total Case Ongoing', iconClass: 'description', count: 0 },
  { title: 'Total Case Discontinue', iconClass: 'credit_card_off', count: 0 },
  { title: 'Total Case Closed', iconClass: 'fact_check', count: 0 }
]);

// Method to format numbers with K, M, B
const formatNumber = (num) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  }
  return num;
};

// Function to count case statuses using caseStatus
const countCaseStatuses = (data) => {
  let ongoingCount = 0;
  let discontinuedCount = 0;
  let closedCount = 0;

  data.forEach(entry => {
    const caseStatus = entry.service_and_treatment?.case_status; // Accessing case_status from service_and_treatment

    if (caseStatus === 'Case Open') { // Adjusted status values according to the JSON structure
      ongoingCount++;
    } else if (caseStatus === 'Case Discontinued') {
      discontinuedCount++;
    } else if (caseStatus === 'Case Closed') {
      closedCount++;
    }
  });

  return { ongoingCount, discontinuedCount, closedCount };
};

// Retrieve and parse report data from session storage
const getReportData = () => {
  try {
    const storedData = sessionStorage.getItem('reportData');
    if (storedData) {
      return JSON.parse(storedData).reporting_model_data; // Accessing reporting_model_data from the parsed JSON
    } else {
      console.warn('No report data found in session storage');
      return [];
    }
  } catch (error) {
    console.error('Error parsing report data from session storage:', error);
    return [];
  }
};

// On component mount, count the case statuses
onMounted(() => {
  const reportData = getReportData();

  const { ongoingCount, discontinuedCount, closedCount } = countCaseStatuses(reportData);

  statuses.value[0].count = ongoingCount;
  statuses.value[1].count = discontinuedCount;
  statuses.value[2].count = closedCount;
});
</script>
