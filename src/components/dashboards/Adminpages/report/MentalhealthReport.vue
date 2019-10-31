<template>
  <div class="filter-configurator">
    <div class="config-card">
      <div class="config-header">
        <h2 class="header-title">Data Configuration</h2>
        <div class="quick-actions">
          <p-button icon="pi pi-refresh" class="p-button-rounded p-button-text" @click="resetFilters"
            :disabled="!hasFilters" />
        </div>
      </div>

      <div class="filter-content">
        <div class="main-filters">
          <div class="filter-group">
            <label>Report Type</label>
            <p-dropdown v-model="selectedReport" :options="reportTypes" optionLabel="label" class="w-full"
              placeholder="Select Report Type" />
          </div>

          <div class="filter-group">
            <label>Agency Type</label>
            <p-dropdown v-model="filters.agencyType" :options="agencyTypes" class="w-full"
              placeholder="Select Agency Type" @change="handleAgencyTypeChange" />
          </div>

          <template v-if="filters.agencyType === 'SCHOOL'">
            <div class="filter-group">
              <label>Class Level</label>
              <p-dropdown v-model="filters.classLevel" :options="classLevels" class="w-full"
                placeholder="Select Class" />
            </div>
          </template>

          <div class="filter-section">
            <h3 class="section-title">Location</h3>
            <div class="filter-group-row">
              <p-dropdown v-model="filters.region" :options="regions" class="w-full" placeholder="Region"
                @change="handleRegionChange" />
              <p-dropdown v-model="filters.dzongkhag" :options="availableDzongkhags" class="w-full"
                placeholder="Dzongkhag" :disabled="!filters.region" />
            </div>
          </div>
        </div>

        <div class="additional-filters">
          <div class="filter-section">
            <h3 class="section-title">Demographics</h3>
            <div class="filter-group">
              <label>Age Group</label>
              <p-multi-select v-model="filters.ageGroups" :options="ageGroupOptions" class="w-full"
                placeholder="Select Age Groups" display="chip" />
            </div>

            <div class="filter-group">
              <label>Gender</label>
              <p-multi-select v-model="filters.gender" :options="genderOptions" class="w-full"
                placeholder="Select Gender" display="chip" />
            </div>
          </div>

          <div class="filter-section">
            <h3 class="section-title">Date Range</h3>
            <p-calendar v-model="dateRange" selectionMode="range" class="w-full" placeholder="Select Date Range" />
          </div>
        </div>
      </div>

      <div v-if="hasFilters" class="active-filters">
        <div class="filter-chips">
          <p-chip v-for="filter in activeFiltersList" :key="filter.id" :label="filter.label" removable
            @remove="removeFilter(filter.id)" />
        </div>
      </div>

      <div class="filter-actions">
        <p-button label="Reset" severity="secondary" @click="resetFilters" :disabled="!hasFilters" />
        <p-button label="Apply Filters" @click="applyFilters" :disabled="!canApplyFilters" />
      </div>
    </div>

    <div v-if="showReport" class="report-container">
      <MHMonitorReport v-if="showMonitorReport" :filteredData="processedData" :activeFiltersList="activeFiltersList" />
      <MHCaseStatusReport v-if="showCaseStatusReport" :filteredData="processedData"
        :activeFiltersList="activeFiltersList" />
      <MHSeverityReport v-if="showSeverityReport" :filteredData="processedData"
        :activeFiltersList="activeFiltersList" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import MHMonitorReport from './MHMonitorReport/MHMonitorReport.vue';
import MHCaseStatusReport from './MHCaseStatusReport/MHCaseStatusReport.vue';
import MHSeverityReport from './MHSeverityReport/MHSeverityReport.vue';
import axios from 'axios';
import endpoints from '@/api';

const toast = useToast();

