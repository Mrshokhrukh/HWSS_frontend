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
import { ref, computed, watchEffect, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCounselorDashboardStore } from '@/stores/counselorDashboard';

const store = useCounselorDashboardStore();
const { filteredUserData, isInitialized } = storeToRefs(store);

const props = defineProps({
    cardTitle: String
});

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
        if (user && user.measurementData) {
            const measurement = user.measurementData;
            const gender = user.gender ? user.gender.toLowerCase() : 'unknown';

            if (measurement[measurementProperty]) {
                const severity = measurement[measurementProperty];
                if (gender === 'male') {
                    maleData[severity] = (maleData[severity] || 0) + 1;
                } else if (gender === 'female') {
                    femaleData[severity] = (femaleData[severity] || 0) + 1;
                }
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
    if (filteredUserData.value && filteredUserData.value.length > 0) {
        const { maleData, femaleData } = countSeverityByGender(filteredUserData.value, props.cardTitle);
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
    if (!isInitialized.value) {
        store.initializeStore();
    }
});

watchEffect(() => {
    if (isInitialized.value && filteredUserData.value) {
        updateChartData();
    }
});
</script>

<style scoped>
.graph-title {
    color: #2c6975;
}
</style>