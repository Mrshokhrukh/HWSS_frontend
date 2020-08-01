<!-- ChartComponent.vue -->
<template>
    <div class="screening-visualization">
        <h3 class="visualization-title">Screening Data Visualization</h3>

        <!-- Loading State -->
        <div v-if="isLoading" class="d-flex justify-content-center align-items-center p-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger m-4">
            {{ error }}
        </div>

        <!-- Charts -->
        <div v-else class="chart-container">
            <!-- Clustered Screening Donut Graph -->
            <div class="chart-card">
                <h4 class="chart-title">Clustered Screening</h4>
                <div class="chart-content">
                    <Chart :type="chartType" :data="clusteredData" :options="chartOptions" class="chart-canvas" />
                    <div class="chart-stats">
                        <p class="stat-item">
                            <span class="stat-label">Male:</span>
                            {{ formatNumber(maleCountClustered) }}
                        </p>
                        <p class="stat-item">
                            <span class="stat-label">Female:</span>
                            {{ formatNumber(femaleCountClustered) }}
                        </p>
                        <p class="stat-item total">
                            <span class="stat-label">Total:</span>
                            {{ formatNumber(totalCountClustered) }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Independent Screening Donut Graph -->
            <div class="chart-card">
                <h4 class="chart-title">Independent Screening</h4>
                <div class="chart-content">
                    <Chart :type="chartType" :data="independentData" :options="chartOptions" class="chart-canvas" />
                    <div class="chart-stats">
                        <p class="stat-item">
                            <span class="stat-label">Male:</span>
                            {{ formatNumber(maleCountIndependent) }}
                        </p>
                        <p class="stat-item">
                            <span class="stat-label">Female:</span>
                            {{ formatNumber(femaleCountIndependent) }}
                        </p>
                        <p class="stat-item total">
                            <span class="stat-label">Total:</span>
                            {{ formatNumber(totalCountIndependent) }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Chart from 'primevue/chart';

// Props definition
const props = defineProps({
    serviceData: {
        type: Array,
        required: true,
        default: () => []
    }
});

// State management
const isLoading = ref(true);
const error = ref(null);
const chartType = 'doughnut';

// Helper function for number formatting
const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
};

// Validation helpers
const hasValidScreeningData = (item) => {
    return item?.screening_data &&
        typeof item.screening_data === 'object' &&
        item.screening_data !== "Data not available";
};

const hasScreeningScores = (item) => {
    return hasValidScreeningData(item) &&
        (item.screening_data.phq9_score !== undefined ||
            item.screening_data.gad7_score !== undefined);
};

const isRegularScreening = (item) => {
    return hasValidScreeningData(item) &&
        item.screening_data.id !== undefined;
};

// Screening type classification
const isIndependentScreening = (item) => {
    if (!isRegularScreening(item)) return false;
    return Boolean(item.screening_data.case || item.screening_data.event);
};

const isClusteredScreening = (item) => {
    return hasScreeningScores(item) ||
        (isRegularScreening(item) &&
            !item.screening_data.case &&
            !item.screening_data.event);
};

// Gender detection
const getGender = (item) => {
    const userGender = item.user?.gender?.toLowerCase();
    if (userGender === 'male' || userGender === 'female') return userGender;

    if (hasValidScreeningData(item)) {
        const screeningGender = item.screening_data.gender?.toLowerCase();
        if (screeningGender === 'm') return 'male';
        if (screeningGender === 'f') return 'female';
    }

    return null; // Return null for non-binary or undefined gender
};

// Chart data computation
const computeChartData = (screeningFilter) => {
    try {
        const counts = props.serviceData.reduce((acc, item) => {
            if (screeningFilter(item)) {
                const gender = getGender(item);
                if (gender === 'male' || gender === 'female') {
                    acc[gender] = (acc[gender] || 0) + 1;
                }
            }
            return acc;
        }, { male: 0, female: 0 });

        return {
            labels: ['Male', 'Female'],
            datasets: [{
                data: [counts.male, counts.female],
                backgroundColor: ['#2B656F', '#64ac99'],
                borderColor: 'white',
                borderWidth: 2
            }]
        };
    } catch (err) {
        console.error('Error computing chart data:', err);
        error.value = 'Error processing screening data';
        return null;
    }
};

// Computed properties for chart data
const clusteredData = computed(() => computeChartData(isClusteredScreening));
const independentData = computed(() => computeChartData(isIndependentScreening));

// Counts for clustered screening
const maleCountClustered = computed(() => clusteredData.value?.datasets[0].data[0] || 0);
const femaleCountClustered = computed(() => clusteredData.value?.datasets[0].data[1] || 0);
const totalCountClustered = computed(() =>
    maleCountClustered.value + femaleCountClustered.value
);

// Counts for independent screening
const maleCountIndependent = computed(() => independentData.value?.datasets[0].data[0] || 0);
const femaleCountIndependent = computed(() => independentData.value?.datasets[0].data[1] || 0);
const totalCountIndependent = computed(() =>
    maleCountIndependent.value + femaleCountIndependent.value
);

// Chart options
const chartOptions = ref({
    cutout: '60%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#2B656F',
                font: {
                    size: 12,
                    weight: 'bold'
                },
                padding: 20
            }
        },
        tooltip: {
            callbacks: {
                label: (context) => {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return `${label}: ${value} (${percentage}%)`;
                }
            }
        }
    }
});

// Watch for data changes
watch(() => props.serviceData, (newData) => {
    if (!newData || !Array.isArray(newData)) {
        error.value = 'Invalid data format received';
    } else {
        error.value = null;
    }
    isLoading.value = false;
}, { immediate: true });

// Lifecycle hooks
onMounted(() => {
    setTimeout(() => {
        isLoading.value = false;
    }, 500);
});
</script>

<style scoped>
.screening-visualization {
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.visualization-title {
    font-size: 2rem;
    font-weight: 700;
    color: #2B656F;
    text-align: center;
    margin-bottom: 2rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.chart-container {
    display: flex;
    gap: 2rem;
    justify-content: space-between;
}

.chart-card {
    flex: 1;
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.chart-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.chart-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: white;
    text-align: center;
    padding: 1rem;
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    margin: 0;
}

.chart-content {
    padding: 1rem;
}

.chart-canvas {
    height: 300px;
    width: 100%;
}

.chart-stats {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    margin-top: 1rem;
    background-color: #f8f9fa;
    border-radius: 10px;
    padding: 1rem;
}

.stat-item {
    font-size: 0.9rem;
    font-weight: 600;
    color: #2B656F;
    margin: 0.5rem;
}

.stat-item.total {
    width: 100%;
    text-align: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e9ecef;
}

.stat-label {
    font-weight: normal;
    color: #64ac99;
    margin-right: 0.5rem;
}

@media (max-width: 768px) {
    .visualization-title {
        font-size: 1.5rem;
    }

    .chart-container {
        flex-direction: column;
    }

    .chart-card {
        margin-bottom: 2rem;
    }

    .chart-canvas {
        height: 250px;
    }

    .chart-stats {
        flex-direction: column;
        align-items: center;
    }

    .stat-item {
        margin: 0.25rem 0;
    }
}
</style>