<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="text-center text-capitalize">Total screened for the year: {{ currentYear }}</h4>
        </div>
        <div class="card-body">
            <div v-if="error" class="error-message">
                {{ error }}
            </div>
            <div v-else-if="isLoading" class="loading-message">
                Loading data...
            </div>
            <div v-else class="chart-container">
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
import { ref, computed, inject, onMounted, watch } from 'vue';
import Chart from 'primevue/chart';

// Inject the filtered data from the parent component
const filteredData = inject('filteredData');

// You might want to inject these values from the parent as well
const currentYear = inject('currentYear', new Date().getFullYear());

const CHART_COLORS = ['#2c6975', '#33d4b9 '];

const agencyName = computed(() => {
    if (filteredData.value && filteredData.value.length > 0) {
        return filteredData.value[0]?.userDetails?.active_agency?.agency_name || 'N/A';
    }
    return 'N/A';
});

const chartData = ref({
    'Male': 0,
    'Female': 0
});

const error = ref(null);
const isLoading = ref(true);

const chartColors = computed(() => CHART_COLORS);
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
    isLoading.value = true;
    error.value = null;

    if (!filteredData || !filteredData.value) {
        console.error('filteredData is not available:', filteredData);
        error.value = 'Data is not available. Please try again later.';
        isLoading.value = false;
        return;
    }

    if (!Array.isArray(filteredData.value)) {
        console.error('filteredData.value is not an array:', filteredData.value);
        error.value = 'Data is not in the expected format. Please try again later.';
        isLoading.value = false;
        return;
    }

    if (!currentYear) {
        console.warn('currentYear is undefined');
        error.value = 'Current year is not set. Please try again later.';
        isLoading.value = false;
        return;
    }

    const currentYearData = filteredData.value.filter(user => {
        const submissionDate = user.measurement?.created_at
            ? new Date(user.measurement.created_at)
            : null;
        return submissionDate && submissionDate.getFullYear() === currentYear;
    });

    let maleCount = 0;
    let femaleCount = 0;

    currentYearData.forEach(user => {
        const gender = user.userDetails?.gender || user.sudData?.active?.sex;
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

    isLoading.value = false;
};

onMounted(() => {
    updateChartData();
});

// Watch for changes in filteredData and update chart accordingly
watch(() => filteredData.value, updateChartData, { deep: true });
watch(() => currentYear, updateChartData);
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