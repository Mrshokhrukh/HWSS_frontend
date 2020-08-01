<template>
    <div class="assessment-results-tab">
        <!-- Summary Statistics Cards -->
        <div class="row g-4 mb-4">
            <div class="col-md-3">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-clipboard-pulse fs-4 me-2 hwss-primary"></i>
                            <h6 class="mb-0">Total Assessments</h6>
                        </div>
                        <h3 class="mb-0 fw-bold">{{ totalAssessments }}</h3>
                        <small class="text-muted">Completed screenings</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-0 shadow-sm bg-danger bg-opacity-10">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-exclamation-triangle fs-4 me-2 text-danger"></i>
                            <h6 class="mb-0">High Risk Cases</h6>
                        </div>
                        <h3 class="mb-0 fw-bold">{{ highRiskCases }}</h3>
                        <small class="text-danger">Requires immediate attention</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-people fs-4 me-2 hwss-primary"></i>
                            <h6 class="mb-0">Active Cases</h6>
                        </div>
                        <h3 class="mb-0 fw-bold">{{ activeCases }}</h3>
                        <small class="text-muted">Under treatment</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-check-circle fs-4 me-2 hwss-primary"></i>
                            <h6 class="mb-0">Completed Cases</h6>
                        </div>
                        <h3 class="mb-0 fw-bold">{{ completedCases }}</h3>
                        <small class="text-muted">Successfully treated</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- PHQ-9 Assessment Section -->
        <section class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white py-3 border-bottom">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-graph-up fs-4 me-2 hwss-primary"></i>
                        <h6 class="mb-0 fw-semibold">PHQ-9 Depression Assessment Results</h6>
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="badge bg-danger me-2" v-if="criticalPhqCases > 0">
                            {{ criticalPhqCases }} Critical Cases
                        </span>
                        <Button icon="pi pi-download" label="Export" @click="exportPhqData" class="btn-custom-secondary"
                            size="small" />
                    </div>
                </div>
            </div>
            <div class="card-body p-4">
                <div class="chart-container">
                    <apexchart type="bar" height="350" :options="phq9ChartOptions" :series="phq9ChartSeries" />
                </div>
                <div class="alert alert-info mt-3" v-if="phq9Insights">
                    <i class="bi bi-info-circle me-2"></i>
                    {{ phq9Insights }}
                </div>
            </div>
        </section>

        <!-- GAD-7 Assessment Section -->
        <section class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white py-3 border-bottom">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-activity fs-4 me-2 hwss-primary"></i>
                        <h6 class="mb-0 fw-semibold">GAD-7 Anxiety Assessment Results</h6>
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="badge bg-danger me-2" v-if="criticalGadCases > 0">
                            {{ criticalGadCases }} Critical Cases
                        </span>
                        <Button icon="pi pi-download" label="Export" @click="exportGadData" class="btn-custom-secondary"
                            size="small" />
                    </div>
                </div>
            </div>
            <div class="card-body p-4">
                <div class="chart-container">
                    <apexchart type="bar" height="350" :options="gad7ChartOptions" :series="gad7ChartSeries" />
                </div>
                <div class="alert alert-info mt-3" v-if="gad7Insights">
                    <i class="bi bi-info-circle me-2"></i>
                    {{ gad7Insights }}
                </div>
            </div>
        </section>

        <!-- ACE Assessment Section -->
        <section class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white py-3 border-bottom">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-clipboard2-pulse fs-4 me-2 hwss-primary"></i>
                        <h6 class="mb-0 fw-semibold">ACE Score Distribution</h6>
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="badge bg-warning me-2" v-if="highAceCases > 0">
                            {{ highAceCases }} High ACE Scores
                        </span>
                        <Button icon="pi pi-download" label="Export" @click="exportAceData" class="btn-custom-secondary"
                            size="small" />
                    </div>
                </div>
            </div>
            <div class="card-body p-4">
                <div class="chart-container">
                    <apexchart type="bar" height="350" :options="aceChartOptions" :series="aceChartSeries" />
                </div>
                <div class="alert alert-info mt-3" v-if="aceInsights">
                    <i class="bi bi-info-circle me-2"></i>
                    {{ aceInsights }}
                </div>
            </div>
        </section>

        <!-- Risk Analysis Section -->
        <section class="card border-0 shadow-sm mb-4" v-if="showRiskAnalysis">
            <div class="card-header bg-white py-3 border-bottom">
                <div class="d-flex align-items-center">
                    <i class="bi bi-shield-exclamation fs-4 me-2 hwss-primary"></i>
                    <h6 class="mb-0 fw-semibold">Risk Analysis</h6>
                </div>
            </div>
            <div class="card-body p-4">
                <div class="row g-4">
                    <div class="col-md-4" v-for="risk in riskFactors" :key="risk.title">
                        <div class="risk-card p-3 rounded-3" :class="risk.severityClass">
                            <h6 class="mb-2">{{ risk.title }}</h6>
                            <div class="d-flex align-items-center">
                                <div class="risk-count fs-4 fw-bold me-2">{{ risk.count }}</div>
                                <div class="risk-description">{{ risk.description }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';

// Props and emits
const props = defineProps({
    filteredData: {
        type: Array,
        required: true,
        default: () => []
    }
});

const emit = defineEmits(['error']);

// Component state
const loading = ref(true);
const toast = useToast();

// Theme configuration
const theme = {
    colors: {
        primary: '#275D67',
        secondary: '#A3CDB8',
        success: '#2E7D32',
        warning: '#ED6C02',
        danger: '#D32F2F',
        accent: '#2B656F',
        muted: '#6c757d',
        border: '#e0e0e0'
    },
    fonts: {
        family: '"Inter", system-ui, -apple-system, sans-serif'
    }
};

// Chart configuration
const commonChartOptions = {
    chart: {
        toolbar: { show: false },
        fontFamily: theme.fonts.family,
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800
        }
    },
    plotOptions: {
        bar: {
            borderRadius: 4,
            columnWidth: '60%',
            distributed: true,
            dataLabels: {
                position: 'top'
            }
        }
    },
    dataLabels: {
        enabled: true,
        style: {
            fontSize: '12px',
            fontWeight: 500
        },
        background: {
            enabled: true,
            padding: 4,
            borderRadius: 2
        }
    },
    legend: {
        show: false
    },
    grid: {
        borderColor: theme.colors.border,
        strokeDashArray: 4
    },
    theme: { mode: 'light' }
};

