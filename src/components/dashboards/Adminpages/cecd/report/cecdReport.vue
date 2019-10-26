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
            <option value="School Environment Report">School Environment Report</option>
          </select>
        </div>

        <!-- Region Wise Filter -->
        <div class="filter-item">
          <label for="region">Region:</label>
          <select id="region" v-model="filters.region" @change="handleRegionChange">
            <option value="">Select Region</option>
            <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
          </select>
        </div>

        <!-- Dzongkhag Wise Filter -->
        <div class="filter-item">
          <label for="dzongkhag">Dzongkhag:</label>
          <select id="dzongkhag" v-model="filters.dzongkhag" :disabled="!filters.region">
            <option value="">Select Dzongkhag</option>
            <option v-for="dzongkhag in availableDzongkhags" :key="dzongkhag" :value="dzongkhag">
              {{ dzongkhag }}
            </option>
          </select>
        </div>

        <button type="submit" class="filter-button mt-4" :disabled="!selectedReport">APPLY FILTERS</button>
      </form>
    </div>

    <div v-if="showReport">
      <cecdMonitorReport v-if="showMonitorReport" :filteredData="filteredData" />
      <cecdCaseStatusReport v-if="showCaseStatusReport" :filteredData="filteredData" />
      <cecdSeverityReport v-if="showSeverityReport" :filteredData="filteredData" />
      <cecdSchoolenvReport v-if="showSchoolEnvReport" :filteredData="filteredData" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch } from 'vue';
import cecdMonitorReport from './cecdMonitorReport/cecdMonitorReport.vue';
import cecdCaseStatusReport from './cecdCasestatusReport/cecdCaseStatusReport.vue';
import cecdSeverityReport from './cecdSeverityReport/cecdSeverityReport.vue';
import cecdSchoolenvReport from './cecdSchoolenvReport/cecdSchoolenvReport.vue';

// Inject service and treatment data
const serviceAndTreatmentData = inject('serviceAndTreatmentData');

// State
const selectedReport = ref('');
const filters = ref({
  region: '',
  dzongkhag: ''
});
const showReport = ref(false);
const error = ref(null);
const isLoading = computed(() => !serviceAndTreatmentData?.value);

// Constants
const regions = ['Western', 'Central', 'Eastern'];
const dzongkhagMapping = {
  Western: ['Thimphu', 'Paro', 'Haa', 'Punakha', 'Gasa', 'Chhukha', 'Samtse', 'Phuentsholing Thromde', 'Thimphu Thromde'],
  Central: ['Bumthang', 'Dagana', 'Sarpang', 'Trongsa', 'Tsirang', 'Wangdue Phodrang', 'Zhemgang', 'Gelephu Thromde'],
  Eastern: ['Lhuentse', 'Mongar', 'Pemagatshel', 'Samdrup Jongkhar', 'Samdrup Jongkhar Thromde', 'Trashiyangtse', 'Trashigang']
};

// Helper function to get dzongkhag from item
const getDzongkhag = (item) => {
  // First try to get from screening data
  if (item?.screening_data && typeof item.screening_data === 'object' && item.screening_data.ps_add_dzongkhag) {
    return item.screening_data.ps_add_dzongkhag;
  }
  // Then try from user data
  if (item?.user?.ps_add_dzongkhag) {
    return item.user.ps_add_dzongkhag;
  }
  // Finally try from active agency
  if (item?.user?.active_agency?.present_dzongkhag) {
    return item.user.active_agency.present_dzongkhag;
  }
  return null;
};

// Helper function to find region for a dzongkhag
const findRegionForDzongkhag = (dzongkhag) => {
  if (!dzongkhag) return null;

  for (const [region, dzongkhags] of Object.entries(dzongkhagMapping)) {
    if (dzongkhags.some(d => d.toLowerCase() === dzongkhag.toLowerCase())) {
      return region;
    }
  }
  return null;
};

// Computed Properties
const availableDzongkhags = computed(() => {
  return filters.value.region ? dzongkhagMapping[filters.value.region] : [];
});

const showMonitorReport = computed(() => selectedReport.value === 'Monitor Report');
const showCaseStatusReport = computed(() => selectedReport.value === 'Case Study Report');
const showSeverityReport = computed(() => selectedReport.value === 'Severity Report');
const showSchoolEnvReport = computed(() => selectedReport.value === 'School Environment Report');

const filteredData = computed(() => {
  if (!serviceAndTreatmentData.value) return [];

  let data = serviceAndTreatmentData.value.filter((item) => {
    const itemDzongkhag = getDzongkhag(item);

    // If no filters are applied, return all data
    if (!filters.value.region && !filters.value.dzongkhag) {
      return true;
    }

    // If we can't determine the dzongkhag, exclude the item
    if (!itemDzongkhag) {
      return false;
    }

    const itemRegion = findRegionForDzongkhag(itemDzongkhag);

    // Apply region filter
    if (filters.value.region && itemRegion !== filters.value.region) {
      return false;
    }

    // Apply dzongkhag filter
    if (filters.value.dzongkhag &&
      itemDzongkhag.toLowerCase() !== filters.value.dzongkhag.toLowerCase()) {
      return false;
    }

    return true;
  });

  // Additional filtering for school environment report
  if (showSchoolEnvReport.value) {
    data = data.filter(item => {
      // Check if the item has school_env_data
      return item?.screening_data?.school_env_data &&
        Object.keys(item.screening_data.school_env_data).length > 0;
    });
  }

  return data;
});

// Methods
const handleRegionChange = () => {
  filters.value.dzongkhag = ''; // Reset dzongkhag when region changes
};

const applyFilters = () => {
  showReport.value = true;
};

// Debug logging to help troubleshoot filtering
watch([filters, filteredData], ([newFilters, newData]) => {
  console.log('Current Filters:', newFilters);
  console.log('Filtered Data Count:', newData.length);
  console.log('Sample Filtered Item:', newData[0]);
}, { deep: true });
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

.error-message {
  color: red;
  margin-top: 10px;
  font-weight: bold;
}
</style>