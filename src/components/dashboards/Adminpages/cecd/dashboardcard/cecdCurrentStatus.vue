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
import { ref, computed, onMounted } from 'vue';
import { useDashboardStore } from '@/stores/dashboardStore'; // Adjust the import path as needed

const dashboardStore = useDashboardStore();

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

// Computed properties to calculate case counts
const totalOngoingCase = computed(() =>
  dashboardStore.filteredData.filter(item => item.service_and_treatment?.case_status === "On Going").length
);

const totalClosedCase = computed(() =>
  dashboardStore.filteredData.filter(item => item.service_and_treatment?.case_status === "Case Closed").length
);

const totalDiscontinueCase = computed(() =>
  dashboardStore.filteredData.filter(item => item.service_and_treatment?.case_status === "Case Discontinue").length
);

// Reactive statuses array
const statuses = computed(() => [
  { title: 'Total Case Ongoing', iconClass: 'description', count: totalOngoingCase.value },
  { title: 'Total Case Discontinue', iconClass: 'credit_card_off', count: totalDiscontinueCase.value },
  { title: 'Total Case Closed', iconClass: 'fact_check', count: totalClosedCase.value }
]);

// Fetch data when component is mounted
onMounted(() => {
  if (dashboardStore.reportData.length === 0) {
    dashboardStore.fetchReportData();
  }
});
</script>