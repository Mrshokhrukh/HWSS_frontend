<template>
    <div class="data-export-reporting-tab">
        <section>
            <h4 class="section-title">Data Export</h4>
            <div class="export-options">
                <div class="p-d-flex p-flex-column p-ai-start" style="gap: 0.75rem">
                    <label for="file-format">File Format:</label>
                    <Dropdown id="file-format" v-model="selectedFormat" :options="exportFormats" optionLabel="label"
                        optionValue="value" placeholder="Select Format"></Dropdown>

                    <label for="data-scope">Data Scope:</label>
                    <MultiSelect id="data-scope" v-model="selectedDataScope" :options="dataScopeOptions"
                        optionLabel="label" optionValue="value" placeholder="Select Data" display="chip"></MultiSelect>

                    <Button label="Export Data" icon="pi pi-download" @click="handleExport" :disabled="isLoading" />
                </div>
                <div v-if="isLoading" class="loading-overlay">
                    <ProgressSpinner />
                </div>
            </div>
        </section>

        <section>
            <h4 class="section-title">Report Generation</h4>
            <div class="report-options">
                <div class="p-d-flex p-flex-column p-ai-start" style="gap: 0.75rem">
                    <label for="report-type">Report Type:</label>
                    <Dropdown id="report-type" v-model="selectedReportType" :options="reportTypes" optionLabel="label"
                        optionValue="value" placeholder="Select Report Type"></Dropdown>

                    <Button label="Generate Report" icon="pi pi-file" @click="handleGenerateReport"
                        :disabled="isGeneratingReport" />
                </div>
                <div v-if="isGeneratingReport" class="loading-overlay">
                    <ProgressSpinner />
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue';
import { useToast } from 'primevue/usetoast';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx'; // Import the entire xlsx library
import ProgressSpinner from 'primevue/progressspinner';

const props = defineProps({
    filteredData: {
        type: Array,
        required: true,
    },
});

const toast = useToast();

const isLoading = ref(false);
const isGeneratingReport = ref(false);
const selectedFormat = ref(null);
const selectedDataScope = ref([]);
const selectedReportType = ref(null);

const exportFormats = [
    { label: 'CSV', value: 'csv' },
    { label: 'Excel', value: 'xlsx' },
    { label: 'JSON', value: 'json' },
];

const dataScopeOptions = [
    { label: 'Referral Data', value: 'referral' },
    { label: 'Assessment Data', value: 'assessment' },
    { label: 'Demographic Data', value: 'demographic' },
    { label: 'Substance Use Data', value: 'substance' },
    // Add more data scope options as needed
];

const reportTypes = [
    { label: 'Summary Report', value: 'summary' },
    { label: 'Detailed Report', value: 'detailed' },
    // Add more report types as needed
];

const handleExport = async () => {
    if (!selectedFormat.value) {
        toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a file format', life: 3000 });
        return;
    }
    if (selectedDataScope.value.length === 0) {
        toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please select at least one data scope', life: 3000 });
        return;
    }

    isLoading.value = true;

    try {
        // Simulate API call or data processing
        const dataToExport = prepareDataForExport(props.filteredData, selectedDataScope.value);

        if (selectedFormat.value === 'csv') {
            const csv = convertToCSV(dataToExport);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'data.csv');
        } else if (selectedFormat.value === 'xlsx') {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(dataToExport);
            XLSX.utils.book_append_sheet(wb, ws, "Data");
            XLSX.writeFile(wb, 'data.xlsx');
        } else if (selectedFormat.value === 'json') {
            const json = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            saveAs(blob, 'data.json');
        }

        toast.add({ severity: 'success', summary: 'Success', detail: 'Data exported successfully', life: 3000 });
    } catch (error) {
        console.error('Error exporting data:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to export data', life: 3000 });
    } finally {
        isLoading.value = false;
    }
};

const handleGenerateReport = () => {
    isGeneratingReport.value = true;

    // Simulate report generation
    setTimeout(() => {
        isGeneratingReport.value = false;
        toast.add({
            severity: 'info',
            summary: 'Report Generated',
            detail: `Report type: ${selectedReportType.value}`,
            life: 3000,
        });
    }, 2000); // Simulate a 2-second delay
};

// Helper functions for data export (you'll need to implement these)

function prepareDataForExport(data, scope) {
    let exportedData = [];

    if (scope.includes('referral')) {
        exportedData = exportedData.concat(data.map(item => ({
            'Referral Date': item.date,
            'Referral Source': item.user?.active_agency?.agency_name,
            'Referral Status': item.referred,
            // ... add other relevant referral fields
        })));
    }

    if (scope.includes('assessment')) {
        exportedData = exportedData.concat(data.map(item => ({
            'Assessment Status': item.assessment_status,
            'PHQ-9 Score': item.screening_data?.phq_score,
            'PHQ-9 Interpretation': item.screening_data?.phq_interpretation,
            'GAD-7 Score': item.screening_data?.gad_score,
            'GAD-7 Interpretation': item.screening_data?.gad_interpretation,
            // ... add other relevant assessment fields
        })));
    }

    if (scope.includes('demographic')) {
        exportedData = exportedData.concat(data.map(item => ({
            'Age': calculateAge(item.user?.date_of_birth),
            'Gender': item.user?.gender,
            'Dzongkhag': item.user?.perm_add_dzongkhag,
            // ... add other relevant demographic fields
        })));
    }

    if (scope.includes('substance')) {
        exportedData = exportedData.concat(data.map(item => {
            const eventSubstanceRisks = item.event_substance_risks ?
                item.event_substance_risks.map(risk => `${risk.substance_name}: ${risk.risk_flag}`).join('; ') :
                '';
            const caseSubstanceRisks = item.case_substance_risks ?
                item.case_substance_risks.map(risk => `${risk.substance_name}: ${risk.risk_flag}`).join('; ') :
                '';

            return {
                'Event Substance Risks': eventSubstanceRisks,
                'Case Substance Risks': caseSubstanceRisks
            };
        }));
    }

    // Deduplicate data: If the same field is included in multiple scopes, ensure it's only added once
    const uniqueData = exportedData.reduce((acc, current) => {
        const x = acc.find(item => JSON.stringify(item) === JSON.stringify(current));
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, []);

    return uniqueData;
}

function convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const columnDelimiter = ',';
    const lineDelimiter = '\n';
    const keys = Object.keys(data[0]);

    let result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(item => {
        let ctr = 0;
        keys.forEach(key => {
            if (ctr > 0) result += columnDelimiter;
            result += item[key] ? `"${item[key]}"` : '';
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
}

// Placeholder function for report generation logic
function generateReport(type, data) {
    // This is a placeholder. Implement your report generation logic here.
    // For example, you could generate a PDF, a Word document, or an HTML report
    // based on the selected report type and the filtered data.
    console.log(`Generating ${type} report with data:`, data);
    toast.add({
        severity: 'info',
        summary: 'Report Generated',
        detail: `Generating ${type} report. This is a placeholder action.`,
        life: 3000,
    });
}
</script>

<style scoped>
.data-export-reporting-tab section {
    margin-bottom: 2rem;
}

.export-options,
.report-options {
    background-color: white;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-title {
    color: #2B656F;
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 10;
}
</style>