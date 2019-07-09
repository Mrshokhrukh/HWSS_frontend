<template>
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import Chart from 'chart.js/auto';
  
  const props = defineProps({
    data: {
      type: Object,
      required: true
    }
  });
  
  const chartCanvas = ref(null);
  let chart = null;
  
  const createChart = () => {
    const ctx = chartCanvas.value.getContext('2d');
    
    const labels = Object.keys(props.data);
    const maleData = labels.map(age => props.data[age].male);
    const femaleData = labels.map(age => props.data[age].female);
  
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Male',
            data: maleData,
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Female',
            data: femaleData,
            backgroundColor: 'rgba(255, 99, 132, 0.8)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: false,
            title: {
              display: true,
              text: 'Age Groups'
            }
          },
          y: {
            stacked: false,
            title: {
              display: true,
              text: 'Number of Cases'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Distribution of Mental Health Issues by Age and Gender'
          },
          legend: {
            position: 'top',
          }
        }
      }
    });
  };
  
  const updateChart = () => {
    if (chart) {
      const labels = Object.keys(props.data);
      chart.data.labels = labels;
      chart.data.datasets[0].data = labels.map(age => props.data[age].male);
      chart.data.datasets[1].data = labels.map(age => props.data[age].female);
      chart.update();
    }
  };
  
  onMounted(() => {
    createChart();
  });
  
  watch(() => props.data, () => {
    updateChart();
  }, { deep: true });
  </script>
  
  <style scoped>
  .chart-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }
  </style>