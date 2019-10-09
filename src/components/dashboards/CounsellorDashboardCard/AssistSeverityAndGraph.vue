<template>
  <div v-if="isDataAvailable" class="dashboard-container">
    <div class="row g-4">
      <div class="col-lg-4">
        <div class="card h-100 shadow-sm">
          <div class="card-header bg-gradient-light">
            <h4 class="text-center mb-0">Substance Use</h4>
          </div>
          <div class="card-body d-flex flex-column">
            <button class="btn btn-gradient mb-3 flex-fill" @click="handleLifetimeUsersClick">
              <h2 class="mb-0">{{ totalLifetimeUsers }}</h2>
              <p class="mb-0">Lifetime Users</p>
            </button>

            <button class="btn btn-gradient mb-3 flex-fill" @click="handleActiveUsersClick">
              <h2 class="mb-0">{{ totalActiveUsers }}</h2>
              <p class="mb-0">Active Users</p>
            </button>

            <button class="btn btn-gradient flex-fill" @click="handleSubstanceRiskClick">
              Substance Risk Levels
            </button>
          </div>
        </div>
      </div>

      <div class="col-lg-8">
        <div class="card h-100 shadow-sm">
          <div class="card-header bg-gradient-light">
            <h4 class="text-center mb-0">{{ chartTitle }}</h4>
          </div>
          <div class="card-body d-flex justify-content-center align-items-center">
            <canvas ref="chartCanvas" style="width: 100%; height: 400px;"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading-container">
    <p>Loading data...</p>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch, inject } from 'vue';
import Chart from 'chart.js/auto';

const filteredData = inject('filteredData', []);

const chartCanvas = ref(null);
let myChart = null;
const chartTitle = ref('Substance Use Overview');

const CHART_COLORS = {
  male: '#2c6975',
  female: '#3d7a86',
  lowRisk: '#6da5b1',
  moderateRisk: '#4c8d9a',
  highRisk: '#2c6975'
};

const isDataAvailable = computed(() => Array.isArray(filteredData.value) && filteredData.value.length > 0);

const totalLifetimeUsers = computed(() => {
  if (!isDataAvailable.value) return 0;
  return filteredData.value.filter(user => user.sudData?.lifetime?.substances_used?.length > 0).length;
});

const totalActiveUsers = computed(() => {
  if (!isDataAvailable.value) return 0;
  return filteredData.value.filter(user => user.sudData?.active?.substances_used?.length > 0).length;
});

const substanceUsage = computed(() => {
  if (!isDataAvailable.value) return { lifetime: {}, active: {} };
  const usage = { lifetime: { male: {}, female: {} }, active: { male: {}, female: {} } };

  filteredData.value.forEach(user => {
    const lifetimeSubstances = user.sudData?.lifetime?.substances_used || [];
    const activeSubstances = user.sudData?.active?.substances_used || [];
    const gender = (user.sudData?.lifetime?.sex || user.sudData?.active?.sex || user.userDetails?.gender || 'Unknown').toLowerCase();

    if (gender === 'male' || gender === 'female') {
      lifetimeSubstances.forEach(substance => {
        usage.lifetime[gender][substance] = (usage.lifetime[gender][substance] || 0) + 1;
      });
      activeSubstances.forEach(substance => {
        usage.active[gender][substance] = (usage.active[gender][substance] || 0) + 1;
      });
    }
  });

  return usage;
});

const substanceRiskLevels = computed(() => {
  if (!isDataAvailable.value) return {};
  const riskLevels = {};
  const substances = [
    'alcoholic', 'tobacco', 'cannabis', 'cocaine', 'amphetamine',
    'inhalants', 'sedatives', 'hallucinogens', 'opioids'
  ];

  filteredData.value.forEach(user => {
    substances.forEach(substance => {
      const measurement = user.measurementAssist[`${substance}_measurement`];
      if (measurement) {
        if (!riskLevels[substance]) {
          riskLevels[substance] = { 'low risk': 0, 'moderate risk': 0, 'high risk': 0 };
        }
        riskLevels[substance][measurement]++;
      }
    });
  });

  return riskLevels;
});