// Statistics computed properties
const totalAssessments = computed(() => {
    return props.filteredData.filter(item =>
        item.screening_data &&
        (item.screening_data.phq_score !== null ||
            item.screening_data.gad_score !== null ||
            item.screening_data.ace_score !== null)
    ).length;
});

const highRiskCases = computed(() => {
    return props.filteredData.filter(item => {
        if (!item.screening_data) return false;
        const phqScore = item.screening_data.phq_score;
        const gadScore = item.screening_data.gad_score;
        return (phqScore >= 15 || gadScore >= 15);
    }).length;
});

const activeCases = computed(() => {
    return props.filteredData.filter(item =>
        item.case_status === 'On Going'
    ).length;
});

const completedCases = computed(() => {
    return props.filteredData.filter(item =>
        item.case_status === 'Case Closed'
    ).length;
});

// PHQ-9 Chart Configuration
const phq9ChartOptions = ref({
    ...commonChartOptions,
    colors: ['#98D7C2', '#67B99A', '#167D7F', '#29434E', '#1A237E'],
    xaxis: {
        categories: ['Minimal', 'Mild', 'Moderate', 'Moderately Severe', 'Severe'],
        labels: {
            style: { colors: theme.colors.accent }
        }
    },
    yaxis: {
        title: {
            text: 'Number of Cases',
            style: { color: theme.colors.accent }
        }
    }
});

const phq9ChartSeries = computed(() => {
    const severityCounts = {
        'Minimal': 0,
        'Mild': 0,
        'Moderate': 0,
        'Moderately Severe': 0,
        'Severe': 0
    };

    props.filteredData.forEach(item => {
        if (item.screening_data?.phq_interpretation) {
            const interpretation = item.screening_data.phq_interpretation;
            if (severityCounts.hasOwnProperty(interpretation)) {
                severityCounts[interpretation]++;
            }
        }
    });

    return [{
        name: 'Cases',
        data: Object.values(severityCounts)
    }];
});

// GAD-7 Chart Configuration
const gad7ChartOptions = ref({
    ...commonChartOptions,
    colors: ['#98D7C2', '#67B99A', '#167D7F', '#29434E'],
    xaxis: {
        categories: ['Minimal', 'Mild', 'Moderate', 'Severe'],
        labels: {
            style: { colors: theme.colors.accent }
        }
    },
    yaxis: {
        title: {
            text: 'Number of Cases',
            style: { color: theme.colors.accent }
        }
    }
});

