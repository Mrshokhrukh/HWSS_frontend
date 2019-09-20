<template>
  <div class="text-center">
    <div class="row">
      <h4 class="col-12 mb-2 text-start">Severity</h4>
      <div v-for="(item, index) in store.severityItems" :key="index" class="col-md-2 mx-auto mb-4 counter-card">
        <div @click="setActiveIndex(index)" :class="[isActive(index) ? 'active-card' : 'card text-secondary', 'h-100']">
          <div class="card-body d-flex flex-column align-items-center justify-content-center">
            <h1>{{ item.count }}</h1>
            <h6 class="mt-auto text-uppercase">{{ item.title }}</h6>
          </div>
        </div>
      </div>
    </div>

    <div class="row" v-if="activeItem.title !== 'Assist'">
      <!-- Severity Indicator Card -->
      <div class="col-md-4">
        <div class="h-100">
          <SeverityIndicatorCard v-if="activeItem" :cardTitle="activeItem.title" />
        </div>
      </div>

      <!-- Graph Card -->
      <div class="col-md-8">
        <div class="h-100">
          <SeverityGraphCard v-if="activeItem" :cardTitle="activeItem.title" />
        </div>
      </div>
    </div>

    <div class="row" v-else>
      <AssistSeverityAndGraph />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide, watch } from 'vue';
import { useCounselorDashboardStore } from '@/stores/counselorDashboard';

import SeverityGraphCard from '@/components/dashboards/CounsellorDashboardCard/SeverityGraphCard.vue';
import AssistSeverityAndGraph from '@/components/dashboards/CounsellorDashboardCard/AssistSeverityAndGraph.vue';
import SeverityIndicatorCard from '@/components/dashboards/CounsellorDashboardCard/SeverityIndicatorCard.vue';

const store = useCounselorDashboardStore();

const activeIndex = ref(0);

function isActive(index) {
  return index === activeIndex.value;
}

const activeItem = computed(() => store.severityItems[activeIndex.value]);

onMounted(async () => {
  if (!store.isInitialized) {
    await store.initializeStore();
  }
});

// Provide filtered data to child components
provide('measurementData', computed(() => store.filteredMeasurementData));
provide('measurementAssistData', computed(() => store.filteredAssistMeasurementData));
provide('sudData', computed(() => store.filteredSudData));

function setActiveIndex(index) {
  activeIndex.value = index;
  store.setActiveCardIndex(index);
}

// Watch for changes in filtered data and update severity counts
watch(
  () => [store.filteredMeasurementData, store.filteredAssistMeasurementData],
  () => {
    store.updateSeverityCounts();
    store.updateAssistCount();
  },
  { deep: true }
);
</script>

<style scoped>
.active-card {
  border: 2px solid #2B656F;
  color: #2B656F;
  background-color: #fff;
  border-radius: 10px;
  place-items: center;
  display: flex;
}

.card {
  background-color: #eee;
  cursor: pointer;
}

.card-body h1 {
  color: #2B656F;
  font-size: 3rem;
  margin-bottom: 0;
}

.card-body h6 {
  color: #6c757d;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}
</style>