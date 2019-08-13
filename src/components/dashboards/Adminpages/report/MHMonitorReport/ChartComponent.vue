<template>
    <div class="chart-container">
        <apexchart ref="chart" :options="chartOptions" :series="series" height="500" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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

const series = computed(() => {
    return props.chartOptions.filter(option => option !== 'all').map(option => ({
        name: option,
        data: Object.values(props.chartData[option])
    }))
})

const labels = computed(() => [
    ...new Set(
        props.chartOptions
            .filter(option => option !== 'all')
            .flatMap(option => Object.keys(props.chartData[option]))
    )
])

const chartOptions = computed(() => ({
    chart: {
        type: 'bar',
        height: 500
    },
    xaxis: {
        categories: labels.value
    },
    yaxis: {
        min: 0,
        tickAmount: 5
    },
    title: {
        text: 'Data Visualization',
        align: 'center'
    },
    legend: {
        position: 'top'
    },
    colors: generateRandomColors(props.chartOptions.length - 1)
}))

function generateRandomColors(count) {
    return Array.from({ length: count }, () => {
        const r = Math.floor(Math.random() * 255)
        const g = Math.floor(Math.random() * 255)
        const b = Math.floor(Math.random() * 255)
        return `rgb(${r}, ${g}, ${b})`
    })
}

function downloadChart() {
    if (chart.value) {
        ApexCharts.exec(chart.value.chart.id, 'dataURI').then(({ imgURI }) => {
            const downloadLink = document.createElement('a')
            downloadLink.href = imgURI
            downloadLink.download = 'chart.png'
            downloadLink.click()
        })
    }
}

watch([() => props.chartData, () => props.chartOptions], () => {
    if (chart.value) {
        chart.value.updateOptions(chartOptions.value)
        chart.value.updateSeries(series.value)
    }
}, { deep: true })
</script>

<style scoped>
.chart-container {
    position: relative;
    height: 550px;
    width: 100%;
}
</style>