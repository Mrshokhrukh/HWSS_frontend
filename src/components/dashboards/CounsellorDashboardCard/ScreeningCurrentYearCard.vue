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
                <div v-if="isDataAvailable">
                    <Chart type="bar" :data="chartDisplayData" :options="chartOptions" style="height: 250px;"/>
                </div>
                <div v-else class="no-data-message text-center">
                    <h6 class="my-5 py-4">No data found</h6>
                </div>
            </div>
            <div v-if="isSchoolCounselor" class="text-center">
                <div class="hwss-primary text-capitalize font-italic font-weight-bold">
                    {{ agencyOrDzongkhag }}
                </div>
            </div>
        </div>
        <div class="card-footer bg-white py-3">
            <div class="d-flex justify-content-around align-items-center flex-wrap">
                <div v-for="category in categories" :key="category" class="mb-2">
                    <h6 class="font-weight-bold">{{ formatCategoryName(category) }}</h6>
                    <span v-for="gender in ['Male', 'Female']" :key="`${category}-${gender}`" class="legend-item mr-3">
                        <span class="legend-color rounded-circle mr-2"
                            :style="{ 'background-color': getColor(gender) }"></span>
                        {{ gender }}: {{ formatNumber(chartData[category]?.[gender] || 0) }}
                    </span>
                </div>
                <div class="font-weight-bold">
                    Total: {{ formatNumber(getTotalCount) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import axios from 'axios';
import Chart from 'primevue/chart';
import endpoints from '@/api';

const apiEndpoint = endpoints.newServiceAndTreatment;
const isLoading = ref(true);
const error = ref(null);
const currentYear = new Date().getFullYear();

// Initialize chartData with nested structure
const chartData = reactive({
    caseBased: { Male: 0, Female: 0 },
    eventBased: { Male: 0, Female: 0 },
    clusterBased: { Male: 0, Female: 0 }
});

const isSchoolCounselor = ref(false);
const isClinicalCounselor = ref(false);
const isGyalsungCounselor = ref(false);

const categories = computed(() => {
    if (isGyalsungCounselor.value) {
        return ['caseBased'];
    } else if (isClinicalCounselor.value) {
        return ['caseBased', 'eventBased'];
    }
    return ['caseBased', 'eventBased', 'clusterBased'];
});

const isDataAvailable = computed(() => {
    return categories.value.some(category => {
        const categoryData = chartData[category];
        return categoryData.Male > 0 || categoryData.Female > 0;
    });
});


const formatCategoryName = (category) => {
    const names = {
        caseBased: 'Case Based',
        eventBased: 'Event Based',
        clusterBased: 'Cluster Based'
    };
    return names[category];
};

const formatNumber = (value) => {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
};

const chartDisplayData = computed(() => {
    return {
        labels: categories.value.map(formatCategoryName),
        datasets: [
            {
                label: 'Male',
                data: categories.value.map(category => chartData[category]?.Male || 0),
                backgroundColor: '#2c6975',
                borderColor: '#2c6975',
                borderWidth: 2,
                borderRadius: 8,
                stack: 'Stack 0'
            },
            {
                label: 'Female',
                data: categories.value.map(category => chartData[category]?.Female || 0),
                backgroundColor: '#64ac99',
                borderColor: '#64ac99',
                borderWidth: 2,
                borderRadius: 8,
                stack: 'Stack 0'
            }
        ]
    };
});

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            stacked: true,
            grid: {
                display: false
            },
            ticks: {
                font: {
                    size: 12,
                    weight: '500'
                }
            }
        },
        y: {
            stacked: true,
            beginAtZero: true,
            grid: {
                display: false
            },
            ticks: {
                callback: function(value) {
                    return formatNumber(value);
                },
                stepSize: 1,
                font: {
                    size: 12
                },
                padding: 10
            }
        }
    },
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#2c6975',
            titleFont: {
                size: 13,
                weight: 'bold'
            },
            bodyColor: '#2c6975',
            bodyFont: {
                size: 12
            },
            borderColor: 'rgba(44, 105, 117, 0.1)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
                label: (context) => {
                    const label = context.dataset.label || '';
                    const value = context.raw || 0;
                    const categoryTotal = getTotalForCategory(context.label.toLowerCase().replace(' ', ''));
                    const percentage = categoryTotal ? ((value / categoryTotal) * 100).toFixed(1) : 0;
                    return `${label}: ${formatNumber(value)} (${percentage}%)`;
                }
            }
        }
    }
}));

