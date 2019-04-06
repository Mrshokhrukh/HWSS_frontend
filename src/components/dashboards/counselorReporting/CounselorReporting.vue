<template>
    <div class="row">
        <div class="card p-4 col-md-12">
            <div class="row mb-4">
                <el-input v-model="search" placeholder="Type to search" style="margin-bottom: 10px;"
                    class=""></el-input>
                <el-button @click="clearFilters" type="text" style="margin-bottom: 10px;">Clear Filters</el-button>
            </div>

            <el-table :data="filterTableData" height="500px" stripe
                :default-sort="{ prop: 'username', order: 'descending' }" :row-class-name="rowClassName"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="50"></el-table-column>

                <!-- Username -->
                <el-table-column prop="username" label="Username" sortable width="200" show-overflow-tooltip>
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Username</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Present Dzongkhag -->
                <el-table-column prop="present_dzongkhag" label="Present Dzongkhag" sortable width="200"
                    show-overflow-tooltip>
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Present Dzongkhag</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Alcoholic Measurement -->
                <el-table-column prop="alcoholic_measurement" label="Alcoholic Measurement" sortable width="200"
                    show-overflow-tooltip>
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Alcoholic Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- PHQ Measurement -->
                <el-table-column prop="phq_measurement" label="PHQ Measurement" sortable width="200"
                    show-overflow-tooltip>
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>PHQ Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Assessment Status -->
                <el-table-column prop="assessment_status" label="Assessment Status" sortable width="200"
                    show-overflow-tooltip>
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Assessment Status</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Counseling -->
                <el-table-column prop="counseling" label="Counseling" sortable width="200" show-overflow-tooltip>
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Counseling</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Follow Up -->
                <el-table-column prop="follow_up" label="Follow Up" sortable width="200" show-overflow-tooltip>
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Follow Up</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Suicidal Measurement -->
                <el-table-column prop="suicidal_measurement" label="Suicidal Measurement" sortable width="200"
                    show-overflow-tooltip>
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Suicidal Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Tobacco Measurement -->
                <el-table-column prop="tobacco_measurement" label="Tobacco Measurement" sortable width="200"
                    show-overflow-tooltip>
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Tobacco Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Case Status -->
                <el-table-column prop="case_status" label="Case Status" sortable width="200" show-overflow-tooltip>
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Case Status</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Referral Status -->
                <el-table-column prop="referral_status" label="Referral Status" sortable width="200"
                    show-overflow-tooltip>
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Referral Status</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Rescreening Count -->
                <el-table-column prop="rescreening_count" label="Rescreening Count" sortable width="200"
                    show-overflow-tooltip>
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Rescreening Count</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Download Report Button -->
                <el-table-column label="Download Report" width="200">
                    <template v-slot="{ row }">
                        <el-button type="btn hwss-btn" @click="downloadReport(row)">Download</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios';
import { ElMessage } from 'element-plus';
import endpoints from '@/api';

const reportData = ref([]);

// Fetch report data from API
const fetchReportData = async () => {
    try {
        const response = await axios.get(endpoints.generateReport);
        if (response.data && Array.isArray(response.data)) {
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

// Define search input and filter logic
const search = ref('')
const filterTableData = computed(() =>
    reportData.value.filter(
        (data) =>
            !search.value ||
            data.username.toLowerCase().includes(search.value.toLowerCase())
    )
)

// Handle selection change
const handleSelectionChange = (selectedRows) => {
    console.log('Selected rows:', selectedRows);
}

// Download report for a specific row
const downloadReport = (row) => {
    console.log('Downloading report for:', row);
    // Implement download logic
}

// Clear filters
const clearFilters = () => {
    search.value = ''; // Clear search input
}

// Filter method for table columns
const filterByColumn = (value, row, column) => {
    return row[column.property]?.toString().toLowerCase().includes(value.toLowerCase());
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