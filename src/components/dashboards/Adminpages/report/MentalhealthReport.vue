<template>
  <div class="filter-form mb-2">
    <h1>Filters</h1>
    <hr>
    <form @submit.prevent="applyFilters" class="filter-form-container">
      <!-- Gender Wise Filter -->
      <div class="filter-item">
        <label for="gender">Gender:</label>
        <select id="gender" v-model="filters.gender">
          <option value="">All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>
      <!-- Region Wise Filter -->
      <div class="filter-item">
        <label for="region">Region:</label>
        <select id="region" v-model="filters.region" @change="updateDzongkhags">
          <option value="">Select Region</option>
          <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
        </select>
      </div>

      <!-- Dzongkhag Wise Filter -->
      <div class="filter-item" v-if="filters.region">
        <label for="dzongkhag">Dzongkhag:</label>
        <select id="dzongkhag" v-model="filters.dzongkhag">
          <option value="">Select Dzongkhag</option>
          <option v-for="dzongkhag in dzongkhags[filters.region]" :key="dzongkhag" :value="dzongkhag">
            {{ dzongkhag }}
          </option>
        </select>
      </div>
      <!-- Age Wise Filter -->
      <div class="filter-item">
        <label for="class">Class:</label>
        <select id="class" v-model="filters.class">
          <option value="">All</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
        </select>
      </div>

      <button type="submit" class="filter-button mt-4 ">NEXT</button>
    </form>
  </div>
  <div v-if="filtersApplied" class="filter-option mb-5">
    <h1>Which reports would you like to see</h1>
    <hr>
    <div class="filter-item">
      <select v-model="selectedReport">
        <option value="Monitor Report">Monitor Report</option>
        <option value="Case Study Report">Case Study Report</option>
        <option value="Severity Report">Severity Report</option>
      </select>
    </div>
    <button @click="handleReportSelection" class="filter-button mt-2">NEXT</button>
  </div>
  <MHMonitorReport v-if="showMonitorReport" :filteredData="filteredData"/>
  <MHCaseStatusReport v-if="showCaseStatusReport" :filteredData="filteredData" />
  <MHSeverityReport v-if="showSeverityReport" :filteredData="filteredData" />
</template>

<script setup>
import { ref, reactive, provide } from 'vue'
import MHMonitorReport from './MHMonitorReport/MHMonitorReport.vue';
import MHCaseStatusReport from './MHCaseStatusReport/MHCaseStatusReport.vue';
import MHSeverityReport from './MHSeverityReport/MHSeverityReport.vue';

// Define reactive state for filters
const filters = reactive({
  gender: '',
  region: '',
  dzongkhag: '',
  age: '',
  class: ''
})

// Compute unique regions for dropdown
const regions = ref(['Western', 'Central', 'Eastern', 'Southern'])

// Compute dzongkhags for each region
const dzongkhags = ref({
  Western: ['Thimphu', 'Paro', 'Haa', 'Punakha', 'Gasa', 'Wangdue Phodrang'],
  Central: ['Trongsa', 'Bumthang', 'Zhemgang', 'Tsirang', 'Dagana', 'Sarpang'],
  Eastern: [
    'Mongar',
    'Trashigang',
    'Trashi Yangtse',
    'Lhuentse',
    'Pema Gatshel',
    'Samdrup Jongkhar'
  ],
  Southern: ['Chukha', 'Samtse', 'Dagana', 'Tsirang']
})

const reportData = JSON.parse(sessionStorage.getItem('reportData')) || []
const filteredData = ref([])
const filtersApplied = ref(false)
const selectedReport = ref('All Report')
const showOverallReport = ref(false)
const showMonitorReport = ref(false)
const showCaseStatusReport = ref(false)
const showSeverityReport = ref(false)

// sorting filter data
const applyFilters = () => {
  filteredData.value = reportData.filter((item) => {
    if (filters.gender) {
      return item.user?.fields?.gender === filters.gender
    }
    if (filters.dzongkhag) {
      return item.user?.fields?.ps_add_dzongkhag === filters.dzongkhag
    }
    if (filters.class) {
      return item.user_agency?.fields?.user_class === filters.class
    }
    return true
  })
  console.log('Filtered Data:', (filteredData.value))
  filtersApplied.value = true
}

// showing for selcted files
const handleReportSelection = () => {
  // Reset all report visibility
  showOverallReport.value = false
  showMonitorReport.value = false
  showCaseStatusReport.value = false
  showSeverityReport.value = false

  // Show the selected report
  switch (selectedReport.value) {
    case 'Monitor Report':
      showMonitorReport.value = true
      break
    case 'Case Study Report':
      showCaseStatusReport.value = true
      break
    case 'Severity Report':
      showSeverityReport.value = true
      break
    default:
      console.log('Invalid report type selected')
  }
}

provide('filteredData', filteredData)
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

.filter-option {
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
