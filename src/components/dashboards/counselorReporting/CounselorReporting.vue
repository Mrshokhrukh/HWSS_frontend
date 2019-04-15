<template>
  <div class="card p-4">
    <div class="p-field p-grid">
      <div class="p-col-12 p-md-4">
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <InputText v-model="globalFilter" placeholder="Global Search" class="ms-2 w-25" />
        </span>
      </div>
      <div v-if="isSchoolCounselor" class="p-col-12 p-md-4">
        <Dropdown v-model="selectedOption" :options="options" placeholder="Select Report Type" class="ms-2" />
      </div>
    </div>

    <!-- General Report Table -->
    <div v-if="selectedOption === 'general Report' || !isSchoolCounselor">
      <DataTable :value="filteredData" :paginator="true" :rows="10">
        <Column v-for="field in tableFields" :key="field.key" :field="field.key" :header="field.header"
          :sortable="true">
          <template #body="{ data }">
            <span :class="severityClass(data[field.key])">{{ data[field.key] }}</span>
          </template>
        </Column>
        <Column>
          <template #body="rowData">
            <Button label="Download" @click="downloadReport(rowData)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- School Environment Report Table -->
    <div v-else-if="selectedOption === 'school' && isSchoolCounselor">
      <SchoolEnvironmentTable />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import SchoolEnvironmentTable from "./SchoolEnvironmentTable.vue"
const reportData = ref([]);
const globalFilter = ref('');
const filteredData = ref([]);
// eslint-disable-next-line no-unused-vars
const globalFilterFields = [
  'date', 'username', 'age', 'sex', 'past_mental_disorder_history',
  'depression_severity', 'general_anxiety_severity', 'adverse_childhood_experience', 'suicidal_measurement',
  'tobacco_measurement', 'alcoholic_beverages', 'cannabis', 'cocaine','amphetamine-type_stimulants','inhalants','sedatives_or_sleeping_pills',
  'hallucinogens','opioids','other','injection_use'
];
const tableFields = [
  { key: 'date', header: 'Date' },
  { key: 'username', header: 'Name' },
  { key: 'age', header: 'Age' },
  { key: 'sex', header: 'Sex' },
  { key: 'past_mental_disorder_history', header: 'Past Mental Disorder History' },
  { key: 'suicidal_measurement', header: 'Suicidal Measurement' },
  { key: 'depression_severity', header: 'Depression Severity' },
  { key: 'general_anxiety_severity', header: 'General Anxiety Severity' },
  { key: 'adverse_childhood_experience', header: 'Adverse Childhood Experience' },
  { key: 'tobacco_measurement', header: 'Tobacco Measurement' },
  { key: 'alcoholic_beverages', header: 'Alcoholic beverages' },
  { key: 'cannabis', header: 'Cannabis' },
  { key: 'cocaine', header: 'Cocaine' },
  { key: 'amphetamine-type_stimulants', header: 'Amphetamine-type stimulants' },
  { key: 'inhalants', header: 'Inhalants' },
  { key: 'sedatives_or_sleeping_pills', header: 'Sedatives or Sleeping Pills' },
  { key: 'hallucinogens', header: 'Hallucinogens' },
  { key: 'opioids', header: 'Opioids' },
  { key: 'other', header: 'Other' },
  { key: 'injection_use', header: 'Have you ever used any drug by injection? (NON-MEDICAL USE ONLY)' },
];
const selectedOption = ref('general Report'); // Default option

const options = [
  'general Report',
  'school'
];

// Determine if the user is a school counselor
const isSchoolCounselor = computed(() => {
  return true; // For demonstration purposes
});

// Fetch report data from API
const fetchReportData = async () => {
  try {
    const response = await axios.get(endpoints.generateReport);
    console.log('Report data:', response.data);
    if (response.data && Array.isArray(response.data)) {
      reportData.value = response.data;
      filteredData.value = response.data;
    } else {
      handleFetchError();
    }
  } catch (error) {
    handleFetchError();
  }
};

// Handle fetch error
const handleFetchError = () => {
  reportData.value = [];
  filteredData.value = [];
  // Handle error
}

// Download report for a specific row
const downloadReport = (row) => {
  console.log('Downloading report for:', row);
  // Implement download logic
}

// Filter data based on global filter
const filterData = () => {
  if (!globalFilter.value) {
    filteredData.value = [...reportData.value];
    return;
  }
  const filtered = reportData.value.filter(item => {
    return Object.values(item).some(val => String(val).toLowerCase().includes(globalFilter.value.toLowerCase()));
  });
  filteredData.value = filtered;
}

// Watch for changes in global filter
watch(globalFilter, filterData);

// Function to determine severity class
const severityClass = (value) => {
  if (value === 'High' || value === 'Severe') {
    return 'severity-high';
  } else if (value === 'Moderate') {
    return 'severity-moderate';
  } else {
    return 'severity-low';
  }
}

onMounted(() => {
  fetchReportData();
})
</script>

<style scoped>
/* Add scoped styles here if needed */
</style>