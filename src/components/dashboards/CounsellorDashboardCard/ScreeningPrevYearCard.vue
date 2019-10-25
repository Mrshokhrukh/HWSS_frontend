<template>
    <div class="card w-100 shadow-lg rounded-lg overflow-hidden">
        <div class="card-header bg-gradient-dark text-white py-4">
            <h4 class="text-center text-capitalize mb-0 font-weight-bold">
                Total Screened for {{ currentYear }}
            </h4>
        </div>
        <div class="card-body bg-gradient-light py-5">
            <div v-if="error" class="error-message text-danger text-center">
                {{ error }}
            </div>
            <div v-else-if="isLoading" class="loading-message text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2">Loading data...</p>
            </div>
            <div v-else class="chart-container">
                <Chart type="doughnut" :data="chartDisplayData" :options="chartOptions" />
            </div>
            <div v-if="isSchoolCounselor" class="text-center">
                <div class="hwss-primary text-capitalize font-italic font-weight-bold">
                    {{ agencyOrDzongkhag }}
                </div>
            </div>
        </div>
        <div class="card-footer bg-white py-3">
            <div class="d-flex justify-content-around align-items-center flex-wrap">
                <span v-for="(value, key) in chartData" :key="key" class="legend-item mb-2">
                    <span class="legend-color rounded-circle mr-2"
                        :style="{ 'background-color': getColor(key, hasData) }"></span>
                    {{ key }} ({{ value }})
                </span>
                <span class="font-weight-bold pb-2">Total: {{ getTotalCount }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Chart from 'primevue/chart';
import endpoints from '@/api';

const apiEndpoint = endpoints.newServiceAndTreatment;
const isSchoolCounselor = ref(false);
const chartData = ref({ Male: 0, Female: 0 });
const error = ref(null);
const isLoading = ref(true);
const currentYear = new Date().getFullYear()-1;

// Add a computed property to check if there's actual data
const hasData = computed(() => {
    return getTotalCount.value > 0;
});

const getUserDetailsFromStorage = () => {
    const userDetailsString = localStorage.getItem('userDetailsStore');
    if (userDetailsString) {
        const userDetails = JSON.parse(userDetailsString);
        const {
            user: { role = 'Unknown Role' } = {},
            agency: { agencyName = 'Unknown Agency', presentDzongkhag = '' } = {}
        } = userDetails;

        if (role === 'school_counselor') {
            isSchoolCounselor.value = true;
        }

        return { agencyName, userDzongkhag: presentDzongkhag };
    }

    return { agencyName: 'Unknown Agency', userDzongkhag: '' };
};

const agencyOrDzongkhag = computed(() => {
    const { agencyName, userDzongkhag } = getUserDetailsFromStorage();
    return agencyName || userDzongkhag;
});

const getTotalCount = computed(() => {
    return Object.values(chartData.value).reduce((acc, curr) => acc + curr, 0);
});

// Modified chart display data to show placeholder when empty
const chartDisplayData = computed(() => {
    const values = hasData.value ? Object.values(chartData.value) : [1, 1];
    return {
        labels: Object.keys(chartData.value),
        datasets: [
            {
                data: values,
                backgroundColor: Object.keys(chartData.value).map(key =>
                    getColor(key, hasData.value)
                ),
                borderWidth: 0
            }
        ]
    };
});

// Modified chart options to disable tooltips when no data
const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            enabled: hasData.value,
            callbacks: {
                label: (context) => {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = getTotalCount.value;
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${label}: ${value} (${percentage}%)`;
                }
            }
        }
    },
    cutout: '70%',
    events: hasData.value ? undefined : [] // Disable all events when no data
}));

// Modified color function to return placeholder colors when no data
const getColor = (key, hasData) => {
    if (!hasData) {
        return key === 'Male' ? '#e0e0e0' : '#c0c0c0'; // Light and darker gray
    }

    const CHART_COLORS = {
        Male: '#2c6975',
        Female: '#33d4b9'
    };
    return CHART_COLORS[key];
};

const fetchAndFilterData = async () => {
    try {
        isLoading.value = true;
        error.value = null;

        const response = await axios.get(apiEndpoint);
        const dataArray = response.data || [];
        const { agencyName } = getUserDetailsFromStorage();
        const currentYear = new Date().getFullYear();

        const filteredData = dataArray.filter(item => {
            const agencyMatch = item.user?.active_agency?.agency_name === agencyName;
            const screeningDate = item.screening_data?.submission_date;
            const submissionYear = screeningDate ? new Date(screeningDate).getFullYear()-1 : null;
            const yearMatch = submissionYear === currentYear;

            return agencyMatch && yearMatch;
        });

        let maleCount = 0;
        let femaleCount = 0;

        filteredData.forEach(item => {
            const gender = item.user?.gender;
            if (gender === 'Male') {
                maleCount++;
            } else if (gender === 'Female') {
                femaleCount++;
            }
        });

        chartData.value = {
            Male: maleCount,
            Female: femaleCount
        };

        isLoading.value = false;
    } catch (err) {
        console.error('Error fetching data:', err);
        error.value = 'Failed to load data. Please try again later.';
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchAndFilterData();
});
</script>


<style scoped>
.card {
    max-width: 450px;
    margin: 0 auto;
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
}

.bg-gradient-dark {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.bg-gradient-light {
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    color: #2B656F !important;
}

.chart-container {
    position: relative;
    height: 0;
    padding-bottom: 100%;
    max-width: 300px;
    margin: 0 auto;
}

.legend-item {
    display: flex;
    align-items: center;
    margin: 0 10px;
    font-size: 0.9rem;
}

.legend-color {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-right: 0.5rem;
}

.hwss-primary {
    color: #2c6975;
}

@media (max-width: 576px) {
    .card-footer .d-flex {
        flex-direction: column;
        align-items: flex-start;
    }

    .legend-item {
        margin: 5px 0;
    }
}
</style>