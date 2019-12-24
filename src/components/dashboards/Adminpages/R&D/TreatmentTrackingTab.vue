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

                <!-- Referral Flow Analysis -->
                <div class="col-12">
                    <section class="h-100">
                        <div class="card shadow-sm">
                            <div class="card-body">
                                <h4 class="section-title">Referral Flow Analysis</h4>
                                <div class="chart-container">
                                    <apexchart type="bar" :height="getChartHeight" :options="referralFlowOptions"
                                        :series="referralFlowSeries"></apexchart>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Referral Status Distribution -->
                <div class="col-12 col-lg-6">
                    <section class="h-100">
                        <div class="card shadow-sm">
                            <div class="card-body">
                                <h4 class="section-title">Referral Status Distribution</h4>
                                <div class="chart-container">
                                    <apexchart type="pie" :height="getChartHeight" :options="referralStatusOptions"
                                        :series="referralStatusSeries"></apexchart>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- Agency Referral Matrix -->
                <div class="col-12 col-lg-6">
                    <section class="h-100">
                        <div class="card shadow-sm">
                            <div class="card-body">
                                <h4 class="section-title">Agency-to-Agency Referrals</h4>
                                <div class="chart-container">
                                    <apexchart type="heatmap" :height="getChartHeight" :options="referralMatrixOptions"
                                        :series="referralMatrixSeries"></apexchart>
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
import VueApexCharts from 'vue3-apexcharts';

const props = defineProps({
    filteredData: {
        type: Array,
        required: true
    }
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
    referral: ['#275D67', '#4A8895', '#6CB3A5', '#8EDDC8', '#A3CDB8', '#B0F7EB'],
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
                style: {
                    fontSize: '10px'
                }
            }
        }
    }]
};

// Treatment Status Chart
const treatmentStatusOptions = computed(() => ({
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
}));

const treatmentStatusSeries = computed(() => {
    const caseStatusCount = groupBy(props.filteredData, 'case_status');
    const assessmentStatusCount = groupBy(props.filteredData, 'assessment_status');

    return [{
        name: 'On Going',
        data: [
            caseStatusCount['On Going']?.length || 0,
            assessmentStatusCount['Not Conducted']?.length || 0
        ]
    }, {
        name: 'Completed',
        data: [
            caseStatusCount['Case Closed']?.length || 0,
            assessmentStatusCount['Conducted']?.length || 0
        ]
    }];
});

// Counseling Status Chart
const counselingStatusOptions = computed(() => ({
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
    }
}));

const counselingStatusSeries = computed(() => {
    const statusCount = groupBy(props.filteredData, 'counseling');
    const total = props.filteredData.length || 1;

    return [
        (statusCount['Waiting List']?.length || 0) / total * 100,
        (statusCount['Availed']?.length || 0) / total * 100,
        (statusCount['Not Required']?.length || 0) / total * 100,
    ];
});

// Follow-Up Status Chart
// First compute the agency data
const followUpAgencyData = computed(() => {
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

    return agencyData;
});

const followUpByAgencyOptions = computed(() => {
    const agencies = Object.keys(followUpAgencyData.value);

    return {
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
            }
        },
        xaxis: {
            categories: agencies,
            type: 'category',
            labels: {
                style: { colors: colors.primary },
                trim: false,
                show: true,
                maxHeight: 150
            }
        },
        yaxis: {
            title: {
                text: 'Number of Cases',
                style: { color: colors.primary }
            }
        },
        colors: colors.accent,
        dataLabels: {
            enabled: true,
            formatter: function (val) {
                return val > 0 ? val.toString() : '';
            }
        }
    };
});

const followUpByAgencySeries = computed(() => {
    const agencyData = followUpAgencyData.value;
    const agencies = Object.keys(agencyData);

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
const assessmentStatusOptions = computed(() => ({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'donut'
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
                            return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                        }
                    }
                }
            }
        }
    }
}));

const assessmentStatusSeries = computed(() => {
    const statusCount = groupBy(props.filteredData, 'assessment_status');
    const total = props.filteredData.length || 1;

    return [
        (statusCount['Conducted']?.length || 0) / total * 100,
        (statusCount['Not Conducted']?.length || 0) / total * 100
    ];
});

