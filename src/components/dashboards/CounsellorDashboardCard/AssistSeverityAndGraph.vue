<template>
  <div class="assist-severity-container">
    <div v-if="!isLoading && hasData" class="dashboard-container">
      <div class="row g-4">
        <!-- Lifetime Users -->
        <div class="col-lg-4">
          <div class="card h-100 shadow-sm">
            <div class="card-header bg-gradient-dark">
              <h4 class="text-center mb-0 text-white">Substance Use</h4>
            </div>
            <div class="card-body d-flex flex-column">
              <button class="btn btn-gradient-light mb-3 flex-fill" @click="handleLifetimeUsersClick">
                <h2 class="mb-0">{{ totalLifetimeUsers }}</h2>
                <p class="mb-0">Lifetime Users</p>
              </button>

              <button class="btn btn-gradient-light mb-3 flex-fill" @click="handleActiveUsersClick">
                <h2 class="mb-0">{{ totalActiveUsers }}</h2>
                <p class="mb-0">Active Users</p>
              </button>

              <button class="btn btn-gradient-light flex-fill" @click="handleSubstanceRiskClick">
                <h2 class="mb-0">{{ totalRiskUsers }}</h2>
                <p class="mb-0">Substance Risk Levels</p>
              </button>
            </div>
          </div>
        </div>

        <!-- Chart Section -->
        <div class="col-lg-8">
          <div class="card h-100 shadow-sm">
            <div class="card-header bg-gradient-dark">
              <h4 class="text-center mb-0 text-white">{{ chartTitle }}</h4>
            </div>
            <div class="card-body d-flex justify-content-center align-items-center chart-container">
              <canvas ref="chartCanvas"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="isLoading" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading data...</p>
    </div>

    <div v-else class="no-data-container">
      <p>No substance use data available.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  filteredData: {
    type: Array,
    required: true,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

// Chart references and configuration
const chartCanvas = ref(null);
let myChart = null;
const chartTitle = ref('Substance Use Overview');

// Check if we have valid data
const hasData = computed(() => {
  return Array.isArray(props.filteredData) &&
    props.filteredData.length > 0;
});

// Colors for chart datasets
const CHART_COLORS = {
  male: 'rgba(43, 101, 111, 0.8)',
  female: 'rgba(29, 72, 81, 0.8)',
  lowRisk: 'rgba(120, 224, 143, 0.8)',
  moderateRisk: 'rgba(255, 190, 118, 0.8)',
  highRisk: 'rgba(235, 77, 75, 0.8)',
};

// Total users calculations with null safety
const totalLifetimeUsers = computed(() => {
  if (!hasData.value) return 0;
  return props.filteredData.filter(user =>
    user.screening_data?.assist_data &&
    Array.isArray(user.screening_data.assist_data)
  ).length;
});

const totalActiveUsers = computed(() => {
  if (!hasData.value) return 0;
  return props.filteredData.filter(user => {
    const assistData = user.screening_data?.assist_data;
    return assistData && Array.isArray(assistData) &&
      assistData.some(sub => sub?.risk_flag === 'severe');
  }).length;
});

const totalRiskUsers = computed(() => {
  if (!hasData.value) return 0;
  let count = 0;
  props.filteredData.forEach(user => {
    const assistData = user.screening_data?.assist_data;
    if (assistData && Array.isArray(assistData)) {
      count += assistData.filter(sub => sub?.risk_flag && sub.risk_flag !== 'none').length;
    }
  });
  return count;
});

// Substance Usage with null safety
const substanceUsage = computed(() => {
  const usage = { lifetime: { male: {}, female: {} }, active: { male: {}, female: {} } };

  if (!hasData.value) return usage;

  props.filteredData.forEach(user => {
    const assistData = user.screening_data?.assist_data;
    if (!assistData || !Array.isArray(assistData)) return;

    const gender = user.user?.gender?.toLowerCase() || 'unknown';
    if (gender !== 'male' && gender !== 'female') return;

    assistData.forEach(substance => {
      if (!substance?.substance_name || !substance?.risk_flag) return;

      const substanceName = substance.substance_name;
      if (substance.risk_flag !== 'none') {
        // Lifetime
        usage.lifetime[gender][substanceName] = (usage.lifetime[gender][substanceName] || 0) + 1;
        // Active (severe risk)
        if (substance.risk_flag === 'severe') {
          usage.active[gender][substanceName] = (usage.active[gender][substanceName] || 0) + 1;
        }
      }
    });
  });

  return usage;
});

// Risk Levels with null safety
const substanceRiskLevels = computed(() => {
  const riskLevels = {};

  if (!hasData.value) return riskLevels;

  props.filteredData.forEach(user => {
    const assistData = user.screening_data?.assist_data;
    if (!assistData || !Array.isArray(assistData)) return;

    assistData.forEach(substance => {
      if (!substance?.substance_name || !substance?.risk_flag) return;

      const name = substance.substance_name;
      const risk = substance.risk_flag.toLowerCase();

      if (!riskLevels[name]) {
        riskLevels[name] = { low: 0, moderate: 0, high: 0 };
      }
      if (risk !== 'none') {
        riskLevels[name][risk]++;
      }
    });
  });

  return riskLevels;
});

// Chart rendering with error handling
const displayChart = (data) => {
  if (!chartCanvas.value) return;

  try {
    if (myChart) {
      myChart.destroy();
    }

    if (!data.labels.length) {
      const ctx = chartCanvas.value.getContext('2d');
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#666';
      ctx.fillText('No data available', chartCanvas.value.width / 2, chartCanvas.value.height / 2);
      return;
    }

    myChart = new Chart(chartCanvas.value, {
      type: 'bar',
      data: data,
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Number of Users' },
          },
          x: { stacked: true },
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: chartTitle.value },
        },
      },
    });
  } catch (error) {
    console.error('Error creating chart:', error);
  }
};

