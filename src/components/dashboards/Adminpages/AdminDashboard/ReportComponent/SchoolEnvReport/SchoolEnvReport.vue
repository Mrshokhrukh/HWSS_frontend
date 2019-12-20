<template>
    <div class="dashboard-container p-4">
        <!-- Summary Cards Row -->
        <div class="row mb-4">
            <div class="col-md-3 mb-3" v-for="(card, index) in summaryCards" :key="index">
                <div class="card h-100 count-card">
                    <div class="card-body">
                        <h5 class="card-title">{{ card.title }}</h5>
                        <h2 class="card-text fw-bold">{{ card.value }}{{ card.suffix }}</h2>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Grid -->
        <div class="row">
            <!-- Safety Perception Chart -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Safety Perception</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="bar" height="350" :options="safetyChartOptions" :series="safetyChartSeries" />
                    </div>
                </div>
            </div>

            <!-- School Environment Chart -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">School Environment</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="radar" height="350" :options="environmentChartOptions"
                            :series="environmentChartSeries" />
                    </div>
                </div>
            </div>

            <!-- Student Engagement Chart -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Student Engagement</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="donut" height="350" :options="engagementChartOptions"
                            :series="engagementChartSeries" />
                    </div>
                </div>
            </div>

            <!-- Teacher Support Chart -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Teacher Support</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="pie" height="350" :options="supportChartOptions"
                            :series="supportChartSeries" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// Props definition
const props = defineProps({
    filteredData: {
        type: Array,
        default: () => []
    }
});

// Color scheme constants
const colors = {
    primary: '#275D67',
    secondary: '#A3CDB8',
    accent: '#4A8895',
    accentColors: ['#4A8895', '#6CB3A5', '#8EDDC8', '#B0F7EB'],
    gradient: {
        start: '#2B656F',
        end: '#1D4851'
    }
};

// State variables
const totalResponses = ref(0);
const safetyScore = ref(0);
const supportScore = ref(0);
const engagementScore = ref(0);

// Summary Cards computed property
const summaryCards = computed(() => [
    { title: 'Total Responses', value: totalResponses.value, suffix: '' },
    { title: 'Safety Score', value: safetyScore.value, suffix: '%' },
    { title: 'Support Score', value: supportScore.value, suffix: '%' },
    { title: 'Engagement Score', value: engagementScore.value, suffix: '%' }
]);

// Helper function to get school environment data
const getSchoolEnvData = (data) => {
    if (data.school_env_data && Array.isArray(data.school_env_data)) {
        return data.school_env_data;
    }
    if (data?.screening_data?.school_env_data && Array.isArray(data.screening_data.school_env_data)) {
        return data.screening_data.school_env_data;
    }
    return [];
};

// Calculate metrics
const calculateMetrics = () => {
    if (!Array.isArray(props.filteredData) || props.filteredData.length === 0) {
        totalResponses.value = 0;
        safetyScore.value = 0;
        supportScore.value = 0;
        engagementScore.value = 0;
        return;
    }

    const responsesWithData = props.filteredData.filter(item =>
        getSchoolEnvData(item).length > 0
    );

    totalResponses.value = responsesWithData.length;

    let safetyTotal = 0;
    let safetyPositive = 0;
    let supportTotal = 0;
    let supportPositive = 0;
    let engagementTotal = 0;
    let engagementPositive = 0;

    responsesWithData.forEach(item => {
        const schoolEnvData = getSchoolEnvData(item);
        schoolEnvData.forEach(data => {
            if (data.question.includes("I feel safe at school")) {
                safetyTotal++;
                if (["Strongly Agree", "Agree"].includes(data.answer)) {
                    safetyPositive++;
                }
            }
            if (data.question.includes("teachers and other staff are helpful")) {
                supportTotal++;
                if (["Strongly Agree", "Agree"].includes(data.answer)) {
                    supportPositive++;
                }
            }
            if (data.question.includes("engages all the students")) {
                engagementTotal++;
                if (["Strongly Agree", "Agree"].includes(data.answer)) {
                    engagementPositive++;
                }
            }
        });
    });

    safetyScore.value = safetyTotal > 0 ? Math.round((safetyPositive / safetyTotal) * 100) : 0;
    supportScore.value = supportTotal > 0 ? Math.round((supportPositive / supportTotal) * 100) : 0;
    engagementScore.value = engagementTotal > 0 ? Math.round((engagementPositive / engagementTotal) * 100) : 0;
};

// Chart Options
const commonChartOptions = {
    chart: {
        fontFamily: 'inherit',
        toolbar: { show: false }
    },
    theme: { mode: 'light' }
};

const safetyChartOptions = {
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar'
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '55%',
            borderRadius: 5
        },
    },
    dataLabels: { enabled: false },
    xaxis: {
        categories: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
        labels: { style: { colors: colors.primary } }
    },
    yaxis: {
        labels: { style: { colors: colors.primary } }
    },
    colors: [colors.primary, colors.secondary, ...colors.accentColors]
};

const environmentChartOptions = {
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'radar'
    },
    xaxis: {
        categories: ['Safety', 'Bullying Free', 'Fair Treatment', 'Support', 'Engagement']
    },
    stroke: { width: 2 },
    fill: { opacity: 0.4 },
    markers: { size: 4 },
    colors: [colors.primary]
};

