<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const props = defineProps({
  selectedOptions: Array,
  reportData: Array,
});

const chartCanvas = ref(null);
let chartInstance = null;

const updateChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
  }

  const filteredData = props.selectedOptions.length > 0
    ? props.reportData.filter(item => props.selectedOptions.includes(item.id))
    : props.reportData;

  const labels = filteredData.map(item => item.status);
  const data = filteredData.map(item => item.count);

  if (chartCanvas.value) {
    chartInstance = new Chart(chartCanvas.value.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Number of Cases',
            data,
            backgroundColor: ['#56b5ac', '#40c78f', '#268497'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
    });
  }
};

watch(() => props.selectedOptions, updateChart, { deep: true });

onMounted(() => {
  updateChart();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: auto !important;
}
</style>