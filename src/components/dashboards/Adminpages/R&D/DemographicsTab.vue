<template>
    <div class="demographics-tab">
        <section>
            <h4 class="section-title">Age Distribution</h4>
            <div class="chart-container">
                <apexchart type="bar" height="350" :options="ageDistributionChartOptions"
                    :series="ageDistributionChartSeries"></apexchart>
            </div>
        </section>

        <section>
            <h4 class="section-title">Gender Distribution</h4>
            <div class="chart-container">
                <apexchart type="pie" height="350" :options="genderDistributionChartOptions"
                    :series="genderDistributionChartSeries"></apexchart>
            </div>
        </section>

        <section>
            <h4 class="section-title">Geographic Distribution</h4>
            <div class="chart-container">
                <!-- You can use a map here if you have the RNDMap component integrated -->
                <!-- <RNDmap :filtered-data="filteredData" /> -->
                <!-- Alternatively, use a bar chart for Dzongkhag distribution -->
                <apexchart type="bar" height="350" :options="dzongkhagDistributionChartOptions"
                    :series="dzongkhagDistributionChartSeries"></apexchart>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
    filteredData: {
        type: Array,
        required: true,
    },
});

const toast = useToast();

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
        categories: [], // Age groups will be populated here
    },
    yaxis: {
        ...commonChartOptions.yaxis,
        title: {
            text: 'Number of Individuals',
            style: { color: primaryColor },
        },
    },
    colors: [primaryColor],
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

    // Ensure all age groups are present with a count of 0 if no data exists
    const allAgeGroups = ['Under 10', '10-19', '20-24', '25-60', 'Over 60'];
    allAgeGroups.forEach(group => {
        if (!ageGroupCounts[group]) {
            ageGroupCounts[group] = 0;
        }
    });

    // Sort age groups
    const sortedAgeGroups = Object.keys(ageGroupCounts).sort((a, b) => {
        const ageA = a === 'Under 10' ? 0 : parseInt(a.split('-')[0]);
        const ageB = b === 'Under 10' ? 0 : parseInt(b.split('-')[0]);
        if (a === 'Over 60') return 1;
        if (b === 'Over 60') return -1;
        return ageA - ageB;
    });

    // Update categories with the sorted age groups
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
    },
    xaxis: {
        ...commonChartOptions.xaxis,
        categories: [], // Dzongkhags will be populated here
    },
    yaxis: {
        ...commonChartOptions.yaxis,
        title: {
            text: 'Number of Individuals',
            style: { color: primaryColor },
        },
    },
    colors: [primaryColor],
});

const dzongkhagDistributionChartSeries = computed(() => {
    const dzongkhagCounts = {};
    props.filteredData.forEach(item => {
        const dzongkhag = item.user?.perm_add_dzongkhag; // Adjust based on your data structure
        if (dzongkhag) {
            dzongkhagCounts[dzongkhag] = (dzongkhagCounts[dzongkhag] || 0) + 1;
        }
    });

    // Update categories with the unique dzongkhags
    dzongkhagDistributionChartOptions.value.xaxis.categories = Object.keys(dzongkhagCounts);

    return [
        {
            name: 'Number of Individuals',
            data: Object.values(dzongkhagCounts),
        },
    ];
});

// Helper functions (make sure these are defined in your component)
function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
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
    if (age > 60) return 'Over 60';
    return null;
}
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
</style>