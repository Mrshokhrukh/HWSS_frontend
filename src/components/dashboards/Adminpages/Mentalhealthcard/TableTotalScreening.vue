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
import { ref, computed, inject } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

// Inject the service and treatment data
const newServiceAndTreatment = inject('serviceAndTreatmentData', []);

// Helper function to check if screening data exists
const hasScreeningData = (item) => {
  return typeof item.screening_data === 'object' && item.screening_data?.id;
};

// Computed properties for gender counts
const genderCounts = computed(() => {
  if (!newServiceAndTreatment.value) return { male: 0, female: 0 };

  return newServiceAndTreatment.value.reduce((acc, item) => {
    // Only count if screening_data has an id
    if (hasScreeningData(item)) {
      const gender = item.user?.gender?.toLowerCase();
      if (gender === 'male') acc.male++;
      if (gender === 'female') acc.female++;
    }
    return acc;
  }, { male: 0, female: 0 });
});

// Computed property for weekly counts
const weeklyGenderCounts = computed(() => {
  if (!newServiceAndTreatment.value) return { male: 0, female: 0 };

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return newServiceAndTreatment.value.reduce((acc, item) => {
    const itemDate = new Date(item.date);

    // Only count if within date range AND has screening data
    if (!isNaN(itemDate) && itemDate >= oneWeekAgo && hasScreeningData(item)) {
      const gender = item.user?.gender?.toLowerCase();
      if (gender === 'male') acc.male++;
      if (gender === 'female') acc.female++;
    }
    return acc;
  }, { male: 0, female: 0 });
});

// Table data refs with computed values
const table1Data = computed(() => [
  {
    header: 'Total New Entry',
    male: genderCounts.value.male,
    female: genderCounts.value.female
  },
  {
    header: 'Total Old Entry',
    male: 0,
    female: 0
  },
  {
    header: 'Total Screened',
    male: genderCounts.value.male,
    female: genderCounts.value.female
  }
]);

const table2Data = computed(() => [
  {
    header: 'Total New Entry',
    male: weeklyGenderCounts.value.male,
    female: weeklyGenderCounts.value.female
  },
  {
    header: 'Total Old Entry',
    male: 0,
    female: 0
  },
  {
    header: 'Total Screened',
    male: weeklyGenderCounts.value.male,
    female: weeklyGenderCounts.value.female
  }
]);

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