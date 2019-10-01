<template>
    <div class="card w-100 card-bg h-100">
        <div class="card-header">
            <h4 class="graph-title text-center">Screening by Gender for: {{ props.cardTitle }}</h4>
        </div>
        <div class="card-body">
            <column-chart :data="chartData" :colors="chartColors" :xtitle="'Severity'" :ytitle="'Count'"
                :borderSkipped="true" />
        </div>
    </div>
</template>

<script setup>
import { ref, inject, watchEffect } from 'vue';

const measurementData = ref(inject('measurementData'));

// Define a function to count occurrences of severity levels by gender
const countSeverityByGender = (data, cardTitle) => {
    const maleData = {};
    const femaleData = {};

    // Define a mapping object to map card titles to corresponding properties in the measurement data
    const titleToProperty = {
        'Suicidal Behavior': 'suicidal_measurement',
        'Depression': 'phq_measurement',
        'Anxiety': 'gad_measurement',
        'ACE': 'ace_measurement',
        'Assist': 'assist'
    };

    const measurementProperty = titleToProperty[cardTitle];

    // Iterate over measurement data
    data.forEach(entry => {
        const measurement = entry.measurement;
        const userDetails = entry.user_details;

        // Check if the measurement property corresponding to the card title exists
        if (measurement[measurementProperty]) {
            const gender = userDetails.gender.toLowerCase();
            const severity = measurement[measurementProperty];

            // Update count based on gender and severity level
            if (gender === 'male') {
                if (!maleData[severity]) {
                    maleData[severity] = 1;
                } else {
                    maleData[severity]++;
                }
            } else if (gender === 'female') {
                if (!femaleData[severity]) {
                    femaleData[severity] = 1;
                } else {
                    femaleData[severity]++;
                }
            }
        }
    });

    // Ensure that both male and female data contain the same severity levels
    const allSeverities = new Set([...Object.keys(maleData), ...Object.keys(femaleData)]);
    Array.from(allSeverities).forEach(severity => {
        if (!maleData[severity]) maleData[severity] = 0;
        if (!femaleData[severity]) femaleData[severity] = 0;
    });

    return { maleData, femaleData };
};

// Define the chart data and colors computed properties
const props = defineProps({
    cardTitle: String
});

let chartData = ref([]);
let chartCategories = ref([]);
let chartColors = ['#2c6975', '#64ac99'];

watchEffect(() => {
    const { maleData, femaleData } = countSeverityByGender(measurementData.value, props.cardTitle);

    // Get all unique severity levels from male and female data
    const allSeverities = new Set([...Object.keys(maleData), ...Object.keys(femaleData)]);

    // Transform the data structure to match the expected format with dynamically set keys
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

    // Set chart categories as all unique severity levels
    chartCategories.value = Array.from(allSeverities);
});
</script>




<style scoped>
.graph-title {
    color: #2c6975;
}
</style>