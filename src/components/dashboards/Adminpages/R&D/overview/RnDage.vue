<template>
  <div class="age-gender-distribution">
    <h3 class="mb-4">Age and Gender Distribution</h3>
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

const processData = (data) => {
  const ageGroups = {
    '0-14': { male: 0, female: 0, other: 0 },
    '15-24': { male: 0, female: 0, other: 0 },
    '25-34': { male: 0, female: 0, other: 0 },
    '35-44': { male: 0, female: 0, other: 0 },
    '45-54': { male: 0, female: 0, other: 0 },
    '55-64': { male: 0, female: 0, other: 0 },
    '65+': { male: 0, female: 0, other: 0 }
  };

  data.forEach(item => {
    const userFields = item.user?.fields;
    if (userFields) {
      const birthDate = new Date(userFields.date_of_birth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      const gender = userFields.gender.toLowerCase();

      let ageGroup;
      if (age <= 14) ageGroup = '0-14';
      else if (age <= 24) ageGroup = '15-24';
      else if (age <= 34) ageGroup = '25-34';
      else if (age <= 44) ageGroup = '35-44';
      else if (age <= 54) ageGroup = '45-54';
      else if (age <= 64) ageGroup = '55-64';
      else ageGroup = '65+';

      if (gender === 'male') ageGroups[ageGroup].male++;
      else if (gender === 'female') ageGroups[ageGroup].female++;
      else ageGroups[ageGroup].other++;
    }
  });

  return ageGroups;
};

const createChart = (ageGroups) => {
  const ctx = chart.value.getContext('2d');
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }
  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(ageGroups),
      datasets: [
        {
          label: 'Male',
          data: Object.values(ageGroups).map(group => group.male),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
        },
        {
          label: 'Female',
          data: Object.values(ageGroups).map(group => group.female),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
        },
        {
          label: 'Other',
          data: Object.values(ageGroups).map(group => group.other),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          beginAtZero: true
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Age and Gender Distribution'
        },
        legend: {
          position: 'top',
        }
      }
    }
  });
};

watch(() => props.data, (newData) => {
  const ageGroups = processData(newData);
  createChart(ageGroups);
}, { deep: true });

onMounted(() => {
  const ageGroups = processData(props.data);
  createChart(ageGroups);
});
</script>

<style scoped>
.age-gender-distribution {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-container {
  height: 400px;
}
</style>