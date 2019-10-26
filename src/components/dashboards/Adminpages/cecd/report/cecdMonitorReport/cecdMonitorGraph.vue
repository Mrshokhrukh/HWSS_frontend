<template>
  <div class="chart-container">
    <div v-if="isDataAvailable">
      <apexchart ref="chart" :options="chartOptions" :series="series" height="500" />
      <p class="total-individuals">Total number of individuals: {{ totalIndividuals }}</p>
    </div>
    <div v-else class="loading-message">
      No data available to display. Please check your filters.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import ApexCharts from 'apexcharts'

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  chartOptions: {
    type: Array,
    required: true
  }
})

const chart = ref(null)

// Function to generate lighter and darker shades
function generateShades(hexColor) {
  // Convert hex to RGB
  let r = parseInt(hexColor.slice(1, 3), 16);
  let g = parseInt(hexColor.slice(3, 5), 16);
  let b = parseInt(hexColor.slice(5, 7), 16);

  // Generate lighter shade
  const lighter = `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`;

  // Generate darker shade
  const darker = `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`;

  return [lighter, hexColor, darker];
}

const colorPalette = generateShades('#8AC2AF');

// Helper function to normalize gender
const normalizeGender = (gender) => {
  if (!gender) return 'other';
  const g = gender.toLowerCase();
  if (g === 'm' || g === 'male') return 'male';
  if (g === 'f' || g === 'female') return 'female';
  return 'other';
};

const isDataAvailable = computed(() => {
  return props.chartData &&
    Object.keys(props.chartData).length > 0 &&
    props.chartOptions &&
    props.chartOptions.length > 0;
})

const series = computed(() => {
  if (!isDataAvailable.value) return [];

  const option = props.chartOptions[0];
  const data = props.chartData[option];

  if (!data) return [];

  // Get all possible categories across all genders
  const categories = [...new Set([
    ...Object.keys(data.male || {}),
    ...Object.keys(data.female || {}),
    ...Object.keys(data.other || {})
  ])].filter(category => category !== 'undefined' && category !== null);

  // Create series data
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
  ].filter(series => series.data.some(value => value > 0)); // Only include series with data
})

const totalIndividuals = computed(() => {
  if (!isDataAvailable.value) return 0;

  const option = props.chartOptions[0];
  const data = props.chartData[option];

  if (!data) return 0;

  return Object.values(data.male || {}).reduce((sum, count) => sum + count, 0) +
    Object.values(data.female || {}).reduce((sum, count) => sum + count, 0) +
    Object.values(data.other || {}).reduce((sum, count) => sum + count, 0);
})

const chartOptions = computed(() => {
  if (!isDataAvailable.value) return {};

  const option = props.chartOptions[0];
  const data = props.chartData[option];

  if (!data) return {};

  const categories = [...new Set([
    ...Object.keys(data.male || {}),
    ...Object.keys(data.female || {}),
    ...Object.keys(data.other || {})
  ])].filter(category => category !== 'undefined' && category !== null);

  // Capitalize and format category names
  const formattedCategories = categories.map(category => {
    if (typeof category !== 'string') return 'Unknown';
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  });

  return {
    chart: {
      type: 'bar',
      height: 500,
      stacked: true,
      borderRadius: 10,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      }
    },
    xaxis: {
      categories: formattedCategories,
      labels: {
        rotate: -45,
        rotateAlways: true,
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    },
    yaxis: {
      min: 0,
      tickAmount: 5,
      title: {
        text: 'Number of Individuals',
        style: {
          fontSize: '14px',
          fontWeight: 500
        }
      }
    },
    title: {
      text: `${option.charAt(0).toUpperCase() + option.slice(1)} Distribution by Gender`,
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 600
      }
    },
    legend: {
      position: 'top',
      fontSize: '14px'
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
        fontWeight: 'bold',
        colors: ['#fff']
      },
      formatter: function (val) {
        return val || '';  // Don't show label if value is 0
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
    colors: colorPalette,
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom',
          offsetY: 0
        }
      }
    }]
  }
})

watch([() => props.chartData, () => props.chartOptions], () => {
  if (chart.value && isDataAvailable.value) {
    chart.value.updateOptions(chartOptions.value)
    chart.value.updateSeries(series.value)
  }
}, { deep: true })

// Debug logging
watch(() => props.chartData, (newData) => {
  console.log('Chart Data Updated:', newData);
  console.log('Series Generated:', series.value);
}, { deep: true });

</script>

<style scoped>
.chart-container {
  position: relative;
  height: 550px;
  width: 100%;
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.total-individuals {
  text-align: center;
  font-weight: bold;
  margin-top: 1rem;
  color: #2C6975;
  font-size: 1.1rem;
}

.loading-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.1rem;
  color: #666;
}
</style>