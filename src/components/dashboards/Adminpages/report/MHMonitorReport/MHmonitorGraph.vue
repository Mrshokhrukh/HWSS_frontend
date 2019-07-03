<template>
  <div class="">
      <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, defineProps } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const props = defineProps({
  selectedOption: Object,
  reportData: Array,
});

const chartCanvas = ref(null);
let chartInstance = null;

const updateChart = () => {
  if (chartInstance) {
      chartInstance.destroy();
  }

  const labels = props.reportData.map(item => item.status);
  const data = props.reportData.map(item => item.count);

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

watch(() => props.reportData, updateChart);

onMounted(() => {
  if (props.selectedOption) {
      updateChart();
  }
});

onUnmounted(() => {
  if (chartInstance) {
      chartInstance.destroy();
  }
});
</script>

<style scoped>
canvas {
  width: 100%;
  height: 400px;
}
</style>

