<template>
  <div>
    <DataTable :value="aggregateData" class="p-4" v-if="props.filteredData">
      <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header">
        <template #body="slotProps">
          <template v-if="Array.isArray(slotProps.data[col.field])">
            <ul class="list-none p-0">
              <li v-for="(item, index) in slotProps.data[col.field]" :key="index" class="mb-2">
                {{ item.key }}: <span class="font-bold">{{ item.count }}</span>
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
import { ref, computed, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

onMounted(() => {
  console.log('Table Component Received Data:', props.filteredData);
});

// Helper function to safely count data
const countData = (data, field, value) => {
  return data.filter(item => item[field] === value).length;
};

// Computed properties for counts
const serviceCounts = computed(() => {
  if (!props.filteredData) return {};

  return {
    // Screening count
    screening: {
      screened: props.filteredData.filter(item =>
        item.screening_data && item.screening_data !== "Data not available"
      ).length,
      notScreened: props.filteredData.filter(item =>
        !item.screening_data || item.screening_data === "Data not available"
      ).length
    },

    // Counseling counts
    counseling: {
      waitingList: countData(props.filteredData, 'counseling', 'Waiting List'),
      notRequired: countData(props.filteredData, 'counseling', 'Not Required'),
      availed: countData(props.filteredData, 'counseling', 'Availed')
    },

    // Assessment counts
    assessment: {
      conducted: countData(props.filteredData, 'assessment_status', 'Conducted'),
      notConducted: countData(props.filteredData, 'assessment_status', 'Not Conducted')
    },

    // Referral counts
    referral: {
      referred: countData(props.filteredData, 'referred', 'Referred'),
      notReferred: countData(props.filteredData, 'referred', 'Not Referred')
    },

    // Follow-up counts
    followUp: {
      treatmentCompleted: countData(props.filteredData, 'follow_up', 'Treatment Completed'),
      undergoingTreatment: countData(props.filteredData, 'follow_up', 'Undergoing treatment'),
      completedCounselling: countData(props.filteredData, 'follow_up', 'Completed counselling sessions'),
      undergoingCounselling: countData(props.filteredData, 'follow_up', 'Undergoing counselling'),
      unwillingToTreat: countData(props.filteredData, 'follow_up', 'Unwilling to undergo treatment'),
      undergoneRehab: countData(props.filteredData, 'follow_up', 'Undergone Rehabilitation'),
      undergoingRehab: countData(props.filteredData, 'follow_up', 'Undergoing Rehabilitation'),
      hospitalOutpatientPrimary: countData(props.filteredData, 'follow_up', 'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)'),
      hospitalOutpatientContinuing: countData(props.filteredData, 'follow_up', 'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)'),
      schoolBased: countData(props.filteredData, 'follow_up', 'School-based SUD Treatment and Care'),
      institutionBased: countData(props.filteredData, 'follow_up', 'Institution-based SUD Treatment and Care'),
      followupDrugTest: countData(props.filteredData, 'follow_up', 'Follow up Drug Test Conducted'),
      detentionBased: countData(props.filteredData, 'follow_up', 'Detention-based SUD Treatment and Care')
    }
  };
});

const columns = ref([
  { field: 'screening', header: 'Screening' },
  { field: 'counseling', header: 'Counseling' },
  { field: 'assessment', header: 'Assessment' },
  { field: 'referral', header: 'Referral' },
  { field: 'followUp', header: 'Follow-Up' },
]);

const aggregateData = computed(() => {
  if (!serviceCounts.value) return [];

  return [{
    screening: [
      { key: 'Screened', count: serviceCounts.value.screening?.screened || 0 },
      { key: 'Not Screened', count: serviceCounts.value.screening?.notScreened || 0 }
    ],
    counseling: [
      { key: 'Waiting List', count: serviceCounts.value.counseling?.waitingList || 0 },
      { key: 'Not Required', count: serviceCounts.value.counseling?.notRequired || 0 },
      { key: 'Availed', count: serviceCounts.value.counseling?.availed || 0 }
    ],
    assessment: [
      { key: 'Conducted', count: serviceCounts.value.assessment?.conducted || 0 },
      { key: 'Not Conducted', count: serviceCounts.value.assessment?.notConducted || 0 }
    ],
    referral: [
      { key: 'Referred', count: serviceCounts.value.referral?.referred || 0 },
      { key: 'Not Referred', count: serviceCounts.value.referral?.notReferred || 0 }
    ],
    followUp: [
      { key: 'Treatment completed', count: serviceCounts.value.followUp?.treatmentCompleted || 0 },
      { key: 'Undergoing treatment', count: serviceCounts.value.followUp?.undergoingTreatment || 0 },
      { key: 'Completed counselling sessions', count: serviceCounts.value.followUp?.completedCounselling || 0 },
      { key: 'Undergoing counselling', count: serviceCounts.value.followUp?.undergoingCounselling || 0 },
      { key: 'Unwilling to undergo treatment', count: serviceCounts.value.followUp?.unwillingToTreat || 0 },
      { key: 'Undergone Rehabilitation', count: serviceCounts.value.followUp?.undergoneRehab || 0 },
      { key: 'Undergoing Rehabilitation', count: serviceCounts.value.followUp?.undergoingRehab || 0 },
      { key: 'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)', count: serviceCounts.value.followUp?.hospitalOutpatientPrimary || 0 },
      { key: 'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)', count: serviceCounts.value.followUp?.hospitalOutpatientContinuing || 0 },
      { key: 'School-based SUD Treatment and Care', count: serviceCounts.value.followUp?.schoolBased || 0 },
      { key: 'Institution-based SUD Treatment and Care', count: serviceCounts.value.followUp?.institutionBased || 0 },
      { key: 'Follow up Drug Test Conducted', count: serviceCounts.value.followUp?.followupDrugTest || 0 },
      { key: 'Detention-based SUD Treatment and Care', count: serviceCounts.value.followUp?.detentionBased || 0 }
    ]
  }];
});
</script>

<style scoped>
.p-datatable {
  width: 100%;
}

:deep(.p-datatable-thead > tr > th) {
  background-color: #2C6975 !important;
  color: white !important;
  padding: 1rem;
  text-align: center;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 1rem;
  border: 1px solid #dee2e6;
}

.font-bold {
  font-weight: 600;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mb-2:last-child {
  margin-bottom: 0;
}
</style>