<template>
  <div class="card">
    <DataTable :value="tableData" tableStyle="min-width: 50rem" class="edged-table">
      <ColumnGroup type="header">
        <Row>
          <Column header="Case Status Summary" :colspan="4" class="main-header" />
        </Row>
        <Row>
          <Column header="Total Cases" headerStyle="width: 25%" />
          <Column header="Ongoing Cases" headerStyle="width: 25%" />
          <Column header="Discontinued Cases" headerStyle="width: 25%" />
          <Column header="Closed Cases" headerStyle="width: 25%" />
        </Row>
      </ColumnGroup>
      <Column field="totalCases">
        <template #body="slotProps">
          {{ slotProps.data.totalCases }}
        </template>
      </Column>
      <Column field="ongoingCase">
        <template #body="slotProps">
          <div class="case-cell">
            <span class="case-number">{{ slotProps.data.ongoingCase }}</span>
            <span class="case-percentage">({{ calculatePercentage(slotProps.data.ongoingCase, slotProps.data.totalCases)
              }}%)</span>
          </div>
        </template>
      </Column>
      <Column field="discontinuedCases">
        <template #body="slotProps">
          <div class="case-cell">
            <span class="case-number">{{ slotProps.data.discontinuedCases }}</span>
            <span class="case-percentage">({{ calculatePercentage(slotProps.data.discontinuedCases,
              slotProps.data.totalCases) }}%)</span>
          </div>
        </template>
      </Column>
      <Column field="closedCases">
        <template #body="slotProps">
          <div class="case-cell">
            <span class="case-number">{{ slotProps.data.closedCases }}</span>
            <span class="case-percentage">({{ calculatePercentage(slotProps.data.closedCases, slotProps.data.totalCases)
              }}%)</span>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Row from 'primevue/row';

const props = defineProps({
  filteredData: {
    type: Array,
    required: true,
    default: () => []
  }
});

// // Add watcher to debug incoming data
// watch(() => props.filteredData, (newData) => {
//   console.log('Filtered Data:', newData);
//   console.log('Case Statuses:', newData.map(item => item.case_status));
// }, { immediate: true });

// Safe array access function
const safeFilteredData = computed(() => {
  return props.filteredData || [];
});

// Computed properties for counts
const ongoingCaseCount = computed(() => {
  const count = safeFilteredData.value.filter(item => item?.case_status === 'On Going').length || 0;
  return count;
});

const caseDiscontinueCount = computed(() => {
  const count = safeFilteredData.value.filter(item => item?.case_status === 'Case Discontinued').length || 0;
  return count;
});

const caseClosedCount = computed(() => {
  const count = safeFilteredData.value.filter(item => item?.case_status === 'Case Closed').length || 0;
  return count;
});

const totalCases = computed(() => {
  const count = safeFilteredData.value.length || 0;
  return count;
});

// Calculate percentage helper function
const calculatePercentage = (value, total) => {
  if (!value || !total || total === 0) return '0.0';
  return ((value / total) * 100).toFixed(1);
};

// Aggregate data for DataTable
const aggregateData = computed(() => ({
  totalCases: totalCases.value,
  ongoingCase: ongoingCaseCount.value,
  discontinuedCases: caseDiscontinueCount.value,
  closedCases: caseClosedCount.value
}));

// Wrap aggregateData in an array for DataTable
const tableData = computed(() => [aggregateData.value]);
</script>


<style scoped>
.card {
  margin: 1.5rem 0;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.edged-table) {
  border-collapse: collapse;
  width: 100%;
  border: 1px solid #e0e0e0;
}

:deep(.edged-table th),
:deep(.edged-table td) {
  border: 1px solid #e0e0e0;
  padding: 12px;
}

:deep(.p-datatable-thead > tr > th) {
  background-color: #2C6975;
  color: white;
  font-weight: 600;
  text-align: center;
  text-transform: uppercase;
  font-size: 0.9rem;
  padding: 1rem;
}

:deep(.p-datatable-tbody > tr > td) {
  text-align: center;
  font-size: 1.1rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

:deep(.main-header) {
  text-align: center !important;
  font-size: 1.3rem;
  background-color: #2C6975 !important;
  padding: 1.2rem !important;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.case-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.case-number {
  font-weight: 600;
  color: #2C6975;
}

.case-percentage {
  font-size: 0.9rem;
  color: #666;
}

:deep(.p-datatable-tbody > tr:hover > td) {
  background-color: #f0f0f0;
}

:deep(.p-row-odd > td) {
  background-color: #fafafa;
}
</style>