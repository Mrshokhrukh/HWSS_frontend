<template>
    <div class="dashboard">
        <div class="row g-4 mt-4 d-flex align-items-stretch">
            <!-- Referral Sources Chart -->
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Top Referral Sources</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="bar" height="350" :options="referralSourceChartOptions"
                            :series="referralSourceChartSeries" />
                    </div>
                </div>
            </div>

            <!-- Completion Rate Chart -->
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Assessment Completion Rate Over Time</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="line" height="350" :options="completionRateChartOptions"
                            :series="completionRateChartSeries" />
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-4 mt-4 d-flex align-items-stretch">
            <!-- PHQ-9 Distribution -->
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                        <h5 class="card-title mb-0">PHQ-9 Severity Distribution</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="bar" height="350" :options="phq9ChartOptions" :series="phq9ChartSeries" />
                    </div>
                </div>
            </div>

            <!-- GAD-7 Distribution -->
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                        <h5 class="card-title mb-0">GAD-7 Severity Distribution</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="bar" height="350" :options="gad7ChartOptions" :series="gad7ChartSeries" />
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-4 mt-4 d-flex align-items-stretch">
            <!-- Substance Use Risk -->
            <div class="col-md-12 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Substance Use Risk Summary</h5>
                    </div>
                    <div class="card-body">
                        <apexchart type="bar" height="350" :options="substanceRiskChartOptions"
                            :series="substanceRiskChartSeries" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    filteredData: {
        type: Array,
        required: true,
    },
});

// Constants
const COLORS = {
    primary: '#275D67',
    secondary: '#A3CDB8',
    accent: ['#4A8895', '#6CB3A5', '#8EDDC8', '#ff9999'],
};

const SEVERITY_LEVELS = {
    PHQ9: ['Minimal', 'Mild', 'Moderate', 'Moderately Severe', 'Severe'],
    GAD7: ['Minimal', 'Mild', 'Moderate', 'Severe']
};

// Utility Functions
const safeJSONParse = (data) => {
    if (!data) return null;
    if (typeof data === 'object') return data;
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error('Error parsing JSON:', e);
        return null;
    }
};

const getMentalHealthData = (item) => {
    const screeningData = item.screening_data;

    // Handle string "Data not available" case
    if (screeningData === "Data not available") return null;

    // If it's a string, try to parse it
    if (typeof screeningData === 'string') {
        return safeJSONParse(screeningData);
    }

    return screeningData;
};

const getSubstanceData = (item) => {
    const eventData = item.event_substance_risks;
    const caseData = item.case_substance_risks;

    // If only one exists, return that
    if (!eventData && !caseData) return null;
    if (!eventData) return caseData;
    if (!caseData) return eventData;

    // If both exist, compare dates and use latest
    const eventDate = new Date(eventData[0]?.created_at || 0);
    const caseDate = new Date(caseData[0]?.created_at || 0);
    return eventDate > caseDate ? eventData : caseData;
};

const standardizeInterpretation = (interpretation) => {
    if (!interpretation) return null;
    interpretation = interpretation.toLowerCase();

    // Handle special cases
    if (interpretation === 'none or minimal') return 'Minimal';
    if (interpretation === 'moderately severe') return 'Moderately Severe';

    // Capitalize first letter
    return interpretation.charAt(0).toUpperCase() + interpretation.slice(1);
};

// Common Chart Options
const commonChartOptions = {
    chart: {
        toolbar: { show: false },
        fontFamily: 'inherit',
    },
    dataLabels: { enabled: false },
    xaxis: {
        labels: { style: { colors: COLORS.primary } },
    },
    yaxis: {
        labels: { style: { colors: COLORS.primary } },
    },
    grid: { show: true, borderColor: '#e0e0e0' },
    theme: { mode: 'light' },
};

// Referral Sources Chart
const referralSourceChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar',
    },
    plotOptions: {
        bar: {
            horizontal: true,
            dataLabels: { position: 'top' },
        },
    },
    colors: [COLORS.primary],
    dataLabels: {
        enabled: true,
        offsetX: -6,
        style: {
            fontSize: '12px',
            colors: ['#fff'],
        },
    },
});

const referralSourceChartSeries = computed(() => {
    const validData = props.filteredData.filter(item =>
        item?.user?.active_agency?.agency_name
    );

    const referralCounts = {};
    validData.forEach(item => {
        const agency = item.user.active_agency.agency_name;
        referralCounts[agency] = (referralCounts[agency] || 0) + 1;
    });

    const sortedAgencies = Object.entries(referralCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5);

    return [{
        name: 'Referrals',
        data: sortedAgencies.map(([agency, count]) => ({
            x: agency,
            y: count
        }))
    }];
});

// Completion Rate Chart
const completionRateChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'line',
    },
    xaxis: {
        type: 'datetime',
        title: {
            text: 'Date',
            style: { color: COLORS.primary },
        },
    },
    yaxis: {
        title: {
            text: 'Completion Rate (%)',
            style: { color: COLORS.primary },
        },
        max: 100,
    },
    colors: [COLORS.primary],
    stroke: {
        width: 3,
        curve: 'smooth',
    },
    markers: {
        size: 4,
        colors: [COLORS.primary],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: { size: 7 },
    },
});

const completionRateChartSeries = computed(() => {
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

    const seriesData = Object.entries(monthlyData)
        .map(([month, data]) => ({
            x: new Date(month).getTime(),
            y: Number(((data.completed / data.total) * 100).toFixed(1))
        }))
        .sort((a, b) => a.x - b.x);

    return [{
        name: 'Completion Rate',
        data: seriesData
    }];
});

