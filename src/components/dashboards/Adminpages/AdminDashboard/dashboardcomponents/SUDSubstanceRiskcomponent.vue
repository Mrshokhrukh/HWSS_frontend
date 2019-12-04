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
                    <div class="chart-container">
                        <canvas id="donutChartTotal"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <h4 class="chart-title">Moderate Risk Count by Gender</h4>
                    <div class="chart-container">
                        <canvas id="donutChartModerate"></canvas>
                    </div>
                </div>
                <div class="chart-card full-width">
                    <h4 class="chart-title">Risk Comparison</h4>
                    <div class="chart-container">
                        <canvas id="barChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, inject, watch } from 'vue';
import Chart from 'chart.js/auto';

const serviceAndTreatmentData = inject('serviceAndTreatmentData', []);
const activeButton = ref(null);

// Chart instances
let donutChartTotalInstance = null;
let donutChartModerateInstance = null;
let barChartInstance = null;

// Theme colors
const chartTheme = {
    male: '#2c6975',      // Teal for male data
    female: '#000000',    // Black for female data
    noData: '#e6e6e6',    // Light gray for no data
    background: '#ffffff', // White background
    text: '#2B656F'       // Teal text color
};

const substances = [
    'Tobacco', 'Alcohol', 'Cannabis', 'Cocaine', 'Amphetamine-type',
    'Inhalant', 'Sedative', 'Hallucinate', 'Opioids', 'Others'
];

const substanceKeyMapping = {
    'Tobacco': 'tobacco',
    'Alcohol': 'alcoholic',
    'Cannabis': 'cannabis',
    'Cocaine': 'cocaine',
    'Amphetamine-type': 'amphetamine',
    'Inhalant': 'inhalants',
    'Sedative': 'sedatives',
    'Hallucinate': 'hallucinogens',
    'Opioids': 'opioids',
    'Others': 'other'
};

function extractMeasurementData(data) {
    if (!data) return [];

    return data.reduce((results, item) => {
        if (item.screening_data?.assist_data) {
            const assistData = Array.isArray(item.screening_data.assist_data) ?
                item.screening_data.assist_data :
                [item.screening_data.assist_data];

            const processedData = {
                gender: item.user?.gender || "unknown",
            };

            assistData.forEach(assist => {
                if (assist.substance__name) {
                    const substance = assist.substance__name.toLowerCase();
                    const riskLevel = assist.risk_flag || "no data";

                    Object.entries(substanceKeyMapping).forEach(([key, value]) => {
                        if (substance.includes(value.toLowerCase())) {
                            processedData[value] = riskLevel;
                        }
                    });
                }
            });

            results.push(processedData);
        }
        return results;
    }, []);
}

function countRiskLevels(data) {
    const initialCounts = {};

    Object.values(substanceKeyMapping).forEach(substance => {
        initialCounts[`${substance}_moderate_male`] = 0;
        initialCounts[`${substance}_moderate_female`] = 0;
        initialCounts[`${substance}_high_male`] = 0;
        initialCounts[`${substance}_high_female`] = 0;
    });

    return data.reduce((counts, personData) => {
        Object.entries(substanceKeyMapping).forEach(([_, substanceKey]) => {
            const riskLevel = personData[substanceKey]?.toLowerCase();
            const gender = personData.gender.toLowerCase();

            if (riskLevel?.includes('moderate')) {
                counts[`${substanceKey}_moderate_${gender}`]++;
            } else if (riskLevel?.includes('severe')) {
                counts[`${substanceKey}_high_${gender}`]++;
            }
        });
        return counts;
    }, initialCounts);
}

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: chartTheme.text,
                font: {
                    size: 12,
                    family: "'Arial', sans-serif",
                    weight: '600'
                },
                padding: 20
            }
        },
        tooltip: {
            backgroundColor: '#2B656F',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            displayColors: true
        }
    }
};

function renderChart(type, canvasId, data, options) {
    const existingChart = type === 'donut' ?
        (canvasId === 'donutChartTotal' ? donutChartTotalInstance : donutChartModerateInstance) :
        barChartInstance;

    if (existingChart) {
        existingChart.destroy();
    }

    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return null;

    const enhancedOptions = {
        ...options,
        animation: {
            duration: 750,
            easing: 'easeInOutQuart'
        }
    };

    const chart = new Chart(ctx, {
        type: type === 'donut' ? 'doughnut' : 'bar',
        data,
        options: enhancedOptions
    });

    if ((type === 'donut' && data.datasets[0].data.length === 1 && data.datasets[0].data[0] === 1) ||
        (type === 'bar' && !data.datasets.some(dataset => dataset.data.some(value => value > 0)))) {
        const chartArea = chart.chartArea;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('No data available',
            (chartArea.left + chartArea.right) / 2,
            (chartArea.top + chartArea.bottom) / 2);
        ctx.restore();
    }

    return chart;
}

