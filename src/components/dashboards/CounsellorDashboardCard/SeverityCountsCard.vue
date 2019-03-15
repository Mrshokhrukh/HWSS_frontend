<template>
  <div class="text-center">

    <div class="row">
      <h4 class="col-12 mb-2 text-start">Severity</h4>
      <div v-for="(item, index) in items" :key="index" class="col-md-2 mx-auto mb-4">
        <router-link :to="item.link" class="text-decoration-none">
          <div :class="[isActive(index) ? 'active-card' : 'card text-secondary', 'h-100']">
            <div class="card-body d-flex flex-column align-items-center justify-content-center">
              <h1>{{ item.count }}</h1>
              <h6 class="mt-auto">{{ item.title }}</h6>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <div class="row">
      <!-- Suicidal Behaviour Card -->
      <div class="col-md-6">
        <div class="h-100">
          <SeverityIndicatorCard :cardTitle="activeCardTitle" />
        </div>
      </div>

      <!-- Graph Card -->
      <div class="col-md-6">
        <div class="h-100">
          <SeverityGraphCard />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

import SeverityGraphCard from '@/components/dashboards/CounsellorDashboardCard/SeverityGraphCard.vue';
import SeverityIndicatorCard from '@/components/dashboards/CounsellorDashboardCard/SeverityIndicatorCard.vue';

const items = ref([
  { count: '10', title: 'Suicidal Behavior', link: '/suicidal-behavior' },
  { count: '12k', title: 'Depression', link: '/depression' },
  { count: '1M', title: 'Anxiety', link: '/anxiety' },
  { count: '5', title: 'ACE', link: '/ace' },
  { count: '12', title: 'Assist', link: '/assist' }
]);

const activeIndex = ref(0);

function isActive(index) {
  return index === activeIndex.value;
}

const activeCardTitle = computed(() => items.value[activeIndex.value].title);
</script>

<style scoped>
.active-card {
  border: 2px solid #2B656F;
  color: #2B656F;
  background-color: #fff;
  border-radius: 10px;
}

.card {
  background-color: #eee;
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
