<template>
    <div class="treatment-tracking-tab">
        <div class="container-fluid p-0">
            <div class="row g-3">
                <!-- Treatment Status Overview -->
                <div class="col-12 col-lg-6">
                    <section class="h-100">
                        <div class="card shadow-sm">
                            <div class="card-body">
                                <h4 class="section-title">Treatment Status Overview</h4>
                                <div class="chart-container">
                                    <apexchart type="bar" :height="getChartHeight" :options="treatmentStatusOptions"
                                        :series="treatmentStatusSeries"></apexchart>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Counseling Status Distribution -->
                <div class="col-12 col-lg-6">
                    <section class="h-100">
                        <div class="card shadow-sm">
                            <div class="card-body">
                                <h4 class="section-title">Counseling Status Distribution</h4>
                                <div class="chart-container">
                                    <apexchart type="pie" :height="getChartHeight" :options="counselingStatusOptions"
                                        :series="counselingStatusSeries"></apexchart>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Follow-Up Status by Agency -->
                <div class="col-12 col-lg-6">
                    <section class="h-100">
                        <div class="card shadow-sm">
                            <div class="card-body">
                                <h4 class="section-title">Follow-Up Status by Agency</h4>
                                <div class="chart-container">
                                    <apexchart type="bar" :height="getChartHeight" :options="followUpByAgencyOptions"
                                        :series="followUpByAgencySeries"></apexchart>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Assessment Completion Status -->
                <div class="col-12 col-lg-6">
                    <section class="h-100">
                        <div class="card shadow-sm">
                            <div class="card-body">
                                <h4 class="section-title">Assessment Completion Status</h4>
                                <div class="chart-container">
                                    <apexchart type="donut" :height="getChartHeight" :options="assessmentStatusOptions"
                                        :series="assessmentStatusSeries"></apexchart>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { groupBy } from 'lodash';

const props = defineProps({
    filteredData: {
        type: Array,
        required: true,
    },
});

// Responsive chart height
const windowWidth = ref(window.innerWidth);
const baseChartHeight = 350;

const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth;
};

onMounted(() => {
    window.addEventListener('resize', updateWindowWidth);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateWindowWidth);
});

const getChartHeight = computed(() => {
    if (windowWidth.value < 768) {
        return baseChartHeight * 0.8;
    }
    return baseChartHeight;
});

// Color configuration
const colors = {
    primary: '#275D67',
    secondary: '#A3CDB8',
    accent: ['#4A8895', '#6CB3A5', '#8EDDC8', '#B0F7EB', '#FF9999', '#FFB366'],
};

// Common chart options
const commonChartOptions = {
    chart: {
        toolbar: { show: false },
        fontFamily: 'inherit',
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
    },
    dataLabels: {
        enabled: true,
        style: {
            fontSize: '12px',
            fontWeight: 500,
        }
    },
    legend: {
        position: 'bottom',
        labels: { colors: colors.primary },
        horizontalAlign: 'center',
        fontSize: '14px',
        markers: {
            width: 12,
            height: 12,
            radius: 6,
        },
        itemMargin: {
            horizontal: 10,
            vertical: 5
        }
    },
    theme: { mode: 'light' },
    responsive: [{
        breakpoint: 768,
        options: {
            legend: {
                position: 'bottom',
                fontSize: '12px',
            },
            dataLabels: {
                fontSize: '10px'
            }
        }
    }]
};

// Treatment Status Chart
const treatmentStatusOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar',
        stacked: true,
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '70%',
            borderRadius: 4,
        },
    },
    xaxis: {
        categories: ['Case Status', 'Assessment Status'],
        labels: {
            style: { colors: colors.primary },
            rotate: 0,
        }
    },
    yaxis: {
        title: {
            text: 'Number of Cases',
            style: { color: colors.primary },
        },
        labels: { style: { colors: colors.primary } },
    },
    colors: colors.accent,
});

const treatmentStatusSeries = computed(() => {
    const caseStatusCount = groupBy(props.filteredData, 'case_status');
    const assessmentStatusCount = groupBy(props.filteredData, 'assessment_status');

    return [
        {
            name: 'On Going',
            data: [
                caseStatusCount['On Going']?.length || 0,
                assessmentStatusCount['Not Conducted']?.length || 0
            ]
        },
        {
            name: 'Completed',
            data: [
                caseStatusCount['Case Closed']?.length || 0,
                assessmentStatusCount['Conducted']?.length || 0
            ]
        }
    ];
});

