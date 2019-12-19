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

// Define props to receive data from the parent component
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

// Calculate summary metrics
const calculateMetrics = () => {
    if (!Array.isArray(props.filteredData) || props.filteredData.length === 0) {
        totalResponses.value = 0;
        safetyScore.value = 0;
        supportScore.value = 0;
        engagementScore.value = 0;
        return;
    }

    totalResponses.value = props.filteredData.length;

    // Safety Score calculation
    const safetyResponses = props.filteredData.filter(r =>
        r?.screening_data?.school_env_data?.question === "I feel safe at school" && r?.screening_data?.school_env_data?.answer
    );
    const positiveSafetyResponses = safetyResponses.filter(r =>
        r.screening_data.school_env_data.answer === "Strongly Agree" || r.screening_data.school_env_data.answer === "Agree"
    ).length;
    safetyScore.value = safetyResponses.length > 0 ? Math.round((positiveSafetyResponses / safetyResponses.length) * 100) : 0;

    // Support Score calculation
    const supportResponses = props.filteredData.filter(r =>
        r?.screening_data?.school_env_data?.question === "My teachers and other staff are helpful and supportive" && r?.screening_data?.school_env_data?.answer
    );
    const positiveSupportResponses = supportResponses.filter(r =>
        r.screening_data.school_env_data.answer === "Strongly Agree" || r.screening_data.school_env_data.answer === "Agree"
    ).length;
    supportScore.value = supportResponses.length > 0 ? Math.round((positiveSupportResponses / supportResponses.length) * 100) : 0;

    // Engagement Score calculation
    const engagementResponses = props.filteredData.filter(r =>
        r?.screening_data?.school_env_data?.question === "My school engages all the students in all school activities" && r?.screening_data?.school_env_data?.answer
    );
    const positiveEngagementResponses = engagementResponses.filter(r =>
        r.screening_data.school_env_data.answer === "Strongly Agree" || r.screening_data.school_env_data.answer === "Agree"
    ).length;
    engagementScore.value = engagementResponses.length > 0 ? Math.round((positiveEngagementResponses / engagementResponses.length) * 100) : 0;
};

// Watcher for filteredData
watch(() => props.filteredData, (newData) => {
    calculateMetrics();
}, { deep: true });

// Chart Configurations
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
    colors: [colors.primary],
    plotOptions: {
        radar: {
            polygons: {
                strokeColor: colors.secondary,
                fill: {
                    colors: [colors.secondary]
                }
            }
        }
    }
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

// Computed series
const safetyChartSeries = computed(() => {
    if (!Array.isArray(props.filteredData) || props.filteredData.length === 0) {
        return [{ name: 'Responses', data: [0, 0, 0, 0, 0] }];
    }

    const safetyResponses = props.filteredData.filter(r =>
        r?.screening_data?.school_env_data?.question === "I feel safe at school" && r?.screening_data?.school_env_data?.answer
    );

    const counts = {
        'Strongly Agree': 0,
        'Agree': 0,
        'Neutral/Indifferent': 0,
        'Disagree': 0,
        'Strongly Disagree': 0
    };

    safetyResponses.forEach(response => {
        const answer = response.screening_data.school_env_data.answer;
        if (answer in counts) {
            counts[answer]++;
        }
    });

    return [{ name: 'Responses', data: Object.values(counts) }];
});

const environmentChartSeries = computed(() => {
    if (!Array.isArray(props.filteredData) || props.filteredData.length === 0) {
        return [{ name: 'Environment Score', data: [0, 0, 0, 0, 0] }];
    }
    // Calculate actual environment scores based on your data
    return [{
        name: 'Environment Score',
        data: [4.2, 3.8, 4.0, 4.5, 3.9] // Replace with actual calculations
    }];
});

const supportChartSeries = computed(() => {
    if (!Array.isArray(props.filteredData) || props.filteredData.length === 0) {
        return [0, 0, 0, 0, 0];
    }

    const supportResponses = props.filteredData.filter(r =>
        r?.screening_data?.school_env_data?.question === "My teachers and other staff are helpful and supportive" && r?.screening_data?.school_env_data?.answer
    );

    const counts = {
        'Strongly Agree': 0,
        'Agree': 0,
        'Neutral/Indifferent': 0,
        'Disagree': 0,
        'Strongly Disagree': 0
    };

    supportResponses.forEach(response => {
        const answer = response.screening_data.school_env_data.answer;
        if (answer in counts) {
            counts[answer]++;
        }
    });

    return Object.values(counts);
});

const engagementChartSeries = computed(() => {
    if (!Array.isArray(props.filteredData) || props.filteredData.length === 0) {
        return [0, 0, 0];
    }

    const engagementResponses = props.filteredData.filter(r =>
        r?.screening_data?.school_env_data?.question === "My school engages all the students in all school activities" && r?.screening_data?.school_env_data?.answer
    );

    const counts = {
        'High Engagement': 0,
        'Moderate Engagement': 0,
        'Low Engagement': 0
    };

    engagementResponses.forEach(response => {
        const answer = response.screening_data.school_env_data.answer;
        if (answer === "Strongly Agree" || answer === "Agree") {
            counts['High Engagement']++;
        } else if (answer === "Neutral/Indifferent") {
            counts['Moderate Engagement']++;
        } else {
            counts['Low Engagement']++;
        }
    });

    return Object.values(counts);
});

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