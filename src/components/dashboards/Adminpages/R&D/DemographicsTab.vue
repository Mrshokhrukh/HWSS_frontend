<template>
    <div class="card border-0 shadow-sm rounded-3 mx-3 my-4">
        <!-- Header -->
        <div class="card-header border-0 p-4 custom-gradient">
            <div class="d-flex align-items-center mb-3">
                <i class="bi bi-pie-chart-fill fs-4 me-2 text-white"></i>
                <h5 class="mb-0 text-white fw-semibold">Demographics</h5>
            </div>
            <div class="d-flex gap-3">
                <Button icon="pi pi-download" label="Download PDF" @click="downloadPDF" class="btn-custom" />
                <Button icon="pi pi-print" label="Print" @click="printTable" class="btn-custom" />
            </div>
        </div>

        <!-- Body -->
        <div class="card-body p-4">
            <div class="row g-4">
                <div class="col-md-6 d-flex">
                    <div class="card border-0 shadow-sm flex-fill">
                        <div class="card-header bg-white py-3 border-bottom">
                            <h6 class="mb-0 fw-semibold">Age Distribution</h6>
                        </div>
                        <div class="card-body p-4">
                            <apexchart type="bar" height="350" :options="ageDistributionChartOptions"
                                :series="ageDistributionChartSeries" />
                        </div>
                    </div>
                </div>
                <div class="col-md-6 d-flex">
                    <div class="card border-0 shadow-sm flex-fill">
                        <div class="card-header bg-white py-3 border-bottom">
                            <h6 class="mb-0 fw-semibold">Gender Distribution</h6>
                        </div>
                        <div class="card-body p-4">
                            <apexchart type="pie" height="350" :options="genderDistributionChartOptions"
                                :series="genderDistributionChartSeries" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-4 mt-4">
                <div class="col-md-12 d-flex">
                    <div class="card border-0 shadow-sm flex-fill">
                        <div class="card-header bg-white py-3 border-bottom">
                            <h6 class="mb-0 fw-semibold">Geographic Distribution</h6>
                        </div>
                        <div class="card-body p-4">
                            <apexchart type="bar" height="350" :options="dzongkhagDistributionChartOptions"
                                :series="dzongkhagDistributionChartSeries"></apexchart>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import VueApexCharts from 'vue3-apexcharts';

const props = defineProps({
    filteredData: {
        type: Array,
        required: true,
    },
});

const primaryColor = '#275D67';
const secondaryColor = '#A3CDB8';

// Common chart options
const commonChartOptions = {
    chart: {
        toolbar: { show: false },
        fontFamily: 'inherit',
    },
    dataLabels: { enabled: false },
    xaxis: {
        labels: { style: { colors: primaryColor } },
    },
    yaxis: {
        labels: { style: { colors: primaryColor } },
    },
    grid: { show: true, borderColor: '#e0e0e0' },
    theme: { mode: 'light' },
};

// Age Distribution Chart
const ageDistributionChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar',
    },
    xaxis: {
        ...commonChartOptions.xaxis,
        categories: [],
    },
    yaxis: {
        ...commonChartOptions.yaxis,
        title: {
            text: 'Number of Individuals',
            style: { color: primaryColor },
        },
    },
    colors: [primaryColor],
    responsive: [{
        breakpoint: 500,
        options: {
            plotOptions: {
                bar: {
                    horizontal: true
                }
            },
            yaxis: {
                title: {
                    text: 'Number of Individuals',
                    style: { color: primaryColor },
                    rotate: -90
                },
            },
        }
    }]
});

const ageDistributionChartSeries = computed(() => {
    const ageGroupCounts = {};
    props.filteredData.forEach(item => {
        const age = calculateAge(item.user?.date_of_birth);
        const ageGroup = getAgeGroup(age);
        if (ageGroup) {
            ageGroupCounts[ageGroup] = (ageGroupCounts[ageGroup] || 0) + 1;
        }
    });

    const allAgeGroups = ['Under 10', '10-19', '20-24', '25-60', 'Over 60'];
    allAgeGroups.forEach(group => {
        if (!ageGroupCounts[group]) {
            ageGroupCounts[group] = 0;
        }
    });

    const sortedAgeGroups = Object.keys(ageGroupCounts).sort((a, b) => {
        const ageA = a === 'Under 10' ? 0 : parseInt(a.split('-')[0]);
        const ageB = b === 'Under 10' ? 0 : parseInt(b.split('-')[0]);
        if (a === 'Over 60') return 1;
        if (b === 'Over 60') return -1;
        return ageA - ageB;
    });
    ageDistributionChartOptions.value.xaxis.categories = sortedAgeGroups;

    return [
        {
            name: 'Number of Individuals',
            data: sortedAgeGroups.map(group => ageGroupCounts[group]),
        },
    ];
});

