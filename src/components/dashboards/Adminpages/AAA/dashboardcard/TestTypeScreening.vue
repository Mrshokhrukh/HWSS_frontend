<template>
    <div class="container">
      <div class="row">
        <!-- Column 1 -->
        <div class="col">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Cluster Screening</h5>
              <div class="row">
                <!-- Total Screened -->
                <div class="col">
                  <canvas ref="clusterTotalScreened"></canvas>
                </div>
                <!-- Total Male -->
                <div class="col">
                  <canvas ref="clusterTotalMale"></canvas>
                </div>
                <!-- Total Female -->
                <div class="col">
                  <canvas ref="clusterTotalFemale"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Column 2 -->
        <div class="col">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Independent Screening</h5>
              <div class="row">
                <!-- Total Screened -->
                <div class="col">
                  <canvas ref="independentTotalScreened"></canvas>
                </div>
                <!-- Total Male -->
                <div class="col">
                  <canvas ref="independentTotalMale"></canvas>
                </div>
                <!-- Total Female -->
                <div class="col">
                  <canvas ref="independentTotalFemale"></canvas>
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
  import { Chart } from 'chart.js/auto';
  
  // Create refs for each chart canvas
  const clusterTotalScreenedRef = ref(null);
  const clusterTotalMaleRef = ref(null);
  const clusterTotalFemaleRef = ref(null);
  const independentTotalScreenedRef = ref(null);
  const independentTotalMaleRef = ref(null);
  const independentTotalFemaleRef = ref(null);
  
  onMounted(() => {
    // Dummy data for charts
    const dummyData = [50, 30]; // Total and Remaining
  
    // Cluster Screening Charts
    const clusterTotalScreenedChart = new Chart(clusterTotalScreenedRef.value, {
      type: 'doughnut',
      data: {
        labels: ['Screened', 'Remaining'],
        datasets: [{
          data: dummyData,
          backgroundColor: ['rgb(54, 162, 235)', 'rgba(0, 0, 0, 0)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  
    const clusterTotalMaleChart = new Chart(clusterTotalMaleRef.value, {
      type: 'doughnut',
      data: {
        labels: ['Male', 'Female'],
        datasets: [{
          data: dummyData,
          backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  
    const clusterTotalFemaleChart = new Chart(clusterTotalFemaleRef.value, {
      type: 'doughnut',
      data: {
        labels: ['Male', 'Female'],
        datasets: [{
          data: dummyData,
          backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  
    // Independent Screening Charts
    const independentTotalScreenedChart = new Chart(independentTotalScreenedRef.value, {
      type: 'doughnut',
      data: {
        labels: ['Screened', 'Remaining'],
        datasets: [{
          data: dummyData,
          backgroundColor: ['rgb(54, 162, 235)', 'rgba(0, 0, 0, 0)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  
    const independentTotalMaleChart = new Chart(independentTotalMaleRef.value, {
      type: 'doughnut',
      data: {
        labels: ['Male', 'Female'],
        datasets: [{
          data: dummyData,
          backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  
    const independentTotalFemaleChart = new Chart(independentTotalFemaleRef.value, {
      type: 'doughnut',
      data: {
        labels: ['Male', 'Female'],
        datasets: [{
          data: dummyData,
          backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  });
  </script>
  