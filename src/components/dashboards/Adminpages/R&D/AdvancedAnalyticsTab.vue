<template>
    <div class="advanced-analytics-tab">
        <section>
            <h4 class="section-title">Correlation Matrix</h4>
            <div class="chart-container">
                <apexchart type="heatmap" height="350" :options="correlationMatrixOptions"
                    :series="correlationMatrixSeries"></apexchart>
            </div>
        </section>

        <section>
            <h4 class="section-title">Scatter Plots</h4>
            <div class="chart-container">
                <div class="scatter-plot-controls">
                    <label for="x-axis">X-Axis:</label>
                    <Dropdown id="x-axis" v-model="selectedXAxis" :options="scatterPlotVariables" optionLabel="label"
                        optionValue="value" placeholder="Select Variable" />

                    <label for="y-axis">Y-Axis:</label>
                    <Dropdown id="y-axis" v-model="selectedYAxis" :options="scatterPlotVariables" optionLabel="label"
                        optionValue="value" placeholder="Select Variable" />
                </div>
                <div v-if="selectedXAxis && selectedYAxis">
                    <apexchart type="scatter" height="350" :options="scatterPlotOptions" :series="scatterPlotSeries">
                    </apexchart>
                </div>
                <div v-else>
                    <p>Please select both X and Y variables to display the scatter plot.</p>
                </div>
            </div>
        </section>
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

const primaryColor = '#275D67';

// Common chart options
const commonChartOptions = {
    chart: {
        toolbar: { show: true, tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } },
        fontFamily: 'inherit',
    },
    dataLabels: { enabled: false },
    xaxis: {
        labels: { style: { colors: primaryColor } },
    },
    yaxis: {
        labels: { style: { colors: primaryColor } },
    },
    grid: { show: true, borderColor: '#e0e0e0' },
    theme: { mode: 'light' },
};

// --- Correlation Matrix ---
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
                        to: 0,
                        name: 'Negative Correlation',
                        color: '#FF9999', // Example color for negative correlation
                    },
                    {
                        from: 0,
                        to: 1,
                        name: 'Positive Correlation',
                        color: '#4A8895', // Example color for positive correlation
                    },
                ],
            },
        },
    },
    dataLabels: {
        enabled: true,
        style: {
            colors: ['#000'], // Color of the data labels
        },
    },
    xaxis: {
        type: 'category',
        categories: ['PHQ-9', 'GAD-7', 'ACE'], // Customize based on variables you want to correlate
    },
});

const correlationMatrixSeries = computed(() => {
    const variables = ['phq_score', 'gad_score', 'ace_score']; // Update with your actual variable names
    const correlationData = calculateCorrelationMatrix(props.filteredData, variables);

    return variables.map((variable, i) => ({
        name: variable,
        data: correlationData[i].map(value => ({
            x: variables[correlationData[i].indexOf(value)],
            y: value,
        })),
    }));
});

// --- Scatter Plot ---
const scatterPlotVariables = [
    { label: 'PHQ-9 Score', value: 'phq_score' },
    { label: 'GAD-7 Score', value: 'gad_score' },
    { label: 'ACE Score', value: 'ace_score' },
    // Add other variables here
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
            type: 'xy',
        },
    },
    xaxis: {
        tickAmount: 10,
        labels: {
            formatter: function (val) {
                return parseFloat(val).toFixed(1);
            },
        },
    },
    yaxis: {
        tickAmount: 7,
    },
});

const scatterPlotSeries = computed(() => {
    if (!selectedXAxis.value || !selectedYAxis.value) {
        return [];
    }

    const data = props.filteredData
        .filter(item => item.screening_data && item.screening_data[selectedXAxis.value] !== null && item.screening_data[selectedYAxis.value] !== null)
        .map(item => ({
            x: item.screening_data[selectedXAxis.value],
            y: item.screening_data[selectedYAxis.value],
        }));

    return [
        {
            name: `${selectedXAxis.value} vs ${selectedYAxis.value}`,
            data: data,
        },
    ];
});

// --- Helper Functions ---
function calculateCorrelationMatrix(data, variables) {
    // Placeholder: Implement your correlation matrix calculation logic here
    // This is a simplified example using dummy correlation values
    const numVars = variables.length;
    const matrix = [];

    for (let i = 0; i < numVars; i++) {
        matrix[i] = [];
        for (let j = 0; j < numVars; j++) {
            if (i === j) {
                matrix[i][j] = 1;
            } else {
                matrix[i][j] = calculateCorrelation(data, variables[i], variables[j]);
            }
        }
    }

    return matrix;
}

function calculateCorrelation(data, var1, var2) {
    const validData = data.filter(item => item.screening_data && item.screening_data[var1] !== null && item.screening_data[var2] !== null);

    if (validData.length < 2) {
        return 0; // Not enough data to calculate correlation
    }

    const values1 = validData.map(item => item.screening_data[var1]);
    const values2 = validData.map(item => item.screening_data[var2]);

    const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
    const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;

    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;

    for (let i = 0; i < values1.length; i++) {
        numerator += (values1[i] - mean1) * (values2[i] - mean2);
        denominator1 += (values1[i] - mean1) ** 2;
        denominator2 += (values2[i] - mean2) ** 2;
    }

    const correlation = numerator / Math.sqrt(denominator1 * denominator2);
    return correlation.toFixed(2);
}
</script>

<style scoped>
.advanced-analytics-tab section {
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
</style>