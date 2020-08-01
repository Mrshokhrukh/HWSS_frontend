<template>
    <div class="substance-use-risk-analysis">
      <h3 class="mb-4">Substance Use Risk Analysis</h3>
      <div class="chart-container">
        <canvas ref="chart"></canvas>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import Chart from 'chart.js/auto';
  
  const props = defineProps({
    data: {
      type: Array,
      required: true
    }
  });
  
  const chart = ref(null);
  const chartInstance = ref(null);
  
  const substances = [
    'alcoholic', 'tobacco', 'cannabis', 'cocaine', 'amphetamine',
    'inhalants', 'sedatives', 'hallucinogens', 'opioids'
  ];
  
  const riskLevels = ['no risk', 'low risk', 'moderate risk', 'high risk'];
  
  const colors = {
    'no risk': 'rgba(75, 192, 192, 0.8)',
    'low risk': 'rgba(54, 162, 235, 0.8)',
    'moderate risk': 'rgba(255, 206, 86, 0.8)',
    'high risk': 'rgba(255, 99, 132, 0.8)'
  };
  
  const processData = (data) => {
    const riskData = {};
    substances.forEach(substance => {
      riskData[substance] = {
        'no risk': 0,
        'low risk': 0,
        'moderate risk': 0,
        'high risk': 0
      };
    });
  
    data.forEach(item => {
      const assistData = item.measurement_assist?.fields || {};
      substances.forEach(substance => {
        const risk = assistData[`${substance}_measurement`] || 'no risk';
        if (riskData[substance][risk] !== undefined) {
          riskData[substance][risk]++;
        }
      });
    });
  
    return riskData;
  };
  
  const createChart = (riskData) => {
    const ctx = chart.value.getContext('2d');
    
    if (chartInstance.value) {
      chartInstance.value.destroy();
    }
  
    const datasets = riskLevels.map(level => ({
      label: level,
      data: substances.map(substance => riskData[substance][level]),
      backgroundColor: colors[level]
    }));
  
    chartInstance.value = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: substances.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        datasets: datasets
      },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Cases'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Substance Use Risk Distribution'
          },
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        }
      }
    });
  };
  
  watch(() => props.data, (newData) => {
    const riskData = processData(newData);
    createChart(riskData);
  }, { deep: true });
  
  onMounted(() => {
    const riskData = processData(props.data);
    createChart(riskData);
  });
  </script>
  
  <style scoped>
  .substance-use-risk-analysis {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .chart-container {
    height: 400px;
  }
  </style>