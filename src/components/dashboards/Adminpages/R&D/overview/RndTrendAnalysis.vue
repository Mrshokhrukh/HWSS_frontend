<template>
    <div class="trend-analysis">
      <h3 class="mb-4">Mental Health Trend Analysis</h3>
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
  
  const processData = (data) => {
    const dateMap = new Map();
    data.forEach(item => {
      const date = new Date(item.original_submission_date).toISOString().split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, { phq: [], gad: [] });
      }
      const measurement = item.measurement?.fields || {};
      dateMap.get(date).phq.push(convertToNumeric(measurement.phq_measurement));
      dateMap.get(date).gad.push(convertToNumeric(measurement.gad_measurement));
    });
  
    const sortedDates = Array.from(dateMap.keys()).sort();
    const phqData = [];
    const gadData = [];
  
    sortedDates.forEach(date => {
      const dayData = dateMap.get(date);
      phqData.push(calculateAverage(dayData.phq));
      gadData.push(calculateAverage(dayData.gad));
    });
  
    return { dates: sortedDates, phqData, gadData };
  };
  
  const convertToNumeric = (value) => {
    switch (value?.toLowerCase()) {
      case 'minimal': return 1;
      case 'mild': return 2;
      case 'moderate': return 3;
      case 'moderately severe': return 4;
      case 'severe': return 5;
      default: return 0;
    }
  };
  
  const calculateAverage = (arr) => {
    const sum = arr.reduce((a, b) => a + b, 0);
    return arr.length > 0 ? sum / arr.length : 0;
  };
  
  const createChart = (dates, phqData, gadData) => {
    const ctx = chart.value.getContext('2d');
    if (chartInstance.value) {
      chartInstance.value.destroy();
    }
    chartInstance.value = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'PHQ-9 Severity',
            data: phqData,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'GAD-7 Severity',
            data: gadData,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            ticks: {
              callback: function(value) {
                return ['', 'Minimal', 'Mild', 'Moderate', 'Moderately Severe', 'Severe'][value];
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += ['', 'Minimal', 'Mild', 'Moderate', 'Moderately Severe', 'Severe'][Math.round(context.parsed.y)];
                }
                return label;
              }
            }
          }
        }
      }
    });
  };
  
  watch(() => props.data, (newData) => {
    const { dates, phqData, gadData } = processData(newData);
    createChart(dates, phqData, gadData);
  }, { deep: true });
  
  onMounted(() => {
    const { dates, phqData, gadData } = processData(props.data);
    createChart(dates, phqData, gadData);
  });
  </script>
  
  <style scoped>
  .trend-analysis {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .chart-container {
    height: 400px;
  }
  </style>