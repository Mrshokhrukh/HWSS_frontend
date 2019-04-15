<template>
  <div class="row">
    <div class="col-4">
      <div class="card bg-light h-100">
        <div class="card-header">
          <h4 class="text-center">Assists</h4>
        </div>
        <div class="card-body">
          <button class="btn btn-primary btn-block mb-3" @click="handleLifetimeUserClick">
            <h1>{{ totalLifetimeUsers }}</h1>
            <p class="mb-0">Life Time User</p>
          </button>

          <button class="btn btn-primary btn-block mb-3" @click="handleDailyUsersClick">
            <h1>{{ totalDailySubstanceUsers }}</h1>
            <p class="mb-0">Daily Substance Users</p>
          </button>

          <button class="btn btn-primary btn-block mb-3" @click="handleSubstanceSeverityClick">

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
import { computed } from 'vue';
import Chart from 'chart.js/auto';

const substanceData = [

  { "substance": "Tobacco", "gender": "female", "risk": "low risk", "daily_use": "no", "life_time_use": "yes" },
  { "substance": "Tobacco", "gender": "male", "risk": "low risk", "daily_use": "yes", "life_time_use": "yes" },
  { "substance": "Tobacco", "gender": "female", "risk": "low risk", "daily_use": "no", "life_time_use": "yes" },
  { "substance": "Tobacco", "gender": "male", "risk": "low risk", "daily_use": "yes", "life_time_use": "yes" },
  { "substance": "Alcohol", "gender": "female", "risk": "high risk", "daily_use": "no", "life_time_use": "yes" },
  { "substance": "Alcohol", "gender": "male", "risk": "low risk", "daily_use": "yes", "life_time_use": "yes" },
  { "substance": "Cannabis", "gender": "male", "risk": "high risk", "daily_use": "yes", "life_time_use": "yes" },
  { "substance": "Cannabis", "gender": "female", "risk": "low risk", "daily_use": "no", "life_time_use": "yes" },

  { "substance": "Cocaine", "gender": "female", "risk": "high risk", "daily_use": "yes", "life_time_use": "yes" },
  { "substance": "Cocaine", "gender": "male", "risk": "low risk", "daily_use": "yes", "life_time_use": "yes" },
  { "substance": "Amphetamine-type stimulants", "gender": "male", "risk": "high risk", "daily_use": "no", "life_time_use": "yes" },
  { "substance": "Amphetamine-type stimulants", "gender": "female", "risk": "low risk", "daily_use": "yes", "life_time_use": "yes" },
  { "substance": "Inhalant", "gender": "female", "risk": "high risk", "daily_use": "yes", "life_time_use": "yes" },
  { "substance": "Inhalant", "gender": "male", "risk": "low risk", "daily_use": "no", "life_time_use": "yes" },
  { "substance": "Sedative", "gender": "male", "risk": "high risk", "daily_use": "yes", "life_time_use": "yes" },
  { "substance": "Sedative", "gender": "male", "risk": "high low", "daily_use": "no", "life_time_use": "yes" },
  { "substance": "Hallucinate", "gender": "female", "risk": "high risk", "daily_use": "yes", "life_time_use": "yes" },
  { "substance": "Hallucinate", "gender": "male", "risk": "low risk", "daily_use": "yes", "life_time_use": "yes" },
  { "substance": "Hallucinate", "gender": "female", "risk": "high risk", "daily_use": "no", "life_time_use": "yes" },
  { "substance": "Opioids", "gender": "male", "risk": "high risk", "daily_use": "yes", "life_time_use": "yes" },
  { "substance": "Tobacco", "gender": "female", "risk": "low risk", "daily_use": "no", "life_time_use": "yes" },
  { "substance": "Tobacco", "gender": "male", "risk": "low risk", "daily_use": "yes", "life_time_use": "yes" },
  { "substance": "Sedative", "gender": "male", "risk": "high risk", "daily_use": "yes", "life_time_use": "yes" },
  { "substance": "Sedative", "gender": "male", "risk": "high low", "daily_use": "no", "life_time_use": "yes" }
];
// Computed property to calculate total lifetime users
const totalLifetimeUsers = computed(() => {
  return substanceData.filter(item => item.life_time_use === 'yes').length;
});

// Computed property to calculate total daily substance users
const totalDailySubstanceUsers = computed(() => {
  return substanceData.filter(item => item.daily_use === 'yes').length;
});

//graph
let myChart = null;

const handleLifetimeUserClick = () => {
  const lifetimeUsersData = substanceData.filter(item => item.life_time_use === "yes");
  const groupedData = groupDataBySubstanceAndGender(lifetimeUsersData);
  const totals = calculateTotals(groupedData);

  updateChart('Lifetime Users', Object.keys(totals), Object.values(totals));
};

const handleDailyUsersClick = () => {
  const dailyUsersData = substanceData.filter(item => item.daily_use === "yes");
  const groupedData = groupDataBySubstanceAndGender(dailyUsersData);
  const totals = calculateTotals(groupedData);

  updateChart('Daily Users', Object.keys(totals), Object.values(totals));
};

const handleSubstanceSeverityClick = () => {
  const groupedData = groupDataBySubstanceAndRisk(substanceData);
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
  if (myChart) {
    myChart.destroy();
  }

  const ctx = document.getElementById('myChart').getContext('2d');
  myChart = new Chart(ctx, {
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


</script>