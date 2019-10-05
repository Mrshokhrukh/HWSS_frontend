<template>
  <div class="severity-dashboard">
    <div class="row">
      <h4 class="col-12 mb-3 text-start dashboard-title">Severity</h4>
      <div v-for="(item, index) in SEVERITY_ITEMS" :key="index" class="col-md-2 mx-auto mb-4">
        <div @click="setActiveIndex(index)" :class="['severity-card', { 'active-card': isActive(index) }]">
          <div class="card-body d-flex flex-column align-items-center justify-content-center">
            <div class="count-circle">{{ item.count }}</div>
            <h6 class="mt-3 text-uppercase">{{ item.title }}</h6>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4" v-if="activeItem.title !== 'Assist'">
      <div class="col-md-4">
        <div class="card-container">
          <SeverityIndicatorCard v-if="activeItem" :cardTitle="activeItem.title" />
        </div>
      </div>
      <div class="col-md-8">
        <div class="card-container">
          <SeverityGraphCard v-if="activeItem" :cardTitle="activeItem.title" />
        </div>
      </div>
    </div>

    <div class="row mt-4" v-else>
      <div class="col-12">
        <div class="card-container">
          <AssistSeverityAndGraph />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useCounselorDashboardStore } from '@/stores/counselorDashboard';

import SeverityGraphCard from '@/components/dashboards/CounsellorDashboardCard/SeverityGraphCard.vue';
import AssistSeverityAndGraph from '@/components/dashboards/CounsellorDashboardCard/AssistSeverityAndGraph.vue';
import SeverityIndicatorCard from '@/components/dashboards/CounsellorDashboardCard/SeverityIndicatorCard.vue';

const store = useCounselorDashboardStore();

// Use storeToRefs for reactive store properties
const { filteredUserData, isInitialized } = storeToRefs(store);

// Constants
const SEVERITY_ITEMS = ref([
  { count: '0', title: 'Suicidal Behavior', field: 'suicidal_measurement' },
  { count: '0', title: 'Depression', field: 'phq_measurement' },
  { count: '0', title: 'Anxiety', field: 'gad_measurement' },
  { count: '0', title: 'ACE', field: 'ace_measurement' },
  { count: '0', title: 'Assist', field: 'assist' }
]);

const activeIndex = ref(0);

function isActive(index) {
  return index === activeIndex.value;
}

const activeItem = computed(() => SEVERITY_ITEMS.value[activeIndex.value]);

onMounted(async () => {
  if (!isInitialized.value) {
    await store.initializeStore();
  }
  updateSeverityCounts();
});

// Provide filtered data to child components
provide('filteredUserData', filteredUserData);

function setActiveIndex(index) {
  activeIndex.value = index;
  if (store.setActiveCardIndex) {
    store.setActiveCardIndex(index);
  }
}

// Function to update severity counts
function updateSeverityCounts() {
  if (filteredUserData.value) {
    SEVERITY_ITEMS.value.forEach((item) => {
      let count = 0;
      filteredUserData.value.forEach(user => {
        if (item.field === 'assist') {
          // Check if any ASSIST measurement is not 'no risk'
          const assistData = user.assistMeasurementData;
          if (assistData) {
            const hasRisk = Object.keys(assistData).some(key =>
              key.includes('_measurement') && assistData[key] !== 'no risk' && assistData[key] !== null
            );
            if (hasRisk) count++;
          }
        } else {
          // For other fields, check if measurement exists and is not null
          const measurement = user.measurementData?.[item.field];
          if (measurement !== undefined && measurement !== null) {
            count++;
          }
        }
      });
      item.count = count.toString();
    });
  }
}

// Watch for changes in filtered data and update severity counts
watch(filteredUserData, () => {
  if (isInitialized.value) {
    updateSeverityCounts();
  }
}, { deep: true });
</script>

<style scoped>
.severity-dashboard {
  padding: 2rem;
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(43, 101, 111, 0.1);
}

.dashboard-title {
  color: #2B656F;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.severity-card {
  background: linear-gradient(135deg, #ffffff, #f0f7f8);
  border: 2px solid transparent;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  box-shadow: 0 4px 6px rgba(43, 101, 111, 0.1);
}

.severity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(43, 101, 111, 0.15);
}

.active-card {
  border-color: #2B656F;
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.active-card .card-body h6,
.active-card .count-circle {
  color: #ffffff;
}

.card-body {
  padding: 1.25rem;
}

.count-circle {
  background-color: rgba(43, 101, 111, 0.1);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2B656F;
  margin-bottom: 0.5rem;
}

.card-body h6 {
  color: #2B656F;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.card-container {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(43, 101, 111, 0.1);
  height: 100%;
  transition: all 0.3s ease;
}

.card-container:hover {
  box-shadow: 0 6px 12px rgba(43, 101, 111, 0.15);
}

@media (max-width: 768px) {
  .severity-dashboard {
    padding: 1rem;
  }

  .count-circle {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }

  .card-body h6 {
    font-size: 0.7rem;
  }
}
</style>