<template>
  <div class="card">
    <h3 class="card-title">School/Event Data</h3>
    <DataTable :value="tableData" :rowHover="true" class="p-datatable-sm" responsiveLayout="scroll">
      <Column field="schoolEvent" header="School/Event" sortable></Column>
      <Column field="individualsScreened" header="Individuals Screened" sortable>
        <template #body="slotProps">
          {{ slotProps.data.individualsScreened }}
        </template>
      </Column>
      <Column field="suicidalBehavior" header="Suicidal Behavior" sortable>
        <template #body="slotProps">
          {{ slotProps.data.suicidalBehavior }}
        </template>
      </Column>
      <Column field="severity" header="Severity (PHQ-9)">
        <template #body="slotProps">
          <div class="severity-bars">
            <div v-for="(value, index) in slotProps.data.severity" :key="index" 
                 class="severity-bar" 
                 :style="{ width: `${value}%`, backgroundColor: getSeverityColor(index) }"
                 :title="`${getSeverityLabel(index)}: ${value}%`">
            </div>
          </div>
        </template>
      </Column>
      <Column field="sudSeverity" header="SUD Severity">
        <template #body="slotProps">
          <div class="severity-bars">
            <div v-for="(value, index) in slotProps.data.sudSeverity" :key="index" 
                 class="severity-bar" 
                 :style="{ width: `${value}%`, backgroundColor: getSUDSeverityColor(index) }"
                 :title="`${getSUDSeverityLabel(index)}: ${value}%`">
            </div>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

const tableData = computed(() => {
  const schoolEvents = new Map();

  props.filteredData.forEach(item => {
    const schoolEvent = item.agency_name || 'Unknown';
    if (!schoolEvents.has(schoolEvent)) {
      schoolEvents.set(schoolEvent, {
        schoolEvent,
        individualsScreened: 0,
        suicidalBehavior: 0,
        severity: [0, 0, 0, 0, 0],
        sudSeverity: [0, 0, 0, 0]
      });
    }

    const data = schoolEvents.get(schoolEvent);
    data.individualsScreened++;

    if (item.measurement?.fields?.suicidal_measurement === "nearly everyday") {
      data.suicidalBehavior++;
    }

    const phqMeasurement = item.measurement?.fields?.phq_measurement;
    if (phqMeasurement) {
      const index = ['minimal', 'mild', 'moderate', 'moderately severe', 'severe'].indexOf(phqMeasurement);
      if (index !== -1) data.severity[index]++;
    }

    const sudMeasurement = item.measurement_assist?.fields?.alcoholic_measurement;
    if (sudMeasurement) {
      const index = ['no risk', 'low risk', 'moderate risk', 'high risk'].indexOf(sudMeasurement);
      if (index !== -1) data.sudSeverity[index]++;
    }
  });

  return Array.from(schoolEvents.values()).map(item => ({
    ...item,
    severity: item.severity.map(v => (v / item.individualsScreened * 100).toFixed(1)),
    sudSeverity: item.sudSeverity.map(v => (v / item.individualsScreened * 100).toFixed(1))
  }));
});

const getSeverityColor = (index) => {
  const colors = ['#4caf50', '#8bc34a', '#ffc107', '#ff9800', '#f44336'];
  return colors[index];
};

const getSeverityLabel = (index) => {
  const labels = ['Minimal', 'Mild', 'Moderate', 'Moderately Severe', 'Severe'];
  return labels[index];
};

const getSUDSeverityColor = (index) => {
  const colors = ['#4caf50', '#8bc34a', '#ffc107', '#f44336'];
  return colors[index];
};

const getSUDSeverityLabel = (index) => {
  const labels = ['No Risk', 'Low Risk', 'Moderate Risk', 'High Risk'];
  return labels[index];
};
</script>

<style scoped>
.card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
  background-color: #ffffff;
}

.card-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

:deep(.p-datatable) {
  font-family: Arial, sans-serif;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f5f5f5;
  color: #333;
  font-weight: bold;
  padding: 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  background-color: #ffffff;
  transition: background-color 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f0f0f0;
}

.severity-bars {
  display: flex;
  height: 20px;
  border-radius: 4px;
  overflow: hidden;
}

.severity-bar {
  height: 100%;
  transition: width 0.3s ease;
}
</style>