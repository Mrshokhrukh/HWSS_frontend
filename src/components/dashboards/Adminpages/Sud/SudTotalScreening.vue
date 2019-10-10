<template>
  <div class="screening-data-container">
    <h2 class="main-title">Screening Data</h2>
    <div class="cards-container">
      <div class="data-card total-screened">
        <h3 class="card-title">Total Screened</h3>
        <DataTable :value="table1Data" :paginator="false" class="custom-datatable" resizableColumns columnResizeMode="expand">
          <Column field="header" header=""></Column>
          <Column field="male" header="Male"></Column>
          <Column field="female" header="Female"></Column>
        </DataTable>
      </div>
      <div class="data-card weekly-screened">
        <h3 class="card-title">Weekly Screened</h3>
        <DataTable :value="table2Data" :paginator="false" class="custom-datatable" resizableColumns columnResizeMode="expand">
          <Column field="header" header=""></Column>
          <Column field="male" header="Male"></Column>
          <Column field="female" header="Female"></Column>
        </DataTable>
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

onMounted(() => {
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

watch([total_male, total_female], () => {
  table1Data.value[0].male = total_male.value;
  table1Data.value[0].female = total_female.value;

  table1Data.value[2].male = table1Data.value[0].male + table1Data.value[1].male;
  table1Data.value[2].female = table1Data.value[0].female + table1Data.value[1].female;

  table1Data.value = [...table1Data.value];
  table2Data.value = [...table2Data.value];
});
</script>

<style scoped>
.screening-data-container {
  font-family: 'Arial', sans-serif;
  padding: 2rem;
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.main-title {
  color: #fff;
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.cards-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 2rem;
}

.data-card {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 10px;
  padding: 1.5rem;
  flex: 1;
  min-width: 300px;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.card-title {
  color: #2c6975;
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.custom-datatable {
  background: transparent !important;
  border: none !important;
}

:deep(.p-datatable-wrapper) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.p-datatable-table) {
  border-collapse: separate;
  border-spacing: 0;
}

:deep(.p-datatable-thead > tr > th) {
  background-color: #2c6975 !important;
  color: white !important;
  font-weight: bold !important;
  padding: 1rem;
  text-align: center;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

:deep(.p-datatable-tbody > tr:nth-child(even)) {
  background-color: rgba(255, 255, 255, 0.5);
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: rgba(44, 105, 117, 0.1);
}
</style>