// PHQ-9 Chart
const phq9ChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar',
        stacked: false
    },
    xaxis: {
        categories: SEVERITY_LEVELS.PHQ9
    },
    colors: [COLORS.primary, COLORS.secondary],
    legend: {
        position: 'bottom',
        labels: { colors: COLORS.primary }
    }
});

const phq9ChartSeries = computed(() => {
    const counts = {
        Male: Object.fromEntries(SEVERITY_LEVELS.PHQ9.map(level => [level, 0])),
        Female: Object.fromEntries(SEVERITY_LEVELS.PHQ9.map(level => [level, 0]))
    };

    props.filteredData.forEach(item => {
        const mentalHealthData = getMentalHealthData(item);
        if (!mentalHealthData) return;

        const gender = item.user?.gender?.toLowerCase() === 'male' ? 'Male' : 'Female';
        const interpretation = standardizeInterpretation(mentalHealthData.phq_interpretation);

        if (interpretation && counts[gender][interpretation] !== undefined) {
            counts[gender][interpretation]++;
        }
    });

    return [
        {
            name: 'Male',
            data: SEVERITY_LEVELS.PHQ9.map(level => counts.Male[level])
        },
        {
            name: 'Female',
            data: SEVERITY_LEVELS.PHQ9.map(level => counts.Female[level])
        }
    ];
});

// GAD-7 Chart
const gad7ChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar',
        stacked: false
    },
    xaxis: {
        categories: SEVERITY_LEVELS.GAD7
    },
    colors: [COLORS.primary, COLORS.secondary],
    legend: {
        position: 'bottom',
        labels: { colors: COLORS.primary }
    }
});

const gad7ChartSeries = computed(() => {
    const counts = {
        Male: Object.fromEntries(SEVERITY_LEVELS.GAD7.map(level => [level, 0])),
        Female: Object.fromEntries(SEVERITY_LEVELS.GAD7.map(level => [level, 0]))
    };

    props.filteredData.forEach(item => {
        const mentalHealthData = getMentalHealthData(item);
        if (!mentalHealthData) return;

        const gender = item.user?.gender?.toLowerCase() === 'male' ? 'Male' : 'Female';
        const interpretation = standardizeInterpretation(mentalHealthData.gad_interpretation);

        if (interpretation && counts[gender][interpretation] !== undefined) {
            counts[gender][interpretation]++;
        }
    });

    return [
        {
            name: 'Male',
            data: SEVERITY_LEVELS.GAD7.map(level => counts.Male[level])
        },
        {
            name: 'Female',
            data: SEVERITY_LEVELS.GAD7.map(level => counts.Female[level])
        }
    ];
});

// Substance Use Risk Chart
const substanceRiskChartOptions = ref({
    ...commonChartOptions,
    chart: {
        ...commonChartOptions.chart,
        type: 'bar',
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
        },
    },
    xaxis: {
        categories: ['Tobacco', 'Alcohol', 'Cannabis', 'Cocaine', 'Amphetamines',
            'Inhalants', 'Sedatives', 'Hallucinogens', 'Opioids', 'Other'],
    },
    colors: COLORS.accent,
    legend: { show: true },
});

const substanceRiskChartSeries = computed(() => {
    const riskLevels = ['none', 'low', 'moderate', 'severe'];
    const substances = substanceRiskChartOptions.value.xaxis.categories;

    // Initialize counts
    const riskCounts = {};
    substances.forEach(substance => {
        riskCounts[substance] = Object.fromEntries(riskLevels.map(level => [level, 0]));
    });

    // Map substance names from the data to chart categories
    const substanceNameMap = {
        'Tobacco': 'Tobacco',
        'Alcoholic': 'Alcohol',
        'Cannabis': 'Cannabis',
        'Cocaine': 'Cocaine',
        'Amphetamine-type': 'Amphetamines',
        'Inhalants': 'Inhalants',
        'Sedatives': 'Sedatives',
        'Hallucinogens': 'Hallucinogens',
        'Opioids': 'Opioids',
        'Other': 'Other',
        // 'Any': 'Other'
    };

    props.filteredData.forEach(item => {
        const substanceData = getSubstanceData(item);
        if (!substanceData) return;

        substanceData.forEach(substance => {
            // Extract first word of substance name
            const firstWord = substance.substance_name.split(' ')[0];
            // Map to correct category name
            const categoryName = substanceNameMap[firstWord] || firstWord;
            const riskFlag = substance.risk_flag.toLowerCase().split(' ')[0];

            if (riskCounts[categoryName] && riskLevels.includes(riskFlag)) {
                riskCounts[categoryName][riskFlag]++;
            }
        });
    });

    return riskLevels.map(level => ({
        name: level.charAt(0).toUpperCase() + level.slice(1),
        data: substances.map(substance => riskCounts[substance][level])
    }));
});
</script>

<style scoped>
.dashboard {
    font-family: 'Arial', sans-serif;
    background-color: #f8f9fa;
    padding: 2rem;
}

.card {
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    border: none;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.card-header {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    border-bottom: none;
    padding: 1rem;
    border-radius: 15px 15px 0 0;
}

.card-header h5 {
    color: #ffffff;
    font-weight: bold;
    text-align: center;
    font-size: 1.2rem;
    margin: 0;
}

.card-body {
    padding: 1.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .card-header h5 {
        font-size: 1rem;
    }
}
</style>