// Gender Distribution Chart
const genderDistributionChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'pie',
    },
    labels: ['Male', 'Female'],
    colors: [primaryColor, secondaryColor],
    legend: {
        position: 'bottom',
        labels: { colors: primaryColor },
    },
    responsive: [{
        breakpoint: 480,
        options: {
            chart: {
                width: 200,
            },
            legend: {
                position: 'bottom'
            }
        }
    }]
});

const genderDistributionChartSeries = computed(() => {
    const maleCount = props.filteredData.filter(item => item.user?.gender?.toLowerCase() === 'male').length;
    const femaleCount = props.filteredData.filter(item => item.user?.gender?.toLowerCase() === 'female').length;
    return [maleCount, femaleCount];
});

// Dzongkhag Distribution Chart
const dzongkhagDistributionChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar',
        height: 350,
        toolbar: {
            show: false
        }
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '55%',
            borderRadius: 2
        }
    },
    dataLabels: {
        enabled: true,
        formatter: function (val) {
            return val || '0';
        },
        style: {
            fontSize: '12px'
        }
    },
    xaxis: {
        ...commonChartOptions.xaxis,
        categories: [],
        labels: {
            rotate: -45,
            rotateAlways: true,
            style: {
                fontSize: "12px",
                colors: primaryColor
            }
        },
        title: {
            text: 'Location (Dzongkhag)',
            style: {
                color: primaryColor
            }
        }
    },
    yaxis: {
        ...commonChartOptions.yaxis,
        title: {
            text: 'Number of Individuals',
            style: { color: primaryColor }
        },
        labels: {
            formatter: function (val) {
                return Math.round(val);
            }
        }
    },
    colors: [primaryColor],
    grid: {
        show: true,
        borderColor: '#e0e0e0',
        strokeDashArray: 4
    },
    responsive: [{
        breakpoint: 600,
        options: {
            plotOptions: {
                bar: {
                    columnWidth: '80%'
                }
            },
            xaxis: {
                labels: {
                    rotate: -90,
                    fontSize: '10px'
                }
            }
        }
    }]
});


const dzongkhagDistributionChartSeries = computed(() => {
    const dzongkhagCounts = {};

    // Process the data with validation
    props.filteredData.forEach(item => {
        const dzongkhag = validateLocation(item.user?.ps_add_dzongkhag);
        dzongkhagCounts[dzongkhag] = (dzongkhagCounts[dzongkhag] || 0) + 1;
    });

    // Sort dzongkhags with 'N/A' at the end
    const sortedDzongkhags = Object.keys(dzongkhagCounts).sort((a, b) => {
        if (a === 'N/A') return 1;
        if (b === 'N/A') return -1;
        return a.localeCompare(b);
    });

    // Update chart options
    dzongkhagDistributionChartOptions.value.xaxis.categories = sortedDzongkhags;

    return [{
        name: 'Number of Individuals',
        data: sortedDzongkhags.map(dzongkhag => dzongkhagCounts[dzongkhag])
    }];
});


function validateLocation(location) {
    if (!location || typeof location !== 'string') return 'N/A';
    location = location.trim();
    return location === '' ? 'N/A' : location;
}

// Helper functions
function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 0;
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}
function getAgeGroup(age) {
    if (age < 10) return 'Under 10';
    if (age >= 10 && age <= 19) return '10-19';
    if (age >= 20 && age <= 24) return '20-24';
    if (age >= 25 && age <= 60) return '25-60';
    return 'Over 60';
}

// Export Functions
const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Demographics Report', 14, 15);

    const tableData = [
        ['Metric', 'Value'],
        ['Total Users', props.filteredData.length],
        ['Gender Distribution', `Male : ${props.filteredData.filter(item => item.user?.gender === 'Male').length}, Female : ${props.filteredData.filter(item => item.user?.gender === 'Female').length}`],
    ]
    doc.autoTable({
        head: [['Metric', 'Value']],
        body: tableData,
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: {
            fillColor: [43, 101, 111],
            textColor: 255
        }
    });
    doc.save('demographics.pdf');
};

const printTable = () => {
    window.print();
};
</script>

<style scoped>
.demographics-tab section {
    margin-bottom: 2rem;
}

.chart-container {
    background-color: white;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-title {
    color: #2B656F;
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

/* Custom gradient */
.custom-gradient {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

/* Custom styles to complement Bootstrap */
:deep(.btn-custom) {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: white;
}

:deep(.btn-custom:hover) {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.35);
}

.card-header h5 {
    margin: 0;
    color: #ffffff;
}
</style>