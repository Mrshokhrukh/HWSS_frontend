<template>
  <h2 class="text-center bold hwss-primary">Total Case Ongoing</h2>
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
    <template #empty>No data found.</template>
    <template #loading>Loading data. Please wait.</template>

    <!-- Additional Headers -->

    <Column header="Date" field="service_and_treatment.date" :showFilterMenu="false" style="min-width: 10rem"
      :sortable="true">
      <template #body="{ data }">
        {{ data.service_and_treatment.date }}
      </template>
    </Column>
    <Column header="Gender" field="user.fields.gender" :showFilterMenu="false" style="min-width: 10rem"
      :sortable="true">
      <template #body="{ data }">
        {{ data.user.fields.gender }}
      </template>
    </Column>
    <Column header="Dzongkha" field="user.fields.present_dzongkhag" :showFilterMenu="false" style="min-width: 10rem"
      :sortable="true">
      <template #body="{ data }">
        {{ data.user.fields.present_dzongkhag }}
      </template>
    </Column>
    <Column header="Age" field="user.fields.age" :showFilterMenu="false" style="min-width: 9rem" :sortable="true">
      <template #body="{ data }">
        {{ data.user.fields.age }}
      </template>
    </Column>
    <Column header="Class" field="user.fields.user_class" :showFilterMenu="false" style="min-width: 9rem"
      :sortable="true">
      <template #body="{ data }">
        {{ data.user.fields.user_class }}
      </template>
    </Column>
    <Column header="Case Status" field="service_and_treatment.case_status" :showFilterMenu="false"
      style="min-width: 14rem" :sortable="true">
      <template #body="{ data }">
        {{ data.service_and_treatment.case_status }}
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

const filters = ref({
  global: { value: '', matchMode: FilterMatchMode.CONTAINS },
  year: { value: [], matchMode: FilterMatchMode.IN },
  gender: { value: [], matchMode: FilterMatchMode.IN },
  dzongkha: { value: [], matchMode: FilterMatchMode.IN },
  location: { value: [], matchMode: FilterMatchMode.IN },
  age: { value: [], matchMode: FilterMatchMode.IN },
  class: { value: [], matchMode: FilterMatchMode.IN },
  employmentHistory: { value: [], matchMode: FilterMatchMode.IN },
});

const loading = ref(true);

const reportData = ref([]);

const filteredData = computed(() => {
  let filtered = reportData.value;
  for (const key in filters.value) {
    if (filters.value[key].value.length > 0) {
      filtered = filtered.filter(item => {
        const filterValue = filters.value[key].value.toString().toLowerCase();
        const itemValue = key.includes('.') ? key.split('.').reduce((o, i) => o[i], item) : item[key];
        return itemValue?.toString().toLowerCase().includes(filterValue);
      });
    }
  }
  return filtered;
});

const fetchReportData = async () => {
  try {
    const response = await axios.get(endpoints.reportData);
    if (response.data && Array.isArray(response.data)) {
      console.log('Fetched data:', response.data);
      reportData.value = response.data.filter(item => item.service_and_treatment.case_status === 'On Going');
    } else {
      handleFetchError();
    }
  } catch (error) {
    handleFetchError();
  } finally {
    loading.value = false;
  }
};

const handleFetchError = () => {
  reportData.value = [];
  // Handle error
};

onMounted(() => {
  fetchReportData();
});

// Function to clear filters
const clearFilter = () => {
  for (const key in filters.value) {
    filters.value[key].value = [];
  }
};
</script>

<style scoped></style>
