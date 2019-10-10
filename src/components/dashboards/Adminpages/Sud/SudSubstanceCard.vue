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

const reportData = JSON.parse(sessionStorage.getItem('reportData')) || [];
const riskCounts = ref(Array(substances.length).fill({ low: 0, moderate: 0, high: 0 }));
function extractMeasurementData(reportData) {
  const results = [];

  reportData.forEach(person => {
    const measurementAssist = person.measurement_assist?.fields; // Safe navigation to avoid null/undefined errors
    const gender = person.user?.fields?.gender || "unknown";
    if (measurementAssist) {
      const data = {
        gender: gender,
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
      };

      results.push(data);
    }
  });

  return results;
}
const extractedData = extractMeasurementData(reportData);

// Function to count risk levels for each substance
function countRiskLevels(data) {
  const counts = {
    tobacco_moderate_male: 0, tobacco_moderate_female: 0,
    tobacco_high_male: 0, tobacco_high_female: 0,

    alcoholic_moderate_male: 0, alcoholic_moderate_female: 0,
    alcoholic_high_male: 0, alcoholic_high_female: 0,

    cannabis_moderate_male: 0, cannabis_moderate_female: 0,
    cannabis_high_male: 0, cannabis_high_female: 0,

    cocaine_moderate_male: 0, cocaine_moderate_female: 0,
    cocaine_high_male: 0, cocaine_high_female: 0,

    amphetamine_moderate_male: 0, amphetamine_moderate_female: 0,
    amphetamine_high_male: 0, amphetamine_high_female: 0,

    inhalant_moderate_male: 0, inhalant_moderate_female: 0,
    inhalant_high_male: 0, inhalant_high_female: 0,

    sedative_moderate_male: 0, sedative_moderate_female: 0,
    sedative_high_male: 0, sedative_high_female: 0,

    hallucinate_moderate_male: 0, hallucinate_moderate_female: 0,
    hallucinate_high_male: 0, hallucinate_high_female: 0,

    opioids_moderate_male: 0, opioids_moderate_female: 0,
    opioids_high_male: 0, opioids_high_female: 0,

    others_moderate_male: 0, others_moderate_female: 0,
    others_high_male: 0, others_high_female: 0,
  };

  // Iterate over each object in the array
  data.forEach(personData => {
    // Iterate over each key (substance) in the object
    Object.keys(personData).forEach(substance => {
      const riskLevel = personData[substance]; // Get the risk level for the current substance
      const substanceKey = substance.toLowerCase().replace('-', '_'); // Convert substance name to lower case and replace '-' with '_'

      // Determine gender-specific keys based on risk level and substance
      if (riskLevel === 'moderate risk' || riskLevel === 'high risk') {
        const genderKeyModerate = `${substanceKey}_moderate`;
        const genderKeyHigh = `${substanceKey}_high`;

        // Increment the appropriate counter based on the risk level and gender
        if (personData.gender === 'Male') {
          if (riskLevel === 'moderate risk') counts[`${genderKeyModerate}_male`]++;
          if (riskLevel === 'high risk') counts[`${genderKeyHigh}_male`]++;
        } else if (personData.gender === 'Female') {
          if (riskLevel === 'moderate risk') counts[`${genderKeyModerate}_female`]++;
          if (riskLevel === 'high risk') counts[`${genderKeyHigh}_female`]++;
        }
      }
    });
  });

  return counts;
}
const counts = countRiskLevels(extractedData);
const mapCountsToDummyData = (counts) => {
  return {
    Tobacco: {
      'High-risk total male': counts.tobacco_high_male || 0,
      'High-risk total female': counts.tobacco_high_female || 0,
      'Moderate-risk total male': counts.tobacco_moderate_male || 0,
      'Moderate-risk total female': counts.tobacco_moderate_female || 0,
    },
    Alcohol: {
      'High-risk total male': counts.alcoholic_high_male || 0,
      'High-risk total female': counts.alcoholic_high_female || 0,
      'Moderate-risk total male': counts.alcoholic_moderate_male || 0,
      'Moderate-risk total female': counts.alcoholic_moderate_female || 0,
    },
    Cannabis: {
      'High-risk total male': counts.cannabis_high_male || 0,
      'High-risk total female': counts.cannabis_high_female || 0,
      'Moderate-risk total male': counts.cannabis_moderate_male || 0,
      'Moderate-risk total female': counts.cannabis_moderate_female || 0,
    },
    Cocaine: {
      'High-risk total male': counts.cocaine_high_male || 0,
      'High-risk total female': counts.cocaine_high_female || 0,
      'Moderate-risk total male': counts.cocaine_moderate_male || 0,
      'Moderate-risk total female': counts.cocaine_moderate_female || 0,
    },
    'Amphetamine-type': {
      'High-risk total male': counts.amphetamine_high_male || 0,
      'High-risk total female': counts.amphetamine_high_female || 0,
      'Moderate-risk total male': counts.amphetamine_moderate_male || 0,
      'Moderate-risk total female': counts.amphetamine_moderate_female || 0,
    },
    Inhalant: {
      'High-risk total male': counts.inhalant_high_male || 0,
      'High-risk total female': counts.inhalant_high_female || 0,
      'Moderate-risk total male': counts.inhalant_moderate_male || 0,
      'Moderate-risk total female': counts.inhalant_moderate_female || 0,
    },
    Sedative: {
      'High-risk total male': counts.sedative_high_male || 0,
      'High-risk total female': counts.sedative_high_female || 0,
      'Moderate-risk total male': counts.sedative_moderate_male || 0,
      'Moderate-risk total female': counts.sedative_moderate_female || 0,
    },
    Hallucinate: {
      'High-risk total male': counts.hallucinate_high_male || 0,
      'High-risk total female': counts.hallucinate_high_female || 0,
      'Moderate-risk total male': counts.hallucinate_moderate_male || 0,
      'Moderate-risk total female': counts.hallucinate_moderate_female || 0,
    },
    Opioids: {
      'High-risk total male': counts.opioids_high_male || 0,
      'High-risk total female': counts.opioids_high_female || 0,
      'Moderate-risk total male': counts.opioids_moderate_male || 0,
      'Moderate-risk total female': counts.opioids_moderate_female || 0,
    },
    Others: {
      'High-risk total male': counts.others_high_male || 0,
      'High-risk total female': counts.others_high_female || 0,
      'Moderate-risk total male': counts.others_moderate_male || 0,
      'Moderate-risk total female': counts.others_moderate_female || 0,
    },
  };
};

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

