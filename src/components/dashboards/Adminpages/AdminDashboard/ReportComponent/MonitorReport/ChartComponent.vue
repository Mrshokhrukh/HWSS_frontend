<template>
    <div class="chart-wrapper">
        <!-- Loading State with Progress -->
        <div v-if="loading" class="chart-loading">
            <div class="loading-content">
                <div class="spinner-border text-primary mb-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="loading-text">Processing data...</div>
            </div>
        </div>

        <!-- Error State with Retry -->
        <div v-else-if="error" class="chart-error">
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ error }}
                <button class="btn btn-sm btn-outline-danger ms-3" @click="retryLoadData">
                    Retry
                </button>
            </div>
        </div>

        <!-- No Data State with Better UI -->
        <div v-else-if="!isDataAvailable" class="chart-no-data">
            <div class="alert alert-info d-flex align-items-center">
                <i class="bi bi-info-circle me-2"></i>
                <div>
                    No data available for the selected filters.
                    <br>
                    <small>Try adjusting your filters or selecting a different time period.</small>
                </div>
            </div>
        </div>

        <!-- Chart Display -->
        <div v-else class="chart-container">
            <!-- Enhanced Header -->
            <div class="chart-header mb-3">
                <div class="title-section">
                    <h4 class="chart-title">{{ getChartTitle }}</h4>
                    <span class="data-period" v-if="getDataPeriod">
                        {{ getDataPeriod }}
                    </span>
                </div>

                <div class="chart-controls">
                    <!-- Chart Type Selection -->
                    <div class="control-group me-3">
                        <div class="btn-group" role="group">
                            <button v-for="type in availableChartTypes" :key="type.value" class="btn"
                                :class="[currentChartType === type.value ? 'btn-primary' : 'btn-outline-primary']"
                                @click="updateChartType(type.value)" :title="type.description">
                                <i :class="type.icon" class="me-1"></i>
                                {{ type.label }}
                            </button>
                        </div>
                    </div>

                    <!-- View Options -->
                    <div class="control-group">
                        <button class="btn btn-outline-secondary" @click="toggleDataLabels"
                            :class="{ active: showDataLabels }">
                            <i class="bi bi-123"></i>
                        </button>
                        <button class="btn btn-outline-secondary" @click="toggleLegend" :class="{ active: showLegend }">
                            <i class="bi bi-list-ul"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Chart Area -->
            <div class="chart-area">
                <apexchart ref="chart" :type="currentChartType" :options="chartOptions" :series="series" height="500"
                    @markerClick="handleMarkerClick" @dataPointSelection="handleDataPointSelection" />
            </div>

            <!-- Enhanced Footer with Stats -->
            <div class="chart-footer mt-3">
                <div class="row align-items-center">
                    <div class="col">
                        <div class="stats-container">
                            <div class="stat-item">
                                <span class="stat-label">Total:</span>
                                <strong class="stat-value">{{ formatNumber(totalCount) }}</strong>
                                <span class="stat-unit">individuals</span>
                            </div>
                            <div class="stat-item" v-if="averageValue">
                                <span class="stat-label">Average:</span>
                                <strong class="stat-value">{{ formatNumber(averageValue) }}</strong>
                                <span class="stat-unit">per category</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="btn-group">
                            <button class="btn btn-outline-primary" @click="downloadChart('png')">
                                <i class="bi bi-download me-1"></i>Image
                            </button>
                            <button class="btn btn-outline-primary" @click="downloadChart('csv')">
                                <i class="bi bi-file-spreadsheet me-1"></i>CSV
                            </button>
                            <button class="btn btn-outline-primary" @click="downloadChart('svg')">
                                <i class="bi bi-file-earmark-code me-1"></i>SVG
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Data Point Details Modal -->
            <div class="modal fade" id="dataDetailsModal" tabindex="-1" ref="detailsModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Data Point Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div v-if="selectedDataPoint">
                                <div class="details-content">
                                    <!-- Dynamic content based on selected data point -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

