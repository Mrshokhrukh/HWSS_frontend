<template>
    <div class="dashboard">
        <div class="row g-4 mt-1 mx-auto d-flex align-items-stretch">
            <div class="col-md-3 d-flex" v-for="(card, index) in countCards" :key="index">
                <div class="card flex-fill">
                    <div class="card-body text-center">
                        <h3 class="display-4 fw-bold mb-0 text-primary">{{ card.value }}</h3>
                        <p class="text-uppercase mb-0 text-muted">{{ card.label }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-4 mt-4 d-flex align-items-stretch">
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header bg-primary text-white">
                        <h3 class="card-title mb-0">No. of Students Screened (Per School)</h3>
                    </div>
                    <div class="card-body">
                        <apexchart type="bar" height="300" :options="schoolsChartOptions" :series="schoolsChartSeries">
                        </apexchart>
                    </div>
                </div>
            </div>
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header bg-primary text-white">
                        <h3 class="card-title mb-0">Event-based vs Case-based Screenings</h3>
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
                    <div class="card-header bg-primary text-white">
                        <h3 class="card-title mb-0">Mental Health Status (PHQ and GAD)</h3>
                    </div>
                    <div class="card-body">
                        <apexchart type="bar" height="300" :options="mentalHealthChartOptions"
                            :series="mentalHealthChartSeries"></apexchart>
                    </div>
                </div>
            </div>
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header bg-primary text-white">
                        <h3 class="card-title mb-0">Substance Use Disorder (SUD) Status</h3>
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
import { ref, computed, onMounted } from 'vue';
import VueApexCharts from "vue3-apexcharts";

const props = defineProps({
    filteredData: {
        type: Array,
        required: true
    }
});

const primaryColor = '#275D67';
const secondaryColor = '#A3CDB8';
const accentColors = ['#4A8895', '#6CB3A5', '#8EDDC8', '#B0F7EB'];

const uniqueSchools = computed(() => {
    const schools = new Set();
    props.filteredData.forEach(item => {
        if (item.agency_name && item.agency_name !== "Case Base Clients" && item.agency_name !== "Event Base Clients") {
            schools.add(item.agency_name.toLowerCase());
        }
    });
    return schools;
});

const noOfIndividualsWithSuicidalBehavior = computed(() => {
    return props.filteredData.filter(item =>
        item.measurement?.fields?.suicidal_measurement === "nearly everyday"
    ).length;
});

const noOfSchools = computed(() => uniqueSchools.value.size);

const uniqueAgencies = computed(() => {
    const agencies = new Set();
    props.filteredData.forEach(item => {
        if (item.agency_name &&
            !item.agency_name.toLowerCase().includes('school') &&
            item.agency_name !== "Case Base Clients" &&
            item.agency_name !== "Event Base Clients" &&
            item.agency_name !== null) {
            agencies.add(item.agency_name.toLowerCase());
        }
    });
    return agencies;
});

const noOfAgencies = computed(() => uniqueAgencies.value.size);

const totalScreenings = computed(() => props.filteredData.length);

const countCards = computed(() => [
    { label: 'Schools', value: noOfSchools.value },
    { label: 'Agencies', value: noOfAgencies.value },
    { label: 'Suicidal Behavior', value: noOfIndividualsWithSuicidalBehavior.value },
    { label: 'Total Screenings', value: totalScreenings.value }
]);

const commonChartOptions = {
    chart: {
        toolbar: {
            show: false
        },
        fontFamily: 'inherit'
    },
    dataLabels: {
        enabled: false
    },
    xaxis: {
        labels: {
            style: {
                colors: primaryColor
            }
        }
    },
    yaxis: {
        labels: {
            style: {
                colors: primaryColor
            }
        }
    },
    grid: {
        show: false
    },
    theme: {
        mode: 'light'
    }
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
            style: {
                color: primaryColor
            }
        }
    },
    colors: [primaryColor]
});

const schoolsChartSeries = computed(() => [{
    name: 'Students Screened',
    data: Array.from(uniqueSchools.value).map(school => {
        return props.filteredData.filter(item =>
            item.agency_name && item.agency_name.toLowerCase() === school
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
        labels: {
            colors: primaryColor
        }
    }
});

const screeningTypeChartSeries = computed(() => [
    props.filteredData.filter(item => item.agency_name === "Event Base Clients").length,
    props.filteredData.filter(item => item.agency_name === "Case Base Clients").length
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
            style: {
                color: primaryColor
            }
        }
    },
    colors: [primaryColor, secondaryColor],
    legend: {
        position: 'bottom',
        labels: {
            colors: primaryColor
        }
    }
});

const mentalHealthChartSeries = computed(() => [
    {
        name: 'PHQ-9',
        data: [
            props.filteredData.filter(item => item.measurement?.fields?.phq_measurement === 'minimal').length,
            props.filteredData.filter(item => item.measurement?.fields?.phq_measurement === 'mild').length,
            props.filteredData.filter(item => item.measurement?.fields?.phq_measurement === 'moderate').length,
            props.filteredData.filter(item => item.measurement?.fields?.phq_measurement === 'moderately severe').length,
            props.filteredData.filter(item => item.measurement?.fields?.phq_measurement === 'severe').length
        ]
    },
    {
        name: 'GAD-7',
        data: [
            props.filteredData.filter(item => item.measurement?.fields?.gad_measurement === 'minimal').length,
            props.filteredData.filter(item => item.measurement?.fields?.gad_measurement === 'mild').length,
            props.filteredData.filter(item => item.measurement?.fields?.gad_measurement === 'moderate').length,
            0,
            props.filteredData.filter(item => item.measurement?.fields?.gad_measurement === 'severe').length
        ]
    }
]);

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
            style: {
                color: primaryColor
            }
        }
    },
    colors: accentColors,
    legend: {
        show: false
    }
});

const sudChartSeries = computed(() => [{
    name: 'SUD Risk Level',
    data: [
        props.filteredData.filter(item => item.measurement_assist?.fields?.alcoholic_measurement === 'no risk').length,
        props.filteredData.filter(item => item.measurement_assist?.fields?.alcoholic_measurement === 'low risk').length,
        props.filteredData.filter(item => item.measurement_assist?.fields?.alcoholic_measurement === 'moderate risk').length,
        props.filteredData.filter(item => item.measurement_assist?.fields?.alcoholic_measurement === 'high risk').length
    ]
}]);

onMounted(() => {
    // Any initialization if needed
});
</script>

<style scoped>
.dashboard {
    font-family: 'Arial', sans-serif;
    background-color: #f8f9fa;
    padding: 20px;
}

.card {
    border: none;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
    border-bottom: none;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    padding: 15px 20px;
}

.card-body {
    padding: 20px;
}

.text-primary {
    color: #275D67 !important;
}

.bg-primary {
    background-color: #275D67 !important;
}

.btn-primary {
    background-color: #275D67;
    border-color: #275D67;
}

.btn-primary:hover {
    background-color: #1e4b54;
    border-color: #1e4b54;
}
</style>