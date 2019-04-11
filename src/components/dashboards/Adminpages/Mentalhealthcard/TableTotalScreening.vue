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
import { ref } from 'vue';

const table1Data = ref([
  { header: 'Total New Entry', male: 250, female: 320 },
  { header: 'Total Old Entry', male: 365, female: 215 },
  { header: 'Total Screened', male: 0, female: 0 },
]);

const table2Data = ref([
  { header: 'Total New Entry', male: 36, female: 28 },
  { header: 'Total Old Entry', male: 66, female: 16 },
  { header: 'Total Screened', male: 0, female: 0 },
]);

// Calculate total screened for males and females in Table 1
table1Data.value[2].male = table1Data.value[0].male + table1Data.value[1].male;
table1Data.value[2].female = table1Data.value[0].female + table1Data.value[1].female;

// Calculate total screened for males and females in Table 2
table2Data.value[2].male = table2Data.value[0].male + table2Data.value[1].male;
table2Data.value[2].female = table2Data.value[0].female + table2Data.value[1].female;
</script>
