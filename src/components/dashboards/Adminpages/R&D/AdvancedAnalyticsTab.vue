<template>
    <div class="card border-0 shadow-sm rounded-3 mx-3 my-4">
        <div class="card-header border-0 p-4 custom-gradient">
            <div class="d-flex align-items-center mb-3">
                <i class="bi bi-gear-fill fs-4 me-2 text-white"></i>
                <h5 class="mb-0 text-white fw-semibold">Advanced Analytics</h5>
            </div>
        </div>
        <div class="card-body p-4">
            <section>
                <h4 class="section-title">Correlation Matrix</h4>
                <div class="chart-container">
                    <apexchart type="heatmap" height="350" :options="correlationMatrixOptions"
                        :series="correlationMatrixSeries">
                    </apexchart>
                </div>
            </section>

            <section>
                <h4 class="section-title">Scatter Plots</h4>
                <div class="chart-container">
                    <div class="scatter-plot-controls">
                        <label for="x-axis">X-Axis:</label>
                        <Dropdown id="x-axis" v-model="selectedXAxis" :options="scatterPlotVariables"
                            optionLabel="label" optionValue="value" placeholder="Select Variable" />

                        <label for="y-axis">Y-Axis:</label>
                        <Dropdown id="y-axis" v-model="selectedYAxis" :options="scatterPlotVariables"
                            optionLabel="label" optionValue="value" placeholder="Select Variable" />
                    </div>
                    <div v-if="selectedXAxis && selectedYAxis">
                        <apexchart type="scatter" height="350" :options="scatterPlotOptions"
                            :series="scatterPlotSeries">
                        </apexchart>
                    </div>
                    <div v-else class="text-center p-4 text-muted">
                        <p>Please select both X and Y variables to display the scatter plot.</p>
                    </div>
                </div>
            </section>

            <section>
                <h4 class="section-title">Time Series Analysis of Average Scores</h4>
                <div class="chart-container">
                    <apexchart type="line" height="350" :options="averageScoresOverTimeOptions"
                        :series="averageScoresOverTimeSeries">
                    </apexchart>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Dropdown from 'primevue/dropdown';

const props = defineProps({
    filteredData: {
        type: Array,
        required: true,
    },
});

// Theme Configuration
const theme = {
    colors: {
        primary: '#275D67',
        secondary: '#A3CDB8',
        accent: ['#4A8895', '#6CB3A5', '#8EDDC8', '#B0F7EB']
    }
};

// Common Chart Options
const commonChartOptions = {
    chart: {
        toolbar: {
            show: true,
            tools: {
                download: true,
                selection: false,
                zoom: false,
                zoomin: false,
                zoomout: false,
                pan: false,
                reset: false
            }
        },
        fontFamily: 'inherit',
        background: '#fff',
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800
        }
    },
    dataLabels: { enabled: false },
    xaxis: {
        labels: {
            style: { colors: theme.colors.primary },
            trim: true
        }
    },
    yaxis: {
        labels: { style: { colors: theme.colors.primary } }
    },
    grid: {
        show: true,
        borderColor: '#e0e0e0',
        strokeDashArray: 4
    },
    theme: { mode: 'light' },
    noData: {
        text: 'No data available',
        align: 'center',
        verticalAlign: 'middle',
        style: {
            color: theme.colors.primary,
            fontSize: '14px',
            fontFamily: 'inherit'
        }
    }
};

// Correlation Matrix Configuration
const correlationMatrixOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'heatmap',
    },
    plotOptions: {
        heatmap: {
            shadeIntensity: 0.5,
            radius: 0,
            useFillColorAsStroke: true,
            colorScale: {
                ranges: [
                    {
                        from: -1,
                        to: -0.5,
                        name: 'Strong Negative',
                        color: '#FF9999'
                    },
                    {
                        from: -0.5,
                        to: 0,
                        name: 'Weak Negative',
                        color: '#FFCCCC'
                    },
                    {
                        from: 0,
                        to: 0.5,
                        name: 'Weak Positive',
                        color: '#CCE6E6'
                    },
                    {
                        from: 0.5,
                        to: 1,
                        name: 'Strong Positive',
                        color: '#4A8895'
                    }
                ]
            }
        }
    },
    dataLabels: {
        enabled: true,
        style: {
            colors: ['#fff'],
            fontWeight: 600
        },
        formatter: (val) => val ? Number(val).toFixed(2) : '0.00'
    },
    tooltip: {
        enabled: true,
        theme: 'dark',
        style: {
            fontSize: '12px'
        },
        y: {
            formatter: (val) => val ? Number(val).toFixed(2) : '0.00'
        }
    }
});

// Scatter Plot Configuration
const scatterPlotVariables = [
    { label: 'PHQ-9 Score', value: 'phq_score' },
    { label: 'GAD-7 Score', value: 'gad_score' },
    { label: 'ACE Score', value: 'ace_score' }
];

const selectedXAxis = ref(null);
const selectedYAxis = ref(null);

const scatterPlotOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'scatter',
        zoom: {
            enabled: true,
            type: 'xy'
        }
    },
    markers: {
        size: 6,
        strokeWidth: 1,
        hover: {
            size: 8
        }
    },
    xaxis: {
        ...commonChartOptions.xaxis,
        tickAmount: 10,
        labels: {
            ...commonChartOptions.xaxis.labels,
            formatter: (val) => val ? Number(val).toFixed(1) : '0.0'
        },
        title: {
            text: '',
            style: { color: theme.colors.primary }
        }
    },
    yaxis: {
        ...commonChartOptions.yaxis,
        tickAmount: 7,
        title: {
            text: '',
            style: { color: theme.colors.primary }
        }
    },
    tooltip: {
        theme: 'dark',
        y: {
            formatter: (val) => val ? Number(val).toFixed(1) : '0.0'
        }
    }
});

