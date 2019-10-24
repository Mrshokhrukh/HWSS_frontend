<template>
  <div class="border">
    <h3 class="card-title text-center">School/Event Data</h3>
    <DataTable :value="tableData" :rowHover="true" class="p-datatable-sm" responsiveLayout="scroll">
      <Column field="schoolEvent" header="Agency/Event" sortable></Column>
      <Column field="individualsScreened" header="Individuals Screened" bodyClass="text-center" sortable></Column>
      <Column field="suicidalBehavior" header="Suicidal Behavior" bodyClass="text-center" sortable></Column>
      <ColumnGroup type="header">
        <Row>
          <Column header="School/Event Data" :colspan="1" :rowspan="2" />
          <Column header="No. of Individuals Screened" :colspan="1" :rowspan="2" />
          <Column header="Suicidal Behavior" :colspan="1" :rowspan="2" />
          <Column header="PHQ" :colspan="5" headerClass="justify-content-center" />
          <Column headerClass="justify-content-center" header="GAD" :colspan="5" bodyClass="text-center" />
          <Column header="SUD" headerClass="text-center" :rowspan="2" />
        </Row>
        <Row>
          <div class="text-center">
            <Column v-for="level in severityLevels" :key="'phq-' + level" :header="level" />
            <Column v-for="level in severityLevels" :key="'gad-' + level" :header="level" />
          </div>
        </Row>
      </ColumnGroup>
      <Column v-for="level in severityLevels" :key="'phq-' + level" :field="'phq.' + level">
        <template #body="slotProps">
          <div class="text-center">{{ slotProps.data.phq[level] }}</div>
        </template>
      </Column>
      <Column v-for="level in severityLevels" :key="'gad-' + level" :field="'gad.' + level">
        <template #body="slotProps">
          <div class="text-center">{{ slotProps.data.gad[level] }}</div>
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <Button label="SUD Details" @click="showSUDDetails(slotProps.data)" />
        </template>
      </Column>
    </DataTable>
    <Dialog v-model:visible="displaySUDDialog" :header="selectedSchool + ' - SUD Details'" :style="{ width: '60vw' }">
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

const safeJsonParse = (jsonString, defaultValue = null) => {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch (e) {
    console.error('JSON Parse Error:', e);
    return defaultValue;
  }
};

const tableData = computed(() => {
  const schoolEvents = new Map();

  props.filteredData.forEach(item => {
    const schoolEvent = item.user?.agency_details?.agency?.agency_name || 'Unknown';

    if (!schoolEvents.has(schoolEvent)) {
      schoolEvents.set(schoolEvent, {
        schoolEvent,
        individualsScreened: 0,
        suicidalBehavior: 0,
        phq: { Minimal: 0, Mild: 0, Moderate: 0, 'Moderately Severe': 0, Severe: 0 },
        gad: { Minimal: 0, Mild: 0, Moderate: 0, 'Moderately Severe': 0, Severe: 0 },
        sud: {}
      });
      // Initialize SUD data structure
      substances.forEach(substance => {
        schoolEvents.get(schoolEvent).sud[substance.toLowerCase()] = {
          'No Risk': 0, 'Low Risk': 0, 'Moderate Risk': 0, 'High Risk': 0
        };
      });
    }

    const data = schoolEvents.get(schoolEvent);
    data.individualsScreened++;

    // Process PHQ data
    const phqData = safeJsonParse(item.screening_data?.phq_data, {});
    if (typeof phqData === 'object' && phqData.interpretation) {
      const level = capitalizeFirstLetter(phqData.interpretation);
      if (data.phq.hasOwnProperty(level)) {
        data.phq[level]++;
      }

      // Check for suicidal behavior
      if (Array.isArray(phqData.responses)) {
        const suicidalQuestion = phqData.responses.find(r =>
          r.question.toLowerCase().includes('thoughts that you would be better off dead')
        );
        if (suicidalQuestion?.selectedOption === 'Nearly everyday') {
          data.suicidalBehavior++;
        }
      }
    }

    // Process GAD data
    const gadData = safeJsonParse(item.screening_data?.gad_data, {});
    if (typeof gadData === 'object' && gadData.interpretation) {
      const level = capitalizeFirstLetter(gadData.interpretation);
      if (data.gad.hasOwnProperty(level)) {
        data.gad[level]++;
      }
    }

    // Process ASSIST/SUD data
    const assistData = item.screening_data?.assist_data;
    if (Array.isArray(assistData)) {
      assistData.forEach(substance => {
        if (substance.substance__name && substance.risk_flag) {
          let substanceType = mapSubstanceType(substance.substance__name.toLowerCase());
          const riskLevel = mapRiskLevel(substance.risk_flag);

          if (riskLevel && data.sud[substanceType]) {
            data.sud[substanceType][riskLevel]++;
          }
        }
      });
    }
  });

  return Array.from(schoolEvents.values());
});

const mapSubstanceType = (substanceName) => {
  if (substanceName.includes('alcohol')) return 'alcoholic';
  if (substanceName.includes('tobacco')) return 'tobacco';
  if (substanceName.includes('cannabis')) return 'cannabis';
  if (substanceName.includes('cocaine')) return 'cocaine';
  if (substanceName.includes('amphetamine')) return 'amphetamine';
  if (substanceName.includes('inhalant')) return 'inhalants';
  if (substanceName.includes('sedative')) return 'sedatives';
  if (substanceName.includes('hallucinogen')) return 'hallucinogens';
  if (substanceName.includes('opioid')) return 'opioids';
  if (substanceName.includes('other')) return 'other';
  return 'other';
};

const mapRiskLevel = (flag) => {
  switch (flag) {
    case 'none': return 'No Risk';
    case 'low': return 'Low Risk';
    case 'moderate': return 'Moderate Risk';
    case 'severe': return 'High Risk';
    default: return null;
  }
};

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const showSUDDetails = (data) => {
  selectedSchool.value = data.schoolEvent;
  selectedSUDData.value = data.sud;
  displaySUDDialog.value = true;
};

const getSUDDetails = (substance) => {
  const substanceLower = substance.toLowerCase();
  if (!selectedSUDData.value || !selectedSUDData.value[substanceLower]) {
    return riskLevels.map(level => ({
      riskLevel: level,
      count: 0
    }));
  }
  return riskLevels.map(level => ({
    riskLevel: level,
    count: selectedSUDData.value[substanceLower][level] || 0
  }));
};
</script>

<style scoped>
.centered-header {
  text-align: center;
}

.border {
  padding: 1rem;
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

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border: 1px solid #ddd;
  padding: 0.5rem;
}
</style>