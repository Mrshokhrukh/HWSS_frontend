<template>
  <div class="card">
    <DataTable :value="tableData" tableStyle="min-width: 50rem" class="edged-table">
      <ColumnGroup type="header">
        <Row>
          <Column header="Case Status" :colspan="3" class="main-header" />
        </Row>
        <Row>
          <Column header="Ongoing Case" />
          <Column header="DISCONTINUED CASES" />
          <Column header="CLOSED CASES" />
        </Row>
      </ColumnGroup>
      <Column field="ongoingCase">
        <template #body="slotProps">
          {{ slotProps.data.ongoingCase }}
        </template>
      </Column>
      <Column field="discontinuedCases">
        <template #body="slotProps">
          {{ slotProps.data.discontinuedCases }}
        </template>
      </Column>
      <Column field="closedCases">
        <template #body="slotProps">
          {{ slotProps.data.closedCases }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { computed, inject, } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Row from 'primevue/row';

const reportData = inject('filteredData');

// Computed properties for counts
const ongoingCaseCount = computed(() => reportData.value.filter(item => item.service_and_treatment?.case_status === 'On Going').length);
const caseDiscontinueCount = computed(() => reportData.value.filter(item => item.service_and_treatment?.case_status === 'Case Discontinue').length);
const caseClosedCount = computed(() => reportData.value.filter(item => item.service_and_treatment?.case_status === 'Case Closed').length);

// Aggregate data for DataTable
const aggregateData = computed(() => ({
  ongoingCase: ongoingCaseCount.value,
  discontinuedCases: caseDiscontinueCount.value,
  closedCases: caseClosedCount.value
}));

// Wrap aggregateData in an array for DataTable
const tableData = computed(() => [aggregateData.value]);

console.log('tableData', tableData.value);
</script>

<style scoped>
.card {
  margin-top: 20px;
}

:deep(.edged-table) {
  border-collapse: collapse;
  width: 100%;
}

:deep(.edged-table th),
:deep(.edged-table td) {
  border: 1px solid #ddd;
  padding: 8px;
}

:deep(.p-datatable-thead > tr > th) {
  background-color:#2C6975
  ;
  color: white;
  font-weight: bold;
  text-align: center;
}

:deep(.p-datatable-tbody > tr > td) {
  text-align: center;
}

:deep(.main-header) {
  text-align: center !important;
  font-size: 1.2em;
  background-color:#2C6975
  !important;
}
</style>
