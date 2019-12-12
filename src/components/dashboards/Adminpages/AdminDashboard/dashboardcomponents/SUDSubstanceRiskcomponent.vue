<template>
    <div class="risk-level-container">
        <div class="dashboard-header">
            <h3 class="dashboard-title">Risk Level Analysis</h3>
            <p class="dashboard-subtitle">Substance abuse risk distribution by gender</p>
        </div>

        <div class="content-wrapper">
            <!-- Substance Selection -->
            <div class="buttons-section">
                <h3 class="section-title">
                    <i class="bi bi-clipboard2-pulse me-2"></i>
                    Substances
                </h3>
                <div class="button-grid">
                    <button v-for="substance in substances" 
                        :key="substance" 
                        @click="setActiveButton(substance)"
                        :class="['substance-btn', { active: activeButton === substance }]">
                        <span class="substance-name">{{ substance }}</span>
                        <span v-if="getTotalCount(substance)" class="count-badge">
                            [{{ getTotalCount(substance) }}]
                        </span>
                    </button>
                </div>
            </div>

            <!-- Enhanced Charts Section -->
            <div class="charts-section">
                <!-- Risk Distribution Radar Chart -->
                <div class="chart-card">
                    <div class="chart-header">
                        <h4 class="chart-title">
                            <i class="bi bi-radar me-2"></i>
                            Risk Distribution Pattern
                        </h4>
                        <div class="chart-actions">
                            <span class="total-indicator">Total: {{ getHighRiskTotal() + getModerateRiskTotal() }}</span>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="radarChart"></canvas>
                    </div>
                </div>

                <!-- Gender Distribution Area Chart -->
                <div class="chart-card">
                    <div class="chart-header">
                        <h4 class="chart-title">
                            <i class="bi bi-graph-up-arrow me-2"></i>
                            Risk Level Trends
                        </h4>
                        <div class="chart-actions">
                            <button class="view-toggle" @click="toggleChartView">
                                <i class="bi" :class="isAreaView ? 'bi-bar-chart' : 'bi-graph-up'"></i>
                            </button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="areaChart"></canvas>
                    </div>
                </div>

                <!-- Risk Matrix Bubble Chart -->
                <div class="chart-card full-width">
                    <div class="chart-header">
                        <h4 class="chart-title">
                            <i class="bi bi-grid-3x3-gap me-2"></i>
                            Risk Matrix
                        </h4>
                        <div class="legend-container">
                            <span class="legend-item">
                                <span class="legend-color" style="background: #275C65"></span>
                                Male
                            </span>
                            <span class="legend-item">
                                <span class="legend-color" style="background: #8AC2AF"></span>
                                Female
                            </span>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="bubbleChart"></canvas>
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

let radarChartInstance = null;
let areaChartInstance = null;
let bubbleChartInstance = null;

const isAreaView = ref(true);

const chartTheme = {
    male: '#275C65',
    female: '#8AC2AF',
    maleGradient: ['rgba(39, 92, 101, 0.8)', 'rgba(39, 92, 101, 0.1)'],
    femaleGradient: ['rgba(138, 194, 175, 0.8)', 'rgba(138, 194, 175, 0.1)'],
    noData: '#E6E6E6',
    background: '#ffffff',
    text: '#2B656F',
    grid: 'rgba(43, 101, 111, 0.1)'
};

function createGradient(ctx, colors) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    return gradient;
}

const substances = [
    'Tobacco', 'Alcohol', 'Cannabis', 'Cocaine', 'Amphetamine-type',
    'Inhalant', 'Sedative', 'Hallucinate', 'Opioids', 'Others'
];

