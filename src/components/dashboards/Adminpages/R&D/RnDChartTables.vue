<template>
  <div class="card">
    <h3 class="card-title">School/Event Data</h3>
    <DataTable :value="tableData" :rowHover="true" class="p-datatable-sm" responsiveLayout="scroll">
      <Column field="schoolEvent" header="Agency/Event" sortable></Column>
      <Column field="individualsScreened" header="Individuals Screened" sortable></Column>
      <Column field="suicidalBehavior" header="Suicidal Behavior"  sortable></Column>
      <ColumnGroup type="header">
        <Row>
          <Column header="School/Event Data" :colspan="1" :rowspan="2"/>
          <Column header="No. of Individuals Screened" :colspan="1" :rowspan="2"/>
          <Column header="Suicidal Behavior" :colspan="1" :rowspan="2"/>
          <Column header="PHQ" :colspan="5" headerClass="justify-content-center"/>
          <Column headerClass="justify-content-center" header="GAD" :colspan="5" bodyClass="text-center" />
          <Column header="SUD" headerClass="text-center" :rowspan="2"/>
        </Row>
        <Row>
          <div class="text-center">
            <Column v-for="level in severityLevels" :key="'phq-'+level" :header="level"/>
            <Column v-for="level in severityLevels" :key="'gad-'+level" :header="level"/>
          </div>
        </Row>
      </ColumnGroup>
      <Column v-for="level in severityLevels" :key="'phq-'+level" :field="'phq.'+level">
        <template #body="slotProps">
          <div class="text-center">{{ slotProps.data.phq[level] }}</div>
        </template>
      </Column>
      <Column v-for="level in severityLevels" :key="'gad-'+level" :field="'gad.'+level">
        <template #body="slotProps" >
          <div class="text-center"> {{ slotProps.data.gad[level] }}</div>
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <Button label="SUD Details" @click="showSUDDetails(slotProps.data)" />
        </template>
      </Column>
    </DataTable>
    <Dialog v-model:visible="displaySUDDialog" :header="selectedSchool + ' - SUD Details'" :style="{width: '80vw'}">
      <TabView>
        <TabPanel v-for="substance in substances" :key="substance" :header="substance">
          <DataTable :value="getSUDDetails(substance)" class="p-datatable-sm">
            <Column field="riskLevel" header="Risk Level"></Column>
            <Column field="count" header="Count"></Column>
          </DataTable>
        </TabPanel>
      </TabView>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Row from 'primevue/row';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

const severityLevels = ['Minimal', 'Mild', 'Moderate', 'Moderately Severe', 'Severe'];
const substances = [
  'Alcoholic', 'Tobacco', 'Cannabis', 'Cocaine', 'Amphetamine',
  'Inhalants', 'Sedatives', 'Hallucinogens', 'Opioids', 'Other'
];
const riskLevels = ['No Risk', 'Low Risk', 'Moderate Risk', 'High Risk'];

const displaySUDDialog = ref(false);
const selectedSchool = ref('');
const selectedSUDData = ref({});

const tableData = computed(() => {
  const schoolEvents = new Map();

  props.filteredData.forEach(item => {
    const schoolEvent = item.agency_name || 'Unknown';
    if (!schoolEvents.has(schoolEvent)) {
      schoolEvents.set(schoolEvent, {
        schoolEvent,
        individualsScreened: 0,
        suicidalBehavior: 0,
        phq: { Minimal: 0, Mild: 0, Moderate: 0, 'Moderately Severe': 0, Severe: 0 },
        gad: { Minimal: 0, Mild: 0, Moderate: 0, 'Moderately Severe': 0, Severe: 0 },
        sud: {}
      });
      substances.forEach(substance => {
        schoolEvents.get(schoolEvent).sud[substance.toLowerCase()] = { 'No Risk': 0, 'Low Risk': 0, 'Moderate Risk': 0, 'High Risk': 0 };
      });
    }

    const data = schoolEvents.get(schoolEvent);
    data.individualsScreened++;

    if (item.measurement?.fields?.suicidal_measurement === "nearly everyday") {
      data.suicidalBehavior++;
    }

    const phqMeasurement = item.measurement?.fields?.phq_measurement;
    if (phqMeasurement) {
      data.phq[capitalizeFirstLetter(phqMeasurement)]++;
    }

    const gadMeasurement = item.measurement?.fields?.gad_measurement;
    if (gadMeasurement) {
      data.gad[capitalizeFirstLetter(gadMeasurement)]++;
    }

    if (item.measurement_assist?.fields) {
      substances.forEach(substance => {
        const measurementKey = `${substance.toLowerCase()}_measurement`;
        const sudMeasurement = item.measurement_assist.fields[measurementKey];
        if (sudMeasurement) {
          const riskLevel = sudMeasurement === 'no risk' ? 'No Risk' :
                            sudMeasurement === 'low risk' ? 'Low Risk' :
                            sudMeasurement === 'moderate risk' ? 'Moderate Risk' :
                            sudMeasurement === 'high risk' ? 'High Risk' : null;
          if (riskLevel) {
            data.sud[substance.toLowerCase()][riskLevel]++;
          }
        }
      });
    }
  });

  return Array.from(schoolEvents.values());
});

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function showSUDDetails(data) {
  selectedSchool.value = data.schoolEvent;
  selectedSUDData.value = data.sud;
  displaySUDDialog.value = true;
}

function getSUDDetails(substance) {
  const substanceLower = substance.toLowerCase();
  return riskLevels.map(level => ({
    riskLevel: level,
    count: selectedSUDData.value[substanceLower][level] || 0
  }));
}
</script>

<style scoped>
.centered-header {
    text-align: center;
}

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
  border-collapse: collapse;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f5f5f5;
  color: #333;
  font-weight: bold;
  padding: 1rem;
  text-align: left;
  border: 1px solid #ddd;
}

:deep(.p-datatable .p-datatable-thead > tr > th.centered-header) {
  text-align: center;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  background-color: #ffffff;
  transition: background-color 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f0f0f0;
}

:deep(.p-datatable .p-datatable-tfoot > tr > td) {
  border: 1px solid #ddd;
}
</style>