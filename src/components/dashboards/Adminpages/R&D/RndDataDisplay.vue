<template>
    <div class="dashboard">
        <div class="row g-4 mt-1 mx-auto d-flex align-items-stretch">
            <div class="col-md-3 d-flex" v-for="(card, index) in countCards" :key="index">
                <div class="card flex-fill count-card">
                    <div class="card-body text-center">
                        <h3 class="display-4 fw-bold mb-2">{{ card.value }}</h3>
                        <p class="text-uppercase mb-0">{{ card.label }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-4 mt-4 d-flex align-items-stretch">
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                        <h5 class="card-title mb-0">No. of Students Screened (Per School)</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="bar" height="300" :options="schoolsChartOptions" :series="schoolsChartSeries">
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

// Updated to match new data structure
const uniqueSchools = computed(() => {
    const schools = new Set();
    props.filteredData.forEach(item => {
        if (item.user?.agency_details?.agency?.agency_name &&
            !["Case Base Clients", "Event Base Clients"].includes(item.user.agency_details.agency.agency_name)) {
            schools.add(item.user.agency_details.agency.agency_name.toLowerCase());
        }
    });
    return schools;
});

// const noOfIndividualsWithSuicidalBehavior = computed(() => {
//     return props.filteredData.filter(item => {
//         const phqData = item.screening_data?.phq_data;
//         if (typeof phqData === 'string') {
//             try {
//                 const parsedData = JSON.parse(phqData);
//                 return parsedData.responses?.some(response =>
//                     response.question.includes('Thoughts that you would be better off dead') &&
//                     response.selectedOption === 'Nearly everyday'
//                 );
//             } catch (e) {
//                 return false;
//             }
//         }
//         return false;
//     }).length;
// });

// const noOfSchools = computed(() => uniqueSchools.value.size);

// const uniqueAgencies = computed(() => {
//     const agencies = new Set();
//     props.filteredData.forEach(item => {
//         const agencyName = item.user?.agency_details?.agency?.agency_name;
//         if (agencyName &&
//             !agencyName.toLowerCase().includes('school') &&
//             !["Case Base Clients", "Event Base Clients"].includes(agencyName)) {
//             agencies.add(agencyName.toLowerCase());
//         }
//     });
//     return agencies;
// });

// const noOfAgencies = computed(() => uniqueAgencies.value.size);

// const totalScreenings = computed(() => props.filteredData.length);

// const countCards = computed(() => [
//     { label: 'Schools', value: noOfSchools.value },
//     { label: 'Agencies', value: noOfAgencies.value },
//     { label: 'Suicidal Behavior', value: noOfIndividualsWithSuicidalBehavior.value },
//     { label: 'Total Screenings', value: totalScreenings.value }
// ]);

// Chart Options
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

// Schools Chart
const schoolsChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar'
    },
    xaxis: {
        ...commonChartOptions.xaxis,
        categories: Array.from(uniqueSchools.value)
    },
    yaxis: {
        ...commonChartOptions.yaxis,
        title: {
            text: 'Number of Students',
            style: { color: primaryColor }
        }
    },
    colors: [primaryColor]
});

const schoolsChartSeries = computed(() => [{
    name: 'Students Screened',
    data: Array.from(uniqueSchools.value).map(school => {
        return props.filteredData.filter(item =>
            item.user?.agency_details?.agency?.agency_name?.toLowerCase() === school
        ).length;
    })
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
    props.filteredData.filter(item =>
        item.user?.agency_details?.agency?.agency_name === "Event Base Clients"
    ).length,
    props.filteredData.filter(item =>
        item.user?.agency_details?.agency?.agency_name === "Case Base Clients"
    ).length
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