// Counseling Status Chart
const counselingStatusOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'pie',
    },
    labels: ['Waiting List', 'Availed', 'Not Required'],
    colors: colors.accent.slice(0, 3),
    dataLabels: {
        enabled: true,
        formatter: function (val) {
            return val.toFixed(1) + '%';
        }
    },
});

const counselingStatusSeries = computed(() => {
    const statusCount = groupBy(props.filteredData, 'counseling');
    const total = props.filteredData.length;

    return [
        (statusCount['Waiting List']?.length || 0) / total * 100,
        (statusCount['Availed']?.length || 0) / total * 100,
        (statusCount['Not Required']?.length || 0) / total * 100,
    ];
});

// Follow-Up by Agency Chart
const followUpByAgencyOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar',
        stacked: true,
    },
    plotOptions: {
        bar: {
            horizontal: true,
            borderRadius: 4,
            columnWidth: '90%',
        },
    },
    xaxis: {
        type: 'category',
        labels: {
            style: { colors: colors.primary },
            trim: false,
            show: true,
            maxHeight: 150,
        },
    },
    yaxis: {
        title: {
            text: 'Number of Cases',
            style: { color: colors.primary },
        },
    },
    colors: colors.accent,
    dataLabels: {
        enabled: true,
        formatter: function (val) {
            return val > 0 ? val.toString() : '';
        }
    },
});

const followUpByAgencySeries = computed(() => {
    const agencyData = {};

    props.filteredData.forEach(item => {
        const agencyName = item.user?.active_agency?.agency_name || 'Unspecified Agency';
        if (!agencyData[agencyName]) {
            agencyData[agencyName] = {
                'No Follow-up': 0,
                'Treatment Completed': 0,
                'Undergoing Treatment': 0
            };
        }

        const followUpStatus = item.follow_up || 'No Follow-up';
        agencyData[agencyName][followUpStatus]++;
    });

    const agencies = Object.keys(agencyData);
    followUpByAgencyOptions.value.xaxis.categories = agencies;

    return [
        {
            name: 'No Follow-up',
            data: agencies.map(agency => agencyData[agency]['No Follow-up'])
        },
        {
            name: 'Treatment Completed',
            data: agencies.map(agency => agencyData[agency]['Treatment Completed'])
        },
        {
            name: 'Undergoing Treatment',
            data: agencies.map(agency => agencyData[agency]['Undergoing Treatment'])
        }
    ];
});

// Assessment Status Chart
const assessmentStatusOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'donut',
    },
    labels: ['Conducted', 'Not Conducted'],
    colors: [colors.accent[0], colors.accent[1]],
    dataLabels: {
        enabled: true,
        formatter: function (val) {
            return val.toFixed(1) + '%';
        }
    },
    plotOptions: {
        pie: {
            donut: {
                size: '65%',
                labels: {
                    show: true,
                    total: {
                        show: true,
                        label: 'Total Cases',
                        formatter: function (w) {
                            return props.filteredData.length;
                        }
                    }
                }
            }
        }
    }
});

const assessmentStatusSeries = computed(() => {
    const statusCount = groupBy(props.filteredData, 'assessment_status');
    const total = props.filteredData.length;

    if (total === 0) return [0, 0];

    return [
        (statusCount['Conducted']?.length || 0) / total * 100,
        (statusCount['Not Conducted']?.length || 0) / total * 100
    ];
});
</script>

<style scoped>
.treatment-tracking-tab {
    padding: 1rem;
}

.section-title {
    color: #2B656F;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.chart-container {
    width: 100%;
    position: relative;
    min-height: 350px;
}

.card {
    height: 100%;
    transition: all 0.3s ease;
    border: none;
    background-color: #fff;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15) !important;
}

.card-body {
    padding: 1.5rem;
}

::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: #555;
}

@media (max-width: 768px) {
    .treatment-tracking-tab {
        padding: 0.5rem;
    }

    .section-title {
        font-size: 1.1rem;
    }

    .card-body {
        padding: 1rem;
    }

    .chart-container {
        min-height: 280px;
    }
}

@media print {
    .card {
        break-inside: avoid;
        box-shadow: none !important;
    }

    .treatment-tracking-tab {
        width: 100% !important;
        padding: 0 !important;
    }

    .chart-container {
        page-break-inside: avoid;
    }
}
</style>