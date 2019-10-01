<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="text-center text-capitalize">Total screened for the year: {{ getPreviousYear() }}</h4>
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
import { ref, computed, onMounted } from 'vue';

const chartData = ref({
    'Male': 0,
    'Female': 0
});

const chartColors = ['#2c6975', '#64ac99'];
const chartPseudoColors = ['#dedede', '#efefef'];

const getPreviousYear = () => {
    return new Date().getFullYear() - 1;
};

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
        backgroundColor: isDataLoaded.value ? chartColors : chartPseudoColors
    }]
}));

const displayColors = computed(() => isDataLoaded.value ? chartColors : chartPseudoColors);

const agencyName = ref('');

const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            display: true
        }
    },
};

onMounted(() => {
    const fetchData = async () => {
        try {
            const storedReportData = sessionStorage.getItem('reportData');
            const storedUserDetails = localStorage.getItem('userDetailsStore');

            if (storedReportData && storedUserDetails) {
                const reportData = JSON.parse(storedReportData);
                const userDetails = JSON.parse(storedUserDetails);
                agencyName.value = userDetails.agency.agencyName;

                const previousYear = getPreviousYear();

                const userSubmissions = reportData.filter(submission => {
                    return new Date(submission.original_submission_date).getFullYear() === previousYear;
                });

                let maleCount = 0;
                let femaleCount = 0;

                userSubmissions.forEach(submission => {
                    const gender = submission.user.fields.gender;
                    if (gender === 'Male') {
                        maleCount++;
                    } else if (gender === 'Female') {
                        femaleCount++;
                    }
                });

                chartData.value = {
                    'Male': maleCount,
                    'Female': femaleCount
                };
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
        }
    };

    fetchData();
});

</script>

<style scoped>
.card {
    width: 100%;
    max-width: 400px;
    /* Adjusted to match the image */
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
    /* This creates a 1:1 aspect ratio */
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