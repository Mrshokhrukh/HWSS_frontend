<template>
    <div class="card w-100">
        <div class="card-header">
            <h4 class="text-center text-capitalize">Total screened for the year: {{ getCurrentYear() }}</h4>
        </div>
        <div class="card-body">
            <template v-if="!isLoading">
                <template v-if="!isDataEmpty">
                    <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-75 mx-auto" />
                    <div class="mt-4 text-center">
                        <div class="hwss-primary text-capitalize font-italic">{{ store.agencyName }}</div>
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
                    <p>Loading Data... {{ loadingStatus }}</p>
                </div>
            </template>
        </div>
        <div v-if="!isLoading && !isDataEmpty" class="card-footer">
            <span class="legend-item">
                <span class="legend-color" :style="{ 'background-color': store.chartColors[0] }"></span>
                Male ({{ chartData.datasets[0].data[0] || 0 }})
            </span>
            <span class="legend-item">
                <span class="legend-color" :style="{ 'background-color': store.chartColors[1] }"></span>
                Female ({{ chartData.datasets[0].data[1] || 0 }})
            </span>
            <span><strong>Total: {{ store.totalScreenedCount }}</strong></span>
        </div>
        <div v-if="store.error" class="error-message">
            {{ store.error }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useCounselorDashboardStore } from '@/stores/counselorDashboard';
import Chart from 'primevue/chart';

const store = useCounselorDashboardStore();

const chartData = computed(() => store.chartData);
const isDataEmpty = computed(() => store.totalScreenedCount === 0);
const isLoading = computed(() => store.isLoading);
const loadingStatus = ref('');

const chartOptions = ref({
    plugins: {
        legend: {
            display: false
        }
    },
    cutout: '60%'
});

const getCurrentYear = () => new Date().getFullYear();

onMounted(async () => {
    try {
        loadingStatus.value = 'Initializing...';
        if (!store.isInitialized) {
            await store.initializeStore();
        }
        loadingStatus.value = 'Data loaded.';
    } catch (error) {
        console.error('Error initializing store:', error);
        loadingStatus.value = 'Error loading data. Please try again.';
    }
});

watch(() => store.reportData, (newData) => {
    console.log('Report data updated:', newData.length, 'items');
}, { deep: true });

watch(() => store.isLoading, (newValue) => {
    console.log('isLoading changed:', newValue);
});

watch(() => store.error, (newError) => {
    if (newError) {
        console.error('Store error:', newError);
    }
});

watch(() => store.sudError, (newError) => {
    if (newError) {
        console.warn('SUD data error:', newError);
    }
});
</script>

<style scoped>
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

.hwss-primary {
    color: #2c6975;
}

.error-message {
    color: red;
    text-align: center;
    padding: 10px;
}
</style>