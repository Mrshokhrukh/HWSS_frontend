<template>
    <div class="card border-0 shadow-sm rounded-3 mx-3 my-4">
        <!-- Header -->
        <div class="card-header border-0 p-4 custom-gradient">
            <div class="d-flex align-items-center mb-3">
                <i class="bi bi-bar-chart-line fs-4 me-2 text-white"></i>
                <h5 class="mb-0 text-white fw-semibold">Analysis & Reports</h5>
            </div>
            <div class="d-flex gap-3">
                <Button icon="pi pi-download" label="Download PDF" @click="downloadPDF" class="btn-custom" />
                <Button icon="pi pi-print" label="Print" @click="printTable" class="btn-custom" />
            </div>
        </div>

        <!-- Body -->
        <div class="card-body p-4">
            <section>
                <h4 class="fw-semibold mb-4">Referral Source Performance and Trends</h4>
                <div class="table-container bg-white p-3 rounded-3 shadow-sm mb-4">
                    <DataTable :value="referralSourceData" :rowHover="true" class="table-modern"
                        responsiveLayout="scroll" :paginator="true" :rows="10" stripedRows>
                        <Column field="source" header="Referral Source" :sortable="true">
                            <template #body="slotProps">
                                <span class="fw-medium">{{ slotProps.data.source }}</span>
                            </template>
                        </Column>
                        <Column field="totalReferrals" header="Total Referrals" :sortable="true">
                            <template #body="slotProps">
                                <span class="badge bg-primary-subtle text-primary rounded-pill px-3">
                                    {{ slotProps.data.totalReferrals }}
                                </span>
                            </template>
                        </Column>
                        <Column field="completionRate" header="Completion Rate (%)" :sortable="true">
                            <template #body="slotProps">
                                <div class="d-flex align-items-center">
                                    <div class="progress flex-grow-1" style="height: 8px;">
                                        <div class="progress-bar bg-success"
                                            :style="{ width: slotProps.data.completionRate + '%' }"></div>
                                    </div>
                                    <span class="ms-2 text-muted small">{{ slotProps.data.completionRate }}%</span>
                                </div>
                            </template>
                        </Column>
                        <Column field="avgReferralTime" header="Avg. Time (days)" :sortable="true">
                            <template #body="slotProps">
                                <span class="text-muted">{{ slotProps.data.avgReferralTime }}</span>
                            </template>
                        </Column>
                    </DataTable>
                </div>

                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="card border-0 shadow-sm h-100">
                            <div class="card-header bg-white py-3 border-bottom">
                                <h6 class="mb-0 fw-semibold">Performance Comparison</h6>
                            </div>
                            <div class="card-body p-4">
                                <apexchart type="bar" height="350" :options="referralComparisonOptions"
                                    :series="referralComparisonSeries" />
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card border-0 shadow-sm h-100">
                            <div class="card-header bg-white py-3 border-bottom">
                                <h6 class="mb-0 fw-semibold">Completion Rate Trend</h6>
                            </div>
                            <div class="card-body p-4">
                                <apexchart type="line" height="350" :options="completionTrendOptions"
                                    :series="completionTrendSeries" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const props = defineProps({
    filteredData: {
        type: Array,
        required: true
    }
});

// Utility Functions
const safeJsonParse = (data) => {
    if (!data) return null;
    if (typeof data === 'object') return data;
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
};

const getDateDiff = (start, end) => {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
    return Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24));
};


// Computed Data
const referralSourceData = computed(() => {
    const sourceMap = new Map();

    props.filteredData.forEach(item => {
        const source = item.user?.active_agency?.agency_name || 'Unknown';

        if (!sourceMap.has(source)) {
            sourceMap.set(source, {
                source,
                totalReferrals: 0,
                completedAssessments: 0,
                highRiskCases: 0,
                referralTimes: []
            });
        }

        const data = sourceMap.get(source);
        data.totalReferrals++;

        if (item.assessment_status === 'Conducted') {
            data.completedAssessments++;
        }

        if (isHighRisk(item)) {
            data.highRiskCases++;
        }

        const referralTime = calculateReferralTime(item.date, item.screening_data?.submission_date);
        if (referralTime !== null) {
            data.referralTimes.push(referralTime);
        }
    });

    return Array.from(sourceMap.values()).map(source => ({
        ...source,
        completionRate: ((source.completedAssessments / source.totalReferrals) * 100).toFixed(1),
        avgReferralTime: source.referralTimes.length ?
            (source.referralTimes.reduce((a, b) => a + b, 0) / source.referralTimes.length).toFixed(1) : 'N/A',
        highRiskPercentage: (source.highRiskCases / source.totalReferrals * 100).toFixed(1)
    }));
});

function isHighRisk(item) {
    let phqData = item.screening_data?.phq_data;
    let gadData = item.screening_data?.gad_data;

    try {
        if (typeof phqData === 'string' && phqData) phqData = JSON.parse(phqData);
        if (typeof gadData === 'string' && gadData) gadData = JSON.parse(gadData);
    } catch (e) {
        console.error('Error parsing screening data:', e);
    }

    const phqSevere = item.screening_data?.phq_interpretation === 'Severe';
    const gadSevere = item.screening_data?.gad_interpretation === 'Severe';
    const sudSevere = Array.isArray(item.screening_data?.assist_data) &&
        item.screening_data.assist_data.some(substance => substance.risk_flag === 'severe');

    return phqSevere || gadSevere || sudSevere;
}
const calculateReferralTime = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};


