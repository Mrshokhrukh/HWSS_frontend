<!-- <template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="text-center text-capitalize">Total screened for the year: {{ currentYear }}</h4>
        </div>
        <div class="card-body">
            <template v-if="!isLoading">
                <template v-if="!isDataEmpty">
                    <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-75 mx-auto" />
                    <div class="mt-4 text-center">
                        <div class="hwss-primary text-capitalize font-italic">{{ agencyName }}</div>
                    </div>
                </template>
                <template v-else>
                    <div class="pseudo-chart">
                        <p>No data available</p>
                    </div>
                </template>
            </template>
            <template v-else>
                <div class="pseudo-chart">
                    <p>Loading Data... {{ loadingStatus }}</p>
                </div>
            </template>
        </div>
        <div v-if="!isLoading && !isDataEmpty" class="card-footer">
            <span class="legend-item">
                <span class="legend-color" :style="{ 'background-color': store.CHART_COLORS[0] }"></span>
                Male ({{ chartData.datasets[0]?.data[0] || 0 }})
            </span>
            <span class="legend-item">
                <span class="legend-color" :style="{ 'background-color': store.CHART_COLORS[1] }"></span>
                Female ({{ chartData.datasets[0]?.data[1] || 0 }})
            </span>
            <span><strong>Total: {{ totalScreenedCount }}</strong></span>
        </div>
        <div v-if="error" class="error-message">
            {{ error }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useCounselorDashboardStore } from '@/stores/counselorDashboard';
import Chart from 'primevue/chart';

const store = useCounselorDashboardStore();

const {
    chartData,
    isLoading,
    error,
    agencyName,
    totalScreenedCount,
    currentYear,
    filteredReportData
} = storeToRefs(store);

const isDataEmpty = computed(() => {
    return totalScreenedCount.value === 0 || !chartData.value || !chartData.value.datasets || chartData.value.datasets[0].data.length === 0;
});

const loadingStatus = ref('');

const chartOptions = ref({
    plugins: {
        legend: {
            display: false
        }
    },
    cutout: '60%'
});

onMounted(async () => {
    try {
        loadingStatus.value = 'Initializing...';
        if (!store.isInitialized) {
            await store.initializeStore();
        }
        loadingStatus.value = 'Data loaded.';
    } catch (err) {
        loadingStatus.value = 'Error loading data. Please try again.';
    }
});
</script>

<style scoped>
.card {
    width: 400px;
}

.card-header {
    color: #2c6975;
    padding: 10px;
}

.card-body {
    padding: 20px;
}

.card-footer {
    padding: 10px;
    display: flex;
    justify-content: space-around;
    align-items: center;
}

.legend-item {
    display: flex;
    align-items: center;
}

.legend-color {
    width: 20px;
    height: 20px;
    margin-right: 5px;
    display: inline-block;
}

.pseudo-chart {
    text-align: center;
    padding: 20px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
}

.hwss-primary {
    color: #2c6975;
}

.error-message {
    color: red;
    text-align: center;
    padding: 10px;
}
</style> -->

