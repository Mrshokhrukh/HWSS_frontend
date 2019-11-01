<template>
    <div class="dashboard">
        <div class="row g-4 mt-4 d-flex align-items-stretch">
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                        <h5 class="card-title mb-0">No. of People Screened (Per Agency Type)</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="bar" height="300" :options="agencyChartOptions" :series="agencyChartSeries">
                        </apexchart>
                    </div>
                </div>
            </div>
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Event-based vs Case-based Screenings</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="pie" height="300" :options="screeningTypeChartOptions"
                            :series="screeningTypeChartSeries"></apexchart>
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-4 mt-4 d-flex align-items-stretch">
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Mental Health Status (PHQ and GAD)</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="bar" height="300" :options="mentalHealthChartOptions"
                            :series="mentalHealthChartSeries"></apexchart>
                    </div>
                </div>
            </div>
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Substance Use Disorder (SUD) Status</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="bar" height="300" :options="sudChartOptions" :series="sudChartSeries">
                        </apexchart>
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
        required: true
    }
});

const primaryColor = '#275D67';
const secondaryColor = '#A3CDB8';
const accentColors = ['#4A8895', '#6CB3A5', '#8EDDC8', '#B0F7EB'];

// Common chart options
const commonChartOptions = {
    chart: {
        toolbar: { show: false },
        fontFamily: 'inherit'
    },
    dataLabels: { enabled: false },
    xaxis: {
        labels: { style: { colors: primaryColor } }
    },
    yaxis: {
        labels: { style: { colors: primaryColor } }
    },
    grid: { show: false },
    theme: { mode: 'light' }
};

// Agency Chart Data
const agencyData = computed(() => {
    // Filter out case and event screenings first
    const validData = props.filteredData.filter(item =>
        !item.screening_data?.case && !item.screening_data?.event
    );

    // Check Gyalsung first since it's the highest priority
    const gyalsungCount = validData.filter(item =>
        item.screening_data?.academy_code ||
        (item.user?.is_gyalsung && item.user?.academy_code)
    ).length;

    // For schools and RCSC, explicitly exclude Gyalsung users
    const nonGyalsungData = validData.filter(item =>
        !(item.screening_data?.academy_code ||
            (item.user?.is_gyalsung && item.user?.academy_code))
    );

    // Count schools from remaining data
    const schoolCount = nonGyalsungData.filter(item =>
        item.user?.agency_details?.agency?.agency_name?.toLowerCase().includes('school')
    ).length;

    // RCSC is what's left after excluding both Gyalsung and schools
    const rcscCount = nonGyalsungData.filter(item =>
        item.user?.agency_details?.agency?.agency_name &&
        !item.user?.agency_details?.agency?.agency_name.toLowerCase().includes('school')
    ).length;

    return {
        schools: schoolCount,
        gyalsung: gyalsungCount,
        rcsc: rcscCount
    };
});

// Agency Chart
const agencyChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar'
    },
    xaxis: {
        ...commonChartOptions.xaxis,
        categories: ['Schools', 'Gyalsung', 'RCSC']
    },
    yaxis: {
        ...commonChartOptions.yaxis,
        title: {
            text: 'Number of People',
            style: { color: primaryColor }
        }
    },
    colors: [primaryColor]
});

const agencyChartSeries = computed(() => [{
    name: 'People Screened',
    data: [
        agencyData.value.schools,
        agencyData.value.gyalsung,
        agencyData.value.rcsc
    ]
}]);

// Screening Type Chart
const screeningTypeChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'pie'
    },
    labels: ['Event-based', 'Case-based'],
    colors: [primaryColor, secondaryColor],
    legend: {
        position: 'bottom',
        labels: { colors: primaryColor }
    }
});

const screeningTypeChartSeries = computed(() => [
    props.filteredData.filter(item => item.screening_data?.event).length,
    props.filteredData.filter(item => item.screening_data?.case).length
]);

// Mental Health Chart
const mentalHealthChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar',
        stacked: true
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
    colors: [primaryColor, secondaryColor],
    legend: {
        position: 'bottom',
        labels: { colors: primaryColor }
    }
});

const mentalHealthChartSeries = computed(() => {
    const getInterpretationCount = (data, interpretation) => {
        return props.filteredData.filter(item => {
            if (typeof item.screening_data?.[data] === 'string') {
                try {
                    const parsedData = JSON.parse(item.screening_data[data]);
                    return parsedData.interpretation?.toLowerCase() === interpretation.toLowerCase();
                } catch (e) {
                    return false;
                }
            }
            return false;
        }).length;
    };

    return [
        {
            name: 'PHQ-9',
            data: [
                getInterpretationCount('phq_data', 'minimal'),
                getInterpretationCount('phq_data', 'mild'),
                getInterpretationCount('phq_data', 'moderate'),
                getInterpretationCount('phq_data', 'moderately severe'),
                getInterpretationCount('phq_data', 'severe')
            ]
        },
        {
            name: 'GAD-7',
            data: [
                getInterpretationCount('gad_data', 'minimal'),
                getInterpretationCount('gad_data', 'mild'),
                getInterpretationCount('gad_data', 'moderate'),
                0,
                getInterpretationCount('gad_data', 'severe')
            ]
        }
    ];
});

// SUD Chart
const sudChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar'
    },
    xaxis: {
        ...commonChartOptions.xaxis,
        categories: ['No Risk', 'Low Risk', 'Moderate Risk', 'High Risk']
    },
    yaxis: {
        ...commonChartOptions.yaxis,
        title: {
            text: 'Number of Individuals',
            style: { color: primaryColor }
        }
    },
    colors: accentColors,
    legend: { show: false }
});

const sudChartSeries = computed(() => {
    let noRisk = 0;
    let lowRisk = 0;
    let moderateRisk = 0;
    let highRisk = 0;

    props.filteredData.forEach(item => {
        const assistData = item.screening_data?.assist_data;
        if (Array.isArray(assistData)) {
            assistData.forEach(substance => {
                if (substance.substance__name?.includes('Alcoholic beverages')) {
                    switch (substance.risk_flag) {
                        case 'none':
                            noRisk++;
                            break;
                        case 'low':
                            lowRisk++;
                            break;
                        case 'moderate':
                            moderateRisk++;
                            break;
                        case 'severe':
                            highRisk++;
                            break;
                    }
                }
            });
        }
    });

    return [{
        name: 'SUD Risk Level',
        data: [noRisk, lowRisk, moderateRisk, highRisk]
    }];
});
</script>


<style scoped>
.dashboard {
    font-family: 'Arial', sans-serif;
    background-color: #f8f9fa;
    padding: 20px;
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
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    padding: 1.5rem;
}

.count-card {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    color: white;
}

.count-card .card-body {
    background: transparent;
}

.count-card h3 {
    color: white !important;
    font-size: 2.5rem;
}

.count-card p {
    color: #A3CDB8 !important;
    font-size: 0.9rem;
}

.btn-primary {
    background-color: #2B656F;
    border-color: #2B656F;
}

.btn-primary:hover {
    background-color: #1D4851;
    border-color: #1D4851;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .card-header h5 {
        font-size: 1rem;
    }

    .count-card h3 {
        font-size: 2rem;
    }

    .count-card p {
        font-size: 0.8rem;
    }
}
</style>