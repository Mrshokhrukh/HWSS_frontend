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
      <Column header="rescreening_count" field="rescreening_count" :showFilterMenu="false" style="min-width: 10rem"
        :sortable="true" class="text-center">
        <template #body="{ data }">
          {{ data.rescreening_count }}
        </template>
      </Column>
      <Column header="counseling" field="counseling" :showFilterMenu="false" style="min-width: 10rem" :sortable="true"
        class="text-center">
        <template #body="{ data }">
          {{ data.counseling }}
        </template>
      </Column>
      <Column header="Assessment status" field="assessment_status" :showFilterMenu="false" style="min-width: 10rem"
        :sortable="true" class="text-center">
        <template #body="{ data }">
          {{ data.assessment_status }}
        </template>
      </Column>
      <Column header="follow_up status" field="follow_up" :showFilterMenu="false" style="min-width: 10rem"
        :sortable="true" class="text-center">
        <template #body="{ data }">
          {{ data.follow_up }}
        </template>
      </Column>
      <Column header="referral status" field="referral_status" :showFilterMenu="false" style="min-width: 10rem"
        :sortable="true" class="text-center">
        <template #body="{ data }">
          {{ data.referral_status }}
        </template>
      </Column>

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
      <Column header="Dzongkha" field="present_dzongkhag" :showFilterMenu="false" style="min-width: 10rem"
        :sortable="true">
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
      <Column header="Employment History" field="employmentHistory" :showFilterMenu="false" style="min-width: 14rem"
        :sortable="true">
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

const reportData = ref(JSON.parse(sessionStorage.getItem('reportData')) || []);



// Function to clear filters
const clearFilter = () => {
  for (const key in filters.value) {
    filters.value[key].value = [];
  }
};

// Computed property to filter and map reportData for DataTable
const filteredData = computed(() => {
  // Check if reportData has been fetched and contains data
  if (!reportData.value || !reportData.value.length) {
    console.log('reportData is empty or undefined');
    return [];
  }

  // Map reportData to include only the required fields
  const transformedData = reportData.value.map(item => {

    // Extract nested data
    const user = item.user?.fields || {};
    const serviceAndTreatment = item.service_and_treatment || {};
    const measurementAssist = item.measurement_assist?.fields || {};

    // Create a new object with the included fields
    const transformedItem = {
      rescreening_count: serviceAndTreatment?.rescreening_data?.rescreening_count || 'NA',
      counseling: serviceAndTreatment?.counseling || 'NA',
      assessment_status: serviceAndTreatment?.assessment_status || 'NA',
      follow_up: serviceAndTreatment?.follow_up || 'NA',
      referral_status: item.referral_status || 'NA',
      date: serviceAndTreatment?.date || 'NA',
      sex: user.gender || 'NA',
      present_dzongkhag: user.perm_add_dzongkhag || 'NA',
      age: calculateAge(user.date_of_birth) || 'NA',
      user_class: item.user_agency?.fields?.user_class || 'NA',
      employmentHistory: user.employmentHistory || 'NA',
    };


    return transformedItem;
  });
  return transformedData;
});

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

</script>

<style scope></style>