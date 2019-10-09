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
            <div class="mt-4 text-center">
                <div class="hwss-primary text-capitalize font-italic font-weight-bold">
                    {{ agencyOrDzongkhag }}
                </div>
            </div>
        </div>
        <div class="card-footer bg-white py-3">
            <div class="d-flex justify-content-around align-items-center flex-wrap">
                <span v-for="(value, key) in chartData" :key="key" class="legend-item mb-2">
                    <span class="legend-color rounded-circle mr-2"
                        :style="{ 'background-color': getColor(key) }"></span>
                    {{ key }} ({{ value }})
                </span>
                <span class="font-weight-bold pb-2">Total: {{ getTotalCount }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue';
import Chart from 'primevue/chart';

const filteredData = inject('filteredData');
const currentYear = inject('currentYear', new Date().getFullYear());

const CHART_COLORS = {
    Male: '#2c6975',
    Female: '#33d4b9',
    PseudoMale: '#dedede',
    PseudoFemale: '#efefef'
};

const agencyOrDzongkhag = computed(() => {
    try {
        const userDetailsStoreString = localStorage.getItem('userDetailsStore');
        if (!userDetailsStoreString) {
            console.error('userDetailsStore not found in localStorage');
            return 'User details not available';
        }

        const userDetailsStore = JSON.parse(userDetailsStoreString);
        const role = userDetailsStore.user?.role;

        if (['trained_professional', 'school_counselor', 'gyelsung_counselor'].includes(role)) {
            return userDetailsStore.agency?.agencyName || 'Agency Not Available';
        } else if (role === 'clinical_counselor') {
            return userDetailsStore.user?.psAddDzongkhag || 'Dzongkhag Not Available';
        } else {
            return '';
        }
    } catch (error) {
        console.error('Error in agencyOrDzongkhag computed property:', error);
        return 'Error retrieving user details';
    }
});

const chartData = ref({
    Male: 0,
    Female: 0
});

const error = ref(null);
const isLoading = ref(true);

const getTotalCount = computed(() => {
    return Object.values(chartData.value).reduce((acc, curr) => acc + curr, 0);
});

const isDataLoaded = computed(() => {
    return chartData.value.Male > 0 || chartData.value.Female > 0;
});

const chartDisplayData = computed(() => {
    if (!isDataLoaded.value) {
        return {
            labels: ['Male', 'Female'],
            datasets: [{
                data: [1, 1],
                backgroundColor: [CHART_COLORS.PseudoMale, CHART_COLORS.PseudoFemale],
                borderWidth: 0
            }]
        };
    }
    return {
        labels: Object.keys(chartData.value),
        datasets: [{
            data: Object.values(chartData.value),
            backgroundColor: Object.keys(chartData.value).map(key => CHART_COLORS[key]),
            borderWidth: 0
        }]
    };
});

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            enabled: isDataLoaded.value,
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
    cutout: '70%'
}));

const getColor = (key) => CHART_COLORS[key];

const updateChartData = () => {
    isLoading.value = true;
    error.value = null;

    if (!filteredData.value || !Array.isArray(filteredData.value)) {
        console.error('filteredData is not available or not an array:', filteredData.value);
        error.value = 'Data is not available or in the wrong format. Please try again later.';
        isLoading.value = false;
        return;
    }

    const currentYearData = filteredData.value.filter(user => {
        const submissionDate = user.measurement?.created_at
            ? new Date(user.measurement.created_at)
            : null;
        return submissionDate && submissionDate.getFullYear() === currentYear;
    });

    let maleCount = 0;
    let femaleCount = 0;

    currentYearData.forEach(user => {
        const gender = user.userDetails?.gender || user.sudData?.active?.sex;
        if (gender) {
            if (gender.toLowerCase() === 'male') {
                maleCount++;
            } else if (gender.toLowerCase() === 'female') {
                femaleCount++;
            }
        }
    });

    chartData.value = {
        Male: maleCount,
        Female: femaleCount
    };

    isLoading.value = false;
};

onMounted(() => {
    updateChartData();
});

watch(() => filteredData.value, updateChartData, { deep: true });
watch(() => currentYear, updateChartData);
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
    /* Adjust this value to ensure alignment */
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