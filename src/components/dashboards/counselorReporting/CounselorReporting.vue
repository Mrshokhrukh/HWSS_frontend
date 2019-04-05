<template>
    <div class="row">
        <div class="col-md-12">
            <el-input v-model="search" placeholder="Type to search" style="margin-bottom: 10px;" class=""></el-input>
            <el-button @click="clearFilters" type="text" style="margin-bottom: 10px;">Clear Filters</el-button>
            <el-table :data="filterTableData" height="500px" stripe
                :default-sort="{ prop: 'date', order: 'descending' }" :row-class-name="rowClassName"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="50"></el-table-column>

                <el-table-column prop="date" label="Date" sortable width="100" show-overflow-tooltip
                    :filter-method="value => filterByColumn(value, row, column)">
                    <template #filter-icon>
                        <el-icon>
                            <Filter />
                        </el-icon>
                    </template>
                    <template v-slot:header>
                        <div class="sortable-column-header">

                            <span>Date</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="name" label="Name" sortable width="150" show-overflow-tooltip
                    :filter-method="value => filterByColumn(value, row, column)">
                    <template #filter-icon>
                        <i class="el-icon-Filter"></i>
                    </template>
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <el-icon>
                                <Filter />
                            </el-icon>
                            <span>Name</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="age" label="Age" sortable width="80" show-overflow-tooltip
                    :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Age</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                            <el-icon>
                                <Filter />
                            </el-icon>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="sex" label="Sex" sortable width="80" show-overflow-tooltip
                    :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Sex</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="diagnosis" label="Diagnosis" sortable width="150" show-overflow-tooltip
                    :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Diagnosis</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- PHQ Measurement -->
                <el-table-column prop="phq_measurement" label="PHQ Measurement" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>PHQ Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- GAD Measurement -->
                <el-table-column prop="gad_measurement" label="GAD Measurement" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>GAD Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- ACE Measurement -->
                <el-table-column prop="ace_measurement" label="ACE Measurement" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>ACE Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Tobacco Measurement -->
                <el-table-column prop="tobacco_measurement" label="Tobacco Measurement" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Tobacco Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Alcohol Measurement -->
                <el-table-column prop="alcohol_measurement" label="Alcohol Measurement" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Alcohol Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Cannabis Measurement -->
                <el-table-column prop="cannabis_measurement" label="Cannabis Measurement" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Cannabis Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Cocaine Measurement -->
                <el-table-column prop="cocaine_measurement" label="Cocaine Measurement" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Cocaine Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Amphetamine Measurement -->
                <el-table-column prop="amphetamine_measurement" label="Amphetamine Measurement" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Amphetamine Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Inhalants Measurement -->
                <el-table-column prop="inhalants_measurement" label="Inhalants Measurement" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Inhalants Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Sedative Measurement -->
                <el-table-column prop="sedative_measurement" label="Sedative Measurement" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Sedative Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Hallucigens Measurement -->
                <el-table-column prop="hallucigens_measurement" label="Hallucigens Measurement" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Hallucigens Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Opiods Measurement -->
                <el-table-column prop="opiods_measurement" label="Opiods Measurement" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Opiods Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Other Measurement -->
                <el-table-column prop="other_measurement" label="Other Measurement" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Other Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Injection Measurement -->
                <el-table-column prop="injection_measurement" label="Injection Measurement" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Injection Measurement</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Referral Details -->
                <el-table-column prop="referral_details" label="Referral Details" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Referral Details</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Assessment Status -->
                <el-table-column prop="assessment_status" label="Assessment Status" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Assessment Status</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Counseling Status -->
                <el-table-column prop="counseling_status" label="Counseling Status" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Counseling Status</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Follow Up Status -->
                <el-table-column prop="follow_up_status" label="Follow Up Status" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Follow Up Status</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Comments -->
                <el-table-column prop="comments" label="Comments" sortable width="150" show-overflow-tooltip
                    :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Comments</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Screening Type Used -->
                <el-table-column prop="screening_type_used" label="Screening Type Used" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Screening Type Used</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Event Name -->
                <el-table-column prop="event_name" label="Event Name" sortable width="150" show-overflow-tooltip
                    :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Event Name</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Event Date -->
                <el-table-column prop="event_date" label="Event Date" sortable width="150" show-overflow-tooltip
                    :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Event Date</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Individual Case Name -->
                <el-table-column prop="individual_case_name" label="Individual Case Name" sortable width="150"
                    show-overflow-tooltip :filter-method="value => filterByColumn(value, row, column)">
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Individual Case Name</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Case Date -->
                <el-table-column prop="case_date" label="Case Date" sortable width="150" show-overflow-tooltip
                    :filters="dateFilters" :filter-method="filterByDate">
                    <template #filter-icon>
                        <el-icon>
                            <Filter />
                        </el-icon>
                    </template>
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Case Date</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Case Status -->
                <el-table-column prop="case_status" label="Case Status" sortable width="150" show-overflow-tooltip
                    :filters="dateFilters" :filter-method="filterByDate">
                    <template #filter-icon>
                        <el-icon>
                            <Filter />
                        </el-icon>
                    </template>
                    <template v-slot:header>
                        <div class="sortable-column-header">
                            <span>Case Status</span>
                            <span class="sort-indicator"><i class="el-icon-arrow-down"></i></span>
                        </div>
                    </template>
                </el-table-column>

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
import { ref, onMounted, computed } from 'vue'
import axios from 'axios';
import { ElMessage } from 'element-plus';
import endpoints from '@/api';

const reportData = ref([]);

const fetchReportData = async () => {
    try {
        const response = await axios.get(endpoints.generateReport);
        if (response.data && Array.isArray(response.data)) {
            // console.log('Report data:', response.data);
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

const search = ref('')
const filterTableData = computed(() =>
    reportData.value.filter(
        (data) =>
            !search.value ||
            data.name.toLowerCase().includes(search.value.toLowerCase())
    )
)

const handleSelectionChange = (selectedRows) => {
    console.log('Selected rows:', selectedRows);
}

const downloadReport = (row) => {
    console.log('Downloading report for:', row);
    // Implement download logic
}

const clearFilters = () => {
    search.value = ''; // Clear search input
}

const filterByColumn = (value, row, column) => {
    return row[column.property].toString().toLowerCase().includes(value.toLowerCase());
}

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