<template>
  <div class="p-grid">
    <div class="p-col">
      <h3 class="text-center fw-bold my-2 hwss-primary">Screening Data</h3>
      <div class="container-fluid">
        <div class="row">
          <div class="col-6 p-4 mx-auto">
            <h5 class="text-center fw-bold hwss-primary">Total Screened</h5>
            <DataTable :value="table1Data" :paginator="false" class="p-datatable-sm card h-100" resizableColumns
              strippedTable columnResizeMode="expand">
              <Column field="header" header=""
                :headerStyle="{ 'background-color': '#2c6975', 'color': 'white', 'font-weight': 'bold', }">
              </Column>
              <Column field="male" header="Male"
                :headerStyle="{ 'background-color': '#2c6975', 'color': 'white', 'font-weight': 'bold', }">
              </Column>
              <Column field="female" header="Female"
                :headerStyle="{ 'background-color': '#2c6975', 'color': 'white', 'font-weight': 'bold' }">
              </Column>
            </DataTable>
          </div>

          <div class="col-6 p-4 mx-auto">
            <h5 class="text-center fw-bold hwss-primary">Weekly Screened</h5>
            <DataTable :value="table2Data" :paginator="false" class="p-datatable-sm card h-100" resizableColumns
              columnResizeMode="expand">
              <Column field="header" header=""
                :headerStyle="{ 'background-color': '#2c6975', 'color': 'white', 'font-weight': 'bold', }">
              </Column>
              <Column field="male" header="Male"
                :headerStyle="{ 'background-color': '#2c6975', 'color': 'white', 'font-weight': 'bold', }">
              </Column>
              <Column field="female" header="Female"
                :headerStyle="{ 'background-color': '#2c6975', 'color': 'white', 'font-weight': 'bold', }">
              </Column>
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const reportData = ref(JSON.parse(sessionStorage.getItem('reportData')) || []);

const Malefilter = ref([]);
const Femalefilter = ref([]);
const total_male = ref(0);
const total_female = ref(0);

// Filter data when component is mounted
onMounted(() => {
  // Filtering clustered data
  Malefilter.value = reportData.value.filter(
    (item) => item.user?.fields?.gender === 'Male'
  );
  total_male.value = Malefilter.value.length;

  Femalefilter.value = reportData.value.filter(
    (item) => item.user?.fields?.gender === 'Female'
  );
  total_female.value = Femalefilter.value.length;
});

const table1Data = ref([
  { header: 'Total New Entry', male: total_male.value, female: total_female.value },
  { header: 'Total Old Entry', male: 0, female: 0 },
  { header: 'Total Screened', male: 0, female: 0 },
]);

const table2Data = ref([
  { header: 'Total New Entry', male: 0, female: 0 },
  { header: 'Total Old Entry', male: 0, female: 0 },
  { header: 'Total Screened', male: 0, female: 0 },
]);

// Watch for changes in total_male and total_female to update table data
watch([total_male, total_female], () => {
  table1Data.value[0].male = total_male.value;
  table1Data.value[0].female = total_female.value;

  // Calculate total screened for males and females in Table 1
  table1Data.value[2].male = table1Data.value[0].male + table1Data.value[1].male;
  table1Data.value[2].female = table1Data.value[0].female + table1Data.value[1].female;

  // Update table data to trigger reactivity
  table1Data.value = [...table1Data.value];
  table2Data.value = [...table2Data.value];
});
</script>