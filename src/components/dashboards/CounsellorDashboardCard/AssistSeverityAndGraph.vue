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
import { onMounted, ref, computed } from 'vue';
import Chart from 'chart.js/auto';
import { useCounselorDashboardStore } from '@/stores/counselorDashboard';

const store = useCounselorDashboardStore();

const totalLifetimeUsers = computed(() => store.filteredSudData.lifetime_users.length);
const totalDailySubstanceUsers = computed(() => store.filteredSudData.active_users.length);

const substancesWithGender = computed(() => {
  return store.filteredMeasurementData.map(data => {
    const measurementAssist = data.measurement_assist;
    const gender = data.user_details.gender;
    const substances = [];
    if (measurementAssist) {
      for (const key in measurementAssist) {
        if (key.endsWith('_measurement')) {
          substances.push({
            name: key.replace('_measurement', ''),
            value: measurementAssist[key]
          });
        }
      }
    }
    return {
      gender: gender,
      substances: substances
    };
  });
});

const severityLevels = ['low risk', 'moderate risk', 'high risk'];

const chartData = ref({
  labels: [],
  datasets: []
});

const processChartData = () => {
  const substanceCounts = {
    male: {},
    female: {}
  };

  substancesWithGender.value.forEach(entry => {
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

  chartData.value.labels = Object.keys(substanceCounts.male).concat(Object.keys(substanceCounts.female)).filter((value, index, self) => self.indexOf(value) === index);

  chartData.value.datasets = severityLevels.flatMap((severity, index) => [
    {
      label: `Male - ${severity}`,
      data: chartData.value.labels.map(substance => substanceCounts.male[substance] ? substanceCounts.male[substance][severity] : 0),
      backgroundColor: `rgba(44, 105, 117, ${0.2 + index * 0.2})`,
      borderColor: `rgba(44, 105, 117, 1)`,
      borderWidth: 1
    },
    {
      label: `Female - ${severity}`,
      data: chartData.value.labels.map(substance => substanceCounts.female[substance] ? substanceCounts.female[substance][severity] : 0),
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
      data: [totalLifetimeUsers.value],
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
      data: [totalDailySubstanceUsers.value],
      backgroundColor: 'rgba(44, 105, 117, 0.4)',
      borderColor: 'rgba(44, 105, 117, 1)',
      borderWidth: 1
    }]
  };
  displayChart(dailyChartData);
};

const handleSubstanceSeverityClick = () => {
  processChartData();
  displayChart(chartData.value);
};

onMounted(() => {
  handleSubstanceSeverityClick();
});
</script>