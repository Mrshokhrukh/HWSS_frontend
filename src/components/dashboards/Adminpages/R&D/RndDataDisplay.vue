<template>
    <div class="dashboard">
        <div class="row g-4 mt-4 d-flex align-items-stretch">
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Top Referral Sources</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="bar" height="350" :options="referralSourceChartOptions"
                            :series="referralSourceChartSeries"></apexchart>
                    </div>
                </div>
            </div>
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Assessment Completion Rate Over Time</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="line" height="350" :options="completionRateChartOptions"
                            :series="completionRateChartSeries"></apexchart>
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-4 mt-4 d-flex align-items-stretch">
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                        <h5 class="card-title mb-0">PHQ-9 Severity Distribution</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="bar" height="350" :options="phq9ChartOptions" :series="phq9ChartSeries">
                        </apexchart>
                    </div>
                </div>
            </div>
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                        <h5 class="card-title mb-0">GAD-7 Severity Distribution</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="bar" height="350" :options="gad7ChartOptions" :series="gad7ChartSeries">
                        </apexchart>
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-4 mt-4 d-flex align-items-stretch">

            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Substance Use Risk Summary</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="bar" height="350" :options="substanceRiskChartOptions"
                            :series="substanceRiskChartSeries"></apexchart>
                    </div>
                </div>
            </div>
        </div>
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

// Top Referral Sources Chart
const referralSourceChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar',
    },
    plotOptions: {
        bar: {
            horizontal: true,
            dataLabels: {
                position: 'top',
            },
        },
    },
    xaxis: {
        ...commonChartOptions.xaxis,
        categories: [],
    },
    yaxis: {
        ...commonChartOptions.yaxis,
        title: {
            text: 'Number of Referrals',
            style: { color: primaryColor },
        },
    },
    colors: [primaryColor, '#4A8895', '#6CB3A5', '#8EDDC8', '#B0F7EB'],
    dataLabels: {
        enabled: true,
        offsetX: -6,
        style: {
            fontSize: '12px',
            colors: ['#fff'],
        },
    },
});

const referralSourceChartSeries = computed(() => {
    const referralCounts = {};
    props.filteredData.forEach(item => {
        const agency = item.user?.active_agency?.agency_name;
        if (agency) {
            referralCounts[agency] = (referralCounts[agency] || 0) + 1;
        }
    });

    const sortedAgencies = Object.entries(referralCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5);

    return [
        {
            name: 'Referrals',
            data: sortedAgencies.map(([agency, count]) => ({ x: agency, y: count })),
        },
    ];
});

// Assessment Completion Rate Trend Chart
const completionRateChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'line',
    },
    xaxis: {
        ...commonChartOptions.xaxis,
        type: 'datetime',
        title: {
            text: 'Date',
            style: { color: primaryColor },
        },
    },
    yaxis: {
        ...commonChartOptions.yaxis,
        title: {
            text: 'Completion Rate (%)',
            style: { color: primaryColor },
        },
    },
    colors: [primaryColor],
    stroke: {
        width: 3,
        curve: 'smooth',
    },
    markers: {
        size: 4,
        colors: [primaryColor],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
            size: 7,
        },
    },
});

const completionRateChartSeries = computed(() => {
    const completionRates = props.filteredData
        .map(item => ({
            date: new Date(item.date),
            completed: item.assessment_status === 'Conducted',
        }))
        .filter(item => !isNaN(item.date.getTime())); // Filter out invalid date objects

    if (completionRates.length === 0) {
        return [];
    }

    const monthlyRates = {};
    completionRates.forEach(({ date, completed }) => {
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyRates[yearMonth]) {
            monthlyRates[yearMonth] = { completed: 0, total: 0 };
        }
        monthlyRates[yearMonth].completed += completed ? 1 : 0;
        monthlyRates[yearMonth].total += 1;
    });

    const seriesData = Object.entries(monthlyRates).map(([yearMonth, { completed, total }]) => ({
        x: new Date(yearMonth),
        y: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
    }));

    return [
        {
            name: 'Completion Rate',
            data: seriesData,
        },
    ];
});

// PHQ-9 Severity Distribution by Gender
const phq9ChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar',
        stacked: false // We want grouped bars, not stacked
    },
    xaxis: {
        ...commonChartOptions.xaxis,
        categories: ['Minimal', 'Mild', 'Moderate', 'Moderately Severe', 'Severe']
    },
    yaxis: {
        ...commonChartOptions.yaxis,
        title: {
            text: 'Number of Individuals',
            style: { color: primaryColor }
        }
    },
    colors: ['#275D67', '#A3CDB8'], // Example colors for male and female
    legend: {
        position: 'bottom',
        labels: { colors: primaryColor }
    }
});

const phq9ChartSeries = computed(() => {
    const getInterpretationCount = (data, interpretation, gender) => {
        return props.filteredData.filter(item => {
            if (typeof item.screening_data?.[data] === 'string') {
                try {
                    const parsedData = JSON.parse(item.screening_data[data]);
                    return parsedData.interpretation?.toLowerCase() === interpretation.toLowerCase() &&
                        item.user?.gender?.toLowerCase() === gender.toLowerCase();
                } catch (e) {
                    return false;
                }
            }
            return false;
        }).length;
    };

    return [
        {
            name: 'Male',
            data: [
                getInterpretationCount('phq_data', 'minimal', 'male'),
                getInterpretationCount('phq_data', 'mild', 'male'),
                getInterpretationCount('phq_data', 'moderate', 'male'),
                getInterpretationCount('phq_data', 'moderately severe', 'male'),
                getInterpretationCount('phq_data', 'severe', 'male')
            ]
        },
        {
            name: 'Female',
            data: [
                getInterpretationCount('phq_data', 'minimal', 'female'),
                getInterpretationCount('phq_data', 'mild', 'female'),
                getInterpretationCount('phq_data', 'moderate', 'female'),
                getInterpretationCount('phq_data', 'moderately severe', 'female'),
                getInterpretationCount('phq_data', 'severe', 'female')
            ]
        }
    ];
});