// Button Handlers with null checks
const handleLifetimeUsersClick = () => {
  chartTitle.value = 'Lifetime Substance Use by Gender';
  const substances = [...new Set([
    ...Object.keys(substanceUsage.value.lifetime.male),
    ...Object.keys(substanceUsage.value.lifetime.female)
  ])];

  if (substances.length === 0) {
    displayChart({ labels: [], datasets: [] });
    return;
  }

  displayChart({
    labels: substances,
    datasets: [
      {
        label: 'Male',
        data: substances.map(substance => substanceUsage.value.lifetime.male[substance] || 0),
        backgroundColor: CHART_COLORS.male,
      },
      {
        label: 'Female',
        data: substances.map(substance => substanceUsage.value.lifetime.female[substance] || 0),
        backgroundColor: CHART_COLORS.female,
      },
    ],
  });
};

const handleActiveUsersClick = () => {
  chartTitle.value = 'Active Substance Use by Gender';
  const substances = [...new Set([
    ...Object.keys(substanceUsage.value.active.male),
    ...Object.keys(substanceUsage.value.active.female)
  ])];

  if (substances.length === 0) {
    displayChart({ labels: [], datasets: [] });
    return;
  }

  displayChart({
    labels: substances,
    datasets: [
      {
        label: 'Male',
        data: substances.map(substance => substanceUsage.value.active.male[substance] || 0),
        backgroundColor: CHART_COLORS.male,
      },
      {
        label: 'Female',
        data: substances.map(substance => substanceUsage.value.active.female[substance] || 0),
        backgroundColor: CHART_COLORS.female,
      },
    ],
  });
};

const handleSubstanceRiskClick = () => {
  chartTitle.value = 'Substance Risk Levels';
  const substances = Object.keys(substanceRiskLevels.value);

  if (substances.length === 0) {
    displayChart({ labels: [], datasets: [] });
    return;
  }

  const datasets = [
    {
      label: 'Low Risk',
      data: substances.map(substance => substanceRiskLevels.value[substance].low || 0),
      backgroundColor: CHART_COLORS.lowRisk,
    },
    {
      label: 'Moderate Risk',
      data: substances.map(substance => substanceRiskLevels.value[substance].moderate || 0),
      backgroundColor: CHART_COLORS.moderateRisk,
    },
    {
      label: 'High Risk',
      data: substances.map(substance => substanceRiskLevels.value[substance].high || 0),
      backgroundColor: CHART_COLORS.highRisk,
    },
  ];

  displayChart({ labels: substances, datasets });
};

onMounted(() => {
  if (hasData.value && !props.isLoading) {
    handleLifetimeUsersClick();
  }
});

watch(() => props.filteredData, () => {
  if (hasData.value && !props.isLoading) {
    handleLifetimeUsersClick();
  }
}, { deep: true });

watch(() => props.isLoading, (newValue) => {
  if (!newValue && hasData.value) {
    handleLifetimeUsersClick();
  }
});
</script>

<style scoped>
.dashboard-container {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 1rem;
}

.card {
  border: none;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-bottom: none;
  padding: 1.5rem;
}

.bg-gradient-dark {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.btn-gradient-light {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  color: #2B656F !important;
}

.btn {
  border: none;
  color: white;
  transition: all 0.3s ease;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 0.5rem;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.btn-gradient-dark {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

h2,
h4 {
  color: #2B656F;
}

.chart-container {
  position: relative;
  height: 400px;
  padding: 1rem;
  border-radius: 0 0 1rem 1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  background-color: #f0f7f8;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  color: #2B656F;
}

.assist-severity-container {
  width: 100%;
  min-height: 400px;
}

.chart-container {
  height: 400px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.no-data-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background-color: #f8f9fa;
  border-radius: 8px;
}
</style>