<template>
  <div class="card p-4">
    <h2 class="text-center bold hwss-primary">Total Case Ongoing</h2>
    <DataTable v-model:filters="filters" :value="filteredData" paginator showGridlines :rows="10" dataKey="id"
      filterDisplay="row" :loading="loading"
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
      <template #empty> No customers found. </template>
      <template #loading> Loading customers data. Please wait. </template>



      <!-- Filter for Year -->
      <Column header="Year" field="year" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.year }}
        </template>
      </Column>

      <!-- Filter for Gender -->
      <Column header="Gender" field="gender" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.gender }}
        </template>
      </Column>

      <!-- Filter for Dzongkha -->
      <Column header="Dzongkha" field="dzongkha" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.dzongkha }}
        </template>
      </Column>

      <!-- Filter for Location -->
      <Column header="Location" field="location" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.location }}
        </template>
      </Column>

      <!-- Filter for Age -->
      <Column header="Age" field="age" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.age }}
        </template>
      </Column>

      <!-- Filter for Class -->
      <Column header="Class" field="class" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.class }}
        </template>
      </Column>

      <!-- Filter for Employment History -->
      <Column header="Employment History" field="employmentHistory" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.employmentHistory }}
        </template>
      </Column>
    </DataTable>
  </div>

  <div class="card p-4 mt-5">
    <h2 class="text-center hwss-primary bold">Total Case Discontinued</h2>
    <DataTable v-model:filters="filters" :value="filteredData" paginator showGridlines :rows="10" dataKey="id"
      filterDisplay="row" :loading="loading"
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
      <template #empty> No customers found. </template>
      <template #loading> Loading customers data. Please wait. </template>
      <!-- Filter for Year -->
      <Column header="Year" field="year" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.year }}
        </template>
      </Column>

      <!-- Filter for Gender -->
      <Column header="Gender" field="gender" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.gender }}
        </template>
      </Column>

      <!-- Filter for Dzongkha -->
      <Column header="Dzongkha" field="dzongkha" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.dzongkha }}
        </template>
      </Column>

      <!-- Filter for Location -->
      <Column header="Location" field="location" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.location }}
        </template>
      </Column>

      <!-- Filter for Age -->
      <Column header="Age" field="age" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.age }}
        </template>
      </Column>

      <!-- Filter for Class -->
      <Column header="Class" field="class" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.class }}
        </template>
      </Column>

      <!-- Filter for Employment History -->
      <Column header="Employment History" field="employmentHistory" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.employmentHistory }}
        </template>
      </Column>
    </DataTable>
  </div>

  <div class="card p-4 mt-5">
    <DataTable v-model:filters="filters" :value="filteredData" paginator showGridlines :rows="10" dataKey="id"
      filterDisplay="row" :loading="loading"
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
      <template #empty> No Case Closed. </template>
      <template #loading> Loading Total Case Closed. Please wait. </template>
      <h2 class="text-center hwss-primary bold">Total Case Closed</h2>

      <!-- Filter for Year -->
      <Column header="Year" field="year" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.year }}
        </template>
      </Column>

      <!-- Filter for Gender -->
      <Column header="Gender" field="gender" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.gender }}
        </template>
      </Column>

      <!-- Filter for Dzongkha -->
      <Column header="Dzongkha" field="dzongkha" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.dzongkha }}
        </template>
      </Column>

      <!-- Filter for Location -->
      <Column header="Location" field="location" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.location }}
        </template>
      </Column>

      <!-- Filter for Age -->
      <Column header="Age" field="age" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.age }}
        </template>
      </Column>

      <!-- Filter for Class -->
      <Column header="Class" field="class" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.class }}
        </template>
      </Column>

      <!-- Filter for Employment History -->
      <Column header="Employment History" field="employmentHistory" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.employmentHistory }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

const monitorData = ref();
const filters = ref({
  global: { value: [], matchMode: FilterMatchMode.CONTAINS },
  year: { value: [], matchMode: FilterMatchMode.IN },
  gender: { value: [], matchMode: FilterMatchMode.IN },
  dzongkha: { value: [], matchMode: FilterMatchMode.IN },
  location: { value: [], matchMode: FilterMatchMode.IN },
  age: { value: [], matchMode: FilterMatchMode.IN },
  class: { value: [], matchMode: FilterMatchMode.IN },
  employmentHistory: { value: [], matchMode: FilterMatchMode.IN },
});

const loading = ref(true);

const filteredData = computed(() => {
  let filtered = monitorData.value;
  // Apply filters based on the selected values
  for (const key in filters.value) {
    if (filters.value[key].value.length > 0) {
      filtered = filtered.filter(item => filters.value[key].value.includes(item[key]));
    }
  }
  return filtered;
});

onMounted(() => {
  // Dummy Data
  monitorData.value = [
    { id: 1, totalOngoing: 'Yes', totalDiscontinued: 'No', totalClosed: 'Yes', year: '2022', gender: 'Male', dzongkha: 'Yes', location: 'Agency 1', age: '30', class: '10', employmentHistory: 'Working' },
    { id: 2, totalOngoing: 'Yes', totalDiscontinued: 'No', totalClosed: 'No', year: '2023', gender: 'Female', dzongkha: 'No', location: 'Agency 2', age: '25', class: '12', employmentHistory: 'Not working' },
    // Add more dummy data as needed
  ];
  loading.value = false;
});

// Function to clear filters
const clearFilter = () => {
  for (const key in filters.value) {
    filters.value[key].value = [];
  }
};
</script>