<template>
    <div class="dashboard-container p-4">
        <!-- Summary Cards Row -->
        <div class="row mb-4">
            <div class="col-md-3 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">Total Responses</h5>
                        <h2 class="card-text fw-bold">{{ totalResponses }}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">Safety Score</h5>
                        <h2 class="card-text fw-bold">{{ safetyScore }}%</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">Support Score</h5>
                        <h2 class="card-text fw-bold">{{ supportScore }}%</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">Engagement Score</h5>
                        <h2 class="card-text fw-bold">{{ engagementScore }}%</h2>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Grid -->
        <div class="row">
            <!-- Safety Perception Chart -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Safety Perception</h5>
                        <apexchart type="bar" height="350" :options="safetyChartOptions" :series="safetyChartSeries" />
                    </div>
                </div>
            </div>

            <!-- Bullying & Punishment Chart -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">School Environment</h5>
                        <apexchart type="radar" height="350" :options="environmentChartOptions"
                            :series="environmentChartSeries" />
                    </div>
                </div>
            </div>

            <!-- Student Engagement Chart -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Student Engagement</h5>
                        <apexchart type="donut" height="350" :options="engagementChartOptions"
                            :series="engagementChartSeries" />
                    </div>
                </div>
            </div>

            <!-- Teacher Support Chart -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Teacher Support</h5>
                        <apexchart type="pie" height="350" :options="supportChartOptions"
                            :series="supportChartSeries" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import endpoints from '@/api';
import axios from 'axios';

// State variables
const surveyData = ref([]);
const totalResponses = ref(0);
const safetyScore = ref(0);
const supportScore = ref(0);
const engagementScore = ref(0);

// Fetch and process data
const fetchData = async () => {
    try {
        const response = await axios.get(endpoints.getSchoolEnvData);
        const processedData = processResponseData(response.data);
        surveyData.value = processedData;
        calculateMetrics();
    } catch (error) {
        console.error('Error fetching survey data:', error);
    }
};

// Process raw response data
const processResponseData = (rawData) => {
    return Object.values(rawData).flatMap(user => user.submissions);
};

// Calculate summary metrics
const calculateMetrics = () => {
    const responses = surveyData.value;
    totalResponses.value = Object.keys(responses).length;

    // Calculate Safety Score
    const safetyResponses = responses.filter(r => r.question === "I feel safe at school");
    const positiveSafetyResponses = safetyResponses.filter(r =>
        r.answer === "Strongly Agree" || r.answer === "Agree"
    ).length;
    safetyScore.value = Math.round((positiveSafetyResponses / safetyResponses.length) * 100);

    // Calculate Support Score
    const supportResponses = responses.filter(r =>
        r.question === "My teachers and other staff are helpful and supportive"
    );
    const positiveSupportResponses = supportResponses.filter(r =>
        r.answer === "Strongly Agree" || r.answer === "Agree"
    ).length;
    supportScore.value = Math.round((positiveSupportResponses / supportResponses.length) * 100);

    // Calculate Engagement Score
    const engagementResponses = responses.filter(r =>
        r.question === "My school engages all the students in all school activities"
    );
    const positiveEngagementResponses = engagementResponses.filter(r =>
        r.answer === "Strongly Agree" || r.answer === "Agree"
    ).length;
    engagementScore.value = Math.round((positiveEngagementResponses / engagementResponses.length) * 100);
};

// Chart Configurations
const safetyChartOptions = {
    chart: {
        type: 'bar',
        toolbar: {
            show: false
        }
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '55%',
            borderRadius: 5
        },
    },
    dataLabels: {
        enabled: false
    },
    xaxis: {
        categories: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
    },
    title: {
        text: 'Safety Perception Distribution',
        align: 'center',
        style: {
            fontSize: '16px',
            fontWeight: 'bold'
        }
    },
    colors: ['#0d6efd', '#198754', '#6c757d', '#dc3545', '#fd7e14']
};

const safetyChartSeries = computed(() => {
    if (!surveyData.value.length) return [];

    const safetyResponses = surveyData.value.filter(r => r.question === "I feel safe at school");
    const counts = {
        'Strongly Agree': 0,
        'Agree': 0,
        'Neutral/Indifferent': 0,
        'Disagree': 0,
        'Strongly Disagree': 0
    };

    safetyResponses.forEach(response => {
        counts[response.answer] = (counts[response.answer] || 0) + 1;
    });

    return [{
        name: 'Responses',
        data: Object.values(counts)
    }];
});

