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
import { onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';

const totalLifetimeUsers = 13;  // Dummy data for Life Time User
const totalDailySubstanceUsers = 8;  // Dummy data for Daily Substance Users

const reportData = JSON.parse(sessionStorage.getItem('reportData')) || [];
let substancesWithGender = [];

if (reportData && reportData.length > 0) {
  for (const data of reportData) {
    const measurementAssist = data.measurement_assist;
    if (measurementAssist && measurementAssist.fields) {
      const measurementAssistFields = measurementAssist.fields;
      const gender = data.user.fields.gender;
      const substances = [];
      for (const key in measurementAssistFields) {
        if (key.endsWith('_measurement')) {
          substances.push({
            name: key.replace('_measurement', ''),
            value: measurementAssistFields[key]
          });
        }
      }
      substancesWithGender.push({
        gender: gender,
        substances: substances
      });
    }
  }
}

const severityLevels = ['low risk', 'moderate risk', 'high risk'];

const chartData = {
  labels: [],
  datasets: []
};

const processChartData = () => {
  const substanceCounts = {
    male: {},
    female: {}
  };

  substancesWithGender.forEach(entry => {
    const gender = entry.gender.toLowerCase();
    entry.substances.forEach(substance => {
      if (!substanceCounts[gender][substance.name]) {
        substanceCounts[gender][substance.name] = { 'low risk': 0, 'moderate risk': 0, 'high risk': 0 };
      }
      if (severityLevels.includes(substance.value)) {
        substanceCounts[gender][substance.name][substance.value]++;
      }
    });
  });

  chartData.labels = Object.keys(substanceCounts.male).concat(Object.keys(substanceCounts.female)).filter((value, index, self) => self.indexOf(value) === index);

  chartData.datasets = severityLevels.flatMap((severity, index) => [
    {
      label: `Male - ${severity}`,
      data: chartData.labels.map(substance => substanceCounts.male[substance] ? substanceCounts.male[substance][severity] : 0),
      backgroundColor: `rgba(44, 105, 117, ${0.2 + index * 0.2})`,
      borderColor: `rgba(44, 105, 117, 1)`,
      borderWidth: 1
    },
    {
      label: `Female - ${severity}`,
      data: chartData.labels.map(substance => substanceCounts.female[substance] ? substanceCounts.female[substance][severity] : 0),
      backgroundColor: `rgba(44, 105, 117, ${0.2 + index * 0.2})`,
      borderColor: `rgba(44, 105, 117, 1)`,
      borderWidth: 1
    }
  ]);
};

let myChart = null;

const displayChart = (data) => {
  const ctx = document.getElementById('myChart').getContext('2d');
  if (myChart) {
    myChart.destroy();
  }
  myChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};

const handleLifetimeUserClick = () => {
  const lifetimeChartData = {
    labels: ['Lifetime Users'],
    datasets: [{
      label: 'Users',
      data: [totalLifetimeUsers],
      backgroundColor: 'rgba(44, 105, 117, 0.2)',
      borderColor: 'rgba(44, 105, 117, 1)',
      borderWidth: 1
    }]
  };
  displayChart(lifetimeChartData);
};

const handleDailyUsersClick = () => {
  const dailyChartData = {
    labels: ['Daily Users'],
    datasets: [{
      label: 'Users',
      data: [totalDailySubstanceUsers],
      backgroundColor: 'rgba(44, 105, 117, 0.4)',
      borderColor: 'rgba(44, 105, 117, 1)',
      borderWidth: 1
    }]
  };
  displayChart(dailyChartData);
};

const handleSubstanceSeverityClick = () => {
  processChartData();
  displayChart(chartData);
};

onMounted(() => {
  handleSubstanceSeverityClick();
});
</script>
