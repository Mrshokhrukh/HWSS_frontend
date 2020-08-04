<template>
  <div class="card border-0 shadow-sm rounded-3 mx-3 my-4">
    <div class="card-header border-0 p-3 custom-gradient">
      <h3 class="fs-5 fw-semibold text-white mb-1">School/Event Data</h3>
      <p class="text-white-50 mb-2 small">Comprehensive screening results and analysis</p>

      <div class="d-flex gap-2 mb-1">
        <Button icon="pi pi-download" label="Download PDF" @click="downloadPDF" class="btn-custom py-1 px-2"
          size="small" />
        <Button icon="pi pi-print" label="Print" @click="printTable" class="btn-custom py-1 px-2" size="small" />
      </div>
    </div>

    <div class="card-body p-3">
      <DataTable :value="tableData" :rowHover="true" class="table-modern" responsiveLayout="scroll" stripedRows
        showGridlines tableStyle="min-width: 50rem" size="small" 
        :paginator="true" 
        :rows="5"
        :rowsPerPageOptions="[5, 10, 25, 50, 100]"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">

        <ColumnGroup type="header">
          <Row>
            <Column header="School/Event Data" :colspan="1" :rowspan="2" headerClass="header-main py-2" />
            <Column header="Screening Results" :colspan="2" headerClass="header-main py-2" />
            <Column header="PHQ Assessment" :colspan="5" headerClass="header-main text-center py-2" />
            <Column header="GAD Assessment" :colspan="5" headerClass="header-main text-center py-2" />
            <Column header="SUD" headerClass="header-main text-center py-2" :rowspan="2" />
          </Row>
          <Row>
            <Column header="Screened" headerClass="header-secondary py-2" />
            <Column header="Suicidal" headerClass="header-secondary py-2" />
            <Column v-for="level in severityLevels" :key="'phq-' + level" :header="level"
              headerClass="header-secondary py-2" />
            <Column v-for="level in severityLevels" :key="'gad-' + level" :header="level"
              headerClass="header-secondary py-2" />
          </Row>
        </ColumnGroup>

        <Column field="schoolEvent" header="Agency/Event">
          <template #body="slotProps">
            <div class="fw-medium small text-dark">{{ slotProps.data.schoolEvent }}</div>
          </template>
        </Column>

        <Column field="individualsScreened" bodyClass="text-center">
          <template #body="slotProps">
            <span class="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 small">
              {{ slotProps.data.individualsScreened }}
            </span>
          </template>
        </Column>

        <Column field="suicidalBehavior" bodyClass="text-center">
          <template #body="slotProps">
            <div class="text-danger fw-medium small">
              {{ slotProps.data.suicidalBehavior }}
            </div>
          </template>
        </Column>

        <template v-for="level in severityLevels" :key="'phq-' + level">
          <Column :field="'phq.' + level">
            <template #body="slotProps">
              <div class="text-center py-1 px-2 small" :class="getSeverityClass(level, slotProps.data.phq[level])">
                {{ slotProps.data.phq[level] }}
              </div>
            </template>
          </Column>
        </template>

        <template v-for="level in severityLevels" :key="'gad-' + level">
          <Column :field="'gad.' + level">
            <template #body="slotProps">
              <div class="text-center py-1 px-2 small" :class="getSeverityClass(level, slotProps.data.gad[level])">
                {{ slotProps.data.gad[level] }}
              </div>
            </template>
          </Column>
        </template>

        <Column>
          <template #body="slotProps">
            <Button label="Details" @click="showSUDDetails(slotProps.data)"
              class="btn-secondary-custom p-button-sm small" />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="displaySUDDialog" :header="selectedSchool + ' - SUD Details'" class="dialog-modern">
      <TabView>
        <TabPanel v-for="substance in substances" :key="substance" :header="substance">
          <DataTable :value="getSUDDetails(substance)" class="table-secondary" stripedRows size="small">
            <Column field="riskLevel" header="Risk Level">
              <template #body="slotProps">
                <div :class="getRiskLevelClass(slotProps.data.riskLevel)" class="small">
                  {{ slotProps.data.riskLevel }}
                </div>
              </template>
            </Column>
            <Column field="count" header="Count">
              <template #body="slotProps">
                <div class="text-center fw-medium small">
                  {{ slotProps.data.count }}
                </div>
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

