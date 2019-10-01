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
        <div class="card-body d-flex justify-content-center align-items-center w-100" style="height: 400px;">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import Chart from 'chart.js/auto';
import { storeToRefs } from 'pinia';
import { useCounselorDashboardStore } from '@/stores/counselorDashboard';

const store = useCounselorDashboardStore();
const {
  filteredSudData,
  filteredAssistMeasurementData,
  filteredReportData,
  isInitialized,
  agencyName
} = storeToRefs(store);

// Access CHART_COLORS directly from the store
const { CHART_COLORS } = store;

const chartCanvas = ref(null);
let myChart = null;

const totalLifetimeUsers = computed(() => filteredSudData.value.lifetime_users.length);
const totalDailySubstanceUsers = computed(() => filteredSudData.value.active_users.length);

const substancesWithGender = computed(() => {
  return filteredAssistMeasurementData.value.map(data => {
    const reportUser = filteredReportData.value.find(report => report.user?.id === data.user);
    const gender = reportUser?.user_details?.gender || 'Unknown';
    const substances = Object.entries(data)
      .filter(([key, value]) => key.endsWith('_measurement') && value !== null)
      .map(([key, value]) => ({
        name: key.replace('_measurement', ''),
        value: parseInt(value, 10)
      }));
    return { gender, substances };
  });
});

const severityLevels = ['low', 'moderate', 'high'];

const chartData = computed(() => {
  const substanceCounts = { male: {}, female: {} };

  substancesWithGender.value.forEach(entry => {
    const gender = entry.gender.toLowerCase();
    if (gender !== 'male' && gender !== 'female') return;

    entry.substances.forEach(substance => {
      if (!substanceCounts[gender][substance.name]) {
        substanceCounts[gender][substance.name] = { low: 0, moderate: 0, high: 0 };
      }
      let severity = 'low';
      if (substance.value >= 27) severity = 'high';
      else if (substance.value >= 4) severity = 'moderate';
      substanceCounts[gender][substance.name][severity]++;
    });
  });

  const labels = [...new Set([...Object.keys(substanceCounts.male), ...Object.keys(substanceCounts.female)])];

  const datasets = severityLevels.flatMap((severity, index) => [
    {
      label: `Male - ${severity}`,
      data: labels.map(substance => substanceCounts.male[substance]?.[severity] || 0),
      backgroundColor: `${CHART_COLORS[0]}${Math.round((0.2 + index * 0.2) * 255).toString(16).padStart(2, '0')}`,
      borderColor: CHART_COLORS[0],
      borderWidth: 1
    },
    {
      label: `Female - ${severity}`,
      data: labels.map(substance => substanceCounts.female[substance]?.[severity] || 0),
      backgroundColor: `${CHART_COLORS[1]}${Math.round((0.2 + index * 0.2) * 255).toString(16).padStart(2, '0')}`,
      borderColor: CHART_COLORS[1],
      borderWidth: 1
    }
  ]);

  return { labels, datasets };
});

const displayChart = (data) => {
  if (!chartCanvas.value) return;

  if (myChart) myChart.destroy();

  myChart = new Chart(chartCanvas.value, {
    type: 'bar',
    data: data,
    options: {
      scales: {
        y: { beginAtZero: true, stacked: true },
        x: { stacked: true }
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: `Substance Use by Gender and Severity - ${agencyName.value}`
        }
      }
    }
  });
};

const handleLifetimeUserClick = () => {
  displayChart({
    labels: ['Lifetime Users'],
    datasets: [{
      label: 'Users',
      data: [totalLifetimeUsers.value],
      backgroundColor: `${CHART_COLORS[0]}33`,
      borderColor: CHART_COLORS[0],
      borderWidth: 1
    }]
  });
};

const handleDailyUsersClick = () => {
  displayChart({
    labels: ['Daily Users'],
    datasets: [{
      label: 'Users',
      data: [totalDailySubstanceUsers.value],
      backgroundColor: `${CHART_COLORS[0]}66`,
      borderColor: CHART_COLORS[0],
      borderWidth: 1
    }]
  });
};

const handleSubstanceSeverityClick = () => {
  displayChart(chartData.value);
};

onMounted(async () => {
  if (!isInitialized.value) {
    await store.initializeStore();
  }
  handleSubstanceSeverityClick();
});

watch([filteredSudData, filteredAssistMeasurementData, filteredReportData], () => {
  handleSubstanceSeverityClick();
}, { deep: true });

</script>