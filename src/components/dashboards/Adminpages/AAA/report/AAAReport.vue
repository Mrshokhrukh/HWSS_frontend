<template>
  <div>
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-md-4 mb-3" v-for="(card, index) in cards" :key="index">
          <div class="card option" @click="selectCard(index)" :class="{ 'active': selectedIndex === index }">
            <div class="card-body text-center">
              <i :class="card.iconClass"></i>
              <p class="card-text mt-2">{{ card.title }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="selectedIndex !== null" class="mt-4">
      <component :is="selectedComponent"></component>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import MonitorReport from "@/components/dashboards/Adminpages/AAA/report/MonitorReport.vue"
import CaseStatusReport from "@/components/dashboards/Adminpages/AAA/report/CaseStatusReport.vue"
import SeverityReport from "@/components/dashboards/Adminpages/AAA/report/SeverityReport.vue"

const selectedIndex = ref(null);

const cards = [
  { title: 'Monitor Report', component: MonitorReport, iconClass: 'fas fa-desktop fa-3x mb-3' },
  { title: 'Case Status Report', component: CaseStatusReport, iconClass: 'fas fa-briefcase fa-3x mb-3' },
  { title: 'Severity Report', component: SeverityReport, iconClass: 'fas fa-exclamation-triangle fa-3x mb-3' }
];

const selectedComponent = computed(() => {
  if (selectedIndex.value !== null) {
    return cards[selectedIndex.value].component;
  }
  return null;
});

const selectCard = (index) => {
  selectedIndex.value = index;
};
</script>

<style scoped>
.card {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
}

.card.active {
  background-color: lightblue;
}

.card:hover {
  background-color: #f9f9f9;
}
</style>
