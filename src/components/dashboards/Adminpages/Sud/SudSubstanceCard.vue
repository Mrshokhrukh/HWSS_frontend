<template>
  <div class="risk-level-container">
    <h2 class="main-title">Risk Level Analysis</h2>
    <div class="content-wrapper">
      <div class="buttons-section">
        <h3 class="section-title">Substances</h3>
        <div class="button-grid">
          <button v-for="substance in substances" :key="substance" @click="setActiveButton(substance)"
            :class="['substance-btn', { active: activeButton === substance }]">
            {{ substance }}
          </button>
        </div>
      </div>
      <div class="charts-section">
        <div class="chart-card">
          <h4 class="chart-title">High Risk Count by Gender</h4>
          <canvas id="donutChartTotal"></canvas>
        </div>
        <div class="chart-card">
          <h4 class="chart-title">Moderate Risk Count by Gender</h4>
          <canvas id="donutChartModerate"></canvas>
        </div>
        <div class="chart-card full-width">
          <h4 class="chart-title">Risk Comparison</h4>
          <canvas id="barChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';

const activeButton = ref(null);
const substances = [
  'Tobacco', 'Alcohol', 'Cannabis', 'Cocaine', 'Amphetamine-type',
  'Inhalant', 'Sedative', 'Hallucinate', 'Opioids', 'Others'
];

// Mapping of substance names to their data keys
const substanceKeyMapping = {
  'Tobacco': 'tobacco',
  'Alcohol': 'alcoholic',
  'Cannabis': 'cannabis',
  'Cocaine': 'cocaine',
  'Amphetamine-type': 'amphetamine',
  'Inhalant': 'inhalants',
  'Sedative': 'sedatives',
  'Hallucinate': 'hallucinogens',
  'Opioids': 'opioids',
  'Others': 'other'
};

const reportData = JSON.parse(sessionStorage.getItem('reportData')) || [];

function extractMeasurementData(reportData) {
  return reportData.reduce((results, person) => {
    const measurementAssist = person.measurement_assist?.fields;
    const gender = person.user?.fields?.gender || "unknown";
    
    if (measurementAssist) {
      results.push({
        gender,
        alcoholic: measurementAssist.alcoholic_measurement || "no data",
        amphetamine: measurementAssist.amphetamine_measurement || "no data",
        cannabis: measurementAssist.cannabis_measurement || "no data",
        cocaine: measurementAssist.cocaine_measurement || "no data",
        hallucinogens: measurementAssist.hallucinogens_measurement || "no data",
        inhalants: measurementAssist.inhalants_measurement || "no data",
        opioids: measurementAssist.opioids_measurement || "no data",
        sedatives: measurementAssist.sedatives_measurement || "no data",
        tobacco: measurementAssist.tobacco_measurement || "no data",
        other: measurementAssist.other_measurement || "no data"
      });
    }
    return results;
  }, []);
}

function countRiskLevels(data) {
  const initialCounts = {};
  
  // Initialize counts for all substances
  Object.values(substanceKeyMapping).forEach(substance => {
    initialCounts[`${substance}_moderate_male`] = 0;
    initialCounts[`${substance}_moderate_female`] = 0;
    initialCounts[`${substance}_high_male`] = 0;
    initialCounts[`${substance}_high_female`] = 0;
  });

  // Count risk levels
  return data.reduce((counts, personData) => {
    Object.entries(substanceKeyMapping).forEach(([_, substanceKey]) => {
      const riskLevel = personData[substanceKey];
      if (riskLevel === 'moderate risk' || riskLevel === 'high risk') {
        const key = `${substanceKey}_${riskLevel.split(' ')[0]}_${personData.gender.toLowerCase()}`;
        counts[key]++;
      }
    });
    return counts;
  }, initialCounts);
}

const extractedData = extractMeasurementData(reportData);
const counts = countRiskLevels(extractedData);

function mapCountsToDummyData(counts) {
  return Object.entries(substanceKeyMapping).reduce((acc, [displayName, dataKey]) => {
    acc[displayName] = {
      'High-risk total male': counts[`${dataKey}_high_male`] || 0,
      'High-risk total female': counts[`${dataKey}_high_female`] || 0,
      'Moderate-risk total male': counts[`${dataKey}_moderate_male`] || 0,
      'Moderate-risk total female': counts[`${dataKey}_moderate_female`] || 0,
    };
    return acc;
  }, {});
}

