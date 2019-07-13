<template>
    <div class="ace-impact-analysis">
      <h3 class="mb-4">Adverse Childhood Experiences (ACE) Impact</h3>
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
    return data.map(item => {
      const aceScore = item.rescreening_data?.ace_score || item.measurement?.fields?.ace_score;
      const phqScore = item.rescreening_data?.phq_score || item.measurement?.fields?.phq_score;
      const gadScore = item.rescreening_data?.gad_score || item.measurement?.fields?.gad_score;
      
      if (aceScore !== undefined && (phqScore !== undefined || gadScore !== undefined)) {
        const mentalHealthScore = ((phqScore || 0) + (gadScore || 0)) / 2;
        return {
          x: aceScore,
          y: mentalHealthScore,
          r: 5 // Radius of the point
        };
      }
      return null;
    }).filter(item => item !== null);
  };
  
  const createChart = (processedData) => {
    const ctx = chart.value.getContext('2d');
    
    if (chartInstance.value) {
      chartInstance.value.destroy();
    }
  
    chartInstance.value = new Chart(ctx, {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'ACE Score vs Mental Health Score',
          data: processedData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'ACE Score'
            },
            min: 0,
            max: 10
          },
          y: {
            title: {
              display: true,
              text: 'Mental Health Score (PHQ-9 + GAD-7 average)'
            },
            min: 0,
            max: 27 // Maximum possible average of PHQ-9 and GAD-7
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'ACE Score vs Current Mental Health Status'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `ACE: ${context.parsed.x}, Mental Health: ${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        }
      }
    });
  };
  
  watch(() => props.data, (newData) => {
    const processedData = processData(newData);
    createChart(processedData);
  }, { deep: true });
  
  onMounted(() => {
    const processedData = processData(props.data);
    createChart(processedData);
  });
  </script>
  
  <style scoped>
  .ace-impact-analysis {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .chart-container {
    height: 400px;
  }
  </style>