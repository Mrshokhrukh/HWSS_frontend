<template>
  <div class="school-environment-table">
    <DataTable :value="filteredData" :paginator="true" :rows="10" :globalFilterFields="globalFilterFields" resizableColumns columnResizeMode="fit">
      <Column v-for="field in tableFields" :key="field.key" :field="field.key" :header="field.header" :sortable="true">
        <template #body="{ data }">
          <span>{{ data[field.key] }}</span>
        </template>
      </Column>
      <Column>
        <template #body="{ data }">
          <Button label="Download" @click="downloadReport(data)" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';

const reportData = ref([]);
const globalFilter = ref('');
const filteredData = ref([]);
const globalFilterFields = [
  'username', 'present_dzongkhag', 'alcoholic_measurement', 'phq_measurement',
  'assessment_status', 'counseling', 'follow_up', 'suicidal_measurement',
  'tobacco_measurement', 'case_status', 'referral_status', 'rescreening_count',
  'I feel safe at school', 'My school is free of corporal punishment',
  'I feel motivated to come to school', 'My teachers and other staff are helpful and supportive',
  'My school is free of bullying', 'All the students receive fair treatment at school',
  'My school engages all the students in all school activities', 'Students get along well with each other in our school',
  'What do you like the most about your school?', 'What changes do you really wish to see in your school?'
];
const tableFields = [
  { key: 'I feel safe at school', header: 'I feel safe at school' },
  { key: 'My school is free of corporal punishment', header: 'My school is free of corporal punishment' },
  { key: 'I feel motivated to come to school', header: 'I feel motivated to come to school' },
  { key: 'My teachers and other staff are helpful and supportive', header: 'My teachers and other staff are helpful and supportive' },
  { key: 'My school is free of bullying', header: 'My school is free of bullying' },
  { key: 'All the students receive fair treatment at school', header: 'All the students receive fair treatment at school' },
  { key: 'My school engages all the students in all school activities', header: 'My school engages all the students in all school activities' },
  { key: 'Students get along well with each other in our school', header: 'Students get along well with each other in our school' },
  { key: 'What do you like the most about your school?', header: 'What do you like the most about your school?' },
  { key: 'What changes do you really wish to see in your school?', header: 'What changes do you really wish to see in your school?' }
];

// Fetch report data from API
const fetchReportData = () => {
  try {
    const storedReportData = JSON.parse(sessionStorage.getItem('reportData'));
    if (storedReportData) {
      reportData.value = storedReportData;
      filteredData.value = storedReportData;
    } else {
      handleFetchError("No data found in sessionStorage.");
    }
  } catch (error) {
    handleFetchError("Error parsing or retrieving data from sessionStorage:", error);
  }
}

console.log(reportData)
// Handle fetch error
const handleFetchError = () => {
  reportData.value = [];
  filteredData.value = [];
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

watch(globalFilter, filterData);
onMounted(fetchReportData);
</script>

<style scoped>
/* Add scoped styles here if needed */
</style>