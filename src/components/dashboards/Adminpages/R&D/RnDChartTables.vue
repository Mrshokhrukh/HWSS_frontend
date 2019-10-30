<template>
  <div class="card shadow-lg rounded-lg overflow-hidden">
    <div class="p-4">
      <h3 class="card-title text-2xl font-bold mb-4">School/Event Data</h3>
      <div class="d-flex gap-4 mb-4">
        <Button icon="pi pi-download" label="Download PDF" @click="downloadPDF"
          class="p-button-outlined p-button-light" />
        <Button icon="pi pi-print" label="Print" @click="printTable" class="p-button-outlined p-button-light" />
      </div>
    </div>

    <DataTable :value="tableData" :rowHover="true" class="p-datatable-sm" responsiveLayout="scroll" stripedRows
      showGridlines tableStyle="min-width: 50rem">
      <Column field="schoolEvent" header="Agency/Event" sortable>
        <template #header>
          <div class="text-sm font-semibold">Agency/Event</div>
        </template>
      </Column>
      <Column field="individualsScreened" header="Individuals Screened" bodyClass="text-center" sortable>
        <template #header>
          <div class="text-sm font-semibold">Individuals Screened</div>
        </template>
      </Column>
      <Column field="suicidalBehavior" header="Suicidal Behavior" bodyClass="text-center" sortable>
        <template #header>
          <div class="text-sm font-semibold">Suicidal Behavior</div>
        </template>
      </Column>

      <ColumnGroup type="header">
        <Row>
          <Column header="School/Event Data" :colspan="1" :rowspan="2" headerClass="bg-gradient text-white" />
          <Column header="No. of Individuals Screened" :colspan="1" :rowspan="2" headerClass="bg-gradient text-white" />
          <Column header="Suicidal Behavior" :colspan="1" :rowspan="2" headerClass="bg-gradient text-white" />
          <Column header="PHQ" :colspan="5" headerClass="bg-gradient text-white text-center" />
          <Column header="GAD" :colspan="5" headerClass="bg-gradient text-white text-center" />
          <Column header="SUD" headerClass="bg-gradient text-white text-center" :rowspan="2" />
        </Row>
        <Row>
          <div class="text-center">
            <Column v-for="level in severityLevels" :key="'phq-' + level" :header="level"
              headerClass="bg-gradient-secondary text-white" />
            <Column v-for="level in severityLevels" :key="'gad-' + level" :header="level"
              headerClass="bg-gradient-secondary text-white" />
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
          <Button label="SUD Details" @click="showSUDDetails(slotProps.data)" class="p-button-sm p-button-outlined" />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="displaySUDDialog" :header="selectedSchool + ' - SUD Details'" :style="{ width: '60vw' }"
      class="sud-dialog">
      <TabView>
        <TabPanel v-for="substance in substances" :key="substance" :header="substance">
          <DataTable :value="getSUDDetails(substance)" class="p-datatable-sm" stripedRows showGridlines>
            <Column field="riskLevel" header="Risk Level">
              <template #header>
                <div class="text-sm font-semibold">Risk Level</div>
              </template>
            </Column>
            <Column field="count" header="Count">
              <template #header>
                <div class="text-sm font-semibold">Count</div>
              </template>
            </Column>
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
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
      if (Object.prototype.hasOwnProperty.call(data.phq, level)) {
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
      if (Object.prototype.hasOwnProperty.call(data.gad, level)) {
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

const downloadPDF = async () => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text('School/Event Data Report', 14, 15);

  // Convert table data to format suitable for autoTable
  const tableHeaders = [
    'Agency/Event',
    'Individuals Screened',
    'Suicidal Behavior',
    ...severityLevels.map(level => `PHQ ${level}`),
    ...severityLevels.map(level => `GAD ${level}`)
  ];

  const tableRows = tableData.value.map(row => [
    row.schoolEvent,
    row.individualsScreened,
    row.suicidalBehavior,
    ...Object.values(row.phq),
    ...Object.values(row.gad)
  ]);

  doc.autoTable({
    head: [tableHeaders],
    body: tableRows,
    startY: 25,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [43, 101, 111],
      textColor: 255
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  doc.save('school-event-data.pdf');
};

const printTable = () => {
  const printContent = document.querySelector('.p-datatable');
  const WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');

  WinPrint.document.write(`
    <html>
      <head>
        <title>Print Table</title>
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #2B656F; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        ${printContent.outerHTML}
      </body>
    </html>
  `);

  WinPrint.document.close();
  WinPrint.focus();
  WinPrint.print();
  WinPrint.close();
};
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%) !important;
  color: white !important;
}

.bg-gradient-secondary {
  background: linear-gradient(135deg, #1D4851 0%, #2B656F 100%);
}

.card {
  background: #ffffff;
  margin: 1rem;
}

.card-title {
  font-family: 'Inter', sans-serif;
}

:deep(.p-datatable) {
  font-family: 'Inter', sans-serif;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #8EC0CC;
  color: #1D4851;
  font-weight: 600;
  padding: 1rem;
  border: 1px solid #e9ecef;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: background-color 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f8f9fa;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
  border: 1px solid #e9ecef;
}

:deep(.p-button) {
  background: transparent;
  border: 1px solid white;
  color: rgb(37, 155, 120);
  transition: all 0.2s;
}

:deep(.p-button:hover) {
  background: rgba(255, 255, 255, 0.1);
}

:deep(.sud-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  color: white;
}

:deep(.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link) {
  background: #2B656F;
  color: white;
}

@media print {
  .p-button {
    display: none;
  }
}
</style>