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
import { ref } from 'vue';


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

const reportData = ref(JSON.parse(sessionStorage.getItem('reportData')) || []);

// Filter reportData based on case_status
const Ongoing_Case = reportData.value.filter(item => item.service_and_treatment?.case_status === "On Going");
const total_Ongoing_Case = Ongoing_Case.length;

const Closed_Case = reportData.value.filter(item => item.service_and_treatment?.case_status === "Case Closed");
const total_Closed_Case = Closed_Case.length;

const Discontinue_Case = reportData.value.filter(item => item.service_and_treatment?.case_status === "Case Discontinue");
const total_Discontinue_Case = Discontinue_Case.length;

const statuses = ref([
  { title: 'Total Case Ongoing', iconClass: 'description', count: total_Ongoing_Case },
  { title: 'Total Case Discontinue', iconClass: 'credit_card_off', count: total_Discontinue_Case },
  { title: 'Total Case Closed', iconClass: 'fact_check', count: total_Closed_Case }
]);
</script>
