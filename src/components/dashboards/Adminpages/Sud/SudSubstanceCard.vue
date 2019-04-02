<template>
    <div class="container">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h2 class="card-title text-center">Substances</h2>
              <div class="substances-list">
                <div class="row">
                  <div class="col-md-6" v-for="(pair, index) in substancePairs" :key="index">
                    <button v-for="substance in pair" :key="substance" class="btn btn-block" :class="{ 'btn-primary': selectedSubstance === substance, 'btn-secondary': selectedSubstance !== substance }" @click="selectSubstance(substance)">
                      {{ substance }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div v-if="selectedSubstance">
                <h2 class="text-center">Count of {{ selectedSubstance }}</h2>
                <canvas ref="chartCanvas"></canvas>
              </div>
              <div v-else>
                <p class="text-center">Select a substance to view its count</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue';
  import { Chart, registerables } from 'chart.js';
  
  const substances = ref(['Cigarettes', 'Alcohol', 'Cannabis', 'Cocaine', 'Heroin', 'Methamphetamine', 'Prescription Drugs', 'Other']);
  const selectedSubstance = ref(null);
  
  const substancePairs = ref([]);
  
  onMounted(() => {
    // Arrange substances in pairs
    for (let i = 0; i < substances.value.length; i += 2) {
      substancePairs.value.push([substances.value[i], substances.value[i + 1]]);
    }
  });
  
  const renderChart = () => {
    if (!selectedSubstance.value) return;
    const ctx = chartCanvas.value.getContext('2d');
    // Example: Dummy data for the selected substance
    const data = [10, 20, 15, 30]; // Replace with your actual data
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
          {
            label: selectedSubstance.value,
            data: data,
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
  };
  
  const selectSubstance = (substance) => {
    selectedSubstance.value = substance;
  };
  
  watch(selectedSubstance, renderChart);
  const chartCanvas = ref(null);
  </script>
  
  <style scoped>
  .container {
    margin-top: 20px;
  }
  
  .substances-list {
    padding: 10px;
  }
  
  .substances-list .row .col-md-6 {
    padding: 5px;
  }
  
  .card {
    margin: 0 auto;
    width : 100%;
  }
  
  .card-title {
    margin-bottom: 20px;
  }
  
  .btn-primary {
    background-color: white;
    color: black;
    border: 1px solid black;
  }
  
  .btn-secondary {
    background-color: #f2f2f2;
    color: black;
    border: 1px solid black;
  }
  
  .canvas-container {
    margin-top: 20px;
  }
  </style>
  