const gad7ChartSeries = computed(() => {
    const severityCounts = {
        'Minimal': 0,
        'Mild': 0,
        'Moderate': 0,
        'Severe': 0
    };

    props.filteredData.forEach(item => {
        if (item.screening_data?.gad_interpretation) {
            const interpretation = item.screening_data.gad_interpretation;
            if (severityCounts.hasOwnProperty(interpretation)) {
                severityCounts[interpretation]++;
            }
        }
    });

    return [{
        name: 'Cases',
        data: Object.values(severityCounts)
    }];
});

// ACE Chart Configuration
const aceChartOptions = ref({
    ...commonChartOptions,
    colors: ['#167D7F'],
    xaxis: {
        categories: ['0-3', '4-6', '7-10'], // Group ACE scores into meaningful ranges
        title: {
            text: 'ACE Score Range',
            style: { color: theme.colors.accent }
        },
        labels: {
            style: { colors: theme.colors.accent }
        }
    },
    yaxis: {
        title: {
            text: 'Number of Cases',
            style: { color: theme.colors.accent }
        }
    },
    plotOptions: {
        bar: {
            ...commonChartOptions.plotOptions.bar,
            distributed: true
        }
    },
    tooltip: {
        y: {
            formatter: function (value) {
                return value + ' cases'
            }
        },
        x: {
            formatter: function (value) {
                return 'ACE Score ' + value
            }
        }
    }
});

const aceChartSeries = computed(() => {
    const scoreCounts = {
        low: 0,    // 0-3 scores
        medium: 0, // 4-6 scores
        high: 0    // 7-10 scores
    };

    props.filteredData.forEach(item => {
        try {
            // Parse ACE data
            let aceData;
            if (typeof item.screening_data?.ace_data === 'string') {
                aceData = JSON.parse(item.screening_data.ace_data);
            } else {
                aceData = item.screening_data?.ace_data;
            }

            // If we have direct ace_score, use it
            let aceScore = item.screening_data?.ace_score;

            // If no direct score but we have ace_data array, calculate score
            if (!aceScore && Array.isArray(aceData)) {
                aceScore = aceData.filter(response =>
                    response.answer === 'Yes' || response.selectedOption === 'Yes'
                ).length;
            }

            // Categorize scores
            if (aceScore !== null && aceScore !== undefined) {
                if (aceScore <= 3) scoreCounts.low++;
                else if (aceScore <= 6) scoreCounts.medium++;
                else scoreCounts.high++;
            }
        } catch (error) {
            console.error('Error processing ACE data:', error);
        }
    });

    return [{
        name: 'Cases',
        data: Object.values(scoreCounts)
    }];
});

// Risk Analysis Computed Properties
const criticalPhqCases = computed(() => {
    return props.filteredData.filter(item => {
        const phqScore = item.screening_data?.phq_score;
        return phqScore >= 15; // Moderately Severe to Severe cases
    }).length;
});

const criticalGadCases = computed(() => {
    return props.filteredData.filter(item => {
        const gadScore = item.screening_data?.gad_score;
        return gadScore >= 15; // Severe anxiety cases
    }).length;
});

const highAceCases = computed(() => {
    return props.filteredData.filter(item => {
        const aceScore = item.screening_data?.ace_score;
        return aceScore >= 4; // High ACE scores
    }).length;
});

const riskFactors = computed(() => [
    {
        title: 'Suicide Risk',
        count: getSuicideRiskCount(),
        description: 'Cases with suicidal ideation',
        severityClass: 'bg-danger bg-opacity-10'
    },
    {
        title: 'Severe Depression',
        count: criticalPhqCases.value,
        description: 'PHQ-9 score ≥ 15',
        severityClass: 'bg-warning bg-opacity-10'
    },
    {
        title: 'Severe Anxiety',
        count: criticalGadCases.value,
        description: 'GAD-7 score ≥ 15',
        severityClass: 'bg-warning bg-opacity-10'
    }
]);

// Insights
const phq9Insights = computed(() => {
    const total = props.filteredData.length;
    if (total === 0) return null;

    const severeCases = criticalPhqCases.value;
    const percentage = ((severeCases / total) * 100).toFixed(1);

    if (severeCases > 0) {
        return `${percentage}% of cases show severe depression symptoms requiring immediate attention.`;
    }
    return null;
});

const gad7Insights = computed(() => {
    const total = props.filteredData.length;
    if (total === 0) return null;

    const severeCases = criticalGadCases.value;
    const percentage = ((severeCases / total) * 100).toFixed(1);

    if (severeCases > 0) {
        return `${percentage}% of cases indicate severe anxiety levels requiring intervention.`;
    }
    return null;
});