<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="text-center text-capitalize">Mapped User Data for {{ currentYear }}</h4>
        </div>
        <div class="card-body">
            <template v-if="!isLoading">
                <template v-if="!isDataEmpty">
                    <div v-for="user in mappedUserData" :key="user.userId" class="user-card">
                        <h5>User ID: {{ user.userId }}</h5>
                        <table class="user-data-table">
                            <tr>
                                <th>Username</th>
                                <td>{{ user.username || 'N/A' }}</td>
                            </tr>
                            <tr>
                                <th>Name</th>
                                <td>{{ user.firstName }} {{ user.middleName ? user.middleName + ' ' : '' }}{{
                                    user.lastName }}</td>
                            </tr>
                            <tr>
                                <th>Date of Birth</th>
                                <td>{{ user.dateOfBirth }}</td>
                            </tr>
                            <tr>
                                <th>Gender</th>
                                <td>{{ user.gender }}</td>
                            </tr>
                            <tr>
                                <th>Email</th>
                                <td>{{ user.email || 'N/A' }}</td>
                            </tr>
                            <tr>
                                <th>Mobile Number</th>
                                <td>{{ user.mobNumber || 'N/A' }}</td>
                            </tr>
                            <tr>
                                <th>Agency Name</th>
                                <td>{{ user.agencyName || 'N/A' }}</td>
                            </tr>
                            <tr>
                                <th>Active Agency</th>
                                <td>{{ user.activeAgency || 'N/A' }}</td>
                            </tr>
                            <tr>
                                <th>PS Add Dzongkhag</th>
                                <td>{{ user.psAddDzongkhag || 'N/A' }}</td>
                            </tr>
                            <tr>
                                <th>Academy Code</th>
                                <td>{{ user.academyCode || 'N/A' }}</td>
                            </tr>
                            <tr>
                                <th>Role</th>
                                <td>{{ user.role || 'N/A' }}</td>
                            </tr>
                            <tr>
                                <th>User Code</th>
                                <td>{{ user.userCode || 'N/A' }}</td>
                            </tr>
                            <tr>
                                <th>Parent/Guardian Info</th>
                                <td>
                                    <p>Parent Occupation: {{ user.parentOccupation || 'N/A' }}</p>
                                    <p>Guardian Name: {{ user.guardianName || 'N/A' }}</p>
                                    <p>Guardian Occupation: {{ user.guardianOccupation || 'N/A' }}</p>
                                    <p>Parent Status: {{ user.parentStatus || 'N/A' }}</p>
                                    <p>Current Living With: {{ user.currentLivingWith || 'N/A' }}</p>
                                </td>
                            </tr>
                            <tr>
                                <th>User Role in Agency</th>
                                <td>{{ user.userRoleAgency || 'N/A' }}</td>
                            </tr>
                            <tr>
                                <th>Class Info</th>
                                <td>
                                    <p>Class: {{ user.userClass || 'N/A' }}</p>
                                    <p>Stream: {{ user.userStream || 'N/A' }}</p>
                                    <p>Sub Class: {{ user.userSubClass || 'N/A' }}</p>
                                </td>
                            </tr>
                            <tr>
                                <th>Measurement Data</th>
                                <td>
                                    <div v-if="user.measurementData">
                                        <p>GAD: {{ user.measurementData.gad_measurement }} ({{
                                            user.measurementData.gad_flag }})</p>
                                        <p>PHQ: {{ user.measurementData.phq_measurement }} ({{
                                            user.measurementData.phq_flag }})</p>
                                        <p>Suicidal: {{ user.measurementData.suicidal_measurement || 'N/A' }} ({{
                                            user.measurementData.suicidal_flag || 'N/A' }})</p>
                                        <p>ACE: {{ user.measurementData.ace_measurement || 'N/A' }} ({{
                                            user.measurementData.ace_flag || 'N/A' }})</p>
                                    </div>
                                    <div v-else>No measurement data</div>
                                </td>
                            </tr>
                            <tr>
                                <th>Assist Measurement Data</th>
                                <td>
                                    <div v-if="user.assistMeasurementData">
                                        <p>Alcohol: {{ user.assistMeasurementData.alcoholic_measurement }} ({{
                                            user.assistMeasurementData.alcoholic_flag }})</p>
                                        <p>Tobacco: {{ user.assistMeasurementData.tobacco_measurement }} ({{
                                            user.assistMeasurementData.tobacco_flag }})</p>
                                        <p>Cannabis: {{ user.assistMeasurementData.cannabis_measurement }} ({{
                                            user.assistMeasurementData.cannabis_flag }})</p>
                                        <p>Cocaine: {{ user.assistMeasurementData.cocaine_measurement }} ({{
                                            user.assistMeasurementData.cocaine_flag }})</p>
                                        <p>Amphetamine: {{ user.assistMeasurementData.amphetamine_measurement }} ({{
                                            user.assistMeasurementData.amphetamine_flag }})</p>
                                        <p>Inhalants: {{ user.assistMeasurementData.inhalants_measurement }} ({{
                                            user.assistMeasurementData.inhalants_flag }})</p>
                                        <p>Sedatives: {{ user.assistMeasurementData.sedatives_measurement }} ({{
                                            user.assistMeasurementData.sedatives_flag }})</p>
                                        <p>Hallucinogens: {{ user.assistMeasurementData.hallucinogens_measurement }} ({{
                                            user.assistMeasurementData.hallucinogens_flag }})</p>
                                        <p>Opioids: {{ user.assistMeasurementData.opioids_measurement }} ({{
                                            user.assistMeasurementData.opioids_flag }})</p>
                                        <p>Other: {{ user.assistMeasurementData.other_measurement }} ({{
                                            user.assistMeasurementData.other_flag }})</p>
                                    </div>
                                    <div v-else>No assist measurement data</div>
                                </td>
                            </tr>
                            <tr>
                                <th>SUD Data</th>
                                <td>
                                    <div v-if="user.sudData && (user.sudData.lifetime || user.sudData.active)">
                                        <div v-if="user.sudData.lifetime">
                                            <h6>Lifetime SUD:</h6>
                                            <p>Username: {{ user.sudData.lifetime.username }}</p>
                                            <p>Full Name: {{ user.sudData.lifetime.full_name }}</p>
                                            <p>Age: {{ user.sudData.lifetime.age }}</p>
                                            <p>Sex: {{ user.sudData.lifetime.sex }}</p>
                                            <p>PS Dzongkhag: {{ user.sudData.lifetime.ps_dzongkhag || 'N/A' }}</p>
                                            <p>CID: {{ user.sudData.lifetime.cid }}</p>
                                            <p>Substances Used: {{ user.sudData.lifetime.substances_used.join(', ') }}
                                            </p>
                                        </div>
                                        <div v-if="user.sudData.active">
                                            <h6>Active SUD:</h6>
                                            <p>Username: {{ user.sudData.active.username }}</p>
                                            <p>Full Name: {{ user.sudData.active.full_name }}</p>
                                            <p>Age: {{ user.sudData.active.age }}</p>
                                            <p>Sex: {{ user.sudData.active.sex }}</p>
                                            <p>PS Dzongkhag: {{ user.sudData.active.ps_dzongkhag || 'N/A' }}</p>
                                            <p>CID: {{ user.sudData.active.cid }}</p>
                                            <p>Substances Used: {{ user.sudData.active.substances_used.join(', ') }}</p>
                                        </div>
                                    </div>
                                    <div v-else>No SUD data</div>
                                </td>
                            </tr>
                            <tr>
                                <th>Referrals</th>
                                <td>
                                    <div v-if="user.referrals && user.referrals.length">
                                        <p>Number of Referrals: {{ user.referrals.length }}</p>
                                        <ul>
                                            <li v-for="(referral, index) in user.referrals" :key="index">
                                                Date: {{ referral.date }}, Status: {{ referral.referral_status }}
                                            </li>
                                        </ul>
                                    </div>
                                    <div v-else>No referrals</div>
                                </td>
                            </tr>
                            <tr>
                                <th>Service and Treatment</th>
                                <td>
                                    <div v-if="user.serviceAndTreatment && user.serviceAndTreatment.length">
                                        <ul>
                                            <li v-for="(service, index) in user.serviceAndTreatment" :key="index">
                                                <p>Date: {{ service.date }}</p>
                                                <p>Assessment Status: {{ service.assessment_status }}</p>
                                                <p>Case Status: {{ service.case_status }}</p>
                                                <p>Counseling: {{ service.counseling }}</p>
                                                <p>Follow Up: {{ service.follow_up || 'N/A' }}</p>
                                                <p>Comments: {{ service.comments || 'N/A' }}</p>
                                            </li>
                                        </ul>
                                    </div>
                                    <div v-else>No service and treatment data</div>
                                </td>
                            </tr>
                            <tr>
                                <th>Rescreening Data</th>
                                <td>
                                    <div v-if="user.rescreeningData">
                                        <p>GAD Score: {{ user.rescreeningData.gad_score }}</p>
                                        <p>PHQ Score: {{ user.rescreeningData.phq_score }}</p>
                                        <p>ACE Score: {{ user.rescreeningData.ace_score }}</p>
                                        <p>Rescreened: {{ user.rescreeningData.rescreened ? 'Yes' : 'No' }}</p>
                                        <p>Rescreening Count: {{ user.rescreeningData.rescreening_count }}</p>
                                        <p>Submission Date: {{ user.rescreeningData.submission_date }}</p>
                                    </div>
                                    <div v-else>No rescreening data</div>
                                </td>
                            </tr>
                        </table>
                    </div>
                </template>
                <template v-else>
                    <div class="no-data">
                        <p>No data available. Please check the console for more information.</p>
                    </div>
                </template>
            </template>
            <template v-else>
                <div class="loading">
                    <p>Loading Data... {{ loadingStatus }}</p>
                </div>
            </template>
        </div>
        <div v-if="!isLoading && !isDataEmpty" class="card-footer">
            <span><strong>Total Users: {{ mappedUserData.length }}</strong></span>
        </div>
        <div v-if="error" class="error-message">
            {{ error }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCounselorDashboardStore } from '@/stores/counselorDashboard';

