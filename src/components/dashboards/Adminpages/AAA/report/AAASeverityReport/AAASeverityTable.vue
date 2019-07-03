<template>
  <div class="card">
      <h3 class="text-center font-bold text-xl mb-4" style="color: #2c6975">Mental Health Risk Level</h3>
      <div class="card-body">
          <div class="flex flex-col md:flex-row">
              <div class="w-full md:w-1/3 mb-4 md:mb-0">
                  <div class="flex flex-wrap gap-2">
                      <Button @click="setActiveButton('Depression')"
                          :class="{ 'p-button-primary': activeButton === 'Depression' }">
                          Depression
                      </Button>
                      <Button @click="setActiveButton('Anxiety')"
                          :class="{ 'p-button-primary': activeButton === 'Anxiety' }">
                          Anxiety
                      </Button>
                      <Button @click="setActiveButton('ACE')" :class="{ 'p-button-primary': activeButton === 'ACE' }">
                          ACE
                      </Button>
                      <Button @click="setActiveButton('Suicidal Behaviours')"
                          :class="{ 'p-button-primary': activeButton === 'Suicidal Behaviours' }">
                          Suicidal Behaviours
                      </Button>
                  </div>
              </div>
              <div class="w-full md:w-2/3">
                  <DataTable :value="tableData" :rows="5">
                      <Column field="riskLevel" header="Risk Level"></Column>
                      <Column field="count" header="Count"></Column>
                  </DataTable>
              </div>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

const activeButton = ref(null);
const reportData = JSON.parse(sessionStorage.getItem('reportData')) || [];

// Filter functions
const filterData = (type, level) => reportData.filter(item => item.measurement?.fields[`${type}_measurement`] === level).length;

// Data counts
const gadCounts = {
  severe: filterData('gad', 'severe'),
  minimal: filterData('gad', 'minimal'),
  moderate: filterData('gad', 'moderate'),
  mild: filterData('gad', 'mild'),
};

const phqCounts = {
  severe: filterData('phq', 'severe'),
  minimal: filterData('phq', 'minimal'),
  moderate: filterData('phq', 'moderate'),
  moderately_severe: filterData('phq', 'moderately severe'),
  mild: filterData('phq', 'mild'),
};

const aceCounts = {
  high_risk: filterData('ace', 'high risk'),
  intermediate_risk: filterData('ace', 'intermediate risk'),
  low_risk: filterData('ace', 'low risk'),
};

const suicidalCounts = {
  nearlyeveryday: filterData('suicidal', 'nearly everyday'),
  more_than_half_the_days: filterData('suicidal', 'more than half the days'),
  several_days: filterData('suicidal', 'several days'),
};

const setActiveButton = (buttonName) => {
  activeButton.value = buttonName;
};

const tableData = computed(() => {
  switch (activeButton.value) {
      case 'Depression':
          return [
              { riskLevel: 'Severe', count: phqCounts.severe },
              { riskLevel: 'Minimal', count: phqCounts.minimal },
              { riskLevel: 'Moderate', count: phqCounts.moderate },
              { riskLevel: 'Moderately Severe', count: phqCounts.moderately_severe },
              { riskLevel: 'Mild', count: phqCounts.mild },
          ];
      case 'Anxiety':
          return [
              { riskLevel: 'Severe', count: gadCounts.severe },
              { riskLevel: 'Minimal', count: gadCounts.minimal },
              { riskLevel: 'Moderate', count: gadCounts.moderate },
              { riskLevel: 'Mild', count: gadCounts.mild },
          ];
      case 'ACE':
          return [
              { riskLevel: 'High Risk', count: aceCounts.high_risk },
              { riskLevel: 'Intermediate Risk', count: aceCounts.intermediate_risk },
              { riskLevel: 'Low Risk', count: aceCounts.low_risk },
          ];
      case 'Suicidal Behaviours':
          return [
              { riskLevel: 'Nearly Everyday', count: suicidalCounts.nearlyeveryday },
              { riskLevel: 'More Than Half The Days', count: suicidalCounts.more_than_half_the_days },
              { riskLevel: 'Several Days', count: suicidalCounts.several_days },
          ];
      default:
          return [];
  }
});

onMounted(() => {
  setActiveButton('Depression');
});
</script>

<style scoped>
.p-button {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.p-button-primary {
  background-color: #2c6975 !important;
  border-color: #2c6975 !important;
}
</style>