<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="text-center">Total screened for the year: {{ getCurrentYear() }}</h4>
        </div>
        <div class="card-body">
            <template v-if="!isDataEmpty()">
                <pie-chart :donut="true" :data="chartData" :colors="chartColors" legend="bottom" loading="Loading..." />
            </template>
            <template v-else>
                <div class="pseudo-chart">
                    <p>Loading Data...</p>
                </div>
            </template>
        </div>
        <div class="card-footer">
            <span class="legend-item">
                <span class="legend-color" :style="{ 'background-color': chartColors[0] }"></span> Male ({{ chartData.Male
                }})
            </span>
            <span class="legend-item">
                <span class="legend-color" :style="{ 'background-color': chartColors[1] }"></span> Female ({{
                    chartData.Female }})
            </span>
            <span><strong>Total: {{ getTotalCount }}</strong></span>
        </div>
    </div>
</template>
  
<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';

const chartData = ref({
    'Male': 0,
    'Female': 0
});

const chartColors = ref(['#2c6975', '#64ac99']);

const getCurrentYear = () => {
    return new Date().getFullYear();
};

const getTotalCount = computed(() => {
    return Object.values(chartData.value).reduce((acc, curr) => acc + curr, 0);
});

const isDataEmpty = () => {
    return chartData.value.Male === 0 && chartData.value.Female === 0;
};

onMounted(async () => {
    try {
        const response = await axios.get(endpoints.getSubmissionData);
        if (response && response.data) {
            const currentYear = new Date().getFullYear();

            // Filter user submissions for the current year
            const userSubmissions = response.data.user_submissions.filter(submission => {
                return new Date(submission.created_at).getFullYear() === currentYear;
            });

            let maleCount = 0;
            let femaleCount = 0;

            // Loop through filtered user submissions to count male and female
            userSubmissions.forEach(submission => {
                const userId = submission.user;
                const userDetails = response.data.user_details.find(user => user.id === userId);
                if (userDetails && userDetails.gender === 'Male') {
                    maleCount++;
                } else if (userDetails && userDetails.gender === 'Female') {
                    femaleCount++;
                }
            });

            // Update chartData with the counts
            chartData.value = {
                'Male': maleCount,
                'Female': femaleCount
            };
        }
    } catch (error) {
        console.error('Error fetching details:', error);
    }
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