const dummyData = mapCountsToDummyData(counts);

let donutChartTotalInstance = null;
let donutChartModerateInstance = null;
let barChartInstance = null;

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#333',
        font: {
          size: 12,
          family: "'Arial', sans-serif"
        }
      }
    }
  }
};

function renderChart(type, canvasId, data, options) {
  const existingChart = type === 'donut' ? 
    (canvasId === 'donutChartTotal' ? donutChartTotalInstance : donutChartModerateInstance) : 
    barChartInstance;

  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = document.getElementById(canvasId).getContext('2d');
  const chart = new Chart(ctx, {
    type: type === 'donut' ? 'doughnut' : 'bar',
    data,
    options
  });

  // Add empty state text if needed
  if (type === 'donut' && data.datasets[0].data.length === 1 && data.datasets[0].data[0] === 1 ||
      type === 'bar' && !data.datasets.some(dataset => dataset.data.some(value => value > 0))) {
    const chartArea = chart.chartArea;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('No data available', centerX, centerY);
    ctx.restore();
  }

  return chart;
}

function updateCharts() {
  const data = dummyData[activeButton.value];
  if (!data) return;

  const totalHighRisk = data['High-risk total male'] + data['High-risk total female'];
  const totalModerateRisk = data['Moderate-risk total male'] + data['Moderate-risk total female'];

  // Configure chart data
  const donutDataTotal = {
    labels: ['Male', 'Female'],
    datasets: [{
      data: totalHighRisk === 0 ? [1] : [data['High-risk total male'], data['High-risk total female']],
      backgroundColor: totalHighRisk === 0 ? ['#e6e6e6'] : ['#2c6975', '#00000'],
      hoverBackgroundColor: totalHighRisk === 0 ? ['#e6e6e6'] : ['#2c6975', '#00000'],
    }]
  };

  const donutDataModerate = {
    labels: ['Male', 'Female'],
    datasets: [{
      data: totalModerateRisk === 0 ? [1] : [data['Moderate-risk total male'], data['Moderate-risk total female']],
      backgroundColor: totalModerateRisk === 0 ? ['#e6e6e6'] : ['#2c6975', '#00000'],
      hoverBackgroundColor: totalModerateRisk === 0 ? ['#e6e6e6'] : ['#2c6975', '#00000'],
    }]
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
    }]
  };

  // Configure chart options
  const donutOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: (context) => {
            if (context.chart.data.datasets[0].data.length === 1 && 
                context.chart.data.datasets[0].data[0] === 1) {
              return 'No data available';
            }
            return `${context.label}: ${context.raw}`;
          }
        }
      }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: { stacked: true },
      y: { 
        stacked: true,
        min: 0,
        ticks: { stepSize: 1 }
      }
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: (context) => {
            if (context.raw === 0) return `${context.dataset.label}: No data`;
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    }
  };

  // Render all charts
  donutChartTotalInstance = renderChart('donut', 'donutChartTotal', donutDataTotal, donutOptions);
  donutChartModerateInstance = renderChart('donut', 'donutChartModerate', donutDataModerate, donutOptions);
  barChartInstance = renderChart('bar', 'barChart', barData, barOptions);
}

const setActiveButton = (buttonName) => {
  activeButton.value = buttonName;
  updateCharts();
};

onMounted(() => {
  setActiveButton(substances[0]);
});
</script>

<style scoped>
.risk-level-container {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  border-radius: 15px;
  padding: 2rem;
  color: #fff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.main-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.content-wrapper {
  display: flex;
  gap: 2rem;
}

.buttons-section {
  flex: 1;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.substance-btn {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
  color: #2B656F;
  cursor: pointer;
  transition: all 0.3s ease;
}

.substance-btn:hover, .substance-btn.active {
  background: #2B656F;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e6f3f5;
}

.charts-section {
  flex: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-card {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 10px;
  padding: 1rem;
  flex: 1 1 calc(50% - 0.5rem);
  min-width: 250px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.chart-card.full-width {
  flex-basis: 100%;
}

.chart-title {
  color: #2B656F;
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 1rem;
}

canvas {
  width: 100% !important;
  height: 200px !important;
}

@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .chart-card {
    flex-basis: 100%;
  }
}
</style>