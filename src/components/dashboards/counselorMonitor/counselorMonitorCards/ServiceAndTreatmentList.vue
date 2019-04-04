<template>
    <div>
        <div class="row">
            <h5 class="card-title">Service and Treatment List</h5>
            <el-table :data="filteredRows" :row-height="50" :default-sort="{ prop: 'date', order: 'descending' }"
                height="500px" stripe @selection-change="onSelectionChanged" style="width: 100%">
                <el-table-column prop="date" label="Date" sortable show-overflow-tooltip
                    :formatter="formatDate"></el-table-column>
                <el-table-column prop="user_data.name" label="Name" sortable show-overflow-tooltip></el-table-column>
                <el-table-column prop="user_data.age" label="Age" sortable show-overflow-tooltip></el-table-column>
                <el-table-column prop="user_data.gender" label="Sex" sortable show-overflow-tooltip></el-table-column>
                <el-table-column prop="assessment_status" label="Assessment Status" sortable show-overflow-tooltip
                    :formatter="formatEmpty"></el-table-column>
                <el-table-column prop="case_status" label="Case Status" sortable show-overflow-tooltip
                    :formatter="formatEmpty"></el-table-column>
                <el-table-column prop="counseling" label="Counseling" sortable show-overflow-tooltip
                    :formatter="formatEmpty"></el-table-column>
                <el-table-column prop="follow_up" label="Follow Up" sortable show-overflow-tooltip
                    :formatter="formatEmpty"></el-table-column>
                <el-table-column prop="comments" label="Comments" sortable show-overflow-tooltip
                    :formatter="formatEmpty"></el-table-column>
                <el-table-column label="Actions">
                    <template #default="{ row }">
                        <button class="btn hwss-btn" @click="viewDetails(row.id)">View Details</button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="row mt-4 d-flex justify-content-end">
            <button class="btn hwss-btn col-1" @click="saveChanges">Save Changes</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import endpoints from '@/api';

// eslint-disable-next-line no-unused-vars
const followUpList = ref([
    'Treatment Completed',
    'Undergoing Treatment',
    'Completed Counselling Sessions',
    'Unwilling to Undergo Treatment',
    'Undergone Rehabilitation',
    'Undergoing Rehabilitation',
    'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)',
    'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)',
    'School-based SUD Treatment and Care',
    'Institution-based SUD Treatment and Care',
    'Follow-up Drug Test Conducted',
    'Detention-based SUD Treatment and Care',
]);

const formatEmpty = (row, column) => {
    if (!row[column.property] || row[column.property].trim() === '') {
        return '----';
    }
    return row[column.property];
};

const rowData = ref([]);
const searchQuery = ref('');
const selectedFields = ref([
    'date',
    'user_data.name',
    'user_data.age',
    'user_data.gender',
    'assessment_status',
    'case_status',
    'counseling',
    'follow_up',
    'comments',
]);

const filteredRows = computed(() => {
    if (!searchQuery.value.trim() || !Array.isArray(rowData.value) || rowData.value.length === 0) {
        return rowData.value;
    }

    return rowData.value.filter(row => {
        return selectedFields.value.some(field => {
            const fieldValue = row[field.split('.').pop()];
            return fieldValue !== undefined && fieldValue.toString().toLowerCase().includes(searchQuery.value.toLowerCase());
        });
    });
});

const saveChanges = async () => {
    try {
        // Implement logic to save changes to backend
        console.log('Changes saved successfully!');
    } catch (error) {
        console.error('Error saving changes:', error);
    }
};

onMounted(async () => {
    try {
        const response = await axios.get(endpoints.getServiceAndTreatmentList);
        if (response && response.data && Array.isArray(response.data.service_and_treatment_data)) {
            rowData.value = response.data.service_and_treatment_data;
        } else {
            console.error('Invalid response format:', response);
        }
    } catch (error) {
        console.error(error);
    }
});
</script>