// Chart Options and Series
const colors = {
    primary: '#275D67',
    secondary: '#A3CDB8',
    accent: ['#4A8895', '#6CB3A5', '#8EDDC8', '#B0F7EB']
};

const referralComparisonOptions = {
    chart: {
        type: 'bar',
        toolbar: { show: false },
        fontFamily: 'inherit',
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800
        }
    },
    plotOptions: {
        bar: {
            borderRadius: 4,
            horizontal: false,
            columnWidth: '60%'
        }
    },
    colors: [colors.primary, colors.secondary, colors.accent[0]],
    xaxis: {
        categories: ['Assessment Status', 'Counseling Status', 'Risk Levels'],
        labels: {
            style: { colors: colors.primary }
        }
    },
    yaxis: {
        title: {
            text: 'Number of Cases',
            style: { color: colors.primary }
        }
    },
    dataLabels: {
        enabled: true,
        formatter: function (val) {
            return val.toFixed(0);
        }
    },
    legend: {
        position: 'bottom',
        markers: {
            radius: 12,
        }
    }
};


const referralComparisonSeries = computed(() => {
    // Count various statuses
    const assessmentCounts = {
        conducted: 0,
        notConducted: 0
    };

    const counselingCounts = {
        waiting: 0,
        availed: 0,
        notRequired: 0
    };

    const riskCounts = {
        severe: 0,
        moderate: 0,
        mild: 0
    };

    props.filteredData.forEach(item => {
        // Assessment Status
        if (item.assessment_status === 'Conducted') {
            assessmentCounts.conducted++;
        } else {
            assessmentCounts.notConducted++;
        }

        // Counseling Status
        if (item.counseling === 'Waiting List') {
            counselingCounts.waiting++;
        } else if (item.counseling === 'Availed') {
            counselingCounts.availed++;
        } else if (item.counseling === 'Not Required') {
            counselingCounts.notRequired++;
        }

        // Check for severe cases in screening data
        if (item.screening_data) {
            const phqSevere = item.screening_data.phq_interpretation === 'Severe';
            const gadSevere = item.screening_data.gad_interpretation === 'Severe';

            if (phqSevere || gadSevere) {
                riskCounts.severe++;
            } else if (item.screening_data.phq_interpretation === 'Moderate' ||
                item.screening_data.gad_interpretation === 'Moderate') {
                riskCounts.moderate++;
            } else {
                riskCounts.mild++;
            }
        }
    });

    return [
        {
            name: 'Conducted/Availed/Severe',
            data: [assessmentCounts.conducted, counselingCounts.availed, riskCounts.severe]
        },
        {
            name: 'Not Conducted/Waiting/Moderate',
            data: [assessmentCounts.notConducted, counselingCounts.waiting, riskCounts.moderate]
        },
        {
            name: 'Not Required/Mild',
            data: [0, counselingCounts.notRequired, riskCounts.mild]
        }
    ];
});


const completionTrendOptions = {
    chart: {
        type: 'line',
        toolbar: { show: false }
    },
    stroke: {
        curve: 'smooth',
        width: 3
    },
    colors: [colors.primary],
    xaxis: {
        type: 'datetime',
        labels: {
            style: { colors: colors.primary }
        }
    },
    yaxis: {
        title: {
            text: 'Completion Rate (%)',
            style: { color: colors.primary }
        },
        max: 100
    }
};

const completionTrendSeries = computed(() => {
    const monthlyData = {};

    props.filteredData.forEach(item => {
        const date = new Date(item.date);
        if (isNaN(date.getTime())) return;

        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { total: 0, completed: 0 };
        }

        monthlyData[monthKey].total++;
        if (item.assessment_status === 'Conducted') {
            monthlyData[monthKey].completed++;
        }
    });

    return [{
        name: 'Completion Rate',
        data: Object.entries(monthlyData)
            .map(([month, data]) => ({
                x: new Date(month).getTime(),
                y: Number(((data.completed / data.total) * 100).toFixed(1))
            }))
            .sort((a, b) => a.x - b.x)
    }];
});


// Export Functions
const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Referral Analysis Report', 14, 15);

    doc.autoTable({
        head: [['Referral Source', 'Total Referrals', 'Completion Rate (%)', 'Avg. Time (days)']],
        body: referralSourceData.value.map(row => [
            row.source,
            row.totalReferrals,
            row.completionRate,
            row.avgReferralTime
        ]),
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: {
            fillColor: [39, 93, 103],
            textColor: 255
        }
    });

    doc.save('referral-analysis.pdf');
};

const printTable = () => {
    window.print();
};
</script>

<style scoped>
.analysis-tab section {
    margin-bottom: 2rem;
}

.table-container,
.chart-container {
    background-color: white;
    padding: 1rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
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