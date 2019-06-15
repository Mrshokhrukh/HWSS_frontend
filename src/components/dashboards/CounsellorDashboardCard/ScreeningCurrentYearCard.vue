<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="text-center text-capitalize">Total screened for the year: {{ getCurrentYear() }}</h4>
        </div>
        <div class="card-body">
            <template v-if="dataLoaded">
                <template v-if="!isDataEmpty()">
                    <!-- Pass colors array directly to the chart component -->
                    <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-75 mx-auto" />
                    <div class="mt-4 text-center">
                        <div class="hwss-primary text-capitalize font-italic"> {{ agencyName }}</div>
                    </div>
                </template>
                <template v-else>
                    <div class="pseudo-chart">
                        <p>No data available</p>
                    </div>
                </template>
            </template>
            <template v-else>
                <div class="pseudo-chart">
                    <p>Loading Data...</p>
                </div>
            </template>
        </div>
        <div class="card-footer">
            <!-- Use correct data access syntax -->
            <span class="legend-item">
                <span class="legend-color" :style="{ 'background-color': chartColors[0] }"></span> Male ({{
                    chartData.datasets[0].data[0] || 0 }})
            </span>
            <span class="legend-item">
                <span class="legend-color" :style="{ 'background-color': chartColors[1] }"></span> Female ({{
                    chartData.datasets[0].data[1] || 0
                }})
            </span>
            <span><strong>Total: {{ getTotalCount }}</strong></span>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const getAgencyName = JSON.parse(localStorage.getItem('userDetailsStore'))
const agencyName = getAgencyName?.agency?.agencyName || 'Unknown Agency';

const chartData = ref({
    'Male': 0,
    'Female': 0,
    'datasets': [{
        data: [],
        backgroundColor: [],
        borderWidth: 0
    }],
    'labels': []
});

const chartColors = ref(['#2c6975', '#64ac99']);
const dataLoaded = ref(false);

const chartOptions = ref();

const getCurrentYear = () => {
    return new Date().getFullYear();
};

const getTotalCount = ref(0);

const isDataEmpty = () => {
    return chartData.value.datasets[0].data.every(count => count === 0);
};

const fetchChartData = async () => {
    try {
        const storedReportData = sessionStorage.getItem('reportData');
        if (storedReportData) {
            const reportData = JSON.parse(storedReportData);
            updateChartData(reportData);
        }
    } catch (error) {
        console.error('Error fetching report data:', error);
    }
};

const updateChartData = (reportData) => {
    let maleCount = 0;
    let femaleCount = 0;

    reportData.forEach((item) => {
        const gender = item.user.fields.gender;
        if (gender === 'Male') {
            maleCount++;
        } else if (gender === 'Female') {
            femaleCount++;
        }
    });

    chartData.value.datasets[0].data = [maleCount, femaleCount];
    getTotalCount.value = maleCount + femaleCount;
    dataLoaded.value = true;
};

const initialFetchCompleted = ref(false);

onMounted(() => {
    if (initialFetchCompleted.value === false) {
        setTimeout(() => {
            fetchChartData();
            initialFetchCompleted.value = true;
        }, 1500);
    }
});

const setChartData = () => {
    return {
        labels: ['Male', 'Female'],
        datasets: [
            {
                backgroundColor: ['#2c6975', '#64ac99'],
                borderColor: ['#2c6975', '#64ac99'],
                borderWidth: 1
            }
        ]
    };
};

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    return {
        plugins: {
            legend: {
                labels: {
                    cutout: '60%',
                    color: textColor
                }
            }
        }
    };
};

onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});
</script>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.card {
    width: 400px;
}

.card-header {
    color: #2c6975;
    padding: 10px;
}

.card-body {
    padding: 20px;
}

.card-footer {
    padding: 10px;
    display: flex;
    justify-content: space-around;
    align-items: center;
}

.legend-item {
    display: flex;
    align-items: center;
}

.legend-color {
    width: 20px;
    height: 20px;
    margin-right: 5px;
    display: inline-block;
}

.pseudo-chart {
    text-align: center;
    padding: 20px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
}
</style>
