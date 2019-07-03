<template>
  <div class="card">
    <DataTable :value="processedReportData" :paginator="false" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]"
               paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
               currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
               responsiveLayout="scroll" class="gridlines">
      <Column field="status" header="Case Status" sortable></Column>
      <Column field="count" header="Count" sortable></Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps({
  reportData: {
    type: Array,
    required: true
  }
});

const processedReportData = computed(() => {
  const statusCounts = {
    'On Going': 0,
    'Case Closed': 0,
    'Case Discontinued': 0,
    'NA': 0 // Adding 'NA' for any missing case statuses
  };

  props.reportData.forEach(item => {
    const status = item.service_and_treatment?.case_status ?? 'NA';
    if (!statusCounts.hasOwnProperty(status)) {
      statusCounts[status] = 0;
    }
    statusCounts[status]++;
  });

  return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
});
</script>

<style scoped>
.card {
  background: #ffffff;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

/* Add gridlines */
.gridlines .p-datatable-thead > tr > th,
.gridlines .p-datatable-tbody > tr > td {
  border: 1px solid #dcdcdc;
}

.gridlines .p-datatable-thead > tr > th {
  border-bottom-width: 2px;
}

.gridlines .p-datatable-tbody > tr {
  border-bottom: 1px solid #dcdcdc;
}
</style>