const aceInsights = computed(() => {
    const total = props.filteredData.filter(item =>
        item.screening_data?.ace_score !== null ||
        (Array.isArray(item.screening_data?.ace_data) && item.screening_data.ace_data.length > 0)
    ).length;

    if (total === 0) return null;

    const data = aceChartSeries.value[0].data;
    const highRiskCount = data[2]; // High score count (7-10)
    const mediumRiskCount = data[1]; // Medium score count (4-6)

    const highRiskPercentage = ((highRiskCount / total) * 100).toFixed(1);
    const mediumRiskPercentage = ((mediumRiskCount / total) * 100).toFixed(1);

    let insight = '';
    if (highRiskCount > 0) {
        insight += `${highRiskPercentage}% of cases have high ACE scores (7-10), indicating significant childhood adversity. `;
    }
    if (mediumRiskCount > 0) {
        insight += `${mediumRiskPercentage}% show moderate ACE scores (4-6), suggesting moderate exposure to adverse experiences.`;
    }

    return insight || 'Most cases show low ACE scores (0-3), indicating lower exposure to childhood adversity.';
});

// Utility Functions
function getSuicideRiskCount() {
    return props.filteredData.filter(item => {
        const phqData = item.screening_data?.phq_data;
        if (!Array.isArray(phqData)) return false;

        // Check the suicide ideation question (typically the last question in PHQ-9)
        const suicideQuestion = phqData.find(q =>
            q.question.toLowerCase().includes('thoughts that you would be better off dead') ||
            q.question.toLowerCase().includes('hurting yourself')
        );

        return suicideQuestion && suicideQuestion.score >= 2; // Score of 2 or 3 indicates significant risk
    }).length;
}

// Export Functions
async function exportPhqData() {
    try {
        const data = props.filteredData
            .filter(item => item.screening_data?.phq_score !== null)
            .map(item => ({
                id: item.id,
                score: item.screening_data.phq_score,
                interpretation: item.screening_data.phq_interpretation,
                date: item.date
            }));

        const csv = convertToCSV(data);
        downloadCSV(csv, 'phq9_assessment_data.csv');

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'PHQ-9 data exported successfully',
            life: 3000
        });
    } catch (error) {
        handleError('Error exporting PHQ-9 data', error);
    }
}

async function exportGadData() {
    try {
        const data = props.filteredData
            .filter(item => item.screening_data?.gad_score !== null)
            .map(item => ({
                id: item.id,
                score: item.screening_data.gad_score,
                interpretation: item.screening_data.gad_interpretation,
                date: item.date
            }));

        const csv = convertToCSV(data);
        downloadCSV(csv, 'gad7_assessment_data.csv');

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'GAD-7 data exported successfully',
            life: 3000
        });
    } catch (error) {
        handleError('Error exporting GAD-7 data', error);
    }
}

async function exportAceData() {
    try {
        const data = props.filteredData
            .filter(item => item.screening_data?.ace_score !== null)
            .map(item => ({
                id: item.id,
                score: item.screening_data.ace_score,
                interpretation: item.screening_data.ace_interpretation,
                date: item.date
            }));

        const csv = convertToCSV(data);
        downloadCSV(csv, 'ace_assessment_data.csv');

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'ACE data exported successfully',
            life: 3000
        });
    } catch (error) {
        handleError('Error exporting ACE data', error);
    }
}

// Helper Functions
function convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => obj[header]));

    return [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function handleError(message, error) {
    console.error(message, error);
    emit('error', { message, error });
    toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 5000
    });
}

// Lifecycle Hooks
onMounted(() => {
    try {
        loading.value = false;
    } catch (error) {
        handleError('Error initializing dashboard', error);
    }
});
</script>

<style scoped>
.assessment-results-tab {
    max-width: 1400px;
    margin: 0 auto;
}

.chart-container {
    background-color: white;
    border-radius: 10px;
    transition: all 0.3s ease;
}

.chart-container:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.risk-card {
    background-color: white;
    transition: all 0.3s ease;
}

.risk-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.hwss-primary {
    color: v-bind('theme.colors.primary');
}

.btn-custom-secondary {
    background: rgba(39, 93, 103, 0.1);
    border: 1px solid rgba(39, 93, 103, 0.2);
    color: var(--primary-color);
}

.btn-custom-secondary:hover {
    background: rgba(39, 93, 103, 0.2);
    border-color: rgba(39, 93, 103, 0.3);
}

@media (max-width: 768px) {
    .card-body {
        padding: 1rem !important;
    }

    .chart-container {
        padding: 0.5rem;
    }
}

:root {
    --primary-color: #275D67;
    --primary-color-dark: #1D4851;
}
</style>