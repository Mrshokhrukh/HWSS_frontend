<template>
    <div class="card w-100 h-100 shadow-sm">
        <div class="card-header bg-gradient-dark">
            <h4 class="graph-title text-center text-white mb-0">Screening by Gender for: {{ props.cardTitle }}</h4>
        </div>
        <div class="card-body p-4">
            <div v-if="chartDataReady" class="chart-container">
                <column-chart :data="chartData" :colors="chartColors" :xtitle="'Severity'" :ytitle="'Count'"
                    :borderSkipped="true" :library="chartOptions" />
            </div>
            <div v-else class="loading-container">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading chart data...</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watchEffect, onMounted, inject } from 'vue';

const props = defineProps({
    cardTitle: String
});

// Inject the filtered data from the parent component
const filteredData = inject('filteredData');

const chartData = ref([]);
const chartCategories = ref([]);
const chartColors = ['#2B656F', '#64ac99'];
const chartDataReady = ref(false);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 20,
                font: {
                    size: 12
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            titleColor: '#2B656F',
            bodyColor: '#2B656F',
            borderColor: '#2B656F',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 10,
            usePointStyle: true
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                font: {
                    size: 12
                }
            }
        },
        y: {
            grid: {
                color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
                font: {
                    size: 12
                }
            }
        }
    },
    elements: {
        bar: {
            borderRadius: 8,
            borderSkipped: 'bottom'
        }
    }
};

// Define a function to count occurrences of severity levels by gender
const countSeverityByGender = (data, cardTitle) => {
    const maleData = {};
    const femaleData = {};

    const titleToProperty = {
        'Suicidal Behavior': 'suicidal_measurement',
        'Depression': 'phq_measurement',
        'Anxiety': 'gad_measurement',
        'ACE': 'ace_measurement',
        'Assist': 'assist'
    };

    const measurementProperty = titleToProperty[cardTitle];

    data.forEach(user => {
        let measurement, gender;

        if (cardTitle === 'Assist') {
            measurement = user.measurementAssist;
            gender = user.sudData?.active?.sex?.toLowerCase() ||
                user.userDetails?.gender?.toLowerCase() || 'unknown';
        } else {
            measurement = user.measurement;
            gender = user.userDetails?.gender?.toLowerCase() ||
                user.sudData?.active?.sex?.toLowerCase() || 'unknown';
        }

        if (measurement) {
            let severity;
            if (cardTitle === 'Assist') {
                // For Assist, check if any measurement is not 'no risk'
                const hasRisk = Object.keys(measurement).some(key =>
                    key.includes('_measurement') && measurement[key] !== 'no risk' && measurement[key] !== null
                );
                severity = hasRisk ? 'At Risk' : 'No Risk';
            } else {
                severity = measurement[measurementProperty];
                // Only count if the severity is not null or undefined
                if (severity === null || severity === undefined) {
                    return; // Skip this user for this measurement
                }
            }

            if (gender === 'male') {
                maleData[severity] = (maleData[severity] || 0) + 1;
            } else if (gender === 'female') {
                femaleData[severity] = (femaleData[severity] || 0) + 1;
            }
        }
    });

    const allSeverities = new Set([...Object.keys(maleData), ...Object.keys(femaleData)]);
    Array.from(allSeverities).forEach(severity => {
        if (!maleData[severity]) maleData[severity] = 0;
        if (!femaleData[severity]) femaleData[severity] = 0;
    });

    return { maleData, femaleData };
};

const updateChartData = () => {
    if (filteredData.value && filteredData.value.length > 0) {
        const { maleData, femaleData } = countSeverityByGender(filteredData.value, props.cardTitle);
        const allSeverities = new Set([...Object.keys(maleData), ...Object.keys(femaleData)]);

        chartData.value = [
            {
                name: 'Male',
                data: Object.fromEntries(Array.from(allSeverities).map(severity => [severity, maleData[severity] || 0]))
            },
            {
                name: 'Female',
                data: Object.fromEntries(Array.from(allSeverities).map(severity => [severity, femaleData[severity] || 0]))
            }
        ];

        chartCategories.value = Array.from(allSeverities);
        chartDataReady.value = true;
    } else {
        chartDataReady.value = false;
    }
};

onMounted(() => {
    updateChartData();
});

watchEffect(() => {
    if (filteredData.value) {
        updateChartData();
    }
});
</script>

<style scoped>
.card {
    border: none;
    border-radius: 1rem;
    overflow: hidden;
    transition: all 0.3s ease;
    background: white;
}

.card-header {
    border-bottom: none;
    padding: 1.5rem;
}

.bg-gradient-dark {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.graph-title {
    color: white;
    font-weight: 600;
}

.chart-container {
    height: auto;
    position: relative;
}

.loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 400px;
}

.spinner-border {
    width: 3rem;
    height: 3rem;
    color: #2B656F;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .chart-container {
        height: 300px;
    }

    .card-body {
        padding: 1rem;
    }

    .graph-title {
        font-size: 1.2rem;
    }
}
</style>