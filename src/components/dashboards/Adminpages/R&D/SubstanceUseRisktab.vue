<template>
    <div class="substance-use-risk-tab">
        <section>
            <h4 class="section-title">Substance Use Risk Summary by Gender</h4>
            <div class="chart-container">
                <apexchart type="bar" height="450" :options="substanceRiskChartOptions"
                    :series="substanceRiskChartSeries"></apexchart>
            </div>
        </section>
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

// Color configuration
const primaryColor = '#275D67';
const maleColors = {
    none: '#4A8895',
    low: '#6CB3A5',
    moderate: '#8EDDC8',
    severe: '#B0F7EB'
};
const femaleColors = {
    none: '#FF9999',
    low: '#FFB366',
    moderate: '#FFCC99',
    severe: '#FFE5CC'
};

// Chart configuration
const substanceRiskChartOptions = ref({
    chart: {
        type: 'bar',
        stacked: true,
        toolbar: { show: false },
        fontFamily: 'inherit',
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '90%',
            borderRadius: 0,
        },
    },
    dataLabels: {
        enabled: true,
        formatter: function (val) {
            return val || '';
        },
        style: {
            fontSize: '12px',
        }
    },
    xaxis: {
        categories: ['Tobacco', 'Alcohol', 'Cannabis', 'Cocaine', 'Amphetamines',
            'Inhalants', 'Sedatives', 'Hallucinogens', 'Opioids', 'Other'],
        labels: {
            style: { colors: primaryColor },
            rotate: -45,
            trim: true
        }
    },
    yaxis: {
        title: {
            text: 'Number of Individuals',
            style: { color: primaryColor }
        },
        labels: {
            style: { colors: primaryColor },
        }
    },
    legend: {
        position: 'right',
        fontSize: '12px',
        markers: {
            radius: 12,
        },
        itemMargin: {
            vertical: 5
        }
    },
    grid: {
        show: true,
        borderColor: '#e0e0e0',
    },
    theme: {
        mode: 'light'
    },
    colors: [...Object.values(maleColors), ...Object.values(femaleColors)]
});

const substanceRiskChartSeries = computed(() => {
    // Initialize data structure
    const substances = substanceRiskChartOptions.value.xaxis.categories;
    const riskLevels = ['none', 'low', 'moderate', 'severe'];
    let series = [];

    // Create series for male risk levels
    riskLevels.forEach(risk => {
        series.push({
            name: `Male - ${risk.charAt(0).toUpperCase() + risk.slice(1)}`,
            data: new Array(substances.length).fill(0)
        });
    });

    // Create series for female risk levels
    riskLevels.forEach(risk => {
        series.push({
            name: `Female - ${risk.charAt(0).toUpperCase() + risk.slice(1)}`,
            data: new Array(substances.length).fill(0)
        });
    });

    // Process the data
    props.filteredData.forEach(item => {
        const gender = item.user?.gender?.toLowerCase();
        if (!gender || (gender !== 'male' && gender !== 'female')) return;

        const assistData = item.screening_data?.assist_data;
        if (!Array.isArray(assistData)) return;

        assistData.forEach(substance => {
            const substanceName = substance.substance__name.split(' ')[0];
            const substanceIndex = substances.findIndex(s =>
                substanceName.toLowerCase().startsWith(s.toLowerCase())
            );

            if (substanceIndex === -1) return;

            const riskLevel = substance.risk_flag.toLowerCase();
            const riskIndex = riskLevels.indexOf(riskLevel);
            if (riskIndex === -1) return;

            const seriesIndex = gender === 'male' ?
                riskIndex :
                riskLevels.length + riskIndex;

            series[seriesIndex].data[substanceIndex]++;
        });
    });

    return series;
});
</script>

<style scoped>
.substance-use-risk-tab section {
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
</style>