// GAD-7 Severity Distribution by Gender
const gad7ChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar',
        stacked: false // We want grouped bars, not stacked
    },
    xaxis: {
        ...commonChartOptions.xaxis,
        categories: ['Minimal', 'Mild', 'Moderate', 'Severe']
    },
    yaxis: {
        ...commonChartOptions.yaxis,
        title: {
            text: 'Number of Individuals',
            style: { color: primaryColor }
        }
    },
    colors: ['#275D67', '#A3CDB8'], // Example colors for male and female
    legend: {
        position: 'bottom',
        labels: { colors: primaryColor }
    }
});

const gad7ChartSeries = computed(() => {
    const getInterpretationCount = (data, interpretation, gender) => {
        return props.filteredData.filter(item => {
            if (typeof item.screening_data?.[data] === 'string') {
                try {
                    const parsedData = JSON.parse(item.screening_data[data]);
                    return parsedData.interpretation?.toLowerCase() === interpretation.toLowerCase() &&
                        item.user?.gender?.toLowerCase() === gender.toLowerCase();
                } catch (e) {
                    return false;
                }
            }
            return false;
        }).length;
    };

    return [
        {
            name: 'Male',
            data: [
                getInterpretationCount('gad_data', 'minimal', 'male'),
                getInterpretationCount('gad_data', 'mild', 'male'),
                getInterpretationCount('gad_data', 'moderate', 'male'),
                getInterpretationCount('gad_data', 'severe', 'male')
            ]
        },
        {
            name: 'Female',
            data: [
                getInterpretationCount('gad_data', 'minimal', 'female'),
                getInterpretationCount('gad_data', 'mild', 'female'),
                getInterpretationCount('gad_data', 'moderate', 'female'),
                getInterpretationCount('gad_data', 'severe', 'female')
            ]
        }
    ];
});

// Substance Use Risk Summary
const substanceRiskChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar',
    },
    xaxis: {
        ...commonChartOptions.xaxis,
        categories: ['Tobacco', 'Alcohol', 'Cannabis', 'Cocaine', 'Amphetamines', 'Inhalants', 'Sedatives', 'Hallucinogens', 'Opioids', 'Other'],
    },
    yaxis: {
        ...commonChartOptions.yaxis,
        title: {
            text: 'Number of Individuals',
            style: { color: primaryColor },
        },
    },
    colors: accentColors,
    legend: { show: false },
});

const substanceRiskChartSeries = computed(() => {
    const riskCounts = {
        'Tobacco': { 'none': 0, 'low': 0, 'moderate': 0, 'severe': 0 },
        'Alcohol': { 'none': 0, 'low': 0, 'moderate': 0, 'severe': 0 },
        'Cannabis': { 'none': 0, 'low': 0, 'moderate': 0, 'severe': 0 },
        'Cocaine': { 'none': 0, 'low': 0, 'moderate': 0, 'severe': 0 },
        'Amphetamines': { 'none': 0, 'low': 0, 'moderate': 0, 'severe': 0 },
        'Inhalants': { 'none': 0, 'low': 0, 'moderate': 0, 'severe': 0 },
        'Sedatives': { 'none': 0, 'low': 0, 'moderate': 0, 'severe': 0 },
        'Hallucinogens': { 'none': 0, 'low': 0, 'moderate': 0, 'severe': 0 },
        'Opioids': { 'none': 0, 'low': 0, 'moderate': 0, 'severe': 0 },
        'Other': { 'none': 0, 'low': 0, 'moderate': 0, 'severe': 0 }
    };

    props.filteredData.forEach(item => {
        const eventSubstanceRisks = item.event_substance_risks;
        const caseSubstanceRisks = item.case_substance_risks;

        if (Array.isArray(eventSubstanceRisks)) {
            eventSubstanceRisks.forEach(substance => {
                const substanceName = substance.substance_name.split(' ')[0]; // Extract the first word
                const riskFlag = substance.risk_flag.toLowerCase();
                if (riskCounts[substanceName]) {
                    riskCounts[substanceName][riskFlag.split(' ')[0]]++;
                }
            });
        }
        if (Array.isArray(caseSubstanceRisks)) {
            caseSubstanceRisks.forEach(substance => {
                const substanceName = substance.substance_name.split(' ')[0];
                const riskFlag = substance.risk_flag.toLowerCase();

                if (riskCounts[substanceName]) {
                    riskCounts[substanceName][riskFlag.split(' ')[0]]++;
                }
            });
        }
    });

    // Prepare the series data for the chart
    const seriesData = Object.keys(riskCounts).map(substanceName => ({
        name: substanceName,
        data: [
            riskCounts[substanceName]['none'],
            riskCounts[substanceName]['low'],
            riskCounts[substanceName]['moderate'],
            riskCounts[substanceName]['severe']
        ]
    }));

    return seriesData;
});
</script>

<style scoped>
.dashboard {
    font-family: 'Arial', sans-serif;
    background-color: #f8f9fa;
    padding: 2rem;
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
    border-radius: 15px 15px 0 0;
}

.card-header h5 {
    color: #ffffff;
    font-weight: bold;
    text-align: center;
    font-size: 1.2rem;
    margin: 0;
}

.card-body {
    padding: 1.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .card-header h5 {
        font-size: 1rem;
    }
}
</style>