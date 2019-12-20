<template>
  <div class="assist-severity-container">
    <div v-if="!isLoading && hasData" class="dashboard-container">
      <div class="row g-4">
        <!-- Substance Use Statistics Card -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm h-100">
            <!-- Card Header -->
            <div class="card-header hwss-bg py-3 border-bottom">
              <div class="d-flex align-items-center">
                <i class="bi bi-clipboard2-pulse-fill fs-4 me-2 text-white"></i>
                <h5 class="mb-0 fw-semibold text-white">Substance Use Statistics</h5>
              </div>
            </div>

            <!-- Card Body -->
            <div class="card-body p-4">
              <div class="d-flex flex-column gap-4">
                <!-- Risk Levels -->
                <div class="d-flex align-items-center p-3 rounded-3 bg-light cursor-pointer"
                  :class="buttonClass('risk')" @click="handleSubstanceRiskClick">
                  <div class="d-flex align-items-center justify-content-center bg-white rounded-circle p-2 me-3">
                    <i class="bi bi-exclamation-diamond hwss-primary"></i>
                  </div>
                  <div class="flex-grow-1">
                    <h3 class="mb-1 fw-bold">{{ totalRiskUsers }}</h3>
                    <p class="mb-0 text-muted">Substance Risk Levels</p>
                  </div>
                </div>

                <!-- Lifetime Users -->
                <div class="position-relative">
                  <div class="d-flex align-items-center p-3 rounded-3 bg-light cursor-pointer"
                    :class="buttonClass('lifetime')" @click="handleLifetimeUsersClick" data-bs-toggle="tooltip"
                    data-bs-placement="left" data-bs-html="true"
                    title="Note: This data is currently only available for school-based cluster screening students. For case-based and event-based patients, this feature will be available in the next major update.">
                    <div class="d-flex align-items-center justify-content-center bg-white rounded-circle p-2 me-3">
                      <i class="bi bi-clock-history hwss-primary"></i>
                    </div>
                    <div class="flex-grow-1">
                      <h3 class="mb-1 fw-bold">{{ totalLifetimeUsers }}</h3>
                      <p class="mb-0 text-muted">Lifetime Users</p>
                    </div>
                    <i class="bi bi-info-circle text-muted ms-2" style="font-size: 1.1rem;"></i>
                  </div>
                </div>

                <!-- Active Users -->
                <div class="position-relative">
                  <div class="d-flex align-items-center p-3 rounded-3 bg-light cursor-pointer"
                    :class="buttonClass('active')" @click="handleActiveUsersClick" data-bs-toggle="tooltip"
                    data-bs-placement="left" data-bs-html="true"
                    title="Note: This data is currently only available for school-based cluster screening students. For case-based and event-based patients, this feature will be available in the next major update.">
                    <div class="d-flex align-items-center justify-content-center bg-white rounded-circle p-2 me-3">
                      <i class="bi bi-person-fill-exclamation hwss-primary"></i>
                    </div>
                    <div class="flex-grow-1">
                      <h3 class="mb-1 fw-bold">{{ totalActiveUsers }}</h3>
                      <p class="mb-0 text-muted">Active Users</p>
                    </div>
                    <i class="bi bi-info-circle text-muted ms-2" style="font-size: 1.1rem;"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart Section -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm h-100">
            <!-- Chart Header -->
            <div class="card-header hwss-bg py-3 border-bottom">
              <div class="d-flex align-items-center justify-content-center">
                <h5 class="mb-0 fw-semibold text-white">{{ chartTitle }}</h5>
              </div>
            </div>
            <div class="card-body d-flex justify-content-center align-items-center chart-container">
              <canvas ref="chartCanvas"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5">
      <div class="spinner-border hwss-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading data...</p>
    </div>

    <!-- No Data State -->
    <div v-else class="d-flex justify-content-center align-items-center py-5">
      <div class="text-center">
        <i class="bi bi-clipboard-x fs-1 text-muted mb-3"></i>
        <p class="text-muted">No substance use data available.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      total: 0,
      substances: {}
    })
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const chartCanvas = ref(null);
let myChart = null;
const chartTitle = ref('Substance Risk Levels');
const activeButton = ref('risk'); // 'risk', 'lifetime', or 'active'

// Check if we have valid data
const hasData = computed(() => {
  return props.data.total > 0 && Object.keys(props.data.substances).length > 0;
});

// Function to shorten substance name
const shortenSubstanceName = (name) => {
    const parts = name.split('(')[0].trim();
  return parts;
};

