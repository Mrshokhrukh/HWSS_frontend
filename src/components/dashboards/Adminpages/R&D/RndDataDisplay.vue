<template>
    <div class="row g-4 mt-1 mx-auto d-flex align-items-stretch">
        <div class="col-md-4 d-flex">
            <div class="card flex-fill">
                <div class="card-header hwss-primary text-white">
                    <h3 class="card-title mb-3 text-start">No. of Schools</h3>
                </div>
                <div class="card-body bg-info">
                    <p class="card-text display-3">{{ noOfSchools }}</p>
                </div>
            </div>
        </div>
        <div class="col-md-4 d-flex">
            <div class="card flex-fill">
                <div class="card-header hwss-primary text-white">
                    <h3 class="card-title mb-3 text-start">No. of Agency</h3>
                </div>
                <div class="card-body bg-info">
                    <p class="card-text display-3">{{ noOfAgencies }}</p>
                </div>
            </div>
        </div>
        <div class="col-md-4 d-flex">
            <div class="card flex-fill">
                <div class="card-header hwss-primary text-white">
                    <h3 class="card-title mb-3 text-start">Individuals with Suicidal Behavior</h3>
                </div>
                <div class="card-body bg-info">
                    <p class="card-text display-3">{{ noOfIndividualsWithSuicidalBehavior }}</p>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-5 mt-1 d-flex align-items-stretch">
        <div class="col-md-6 d-flex">
            <div class="card flex-fill">
                <div class="card-header hwss-primary text-white">
                    <h3 class="card-title mb-3 text-start">No. of Students Screened (Per School)</h3>
                </div>
                <div class="card-body hwss-primary">
                    <canvas ref="schoolsChart"></canvas>
                </div>
            </div>
        </div>
        <div class="col-md-6 d-flex">
            <div class="card flex-fill">
                <div class="card-header hwss-primary text-white">
                    <h3 class="card-title mb-3 text-start">Event-based vs Case-based Screenings</h3>
                </div>
                <div class="card-body">
                    <canvas ref="screeningTypeChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <div class="row g-5 mt-1 d-flex align-items-stretch">
        <div class="col-md-6 d-flex">
            <div class="card flex-fill">
                <div class="card-header hwss-primary text-white">
                    <h3 class="card-title mb-3 text-start">Mental Health Status (PHQ and GAD)</h3>
                </div>
                <div class="card-body">
                    <canvas ref="mentalHealthChart"></canvas>
                </div>
            </div>
        </div>
        <div class="col-md-6 d-flex">
            <div class="card flex-fill">
                <div class="card-header hwss-primary text-white">
                    <h3 class="card-title mb-3 text-start">Substance Use Disorder (SUD) Status</h3>
                </div>
                <div class="card-body">
                    <canvas ref="sudChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
    filteredData: {
        type: Array,
        required: true
    }
});

console.log("Filtered Data:", props.filteredData);

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

const schoolsChart = ref(null);
const screeningTypeChart = ref(null);
const mentalHealthChart = ref(null);
const sudChart = ref(null);

onMounted(() => {
    nextTick(() => {
        createCharts();
    });
});
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

const createCharts = () => {
    const schoolsData = {
        labels: Array.from(uniqueSchools.value),
        datasets: [{
            label: 'No. of Students Screened',
            data: Array.from(uniqueSchools.value).map(school => {
                return props.filteredData.filter(item =>
                    item.agency_name && item.agency_name.toLowerCase() === school
                ).length;
            }),
            backgroundColor: '#87ceeb',
            borderColor: '#87ceeb',
            borderWidth: 1
        }]
    };

    const screeningTypeData = {
        labels: ['Event-based Screenings', 'Case-based Screenings'],
        datasets: [{
            label: 'Number of Screenings',
            data: [
                props.filteredData.filter(item => item.agency_name === "Event Base Clients").length,
                props.filteredData.filter(item => item.agency_name === "Case Base Clients").length
            ],
            backgroundColor: ['#FF9F40', '#4BC0C0'],
            borderColor: ['#FF9F40', '#4BC0C0'],
            borderWidth: 1
        }]
    };

    const mentalHealthData = {
        labels: ['Minimal', 'Mild', 'Moderate', 'Moderately Severe', 'Severe'],
        datasets: [{
            label: 'PHQ-9 Severity',
            data: [
                props.filteredData.filter(item => item.measurement?.fields?.phq_measurement === 'minimal').length,
                props.filteredData.filter(item => item.measurement?.fields?.phq_measurement === 'mild').length,
                props.filteredData.filter(item => item.measurement?.fields?.phq_measurement === 'moderate').length,
                props.filteredData.filter(item => item.measurement?.fields?.phq_measurement === 'moderately severe').length,
                props.filteredData.filter(item => item.measurement?.fields?.phq_measurement === 'severe').length
            ],
            backgroundColor: '#36A2EB'
        }, {
            label: 'GAD-7 Severity',
            data: [
                props.filteredData.filter(item => item.measurement?.fields?.gad_measurement === 'minimal').length,
                props.filteredData.filter(item => item.measurement?.fields?.gad_measurement === 'mild').length,
                props.filteredData.filter(item => item.measurement?.fields?.gad_measurement === 'moderate').length,
                0,
                props.filteredData.filter(item => item.measurement?.fields?.gad_measurement === 'severe').length
            ],
            backgroundColor: '#FF6384'
        }]
    };


    const sudData = {
        labels: ['No Risk', 'Low Risk', 'Moderate Risk', 'High Risk'],
        datasets: [{
            label: 'SUD Risk Level',
            data: [
                props.filteredData.filter(item => item.measurement_assist?.fields?.alcoholic_measurement === 'no risk').length,
                props.filteredData.filter(item => item.measurement_assist?.fields?.alcoholic_measurement === 'low risk').length,
                props.filteredData.filter(item => item.measurement_assist?.fields?.alcoholic_measurement === 'moderate risk').length,
                props.filteredData.filter(item => item.measurement_assist?.fields?.alcoholic_measurement === 'high risk').length
            ],
            backgroundColor: ['#4BC0C0', '#36A2EB', '#FFCE56', '#FF6384']
        }]
    };

    createChart(schoolsChart.value, 'bar', schoolsData, {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'No. of Students Screened' }
        },
        scales: {
            y: { beginAtZero: true }
        }
    });

    createChart(screeningTypeChart.value, 'pie', screeningTypeData, {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Event-based vs Case-based Screenings' }
        }
    });


    createChart(mentalHealthChart.value, 'bar', mentalHealthData, {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Mental Health Status (PHQ-9 and GAD-7)' }
        },
        scales: {
            x: { stacked: false },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Individuals'
                }
            }
        }
    });

    createChart(sudChart.value, 'bar', sudData, {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Substance Use Disorder (SUD) Status' }
        },
        scales: {
            y: { beginAtZero: true }
        }
    });
};

const createChart = (ctx, type, data, options) => {
    if (ctx) {
        new Chart(ctx, { type, data, options });
    } else {
        console.error(`Canvas context is null for ${type} chart`);
    }
};
</script>

<style scoped>
.card {
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    height: 100%;
}

.card-header {
    padding: 10px;
    font-weight: bold;
    text-align: center;
    background-color: #fff;
}

.card-body {
    padding: 10px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.bg-info {
    background-color: #A3CDB8 !important;
}

canvas {
    width: 100% !important;
    height: 500px !important;
}

.row:first-child .card-body {
    height: 150px;
}
</style>