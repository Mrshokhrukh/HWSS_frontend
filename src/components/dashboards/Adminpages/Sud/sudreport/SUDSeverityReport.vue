<template>
  <div class="card l">
    <DataTable v-model:filters="filters" :value="filteredData" paginator showGridlines :rows="10" dataKey="id" filterDisplay="row" :loading="loading"
               :globalFilterFields="['year', 'gender', 'dzongkha', 'location', 'age', 'class', 'employmentHistory']">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <Button type="button" icon="fa-solid fa-filter-circle-xmark" class="p-button-text" label="Clear" outlined @click="clearFilter()" />
          <div class="p-input-icon-left">
            <i class="fa-solid fa-magnifying-glass"></i>
            <InputText v-model="filters['global'].value" placeholder="Keyword Search" class="p-inputtext-sm" />
          </div>
        </div>
      </template>
      <template #empty> No data found. </template>
      <template #loading> Loading data. Please wait. </template>

      <!-- Severity Report -->


      <!-- Lifetime Use -->
      <Column header="Lifetime Use" field="lifetimeUse" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.lifetimeUse }}
        </template>
      </Column>
      <!-- Current Use -->
      <Column header="Current Use" field="currentUse" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.currentUse }}
        </template>
      </Column>
      <!-- Substance -->
      <Column header="Tobacco" field="substanceRisk" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          <span :style="{ color: data.substanceRisk === 'Moderate' ? 'orange' : data.substanceRisk === 'High' ? 'red' : '' }">
            {{ data.substanceRisk }}
          </span>
        </template>
      </Column>
      <!-- Substance Risk -->
      <Column header="Alcohol" field="substanceRisk" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          <span :style="{ color: data.substanceRisk === 'Moderate' ? 'orange' : data.substanceRisk === 'High' ? 'red' : '' }">
            {{ data.substanceRisk }}
          </span>
        </template>
      </Column>
      <Column header="Cannabis" field="substanceRisk" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          <span :style="{ color: data.substanceRisk === 'Moderate' ? 'orange' : data.substanceRisk === 'High' ? 'red' : '' }">
            {{ data.substanceRisk }}
          </span>
        </template>
      </Column>
      <Column header="Cocaine" field="substanceRisk" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          <span :style="{ color: data.substanceRisk === 'Moderate' ? 'orange' : data.substanceRisk === 'High' ? 'red' : '' }">
            {{ data.substanceRisk }}
          </span>
        </template>
      </Column>
      <Column header="Amphetamine-type stimulants" field="substanceRisk" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          <span :style="{ color: data.substanceRisk === 'Moderate' ? 'orange' : data.substanceRisk === 'High' ? 'red' : '' }">
            {{ data.substanceRisk }}
          </span>
        </template>
      </Column>
      <Column header="Inhalant" field="substanceRisk" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          <span :style="{ color: data.substanceRisk === 'Moderate' ? 'orange' : data.substanceRisk === 'High' ? 'red' : '' }">
            {{ data.substanceRisk }}
          </span>
        </template>
      </Column>
      <Column header="Sedative" field="substanceRisk" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          <span :style="{ color: data.substanceRisk === 'Moderate' ? 'orange' : data.substanceRisk === 'High' ? 'red' : '' }">
            {{ data.substanceRisk }}
          </span>
        </template>
      </Column>
      <Column header="Hallucinate" field="substanceRisk" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          <span :style="{ color: data.substanceRisk === 'Moderate' ? 'orange' : data.substanceRisk === 'High' ? 'red' : '' }">
            {{ data.substanceRisk }}
          </span>
        </template>
      </Column>
      <Column header="Opioids" field="substanceRisk" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          <span :style="{ color: data.substanceRisk === 'Moderate' ? 'orange' : data.substanceRisk === 'High' ? 'red' : '' }">
            {{ data.substanceRisk }}
          </span>
        </template>
      </Column>
      <Column header="Others" field="substanceRisk" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          <span :style="{ color: data.substanceRisk === 'Moderate' ? 'orange' : data.substanceRisk === 'High' ? 'red' : '' }">
            {{ data.substanceRisk }}
          </span>
        </template>
      </Column>

      <!-- Additional Headers -->
      <Column header="Year" field="year" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.year }}
        </template>
      </Column>
      <Column header="Gender" field="gender" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.gender }}
        </template>
      </Column>
      <Column header="Dzongkha" field="dzongkha" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.dzongkha }}
        </template>
      </Column>
      <Column header="Location" field="location" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.location }}
        </template>
      </Column>
      <Column header="Age" field="age" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.age }}
        </template>
      </Column>
      <Column header="Class" field="class" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.class }}
        </template>
      </Column>
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
    { id: 1, depression: 'Mild', anxiety: 'Moderate', ace: 'High', suicidalBehaviours: 'Low', lifetimeUse: 'No', currentUse: 'Yes', substanceWise: 'Alcohol',substanceRisk: 'Moderate', year: '2022', gender: 'Male', dzongkha: 'Yes', location: 'Agency 1', age: '30', class: '10', employmentHistory: 'Working' },
    { id: 2, depression: 'Moderate', anxiety: 'Mild', ace: 'Low', suicidalBehaviours: 'Moderate', lifetimeUse: 'Yes', currentUse: 'No', substanceWise: 'Tobacco',substanceRisk: 'High', year: '2023', gender: 'Female', dzongkha: 'No', location: 'Agency 2', age: '25', class: '12', employmentHistory: 'Not working' },
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
