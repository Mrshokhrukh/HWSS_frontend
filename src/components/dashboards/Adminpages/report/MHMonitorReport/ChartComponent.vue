<template>
    <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

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

const chartCanvas = ref(null)
let chart = null

const generateChart = () => {
    if (chart) {
        chart.destroy()
    }

    const ctx = chartCanvas.value.getContext('2d')

    const datasets = props.chartOptions.filter(option => option !== 'all').map((option) => {
        const data = props.chartData[option]
        return {
            label: option,
            data: Object.values(data),
            backgroundColor: getRandomColor()
        }
    })

    const labels = [...new Set(props.chartOptions.filter(option => option !== 'all').flatMap((option) => Object.keys(props.chartData[option])))]

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    stepSize: 1
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Data Visualization'
                }
            }
        }
    })
}

function getRandomColor() {
    const r = Math.floor(Math.random() * 255)
    const g = Math.floor(Math.random() * 255)
    const b = Math.floor(Math.random() * 255)
    return `rgba(${r}, ${g}, ${b}, 0.7)`
}

onMounted(() => {
    generateChart()
})

watch([() => props.chartData, () => props.chartOptions], () => {
    generateChart()
}, { deep: true })
</script>

<style scoped>
.chart-container {
    position: relative;
    height: 500px;
    width: 100%;
}
</style>