const props = defineProps({
    filteredData: {
        type: Array,
        required: true
    },
    activeFiltersList: {
        type: Array,
        required: true,
        default: () => []
    }
});

// Enhanced Component State
const chart = ref(null);
const loading = ref(false);
const error = ref(null);
const currentChartType = ref('bar');
const showDataLabels = ref(true);
const showLegend = ref(true);
const selectedDataPoint = ref(null);

// Chart Types Configuration
const chartTypes = [
    { value: 'bar', label: 'Bar', icon: 'bi bi-bar-chart' },
    { value: 'line', label: 'Line', icon: 'bi bi-graph-up' },
    { value: 'area', label: 'Area', icon: 'bi bi-area-chart' }
];

// Enhanced Computed Properties
const isDataAvailable = computed(() => {
    return props.filteredData && props.filteredData.length > 0;
});

const getChartTitle = computed(() => {
    const baseTitle = 'Monitoring Report Analysis';
    const filters = props.activeFiltersList
        .map(filter => `${filter.label}`)
        .join(' | ');
    return filters ? `${baseTitle} (${filters})` : baseTitle;
});

const processedData = computed(() => {
    if (!props.filteredData) return {};

    try {
        const result = {
            screening: { male: {}, female: {} },
            counseling: { male: {}, female: {} },
            referral: { male: {}, female: {} },
            assessment: { male: {}, female: {} }
        };

        props.filteredData.forEach(item => {
            const gender = item.user?.gender?.toLowerCase();
            if (!gender || !['male', 'female'].includes(gender)) return;

            // Process screening data
            const screeningStatus = item.screening_data ?
                (typeof item.screening_data === 'string' && item.screening_data !== "Data not available" ? 'Screened' : 'Not Screened') :
                'Not Available';
            result.screening[gender][screeningStatus] = (result.screening[gender][screeningStatus] || 0) + 1;

            // Process counseling data with proper status handling
            const counselingStatus = item.counseling || 'No Counseling';
            result.counseling[gender][counselingStatus] = (result.counseling[gender][counselingStatus] || 0) + 1;

            // Process referral data with detailed status
            const referralStatus = item.referred || 'Not Referred';
            result.referral[gender][referralStatus] = (result.referral[gender][referralStatus] || 0) + 1;

            // Process assessment data
            const assessmentStatus = item.assessment_status || 'Not Conducted';
            result.assessment[gender][assessmentStatus] = (result.assessment[gender][assessmentStatus] || 0) + 1;
        });

        return result;
    } catch (err) {
        console.error('Error processing data:', err);
        error.value = 'Error processing chart data';
        return {};
    }
});

const series = computed(() => {
    if (!isDataAvailable.value) return [];

    try {
        const data = processedData.value;
        return Object.entries(data).map(([category, genderData]) => {
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
            const maleValues = Object.values(genderData.male);
            const femaleValues = Object.values(genderData.female);

            return {
                name: categoryName,
                data: [...maleValues, ...femaleValues]
            };
        });
    } catch (err) {
        console.error('Error generating series:', err);
        return [];
    }
});

const totalCount = computed(() => {
    return props.filteredData?.length || 0;
});

const averageValue = computed(() => {
    if (!series.value.length) return 0;
    const total = series.value.reduce((sum, series) =>
        sum + series.data.reduce((a, b) => a + b, 0), 0);
    return Math.round(total / series.value.length);
});