const processSubstanceData = (item, data) => {
  const caseSubstanceRisks = item.case_substance_risks;
  if (Array.isArray(caseSubstanceRisks)) {
    caseSubstanceRisks.forEach(substance => {
      if (substance.substance_name && substance.risk_flag) {
        const substanceType = mapSubstanceType(substance.substance_name.toLowerCase());
        const riskLevelText = substance.risk_flag.split(' ')[0];
        const riskLevel = mapRiskLevel(riskLevelText);
        
        if (riskLevel && data.sud[substanceType]) {
          data.sud[substanceType][riskLevel]++;
        }
      }
    });
    return;
  }
  
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
};

const tableData = computed(() => {
  const schoolEvents = new Map();

  if (!Array.isArray(props.filteredData)) {
    return [];
  }

  props.filteredData.forEach(item => {
    const agencyName = item.user?.active_agency?.agency_name ||
                       item.user?.agency_details?.agency?.agency_name || 'Unknown';

    if (agencyName === 'Unknown') return;

    let groupKey;
    if (item.screening_data?.event) {
      groupKey = `Event: ${item.screening_data.event}`;
    } else if (item.screening_data?.case) {
      groupKey = agencyName;
    } else {
      groupKey = `${agencyName} (Other)`;
    }

    if (!schoolEvents.has(groupKey)) {
      schoolEvents.set(groupKey, {
        schoolEvent: groupKey,
        individualsScreened: 0,
        suicidalBehavior: 0,
        phq: { Minimal: 0, Mild: 0, Moderate: 0, 'Moderately Severe': 0, Severe: 0 },
        gad: { Minimal: 0, Mild: 0, Moderate: 0, 'Moderately Severe': 0, Severe: 0 },
        sud: {}
      });
      substances.forEach(substance => {
        schoolEvents.get(groupKey).sud[substance.toLowerCase()] = {
          'No Risk': 0, 'Low Risk': 0, 'Moderate Risk': 0, 'High Risk': 0
        };
      });
    }

    const data = schoolEvents.get(groupKey);
    data.individualsScreened++;

    if (item.screening_data) {
      const phqInterpretation = item.screening_data.phq_interpretation;
      if (phqInterpretation) {
        let level = phqInterpretation === "None or Minimal" ? "Minimal" : phqInterpretation;
        level = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
        if (Object.prototype.hasOwnProperty.call(data.phq, level)) {
          data.phq[level]++;
        }
      }

      const gadInterpretation = item.screening_data.gad_interpretation;
      if (gadInterpretation) {
        let level = gadInterpretation;
        level = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
        if (Object.prototype.hasOwnProperty.call(data.gad, level)) {
          data.gad[level]++;
        }
      }

      if (Array.isArray(item.screening_data.phq_data)) {
        const suicidalQuestion = item.screening_data.phq_data.find(q =>
          q.question && q.question.toLowerCase().includes('thoughts that you would be better off dead')
        );
        if (suicidalQuestion && (suicidalQuestion.selectedOption === 'Nearly every day' || suicidalQuestion.score >= 3)) {
          data.suicidalBehavior++;
        }
      }
    }

    processSubstanceData(item, data);
  });

  return Array.from(schoolEvents.values());
});

const mapSubstanceType = (substanceName) => {
  if (substanceName.includes('alcoholic') || substanceName.includes('alcohol')) return 'alcoholic';
  if (substanceName.includes('tobacco') || substanceName.includes('cigarette')) return 'tobacco';
  if (substanceName.includes('cannabis') || substanceName.includes('marijuana')) return 'cannabis';
  if (substanceName.includes('cocaine')) return 'cocaine';
  if (substanceName.includes('amphetamine') || substanceName.includes('meth')) return 'amphetamine';
  if (substanceName.includes('inhalant')) return 'inhalants';
  if (substanceName.includes('sedative') || substanceName.includes('sleeping')) return 'sedatives';
  if (substanceName.includes('hallucinogen')) return 'hallucinogens';
  if (substanceName.includes('opioid')) return 'opioids';
  return 'other';
};

const mapRiskLevel = (flag) => {
  if (!flag) return null;
  const flagLower = flag.toLowerCase();
  if (flagLower.includes('none')) return 'No Risk';
  if (flagLower.includes('low')) return 'Low Risk';
  if (flagLower.includes('moderate')) return 'Moderate Risk';
  if (flagLower.includes('severe')) return 'High Risk';
  return null;
};

const showSUDDetails = (data) => {
  selectedSchool.value = data.schoolEvent;
  selectedSUDData.value = data.sud;
  displaySUDDialog.value = true;
};

