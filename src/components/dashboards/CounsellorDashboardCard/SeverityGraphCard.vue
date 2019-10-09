<template>
    <div class="card w-100 card-bg h-100">
        <div class="card-header">
            <h4 class="graph-title text-center">Screening by Gender for: {{ props.cardTitle }}</h4>
        </div>
        <div class="card-body">
            <column-chart v-if="chartDataReady" :data="chartData" :colors="chartColors" :xtitle="'Severity'"
                :ytitle="'Count'" :borderSkipped="true" />
            <p v-else>Loading chart data...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, watchEffect, onMounted, inject } from 'vue';

const props = defineProps({
    cardTitle: String
});

// Inject the filtered data from the parent component
const filteredData = inject('filteredData');

const chartData = ref([]);
const chartCategories = ref([]);
const chartColors = ['#2c6975', '#64ac99'];
const chartDataReady = ref(false);

// Define a function to count occurrences of severity levels by gender
const countSeverityByGender = (data, cardTitle) => {
    const maleData = {};
    const femaleData = {};

    const titleToProperty = {
        'Suicidal Behavior': 'suicidal_measurement',
        'Depression': 'phq_measurement',
        'Anxiety': 'gad_measurement',
        'ACE': 'ace_measurement',
        'Assist': 'assist'
    };

    const measurementProperty = titleToProperty[cardTitle];

    data.forEach(user => {
        let measurement, gender;

        if (cardTitle === 'Assist') {
            measurement = user.measurementAssist;
            gender = user.sudData?.active?.sex?.toLowerCase() ||
                user.userDetails?.gender?.toLowerCase() || 'unknown';
        } else {
            measurement = user.measurement;
            gender = user.userDetails?.gender?.toLowerCase() ||
                user.sudData?.active?.sex?.toLowerCase() || 'unknown';
        }

        if (measurement) {
            let severity;
            if (cardTitle === 'Assist') {
                // For Assist, check if any measurement is not 'no risk'
                const hasRisk = Object.keys(measurement).some(key =>
                    key.includes('_measurement') && measurement[key] !== 'no risk' && measurement[key] !== null
                );
                severity = hasRisk ? 'At Risk' : 'No Risk';
            } else {
                severity = measurement[measurementProperty];
                // Only count if the severity is not null or undefined
                if (severity === null || severity === undefined) {
                    return; // Skip this user for this measurement
                }
            }

            if (gender === 'male') {
                maleData[severity] = (maleData[severity] || 0) + 1;
            } else if (gender === 'female') {
                femaleData[severity] = (femaleData[severity] || 0) + 1;
            }
        }
    });

    const allSeverities = new Set([...Object.keys(maleData), ...Object.keys(femaleData)]);
    Array.from(allSeverities).forEach(severity => {
        if (!maleData[severity]) maleData[severity] = 0;
        if (!femaleData[severity]) femaleData[severity] = 0;
    });

    return { maleData, femaleData };
};

const updateChartData = () => {
    if (filteredData.value && filteredData.value.length > 0) {
        const { maleData, femaleData } = countSeverityByGender(filteredData.value, props.cardTitle);
        const allSeverities = new Set([...Object.keys(maleData), ...Object.keys(femaleData)]);

        chartData.value = [
            {
                name: 'Male',
                data: Object.fromEntries(Array.from(allSeverities).map(severity => [severity, maleData[severity] || 0]))
            },
            {
                name: 'Female',
                data: Object.fromEntries(Array.from(allSeverities).map(severity => [severity, femaleData[severity] || 0]))
            }
        ];

        chartCategories.value = Array.from(allSeverities);
        chartDataReady.value = true;
    } else {
        chartDataReady.value = false;
    }
};

onMounted(() => {
    updateChartData();
});

watchEffect(() => {
    if (filteredData.value) {
        updateChartData();
    }
});
</script>

<style scoped>
.graph-title {
    color: #2c6975;
}
</style>