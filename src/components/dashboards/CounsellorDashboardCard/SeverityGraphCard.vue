<template>
    <div class="card w-100 h-100 shadow-sm">
        <div class="card-header bg-gradient-dark">
            <h4 class="graph-title text-center text-white mb-0">Screening by Gender for: {{ cardTitle }}</h4>
        </div>
        <div class="card-body p-4">
            <div v-show="chartDataReady && hasValidData" class="chart-container">
                <canvas ref="chartCanvas"></canvas>
            </div>
            <div v-show="!chartDataReady || !hasValidData" class="loading-container">
                <div v-if="!hasValidData" class="text-center">
                    <p class="text-muted">No data available for this screening.</p>
                </div>
                <div v-else class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3">Loading chart data...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watchEffect, onMounted, onBeforeUnmount } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
    cardTitle: String,
    filteredData: Array
});

const chartCanvas = ref(null);
const chartInstance = ref(null);
const chartDataReady = ref(false);
const hasValidData = ref(false);
const chartType = ref('bar') //Default chart type

const maleColor = '#2B656F';
const femaleColor = '#64ac99';

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 20,
                font: {
                    size: 12,
                    weight: 'bold'
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#2B656F',
            bodyColor: '#2B656F',
            borderColor: '#2B656F',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            usePointStyle: true,
            titleFont: {
                weight: 'bold'
            },
             callbacks: {
                  label: (context) => {
                        const value = context.dataset.data[context.dataIndex];
                        const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
                        return `${context.dataset.label}: ${value} (${percentage}%)`;
                    }
                }
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                font: {
                    size: 12,
                    weight: 'bold'
                }
            },
            border: {
                width: 2,
                color: '#2B656F'
            }
        },
        y: {
            grid: {
                color: 'rgba(43, 101, 111, 0.1)',
                lineWidth: 1
            },
            ticks: {
                beginAtZero: true,
                stepSize: 1,
                font: {
                    size: 12,
                    weight: 'bold'
                }
            },
            border: {
                width: 2,
                color: '#2B656F'
            }
        }
    }
};

const getMeasurementForCardTitle = (screeningData, cardTitle) => {
    try {
        switch (cardTitle.toLowerCase()) {
             case 'suicidal behavior': {
                const phqData = typeof screeningData.phq_data === 'string'
                    ? JSON.parse(screeningData.phq_data)
                    : screeningData.phq_data;

                let hasSuicidalThoughts = false;
                if (Array.isArray(phqData)) {
                     const suicideQuestion = phqData.find(q =>
                        q.question && q.question.toLowerCase().includes('thoughts that you would be better off dead')
                    );
                    hasSuicidalThoughts = suicideQuestion?.score >= 1;
                } else if (phqData?.responses) {
                     const suicideQuestion = phqData.responses.find(q =>
                      q.question && q.question.toLowerCase().includes('thoughts that you would be better off dead')
                  );
                    hasSuicidalThoughts = suicideQuestion?.score >= 1;
                  }

                   return hasSuicidalThoughts ? 'Has Suicidal Thoughts' : null;
              }
            case 'depression':
                return screeningData.phq_interpretation || null;
            case 'anxiety':
                return screeningData.gad_interpretation || null;
            case 'ace':
                return screeningData.ace_interpretation || null;
            case 'assist': {
                const assistData = screeningData.assist_data || [];
                return assistData.some(item => item.risk_flag !== 'none') ? 'At Risk' : 'No Risk';
            }
            default:
                return null;
        }
    } catch (error) {
        console.error(`Error getting measurement for ${cardTitle}:`, error);
        return null;
    }
};

