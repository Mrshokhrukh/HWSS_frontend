<template>
    <div class="card p-4">
        <div class="p-field p-grid">
            <div class="p-col-12 p-md-4">
                <span class="p-input-icon-left">
                    <i class="pi pi-search"></i>
                    <InputText v-model="globalFilter" placeholder="Global Search" class="ms-2 w-25"/>
                </span>
            </div>
        </div>

        <DataTable :value="filteredData" :paginator="true" :rows="10"
            :globalFilterFields="['username', 'present_dzongkhag', 'alcoholic_measurement', 'phq_measurement', 'assessment_status', 'counseling', 'follow_up', 'suicidal_measurement', 'tobacco_measurement', 'case_status', 'referral_status', 'rescreening_count']">
            <Column field="username" header="Username" sortable></Column>
            <Column field="present_dzongkhag" header="Present Dzongkhag" sortable></Column>
            <Column field="alcoholic_measurement" header="Alcoholic Measurement" sortable></Column>
            <Column field="phq_measurement" header="PHQ Measurement" sortable></Column>
            <Column field="assessment_status" header="Assessment Status" sortable></Column>
            <Column field="counseling" header="Counseling" sortable></Column>
            <Column field="follow_up" header="Follow Up" sortable></Column>
            <Column field="suicidal_measurement" header="Suicidal Measurement" sortable></Column>
            <Column field="tobacco_measurement" header="Tobacco Measurement" sortable></Column>
            <Column field="case_status" header="Case Status" sortable></Column>
            <Column field="referral_status" header="Referral Status" sortable></Column>
            <Column field="rescreening_count" header="Rescreening Count" sortable></Column>
            <Column>
                <template #body="slotProps">
                    <Button label="Download" @click="downloadReport(slotProps.row)" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios';
import { ElMessage } from 'element-plus';
import endpoints from '@/api';

const reportData = ref([]);

// Fetch report data from API
const fetchReportData = async () => {
    try {
        const response = await axios.get(endpoints.generateReport);
        if (response.data && Array.isArray(response.data)) {
            console.log(response.data);
            reportData.value = response.data;
        } else {
            reportData.value = [];
            ElMessage.error('Failed to fetch report data. Please try again later.');
        }
    } catch (error) {
        console.error(error);
        ElMessage.error('An error occurred while fetching report data.');
    }
}

// Download report for a specific row
const downloadReport = (row) => {
    console.log('Downloading report for:', row);
    // Implement download logic
}

// Fetch report data on component mount
onMounted(fetchReportData);
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