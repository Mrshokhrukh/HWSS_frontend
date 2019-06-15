<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="text-center text-capitalize">Total screened for the year: {{ getPreviousYear() }}</h4>
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
                <span class="legend-color" :style="{ 'background-color': chartColors[0] }"></span> Male ({{
                    chartData.Male }})
            </span>
            <span class="legend-item">
                <span class="legend-color" :style="{ 'background-color': chartColors[1] }"></span> Female ({{
                    chartData.Female
                }})
            </span>
            <span><strong>Total: {{ getTotalCount }}</strong></span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const chartPseudoData = ref({
    'Male': 1,
    'Female': 1
});

const chartData = ref({
    'Male': 0,
    'Female': 0
});

const chartColors = ref(['#2c6975', '#64ac99']);

const chartPseudoColors = ref(['#dedede', '#efefef']);

const getPreviousYear = () => {
    const currentYear = new Date().getFullYear();
    return currentYear - 1;
};

const getTotalCount = computed(() => {
    return Object.values(chartData.value).reduce((acc, curr) => acc + curr, 0);
});

const isDataEmpty = () => {
    return chartData.value.Male === 0 && chartData.value.Female === 0;
};

const agencyName = ref('');
const dataLoaded = ref(false);

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

                // Filter user submissions for the previous year
                const userSubmissions = reportData.filter(submission => {
                    return new Date(submission.original_submission_date).getFullYear() === previousYear;
                });

                let maleCount = 0;
                let femaleCount = 0;

                // Loop through filtered user submissions to count male and female
                userSubmissions.forEach(submission => {
                    const gender = submission.user.fields.gender;
                    if (gender === 'Male') {
                        maleCount++;
                    } else if (gender === 'Female') {
                        femaleCount++;
                    }
                });

                // Update chartData with the counts
                chartData.value = {
                    'Male': maleCount,
                    'Female': femaleCount
                };

                dataLoaded.value = true;
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
        }
    };

    fetchData();
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