const supportChartOptions = {
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'pie'
    },
    labels: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
    colors: [colors.primary, colors.secondary, ...colors.accentColors],
    legend: {
        position: 'bottom',
        labels: { colors: colors.primary }
    }
};

const engagementChartOptions = {
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'donut'
    },
    labels: ['High Engagement', 'Moderate Engagement', 'Low Engagement'],
    colors: [colors.primary, colors.secondary, colors.accent],
    legend: {
        position: 'bottom',
        labels: { colors: colors.primary }
    },
    plotOptions: {
        pie: {
            donut: {
                size: '70%',
                labels: {
                    show: true,
                    name: { show: true },
                    value: {
                        show: true,
                        color: colors.primary
                    }
                }
            }
        }
    }
};

// Computed Series
const safetyChartSeries = computed(() => {
    if (!Array.isArray(props.filteredData) || props.filteredData.length === 0) {
        return [{ name: 'Responses', data: [0, 0, 0, 0, 0] }];
    }

    const counts = {
        'Strongly Agree': 0,
        'Agree': 0,
        'Neutral': 0,
        'Disagree': 0,
        'Strongly Disagree': 0
    };

    props.filteredData.forEach(item => {
        const schoolEnvData = getSchoolEnvData(item);
        schoolEnvData.forEach(data => {
            if (data.question.includes("I feel safe at school")) {
                counts[data.answer] = (counts[data.answer] || 0) + 1;
            }
        });
    });

    return [{ name: 'Responses', data: Object.values(counts) }];
});

const environmentChartSeries = computed(() => {
    if (!Array.isArray(props.filteredData) || props.filteredData.length === 0) {
        return [{ name: 'Environment Score', data: [0, 0, 0, 0, 0] }];
    }

    const getScoreForQuestion = (questionText) => {
        let totalResponses = 0;
        let positiveResponses = 0;

        props.filteredData.forEach(item => {
            const schoolEnvData = getSchoolEnvData(item);
            schoolEnvData.forEach(data => {
                if (data.question.includes(questionText)) {
                    totalResponses++;
                    if (["Strongly Agree", "Agree"].includes(data.answer)) {
                        positiveResponses++;
                    }
                }
            });
        });

        return totalResponses > 0 ? Math.round((positiveResponses / totalResponses) * 100) : 0;
    };

    return [{
        name: 'Environment Score',
        data: [
            getScoreForQuestion("safe at school"),
            getScoreForQuestion("free of bullying"),
            getScoreForQuestion("fair treatment"),
            getScoreForQuestion("teachers and other staff are helpful"),
            getScoreForQuestion("engages all the students")
        ]
    }];
});

const supportChartSeries = computed(() => {
    if (!Array.isArray(props.filteredData) || props.filteredData.length === 0) {
        return [0, 0, 0, 0, 0];
    }

    const counts = {
        'Strongly Agree': 0,
        'Agree': 0,
        'Neutral': 0,
        'Disagree': 0,
        'Strongly Disagree': 0
    };

    props.filteredData.forEach(item => {
        const schoolEnvData = getSchoolEnvData(item);
        schoolEnvData.forEach(data => {
            if (data.question.includes("teachers and other staff are helpful")) {
                counts[data.answer] = (counts[data.answer] || 0) + 1;
            }
        });
    });

    return Object.values(counts);
});

const engagementChartSeries = computed(() => {
    if (!Array.isArray(props.filteredData) || props.filteredData.length === 0) {
        return [0, 0, 0];
    }

    let highCount = 0;
    let moderateCount = 0;
    let lowCount = 0;

    props.filteredData.forEach(item => {
        const schoolEnvData = getSchoolEnvData(item);
        schoolEnvData.forEach(data => {
            if (data.question.includes("engages all the students")) {
                if (["Strongly Agree", "Agree"].includes(data.answer)) {
                    highCount++;
                } else if (data.answer === "Neutral") {
                    moderateCount++;
                } else {
                    lowCount++;
                }
            }
        });
    });

    return [highCount, moderateCount, lowCount];
});

// Watch for data changes
watch(() => props.filteredData, (newData) => {
    if (newData) {
        calculateMetrics();
    }
}, { deep: true, immediate: true });

// Initialize on mount
onMounted(() => {
    calculateMetrics();
});
</script>

<style scoped>
.dashboard-container {
    background-color: #f8f9fa;
    min-height: 100vh;
    border-radius: 14px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card {
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    border: none;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.card-header {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    border-bottom: none;
    padding: 1rem;
}

.card-header h5 {
    color: #ffffff;
    font-weight: bold;
    font-size: 1.1rem;
    margin: 0;
}

.card-body {
    padding: 1.5rem;
}

.count-card {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.count-card .card-title {
    color: #A3CDB8;
    font-size: 0.9rem;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
}

.count-card .card-text {
    color: white;
    font-size: 2.5rem;
}

@media (max-width: 768px) {
    .card-header h5 {
        font-size: 1rem;
    }

    .count-card .card-text {
        font-size: 2rem;
    }

    .count-card .card-title {
        font-size: 0.8rem;
    }
}
</style>