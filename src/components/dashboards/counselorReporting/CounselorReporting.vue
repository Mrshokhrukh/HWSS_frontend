<template>
    <div class="row">
        <div class="col-md-12">
            <el-table :data="reportData" height="500px" stripe :default-sort="{ prop: 'date', order: 'descending' }"
                :row-class-name="rowClassName" @selection-change="handleSelectionChange">
                <!-- Checkbox for selection -->
                <el-table-column type="selection" width="50"></el-table-column>

                <!-- Date -->
                <el-table-column prop="date" label="Date" sortable show-overflow-tooltip></el-table-column>

                <!-- Name -->
                <el-table-column prop="name" label="Name" sortable show-overflow-tooltip></el-table-column>

                <!-- Age -->
                <el-table-column prop="age" label="Age" sortable show-overflow-tooltip></el-table-column>

                <!-- Sex -->
                <el-table-column prop="sex" label="Sex" sortable show-overflow-tooltip></el-table-column>

                <!-- Diagnosis -->
                <el-table-column prop="diagnosis" label="Diagnosis" sortable show-overflow-tooltip></el-table-column>

                <!-- PHQ Measurement -->
                <el-table-column prop="phq_measurement" label="PHQ Measurement" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- GAD Measurement -->
                <el-table-column prop="gad_measurement" label="GAD Measurement" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- ACE Measurement -->
                <el-table-column prop="ace_measurement" label="ACE Measurement" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Tobacco Measurement -->
                <el-table-column prop="tobacco_measurement" label="Tobacco Measurement" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Alcohol Measurement -->
                <el-table-column prop="alcohol_measurement" label="Alcohol Measurement" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Cannabis Measurement -->
                <el-table-column prop="cannabis_measurement" label="Cannabis Measurement" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Cocaine Measurement -->
                <el-table-column prop="cocaine_measurement" label="Cocaine Measurement" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Amphetamine Measurement -->
                <el-table-column prop="amphetamine_measurement" label="Amphetamine Measurement" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Inhalants Measurement -->
                <el-table-column prop="inhalants_measurement" label="Inhalants Measurement" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Sedative Measurement -->
                <el-table-column prop="sedative_measurement" label="Sedative Measurement" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Hallucigens Measurement -->
                <el-table-column prop="hallucigens_measurement" label="Hallucigens Measurement" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Opiods Measurement -->
                <el-table-column prop="opiods_measurement" label="Opiods Measurement" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Other Measurement -->
                <el-table-column prop="other_measurement" label="Other Measurement" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Injection Measurement -->
                <el-table-column prop="injection_measurement" label="Injection Measurement" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Referral Details -->
                <el-table-column prop="referral_details" label="Referral Details" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Assessment Status -->
                <el-table-column prop="assessment_status" label="Assessment Status" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Counseling Status -->
                <el-table-column prop="counseling_status" label="Counseling Status" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Follow Up Status -->
                <el-table-column prop="follow_up_status" label="Follow Up Status" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Comments -->
                <el-table-column prop="comments" label="Comments" sortable show-overflow-tooltip></el-table-column>

                <!-- Screening Type Used -->
                <el-table-column prop="screening_type_used" label="Screening Type Used" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Event Name -->
                <el-table-column prop="event_name" label="Event Name" sortable show-overflow-tooltip></el-table-column>

                <!-- Event Date -->
                <el-table-column prop="event_date" label="Event Date" sortable show-overflow-tooltip></el-table-column>

                <!-- Individual Case Name -->
                <el-table-column prop="individual_case_name" label="Individual Case Name" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Case Date -->
                <el-table-column prop="case_date" label="Case Date" sortable show-overflow-tooltip></el-table-column>

                <!-- Case Status -->
                <el-table-column prop="case_status" label="Case Status" sortable
                    show-overflow-tooltip></el-table-column>

                <!-- Download Report Button -->
                <el-table-column label="Download Report" width="150">
                    <template v-slot="{ row }">
                        <el-button type="primary" @click="downloadReport(row)">Download</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios';
import { ElMessage } from 'element-plus';
import endpoints from '@/api';

const reportData = ref([]);

// Method to fetch and populate the report data
const fetchReportData = async () => {
    try {
        const response = await axios.get(endpoints.generateReport);
        if (response.data && Array.isArray(response.data)) {
            console.log('Report data:', response.data);
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

// Method to handle selection change in the table
const handleSelectionChange = (selectedRows) => {
    console.log('Selected rows:', selectedRows);
}

// Method to download report for a specific row
const downloadReport = (row) => {
    console.log('Downloading report for:', row);
    // Implement download logic
}

onMounted(fetchReportData);
</script>

