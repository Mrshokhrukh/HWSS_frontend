<template>
  <div class="school-environment-table">
    <DataTable :value="tableData" :paginator="true" :rows="10" :globalFilterFields="globalFilterFields" resizableColumns
      columnResizeMode="fit">
      <Column v-for="field in tableFields" :key="field.key" :field="field.key" :header="field.header" :sortable="true">
        <template #body="{ data }">
          <span>{{ data[field.key] }}</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';

const schoolEnvData = ref(null);
const tableData = ref([]);
const loading = ref(false);
const error = ref(null);

const globalFilterFields = [
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

const fetchSchoolEnvData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await axios.get(endpoints.getSchoolEnvData);
    schoolEnvData.value = response.data;
    processData();
  } catch (err) {
    error.value = 'Failed to fetch school environment data';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const processData = () => {
  if (!schoolEnvData.value) return;

  tableData.value = Object.values(schoolEnvData.value).flatMap(responses => {
    const rowData = {};
    responses.forEach(response => {
      if (tableFields.some(field => field.key === response.question)) {
        rowData[response.question] = response.answer;
      }
    });
    return rowData;
  });
};

onMounted(() => {
  fetchSchoolEnvData();
});
</script>

<style scoped>
/* Add scoped styles here if needed */
</style>