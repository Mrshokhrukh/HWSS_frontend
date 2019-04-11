<template>
    <div>
        <label for="chartType">Chart Type:</label>
        <select id="chartType" v-model="selectedChartType">
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <!-- Add more options for different chart types -->
        </select>

        <button @click="generateChart">Generate Chart</button>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const selectedChartType = ref('bar');

const emit = defineEmits(['generateChart']);

const generateChart = () => {
    const chartConfig = {
        type: selectedChartType.value,
        // Add other configuration options here
    };
    emit('generateChart', chartConfig);
}
</script>

<style scoped>
</style>