const substanceKeyMapping = {
    'Tobacco': { key: 'tobacco', searchTerms: ['tobacco', 'cigarette'] },
    'Alcohol': { key: 'alcoholic', searchTerms: ['alcohol', 'alcoholic', 'beer', 'wine', 'spirits'] },
    'Cannabis': { key: 'cannabis', searchTerms: ['cannabis', 'marijuana', 'hash'] },
    'Cocaine': { key: 'cocaine', searchTerms: ['cocaine'] },
    'Amphetamine-type': { key: 'amphetamine', searchTerms: ['amphetamine', 'meth', 'ecstasy'] },
    'Inhalant': { key: 'inhalants', searchTerms: ['inhalant', 'dendrite', 'glue', 'petrol'] },
    'Sedative': { key: 'sedatives', searchTerms: ['sedative', 'sleeping', 'diazepam'] },
    'Hallucinate': { key: 'hallucinogens', searchTerms: ['hallucinate', 'lsd', 'ketamine'] },
    'Opioids': { key: 'opioids', searchTerms: ['opioid', 'heroin', 'morphine', 'fentanyl', 'codeine'] },
    'Others': { key: 'other', searchTerms: ['other'] }
};

function parseRiskLevel(riskFlag) {
    if (!riskFlag) return { level: 'none', score: 0 };

    const riskLower = riskFlag.toLowerCase();

    // Handle numeric scores if present
    const score = parseInt(riskFlag.match(/\((\d+)\)/)?.[1] || 0);

    // Check specific flags from your data
    if (riskLower === 'high' || score >= 27) return { level: 'high', score: score || 27 };
    if (riskLower === 'moderate' || score >= 4) return { level: 'moderate', score: score || 4 };
    if (riskLower === 'low') return { level: 'low', score: score || 1 };
    return { level: 'none', score: 0 };
}


function extractMeasurementData(data) {
    if (!data || !Array.isArray(data)) return [];

    return data.reduce((results, item) => {
        // Skip if no valid data
        if (typeof item.screening_data === 'string') {
            return results;
        }

        const processedData = {
            gender: item.user?.gender || "unknown",
            risks: {}
        };

        // Helper to process substance risks
        const processSubstanceRisk = (substance, riskFlag) => {
            const substanceMatch = Object.entries(substanceKeyMapping).find(([_, value]) =>
                value.searchTerms.some(term =>
                    substance.toLowerCase().includes(term.toLowerCase()))
            );

            if (substanceMatch) {
                const [_, value] = substanceMatch;
                const riskInfo = parseRiskLevel(riskFlag);

                if (!processedData.risks[value.key] ||
                    riskInfo.score > parseRiskLevel(processedData.risks[value.key]).score) {
                    processedData.risks[value.key] = riskFlag;
                }
            }
        };

        // Case 1: Process assist_data from screening_data (cluster tests)
        if (item.screening_data?.assist_data) {
            item.screening_data.assist_data.forEach(risk => {
                if (risk.substance__name && risk.risk_flag && (!risk.measurement || risk.measurement > 0)) {
                    processSubstanceRisk(risk.substance__name, risk.risk_flag);
                }
            });
        }

        // Case 2: Process event_substance_risks at root level
        if (item.event_substance_risks) {
            item.event_substance_risks.forEach(risk => {
                if (risk.substance_name && risk.risk_flag) {
                    processSubstanceRisk(risk.substance_name, risk.risk_flag);
                }
            });
        }

        // Case 3: Process case_substance_risks at root level
        if (item.case_substance_risks) {
            item.case_substance_risks.forEach(risk => {
                if (risk.substance_name && risk.risk_flag) {
                    processSubstanceRisk(risk.substance_name, risk.risk_flag);
                }
            });
        }

        // Only add to results if we found some risks
        if (Object.keys(processedData.risks).length > 0) {
            results.push(processedData);
        }

        return results;
    }, []);
}

function countRiskLevels(data) {
    const initialCounts = {};

    Object.values(substanceKeyMapping).forEach(substance => {
        initialCounts[`${substance.key}_moderate_male`] = 0;
        initialCounts[`${substance.key}_moderate_female`] = 0;
        initialCounts[`${substance.key}_high_male`] = 0;
        initialCounts[`${substance.key}_high_female`] = 0;
    });

    return data.reduce((counts, personData) => {
        const gender = personData.gender.toLowerCase();

        Object.entries(personData.risks).forEach(([substanceKey, riskFlag]) => {
            const { level } = parseRiskLevel(riskFlag);

            if (level === 'high') {
                counts[`${substanceKey}_high_${gender}`]++;
            } else if (level === 'moderate') {
                counts[`${substanceKey}_moderate_${gender}`]++;
            }
        });

        return counts;
    }, initialCounts);
}