const store = useCounselorDashboardStore();

const {
    isLoading,
    error,
    currentYear,
    mappedUserData,
    userDetails,
    serviceAndTreatmentList,
} = storeToRefs(store);

const isDataEmpty = computed(() => {
    return mappedUserData.value.length === 0;
});

const loadingStatus = ref('');

onMounted(async () => {
    try {
        loadingStatus.value = 'Initializing...';
        await store.initializeStore();
        loadingStatus.value = 'Data loaded.';
        console.log('Component mounted, data:', {
            mappedUserData: mappedUserData.value,
        });
    } catch (err) {
        console.error('Error in onMounted:', err);
        loadingStatus.value = 'Error loading data. Please try again.';
    }
});

async function fetchOfficialOptions(role) {
    try {
        const options = await store.fetchOfficialOptions(role);
        // You can use these options to populate a dropdown or some other UI element
        return options;
    } catch (err) {
        console.error('Error fetching official options:', err);
        return [];
    }
}
</script>

<style scoped>
.card {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.card-header {
    background-color: #f8f9fa;
    padding: 15px;
}

.card-body {
    padding: 20px;
}

.user-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 20px;
    padding: 15px;
    background-color: #fff;
}

.user-data-table {
    width: 100%;
    border-collapse: collapse;
}

.user-data-table th,
.user-data-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.user-data-table th {
    background-color: #f2f2f2;
    font-weight: bold;
    width: 30%;
}

.no-data,
.loading {
    text-align: center;
    padding: 20px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
}

.card-footer {
    background-color: #f8f9fa;
    padding: 15px;
    text-align: center;
}

.error-message {
    color: red;
    text-align: center;
    padding: 10px;
}
</style>
