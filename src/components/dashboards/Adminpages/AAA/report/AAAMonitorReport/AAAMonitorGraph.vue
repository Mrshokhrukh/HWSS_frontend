<template>
  <div class="chart-container">
    <div v-if="isDataAvailable">
      <apexchart ref="chart" :options="chartOptions" :series="series" height="500" />
      <p class="total-individuals">Total number of individuals: {{ totalIndividuals }}</p>
    </div>
    <div v-else class="loading-message">
      Loading data...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import ApexCharts from 'apexcharts';

const props = defineProps({
  chartOptions: {
    type: Array,
    required: true
  },
  filteredData: {
    type: Array,
    required: true
  }
});

const chart = ref(null);

// Function to generate lighter and darker shades
function generateShades(hexColor) {
  let r = parseInt(hexColor.slice(1, 3), 16);
  let g = parseInt(hexColor.slice(3, 5), 16);
  let b = parseInt(hexColor.slice(5, 7), 16);

  const lighter = `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`;
  const darker = `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`;

  return [lighter, hexColor, darker];
}

const colorPalette = generateShades('#8AC2AF');

// Process data for the selected option
const processChartData = computed(() => {
  if (!props.filteredData || !props.chartOptions?.[0]) return {};

  const selectedOption = props.chartOptions[0];
  const result = {
    [selectedOption]: {
      male: {},
      female: {},
      other: {}
    }
  };

  props.filteredData.forEach((item) => {
    let value;
    if (selectedOption === 'rescreened') {
      value = item.rescreened ? 'Yes' : 'No';
    } else {
      value = item.service_and_treatment?.[selectedOption] || 'NA';
    }

    const gender = item.user?.fields?.gender?.toLowerCase() || 'unknown';
    if (gender === 'male' || gender === 'female' || gender === 'other') {
      result[selectedOption][gender][value] = (result[selectedOption][gender][value] || 0) + 1;
    }
  });

  return result;
});

const isDataAvailable = computed(() => {
  return props.filteredData &&
    props.filteredData.length > 0 &&
    props.chartOptions &&
    props.chartOptions.length > 0;
});

const series = computed(() => {
  if (!isDataAvailable.value) return [];

  const option = props.chartOptions[0];
  const data = processChartData.value[option];

  if (!data) return [];

  const categories = [...new Set([
    ...Object.keys(data.male || {}),
    ...Object.keys(data.female || {}),
    ...Object.keys(data.other || {})
  ])];

  return [
    {
      name: 'Male',
      data: categories.map(category => (data.male && data.male[category]) || 0)
    },
    {
      name: 'Female',
      data: categories.map(category => (data.female && data.female[category]) || 0)
    },
    {
      name: 'Other',
      data: categories.map(category => (data.other && data.other[category]) || 0)
    }
  ];
});

const totalIndividuals = computed(() => {
  if (!isDataAvailable.value) return 0;

  const option = props.chartOptions[0];
  const data = processChartData.value[option];

  if (!data) return 0;

  return Object.values(data.male || {}).reduce((sum, count) => sum + count, 0) +
    Object.values(data.female || {}).reduce((sum, count) => sum + count, 0) +
    Object.values(data.other || {}).reduce((sum, count) => sum + count, 0);
});

const chartOptions = computed(() => {
  if (!isDataAvailable.value) return {};

  const option = props.chartOptions[0];
  const data = processChartData.value[option];

  if (!data) return {};

  const categories = [...new Set([
    ...Object.keys(data.male || {}),
    ...Object.keys(data.female || {}),
    ...Object.keys(data.other || {})
  ])];

  return {
    chart: {
      type: 'bar',
      height: 500,
      stacked: true,
      borderRadius: 10,
      toolbar: {
        show: false
      }
    },
    xaxis: {
      categories: categories,
      labels: {
        rotate: -45,
        rotateAlways: true
      }
    },
    yaxis: {
      min: 0,
      tickAmount: 5,
      title: {
        text: 'Number of Individuals'
      }
    },
    title: {
      text: `${option} Distribution by Sex`,
      align: 'center'
    },
    legend: {
      position: 'top'
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
        borderRadius: 6,
        borderRadiusApplication: 'end'
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontWeight: 'bold'
      }
    },
    stroke: {
      show: true,
      width: 1,
      colors: ['transparent']
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " individuals"
        }
      }
    },
    colors: colorPalette
  };
});

watch([() => props.filteredData, () => props.chartOptions], () => {
  if (chart.value && isDataAvailable.value) {
    chart.value.updateOptions(chartOptions.value);
    chart.value.updateSeries(series.value);
  }
}, { deep: true });

onMounted(() => {
  if (isDataAvailable.value) {
    console.log('Chart data is available on mount');
  } else {
    console.log('Chart data is not available on mount');
  }
});
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 550px;
  width: 100%;
}

.total-individuals {
  text-align: center;
  font-weight: bold;
  margin-top: 10px;
}

.loading-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  color: #666;
}
</style>