const getTotalCount = (substance) => {
    const extractedData = extractMeasurementData(serviceAndTreatmentData.value);
    const counts = countRiskLevels(extractedData);
    const substanceKey = substanceKeyMapping[substance].key;

    return counts[`${substanceKey}_high_male`] +
        counts[`${substanceKey}_high_female`] +
        counts[`${substanceKey}_moderate_male`] +
        counts[`${substanceKey}_moderate_female`];
};

const getHighRiskTotal = () => {
    const extractedData = extractMeasurementData(serviceAndTreatmentData.value);
    const counts = countRiskLevels(extractedData);
    const substanceKey = substanceKeyMapping[activeButton.value]?.key;

    if (!substanceKey) return 0;

    return counts[`${substanceKey}_high_male`] + counts[`${substanceKey}_high_female`];
};

const getModerateRiskTotal = () => {
    const extractedData = extractMeasurementData(serviceAndTreatmentData.value);
    const counts = countRiskLevels(extractedData);
    const substanceKey = substanceKeyMapping[activeButton.value]?.key;

    if (!substanceKey) return 0;

    return counts[`${substanceKey}_moderate_male`] + counts[`${substanceKey}_moderate_female`];
};

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
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle'
            }
        },
        tooltip: {
            backgroundColor: '#2B656F',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            displayColors: true,
            callbacks: {
                label: (context) => {
                    if (context.raw === 0) return `${context.dataset.label}: No data`;
                    return `${context.dataset.label}: ${context.raw} users`;
                }
            }
        }
    }
};

function renderEnhancedCharts(radarData, areaData, bubbleData) {
    // Common options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
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

    // Radar Chart
    const radarOptions = {
        ...commonOptions,
        scales: {
            r: {
                ticks: {
                    color: chartTheme.text,
                    backdropColor: 'transparent'
                },
                grid: {
                    color: chartTheme.grid
                },
                angleLines: {
                    color: chartTheme.grid
                }
            }
        }
    };

    // Area/Line Chart
    const areaOptions = {
        ...commonOptions,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: chartTheme.grid
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    // Bubble Chart
    const bubbleOptions = {
        ...commonOptions,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Cases'
                }
            },
            x: {
                ticks: {
                    callback: function(value) {
                        return value === 1 ? 'High Risk' : 'Moderate Risk';
                    }
                }
            }
        }
    };

    // Render all charts
    [radarChartInstance, areaChartInstance, bubbleChartInstance].forEach(chart => {
        if (chart) chart.destroy();
    });

    const ctx1 = document.getElementById('radarChart')?.getContext('2d');
    const ctx2 = document.getElementById('areaChart')?.getContext('2d');
    const ctx3 = document.getElementById('bubbleChart')?.getContext('2d');

    if (ctx1) radarChartInstance = new Chart(ctx1, {
        type: 'radar',
        data: radarData,
        options: radarOptions
    });

    if (ctx2) areaChartInstance = new Chart(ctx2, {
        type: isAreaView.value ? 'line' : 'bar',
        data: areaData,
        options: areaOptions
    });

    if (ctx3) bubbleChartInstance = new Chart(ctx3, {
        type: 'bubble',
        data: bubbleData,
        options: bubbleOptions
    });
}

