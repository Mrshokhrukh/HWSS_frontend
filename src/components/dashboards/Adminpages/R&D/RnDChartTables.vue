<template>
  <div>
    <div class="card">
      <h5>School/Event Data</h5>
      <DataTable :value="tableData" :rowStyleClass="getRowClass">
        <Column field="schoolEvent" header="School/Event"></Column>
        <Column field="individualsScreened" header="No. of Individuals Screened"></Column>
        <Column field="suicidalBehavior" header="Suicidal Behavior"></Column>
        <Column field="severity" header="Severity (None, Mild, Moderate, Moderately Severe, Severe)"></Column>
        <Column field="sudSeverity" header="SUD Severity (None, Mild, Moderate, Severe)"></Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DataTable from 'primevue/datatable';

const tableData = ref([
  {
    schoolEvent: 'School A',
    individualsScreened: 50,
    suicidalBehavior: 5,
    severity: '10, 5, 20, 10, 5',
    sudSeverity: '2, 8, 12, 18'
  },
  {
    schoolEvent: 'Event A',
    individualsScreened: 30,
    suicidalBehavior: 3,
    severity: '5, 10, 15, 20, 25',
    sudSeverity: '1, 3, 7, 19'
  }
]);

const getRowClass = (rowData, rowIndex) => {
  return 'table-row-border'; // Add a CSS class for row border
};
</script>

<style scoped>
.card {
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
}

.table-row-border {
  border-bottom: 1px solid #ccc;
  /* Example: Adds a bottom border to each row */
}
</style>
