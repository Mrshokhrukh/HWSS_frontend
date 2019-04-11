<template>
    <div class="card p-4">
        <div class="p-field p-grid">
            <div class="p-col-12 p-md-4">
                <span class="p-input-icon-left">
                    <i class="pi pi-search"></i>
                    <InputText v-model="globalFilter" placeholder="Global Search" class="ms-2 w-25" />
                </span>
            </div>
        </div>

        <DataTable :value="filteredData" :paginator="true" :rows="10" :globalFilterFields="globalFilterFields">
            <Column v-for="field in tableFields" :key="field.key" :field="field.key" :header="field.header"
                :sortable="true"></Column>
            <Column>
                <template #body="slotProps">
                    <Button label="Download" @click="downloadReport(slotProps.row)" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import endpoints from '@/api';

const reportData = ref([]);
const globalFilter = ref('');
const filteredData = ref([]);
const globalFilterFields = [
    'username', 'present_dzongkhag', 'alcoholic_measurement', 'phq_measurement',
    'assessment_status', 'counseling', 'follow_up', 'suicidal_measurement',
    'tobacco_measurement', 'case_status', 'referral_status', 'rescreening_count'
];
const tableFields = [
    { key: 'username', header: 'Username' },
    { key: 'present_dzongkhag', header: 'Present Dzongkhag' },
    { key: 'alcoholic_measurement', header: 'Alcoholic Measurement' },
    { key: 'phq_measurement', header: 'PHQ Measurement' },
    { key: 'assessment_status', header: 'Assessment Status' },
    { key: 'counseling', header: 'Counseling' },
    { key: 'follow_up', header: 'Follow Up' },
    { key: 'suicidal_measurement', header: 'Suicidal Measurement' },
    { key: 'tobacco_measurement', header: 'Tobacco Measurement' },
    { key: 'case_status', header: 'Case Status' },
    { key: 'referral_status', header: 'Referral Status' },
    { key: 'rescreening_count', header: 'Rescreening Count' }
];

// Fetch report data from API
const fetchReportData = async () => {
    try {
        const response = await axios.get(endpoints.generateReport);
        if (response.data && Array.isArray(response.data)) {
            console.log(response.data);
            reportData.value = response.data;
            filteredData.value = response.data; // Initialize filteredData
        } else {
            handleFetchError();
        }
    } catch (error) {
        handleFetchError();
    }
}

// Handle fetch error
const handleFetchError = () => {
    reportData.value = [];
    filteredData.value = [];
    ElMessage.error('Failed to fetch report data. Please try again later.');
}

// Download report for a specific row
const downloadReport = (row) => {
    console.log('Downloading report for:', row);
    // Implement download logic
}

// Filter data based on global filter
const filterData = () => {
    if (!globalFilter.value) {
        filteredData.value = [...reportData.value]; // Reset to original data if global filter is empty
        return;
    }
    const filtered = reportData.value.filter(item => {
        return Object.values(item).some(val => String(val).toLowerCase().includes(globalFilter.value.toLowerCase()));
    });
    filteredData.value = filtered;
}

// Fetch report data on component mount
onMounted(fetchReportData);

// Watch for changes in global filter
watch(globalFilter, filterData);
</script>


<style scoped>
.sortable-column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.sort-indicator {
    margin-left: 8px;
}
</style>