// Chart rendering
const displayChart = (type = 'risk') => {
    if (!chartCanvas.value) return;
    if (myChart) {
        myChart.destroy();
    }

    // Show "No Data Available" for lifetime and active users
    if (type === 'lifetime' || type === 'active') {
        const ctx = chartCanvas.value.getContext('2d');
        ctx.clearRect(0, 0, chartCanvas.value.width, chartCanvas.value.height);
        ctx.fillStyle = 'rgba(43, 101, 111, 0.7)';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No Data Available', chartCanvas.value.width / 2, chartCanvas.value.height / 2);
        return;
    }

    if (!hasData.value) return;

    // Filter out 'Any Drug', shorten substance names, and sort alphabetically
  const substances = Object.keys(props.data.substances)
        .filter(substance => substance !== 'Any Drug')
      .sort((a, b) => a.localeCompare(b))
      .map(name => shortenSubstanceName(name));


    const CHART_COLORS = {
        lowRisk: 'rgba(43,101,111)',     // Cool blue
        moderateRisk: 'rgba(229, 149, 61, 0.7)', // Warm orange
        highRisk: 'rgba(203, 67, 53, 0.7)'       // Deep red
    };

    const datasets = [
        {
            label: 'Low Risk',
            data: Object.keys(props.data.substances)
                .filter(substance => substance !== 'Any Drug')
                .sort((a, b) => a.localeCompare(b))
                .map(substance => props.data.substances[substance]?.low || 0),
            backgroundColor: CHART_COLORS.lowRisk,
            borderColor: 'rgba(43,101,111, 1)',
            borderWidth: 1,
            borderRadius: 8,
            barPercentage: 0.8,
        },
        {
            label: 'Moderate Risk',
            data: Object.keys(props.data.substances)
                .filter(substance => substance !== 'Any Drug')
                .sort((a, b) => a.localeCompare(b))
                .map(substance => props.data.substances[substance]?.moderate || 0),
            backgroundColor: CHART_COLORS.moderateRisk,
            borderColor: 'rgba(229, 149, 61, 1)',
            borderWidth: 1,
            borderRadius: 8,
            barPercentage: 0.8,
        },
        {
            label: 'High Risk',
            data: Object.keys(props.data.substances)
                .filter(substance => substance !== 'Any Drug')
                .sort((a, b) => a.localeCompare(b))
                .map(substance => props.data.substances[substance]?.high || 0),
            backgroundColor: CHART_COLORS.highRisk,
            borderColor: 'rgba(203, 67, 53, 1)',
            borderWidth: 1,
            borderRadius: 8,
            barPercentage: 0.8,
        },
    ];


    myChart = new Chart(chartCanvas.value, {
        type: 'bar',
        data: {
            labels: substances,
            datasets
        },
        options: {
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    },
                    border: {
                        display: true,
                        color: 'rgba(43, 101, 111, 0.3)'
                    },
                    ticks: {
                        color: 'rgba(43, 101, 111, 0.8)'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    grid: {
                        display: false
                    },
                    border: {
                        display: true,
                        color: 'rgba(43, 101, 111, 0.3)'
                    },
                    ticks: {
                        color: 'rgba(43, 101, 111, 0.8)'
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20,
                        color: 'rgba(43, 101, 111, 0.8)'
                    }
                },
                title: {
                    display: true,
                    text: chartTitle.value,
                    color: 'rgba(43, 101, 111, 0.8)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                }
            }
        },
    });
};

const handleSubstanceRiskClick = () => {
  activeButton.value = 'risk';
  chartTitle.value = 'Substance Risk Levels';
  displayChart('risk');
};

const handleLifetimeUsersClick = () => {
  activeButton.value = 'lifetime';
  chartTitle.value = 'Lifetime Users';
  displayChart('lifetime');
};

const handleActiveUsersClick = () => {
  activeButton.value = 'active';
  chartTitle.value = 'Active Users';
  displayChart('active');
};

const buttonClass = (type) => {
  return {
    'btn': true,
    'btn-gradient-light': activeButton.value !== type,
    'active-button': activeButton.value === type
  };
};

watch(() => props.data, () => {
  displayChart(activeButton.value);
}, { immediate: true });

onMounted(() => {
    if (hasData.value && !props.isLoading) {
        displayChart(activeButton.value);
    }
});


onMounted(() => {
  // Initialize all tooltips
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});
</script>

<style scoped>
.dashboard-container {
  background: linear-gradient(135deg, rgba(230, 243, 245, 0.8), rgba(240, 247, 248, 0.8));
  border-radius: 1rem;
  backdrop-filter: blur(10px);
}

.card {
  border: none;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(43, 101, 111, 0.1);
  background: rgba(255, 255, 255, 0.9);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(43, 101, 111, 0.15);
}

.card-header {
  border-bottom: none;
  padding: 1.5rem;
}

.bg-gradient-dark {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.btn {
  border: none;
  transition: all 0.3s ease;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 0.5rem;
  padding: 2rem;
  margin-bottom: 1rem;
  width: 100%;
}

.btn:last-child {
  margin-bottom: 0;
}

.btn-gradient-light {
  background: linear-gradient(135deg, rgba(230, 243, 245, 0.9), rgba(240, 247, 248, 0.9));
  color: #2B656F !important;
}

.btn-gradient-light h2,
.btn-gradient-light p {
  color: #2B656F !important;
}

.active-button {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%) !important;
  color: white !important;
  border: none !important;
}

.active-button h2,
.active-button p {
  color: white !important;
}

.chart-container {
  position: relative;
  height: 400px;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0 0 1rem 1rem;
}

.loading-container,
.no-data-container {
  min-height: 400px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  border: none;
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