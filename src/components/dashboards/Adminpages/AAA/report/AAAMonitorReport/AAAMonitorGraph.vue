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
  
    const labels = props.reportData.map(item => formatLabel(item.service));
    const data = props.reportData.map(item => item.Rescreened ? 1 : 0);
  
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
  watch(() => props.reportData, updateChart, { deep: true });
  
  onMounted(() => {
    updateChart();
  });
  
  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.destroy();
    }
  });
  
  const formatLabel = (service) => {
    return `${service.counseling_measurement}, ${service.assessment_measurement}, ${service.referral_measurement}, ${service.follow_up_measurement}`;
  };
  </script>
  
  <style scoped>
  canvas {
    width: 100%;
    height: 400px;
  }
  </style>
  