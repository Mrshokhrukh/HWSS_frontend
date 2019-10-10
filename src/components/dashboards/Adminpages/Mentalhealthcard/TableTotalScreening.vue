<template>
  <div class="screening-container">
    <h3 class="screening-title">Screening Data</h3>
    <div class="screening-tables">
      <div class="screening-table">
        <h5 class="table-title">Total Screened</h5>
        <DataTable :value="table1Data" :paginator="false" class="p-datatable-sm" resizableColumns
          columnResizeMode="expand" :scrollable="true" scrollHeight="400px">
          <Column field="header" header="" :headerStyle="headerStyle" :bodyStyle="bodyStyle"></Column>
          <Column field="male" header="Male" :headerStyle="headerStyle" :bodyStyle="bodyStyle"></Column>
          <Column field="female" header="Female" :headerStyle="headerStyle" :bodyStyle="bodyStyle"></Column>
        </DataTable>
      </div>
      <div class="screening-table">
        <h5 class="table-title">Weekly Screened</h5>
        <DataTable :value="table2Data" :paginator="false" class="p-datatable-sm" resizableColumns
          columnResizeMode="expand" :scrollable="true" scrollHeight="400px">
          <Column field="header" header="" :headerStyle="headerStyle" :bodyStyle="bodyStyle"></Column>
          <Column field="male" header="Male" :headerStyle="headerStyle" :bodyStyle="bodyStyle"></Column>
          <Column field="female" header="Female" :headerStyle="headerStyle" :bodyStyle="bodyStyle"></Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
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

const headerStyle = computed(() => ({
  'background-color': '#2B656F',
  'color': 'white',
  'font-weight': 'bold',
  'text-align': 'center',
  'padding': '1rem'
}));

const bodyStyle = computed(() => ({
  'text-align': 'center',
  'padding': '0.75rem'
}));
</script>

<style scoped>
.screening-container {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.screening-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2B656F;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.screening-tables {
  display: flex;
  gap: 2rem;
  justify-content: space-between;
}

.screening-table {
  flex: 1;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.screening-table:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.table-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2B656F;
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  color: white;
}

:deep(.p-datatable) {
  border-radius: 0 0 15px 15px;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #2B656F;
  color: white;
}

:deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
  background-color: #f8f9fa;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #e9ecef;
}

@media (max-width: 768px) {
  .screening-tables {
    flex-direction: column;
  }
}
</style>