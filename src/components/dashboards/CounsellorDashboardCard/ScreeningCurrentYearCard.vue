<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="text-center text-capitalize">Total screened for the year: {{ getCurrentYear() }}</h4>
        </div>
        <div class="card-body">
            <template v-if="dataLoaded">
                <template v-if="!isDataEmpty()">
                    <!-- Pass colors array directly to the chart component -->
                    <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-75 mx-auto"/>
                    <div class="mt-4 text-center">
                        <div class="hwss-primary text-capitalize font-italic"> {{ agencyName }}</div>
                    </div>
                </template>
                <template v-else>
                    <div class="pseudo-chart">
                        <p>Loading Data...</p>
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
                <span class="legend-color" :style="{ 'background-color': chartColors[0] }"></span> Male ({{ chartData.Male }})
            </span>
            <span class="legend-item">
                <span class="legend-color" :style="{ 'background-color': chartColors[1] }"></span> Female ({{ chartData.Female }})
            </span>
            <span><strong>Total: {{ getTotalCount }}</strong></span>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const getAgencyName = JSON.parse(localStorage.getItem('userDetailsStore'))
// console.log(getAgencyName.agency.agencyName);
const agencyName = getAgencyName.agency.agencyName

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
console.log(getCurrentYear());

const getTotalCount = ref(0);

const isDataEmpty = () => {
    // Check if both Male and Female counts are zero
    return chartData.value.Male === 0 && chartData.value.Female === 0;
};

const fetchChartData = async () => {
    try {
        const storedReportData = sessionStorage.getItem('reportData');
        if (storedReportData) {
            const reportData = storedReportData;
            console.log(reportData);
            await updateChartData(reportData);
        } else {
            // Wait for sessionStorage to be populated
            await new Promise(resolve => {
                window.addEventListener('storage', async () => {
                    const storedData = sessionStorage.getItem('reportData');
                    if (storedData) {
                        const reportData = JSON.parse(storedData);
                        await updateChartData(reportData);
                        dataLoaded.value = true;
                        resolve();
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error fetching report data:', error);
    }
};

const updateChartData = async (reportData) => {
    // Initialize counts for Male and Female
    let maleCount = 0;
    let femaleCount = 0;

    // Iterate over reportData and count genders
    reportData.forEach((item, index) => {
        try {
            const users = JSON.parse(item.user);
            users.forEach((user, userIndex) => {
                try {
                    const fields = user.fields;
                    const gender = fields.gender;
                    if (gender) {
                        if (gender === 'Male') {
                            maleCount++;
                        } else if (gender === 'Female') {
                            femaleCount++;
                        }
                    } else {
                        console.error(`Gender not found for user ${userIndex} in item ${index}`);
                    }
                } catch (fieldsError) {
                    console.error(`Error processing fields for user ${userIndex} in item ${index}:`, fieldsError);
                }
            });
        } catch (userError) {
            console.error(`Error processing users for item ${index}:`, userError);
        }
    });

    // Update chart data
    chartData.value.Male = maleCount;
    chartData.value.Female = femaleCount;

    // Update total count
    getTotalCount.value = maleCount + femaleCount;

    // Update formatted data for pie chart
    chartData.value.labels = ['Male', 'Female'];
    chartData.value.datasets[0].data = [maleCount, femaleCount];
    dataLoaded.value = true; // Data is loaded
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
        labels: ['male', 'female'],
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
