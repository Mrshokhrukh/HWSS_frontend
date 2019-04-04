<template>
    <div class="row">
        <div class="col-4">
            <div class="card bg-light h-100">
                <div class="card-header">
                    <h4 class="text-center">Assist</h4>
                </div>
                <div class="card-body">
                    <button class="btn btn-primary btn-block mb-3" @click="handleLifetimeUserClick">
                        <h1>{{ lifetimeCount }}</h1>
                        <p class="mb-0">Life Time User</p>
                    </button>

                    <button class="btn btn-primary btn-block mb-3" @click="handleDailyUsersClick">
                        <h1>{{ dailyCount }}</h1>
                        <p class="mb-0">Daily Substance Users</p>
                    </button>

                    <button class="btn btn-primary btn-block mb-3" @click="handleSubstanceSeverityClick">
                        Each Substance Severity
                    </button>
                </div>
            </div>
        </div>

        <div class="col-8">
            <div class="card w-100 h-100">
                <div class="card-header text-center">
                    <h4 class="graph-title">Assist Graph</h4>
                </div>
                <div class="card-body">
                    <column-chart :data="chartData" :colors="chartColors" :xtitle="'Substance'" :ytitle="'Count'" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Sample colors for the graph
const chartColors = ['#2c6975', '#64ac99'];

// Counts for "Life Time User" and "Daily Substance Users"
const lifetimeCount = ref(0);
const dailyCount = ref(0);

// ** Pre-populate chart data with initial values **
const chartData = ref([['Substance', 'Male', 'Female']]);

// ** Function to parse SUDData and update counts and chart data **
const parseSUDData = (data) => {
    lifetimeCount.value = data.lifetime_users.length;
    dailyCount.value = data.active_users.length;

    const substances = {};
    data.lifetime_users.forEach(user => {
        user.substances_used.forEach(substance => {
            if (substances[substance]) {
                substances[substance].count++;
            } else {
                substances[substance] = { count: 1, male: 0, female: 0 };
                // Add new substance to chart data (limited to 10)
                if (Object.keys(substances).length <= 10) {
                    chartData.value.push([substance, 0, 0]);
                }
            }
            substances[substance].gender === user.sex ? substances[substance].male++ : substances[substance].female++;
        });
    });

    // Update chart data with gender counts for existing substances
    chartData.value.forEach((row, index) => {
        if (index > 0) { // Skip header row
            const substance = row[0];
            row[1] = substances[substance].male;
            row[2] = substances[substance].female;
        }
    });
};

// Method to handle "Life Time User" button click
const handleLifetimeUserClick = () => {
    // Data already parsed on component mount
};

// Method to handle "Daily Substance Users" button click
const handleDailyUsersClick = () => {
    // Data already parsed on component mount
};

// Method to handle "Each Substance Severity" button click
const handleSubstanceSeverityClick = () => {
    // Implement logic here if needed
};

// Parse SUDData on component mount
onMounted(() => {
    const SUDData = JSON.parse(localStorage.getItem('SUDData'));
    if (SUDData) {
        parseSUDData(SUDData);
    }
});
</script>

<style scoped>
/* Add your scoped styles here */
</style>