<template>
    <div class="analysis-tab">
        <section>
            <h4 class="section-title">Referral Source Performance and Trends</h4>
            <div class="table-container">
                <DataTable :value="referralSourceTableData" :paginator="true" :rows="10" responsiveLayout="scroll"
                    :sortField="sortField" :sortOrder="sortOrder" @sort="onSort">
                    <Column field="source" header="Referral Source" :sortable="true"></Column>
                    <Column field="totalReferrals" header="Total Referrals" :sortable="true"></Column>
                    <Column field="completedAssessments" header="Completed Assessments" :sortable="true"></Column>
                    <Column field="completionRate" header="Completion Rate (%)" :sortable="true"></Column>
                    <Column field="avgReferralTime" header="Avg. Referral Time (Days)" :sortable="true"></Column>
                    <Column field="highRiskCases" header="High-Risk Cases" :sortable="true"></Column>
                    <Column field="highRiskPercentage" header="High-Risk (%)" :sortable="true"></Column>
                </DataTable>
            </div>

            <div class="chart-container">
                <apexchart type="bar" height="350" :options="referralSourceComparisonOptions"
                    :series="referralSourceComparisonSeries">
                </apexchart>
            </div>

            <div class="chart-container">
                <div v-if="referralSources.length > 0" class="mb-3">
                    <MultiSelect v-model="selectedReferralSources" :options="referralSources" optionLabel="name"
                        placeholder="Select Referral Sources to Compare" class="w-full" />
                </div>
                <apexchart type="line" height="350" :options="referralSourceTrendOptions"
                    :series="referralSourceTrendSeries">
                </apexchart>
            </div>
        </section>

        <section>
            <h4 class="section-title">Assessment Completion Analysis</h4>
            <div class="grid">
                <div class="col-12 md:col-6">
                    <div class="chart-container">
                        <h5 class="chart-title">Completion Rate by Dzongkhag</h5>
                        <apexchart type="bar" height="350" :options="completionByDzongkhagOptions"
                            :series="completionByDzongkhagSeries">
                        </apexchart>
                    </div>
                </div>
                <div class="col-12 md:col-6">
                    <div class="chart-container">
                        <h5 class="chart-title">Age Distribution</h5>
                        <apexchart type="bar" height="350" :options="ageDistributionOptions"
                            :series="ageDistributionSeries">
                        </apexchart>
                    </div>
                </div>
            </div>
        </section>

        <section>
            <h4 class="section-title">Risk Analysis</h4>
            <div class="grid">
                <div class="col-12 md:col-6">
                    <div class="chart-container">
                        <h5 class="chart-title">Mental Health Risk Distribution</h5>
                        <apexchart type="pie" height="350" :options="mentalHealthOptions" :series="mentalHealthSeries">
                        </apexchart>
                    </div>
                </div>
                <div class="col-12 md:col-6">
                    <div class="chart-container">
                        <h5 class="chart-title">SUD Risk Distribution</h5>
                        <apexchart type="pie" height="350" :options="sudRiskOptions" :series="sudRiskSeries">
                        </apexchart>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import MultiSelect from 'primevue/multiselect';

const props = defineProps({
    filteredData: {
        type: Array,
        required: true,
    },
});

// Helper Functions
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

