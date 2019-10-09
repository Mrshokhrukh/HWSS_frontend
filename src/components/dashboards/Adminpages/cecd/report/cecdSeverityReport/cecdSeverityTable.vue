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
            <Button @click="setActiveButton('Anxiety')" :class="{ 'p-button-primary': activeButton === 'Anxiety' }">
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
          <DataTable :value="tableData" :paginator="false" :rows="5">
            <Column field="riskLevel" header="Risk Level"></Column>
            <Column field="count" header="Count"></Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});
console.log("laso table data", props.filteredData)
const activeButton = ref(null);

// Filter functions
const filterData = (type, level) => {
  // Return 0 if filteredData is undefined or empty
  if (!props.filteredData || props.filteredData.length === 0) {
    return 0;
  }

  // Filter data with proper checks
  return props.filteredData
    .filter(item => {
      // Check if measurement and fields exist before accessing them
      return item.measurement?.fields?.[`${type}_measurement`] === level;
    })
    .length;
};

// Data counts computed from filteredData prop
const gadCounts = computed(() => ({
  severe: filterData('gad', 'severe'),
  minimal: filterData('gad', 'minimal'),
  moderate: filterData('gad', 'moderate'),
  mild: filterData('gad', 'mild'),
}));

const phqCounts = computed(() => ({
  severe: filterData('phq', 'severe'),
  minimal: filterData('phq', 'minimal'),
  moderate: filterData('phq', 'moderate'),
  moderately_severe: filterData('phq', 'moderately severe'),
  mild: filterData('phq', 'mild'),
}));

const aceCounts = computed(() => ({
  high_risk: filterData('ace', 'high risk'),
  intermediate_risk: filterData('ace', 'intermediate risk'),
  low_risk: filterData('ace', 'low risk'),
}));

const suicidalCounts = computed(() => ({
  nearlyeveryday: filterData('suicidal', 'nearly everyday'),
  more_than_half_the_days: filterData('suicidal', 'more than half the days'),
  several_days: filterData('suicidal', 'several days'),
}));

const setActiveButton = (buttonName) => {
  activeButton.value = buttonName;
};

const tableData = computed(() => {
  switch (activeButton.value) {
    case 'Depression':
      return [
        { riskLevel: 'Severe', count: phqCounts.value.severe },
        { riskLevel: 'Minimal', count: phqCounts.value.minimal },
        { riskLevel: 'Moderate', count: phqCounts.value.moderate },
        { riskLevel: 'Moderately Severe', count: phqCounts.value.moderately_severe },
        { riskLevel: 'Mild', count: phqCounts.value.mild },
      ];
    case 'Anxiety':
      return [
        { riskLevel: 'Severe', count: gadCounts.value.severe },
        { riskLevel: 'Minimal', count: gadCounts.value.minimal },
        { riskLevel: 'Moderate', count: gadCounts.value.moderate },
        { riskLevel: 'Mild', count: gadCounts.value.mild },
      ];
    case 'ACE':
      return [
        { riskLevel: 'High Risk', count: aceCounts.value.high_risk },
        { riskLevel: 'Intermediate Risk', count: aceCounts.value.intermediate_risk },
        { riskLevel: 'Low Risk', count: aceCounts.value.low_risk },
      ];
    case 'Suicidal Behaviours':
      return [
        { riskLevel: 'Nearly Everyday', count: suicidalCounts.value.nearlyeveryday },
        { riskLevel: 'More Than Half The Days', count: suicidalCounts.value.more_than_half_the_days },
        { riskLevel: 'Several Days', count: suicidalCounts.value.several_days },
      ];
    default:
      return [];
  }
});

watch(() => props.filteredData, () => {
  setActiveButton('Depression'); // Ensure default selection is maintained after data updates
}, { immediate: true });

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