// Filter Options
const reportTypes = [
  { label: 'Monitor Report', value: 'monitor' },
  { label: 'Case Study Report', value: 'case-study' },
  { label: 'Severity Report', value: 'severity' }
];
const agencyTypes = ['GYALSUNG', 'SCHOOL', 'RCSC'];
const classLevels = ['PP', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const ageGroupOptions = ['5-10', '11-15', '16-20', '21-25', '26-30', '31-35', '36+'];
const genderOptions = ['Male', 'Female', 'Other'];
const regions = ['Western', 'Central', 'Eastern'];
const dzongkhagMapping = {
  Western: ['Thimphu', 'Paro', 'Haa', 'Punakha', 'Gasa', 'Chukha', 'Samtse'],
  Central: ['Bumthang', 'Dagana', 'Sarpang', 'Trongsa', 'Tsirang', 'Wangdue'],
  Eastern: ['Lhuentse', 'Mongar', 'Pemagatshel', 'Samdrup Jongkhar', 'Trashigang']
};

// State
const loading = ref(false);
const selectedReport = ref(null);
const dateRange = ref(null);
const filters = ref({
  agencyType: null,
  classLevel: null,
  region: null,
  dzongkhag: null,
  ageGroups: [],
  gender: []
});
const showReport = ref(false);
const processedData = ref([]);

// Computed properties for conditional rendering
const showMonitorReport = computed(() => selectedReport.value === 'monitor');
const showCaseStatusReport = computed(() => selectedReport.value === 'case-study');
const showSeverityReport = computed(() => selectedReport.value === 'severity');

// Computed properties
const availableDzongkhags = computed(() => filters.value.region ? dzongkhagMapping[filters.value.region] : []);
const hasFilters = computed(() => selectedReport.value || filters.value.region || filters.value.dzongkhag || filters.value.ageGroups.length || filters.value.gender.length || dateRange.value);
const canApplyFilters = computed(() => selectedReport.value !== null);

// Computed property for active filters list
const activeFiltersList = computed(() => {
  const list = [];
  if (selectedReport.value) list.push({ id: 'report', label: `Report: ${selectedReport.value}` });
  if (filters.value.agencyType) list.push({ id: 'agencyType', label: `Agency Type: ${filters.value.agencyType}` });
  if (filters.value.classLevel) list.push({ id: 'classLevel', label: `Class Level: ${filters.value.classLevel}` });
  if (filters.value.region) list.push({ id: 'region', label: `Region: ${filters.value.region}` });
  if (filters.value.dzongkhag) list.push({ id: 'dzongkhag', label: `Dzongkhag: ${filters.value.dzongkhag}` });
  if (filters.value.ageGroups.length > 0) list.push({ id: 'ageGroups', label: `Age Groups: ${filters.value.ageGroups.join(', ')}` });
  if (filters.value.gender.length > 0) list.push({ id: 'gender', label: `Gender: ${filters.value.gender.join(', ')}` });
  if (dateRange.value) list.push({ id: 'dateRange', label: `Date Range: ${dateRange.value[0]} - ${dateRange.value[1]}` });
  return list;
});

// Methods
const fetchData = async () => {
  loading.value = true;
  try {
    const response = await axios.get(endpoints.newServiceAndTreatment);
    processedData.value = response.data; // Process data if needed
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const applyFilters = async () => {
  showReport.value = false; // Reset report display before fetching
  await fetchData(); // Get updated data
  showReport.value = true; // Show report after fetching
  toast.add({ severity: 'success', summary: 'Success', detail: 'Filters applied successfully', life: 3000 });
};

const resetFilters = () => {
  selectedReport.value = null;
  dateRange.value = null;
  filters.value = { agencyType: null, classLevel: null, region: null, dzongkhag: null, ageGroups: [], gender: [] };
  showReport.value = false;
};

const handleAgencyTypeChange = () => {
  if (filters.value.agencyType !== 'SCHOOL') filters.value.classLevel = null;
};

const handleRegionChange = () => filters.value.dzongkhag = '';

const removeFilter = (filterId) => {
  switch (filterId) {
    case 'report': selectedReport.value = null; break;
    case 'agencyType': filters.value.agencyType = null; break;
    case 'classLevel': filters.value.classLevel = null; break;
    case 'region': filters.value.region = null; break;
    case 'dzongkhag': filters.value.dzongkhag = null; break;
    case 'ageGroups': filters.value.ageGroups = []; break;
    case 'gender': filters.value.gender = []; break;
    case 'dateRange': dateRange.value = null; break;
  }
};

// Watchers
watch([selectedReport, filters, dateRange], () => { showReport.value = false; }, { deep: true });
</script>

<style scoped>
.filter-configurator {
  padding: 1.5rem;
}

.config-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.config-header {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.filter-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 1.5rem;
}

.filter-group {
  margin-bottom: 1.25rem;
}

.filter-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4B5563;
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.filter-group-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.active-filters {
  padding: 1rem 1.5rem;
  background: #F9FAFB;
  border-top: 1px solid #E5E7EB;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-actions {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid #E5E7EB;
}

/* PrimeVue Component Overrides */
:deep(.p-dropdown),
:deep(.p-multiselect),
:deep(.p-calendar) {
  width: 100%;
}

:deep(.p-dropdown-item),
:deep(.p-multiselect-item) {
  padding: 0.75rem 1rem;
}

:deep(.p-chip) {
  background: #EEF2FF;
  color: #4F46E5;
}

/* Loading State */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
</style>