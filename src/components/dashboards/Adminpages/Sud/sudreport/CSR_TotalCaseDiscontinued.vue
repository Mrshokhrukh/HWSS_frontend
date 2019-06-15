<template>
  <h2 class="text-center bold hwss-primary">Total Case Discontinued</h2>
  <DataTable v-model:filters="filters" :value="filteredData" paginator showGridlines :rows="10" dataKey="id"
    filterDisplay="row" :loading="loading" sortField="substanceRisk" :sortOrder="1"
    :globalFilterFields="['year', 'gender', 'dzongkha', 'location', 'age', 'class', 'employmentHistory']">
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <Button type="button" icon="fa-solid fa-filter-circle-xmark" class="p-button-text" label="Clear" outlined
          @click="clearFilter()" />
        <div class="p-input-icon-left">
          <i class="fa-solid fa-magnifying-glass"></i>
          <InputText v-model="filters['global'].value" placeholder="Keyword Search" class="p-inputtext-sm" />
        </div>
      </div>
    </template>
    <template #empty> No data found. </template>
    <template #loading> Loading data. Please wait. </template>

    <!-- Additional Headers -->

    <Column header="Date" field="date" :showFilterMenu="false" style="min-width: 10rem" :sortable="true">
      <template #body="{ data }">
        {{ data.date }}
      </template>
    </Column>
    <Column header="Gender" field="sex" :showFilterMenu="false" style="min-width: 10rem" :sortable="true">
      <template #body="{ data }">
        {{ data.gender }}
      </template>
    </Column>
    <Column header="Dzongkhag" field="present_dzongkhag" :showFilterMenu="false" style="min-width: 10rem"
      :sortable="true">
      <template #body="{ data }">
        {{ data.dzongkhag }}
      </template>
    </Column>
    <Column header="Age" field="age" :showFilterMenu="false" style="min-width: 9rem" :sortable="true">
      <template #body="{ data }">
        {{ data.age }}
      </template>
    </Column>
    <Column header="Class" field="user_class" :showFilterMenu="false" style="min-width: 9rem" :sortable="true">
      <template #body="{ data }">
        {{ data.user_class }}
      </template>
    </Column>
    <Column header="case_status" field="case_status" :showFilterMenu="false" style="min-width: 14rem" :sortable="true">
      <template #body="{ data }">
        {{ data.case_status }}
      </template>
    </Column>

  </DataTable>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import axios from 'axios';
import endpoints from '@/api';
// import Badge from 'primevue/badge';

const filters = ref({
  global: { value: [], matchMode: FilterMatchMode.CONTAINS },
  year: { value: [], matchMode: FilterMatchMode.IN },
  gender: { value: [], matchMode: FilterMatchMode.IN },
  dzongkhag: { value: [], matchMode: FilterMatchMode.IN },
  location: { value: [], matchMode: FilterMatchMode.IN },
  age: { value: [], matchMode: FilterMatchMode.IN },
  class: { value: [], matchMode: FilterMatchMode.IN },
  employmentHistory: { value: [], matchMode: FilterMatchMode.IN },
});

// const loading = ref(true);

// const loading = ref(true);
const reportData = ref(JSON.parse(sessionStorage.getItem('reportData')) || []);

const filteredData = computed(() => {
  // Check if reportData has been fetched and contains data
  if (!reportData.value || !reportData.value.length) {
    console.log('reportData is empty or undefined');
    return [];
  }

  // Filter reportData based on case_status
  const filteredData = reportData.value.filter(item => item.service_and_treatment?.case_status === "Case Discontinued");

  // Map filtered data to extract required fields
  const transformedData = filteredData.map(item => ({
    date: item.service_and_treatment?.date || 'NA',
    gender: item.user?.fields?.gender || 'NA',
    dzongkhag: item.user?.fields?.ps_add_dzongkhag || 'NA',
    age: calculateAge(item.user?.fields?.date_of_birth) || 'NA',
    user_class: item.user_agency?.fields?.user_class || 'NA',
    case_status: item.service_and_treatment?.case_status || 'NA',
  }));

  return transformedData;
});

// Function to calculate age based on date of birth
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return '';
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}



// Function to clear filters
const clearFilter = () => {
  for (const key in filters.value) {
    filters.value[key].value = [];
  }
};
</script>
<style scope></style>