# ChartComponent.vue
<template>
    <div class="chart-container">
        <h3 class="text-center mb-4">{{ chartTitle }}</h3>
        <div style="height: 400px">
            <apexchart v-if="chartOptions" type="bar" height="100%" :options="chartOptions" :series="chartSeries" />
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
    filteredData: {
        type: Array,
        required: true
    },
    activeFiltersList: {
        type: Array,
        required: true
    }
})

const chartTitle = ref('')
const chartOptions = ref(null)
const chartSeries = ref(null)

// Custom color themes based on #28555F
const colorThemes = {
    screening: ['#28555F', '#3D7A87'],     // Base teal and lighter teal
    counseling: ['#28555F', '#4B959E', '#5EBFB5'],  // Teal progression
    assessment: ['#28555F', '#3D7A87'],     // Two-tone teal
    referred: ['#28555F', '#3D7A87'],       // Two-tone teal
    followUp: ['#28555F', '#3D7A87', '#4B959E']  // Three-tone teal
}

const baseChartOptions = {
    chart: {
        type: 'bar',
        stacked: false,
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
        },
        background: '#FFFFFF'
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '55%',
            borderRadius: 4,
            dataLabels: {
                position: 'top'
            }
        },
    },
    dataLabels: {
        enabled: true,
        formatter: function (val) {
            return val.toFixed(0)
        },
        style: {
            fontSize: '12px',
            colors: ['#333333']
        },
        offsetY: -20
    },
    stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
    },
    xaxis: {
        categories: [],
        labels: {
            style: {
                fontSize: '12px',
                colors: '#28555F'
            }
        }
    },
    yaxis: {
        title: {
            text: 'Count',
            style: {
                color: '#28555F'
            }
        },
        labels: {
            formatter: function (val) {
                return Math.floor(val)
            },
            style: {
                colors: '#28555F'
            }
        }
    },
    fill: {
        opacity: 0.85
    },
    tooltip: {
        theme: 'dark',
        y: {
            formatter: function (val) {
                return Math.floor(val)
            }
        },
        style: {
            fontSize: '12px'
        }
    },
    legend: {
        position: 'top',
        horizontalAlign: 'center',
        fontSize: '14px',
        labels: {
            colors: '#28555F'
        },
        markers: {
            width: 12,
            height: 12,
            radius: 2
        }
    },
    grid: {
        borderColor: '#E5E7EB',
        row: {
            colors: ['#F9FAFB', 'transparent'],
            opacity: 0.5
        }
    }
}

const processScreeningData = () => {
    const screenedMale = props.filteredData.filter(d =>
        d.user.gender === 'Male' &&
        d.screening_data &&
        typeof d.screening_data === 'object' &&
        (d.screening_data.phq_score !== null ||
            d.screening_data.gad_score !== null ||
            d.screening_data.ace_score !== null)
    ).length

    const screenedFemale = props.filteredData.filter(d =>
        d.user.gender === 'Female' &&
        d.screening_data &&
        typeof d.screening_data === 'object' &&
        (d.screening_data.phq_score !== null ||
            d.screening_data.gad_score !== null ||
            d.screening_data.ace_score !== null)
    ).length

    const notScreenedMale = props.filteredData.filter(d =>
        d.user.gender === 'Male' &&
        (!d.screening_data ||
            typeof d.screening_data !== 'object' ||
            (!d.screening_data.phq_score &&
                !d.screening_data.gad_score &&
                !d.screening_data.ace_score))
    ).length

    const notScreenedFemale = props.filteredData.filter(d =>
        d.user.gender === 'Female' &&
        (!d.screening_data ||
            typeof d.screening_data !== 'object' ||
            (!d.screening_data.phq_score &&
                !d.screening_data.gad_score &&
                !d.screening_data.ace_score))
    ).length

    return {
        options: {
            ...baseChartOptions,
            colors: colorThemes.screening,
            xaxis: {
                categories: ['Screened', 'Not Screened']
            }
        },
        series: [
            {
                name: 'Male',
                data: [screenedMale, notScreenedMale]
            },
            {
                name: 'Female',
                data: [screenedFemale, notScreenedFemale]
            }
        ]
    }
}

