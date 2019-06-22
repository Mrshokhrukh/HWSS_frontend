<template>
    <div class="card">
        <DataTable :value="aggregateData" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xl font-bold">Aggregates</span>
                </div>
            </template>
            <Column field="field" header="Field"></Column>
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
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const reportData = ref(JSON.parse(sessionStorage.getItem('reportData')) || []);

// Rescreening Count
const Rescreening_filter = ref(reportData.value.filter(item => item.rescreened === false));
const Rescreening_count = ref(Rescreening_filter.value.length);

// Counseling - Waiting List
const WaitingList_Count = ref(reportData.value.filter(item => item.service_and_treatment?.counseling === 'Waiting List').length);

// Counseling - Not Required
const NotRequired_Count = ref(reportData.value.filter(item => item.service_and_treatment?.counseling === 'Not Required').length);

// Counseling - Availed
const Availed_Count = ref(reportData.value.filter(item => item.service_and_treatment?.counseling === 'Availed').length);

// Assessment - Conducted
const Conducted_Count = ref(reportData.value.filter(item => item.service_and_treatment?.assessment_status === 'Conducted').length);



// Assessment - Not Conducted
const NotConducted_Count = ref(reportData.value.filter(item => item.service_and_treatment?.assessment_status === 'Not Conducted').length);
const FollowUp_Counts = ref({
    'Treatment completed': reportData.value.filter(item => item.service_and_treatment?.follow_up === 'Treatment completed').length,
    'Undergoing treatment': reportData.value.filter(item => item.followUp === 'Undergoing treatment').length,
    'Completed counselling sessions': reportData.value.filter(item => item.followUp === 'Completed counselling sessions').length,
    'Undergoing counselling': reportData.value.filter(item => item.followUp === 'Undergoing counselling').length,
    'Unwilling to undergo treatment': reportData.value.filter(item => item.followUp === 'Unwilling to undergo treatment').length,
    'Undergone Rehabilitation': reportData.value.filter(item => item.followUp === 'Undergone Rehabilitation').length,
    'Undergoing Rehabilitation': reportData.value.filter(item => item.followUp === 'Undergoing Rehabilitation').length,
    'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)': reportData.value.filter(item => item.followUp === 'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)').length,
    'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)': reportData.value.filter(item => item.followUp === 'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)').length,
    'School-based SUD Treatment and Care': reportData.value.filter(item => item.followUp === 'School-based SUD Treatment and Care').length,
    'Institution-based SUD Treatment and Care': reportData.value.filter(item => item.followUp === 'Institution-based SUD Treatment and Care').length,
    'Follow up Drug Test Conducted': reportData.value.filter(item => item.followUp === 'Follow up Drug Test Conducted').length,
    'Detention-based SUD Treatment and Care': reportData.value.filter(item => item.followUp === 'Detention-based SUD Treatment and Care').length,
});


// Case Status Counts
const Open_Case_Count = ref(reportData.value.filter(item => item.caseStatus === 'Open').length);
const Closed_Case_Count = ref(reportData.value.filter(item => item.caseStatus === 'Closed').length);

const aggregateData = ref([
    { field: 'RESCREENING COUNT', count: `Total: ${Rescreening_count.value}` },
    {
        field: 'Counseling',
        count: [
            { key: 'Waiting List', count: WaitingList_Count.value },
            { key: 'Not Required', count: NotRequired_Count.value },
            { key: 'Availed', count: Availed_Count.value }
        ]
    },
    {
        field: 'ASSESSMENT',
        count: [
            { key: 'Conducted', count: Conducted_Count.value },
            { key: 'Not Conducted', count: NotConducted_Count.value }
        ]
    },
    {
        field: 'REFERRAL',
        count: [
            { key: 'Referred', count: Open_Case_Count.value },
            { key: 'Not Referred', count: Closed_Case_Count.value }
        ]
    },
    {
        field: 'FOLLOW-UP',
        count: Object.keys(FollowUp_Counts.value).map(key => ({ key, count: FollowUp_Counts.value[key] }))
    }
]);

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
    border: 1px solid #000;
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
