<template>
  <div class="card l">
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
          {{ data.dzongkha }}
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
      <Column header="Employment History" field="employmentHistory" :showFilterMenu="false" style="min-width: 14rem"
        :sortable="true">
        <template #body="{ data }">
          {{ data.employmentHistory }}
        </template>
      </Column>
      <!-- Lifetime Use -->
      <Column header="Lifetime Use" field="lifetimeUse" :showFilterMenu="false" style="min-width: 14rem"
        :sortable="true">
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
  dzongkhag: { value: [], matchMode: FilterMatchMode.IN },
  location: { value: [], matchMode: FilterMatchMode.IN },
  age: { value: [], matchMode: FilterMatchMode.IN },
  class: { value: [], matchMode: FilterMatchMode.IN },
  employmentHistory: { value: [], matchMode: FilterMatchMode.IN },
});

// const loading = ref(true);

const reportData = ref(JSON.parse(sessionStorage.getItem('reportData')) || []);

// Computed property to filter reportData based on case_status and transform data
const filteredData = computed(() => {
  // Check if reportData has been fetched and contains data
  if (!reportData.value || !reportData.value.length) {
    console.log('reportData is empty or undefined');
    return [];
  }

  // Map reportData to extract required fields
  const transformedData = reportData.value.map(item => {
    // Initialize variables to store data
    let date = 'NA';
    let gender = 'NA';
    let dzongkha = 'NA';
    let age = 'NA';
    let user_class = 'NA';
    let employmentHistory = 'NA';
    let alcoholic_measurement = 'NA';
    let tobacco_measurement = 'NA';
    let cannabis_measurement = 'NA';
    let amphetamine_measurement = 'NA';
    let inhalants_measurement = 'NA';
    let sedatives_measurement = 'NA';
    let hallucinogens_measurement = 'NA';
    let opioids_measurement = 'NA';
    let injection_measurement = 'NA';
    let other_measurement = 'NA';

    // Check for user data
    if (item.user?.fields) {
      gender = item.user.fields.gender || 'NA';
      dzongkha = item.user.fields.perm_add_dzongkhag || 'NA';
      age = calculateAge(item.user.fields.date_of_birth) || 'NA';
      employmentHistory = item.user.fields.role || 'NA';
    }

    // Check for user agency data
    if (item.user_agency?.fields) {
      user_class = item.user_agency.fields.user_class || 'NA';
    }

    // Check for measurement_assist data
    if (item.measurement_assist?.fields) {
      // Format date from ISO 8601 to YYYY-MM-DD
      if (item.measurement_assist.fields.created_at) {
        const isoDate = new Date(item.measurement_assist.fields.created_at);
        date = isoDate.toISOString().split('T')[0];
      }
      alcoholic_measurement = item.measurement_assist.fields.alcoholic_measurement || 'NA';
      tobacco_measurement = item.measurement_assist.fields.tobacco_measurement || 'NA';
      cannabis_measurement = item.measurement_assist.fields.cannabis_measurement || 'NA';
      amphetamine_measurement = item.measurement_assist.fields.amphetamine_measurement || 'NA';
      inhalants_measurement = item.measurement_assist.fields.inhalants_measurement || 'NA';
      sedatives_measurement = item.measurement_assist.fields.sedatives_measurement || 'NA';
      hallucinogens_measurement = item.measurement_assist.fields.hallucinogens_measurement || 'NA';
      opioids_measurement = item.measurement_assist.fields.opioids_measurement || 'NA';
      injection_measurement = item.measurement_assist.fields.injection_measurement || 'NA';
      other_measurement = item.measurement_assist.fields.other_measurement || 'NA';
    }
    // Check for rescreening_data and use if available
    else if (item.service_and_treatment?.rescreening_data) {
      alcoholic_measurement = item.service_and_treatment.rescreening_data.alcoholic_measurement || 'NA';
      tobacco_measurement = item.service_and_treatment.rescreening_data.tobacco_measurement || 'NA';
      cannabis_measurement = item.service_and_treatment.rescreening_data.cannabis_measurement || 'NA';
      amphetamine_measurement = item.service_and_treatment.rescreening_data.amphetamine_measurement || 'NA';
      inhalants_measurement = item.service_and_treatment.rescreening_data.inhalants_measurement || 'NA';
      sedatives_measurement = item.service_and_treatment.rescreening_data.sedatives_measurement || 'NA';
      hallucinogens_measurement = item.service_and_treatment.rescreening_data.hallucinogens_measurement || 'NA';
      opioids_measurement = item.service_and_treatment.rescreening_data.opioids_measurement || 'NA';
      injection_measurement = item.service_and_treatment.rescreening_data.injection_measurement || 'NA';
      other_measurement = item.service_and_treatment.rescreening_data.other_measurement || 'NA';
    }
    // Check for case_based_submissions and use if available
    else if (item.case_based_submissions) {
      alcoholic_measurement = item.case_based_submissions.alcoholic_measurement || 'NA';
      tobacco_measurement = item.case_based_submissions.tobacco_measurement || 'NA';
      cannabis_measurement = item.case_based_submissions.cannabis_measurement || 'NA';
      amphetamine_measurement = item.case_based_submissions.amphetamine_measurement || 'NA';
      inhalants_measurement = item.case_based_submissions.inhalants_measurement || 'NA';
      sedatives_measurement = item.case_based_submissions.sedatives_measurement || 'NA';
      hallucinogens_measurement = item.case_based_submissions.hallucinogens_measurement || 'NA';
      opioids_measurement = item.case_based_submissions.opioids_measurement || 'NA';
      injection_measurement = item.case_based_submissions.injection_measurement || 'NA';
      other_measurement = item.case_based_submissions.other_measurement || 'NA';
    }
    // Check for event_based_submissions and use if available
    else if (item.event_based_submissions) {
      alcoholic_measurement = item.event_based_submissions.alcoholic_measurement || 'NA';
      tobacco_measurement = item.event_based_submissions.tobacco_measurement || 'NA';
      cannabis_measurement = item.event_based_submissions.cannabis_measurement || 'NA';
      amphetamine_measurement = item.event_based_submissions.amphetamine_measurement || 'NA';
      inhalants_measurement = item.event_based_submissions.inhalants_measurement || 'NA';
      sedatives_measurement = item.event_based_submissions.sedatives_measurement || 'NA';
      hallucinogens_measurement = item.event_based_submissions.hallucinogens_measurement || 'NA';
      opioids_measurement = item.event_based_submissions.opioids_measurement || 'NA';
      injection_measurement = item.event_based_submissions.injection_measurement || 'NA';
      other_measurement = item.event_based_submissions.other_measurement || 'NA';
    }

    // Return transformed item
    return {
      date,
      gender,
      dzongkha,
      age,
      user_class,
      employmentHistory,
      alcoholic_measurement,
      tobacco_measurement,
      cannabis_measurement,
      amphetamine_measurement,
      inhalants_measurement,
      sedatives_measurement,
      hallucinogens_measurement,
      opioids_measurement,
      injection_measurement,
      other_measurement
    };
  });

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
.gray {
  color: antiquewhite;
}
</style>