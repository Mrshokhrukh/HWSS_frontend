<template>
    <div>
        <canvas ref="chartCanvas"></canvas>
    </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
    chartData: {
        type: Object,
        required: true
    }
});

const chartCanvas = ref(null);

const renderChart = (data) => {
    const ctx = chartCanvas.value.getContext('2d');

    if (chartInstance.value) {
        chartInstance.value.destroy();
    }

    chartInstance.value = new Chart(ctx, {
        type: data.type || 'bar',
        data: data.chartData,
        options: data.options || {}
    });
}

const chartData = props.chartData;
const chartInstance = ref(null);

watchEffect(() => {
    if (chartData.value) {
        renderChart(chartData.value);
    }
});
</script>

<style scoped>
/* Add any necessary CSS styles */
</style>