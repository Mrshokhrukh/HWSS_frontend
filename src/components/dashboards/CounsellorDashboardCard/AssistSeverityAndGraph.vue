// src/components/ChartComponent.vue

<template>
  <div>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Chart } from 'chart.js/auto';

// Reference to the chart element
const chartRef = ref(null);

// Retrieve and parse report data from session storage
const reportData = JSON.parse(sessionStorage.getItem('reportData'));

// Function to extract measurement data
const extractMeasurementData = (data) => {
  return data.flatMap(entry => {
    return JSON.parse(entry.measurement_assist).map(measurement => measurement.fields);
  });
};

// Extracted measurement data
const measurementData = extractMeasurementData(reportData);

// Function to count occurrences of each measurement
const countMeasurements = (data, key) => {
  return data.reduce((acc, entry) => {
    const value = entry[key];
    if (value) {
      acc[value] = (acc[value] || 0) + 1;
    }
    return acc;
  }, {});
};

// List of measurement keys to extract
const measurementKeys = [
  'alcoholic_measurement',
  'tobacco_measurement',
  'cannabis_measurement',
  'cocaine_measurement',
  'amphetamine_measurement',
  'inhalants_measurement',
  'sedatives_measurement',
  'hallucinogens_measurement',
  'opioids_measurement',
  'injection_measurement',
  'other_measurement'
];

// Count occurrences for each measurement
const aggregatedData = measurementKeys.map(key => {
  return {
    label: key.replace('_measurement', '').replace('_', ' ').toUpperCase(),
    data: countMeasurements(measurementData, key)
  };
});

// Prepare labels and datasets for Chart.js
const labels = Array.from(new Set(measurementData.map(data => new Date(data.created_at).toLocaleDateString())));
const datasets = aggregatedData.map(substance => ({
  label: substance.label,
  data: labels.map(label => substance.data[label] || 0),
  borderColor: getRandomColor(),
  borderWidth: 1,
}));

// Function to generate random colors for the chart lines
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Initialize the chart on component mount
onMounted(() => {
  const ctx = chartRef.value.getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
          },
        },
      },
    },
  });
});

console.log('Report Data:', reportData);
console.log('Extracted Measurement Data:', measurementData);
console.log('Aggregated Data:', aggregatedData);
console.log('Labels:', labels);
console.log('Datasets:', datasets);

</script>

<style scoped>
canvas {
  width: 100%;
  height: 400px;
}
</style>
