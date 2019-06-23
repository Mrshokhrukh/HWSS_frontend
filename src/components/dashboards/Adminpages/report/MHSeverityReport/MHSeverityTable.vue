<template>
    <div class="card">
        <!-- Severity Report: Mental Health Data Table -->
        <DataTable :value="mentalHealthData" showGridlines tableStyle="min-width: 50rem" rowGroupMode="rowspan"
            groupRowsBy="field">
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xl font-bold">Severity Report: Mental Health Data</span>
                </div>
            </template>
            <Column field="field" header="Field"></Column>
            <Column header="Severity">
                <template #body="slotProps">
                    <span>{{ slotProps.data.severity }}</span>
                </template>
            </Column>
            <Column header="Count">
                <template #body="slotProps">
                    <span v-if="typeof slotProps.data.count === 'string'">{{ slotProps.data.count }}</span>
                    <ul v-else>
                        <li v-for="(item, index) in slotProps.data.count" :key="index">
                            {{ item.key }}: {{ item.count }}
                        </li>
                    </ul>
                </template>
            </Column>
        </DataTable>

        <!-- Severity Report: Substance Use Data Table -->
        <DataTable :value="substanceUseData" showGridlines tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xl font-bold">Severity Report: Substance Use Data</span>
                </div>
            </template>
            <Column field="field" header="Field"></Column>
            <Column header="Severity">
                <template #body="slotProps">
                    <span>{{ slotProps.data.severity }}</span>
                </template>
            </Column>
            <Column header="Count">
                <template #body="slotProps">
                    <span v-if="typeof slotProps.data.count === 'string'">{{ slotProps.data.count }}</span>
                    <ul v-else>
                        <li v-for="(item, index) in slotProps.data.count" :key="index">
                            {{ item.key }}: {{ item.count }}
                        </li>
                    </ul>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const reportData = ref(JSON.parse(sessionStorage.getItem('reportData')) || []);

// Function to filter data by category and severity
const filterData = (type, level) => {
    return reportData.value.filter(item => {
        return item.measurement?.fields[`${type}_measurement`] === level;
    }).length;
};

// Computed properties for mental health severity counts
const gadCounts = {
    severe: filterData('gad', 'severe'),
    minimal: filterData('gad', 'minimal'),
    moderate: filterData('gad', 'moderate'),
    mild: filterData('gad', 'mild'),
};

const phqCounts = {
    severe: filterData('phq', 'severe'),
    minimal: filterData('phq', 'minimal'),
    moderate: filterData('phq', 'moderate'),
    moderately_severe: filterData('phq', 'moderately severe'),
    mild: filterData('phq', 'mild'),
};

const aceCounts = {
    high_risk: filterData('ace', 'high risk'),
    intermediate_risk: filterData('ace', 'intermediate risk'),
    low_risk: filterData('ace', 'low risk'),
};

const suicidalCounts = {
    nearlyeveryday: filterData('suicidal', 'nearly everyday'),
    more_than_half_the_days: filterData('suicidal', 'more than half the days'),
    several_days: filterData('suicidal', 'several days'),
};

// Computed properties for substance use severity counts
const LifetimeUse_Count = computed(() => ({
    count: filterData('substance_use', 'Lifetime Use'),
    severity: 'Lifetime Use'
}));
const CurrentUse_Count = computed(() => ({
    count: filterData('substance_use', 'Current Use'),
    severity: 'Current Use'
}));
const SubstanceWise_Count = computed(() => ({
    count: filterData('substance_use', 'Substance Wise'),
    severity: 'Substance Wise'
}));

// Aggregate data for Mental Health Data DataTable
const mentalHealthData = ref([
    { field: 'Depression', severity: 'Severe', count: gadCounts.severe },
    { field: 'Depression', severity: 'Minimal', count: gadCounts.minimal },
    { field: 'Depression', severity: 'Moderate', count: gadCounts.moderate },
    { field: 'Depression', severity: 'Mild', count: gadCounts.mild },
    { field: 'Anxiety', severity: 'Severe', count: phqCounts.severe },
    { field: 'Anxiety', severity: 'Minimal', count: phqCounts.minimal },
    { field: 'Anxiety', severity: 'Moderate', count: phqCounts.moderate },
    { field: 'Anxiety', severity: 'Moderately Severe', count: phqCounts.moderately_severe },
    { field: 'Anxiety', severity: 'Mild', count: phqCounts.mild },
    { field: 'ACE', severity: 'High Risk', count: aceCounts.high_risk },
    { field: 'ACE', severity: 'Intermediate Risk', count: aceCounts.intermediate_risk },
    { field: 'ACE', severity: 'Low Risk', count: aceCounts.low_risk },
    { field: 'Suicidal Behaviours', severity: 'Nearly Everyday', count: suicidalCounts.nearlyeveryday },
    { field: 'Suicidal Behaviours', severity: 'More than Half the Days', count: suicidalCounts.more_than_half_the_days },
    { field: 'Suicidal Behaviours', severity: 'Several Days', count: suicidalCounts.several_days },
].reduce((acc, cur) => {
    const existingItem = acc.find(item => item.field === cur.field && item.severity === cur.severity);
    if (existingItem) {
        existingItem.count += cur.count;
    } else {
        acc.push(cur);
    }
    return acc;
}, []));

// Aggregate data for Substance Use Data DataTable
const substanceUseData = ref([
    { field: 'Lifetime Use', severity: 'Lifetime Use', count: LifetimeUse_Count.value.count },
    { field: 'Current Use', severity: 'Current Use', count: CurrentUse_Count.value.count },
    { field: 'Substance Wise', severity: 'Substance Wise', count: SubstanceWise_Count.value.count }
].reduce((acc, cur) => {
    const existingItem = acc.find(item => item.field === cur.field && item.severity === cur.severity);
    if (existingItem) {
        existingItem.count += cur.count;
    } else {
        acc.push(cur);
    }
    return acc;
}, []));
</script>

<style scoped>
.card {
    margin-top: 20px;
}

.card table {
    width: 100%;
    border-collapse: collapse;
}

.card th,
.card td {
    border: 2px solid #000;
    padding: 8px;
    text-align: left;
}

.card th {
    background-color: hsl(107, 63%, 52%);
}

.card ul {
    list-style-type: none;
    padding: 0;
}

.card li {
    margin-bottom: 4px;
}
</style>
