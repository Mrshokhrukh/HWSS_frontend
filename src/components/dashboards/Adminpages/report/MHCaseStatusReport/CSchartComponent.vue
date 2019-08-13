<template>
    <div class="chart-container">
        <apexchart type="bar" height="100%" :options="chartOptions" :series="series"></apexchart>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

const props = defineProps({
    chartData: {
        type: Object,
        required: true
    },
    chartOptions: {
        type: Array,
        required: true
    }
});

const series = computed(() => {
    return props.chartOptions.map(option => ({
        name: option,
        data: Object.values(props.chartData[option] || {})
    }));
});

const labels = computed(() => {
    return props.chartOptions.flatMap(option => Object.keys(props.chartData[option] || {}));
});

// Function to generate shades of #64AC99
const generateShades = (baseColor, count) => {
    const shades = [];
    for (let i = 0; i < count; i++) {
        const shade = i * 20; // Adjust this value to change the difference between shades
        shades.push(lightenDarkenColor(baseColor, shade));
    }
    return shades;
};

// Function to lighten or darken a color
const lightenDarkenColor = (color, amount) => {
    let usePound = false;
    if (color[0] === "#") {
        color = color.slice(1);
        usePound = true;
    }
    const num = parseInt(color, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
};

const chartOptions = ref({
    chart: {
        type: 'bar',
        height: '100%',
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
            },
            export: {
                csv: {
                    filename: 'Case Status Chart',
                    columnDelimiter: ',',
                    headerCategory: 'Category',
                    headerValue: 'Value',
                },
                svg: {
                    filename: 'Case Status Chart',
                },
                png: {
                    filename: 'Case Status Chart',
                }
            },
        }
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded',
            distributed: true
        },
    },
    colors: generateShades('#64AC99', props.chartOptions.length),
    dataLabels: {
        enabled: true,
        formatter: function (val) {
            return val
        },
        offsetY: -20,
        style: {
            fontSize: '12px',
            colors: ["#304758"]
        }
    },
    stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
    },
    xaxis: {
        categories: labels,
    },
    yaxis: {
        title: {
            text: 'Count'
        }
    },
    fill: {
        opacity: 1
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return val + " cases"
            }
        }
    },
    title: {
        text: 'Case Status Chart',
        align: 'center'
    },
    legend: {
        show: false
    }
});

watch(() => props.chartData, () => {
    // Update the series data when chartData changes
    chartOptions.value = {
        ...chartOptions.value,
        xaxis: {
            ...chartOptions.value.xaxis,
            categories: labels.value
        },
        colors: generateShades('#64AC99', props.chartOptions.length)
    };
}, { deep: true });
</script>

<style scoped>
.chart-container {
    position: relative;
    height: 60vh;
    width: 100%;
    max-height: 500px;
}
</style>