const environmentChartOptions = {
    chart: {
        type: 'radar',
        toolbar: {
            show: false
        }
    },
    xaxis: {
        categories: ['Safety', 'Bullying Free', 'Fair Treatment', 'Support', 'Engagement']
    },
    title: {
        text: 'School Environment Analysis',
        align: 'center',
        style: {
            fontSize: '16px',
            fontWeight: 'bold'
        }
    },
    stroke: {
        width: 2
    },
    fill: {
        opacity: 0.4
    },
    markers: {
        size: 4
    }
};

const environmentChartSeries = computed(() => {
    if (!surveyData.value.length) return [];

    const categories = {
        'Safety': "I feel safe at school",
        'Bullying Free': "My school is free of bullying",
        'Fair Treatment': "All the students receive fair treatment at school",
        'Support': "My teachers and other staff are helpful and supportive",
        'Engagement': "My school engages all the students in all school activities"
    };

    const scores = {};
    Object.entries(categories).forEach(([key, question]) => {
        const responses = surveyData.value.filter(r => r.question === question);
        const score = responses.reduce((acc, curr) => {
            const values = {
                'Strongly Agree': 5,
                'Agree': 4,
                'Neutral/Indifferent': 3,
                'Disagree': 2,
                'Strongly Disagree': 1
            };
            return acc + values[curr.answer];
        }, 0) / responses.length;
        scores[key] = score;
    });

    return [{
        name: 'Environment Score',
        data: Object.values(scores)
    }];
});

const supportChartOptions = {
    chart: {
        type: 'pie',
        toolbar: {
            show: false
        }
    },
    labels: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
    title: {
        text: 'Teacher Support Distribution',
        align: 'center',
        style: {
            fontSize: '16px',
            fontWeight: 'bold'
        }
    },
    colors: ['#0d6efd', '#198754', '#6c757d', '#dc3545', '#fd7e14'],
    legend: {
        position: 'bottom'
    }
};

const supportChartSeries = computed(() => {
    if (!surveyData.value.length) return [];

    const supportResponses = surveyData.value.filter(r =>
        r.question === "My teachers and other staff are helpful and supportive"
    );
    const counts = {
        'Strongly Agree': 0,
        'Agree': 0,
        'Neutral/Indifferent': 0,
        'Disagree': 0,
        'Strongly Disagree': 0
    };

    supportResponses.forEach(response => {
        counts[response.answer] = (counts[response.answer] || 0) + 1;
    });

    return Object.values(counts);
});

const engagementChartOptions = {
    chart: {
        type: 'donut',
        toolbar: {
            show: false
        }
    },
    labels: ['High Engagement', 'Moderate Engagement', 'Low Engagement'],
    title: {
        text: 'Student Engagement Levels',
        align: 'center',
        style: {
            fontSize: '16px',
            fontWeight: 'bold'
        }
    },
    colors: ['#0d6efd', '#6c757d', '#dc3545'],
    legend: {
        position: 'bottom'
    },
    plotOptions: {
        pie: {
            donut: {
                size: '70%'
            }
        }
    }
};

const engagementChartSeries = computed(() => {
    if (!surveyData.value.length) return [];

    const engagementResponses = surveyData.value.filter(r =>
        r.question === "My school engages all the students in all school activities"
    );

    const high = engagementResponses.filter(r =>
        r.answer === "Strongly Agree" || r.answer === "Agree"
    ).length;

    const moderate = engagementResponses.filter(r =>
        r.answer === "Neutral/Indifferent"
    ).length;

    const low = engagementResponses.filter(r =>
        r.answer === "Disagree" || r.answer === "Strongly Disagree"
    ).length;

    return [high, moderate, low];
});

// Initialize dashboard
onMounted(() => {
    fetchData();
});
</script>

<style scoped>
.dashboard-container {
    background-color: #f8f9fa;
    min-height: 100vh;
}

.card {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    border: none;
}

.card-title {
    color: #495057;
    font-size: 1.1rem;
    margin-bottom: 1rem;
}

.card-text {
    color: #212529
}
</style>