const getSUDDetails = (substance) => {
  const substanceLower = substance.toLowerCase();
  if (!selectedSUDData.value || !selectedSUDData.value[substanceLower]) {
    return riskLevels.map(level => ({ riskLevel: level, count: 0 }));
  }
  return riskLevels.map(level => ({
    riskLevel: level,
    count: selectedSUDData.value[substanceLower][level] || 0
  }));
};

const downloadPDF = async () => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('School/Event Data Report', 14, 15);
  const tableHeaders = [
    'Agency/Event', 'Individuals Screened', 'Suicidal Behavior',
    ...severityLevels.map(level => `PHQ ${level}`),
    ...severityLevels.map(level => `GAD ${level}`)
  ];
  const tableRows = tableData.value.map(row => [
    row.schoolEvent, row.individualsScreened, row.suicidalBehavior,
    ...Object.values(row.phq),
    ...Object.values(row.gad)
  ]);
  doc.autoTable({
    head: [tableHeaders],
    body: tableRows,
    startY: 25,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [43, 101, 111], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });
  doc.save('school-event-data.pdf');
};

const printTable = () => {
  const printContent = document.querySelector('.p-datatable-wrapper');
  const WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
  WinPrint.document.write(`
    <html>
      <head><title>Print Table</title>
        <style>
          body { font-family: sans-serif; }
          table { border-collapse: collapse; width: 100%; font-size: 10px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background-color: #2B656F; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body><h3>School/Event Data Report</h3>${printContent.outerHTML}</body>
    </html>`);
  WinPrint.document.close();
  WinPrint.focus();
  WinPrint.print();
  WinPrint.close();
};

const getSeverityClass = (level, value) => {
  if (value === 0) return 'text-secondary bg-secondary-subtle';
  switch (level) {
    case 'Minimal': return 'text-success bg-success-subtle';
    case 'Mild': return 'text-primary bg-primary-subtle';
    case 'Moderate': return 'text-warning bg-warning-subtle';
    case 'Moderately Severe': return 'text-info bg-info-subtle';
    case 'Severe': return 'text-danger bg-danger-subtle';
    default: return '';
  }
};

const getRiskLevelClass = (level) => {
  switch (level) {
    case 'No Risk': return 'badge bg-success-subtle text-success';
    case 'Low Risk': return 'badge bg-primary-subtle text-primary';
    case 'Moderate Risk': return 'badge bg-warning-subtle text-warning';
    case 'High Risk': return 'badge bg-danger-subtle text-danger';
    default: return '';
  }
};
</script>

<style scoped>
.custom-gradient {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}
:deep(.btn-custom) {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 0.875rem;
}
:deep(.btn-custom:hover) {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.35);
}
:deep(.btn-secondary-custom) {
  background: #2B656F;
  border: none;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}
:deep(.btn-secondary-custom:hover) {
  background: #1D4851;
}
.table-modern {
  font-size: 0.875rem;
}
.table-modern :deep(.header-main) {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
}
.table-modern :deep(.header-secondary) {
  background: #1D4851;
  color: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.5rem 0.75rem;
}
.dialog-modern :deep(.p-dialog-header) {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  color: white;
  padding: 1rem;
}
.dialog-modern :deep(.p-tabview-nav-link) {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
:deep(.p-datatable) {
  border-radius: 0.375rem;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.03);
}
:deep(.p-datatable .p-datatable-wrapper) {
  border-radius: 0.375rem 0.375rem 0 0;
  border: 1px solid rgba(43, 101, 111, 0.1);
}
:deep(.badge) {
  font-weight: 500;
  padding: 0.25em 0.75em;
  font-size: 0.75rem;
}
:deep(.badge.bg-primary-subtle) {
  background-color: rgba(43, 101, 111, 0.1) !important;
  color: #2B656F !important;
}
:deep(.p-datatable.p-datatable-sm .p-datatable-thead > tr > th) {
  padding: 0.5rem 0.75rem;
}
:deep(.p-datatable.p-datatable-sm .p-datatable-tbody > tr > td) {
  padding: 0.5rem 0.75rem;
}
:deep(.p-paginator) {
  background: #f8f9fa;
  border: 1px solid rgba(43, 101, 111, 0.1);
  border-top: none;
  padding: 0.5rem 0.75rem;
  border-bottom-left-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}
:deep(.p-paginator .p-paginator-current) {
  font-size: 0.875rem;
}
:deep(.p-paginator .p-dropdown) {
  height: 2.25rem;
}
:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last) {
  min-width: 2.25rem;
  height: 2.25rem;
}
:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  min-width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.25rem;
}
:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  background: #2B656F;
  border-color: #2B656F;
  color: white;
}
</style>