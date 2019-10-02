<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="text-center text-capitalize">Total screened for the year: {{ currentYear }}</h4>
        </div>
        <div class="card-body">
            <div class="chart-container">
                <Chart type="doughnut" :data="chartDisplayData" :options="chartOptions" />
            </div>
            <div class="mt-4 text-center">
                <div class="hwss-primary text-capitalize font-italic">{{ agencyName }}</div>
            </div>
        </div>
        <div class="card-footer">
            <span class="legend-item">
                <span class="legend-color" :style="{ 'background-color': displayColors[0] }"></span>
                Male ({{ chartData.Male }})
            </span>
            <span class="legend-item">
                <span class="legend-color" :style="{ 'background-color': displayColors[1] }"></span>
                Female ({{ chartData.Female }})
            </span>
            <span><strong>Total: {{ getTotalCount }}</strong></span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useCounselorDashboardStore } from '@/stores/counselorDashboard';
import Chart from 'primevue/chart';

const store = useCounselorDashboardStore();

const {
    isLoading,
    error,
    agencyName,
    currentYear,
    filteredUserData,
    CHART_COLORS
} = storeToRefs(store);

const chartData = ref({
    'Male': 0,
    'Female': 0
});

const chartColors = computed(() => CHART_COLORS?.value || ['#2c6975', '#F4A7B9']);
const chartPseudoColors = ['#dedede', '#efefef'];

const getTotalCount = computed(() => {
    return Object.values(chartData.value).reduce((acc, curr) => acc + curr, 0);
});

const isDataLoaded = computed(() => {
    return chartData.value.Male > 0 || chartData.value.Female > 0;
});

const chartDisplayData = computed(() => ({
    labels: ['Male', 'Female'],
    datasets: [{
        data: isDataLoaded.value ? [chartData.value.Male, chartData.value.Female] : [1, 1],
        backgroundColor: isDataLoaded.value ? chartColors.value : chartPseudoColors
    }]
}));

const displayColors = computed(() => isDataLoaded.value ? chartColors.value : chartPseudoColors);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            display: false
        }
    },
    cutout: '60%'
};

const updateChartData = () => {
    console.log('Updating chart data. Current year:', currentYear?.value);
    console.log('Filtered user data:', filteredUserData?.value);
    if (!filteredUserData?.value || !currentYear?.value) {
        console.warn('filteredUserData or currentYear is undefined');
        return;
    }
    const currentYearData = filteredUserData.value.filter(user => {
        const submissionDate = user.reportData?.original_submission_date
            ? new Date(user.reportData.original_submission_date)
            : user.measurementData?.created_at
                ? new Date(user.measurementData.created_at)
                : null;
        return submissionDate && submissionDate.getFullYear() === currentYear.value;
    });

    let maleCount = 0;
    let femaleCount = 0;

    currentYearData.forEach(user => {
        const gender = user.reportData?.user?.fields?.gender || user.sudData?.active?.sex;
        if (gender) {
            if (gender.toLowerCase() === 'male') {
                maleCount++;
            } else if (gender.toLowerCase() === 'female') {
                femaleCount++;
            }
        }
    });

    chartData.value = {
        'Male': maleCount,
        'Female': femaleCount
    };
};

onMounted(async () => {
    try {
        if (!store.isInitialized) {
            await store.initializeStore();
        }
        updateChartData();
    } catch (err) {
        console.error('Error in onMounted:', err);
    }
});

// Watch for changes in filteredUserData and update chart accordingly
watch(() => filteredUserData?.value, updateChartData, { deep: true });
watch(() => currentYear?.value, updateChartData);
</script>

<style scoped>
.card {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
}

.card-header {
    color: #2c6975;
    padding: 15px;
}

.card-body {
    padding: 20px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.chart-container {
    flex-grow: 1;
    position: relative;
    height: 0;
    padding-bottom: 100%;
}

.card-footer {
    padding: 15px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
}

.legend-item {
    display: flex;
    align-items: center;
    margin: 5px 10px;
}

.legend-color {
    width: 20px;
    height: 20px;
    margin-right: 5px;
    display: inline-block;
}

.hwss-primary {
    color: #2c6975;
}

@media (max-width: 576px) {
    .card-footer {
        flex-direction: column;
        align-items: flex-start;
    }

    .legend-item {
        margin: 5px 0;
    }
}
</style>