function updateCharts() {
    const extractedData = extractMeasurementData(serviceAndTreatmentData.value);
    const counts = countRiskLevels(extractedData);
    const substanceKey = substanceKeyMapping[activeButton.value]?.key;

    if (!substanceKey) return;

    const data = {
        'High-risk total male': counts[`${substanceKey}_high_male`],
        'High-risk total female': counts[`${substanceKey}_high_female`],
        'Moderate-risk total male': counts[`${substanceKey}_moderate_male`],
        'Moderate-risk total female': counts[`${substanceKey}_moderate_female`],
    };

    // Radar Chart Data
    const radarData = {
        labels: ['High Risk Male', 'High Risk Female', 'Moderate Risk Male', 'Moderate Risk Female'],
        datasets: [{
            label: 'Risk Distribution',
            data: [
                data['High-risk total male'],
                data['High-risk total female'],
                data['Moderate-risk total male'],
                data['Moderate-risk total female']
            ],
            backgroundColor: 'rgba(43, 101, 111, 0.2)',
            borderColor: '#2B656F',
            borderWidth: 2,
            pointBackgroundColor: '#2B656F',
            pointHoverBackgroundColor: '#fff'
        }]
    };

    // Area Chart Data
    const areaData = {
        labels: ['High Risk', 'Moderate Risk'],
        datasets: [
            {
                label: 'Male',
                data: [data['High-risk total male'], data['Moderate-risk total male']],
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    return createGradient(ctx, chartTheme.maleGradient);
                },
                borderColor: chartTheme.male,
                tension: 0.4
            },
            {
                label: 'Female',
                data: [data['High-risk total female'], data['Moderate-risk total female']],
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    return createGradient(ctx, chartTheme.femaleGradient);
                },
                borderColor: chartTheme.female,
                tension: 0.4
            }
        ]
    };

    // Bubble Chart Data
    const bubbleData = {
        datasets: [
            {
                label: 'Male',
                data: [
                    {
                        x: 1,
                        y: data['High-risk total male'],
                        r: Math.max(data['High-risk total male'] * 2, 8)
                    },
                    {
                        x: 2,
                        y: data['Moderate-risk total male'],
                        r: Math.max(data['Moderate-risk total male'] * 2, 8)
                    }
                ],
                backgroundColor: `${chartTheme.male}88`
            },
            {
                label: 'Female',
                data: [
                    {
                        x: 1,
                        y: data['High-risk total female'],
                        r: Math.max(data['High-risk total female'] * 2, 8)
                    },
                    {
                        x: 2,
                        y: data['Moderate-risk total female'],
                        r: Math.max(data['Moderate-risk total female'] * 2, 8)
                    }
                ],
                backgroundColor: `${chartTheme.female}88`
            }
        ]
    };

    // Render enhanced charts
    renderEnhancedCharts(radarData, areaData, bubbleData);
}

const setActiveButton = (buttonName) => {
    activeButton.value = buttonName;
    updateCharts();
};

function toggleChartView() {
    isAreaView.value = !isAreaView.value;
    updateCharts();
}

watch(serviceAndTreatmentData, (newVal) => {
    console.log('Service and Treatment Data changed:', newVal?.length, 'records');
    if (activeButton.value) {
        const extractedData = extractMeasurementData(newVal);
        console.log('Extracted Data:', extractedData.length, 'records with risks');
        updateCharts();
    }
}, { deep: true });

onMounted(() => {
    setActiveButton(substances[0]);
});
</script>

<style scoped>
.risk-level-container {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    border-radius: 20px;
    padding: 2rem;
    color: #fff;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
}

.substance-name {
    flex: 1;
    text-align: left;
}

.count-badge {
    font-size: 0.9rem;
    padding: 0.2rem 0.4rem;
    background-color: rgba(43, 101, 111, 0.1);
    border-radius: 4px;
    font-weight: 500;
    white-space: nowrap;
}

.substance-btn:hover .count-badge,
.substance-btn.active .count-badge {
    background-color: rgba(230, 243, 245, 0.2);
}

.substance-btn:hover,
.substance-btn.active {
    background: #2B656F;
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e6f3f5;
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

.dashboard-header {
    text-align: center;
    margin-bottom: 2rem;
}

.dashboard-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.dashboard-subtitle {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1rem;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.chart-title {
    display: flex;
    align-items: center;
    margin: 0;
}

.chart-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.view-toggle {
    background: none;
    border: none;
    color: #2B656F;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.view-toggle:hover {
    background: rgba(43, 101, 111, 0.1);
}

.total-indicator {
    background: rgba(43, 101, 111, 0.1);
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.9rem;
    color: #2B656F;
}

.legend-container {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #2B656F;
}

.legend-color {
    width: 12px;
    height: 12px;
    border-radius: 3px;
}
</style>