function calculateReferralTime(item) {
    if (!item.referral_instance?.date || !item.screening_data?.submission_date) return null;
    const start = new Date(item.referral_instance.date);
    const end = new Date(item.screening_data.submission_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// State
const selectedReferralSources = ref([]);
const sortField = ref('totalReferrals');
const sortOrder = ref(-1);

// Colors
const primaryColor = '#275D67';
const secondaryColor = '#A3CDB8';
const accentColors = ['#4A8895', '#6CB3A5', '#8EDDC8', '#B0F7EB'];

// Referral Source Table Data
const referralSourceTableData = computed(() => {
    const sourceCounts = {};

    props.filteredData.forEach(item => {
        const source = item.user?.active_agency?.agency_name || 'Unknown';

        if (!sourceCounts[source]) {
            sourceCounts[source] = {
                source,
                totalReferrals: 0,
                completedAssessments: 0,
                highRiskCases: 0,
                referralTimes: []
            };
        }

        sourceCounts[source].totalReferrals++;

        if (item.assessment_status === 'Conducted') {
            sourceCounts[source].completedAssessments++;
        }

        if (isHighRisk(item)) {
            sourceCounts[source].highRiskCases++;
        }

        const referralTime = calculateReferralTime(item);
        if (referralTime !== null) {
            sourceCounts[source].referralTimes.push(referralTime);
        }
    });

    return Object.values(sourceCounts).map(sourceData => ({
        ...sourceData,
        completionRate: (sourceData.completedAssessments / sourceData.totalReferrals * 100).toFixed(1),
        avgReferralTime: sourceData.referralTimes.length ?
            (sourceData.referralTimes.reduce((a, b) => a + b, 0) / sourceData.referralTimes.length).toFixed(1) : 0,
        highRiskPercentage: (sourceData.highRiskCases / sourceData.totalReferrals * 100).toFixed(1)
    }));
});

// Referral Source Comparison Chart
const referralSourceComparisonOptions = {
    chart: {
        type: 'bar',
        stacked: false,
        toolbar: { show: false }
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '55%',
            borderRadius: 4
        }
    },
    xaxis: {
        categories: computed(() => referralSourceTableData.value.map(source => source.source))
    },
    yaxis: {
        title: { text: 'Count' }
    },
    colors: [primaryColor, secondaryColor, accentColors[0]]
};

const referralSourceComparisonSeries = computed(() => ([
    {
        name: 'Total Referrals',
        data: referralSourceTableData.value.map(source => source.totalReferrals)
    },
    {
        name: 'Completed Assessments',
        data: referralSourceTableData.value.map(source => source.completedAssessments)
    },
    {
        name: 'High Risk Cases',
        data: referralSourceTableData.value.map(source => source.highRiskCases)
    }
]));

// Referral Source Trends
const referralSourceTrendOptions = {
    chart: {
        type: 'line',
        toolbar: { show: false }
    },
    xaxis: {
        type: 'datetime'
    },
    yaxis: {
        title: { text: 'Number of Referrals' }
    },
    stroke: {
        curve: 'smooth',
        width: 3
    },
    colors: [primaryColor, secondaryColor]
};

const referralSourceTrendSeries = computed(() => {
    if (!selectedReferralSources.value.length) return [];

    return selectedReferralSources.value.map(source => {
        const sourceData = props.filteredData
            .filter(item => item.user?.active_agency?.agency_name === source)
            .reduce((acc, item) => {
                const date = new Date(item.date);
                const monthKey = date.toISOString().slice(0, 7);
                acc[monthKey] = (acc[monthKey] || 0) + 1;
                return acc;
            }, {});

        return {
            name: source,
            data: Object.entries(sourceData).map(([month, count]) => ({
                x: new Date(month).getTime(),
                y: count
            }))
        };
    });
});

// Completion by Dzongkhag Chart
const completionByDzongkhagOptions = {
    chart: {
        type: 'bar',
        toolbar: { show: false }
    },
    plotOptions: {
        bar: {
            horizontal: true,
            borderRadius: 4
        }
    },
    colors: [primaryColor],
    xaxis: {
        title: { text: 'Completion Rate (%)' }
    }
};

const completionByDzongkhagSeries = computed(() => {
    const dzongkhagData = {};

    props.filteredData.forEach(item => {
        const dzongkhag = item.user?.ps_add_dzongkhag || 'Unknown';
        if (!dzongkhagData[dzongkhag]) {
            dzongkhagData[dzongkhag] = { total: 0, completed: 0 };
        }
        dzongkhagData[dzongkhag].total++;
        if (item.assessment_status === 'Conducted') {
            dzongkhagData[dzongkhag].completed++;
        }
    });

    const data = Object.entries(dzongkhagData)
        .map(([dzongkhag, counts]) => ({
            x: dzongkhag,
            y: Number((counts.completed / counts.total * 100).toFixed(1))
        }))
        .sort((a, b) => b.y - a.y);

    return [{
        name: 'Completion Rate',
        data: data
    }];
});

// Age Distribution Chart
const ageDistributionOptions = {
    chart: {
        type: 'bar',
        toolbar: { show: false }
    },
    plotOptions: {
        bar: {
            borderRadius: 4
        }
    },
    colors: [primaryColor],
    xaxis: {
        title: { text: 'Age Group' }
    },
    yaxis: {
        title: { text: 'Number of Referrals' }
    }
};

const ageDistributionSeries = computed(() => {
    const ageGroups = {
        'Under 10': 0,
        '10-19': 0,
        '20-24': 0,
        '25-60': 0,
        'Over 60': 0
    };

    props.filteredData.forEach(item => {
        const age = calculateAge(item.user?.date_of_birth);
        const group = getAgeGroup(age);
        ageGroups[group]++;
    });

    return [{
        name: 'Referrals',
        data: Object.entries(ageGroups).map(([group, count]) => ({
            x: group,
            y: count
        }))
    }];
});

// Available Referral Sources
const referralSources = computed(() => {
    const sources = new Set(
        props.filteredData
            .map(item => item.user?.active_agency?.agency_name)
            .filter(Boolean)
    );
    return Array.from(sources).map(name => ({
        name,
        code: name
    }));
});

// Handle sorting
function onSort(event) {
    sortField.value = event.sortField;
    sortOrder.value = event.sortOrder;
}
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
</style>