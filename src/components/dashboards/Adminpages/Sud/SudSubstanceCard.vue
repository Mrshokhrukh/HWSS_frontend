<template>
      <div class="card mt-5 b-0">
      <h3 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975;">Risk Level</h3>
      <div class="card-body">
        <div class="row">
          <div class="col">
            <div class="d-flex flex-column">
              <div class="row">
                <div class="col">
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Tobacco' }"
                    @click="setActiveButton('Tobacco')">Tobacco</button>
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Alcohol' }"
                    @click="setActiveButton('Alcohol')">Alcohol</button>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Cannabis' }"
                    @click="setActiveButton('Cannabis')">Cannabis</button>
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Cocaine' }"
                    @click="setActiveButton('Cocaine')">Cocaine</button>
                </div>
              </div>

              <div class="row">
                <div class="col">
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Amphetamine-type' }"
                    @click="setActiveButton('Amphetamine-type')">Amphetamine-type</button>
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Inhalant' }"
                    @click="setActiveButton('Inhalant')">Inhalant</button>
                </div>
              </div>

              <div class="row">
                <div class="col">
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Sedative' }"
                    @click="setActiveButton('Sedative')">Sedative</button>
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Hallucinate' }"
                    @click="setActiveButton('Hallucinate')">Hallucinate</button>
                </div>
              </div>


              <div class="row">
                <div class="col">
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Opioids' }"
                    @click="setActiveButton('Opioids')">Opioids</button>
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Others' }"
                    @click="setActiveButton('Others')">Others</button>
                </div>
              </div>

            </div>
          </div>
          <div class="col text-center">
            <h4 class="text-capitalize">High Risk Count by gender</h4>
            <div class="w-100">
              <canvas id="donutChartTotal" class="h-100"></canvas>
            </div>
          </div>
          <div class="col text-center">
            <h4 class="text-capitalize">Moderate Risk Count by gender</h4>
            <div class="w-100">
              <canvas id="donutChartModerate" class="h-100"></canvas>
            </div>
          </div>
          <div class="col">
            <canvas id="barChart" width="100" height="50"></canvas>
          </div>
        </div>
      </div>
    </div>

</template>

<script setup>
import { ref } from 'vue';
import Chart from 'chart.js/auto';

const activeButton = ref(null);
const dummyData = {
  Tobacco: {
    'High-risk total male': 270,
    'High-risk total female': 130,
    'Moderate-risk total male': 175,
    'Moderate-risk total female': 115,
  },
  Alcohol: {
    'High-risk total male': 250,
    'High-risk total female': 290,
    'Moderate-risk total male': 150,
    'Moderate-risk total female': 150,
  },
  Cannabis: {
    'High-risk total male': 180,
    'High-risk total female': 120,
    'Moderate-risk total male': 90,
    'Moderate-risk total female': 110,
  },
  Cocaine: {
    'High-risk total male': 100,
    'High-risk total female': 80,
    'Moderate-risk total male': 70,
    'Moderate-risk total female': 60,
  },
  'Amphetamine-type': {
    'High-risk total male': 80,
    'High-risk total female': 60,
    'Moderate-risk total male': 40,
    'Moderate-risk total female': 50,
  },
  Inhalant: {
    'High-risk total male': 40,
    'High-risk total female': 30,
    'Moderate-risk total male': 20,
    'Moderate-risk total female': 25,
  },
  Sedative: {
    'High-risk total male': 30,
    'High-risk total female': 25,
    'Moderate-risk total male': 15,
    'Moderate-risk total female': 20,
  },
  Hallucinate: {
    'High-risk total male': 20,
    'High-risk total female': 15,
    'Moderate-risk total male': 10,
    'Moderate-risk total female': 10,
  },
  Opioids: {
    'High-risk total male': 50,
    'High-risk total female': 40,
    'Moderate-risk total male': 35,
    'Moderate-risk total female': 30,
  },
  Others: {
    'High-risk total male': 30,
    'High-risk total female': 25,
    'Moderate-risk total male': 20,
    'Moderate-risk total female': 15,
  },
};
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

let donutChartTotalInstance = null;
let donutChartModerateInstance = null;
let barChartInstance = null;

const renderDonutChart = (canvasId, data) => {
  if (canvasId === 'donutChartTotal' && donutChartTotalInstance) {
    donutChartTotalInstance.destroy();
  }
  if (canvasId === 'donutChartModerate' && donutChartModerateInstance) {
    donutChartModerateInstance.destroy();
  }
  const ctx = document.getElementById(canvasId).getContext('2d');
  if (ctx) {
    return new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: chartOptions,
    });
  }
};

const renderBarChart = (data) => {
  if (barChartInstance) {
    barChartInstance.destroy();
  }
  const ctx = document.getElementById('barChart').getContext('2d');
  if (ctx) {
    return new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        ...chartOptions,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      },
    });
  }
};

const setActiveButton = (buttonName) => {
  activeButton.value = buttonName;
  if (buttonName) {
    updateCharts();
  }
};

const updateCharts = () => {
  const data = dummyData[activeButton.value];
  if (!data) return; // Return if data is not available for the selected button

  const donutDataTotal = {
    labels: ['Male', 'Female'],
    datasets: [{
      data: [data['High-risk total male'], data['High-risk total female']],
      backgroundColor: ['#2c6975', '#00000'],
      hoverBackgroundColor: ['#2c6975', '#00000'],
    }],
  };
  const donutDataModerate = {
    labels: ['Male', 'Female'],
    datasets: [{
      data: [data['Moderate-risk total male'], data['Moderate-risk total female']],
      backgroundColor: ['#2c6975', '#00000'],
      hoverBackgroundColor: ['#2c6975', '#00000'],
    }],
  };
  const barData = {
    labels: ['High Risk', 'Moderate Risk'],
    datasets: [{
      label: 'Male',
      backgroundColor: '#2c6975',
      data: [data['High-risk total male'], data['Moderate-risk total male']],
    }, {
      label: 'Female',
      backgroundColor: '#00000',
      data: [data['High-risk total female'], data['Moderate-risk total female']],
    }],
  };

  donutChartTotalInstance = renderDonutChart('donutChartTotal', donutDataTotal);
  donutChartModerateInstance = renderDonutChart('donutChartModerate', donutDataModerate);
  barChartInstance = renderBarChart(barData);
};
</script>

<style scoped>
.custom-card {
  background-color: #d3e2e4; 
}
.btn {
  height: 50px;
  width: 150px;
}

.btn-primary {
  background-color: #2c6975 !important;
}
</style>