<template>
  <div class="risk-factor-correlation">
    <h3 class="mb-4">Risk Factor Correlation</h3>
    <div class="chart-container">
      <canvas ref="chart"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
});

const chart = ref(null);
const chartInstance = ref(null);

const riskFactors = [
  'phq_score', 'gad_score', 'ace_score', 'alcoholic_measurement',
  'tobacco_measurement', 'cannabis_measurement', 'cocaine_measurement',
  'amphetamine_measurement', 'inhalants_measurement', 'sedatives_measurement',
  'hallucinogens_measurement', 'opioids_measurement'
];

const processData = (data) => {
  const processedData = data.map(item => {
    const result = {};
    riskFactors.forEach(factor => {
      result[factor] = item.rescreening_data?.[factor] || 
                       item.measurement?.fields?.[factor] || 
                       item.measurement_assist?.fields?.[factor] || 
                       0;
      // Convert string measurements to numeric values
      if (typeof result[factor] === 'string') {
        switch(result[factor].toLowerCase()) {
          case 'no risk': result[factor] = 0; break;
          case 'low risk': result[factor] = 1; break;
          case 'moderate risk': result[factor] = 2; break;
          case 'high risk': result[factor] = 3; break;
          default: result[factor] = 0;
        }
      }
    });
    return result;
  });

  const correlation = {};
  riskFactors.forEach(factor1 => {
    correlation[factor1] = {};
    riskFactors.forEach(factor2 => {
      const values1 = processedData.map(d => d[factor1]);
      const values2 = processedData.map(d => d[factor2]);
      correlation[factor1][factor2] = pearsonCorrelation(values1, values2);
    });
  });

  return correlation;
};

const pearsonCorrelation = (x, y) => {
  const n = x.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return denominator === 0 ? 0 : numerator / denominator;
};

const createChart = (correlation) => {
  const ctx = chart.value.getContext('2d');
  
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  const data = [];
  riskFactors.forEach((factor1, i) => {
    riskFactors.forEach((factor2, j) => {
      data.push({
        x: i,
        y: j,
        r: Math.abs(correlation[factor1][factor2]) * 20, // Size based on correlation strength
        correlation: correlation[factor1][factor2]
      });
    });
  });

  chartInstance.value = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        data: data,
        backgroundColor: (context) => {
          const value = context.raw.correlation;
          return value > 0 
            ? `rgba(255, 99, 132, ${Math.abs(value)})`  // red for positive correlation
            : `rgba(54, 162, 235, ${Math.abs(value)})`; // blue for negative correlation
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          min: -0.5,
          max: riskFactors.length - 0.5,
          ticks: {
            callback: (value) => riskFactors[value],
            autoSkip: false,
            maxRotation: 90,
            minRotation: 90
          }
        },
        y: {
          type: 'linear',
          min: -0.5,
          max: riskFactors.length - 0.5,
          ticks: {
            callback: (value) => riskFactors[value],
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            title: (context) => {
              const x = riskFactors[Math.round(context[0].parsed.x)];
              const y = riskFactors[Math.round(context[0].parsed.y)];
              return `${x} vs ${y}`;
            },
            label: (context) => {
              return `Correlation: ${context.raw.correlation.toFixed(2)}`;
            }
          }
        }
      }
    }
  });
};

watch(() => props.data, (newData) => {
  const correlation = processData(newData);
  createChart(correlation);
}, { deep: true });

onMounted(() => {
  const correlation = processData(props.data);
  createChart(correlation);
});
</script>

<style scoped>
.risk-factor-correlation {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-container {
  height: 600px;
  width: 100%;
}
</style>