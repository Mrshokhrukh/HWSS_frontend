<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error }}</div>
  <div v-else>
    <div class="filter-form mb-2">
      <h1>Select Report</h1>
      <hr>
      <form @submit.prevent="applyFilters" class="filter-form-container">
        <!-- Report Selection -->
        <div class="filter-item">
          <label for="report">Report Type:</label>
          <select id="report" v-model="selectedReport">
            <option value="">Select a report</option>
            <option value="Monitor Report">Monitor Report</option>
            <option value="Case Study Report">Case Study Report</option>
            <option value="Severity Report">Severity Report</option>
          </select>
        </div>

        <!-- Region Wise Filter -->
        <div class="filter-item">
          <label for="region">Region:</label>
          <select id="region" v-model="filters.region" @change="updateRegion">
            <option value="">Select Region</option>
            <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
          </select>
        </div>

        <!-- Dzongkhag Wise Filter -->
        <div class="filter-item">
          <label for="dzongkhag">Dzongkhag:</label>
          <select id="dzongkhag" v-model="filters.dzongkhag" :disabled="!filters.region">
            <option value="">Select Dzongkhag</option>
            <option v-for="dzongkhag in dzongkhags[filters.region] || []" :key="dzongkhag" :value="dzongkhag">
              {{ dzongkhag }}
            </option>
          </select>
        </div>

        <button type="submit" class="filter-button mt-4" :disabled="!selectedReport">APPLY FILTERS</button>
      </form>
    </div>

    <div v-if="showReport">
      <SUDMonitorReport v-if="showMonitorReport" :filteredData="filteredData" />
      <SUDCaseStatusReport v-if="showCaseStatusReport" :filteredData="filteredData" />
      <SUDSeverityReport v-if="showSeverityReport" :filteredData="filteredData" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboardStore'
import SUDCaseStatusReport from './SUDCasestatusReport/SUDCaseStatusReport.vue';
import SUDMonitorReport from './SUDMonitorReport/SUDMonitorReport.vue';
import SUDSeverityReport from './SUDSevirityReport/SUDSeverityReport.vue';

const store = useDashboardStore()
const { reportData, selectedReport, filters, regions, dzongkhags, filteredData, isLoading, error } = storeToRefs(store)

const showReport = ref(false)

const showMonitorReport = computed(() => selectedReport.value === 'Monitor Report')
const showCaseStatusReport = computed(() => selectedReport.value === 'Case Study Report')
const showSeverityReport = computed(() => selectedReport.value === 'Severity Report')

const updateRegion = () => {
  store.setFilter('region', filters.value.region)
}

const applyFilters = () => {
  // The filtering is now handled by the Pinia store's getter
  console.log('Filtered Data:', filteredData.value)
  showReport.value = true
}
onMounted(async () => {
  await store.fetchReportData()
})
</script>


<style scoped>
.filter-form {
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.filter-form-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.filter-item {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 150px;
}

.filter-item label {
  margin-bottom: 5px;
  font-weight: bold;
}

.filter-item input,
.filter-item select {
  padding: 8px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  border-radius: 5px;
  font-size: 14px;
}

.filter-button {
  padding: 10px 20px;
  border: none;
  background-color: #2C6975;
  color: white;
  font-size: 14px;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.filter-button:hover {
  background-color: #0056b3;
}

.filter-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.filter-option {
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-message {
  color: red;
  margin-top: 10px;
  font-weight: bold;
}
</style>