const renderDonutChart = (canvasId, data) => {
  if (canvasId === 'donutChartTotal' && donutChartTotalInstance) {
    donutChartTotalInstance.destroy();
  }
  if (canvasId === 'donutChartModerate' && donutChartModerateInstance) {
    donutChartModerateInstance.destroy();
  }
  const ctx = document.getElementById(canvasId).getContext('2d');
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      ...data,
      datasets: [{
        ...data.datasets[0],
        backgroundColor: ['#2B656F', '#1D4851'],
        hoverBackgroundColor: ['#3a8a9e', '#2a6470']
      }]
    },
    options: chartOptions
  });
};

const renderBarChart = (data) => {
  if (barChartInstance) {
    barChartInstance.destroy();
  }
  const ctx = document.getElementById('barChart').getContext('2d');
  return new Chart(ctx, {
    type: 'bar',
    data: {
      ...data,
      datasets: [
        {
          ...data.datasets[0],
          backgroundColor: '#2B656F'
        },
        {
          ...data.datasets[1],
          backgroundColor: '#1D4851'
        }
      ]
    },
    options: {
      ...chartOptions,
      scales: {
        x: { stacked: true },
        y: { stacked: true }
      }
    }
  });
};

const setActiveButton = (buttonName) => {
  activeButton.value = buttonName;
  updateCharts();
};

const updateCharts = () => {
  const data = dummyData[activeButton.value];
  if (!data) return; // Return if data is not available for the selected button

  const donutDataTotal = {
    labels: ['Male', 'Female'],
    datasets: [{
      data: [data['High-risk total male'], data['High-risk total female']],
      backgroundColor: ['#2c6975', '#00000'],
      hoverBackgroundColor: ['#2c6975', '#00000'],
    }],
  };
  const donutDataModerate = {
    labels: ['Male', 'Female'],
    datasets: [{
      data: [data['Moderate-risk total male'], data['Moderate-risk total female']],
      backgroundColor: ['#2c6975', '#00000'],
      hoverBackgroundColor: ['#2c6975', '#00000'],
    }],
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
    }],
  };

  donutChartTotalInstance = renderDonutChart('donutChartTotal', donutDataTotal);
  donutChartModerateInstance = renderDonutChart('donutChartModerate', donutDataModerate);
  barChartInstance = renderBarChart(barData);
};
onMounted(() => {
  setActiveButton(substances[0]); // Set first substance as active by default
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
  border:1px solid #e6f3f5
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