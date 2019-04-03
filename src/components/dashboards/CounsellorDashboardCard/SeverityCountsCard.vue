<template>
  <div class="text-center">

    <div class="row">
      <h4 class="col-12 mb-2 text-start">Severity</h4>
      <div v-for="(item, index) in items" :key="index" class="col-md-2 mx-auto mb-4 counter-card">
        <div @click="setActiveIndex(index)" :class="[isActive(index) ? 'active-card' : 'card text-secondary', 'h-100']">
          <div class="card-body d-flex flex-column align-items-center justify-content-center">
            <h1>{{ item.count }}</h1>
            <h6 class="mt-auto">{{ item.title }}</h6>
          </div>
        </div>
      </div>
    </div>

    <div class="row" v-if="activeItem.title !== 'Assist'">
      <!-- Suicidal Behaviour Card -->
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
import { ref, computed, onMounted, provide } from 'vue';
import axios from 'axios';
import endpoints from '@/api';

import SeverityGraphCard from '@/components/dashboards/CounsellorDashboardCard/SeverityGraphCard.vue';
import AssistSeverityAndGraph from '@/components/dashboards/CounsellorDashboardCard/AssistSeverityAndGraph.vue';
import SeverityIndicatorCard from '@/components/dashboards/CounsellorDashboardCard/SeverityIndicatorCard.vue';

const items = ref([
  { count: '0', title: 'Suicidal Behavior', link: '/suicidal-behavior' },
  { count: '0', title: 'Depression', link: '/depression' },
  { count: '0', title: 'Anxiety', link: '/anxiety' },
  { count: '0', title: 'ACE', link: '/ace' },
  { count: '0', title: 'Assist', link: '/assist' }
]);

const activeIndex = ref(0);

function isActive(index) {
  return index === activeIndex.value;
}

const activeItem = computed(() => items.value[activeIndex.value]);

const measurementData = ref([]);
const measuremenAssisttData = ref([]);

onMounted(async () => {
  try {
    // Fetch data for 'Measurement' from the getMeasurement endpoint
    const response = await axios.get(endpoints.getMeasurement);
    if (response.data && response.data.length > 0) {
      measurementData.value = response.data
      const measurements = response.data.map(item => item.measurement);
      const suicidalCount = measurements.filter(item => item.suicidal_measurement !== null).length;
      const depressionCount = measurements.filter(item => item.phq_measurement !== null).length;
      const anxietyCount = measurements.filter(item => item.gad_measurement !== null).length;
      const aceCount = measurements.filter(item => item.ace_measurement !== null).length;

      // Fetch data for 'Assist' from the getAssistMeasurement endpoint
      const assistResponse = await axios.get(endpoints.getAssistMeasurement);
      if (assistResponse.data && assistResponse.data.length > 0) {
        // Count the number of objects in the response
        measuremenAssisttData.value = assistResponse.data
        const assistCount = assistResponse.data.length;

        // Update items to include counts for Assist section
        items.value = [
          { count: suicidalCount, title: 'Suicidal Behavior', link: '/suicidal-behavior' },
          { count: depressionCount, title: 'Depression', link: '/depression' },
          { count: anxietyCount, title: 'Anxiety', link: '/anxiety' },
          { count: aceCount, title: 'ACE', link: '/ace' },
          { count: assistCount, title: 'Assist', link: '/assist' }
        ];
      }
    }
  }
  catch (error) {
    console.error('Error fetching data:', error);
  }
})

provide('measurementData', measurementData);
provide('measuremenAssisttData', measuremenAssisttData);

function setActiveIndex(index) {
  activeIndex.value = index;
}
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
