<template>
    <div class="card">
        <DataTable :value="aggregateData" class="p-datatable-sm" responsiveLayout="scroll" :scrollable="true" scrollHeight="400px" scrollDirection="both">
            <template #header>
                <div class="text-xl font-bold p-3">Aggregates</div>
            </template>
            <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" :style="{ width: '250px' }">
                <template #body="slotProps">
                    <template v-if="Array.isArray(slotProps.data[col.field])">
                        <div v-for="(item, index) in slotProps.data[col.field]" :key="index" class="data-row">
                            {{ item.key }}: {{ item.count }}
                        </div>
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

const props = defineProps({
    reportData: {
        type: Array,
        required: true
    }
});

const columns = ref([
    { field: 'rescreening', header: 'Rescreening' },
    { field: 'counseling', header: 'Counseling' },
    { field: 'assessment', header: 'Assessment' },
    { field: 'referral', header: 'Referral' },
    { field: 'followUp', header: 'Follow-Up' },
]);

const aggregateData = computed(() => {
    const counts = {
        rescreening: { Rescreened: 0, 'Not Rescreened': 0 },
        counseling: {},
        assessment: {},
        referral: {},
        followUp: {}
    };

    props.reportData.forEach(item => {
        counts.rescreening[item.Rescreened ? 'Rescreened' : 'Not Rescreened']++;
        const counseling = item.service.counseling_measurement;
        counts.counseling[counseling] = (counts.counseling[counseling] || 0) + 1;
        const assessment = item.service.assessment_measurement;
        counts.assessment[assessment] = (counts.assessment[assessment] || 0) + 1;
        const referral = item.service.referral_measurement;
        counts.referral[referral] = (counts.referral[referral] || 0) + 1;
        const followUp = item.service.follow_up_measurement;
        counts.followUp[followUp] = (counts.followUp[followUp] || 0) + 1;
    });

    return [{
        rescreening: Object.entries(counts.rescreening).map(([key, count]) => ({ key, count })),
        counseling: Object.entries(counts.counseling).map(([key, count]) => ({ key, count })),
        assessment: Object.entries(counts.assessment).map(([key, count]) => ({ key, count })),
        referral: Object.entries(counts.referral).map(([key, count]) => ({ key, count })),
        followUp: Object.entries(counts.followUp).map(([key, count]) => ({ key, count }))
    }];
});
</script>

<style scoped>
.card {
    margin-top: 20px;
    width: 100%;
}
:deep(.p-datatable) {
    width: 100%;
}
:deep(.p-datatable-wrapper) {
    overflow: auto;
}
:deep(.p-datatable-table) {
    min-width: 100%;
}
:deep(.p-datatable-thead > tr > th) {
    background-color: #4caf50;
    color: white;
    font-weight: bold;
    text-align: center;
    border: 1px solid #e0e0e0;
    padding: 1rem;
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 1;
}
:deep(.p-datatable-tbody > tr > td) {
    text-align: left;
    border: 1px solid #e0e0e0;
    padding: 0.75rem;
    vertical-align: top;
    white-space: nowrap;
}
:deep(.p-datatable-tbody > tr) {
    border-bottom: 1px solid #e0e0e0;
}
:deep(.p-datatable-tbody > tr:nth-child(even)) {
    background-color: #f5f5f5;
}
.data-row {
    white-space: nowrap;
}
</style>