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

          <button class="btn btn-primary btn-block mb-3 flex-fill" @click="handleActiveUsersClick">
            <h1>{{ totalActiveUsers }}</h1>
            <p class="mb-0">Active Substance Users</p>
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
const { filteredUserData, isInitialized, agencyName, CHART_COLORS } = storeToRefs(store);

const chartCanvas = ref(null);
let myChart = null;

// Fallback colors in case CHART_COLORS is undefined
const fallbackColors = ['#36A2EB', '#FF6384'];

const getChartColor = (index) => {
  return CHART_COLORS?.value?.[index] || fallbackColors[index] || fallbackColors[0];
};

const totalLifetimeUsers = computed(() =>
  filteredUserData.value.filter(user => user.sudData?.lifetime).length
);

const totalActiveUsers = computed(() =>
  filteredUserData.value.filter(user => user.sudData?.active).length
);

const substancesWithGender = computed(() => {
  return filteredUserData.value.map(user => {
    const gender = user.sudData?.active?.sex || user.gender || 'Unknown';
    const substances = user.sudData?.active?.substances_used || [];
    return { gender, substances };
  });
});

const chartData = computed(() => {
  const substanceCounts = { Male: {}, Female: {} };

  substancesWithGender.value.forEach(entry => {
    const gender = entry.gender;
    if (gender !== 'Male' && gender !== 'Female') return;

    entry.substances.forEach(substance => {
      if (!substanceCounts[gender][substance]) {
        substanceCounts[gender][substance] = 0;
      }
      substanceCounts[gender][substance]++;
    });
  });

  const labels = [...new Set([...Object.keys(substanceCounts.Male), ...Object.keys(substanceCounts.Female)])];

  const datasets = [
    {
      label: 'Male',
      data: labels.map(substance => substanceCounts.Male[substance] || 0),
      backgroundColor: `${getChartColor(0)}99`,
      borderColor: getChartColor(0),
      borderWidth: 1
    },
    {
      label: 'Female',
      data: labels.map(substance => substanceCounts.Female[substance] || 0),
      backgroundColor: `${getChartColor(1)}99`,
      borderColor: getChartColor(1),
      borderWidth: 1
    }
  ];

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
        y: { beginAtZero: true },
        x: { stacked: true }
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: `Substance Use by Gender - ${agencyName.value || 'Agency'}`
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
      backgroundColor: `${getChartColor(0)}99`,
      borderColor: getChartColor(0),
      borderWidth: 1
    }]
  });
};

const handleActiveUsersClick = () => {
  displayChart({
    labels: ['Active Users'],
    datasets: [{
      label: 'Users',
      data: [totalActiveUsers.value],
      backgroundColor: `${getChartColor(0)}99`,
      borderColor: getChartColor(0),
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

watch(filteredUserData, () => {
  handleSubstanceSeverityClick();
}, { deep: true });

</script>