const getColor = (key) => {
    const CHART_COLORS = {
        Male: '#2c6975',
        Female: '#64ac99'
    };
    return CHART_COLORS[key];
};

const getTotalForCategory = (category) => {
    const categoryData = chartData[category];
    if (!categoryData) return 0;
    return categoryData.Male + categoryData.Female;
};

const getTotalCount = computed(() => {
    return categories.value.reduce((total, category) => {
        return total + getTotalForCategory(category);
    }, 0);
});

const getUserDetailsFromStorage = () => {
    const userDetailsString = localStorage.getItem('userDetailsStore');
    if (userDetailsString) {
        const userDetails = JSON.parse(userDetailsString);
        const {
            user: { role = 'Unknown Role' } = {},
            agency: { agencyName = 'Unknown Agency', presentDzongkhag = '' } = {}
        } = userDetails;

        isSchoolCounselor.value = role === 'school_counselor';
        isClinicalCounselor.value = role === 'clinical_counselor';
        isGyalsungCounselor.value = role === 'gyalsung_counselor';

        return { agencyName, userDzongkhag: presentDzongkhag };
    }

    return { agencyName: 'Unknown Agency', userDzongkhag: '' };
};

const agencyOrDzongkhag = computed(() => {
    const { agencyName, userDzongkhag } = getUserDetailsFromStorage();
    return agencyName || userDzongkhag;
});

const processData = (dataArray) => {
    const { agencyName } = getUserDetailsFromStorage();

    const filteredData = dataArray.filter(item => {
        const agencyMatch = item.user?.active_agency?.agency_name === agencyName;
        const screeningDate = item.screening_data?.submission_date;
        const submissionYear = screeningDate ? new Date(screeningDate).getFullYear() : null;
        return agencyMatch && submissionYear === currentYear;
    });

    // Reset counts before processing data
    chartData.caseBased.Male = 0;
    chartData.caseBased.Female = 0;
    chartData.eventBased.Male = 0;
    chartData.eventBased.Female = 0;
    chartData.clusterBased.Male = 0;
    chartData.clusterBased.Female = 0;

    filteredData.forEach(item => {
        const gender = item.user?.gender;
        if (gender !== 'Male' && gender !== 'Female') return;
        const screeningData = item.screening_data || {};

        if ('case' in screeningData) {
            chartData.caseBased[gender]++;
        } else if ('event' in screeningData) {
            chartData.eventBased[gender]++;
        } else if ('initial_submission' in screeningData) {
            chartData.clusterBased[gender]++;
        }
    });
};

const fetchAndFilterData = async () => {
    try {
        isLoading.value = true;
        error.value = null;

        const response = await axios.get(apiEndpoint);
        processData(response.data || []);

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
    border-radius: 15px;
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
    height: 250px; /* Increased height */
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
}

.legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.legend-color {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-right: 0.75rem;
    flex-shrink: 0;
}

.legend-label {
    width: 60px;
    margin-right: 0.5rem;
}

.legend-count {
    flex-grow: 1;
    text-align: left;
}

.hwss-primary {
    color: #2c6975;
}

.total {
    margin-top: 0.5rem;
}

@media (max-width: 576px) {
    .legend-label {
        width: auto;
        margin-right: 0.5rem;
    }
}
</style>