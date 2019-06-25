<template>
    <div class="">
        <DataTable :value="aggregateData" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xl font-bold">Aggregates</span>
                </div>
            </template>
            <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header">
                <template #body="slotProps">
                    <template v-if="Array.isArray(slotProps.data[col.field])">
                        <ul>
                            <li v-for="(item, index) in slotProps.data[col.field]" :key="index">
                                {{ item.key }}: {{ item.count }}
                            </li>
                        </ul>
                    </template>
                    <template v-else>
                        {{ slotProps.data[col.field] }}
                    </template>
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

// Existing count calculations...
const Rescreening_count = ref(reportData.value.filter(item => item.rescreened === false).length);
const WaitingList_Count = ref(reportData.value.filter(item => item.service_and_treatment?.counseling === 'Waiting List').length);
const NotRequired_Count = ref(reportData.value.filter(item => item.service_and_treatment?.counseling === 'Not Required').length);
const Availed_Count = ref(reportData.value.filter(item => item.service_and_treatment?.counseling === 'Availed').length);
const Conducted_Count = ref(reportData.value.filter(item => item.service_and_treatment?.assessment_status === 'Conducted').length);
const NotConducted_Count = ref(reportData.value.filter(item => item.service_and_treatment?.assessment_status === 'Not Conducted').length);
const Open_Case_Count = ref(reportData.value.filter(item => item.caseStatus === 'Open').length);
const Closed_Case_Count = ref(reportData.value.filter(item => item.caseStatus === 'Closed').length);

const FollowUp_Counts = computed(() => {
    const counts = {
        'Treatment completed': 0,
        'Undergoing treatment': 0,
        'Completed counselling sessions': 0,
        'Undergoing counselling': 0,
        'Unwilling to undergo treatment': 0,
        'Undergone Rehabilitation': 0,
        'Undergoing Rehabilitation': 0,
        'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)': 0,
        'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)': 0,
        'School-based SUD Treatment and Care': 0,
        'Institution-based SUD Treatment and Care': 0,
        'Follow up Drug Test Conducted': 0,
        'Detention-based SUD Treatment and Care': 0,
    };
    
    reportData.value.forEach(item => {
        if (item.followUp in counts) {
            counts[item.followUp]++;
        }
    });
    
    return Object.entries(counts).map(([key, count]) => ({ key, count }));
});

const columns = ref([
    // { field: 'category', header: 'Category' },
    { field: 'rescreening', header: 'Rescreening' },
    { field: 'counseling', header: 'Counseling' },
    { field: 'assessment', header: 'Assessment' },
    { field: 'referral', header: 'Referral' },
    { field: 'followUp', header: 'Follow-Up' },
]);

const aggregateData = computed(() => [
    {
        // category: 'Counts',
        rescreening: `Total: ${Rescreening_count.value}`,
        counseling: [
            { key: 'Waiting List', count: WaitingList_Count.value },
            { key: 'Not Required', count: NotRequired_Count.value },
            { key: 'Availed', count: Availed_Count.value }
        ],
        assessment: [
            { key: 'Conducted', count: Conducted_Count.value },
            { key: 'Not Conducted', count: NotConducted_Count.value }
        ],
        referral: [
            { key: 'Referred', count: Open_Case_Count.value },
            { key: 'Not Referred', count: Closed_Case_Count.value }
        ],
        followUp: FollowUp_Counts.value
    }
]);
</script>

<style scoped>
.card {
    margin-top: 20px;
}

:deep(.p-datatable) {
    font-size: 0.9rem;
}

:deep(.p-datatable-header) {
    background-color: #f8f9fa;
    font-weight: bold;
}

:deep(.p-datatable-thead > tr > th) {
    background-color: #4caf50;
    color: white;
    font-weight: bold;
    text-align: center;
}

:deep(.p-datatable-tbody > tr > td) {
    text-align: center;
}

ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    text-align: left;
}

li {
    margin-bottom: 4px;
}
</style>