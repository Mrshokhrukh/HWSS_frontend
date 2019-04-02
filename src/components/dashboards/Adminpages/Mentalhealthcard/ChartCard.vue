<template>
    <div class="row mt-5">
      <!-- Card for Independent Screening Overview -->
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title text-center bold" style="color: #2c6975;">Independent Screening Overview</h5>
            <div class="row">
              <!-- Full-sized doughnut graph -->
              <div class="col-md-8">
                <canvas ref="fullDoughnutChart"></canvas>
              </div>
              <!-- Total counts -->
              <div class="col-md-4 mt-5">
                <div class="">
                  <h6>Total Screened</h6>
                  <p>{{ totalScreened }}</p>
                  <h6>Total Male</h6>
                  <p>{{ totalMale }}</p>
                  <h6>Total Female</h6>
                  <p>{{ totalFemale }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Card for Cluster Screening Overview -->
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title text-center bold" style="color: #2c6975;">Cluster Screening Overview</h5>
            <div class="row">
              <!-- Full-sized doughnut graph -->
              <div class="col-md-8">
                <canvas ref="clusterFullDoughnutChart"></canvas>
              </div>
              <!-- Total counts -->
              <div class="col-md-4 mt-5">
                <div class="">
                  <h6>Total Screened</h6>
                  <p>{{ clusterTotalScreened }}</p>
                  <h6>Total Male</h6>
                  <p>{{ clusterTotalMale }}</p>
                  <h6>Total Female</h6>
                  <p>{{ clusterTotalFemale }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import Chart from 'chart.js/auto';
  
  // Independent Screening Overview Chart
  const fullDoughnutChart = ref(null);
  let totalScreened = ref(0);
  let totalMale = ref(0);
  let totalFemale = ref(0);
  
  // Cluster Screening Overview Chart
  const clusterFullDoughnutChart = ref(null);
  let clusterTotalScreened = ref(0);
  let clusterTotalMale = ref(0);
  let clusterTotalFemale = ref(0);
  
  // Function to fetch data from API
  const fetchData = async () => {
    try {
      const response = await fetch('YOUR_API_ENDPOINT');
      const data = await response.json();
      // Assuming API response contains total screened, total male, and total female counts
      totalScreened.value = data.totalScreened;
      totalMale.value = data.totalMale;
      totalFemale.value = data.totalFemale;
  
      clusterTotalScreened.value = data.clusterTotalScreened;
      clusterTotalMale.value = data.clusterTotalMale;
      clusterTotalFemale.value = data.clusterTotalFemale;
  
      // Create and render doughnut charts
      createDoughnutChart(fullDoughnutChart, [totalFemale.value, totalMale.value], ['Total Female', 'Total Male']);
      createDoughnutChart(clusterFullDoughnutChart, [clusterTotalFemale.value, clusterTotalMale.value], ['Total Female', 'Total Male']);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  onMounted(() => {
    fetchData();
  });
  
  // Function to create and render a doughnut chart
  const createDoughnutChart = (canvasRef, data, labels) => {
    const ctx = canvasRef.value.getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#FF6384', '#36A2EB']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  };
  </script>
  
  <style>
  .bold {
    font-weight: bold;
  }
  </style>
  