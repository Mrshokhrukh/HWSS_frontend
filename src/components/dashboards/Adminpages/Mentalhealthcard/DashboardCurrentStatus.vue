<template>
  <div class="status-container">
    <h3 class="status-title">Current Status in Bhutan</h3>
    <div class="status-cards">
      <div v-for="(status, index) in statuses" :key="index" class="status-card">
        <div class="card-content">
          <div class="card-icon">
            <span class="material-symbols-outlined">{{ status.iconClass }}</span>
          </div>
          <div class="card-info">
            <h4 class="card-title">{{ status.title }}</h4>
            <p class="card-count">{{ formatNumber(status.count) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';

// Inject the data from parent component
const newServiceAndTreatment = inject('serviceAndTreatmentData', []);

const formatNumber = (num) => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num;
};

// Updated computed properties to use injected data
const totalOngoingCase = computed(() =>
  newServiceAndTreatment.value?.filter(item => item.case_status === "On Going").length || 0
);

const totalClosedCase = computed(() =>
  newServiceAndTreatment.value?.filter(item => item.case_status === "Case Closed").length || 0
);

const totalDiscontinueCase = computed(() =>
  newServiceAndTreatment.value?.filter(item => item.case_status === "Case Discontinue").length || 0
);

const statuses = computed(() => [
  { title: 'Total Case Ongoing', iconClass: 'description', count: totalOngoingCase.value },
  { title: 'Total Case Discontinue', iconClass: 'credit_card_off', count: totalDiscontinueCase.value },
  { title: 'Total Case Closed', iconClass: 'fact_check', count: totalClosedCase.value }
]);
</script>

<style scoped>
.status-container {
  padding: 2rem;
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.status-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2B656F;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.status-cards {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
}

.status-card {
  flex: 1;
  padding: 1.5rem;
  border-radius: 15px;
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  transition: all 0.3s ease;
  color: white;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card-count {
  font-size: 2.5rem;
  font-weight: 700;
}

.status-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .status-cards {
    flex-direction: column;
  }
}
</style>