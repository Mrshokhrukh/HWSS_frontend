<template>
    <div class="chart-card">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title text-center">Current Status of Bhutan</h2>
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  import { Chart, registerables } from 'chart.js';
  
  export default defineComponent({
    mounted() {
      this.renderChart();
    },
    methods: {
      renderChart() {
        const ctx = this.$refs.chartCanvas.getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Primary Phase', 'Continuing Care', 'Undergoing Rehabilitation', 'Treatment Completed', 'Non-compliance'],
            datasets: [
              {
                label: '2024',
                data: [20, 30, 40, 50, 10], // Dummy counts for 2024
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
              },
              {
                label: '2025',
                data: [30, 40, 50, 60, 15], // Dummy counts for 2025
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: true
              },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            },
            scales: {
              x: {
                stacked: true
              },
              y: {
                stacked: true,
                ticks: {
                  beginAtZero: true
                }
              }
            }
          },
          plugins: registerables
        });
      }
    }
  });
  </script>
  
  <style scoped>
  .chart-card {
    display: flex;
    justify-content: center;
  }
  
  .card {
    margin: 20px;
    width:100%;
  }
  </style>
  