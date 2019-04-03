<template>
  <div class="card my-5">
    <div class="card-body">
      <div class="row">
        <div class="col-md-6">
          <h2 class="card-title text-center">Substances</h2>
          <div class="substances-list">
            <div class="row">
              <div class="col-md-6" v-for="(pair, index) in substancePairs" :key="index">
                <button
                  v-for="substance in pair"
                  :key="substance"
                  class="btn btn-block rounded-pill"
                  :class="{ 'btn-primary': selectedSubstance === substance, 'btn-secondary': selectedSubstance !== substance }"
                  @click="selectSubstance(substance)"
                >
                  {{ substance }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div v-if="selectedSubstance">
            <h2 class="text-center">Risks for {{ selectedSubstance }}</h2>
            <div class="chart-container">
              <canvas ref="chartCanvas"></canvas>
            </div>
          </div>
          <div v-else>
            <p class="text-center">Select a substance to view its risk levels</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import Chart from 'chart.js/auto';

const substances = ref(['Cigarettes', 'Alcohol', 'Cannabis', 'Cocaine', 'Heroin', 'Methamphetamine', 'Prescription Drugs', 'Other']);
const selectedSubstance = ref(null);

const substancePairs = ref([]);

const moderateRiskCounts = ref({});
const highRiskCounts = ref({});

onMounted(() => {
  // Arrange substances in pairs
  for (let i = 0; i < substances.value.length; i += 2) {
    substancePairs.value.push([substances.value[i], substances.value[i + 1]]);
  }
});

const renderChart = () => {
  if (!selectedSubstance.value || !chartCanvas.value) return;
  const ctx = chartCanvas.value.getContext('2d');
  if (chartInstance) {
    chartInstance.destroy(); // Clear previous chart
  }
  const data = {
    labels: Object.keys(moderateRiskCounts.value),
    datasets: [
      {
        label: 'Male',
        data: Object.values(moderateRiskCounts.value),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Female',
        data: Object.values(highRiskCounts.value),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        x: {
          stacked: false,
          title: {
            display: true,
            text: 'Categories'
          }
        },
        y: {
          stacked: false,
          title: {
            display: true,
            text: 'Count'
          },
          ticks: {
            beginAtZero: true
          }
        }
      }
    }
  });
};

const selectSubstance = (substance) => {
  selectedSubstance.value = substance;
  // Example: Dummy data for moderate risk and high risk
  moderateRiskCounts.value = {
    'ModerateRisk': 14,
    'HighRisk': 7,
  };
  highRiskCounts.value = {
    'moderateRisk': 5,
    'highRisk': 10,
  };
};

watch(selectedSubstance, renderChart);
let chartInstance = null; // Store chart instance for destruction
const chartCanvas = ref(null);
</script>

<style scoped>
.container {
  margin-top: 20px;
}

.substances-list {
  padding: 10px;
}

.substances-list .row .col-md-6 {
  padding: 5px;
}

.card {
  margin: 0 auto;
  width: 100%;
}

.card-title {
  margin-bottom: 20px;
}

.btn {
  border-radius: 25px;
  background-color: white;
  color: black;
  border: 1px solid black;
}

.btn-primary {
  background-color: #64AC99 !important;
  color: white;
  border-color: #64AC99 !important;
}

.btn-secondary {
  background-color: #f2f2f2;
  color: black;
  border-color: #f2f2f2;
}

.chart-container {
  margin-top: 20px;
}
</style>
