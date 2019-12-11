<template>
    <div class="assessment-results-tab">
        <section>
            <h4 class="section-title">PHQ-9 Assessment Results</h4>
            <div class="chart-container">
                <apexchart type="bar" height="350" :options="phq9ChartOptions" :series="phq9ChartSeries"></apexchart>
            </div>
        </section>

        <section>
            <h4 class="section-title">GAD-7 Assessment Results</h4>
            <div class="chart-container">
                <apexchart type="bar" height="350" :options="gad7ChartOptions" :series="gad7ChartSeries"></apexchart>
            </div>
        </section>

        <section>
            <h4 class="section-title">ACE Score Distribution</h4>
            <div class="chart-container">
                <apexchart type="bar" height="350" :options="aceChartOptions" :series="aceChartSeries"></apexchart>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    filteredData: {
        type: Array,
        required: true,
    },
});

const primaryColor = '#275D67';
const secondaryColor = '#A3CDB8';
const accentColors = ['#4A8895', '#6CB3A5', '#8EDDC8', '#B0F7EB'];

// Common chart options
const commonChartOptions = {
    chart: {
        toolbar: { show: false },
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

// PHQ-9 Chart Options and Series
const phq9ChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar',
    },
    xaxis: {
        ...commonChartOptions.xaxis,
        categories: ['Minimal', 'Mild', 'Moderate', 'Moderately Severe', 'Severe'],
    },
    yaxis: {
        ...commonChartOptions.yaxis,
        title: {
            text: 'Number of Individuals',
            style: { color: primaryColor },
        },
    },
    colors: accentColors,
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
        const interpretation = item.screening_data?.phq_interpretation?.toLowerCase();
        if (interpretation && severityCounts.hasOwnProperty(interpretation)) {
            severityCounts[interpretation]++;
        }
    });

    return [
        {
            name: 'PHQ-9 Score Distribution',
            data: Object.values(severityCounts),
        },
    ];
});

// GAD-7 Chart Options and Series
const gad7ChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar',
    },
    xaxis: {
        ...commonChartOptions.xaxis,
        categories: ['Minimal', 'Mild', 'Moderate', 'Severe'],
    },
    yaxis: {
        ...commonChartOptions.yaxis,
        title: {
            text: 'Number of Individuals',
            style: { color: primaryColor },
        },
    },
    colors: accentColors,
});

const gad7ChartSeries = computed(() => {
    const severityCounts = {
        'Minimal': 0,
        'Mild': 0,
        'Moderate': 0,
        'Severe': 0
    };

    props.filteredData.forEach(item => {
        const interpretation = item.screening_data?.gad_interpretation?.toLowerCase();
        if (interpretation && severityCounts.hasOwnProperty(interpretation)) {
            severityCounts[interpretation]++;
        }
    });

    return [
        {
            name: 'GAD-7 Score Distribution',
            data: Object.values(severityCounts),
        },
    ];
});

// ACE Chart Options and Series
const aceChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar',
    },
    xaxis: {
        ...commonChartOptions.xaxis,
        categories: [],
    },
    yaxis: {
        ...commonChartOptions.yaxis,
        title: {
            text: 'Number of Individuals',
            style: { color: primaryColor },
        },
    },
    colors: [primaryColor],
});

const aceChartSeries = computed(() => {
    const aceScoreCounts = {};

    props.filteredData.forEach(item => {
        const aceScore = item.screening_data?.ace_score;
        if (aceScore !== null && aceScore !== undefined) {
            aceScoreCounts[aceScore] = (aceScoreCounts[aceScore] || 0) + 1;
        }
    });

    const categories = Object.keys(aceScoreCounts).sort((a, b) => a - b);
    aceChartOptions.value.xaxis.categories = categories;

    return [
        {
            name: 'ACE Score',
            data: categories.map(score => aceScoreCounts[score]),
        },
    ];
});
</script>

<style scoped>
.assessment-results-tab section {
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
</style>