// Referral Flow Chart
const referralFlowData = computed(() => {
    const referralData = {};
    props.filteredData.forEach(item => {
        if (item.referral_instance) {
            const fromRole = item.referral_instance.referred_by?.user_role_agency || 'Unknown Role';
            const fromAgency = item.referral_instance.referred_by?.active_agency?.agency_name || 'Unknown Agency';
            const toRole = item.referral_instance.referred_to?.user_role_agency || 'Unknown Role';
            const toAgency = item.referral_instance.referred_to?.active_agency?.agency_name || 'Unknown Agency';

            const key = `${fromAgency} (${fromRole}) → ${toAgency} (${toRole})`;
            referralData[key] = (referralData[key] || 0) + 1;
        }
    });

    return Object.entries(referralData)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);
});

const referralFlowOptions = computed(() => {
    const sortedData = referralFlowData.value;

    return {
        ...commonChartOptions,
        chart: {
            ...commonChartOptions.chart,
            type: 'bar',
            stacked: false
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 4,
                distributed: true
            }
        },
        xaxis: {
            categories: sortedData.map(([label]) => label),
            type: 'category',
            labels: {
                style: {
                    colors: colors.primary,
                    fontSize: '11px'
                },
                formatter: function (value) {
                    return value.length > 30 ? value.substr(0, 27) + '...' : value;
                }
            }
        },
        yaxis: {
            title: {
                text: 'Number of Referrals',
                style: { color: colors.primary }
            }
        },
        colors: colors.referral,
        legend: { show: false },
        tooltip: {
            y: {
                formatter: function (value) {
                    return `${value} Referral${value !== 1 ? 's' : ''}`;
                }
            }
        }
    };
});

const referralFlowSeries = computed(() => {
    const sortedData = referralFlowData.value;
    return [{
        name: 'Referrals',
        data: sortedData.map(([, value]) => value)
    }];
});

// Referral Status Chart
const referralStatusOptions = computed(() => ({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'pie'
    },
    labels: ['Awaiting', 'Referred', 'Completed'],
    colors: colors.accent.slice(0, 3),
    dataLabels: {
        enabled: true,
        formatter: function (val) {
            return val.toFixed(1) + '%';
        }
    }
}));

const referralStatusSeries = computed(() => {
    const statusCount = groupBy(props.filteredData, 'referred');
    const total = props.filteredData.length || 1;

    return [
        (statusCount['Awaiting']?.length || 0) / total * 100,
        (statusCount['Referred']?.length || 0) / total * 100,
        (statusCount['Completed']?.length || 0) / total * 100
    ];
});

// Agency Referral Matrix
const matrixData = computed(() => {
    const matrix = {};
    const agencies = new Set();
    const allValues = [];

    props.filteredData.forEach(item => {
        if (item.referral_instance) {
            const fromAgency = item.referral_instance.referred_by?.active_agency?.agency_name || 'Unknown';
            const toAgency = item.referral_instance.referred_to?.active_agency?.agency_name || 'Unknown';

            agencies.add(fromAgency);
            agencies.add(toAgency);

            if (!matrix[fromAgency]) {
                matrix[fromAgency] = {};
            }
            if (!matrix[fromAgency][toAgency]) {
                matrix[fromAgency][toAgency] = 0;
            }
            matrix[fromAgency][toAgency]++;
            allValues.push(matrix[fromAgency][toAgency]);
        }
    });

    const maxValue = Math.max(...allValues.filter(v => v > 0));
    const colorRanges = [
        { from: 0, to: 0, color: '#F5F5F5', name: 'none' },
        { from: 1, to: Math.ceil(maxValue / 3), color: '#A3CDB8', name: 'low' },
        { from: Math.ceil(maxValue / 3), to: Math.ceil(2 * maxValue / 3), color: '#6CB3A5', name: 'medium' },
        { from: Math.ceil(2 * maxValue / 3), to: maxValue, color: '#275D67', name: 'high' }
    ];

    return {
        matrix,
        agencies: Array.from(agencies).sort(),
        colorRanges
    };
});

const referralMatrixOptions = computed(() => ({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'heatmap'
    },
    dataLabels: {
        enabled: true,
        formatter: function (val) {
            return val || '';
        }
    },
    colors: [colors.primary],
    plotOptions: {
        heatmap: {
            shadeIntensity: 0.5,
            radius: 0,
            colorScale: {
                ranges: matrixData.value.colorRanges
            }
        }
    },
    xaxis: {
        categories: matrixData.value.agencies,
        labels: {
            trim: true,
            maxHeight: 50,
            style: { colors: colors.primary }
        }
    }
}));

const referralMatrixSeries = computed(() => {
    const { matrix, agencies } = matrixData.value;

    return agencies.map(fromAgency => ({
        name: fromAgency,
        data: agencies.map(toAgency => ({
            x: toAgency,
            y: matrix[fromAgency]?.[toAgency] || 0
        }))
    }));
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