const processCounselingData = () => {
    const statuses = ['Waiting List', 'Availed', 'Not Required']
    const maleData = statuses.map(status =>
        props.filteredData.filter(d =>
            d.user.gender === 'Male' && d.counseling === status
        ).length
    )
    const femaleData = statuses.map(status =>
        props.filteredData.filter(d =>
            d.user.gender === 'Female' && d.counseling === status
        ).length
    )

    return {
        options: {
            ...baseChartOptions,
            colors: colorThemes.counseling,
            xaxis: {
                categories: statuses,
                title: {
                    text: 'Counseling Status'
                }
            }
        },
        series: [
            {
                name: 'Male',
                data: maleData
            },
            {
                name: 'Female',
                data: femaleData
            }
        ]
    }
}

const processAssessmentData = () => {
    const statuses = ['Conducted', 'Not Conducted']
    const maleData = statuses.map(status =>
        props.filteredData.filter(d =>
            d.user.gender === 'Male' && d.assessment_status === status
        ).length
    )
    const femaleData = statuses.map(status =>
        props.filteredData.filter(d =>
            d.user.gender === 'Female' && d.assessment_status === status
        ).length
    )

    return {
        options: {
            ...baseChartOptions,
            colors: colorThemes.assessment,
            xaxis: {
                categories: statuses,
                title: {
                    text: 'Assessment Status'
                }
            }
        },
        series: [
            {
                name: 'Male',
                data: maleData
            },
            {
                name: 'Female',
                data: femaleData
            }
        ]
    }
}

const processReferralData = () => {
    const statuses = ['Awaiting', 'Referred']
    const maleData = statuses.map(status =>
        props.filteredData.filter(d =>
            d.user.gender === 'Male' && d.referred === status
        ).length
    )
    const femaleData = statuses.map(status =>
        props.filteredData.filter(d =>
            d.user.gender === 'Female' && d.referred === status
        ).length
    )

    return {
        options: {
            ...baseChartOptions,
            colors: colorThemes.referred,
            xaxis: {
                categories: statuses,
                title: {
                    text: 'Referral Status'
                }
            }
        },
        series: [
            {
                name: 'Male',
                data: maleData
            },
            {
                name: 'Female',
                data: femaleData
            }
        ]
    }
}

const processFollowUpData = () => {
    const statuses = ['Treatment Completed', 'Undergoing Treatment', null]
    const labels = ['Completed', 'Ongoing', 'No Follow-up']

    const maleData = statuses.map(status =>
        props.filteredData.filter(d =>
            d.user.gender === 'Male' && d.follow_up === status
        ).length
    )
    const femaleData = statuses.map(status =>
        props.filteredData.filter(d =>
            d.user.gender === 'Female' && d.follow_up === status
        ).length
    )

    return {
        options: {
            ...baseChartOptions,
            colors: colorThemes.followUp,
            xaxis: {
                categories: labels,
                title: {
                    text: 'Follow-up Status'
                }
            }
        },
        series: [
            {
                name: 'Male',
                data: maleData
            },
            {
                name: 'Female',
                data: femaleData
            }
        ]
    }
}

const updateChart = () => {
    const activeFilter = props.activeFiltersList[0]
    if (!activeFilter) return

    let chartData
    switch (activeFilter) {
        case 'screening':
            chartData = processScreeningData()
            chartTitle.value = 'Screening Status by Gender'
            break
        case 'counseling':
            chartData = processCounselingData()
            chartTitle.value = 'Counseling Status by Gender'
            break
        case 'assessment_status':
            chartData = processAssessmentData()
            chartTitle.value = 'Assessment Status by Gender'
            break
        case 'referred':
            chartData = processReferralData()
            chartTitle.value = 'Referral Status by Gender'
            break
        case 'follow_up':
            chartData = processFollowUpData()
            chartTitle.value = 'Follow-up Status by Gender'
            break
        default:
            chartData = null
            chartTitle.value = ''
    }

    if (chartData) {
        chartOptions.value = chartData.options
        chartSeries.value = chartData.series
    }
}

// Watch for changes in props
watch(
    [() => props.filteredData, () => props.activeFiltersList],
    () => {
        updateChart()
    },
    { immediate: true }
)
</script>

<style scoped>
.chart-container {
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.apexcharts-tooltip) {
    background: #28555F !important;
    color: white !important;
    border: none !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

:deep(.apexcharts-tooltip-title) {
    background: #1F4147 !important;
    border-bottom: 1px solid #3D7A87 !important;
    font-weight: 600;
}

:deep(.apexcharts-xaxis-label),
:deep(.apexcharts-yaxis-label) {
    fill: #28555F !important;
}

:deep(.apexcharts-legend-text) {
    color: #28555F !important;
}
</style>