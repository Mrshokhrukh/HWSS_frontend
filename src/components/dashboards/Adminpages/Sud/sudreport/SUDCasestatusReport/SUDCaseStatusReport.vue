<template>
  <div class="container-fluid">
    <div class="card">
      <div class="row">
        <!-- Sidebar for Options -->
        <div class="col-md-3 p-4 bg-light border-end d-flex flex-column">
          <h5 class="mb-4">Data Set</h5>
          <div v-for="option in options" :key="option.id" class="form-check mb-2">
            <input 
              type="checkbox" 
              class="form-check-input" 
              :id="option.id" 
              v-model="option.selected" 
              @change="handleOptionChange(option)"
            />
            <label class="form-check-label" :for="option.id">{{ option.label }}</label>
          </div>
          <button @click="generateReport" class="btn btn-primary mt-auto">Generate</button>
        </div>
        <!-- Preview Area -->
        <div class="col-md-9 p-3 bg-white">
          <div v-if="!showPreview" class="text-center text-muted">
            <p class="note">Note: Please select the parameters</p>
            <p class="note">Note: The report will be shown only when the generate button is pressed.</p>
          </div>
          <div v-else>
            <div class="graph">
              <div class="graph-placeholder">
                <SUDCaseStatusGraph v-if="!showTable" :selectedOptions="selectedOptions" :reportData="reportData" />
                <SUDCSR_Table v-else :reportData="reportData" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import SUDCaseStatusGraph from './SUDCaseStatusGraph.vue';
import SUDCSR_Table from './SUDCSR_Table.vue';

const options = ref([
  { id: 'ONGoingCases', label: 'On Going Case', selected: false },
  { id: 'CaseDiscontinued', label: 'Case Discontinued', selected: false },
  { id: 'CaseClosed', label: 'Case Closed', selected: false },
  { id: 'Table', label: 'All', selected: false },
]);

const showPreview = ref(false);
const showTable = ref(false);

const selectedOptions = computed(() => {
  return options.value.filter(option => option.selected && option.id !== 'Table').map(option => option.id);
});

const handleOptionChange = (changedOption) => {
  if (changedOption.id === 'Table') {
    // If Table is selected, deselect all other options
    options.value.forEach(option => {
      if (option.id !== 'Table') {
        option.selected = false;
      }
    });
  } else {
    // If any other option is selected, deselect Table
    options.value.find(option => option.id === 'Table').selected = false;
  }
  showTable.value = options.value.find(option => option.id === 'Table').selected;
};

const generateReport = () => {
  if (selectedOptions.value.length > 0 || showTable.value) {
    showPreview.value = true;
  } else {
    alert('Please select at least one option before generating the report.');
  }
};

const reportData = ref([
  { id: 'ONGoingCases', status: 'On Going Case', count: 30 },
  { id: 'CaseDiscontinued', status: 'Case Discontinued', count: 10 },
  { id: 'CaseClosed', status: 'Case Closed', count: 60 },
]);
</script>

<style scoped>
/* Add scoped styles as needed */
</style>