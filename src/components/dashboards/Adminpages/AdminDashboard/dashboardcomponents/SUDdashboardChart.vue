<template>
    <div class="screening-data-container">
        <h1 class="text-center fw-bold mb-4" style="color: #2c6975;">SUD Treatment Status in Bhutan</h1>
        <div class="card shadow-sm outer-card">
            <div class="card-body">
                <div class="card inner-card">
                    <div class="card-body">
                        <div v-if="loadingState === 'loading'" class="text-center loading-container">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        <div v-else-if="loadingState === 'timeout'" class="no-data-message">
                            <div class="message-container">
                                <span class="material-symbols-outlined">timer</span>
                                <p>Taking longer than expected. Please refresh the page.</p>
                            </div>
                        </div>
                        <div v-else-if="error" class="no-data-message">
                            <div class="message-container">
                                <span class="material-symbols-outlined">error_outline</span>
                                <p>{{ error }}</p>
                            </div>
                        </div>
                        <div v-else-if="hasNoAssistData" class="no-data-message">
                            <div class="message-container">
                                <span class="material-symbols-outlined">data_usage</span>
                                <p>No SUD treatment status data available at the moment</p>
                            </div>
                        </div>
                        <div v-else class="chart-container">
                            <canvas ref="chartCanvas"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, inject, watchEffect, nextTick, onBeforeUnmount } from 'vue';
import Chart from 'chart.js/auto';

// Props and Injections
const treatmentData = inject('serviceAndTreatmentData');

// Refs
const chartCanvas = ref(null);
const loadingState = ref('loading'); // 'loading', 'timeout', 'complete', 'error'
const hasNoAssistData = ref(false);
const error = ref(null);
let chart = null;
let timeoutId = null;

// Constants
const STATUS_MAPPING = {
    'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)': 'Primary Phase',
    'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)': 'Continuing Care',
    'Undergoing Rehabilitation': 'Undergoing Rehabilitation',
    'Treatment Completed': 'Treatment Completed',
    'Unwilling to Undergo Treatment': 'Non-compliance'
};

const CATEGORY_COLORS = {
    'Primary Phase': 'rgba(44, 105, 117, 1)',
    'Continuing Care': 'rgba(114, 190, 203, 1)',
    'Undergoing Rehabilitation': 'rgba(104, 178, 160, 1)',
    'Treatment Completed': 'rgba(180, 213, 191, 1)',
    'Non-compliance': 'rgba(255, 99, 132, 1)'
};

// Helper Functions
function startLoadingTimeout() {
    // Clear any existing timeout
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
        if (loadingState.value === 'loading') {
            loadingState.value = 'timeout';
        }
    }, 10000); // 10 seconds
}

function hasAssistData(screeningData) {
    try {
        if (!screeningData || typeof screeningData !== 'object') return false;

        const hasClusterAssist = Array.isArray(screeningData.assist_data) &&
            screeningData.assist_data.length > 0;
        const hasEventAssist = Array.isArray(screeningData.event_substance_risks) &&
            screeningData.event_substance_risks.length > 0;
        const hasCaseAssist = Array.isArray(screeningData.case_substance_risks) &&
            screeningData.case_substance_risks.length > 0;

        return hasClusterAssist || hasEventAssist || hasCaseAssist;
    } catch (err) {
        console.error('Error checking ASSIST data:', err);
        return false;
    }
}

function countFollowUpValues(data) {
    try {
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format');
        }

        const counts = {
            'Primary Phase': 0,
            'Continuing Care': 0,
            'Undergoing Rehabilitation': 0,
            'Treatment Completed': 0,
            'Non-compliance': 0
        };

        let assistDataFound = false;

        data.forEach(item => {
            const followUp = item?.follow_up;
            const hasAssist = hasAssistData(item?.screening_data);

            if (followUp && hasAssist) {
                assistDataFound = true;
                const followUpTrimmed = followUp.trim();

                if (followUpTrimmed === 'Treatment Completed') {
                    counts['Treatment Completed']++;
                } else {
                    Object.entries(STATUS_MAPPING).forEach(([original, mapped]) => {
                        if (followUpTrimmed === original) {
                            counts[mapped]++;
                        }
                    });

                    if (followUpTrimmed === 'Unwilling to Undergo Treatment') {
                        counts['Non-compliance']++;
                    }
                }
            }
        });

        hasNoAssistData.value = !assistDataFound;

        return Object.fromEntries(
            Object.entries(counts).filter(([_, value]) => value > 0)
        );
    } catch (err) {
        console.error('Error counting follow-up values:', err);
        error.value = 'Error processing data';
        loadingState.value = 'error'; // Update loading state to 'error'
        return {};
    }
}

function createChartConfig(labels, data, colors) {
    return {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('1)', '1)')),
                borderWidth: 1,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif"
                        },
                        color: '#2c6975',
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#2c6975',
                    titleFont: {
                        size: 14,
                        weight: 'bold',
                        family: "'Inter', sans-serif"
                    },
                    bodyColor: '#2c6975',
                    bodyFont: {
                        size: 13,
                        family: "'Inter', sans-serif"
                    },
                    padding: 12,
                    boxPadding: 6,
                    borderColor: '#e1e1e1',
                    borderWidth: 1,
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            },
            cutout: '60%'
        }
    };
}

async function createOrUpdateChart() {
    if (!chartCanvas.value) return;

    try {
        loadingState.value = 'loading';
        startLoadingTimeout();
        error.value = null;

        await nextTick();

        const ctx = chartCanvas.value.getContext('2d');
        const followUpCounts = countFollowUpValues(treatmentData.value);
        const labels = Object.keys(followUpCounts);
        const data = Object.values(followUpCounts);
        const colors = labels.map(label => CATEGORY_COLORS[label]);

        if (chart) {
            chart.destroy();
        }

        if (!hasNoAssistData.value && labels.length > 0) {
            chart = new Chart(ctx, createChartConfig(labels, data, colors));
        }

        loadingState.value = 'complete';
    } catch (err) {
        console.error('Error creating/updating chart:', err);
        error.value = 'Error displaying chart';
        loadingState.value = 'error';
    } finally {
        clearTimeout(timeoutId);
    }
}

// Watchers and Lifecycle Hooks
watchEffect(() => {
    if (treatmentData.value) {
        createOrUpdateChart();
    }
});

onMounted(() => {
    if (treatmentData.value) {
        createOrUpdateChart();
    } else {
        loadingState.value = 'complete';
    }
});

onBeforeUnmount(() => {
    if (chart) {
        chart.destroy();
    }
    clearTimeout(timeoutId);
});
</script>

<style scoped>
.screening-data-container {
    width: 100%;
}

.outer-card {
    background-color: #28565f;
    padding: 20px;
}

.inner-card {
    background-color: #ecf5f7;
    height: 400px;
}

.chart-container {
    height: 100%;
    width: 100%;
    position: relative;
}

.loading-container {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.no-data-message {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.message-container {
    text-align: center;
    color: #2c6975;
}

.message-container .material-symbols-outlined {
    font-size: 48px;
    margin-bottom: 1rem;
}

.message-container p {
    font-size: 1.2rem;
    margin: 0;
}

@media (min-width: 768px) {
    .outer-card {
        padding-left: 60px;
        padding-right: 60px;
    }
}

@media (min-width: 992px) {
    .outer-card {
        padding-left: 120px;
        padding-right: 120px;
    }
}

@media (min-width: 1200px) {
    .outer-card {
        padding-left: 260px;
        padding-right: 260px;
    }
}
</style>