// Time Series Configuration
const averageScoresOverTimeOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'line',
        zoom: { autoScaleYaxis: true }
    },
    stroke: {
        curve: 'smooth',
        width: 3
    },
    colors: theme.colors.accent,
    xaxis: {
        type: 'datetime',
        title: {
            text: 'Date',
            style: { color: theme.colors.primary }
        }
    },
    yaxis: {
        title: {
            text: 'Average Score',
            style: { color: theme.colors.primary }
        },
        labels: {
            formatter: (val) => val ? Number(val).toFixed(1) : '0.0'
        }
    },
    tooltip: {
        theme: 'dark',
        x: {
            format: 'MMM yyyy'
        },
        y: {
            formatter: (val) => val ? Number(val).toFixed(1) : '0.0'
        }
    }
});

// Computed Series
const correlationMatrixSeries = computed(() => {
    const variables = ['phq_score', 'gad_score', 'ace_score'];
    const correlationData = calculateCorrelationMatrix(props.filteredData, variables);

    return variables.map((variable, i) => ({
        name: formatLabel(variable),
        data: correlationData[i].map((value, j) => ({
            x: formatLabel(variables[j]),
            y: value
        }))
    }));
});

const scatterPlotSeries = computed(() => {
    if (!selectedXAxis.value || !selectedYAxis.value) {
        return [{ name: 'No Data', data: [] }];
    }

    const validData = props.filteredData
        .filter(item => {
            if (!item.screening_data) return false;
            const xValue = item.screening_data[selectedXAxis.value];
            const yValue = item.screening_data[selectedYAxis.value];
            return xValue !== null && xValue !== undefined &&
                yValue !== null && yValue !== undefined;
        })
        .map(item => ({
            x: parseFloat(item.screening_data[selectedXAxis.value]) || 0,
            y: parseFloat(item.screening_data[selectedYAxis.value]) || 0
        }));

    // Update axis titles
    scatterPlotOptions.value.xaxis.title.text = formatLabel(selectedXAxis.value);
    scatterPlotOptions.value.yaxis.title.text = formatLabel(selectedYAxis.value);

    return [{
        name: `${formatLabel(selectedXAxis.value)} vs ${formatLabel(selectedYAxis.value)}`,
        data: validData
    }];
});

const averageScoresOverTimeSeries = computed(() => {
    const scoreTypes = ['phq_score', 'gad_score', 'ace_score'];
    const monthlyScores = {};

    // Process data
    props.filteredData.forEach(item => {
        if (!item.date || !item.screening_data) return;

        const date = new Date(item.date);
        if (isNaN(date.getTime())) return;

        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        scoreTypes.forEach(scoreType => {
            const score = parseFloat(item.screening_data[scoreType]);
            if (!isNaN(score)) {
                if (!monthlyScores[monthKey]) {
                    monthlyScores[monthKey] = {};
                }
                if (!monthlyScores[monthKey][scoreType]) {
                    monthlyScores[monthKey][scoreType] = { total: 0, count: 0 };
                }
                monthlyScores[monthKey][scoreType].total += score;
                monthlyScores[monthKey][scoreType].count++;
            }
        });
    });

    return scoreTypes.map(scoreType => {
        const seriesData = Object.entries(monthlyScores)
            .map(([month, scores]) => {
                if (!scores[scoreType] || scores[scoreType].count === 0) return null;

                return {
                    x: new Date(month).getTime(),
                    y: Number((scores[scoreType].total / scores[scoreType].count).toFixed(1))
                };
            })
            .filter(point => point !== null)
            .sort((a, b) => a.x - b.x);

        return {
            name: formatLabel(scoreType),
            data: seriesData
        };
    }).filter(series => series.data.length > 0);
});

// Helper Functions
function formatLabel(key) {
    return key.split('_')
        .map(word => word.toUpperCase())
        .join('-');
}

function calculateCorrelationMatrix(data, variables) {
    const matrix = [];
    for (let i = 0; i < variables.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < variables.length; j++) {
            matrix[i][j] = i === j ? 1 : calculateCorrelation(data, variables[i], variables[j]);
        }
    }
    return matrix;
}

function calculateCorrelation(data, var1, var2) {
    const validData = data.filter(item => {
        if (!item.screening_data) return false;
        const val1 = parseFloat(item.screening_data[var1]);
        const val2 = parseFloat(item.screening_data[var2]);
        return !isNaN(val1) && !isNaN(val2);
    });

    if (validData.length < 2) return 0;

    const values1 = validData.map(item => parseFloat(item.screening_data[var1]));
    const values2 = validData.map(item => parseFloat(item.screening_data[var2]));

    const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
    const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;

    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;

    for (let i = 0; i < values1.length; i++) {
        numerator += (values1[i] - mean1) * (values2[i] - mean2);
        denominator1 += Math.pow(values1[i] - mean1, 2);
        denominator2 += Math.pow(values2[i] - mean2, 2);
    }

    if (denominator1 === 0 || denominator2 === 0) return 0;

    const correlation = numerator / Math.sqrt(denominator1 * denominator2);
    return parseFloat(correlation.toFixed(2));
}
</script>



<style scoped>
.analysis-tab section {
    margin-bottom: 2rem;
}

.chart-container {
    background-color: white;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-title {
    color: #2B656F;
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.scatter-plot-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

/* Custom gradient */
.custom-gradient {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

:deep(.btn-custom) {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: white;
}

:deep(.btn-custom:hover) {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.35);
}

.card-header h5 {
    margin: 0;
    color: #ffffff;
}
</style>