const processChartData = () => {
    if (!props.filteredData || props.filteredData.length === 0) {
        hasValidData.value = false;
        return null;
    }

    const maleData = {};
    const femaleData = {};
    let hasAnyValidData = false;
    
    props.filteredData.forEach(entry => {
        const screeningData = entry.screening_data || {};
        const gender = entry.user?.gender?.toLowerCase() || 'unknown';
        
        if (gender !== 'male' && gender !== 'female') return;
        
        const measurement = getMeasurementForCardTitle(screeningData, props.cardTitle);
       
        if (measurement && measurement !== 'No Data' && measurement !== 'No Response' && measurement !== 'Mild') {
            hasAnyValidData = true;
            if (gender === 'male') {
                maleData[measurement] = (maleData[measurement] || 0) + 1;
            } else {
                femaleData[measurement] = (femaleData[measurement] || 0) + 1;
            }
        }
    });

    hasValidData.value = hasAnyValidData;
    
    if (!hasAnyValidData) {
        return null;
    }

    const allMeasurements = [...new Set([
        ...Object.keys(maleData),
        ...Object.keys(femaleData)
    ])].sort();

     if(props.cardTitle === 'Suicidal Behavior'){
          chartType.value = 'bar'
       return {
                labels: ['Has Suicidal Thoughts'],
                datasets: [
                    {
                        label: 'Male',
                        data: ['Has Suicidal Thoughts'].map(measurement => maleData[measurement] || 0),
                        backgroundColor: `${maleColor}80`,
                        borderColor: maleColor,
                        borderWidth: 2,
                        borderRadius: 8
                    },
                    {
                        label: 'Female',
                         data: ['Has Suicidal Thoughts'].map(measurement => femaleData[measurement] || 0),
                        backgroundColor: `${femaleColor}80`,
                        borderColor: femaleColor,
                        borderWidth: 2,
                        borderRadius: 8
                    }
                ]
            };

    }else{
          chartType.value = allMeasurements.length > 1 ? 'bar' : 'doughnut'
         
        return {
                labels: allMeasurements,
                datasets: [
                    {
                        label: 'Male',
                        data: allMeasurements.map(measurement => maleData[measurement] || 0),
                        backgroundColor: `${maleColor}80`,
                        borderColor: maleColor,
                        borderWidth: 2,
                        borderRadius: 8
                    },
                    {
                        label: 'Female',
                        data: allMeasurements.map(measurement => femaleData[measurement] || 0),
                        backgroundColor: `${femaleColor}80`,
                        borderColor: femaleColor,
                        borderWidth: 2,
                        borderRadius: 8
                    }
                ]
            };

    }
};

const initializeChart = async () => {
    if (!chartCanvas.value) {
        console.warn('Canvas element not found');
        return;
    }

    // Destroy existing chart if it exists
    if (chartInstance.value) {
        chartInstance.value.destroy();
        chartInstance.value = null;
    }
    
    const chartData = processChartData();
    if (!chartData) {
        chartDataReady.value = false;
        return;
    }
    
    try {
          const ctx = chartCanvas.value.getContext('2d');
        chartInstance.value = new Chart(ctx, {
            type: chartType.value,
            data: chartData,
             options: chartOptions
         });
        chartDataReady.value = true;
    } catch (error) {
      console.error('Error initializing chart:', error);
      chartDataReady.value = false;
    }
};

// Watch for changes in filteredData
watchEffect(async () => {
    initializeChart();
});

// Initialize on mount
onMounted(async () => {
    initializeChart();
});

// Cleanup
onBeforeUnmount(() => {
    if (chartInstance.value) {
        chartInstance.value.destroy();
        chartInstance.value = null;
    }
});
</script>

<style scoped>
.card {
    border: none;
    border-radius: 1rem;
    overflow: hidden;
    transition: all 0.3s ease;
    background: white;
}

.card-header {
    border-bottom: none;
    padding: 1.5rem;
}

.bg-gradient-dark {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.graph-title {
    color: white;
    font-weight: 600;
}

.chart-container {
    height: 400px;
    position: relative;
}

.loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.spinner-border {
    width: 3rem;
    height: 3rem;
    color: #2B656F;
}

@media (max-width: 768px) {
    .chart-container {
        height: 300px;
    }

    .card-body {
        padding: 1rem;
    }

    .graph-title {
        font-size: 1.2rem;
    }
}
</style>