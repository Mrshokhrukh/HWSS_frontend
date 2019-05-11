<template>
  <div class="card l">
    <DataTable v-model:filters="filters" :value="filteredData" paginator showGridlines :rows="10" dataKey="id" filterDisplay="row" :loading="loading"
    sortField="substanceRisk" :sortOrder="1"
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

        <!-- Additional Headers -->
     
        <Column header="Date" field="date" :showFilterMenu="false" style="min-width: 10rem" :sortable="true">
        <template #body="{ data }">
          {{ data.date }}
        </template>
      </Column>
      <Column header="Gender" field="sex" :showFilterMenu="false" style="min-width: 10rem" :sortable="true">
        <template #body="{ data }">
          {{ data.sex }}
        </template>
      </Column>
      <Column header="Dzongkha" field="present_dzongkhag" :showFilterMenu="false" style="min-width: 10rem" :sortable="true">
        <template #body="{ data }">
          {{ data.present_dzongkhag }}
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
      <Column header="Employment History" field="employmentHistory" :showFilterMenu="false" style="min-width: 14rem" :sortable="true">
        <template #body="{ data }">
          {{ data.employmentHistory }}
        </template>
      </Column>      
      <!-- Lifetime Use -->
      <Column header="Lifetime Use" field="lifetimeUse" :showFilterMenu="false" style="min-width: 14rem" :sortable="true">
        <template #body="{ data }">
          {{ data.lifetimeUse }}
        </template>
      </Column>
      <!-- Current Use -->
      <Column header="Current Use" field="currentUse" :showFilterMenu="false" style="min-width: 14rem" :sortable="true">
        <template #body="{ data }">
          {{ data.currentUse }}
        </template>
      </Column>
      
      <!-- Substance -->
      <Column field="alcoholic_measurement" header="Alcoholic measurement" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.alcoholic_measurement" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.alcoholic_measurement)"
              :style="{ color: getSeverity(slotProps.data.alcoholic_measurement).colorCode, backgroundColor: getSeverity(slotProps.data.alcoholic_measurement).bgColor }" />
          </template>
      </Column>
        
      <Column field="tobacco_measurement" header="Tobacco Measurement" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.tobacco_measurement" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.tobacco_measurement)"
              :style="{ color: getSeverity(slotProps.data.tobacco_measurement).colorCode, backgroundColor: getSeverity(slotProps.data.tobacco_measurement).bgColor }" />
          </template>
      </Column>
      <Column field="cannabis_measurement" header="Cannabis Measurement" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.cannabis_measurement" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.cannabis_measurement)"
              :style="{ color: getSeverity(slotProps.data.cannabis_measurement).colorCode, backgroundColor: getSeverity(slotProps.data.cannabis_measurement).bgColor }" />
          </template>
      </Column>
      <Column field="amphetamine_measurement" header="Amphetamine Measurement" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.amphetamine_measurement" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.amphetamine_measurement)"
              :style="{ color: getSeverity(slotProps.data.amphetamine_measurement).colorCode, backgroundColor: getSeverity(slotProps.data.amphetamine_measurement).bgColor }" />
          </template>
      </Column>
      <Column field="inhalants_measurement" header="Amphetamine Measurement" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.inhalants_measurement" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.inhalants_measurement)"
              :style="{ color: getSeverity(slotProps.data.inhalants_measurement).colorCode, backgroundColor: getSeverity(slotProps.data.inhalants_measurement).bgColor }" />
          </template>
      </Column>
      <Column field="sedatives_measurement" header="Sedatives Measurement" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.sedatives_measurement" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.sedatives_measurement)"
              :style="{ color: getSeverity(slotProps.data.sedatives_measurement).colorCode, backgroundColor: getSeverity(slotProps.data.sedatives_measurement).bgColor }" />
          </template>
      </Column>
      <Column field="hallucinogens_measurement" header="Hallucinogens Measurement" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.hallucinogens_measurement" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.hallucinogens_measurement)"
              :style="{ color: getSeverity(slotProps.data.hallucinogens_measurement).colorCode, backgroundColor: getSeverity(slotProps.data.hallucinogens_measurement).bgColor }" />
          </template>
      </Column>
      <Column field="opioids_measurement" header="Opioids Measurement" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.opioids_measurement" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.opioids_measurement)"
              :style="{ color: getSeverity(slotProps.data.opioids_measurement).colorCode, backgroundColor: getSeverity(slotProps.data.opioids_measurement).bgColor }" />
          </template>
      </Column>
      <Column field="injection_measurement" header="Injection Measurement" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.injection_measurement" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.injection_measurement)"
              :style="{ color: getSeverity(slotProps.data.injection_measurement).colorCode, backgroundColor: getSeverity(slotProps.data.injection_measurement).bgColor }" />
          </template>
      </Column>
      <Column field="other_measurement" header="Other Measurement" sortable class="text-center">
          <template #body="slotProps">
            <Tag rounded :value="slotProps.data.other_measurement" class="w-100 text-capitalize"
              :severity="getSeverity(slotProps.data.other_measurement)"
              :style="{ color: getSeverity(slotProps.data.other_measurement).colorCode, backgroundColor: getSeverity(slotProps.data.other_measurement).bgColor }" />
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
import axios from 'axios';
import endpoints from '@/api';
// import Badge from 'primevue/badge';

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

// const loading = ref(true);

const filteredData = computed(() => {
  let filtered = reportData.value;
  // Apply filters based on the selected values
  for (const key in filters.value) {
    if (filters.value[key].value.length > 0) {
      filtered = filtered.filter(item => filters.value[key].value.includes(item[key]));
    }
  }
  return filtered;
});

const reportData = ref([]);

const fetchReportData = async () => {
  try {
    const response = await axios.get(endpoints.generateReport);
    if (response.data && Array.isArray(response.data)) {
      reportData.value = response.data;
      // filteredData.value = response.data;
    } else {
      handleFetchError();
    }
  } catch (error) {
    handleFetchError();
  }
};

const handleFetchError = () => {
  reportData.value = [];
  // Handle error
};

onMounted(() => {
  fetchReportData();
});


const getSeverity = (severity) => {
  let colorCode;
  let bgColor;
  switch (severity.toLowerCase()) {
    case 'severe':
    case 'high risk':
    case 'nearly everyday':
      colorCode = 'rgba(230, 20, 45, 0.75)'; // Wine Red
      bgColor = 'rgba(230, 20, 45, 0.25)';
      break;
    case 'moderately-severe':
      colorCode = 'rgba(255, 69, 0, 0.75)'; // Red-Orange
      bgColor = 'rgba(255, 69, 0, 0.25)';
      break;
    case 'moderate risk':
    case 'moderate':
    case 'more than half the days':
      colorCode = 'rgba(255, 165, 0, 0.75)'; // Orange
      bgColor = 'rgba(255, 165, 0, 0.25)';
      break;
    case 'minimal':
    case 'low risk':
    case 'several days':

      colorCode = 'rgba(0, 100, 0, 0.75)'; // Darker Green (More towards Blue)
      bgColor = 'rgba(0, 100, 0, 0.25)';
      break;
    default:
      colorCode = 'rgba(52, 52, 52, 0.75)'; // Slate Grey
      bgColor = 'rgba(52, 52, 52, 0.25)';
  }
  return { severity, colorCode, bgColor };
};


// Function to clear filters
const clearFilter = () => {
  for (const key in filters.value) {
    filters.value[key].value = [];
  }
};
</script>
<style scope>
.gray{
  color: antiquewhite;
}
</style>