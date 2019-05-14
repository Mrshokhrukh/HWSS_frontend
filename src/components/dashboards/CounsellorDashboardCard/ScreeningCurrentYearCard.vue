<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="text-center">Total screened for the year: {{ getCurrentYear() }}</h4>
        </div>
        <div class="card-body">
            <template v-if="!isDataEmpty()">
                <!-- Ensure correct data format -->
                <pie-chart :donut="true" :data="chartDataFormatted" :colors="chartColors" legend="bottom"
                    loading="Loading..." />
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
import { ref, watchEffect } from 'vue';

const chartData = ref({
    'Male': 0,
    'Female': 0
});

const chartColors = ref(['#2c6975', '#64ac99']);

const getCurrentYear = () => {
    return new Date().getFullYear();
};

const getTotalCount = ref(0);

const isDataEmpty = () => {
    // Check if both Male and Female counts are zero
    return chartData.value.Male === 0 && chartData.value.Female === 0;
};

// Format data for pie chart component
const chartDataFormatted = ref([]);

watchEffect(() => {
    try {
        const storedReportData = sessionStorage.getItem('reportData');
        if (storedReportData) {
            const reportData = JSON.parse(storedReportData);

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
            chartDataFormatted.value = [
                { label: 'Male', value: maleCount },
                { label: 'Female', value: femaleCount }
            ];
        }
    } catch (error) {
        console.error('Error fetching report data:', error);
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