const chartOptions = computed(() => {
    return {
        chart: {
            type: currentChartType.value,
            stacked: true,
            toolbar: {
                show: true,
                tools: {
                    download: false,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                }
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            },
            events: {
                dataPointMouseEnter: function (event, chartContext, config) {
                    document.body.style.cursor = 'pointer';
                },
                dataPointMouseLeave: function (event, chartContext, config) {
                    document.body.style.cursor = 'default';
                }
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 4,
                dataLabels: {
                    position: 'top',
                    maxItems: 100,
                    hideOverflowingLabels: true
                }
            }
        },
        dataLabels: {
            enabled: showDataLabels.value,
            formatter: function (val) {
                return val ? val.toLocaleString() : '0';
            },
            style: {
                fontSize: '12px',
                fontWeight: '500',
                colors: ['#333']
            }
        },
        xaxis: {
            categories: ['Male', 'Female'],
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px',
                    fontFamily: 'inherit'
                }
            },
            title: {
                text: 'Gender Distribution',
                style: {
                    fontSize: '13px',
                    fontWeight: 600
                }
            }
        },
        yaxis: {
            title: {
                text: 'Number of Individuals',
                style: {
                    fontSize: '13px',
                    fontWeight: 600
                }
            },
            labels: {
                formatter: function (val) {
                    return val.toLocaleString();
                }
            }
        },
        colors: ['#2B656F', '#4B93A2', '#6BB5C7', '#92D8E6'],
        legend: {
            show: showLegend.value,
            position: 'top',
            horizontalAlign: 'center',
            fontSize: '13px',
            markers: {
                width: 12,
                height: 12,
                radius: 6
            }
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: function (val) {
                    return val.toLocaleString();
                }
            }
        },
        responsive: [{
            breakpoint: 768,
            options: {
                plotOptions: {
                    bar: {
                        columnWidth: '80%'
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
    };
});

// Methods
const updateChartType = (type) => {
    currentChartType.value = type;
};

const toggleDataLabels = () => {
    showDataLabels.value = !showDataLabels.value;
};

const toggleLegend = () => {
    showLegend.value = !showLegend.value;
};

const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
};

const downloadChart = async (format = 'csv') => {
    try {
        if (!chart.value) return;

        if (format === 'csv') {
            const csvData = [
                ['Category', 'Male', 'Female'],
                ...Object.entries(processedData.value).map(([category, data]) => [
                    category,
                    Object.values(data.male).reduce((a, b) => a + b, 0),
                    Object.values(data.female).reduce((a, b) => a + b, 0)
                ])
            ];

            const csvContent = csvData.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chart-data-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } else {
            await chart.value?.chart?.exportToFile(format);
        }
    } catch (err) {
        console.error('Error downloading chart:', err);
        error.value = 'Error downloading chart';
    }
};

const retryLoadData = async () => {
    error.value = null;
    loading.value = true;
    try {
        // Implement retry logic here
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Refresh data processing
    } catch (err) {
        error.value = 'Error retrying data load';
    } finally {
        loading.value = false;
    }
};

// Watchers
watch(() => props.filteredData, async (newData) => {
    if (newData) {
        loading.value = true;
        error.value = null;

        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (chart.value) {
                chart.value.updateOptions(chartOptions.value);
                chart.value.updateSeries(series.value);
            }
        } catch (err) {
            console.error('Error updating chart:', err);
            error.value = 'Error updating chart data';
        } finally {
            loading.value = false;
        }
    }
}, { deep: true });

// Lifecycle Hooks
onMounted(() => {
    if (isDataAvailable.value) {
        console.log('Chart mounted with data:', {
            seriesCount: series.value.length,
            totalRecords: totalCount.value
        });
    }
});

onUnmounted(() => {
    // Cleanup if needed
});
</script>

<style>
.chart-wrapper {
    position: relative;
    min-height: 500px;
    padding: 1rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    z-index: 10;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.chart-title {
    margin: 0;
    font-size: 1.25rem;
    color: #2B656F;
}

.chart-area {
    position: relative;
    height: 500px;
}

.chart-footer {
    border-top: 1px solid #eee;
    padding-top: 1rem;
}

.total-count {
    color: #666;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .chart-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .chart-controls {
        width: 100%;
    }

    .btn-group {
        width: 100%;
        display: flex;
    }

    .btn-group .btn {
        flex: 1;
    }
}
</style>