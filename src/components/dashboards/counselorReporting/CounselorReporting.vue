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
          :sortable="true" :style="field.width ? { width: field.width } : {}">
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
  'date', 'username', 'age', 'sex', 'past_diagnosis',
  'gad_measurement', 'phq_measurement', 'ace_measurement', 'suicidal_measurement',
  'tobacco_measurement', 'alcoholic_measurement', 'cannabis', 'cocaine','amphetamine-type_stimulants','inhalants','sedatives_or_sleeping_pills',
  'hallucinogens','opioids','other','injection_use'
];
const tableFields = [
  { key: 'date', header: 'Date' },
  { key: 'username', header: 'Name' },
  { key: 'age', header: 'Age' },
  { key: 'sex', header: 'Sex' },
  { key: 'present_dzongkhag', header: 'Present Dzongkhag' },
  { key: 'present_gewog', header: 'Present Gewog' },
  { key: 'present_village', header: 'Present Village' },
  { key: 'user_code', header: 'User Code' },
  { key: 'parent_occupation', header: 'Parent Occupation' },
  { key: 'guardian_name', header: 'Guardian Name' },
  { key: 'guardian_occupation', header: 'Guardian Occupation' },
  { key: 'parent_status', header: 'Parent Status' },
  { key: 'current_living_with', header: 'Current Living With' },
  { key: 'user_role_agency', header: 'User Role Agency' },
  { key: 'user_class', header: 'User Class' },
  { key: 'user_stream', header: 'User Stream' },
  { key: 'user_sub_class', header: 'User Sub Class' },
  { key: 'past_diagnosis', header: 'Past Diagnosis' },
  { key: 'gad_measurement', header: 'GAD Measurement' },
  { key: 'phq_measurement', header: 'PHQ Measurement' },
  { key: 'suicidal_measurement', header: 'Suicidal Measurement' },
  { key: 'ace_measurement', header: 'ACE Measurement' },
  { key: 'alcoholic_measurement', header: 'Alcoholic Measurement' },
  { key: 'tobacco_measurement', header: 'Tobacco Measurement' },
  { key: 'cannabis_measurement', header: 'Cannabis Measurement' },
  { key: 'cocaine_measurement', header: 'Cocaine Measurement' },
  { key: 'amphetamine_measurement', header: 'Amphetamine Measurement' },
  { key: 'inhalants_measurement', header: 'Inhalants Measurement' },
  { key: 'sedatives_measurement', header: 'Sedatives Measurement' },
  { key: 'hallucinogens_measurement', header: 'Hallucinogens Measurement' },
  { key: 'opioids_measurement', header: 'Opioids Measurement' },
  { key: 'injection_measurement', header: 'Injection Measurement' },
  { key: 'other_measurement', header: 'Other Measurement' },
  { key: 'other_name', header: 'Other Name' },
  { key: 'assessment_status', header: 'Assessment Status' },
  { key: 'case_status', header: 'Case Status' },
  { key: 'counseling', header: 'Counseling' },
  { key: 'follow_up', header: 'Follow Up' },
  { key: 'comments', header: 'Comments' },
  { key: 'referral_status', header: 'Referral Status' },
  { key: 'referral_remarks', header: 'Referral Remarks' },
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