function updateCharts() {
    const extractedData = extractMeasurementData(serviceAndTreatmentData.value);
    const counts = countRiskLevels(extractedData);
    const substanceKey = substanceKeyMapping[activeButton.value];

    if (!substanceKey) return;

    const data = {
        'High-risk total male': counts[`${substanceKey}_high_male`],
        'High-risk total female': counts[`${substanceKey}_high_female`],
        'Moderate-risk total male': counts[`${substanceKey}_moderate_male`],
        'Moderate-risk total female': counts[`${substanceKey}_moderate_female`],
    };

    const totalHighRisk = data['High-risk total male'] + data['High-risk total female'];
    const totalModerateRisk = data['Moderate-risk total male'] + data['Moderate-risk total female'];

    const donutDataTotal = {
        labels: ['Male', 'Female'],
        datasets: [{
            data: totalHighRisk === 0 ? [1] : [data['High-risk total male'], data['High-risk total female']],
            backgroundColor: totalHighRisk === 0 ? [chartTheme.noData] : [chartTheme.male, chartTheme.female],
            hoverBackgroundColor: totalHighRisk === 0 ? [chartTheme.noData] : [chartTheme.male, chartTheme.female],
            borderWidth: 0
        }]
    };

    const donutDataModerate = {
        labels: ['Male', 'Female'],
        datasets: [{
            data: totalModerateRisk === 0 ? [1] : [data['Moderate-risk total male'], data['Moderate-risk total female']],
            backgroundColor: totalModerateRisk === 0 ? [chartTheme.noData] : [chartTheme.male, chartTheme.female],
            hoverBackgroundColor: totalModerateRisk === 0 ? [chartTheme.noData] : [chartTheme.male, chartTheme.female],
            borderWidth: 0
        }]
    };

    const barData = {
        labels: ['High Risk', 'Moderate Risk'],
        datasets: [{
            label: 'Male',
            backgroundColor: chartTheme.male,
            data: [data['High-risk total male'], data['Moderate-risk total male']],
            borderRadius: 4
        }, {
            label: 'Female',
            backgroundColor: chartTheme.female,
            data: [data['High-risk total female'], data['Moderate-risk total female']],
            borderRadius: 4
        }]
    };

    const donutOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            tooltip: {
                callbacks: {
                    label: (context) => {
                        if (context.chart.data.datasets[0].data.length === 1 &&
                            context.chart.data.datasets[0].data[0] === 1) {
                            return 'No data available';
                        }
                        return `${context.label}: ${context.raw}`;
                    }
                }
            }
        }
    };

    const barOptions = {
        ...chartOptions,
        scales: {
            x: {
                stacked: true,
                grid: {
                    display: false
                }
            },
            y: {
                stacked: true,
                min: 0,
                ticks: {
                    stepSize: 1,
                    color: chartTheme.text
                },
                grid: {
                    color: 'rgba(43, 101, 111, 0.1)'
                }
            }
        },
        plugins: {
            ...chartOptions.plugins,
            tooltip: {
                callbacks: {
                    label: (context) => {
                        if (context.raw === 0) return `${context.dataset.label}: No data`;
                        return `${context.dataset.label}: ${context.raw}`;
                    }
                }
            }
        }
    };

    donutChartTotalInstance = renderChart('donut', 'donutChartTotal', donutDataTotal, donutOptions);
    donutChartModerateInstance = renderChart('donut', 'donutChartModerate', donutDataModerate, donutOptions);
    barChartInstance = renderChart('bar', 'barChart', barData, barOptions);
}

const setActiveButton = (buttonName) => {
    activeButton.value = buttonName;
    updateCharts();
};

watch(serviceAndTreatmentData, () => {
    if (activeButton.value) {
        updateCharts();
    }
}, { deep: true });

onMounted(() => {
    setActiveButton(substances[0]);
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

.substance-btn:hover,
.substance-btn.active {
    background: #2B656F;
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e6f3f5;
}

.charts-section {
    flex: 2;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.chart-card {
    background: linear-gradient(135deg, #fdffff, #f0f7f8);
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

.chart-container {
    position: relative;
    height: 200px;
}

canvas {
    width: 100% !important;
    height: 100% !important;
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