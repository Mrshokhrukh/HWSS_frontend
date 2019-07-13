<template>
  <div class="comorbidity-analysis">
    <h3 class="mb-4">Comorbidity Analysis</h3>
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

const conditions = [
  'depression', 'anxiety', 'substance_use', 'ptsd', 'eating_disorder'
];

const processData = (data) => {
  const comorbidities = {};
  let maxCount = 0;

  conditions.forEach((condition1, i) => {
    conditions.forEach((condition2, j) => {
      if (i < j) {
        const count = data.filter(item => 
          item[condition1] && item[condition2]
        ).length;
        
        if (count > 0) {
          comorbidities[`${condition1}-${condition2}`] = {
            x: i,
            y: j,
            r: count,
            count: count
          };
          maxCount = Math.max(maxCount, count);
        }
      }
    });
  });

  // Normalize the radius
  Object.values(comorbidities).forEach(item => {
    item.r = (item.count / maxCount) * 50; // Adjust 50 to change the maximum bubble size
  });

  return Object.values(comorbidities);
};

const createChart = (comorbidityData) => {
  const ctx = chart.value.getContext('2d');
  
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  chartInstance.value = new Chart(ctx, {
    type: 'bubble',
    data: {
      datasets: [{
        data: comorbidityData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
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
          max: conditions.length - 0.5,
          ticks: {
            callback: (value) => conditions[value],
            autoSkip: false,
            maxRotation: 90,
            minRotation: 90
          }
        },
        y: {
          type: 'linear',
          min: -0.5,
          max: conditions.length - 0.5,
          ticks: {
            callback: (value) => conditions[value],
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
              const x = conditions[Math.round(context[0].parsed.x)];
              const y = conditions[Math.round(context[0].parsed.y)];
              return `${x} and ${y}`;
            },
            label: (context) => {
              return `Comorbidity count: ${context.raw.count}`;
            }
          }
        }
      }
    }
  });
};

watch(() => props.data, (newData) => {
  const comorbidityData = processData(newData);
  createChart(comorbidityData);
}, { deep: true });

onMounted(() => {
  const comorbidityData = processData(props.data);
  createChart(comorbidityData);
});
</script>

<style scoped>
.comorbidity-analysis {
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