const displayChart = (data) => {
  if (!chartCanvas.value) return;

  if (myChart) myChart.destroy();

  myChart = new Chart(chartCanvas.value, {
    type: 'bar',
    data: data,
    options: {
      scales: {
        y: { 
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Users'
          }
        },
        x: { stacked: true }
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: chartTitle.value
        }
      }
    }
  });
};

const handleLifetimeUsersClick = () => {
  chartTitle.value = 'Lifetime Substance Use by Gender';
  const substances = [...new Set([...Object.keys(substanceUsage.value.lifetime.male), ...Object.keys(substanceUsage.value.lifetime.female)])];
  displayChart({
    labels: substances,
    datasets: [
      {
        label: 'Male',
        data: substances.map(substance => substanceUsage.value.lifetime.male[substance] || 0),
        backgroundColor: CHART_COLORS.male,
        borderColor: CHART_COLORS.male,
        borderWidth: 1
      },
      {
        label: 'Female',
        data: substances.map(substance => substanceUsage.value.lifetime.female[substance] || 0),
        backgroundColor: CHART_COLORS.female,
        borderColor: CHART_COLORS.female,
        borderWidth: 1
      }
    ]
  });
};

const handleActiveUsersClick = () => {
  chartTitle.value = 'Active Substance Use by Gender';
  const substances = [...new Set([...Object.keys(substanceUsage.value.active.male), ...Object.keys(substanceUsage.value.active.female)])];
  displayChart({
    labels: substances,
    datasets: [
      {
        label: 'Male',
        data: substances.map(substance => substanceUsage.value.active.male[substance] || 0),
        backgroundColor: CHART_COLORS.male,
        borderColor: CHART_COLORS.male,
        borderWidth: 1
      },
      {
        label: 'Female',
        data: substances.map(substance => substanceUsage.value.active.female[substance] || 0),
        backgroundColor: CHART_COLORS.female,
        borderColor: CHART_COLORS.female,
        borderWidth: 1
      }
    ]
  });
};

const handleSubstanceRiskClick = () => {
  chartTitle.value = 'Substance Risk Levels';
  const substances = Object.keys(substanceRiskLevels.value);
  
  const datasets = [
    {
      label: 'Low Risk',
      data: substances.map(substance => substanceRiskLevels.value[substance]['low risk'] || 0),
      backgroundColor: CHART_COLORS.lowRisk,
      borderColor: CHART_COLORS.lowRisk,
      borderWidth: 1
    },
    {
      label: 'Moderate Risk',
      data: substances.map(substance => substanceRiskLevels.value[substance]['moderate risk'] || 0),
      backgroundColor: CHART_COLORS.moderateRisk,
      borderColor: CHART_COLORS.moderateRisk,
      borderWidth: 1
    },
    {
      label: 'High Risk',
      data: substances.map(substance => substanceRiskLevels.value[substance]['high risk'] || 0),
      backgroundColor: CHART_COLORS.highRisk,
      borderColor: CHART_COLORS.highRisk,
      borderWidth: 1
    }
  ];

  displayChart({ labels: substances, datasets });
};

onMounted(() => {
  if (isDataAvailable.value) {
    handleLifetimeUsersClick();
  }
});

watch(filteredData, (newData) => {
  if (Array.isArray(newData) && newData.length > 0) {
    handleLifetimeUsersClick();
  }
}, { deep: true });

</script>



<style scoped>
.dashboard-container {
  background: linear-gradient(135deg, #ffffff, #f0f7f8);
  padding: 2rem;
  border-radius: 1rem;
}

.card {
  border: none;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-bottom: none;
  padding: 1.5rem;
}

.bg-gradient-light {
  background: linear-gradient(135deg, #ffffff, #f0f7f8);
}

.btn-gradient {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  border: none;
  color: white;
  transition: all 0.3s ease;
}

.btn-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

h2, h4 {
  color: #2B656F;
}

.chart-container {
  position: relative;
  height: 400px;
}
</style>