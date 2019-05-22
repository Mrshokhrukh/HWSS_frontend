<template>
    <div class="row">
      <div class="col-4">
        <div class="card bg-light h-100">
          <div class="card-header">
            <h4 class="text-center">Assists</h4>
          </div>
          <div class="card-body d-flex flex-column">
            <button class="btn btn-primary btn-block mb-3 flex-fill" @click="handleLifetimeUserClick">
              <h1>{{ totalLifetimeUsers }}</h1>
              <p class="mb-0">Life Time User</p>
            </button>
  
            <button class="btn btn-primary btn-block mb-3 flex-fill" @click="handleDailyUsersClick">
              <h1>{{ totalDailySubstanceUsers }}</h1>
              <p class="mb-0">Daily Substance Users</p>
            </button>
  
            <button class="btn btn-primary btn-block mb-3 flex-fill" @click="handleSubstanceSeverityClick">
              Each Substance Severity
            </button>
          </div>
        </div>
      </div>
  
      <div class="col-8">
        <div class="card w-100 h-100">
          <div class="card-header text-center">
            <h4 class="graph-title">Assist Graph</h4>
          </div>
          <div class="card-body d-flex justify-content-center align-items-center w-100 h-50">
            <canvas id="myChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, onMounted, ref } from 'vue';
  import Chart from 'chart.js/auto';
  
  // Fetching data from session storage
  const reportData = JSON.parse(sessionStorage.getItem('reportData'));
  
  // Computed properties to calculate totals
  const totalLifetimeUsers = computed(() => {
    return reportData.filter(item => item.life_time_use === 'yes').length;
  });
  
  const totalDailySubstanceUsers = computed(() => {
    return reportData.filter(item => item.daily_use === 'yes').length;
  });
  
  let myChart = ref(null);
  
  const handleLifetimeUserClick = () => {
    const lifetimeUsersData = reportData.filter(item => item.life_time_use === "yes");
    const groupedData = groupDataBySubstanceAndGender(lifetimeUsersData);
    const totals = calculateTotals(groupedData);
  
    updateChart('Lifetime Users', Object.keys(totals), Object.values(totals));
  };
  
  const handleDailyUsersClick = () => {
    const dailyUsersData = reportData.filter(item => item.daily_use === "yes");
    const groupedData = groupDataBySubstanceAndGender(dailyUsersData);
    const totals = calculateTotals(groupedData);
  
    updateChart('Daily Users', Object.keys(totals), Object.values(totals));
  };
  
  const handleSubstanceSeverityClick = () => {
    const groupedData = groupDataBySubstanceAndRisk(reportData);
    const totals = calculateSeverityTotals(groupedData);
  
    updateChart('Substance Severity', Object.keys(totals), Object.values(totals));
  };
  
  const groupDataBySubstanceAndGender = (data) => {
    return data.reduce((acc, item) => {
      const substance = item.substance;
      acc[substance] = acc[substance] || { male: 0, female: 0 };
      acc[substance][item.gender]++;
      return acc;
    }, {});
  };
  
  const calculateTotals = (groupedData) => {
    return Object.keys(groupedData).reduce((acc, substance) => {
      acc[substance] = {
        male: groupedData[substance].male || 0,
        female: groupedData[substance].female || 0
      };
      return acc;
    }, {});
  };
  
  const groupDataBySubstanceAndRisk = (data) => {
    return data.reduce((acc, item) => {
      const substance = item.substance;
      acc[substance] = acc[substance] || { high: 0, low: 0 };
      if (item.risk === "high risk") {
        acc[substance].high++;
      } else if (item.risk === "low risk") {
        acc[substance].low++;
      }
      return acc;
    }, {});
  };
  
  const calculateSeverityTotals = (groupedData) => {
    return Object.keys(groupedData).reduce((acc, substance) => {
      acc[substance] = {
        high: groupedData[substance].high || 0,
        low: groupedData[substance].low || 0
      };
      return acc;
    }, {});
  };
  
  const updateChart = (chartTitle, labels, data) => {
    if (myChart.value) {
      myChart.value.destroy();
    }
  
    const ctx = document.getElementById('myChart').getContext('2d');
    myChart.value = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Male',
            data: data.map(item => item.male),
            backgroundColor: '#64AC99',
            borderColor: '#64AC99',
            borderWidth: 1
          },
          {
            label: 'Female',
            data: data.map(item => item.female),
            backgroundColor: '#2B656F',
            borderColor: '#2B656F',
            borderWidth: 1
          },
          {
            label: 'High Risk',
            data: data.map(item => item.high),
            backgroundColor: '#E6142D',
            borderColor: '#E6142D',
            borderWidth: 1
          },
          {
            label: 'Low Risk',
            data: data.map(item => item.low),
            backgroundColor: '#E6EA0F',
            borderColor: '#E6EA0F',
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          x: {
            beginAtZero: false,
            stepSize: 1 // Set the step size to 1 to display integer values on the x-axis
          },
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          title: {
            display: true,
            text: chartTitle
          }
        }
      }
    });
  };
  
  onMounted(() => {
    // Initial chart rendering
    handleLifetimeUserClick();
  });
  </script>
  
  <style scoped>
  .card-body.d-flex {
    display: flex;
    flex-direction: column;
  }
  
  .btn-block {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
  }
  </style>
  