<template>
  <div class="card">
    <DataTable :value="aggregateData" tableStyle="min-width: 50rem">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xl font-bold">Case Status</span>
        </div>
      </template>
      <Column field="field" header="Field"></Column>
      <Column header="Count">
        <template #body="slotProps">
          <span v-if="typeof slotProps.data.count"> {{ slotProps.data.count }}</span>
          <ul v-else>
            <li v-for="(item, index) in slotProps.data.count" :key="index">
              {{ item.key }}: {{ item.count }}
            </li>
          </ul>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const reportData = ref(JSON.parse(sessionStorage.getItem('reportData')) || []);

// Computed properties for counts
const OngoingCase_Count = computed(() => reportData.value.filter(item => item.service_and_treatment?.case_status === 'On Going').length);
const CaseDiscontinue_Count = computed(() => reportData.value.filter(item => item.service_and_treatment?.case_status === 'Case Discontinue').length);
const CaseClosed_Count = computed(() => reportData.value.filter(item => item.service_and_treatment?.case_status === 'Case Closed').length);

// Aggregate data for DataTable
const aggregateData = ref([
  { field: 'Ongoing Case', count: OngoingCase_Count.value },
  { field: 'DISCONTINUED CASES', count: CaseDiscontinue_Count.value },
  { field: 'CLOSED CASES', count: CaseClosed_Count.value }
]);
console.log('aggregateData', aggregateData.value)
</script>

<style scoped>
.card {
  margin-top: 20px;
}

.card table {
  width: 100%;
  border-collapse: collapse;
}

.card th,
.card td {
  border: 1px solid #000;
  padding: 8px;
  text-align: left;
}

.card th {
  background-color: hsl(107, 63%, 52%);
}

.card ul {
  list-style-type: none;
  padding: 0;
}

.card li {
  margin-bottom: 4px;
}
</style>
