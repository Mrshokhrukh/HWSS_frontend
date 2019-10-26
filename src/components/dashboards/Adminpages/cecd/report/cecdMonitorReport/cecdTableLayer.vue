<template>
  <div>
    <DataTable :value="aggregateData">
      <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header">
        <template #body="slotProps">
          <template v-if="Array.isArray(slotProps.data[col.field])">
            <ul>
              <li v-for="(item, index) in slotProps.data[col.field]" :key="index">
                {{ item.key }}: <span class="bold-count">{{ item.count }}</span>
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

const props = defineProps({
  filteredData: {
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

// Helper function to check if screening data is valid
const hasValidScreeningData = (item) => {
  return item?.screening_data &&
    typeof item.screening_data === 'object' &&
    item.screening_data !== "Data not available";
};

// Computed counts based on filtered data
const counts = computed(() => {
  const validData = props.filteredData.filter(hasValidScreeningData);

  return {
    rescreening: validData.filter(item =>
      item.screening_data?.rescreened === false ||
      (typeof item.screening_data?.rescreening_count === 'number' &&
        item.screening_data.rescreening_count === 0)
    ).length,

    counseling: {
      waitingList: validData.filter(item =>
        item.counseling === 'Waiting List'
      ).length,
      notRequired: validData.filter(item =>
        item.counseling === 'Not Required'
      ).length,
      availed: validData.filter(item =>
        item.counseling === 'Availed'
      ).length
    },

    assessment: {
      conducted: validData.filter(item =>
        item.assessment_status === 'Conducted'
      ).length,
      notConducted: validData.filter(item =>
        item.assessment_status === 'Not Conducted'
      ).length
    },

    referral: {
      referred: validData.filter(item =>
        item.referred === 'Referred'
      ).length,
      notReferred: validData.filter(item =>
        item.referred === 'Not Referred'
      ).length
    },

    followUp: {
      treatmentCompleted: validData.filter(item =>
        item.follow_up === 'Treatment Completed'
      ).length,
      undergoingTreatment: validData.filter(item =>
        item.follow_up === 'Undergoing treatment'
      ).length,
      completedCounselling: validData.filter(item =>
        item.follow_up === 'Completed counselling sessions'
      ).length,
      undergoingCounselling: validData.filter(item =>
        item.follow_up === 'Undergoing counselling'
      ).length,
      unwillingToUndergoTreatment: validData.filter(item =>
        item.follow_up === 'Unwilling to undergo treatment'
      ).length,
      undergoneRehabilitation: validData.filter(item =>
        item.follow_up === 'Undergone Rehabilitation'
      ).length,
      undergoingRehabilitation: validData.filter(item =>
        item.follow_up === 'Undergoing Rehabilitation'
      ).length,
      hospitalBasedPrimary: validData.filter(item =>
        item.follow_up === 'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)'
      ).length,
      hospitalBasedContinuing: validData.filter(item =>
        item.follow_up === 'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)'
      ).length,
      schoolBased: validData.filter(item =>
        item.follow_up === 'School-based SUD Treatment and Care'
      ).length,
      institutionBased: validData.filter(item =>
        item.follow_up === 'Institution-based SUD Treatment and Care'
      ).length,
      followUpTest: validData.filter(item =>
        item.follow_up === 'Follow up Drug Test Conducted'
      ).length,
      detentionBased: validData.filter(item =>
        item.follow_up === 'Detention-based SUD Treatment and Care'
      ).length
    }
  };
});

const aggregateData = computed(() => [
  {
    rescreening: `Total: ${counts.value.rescreening}`,
    counseling: [
      { key: 'Waiting List', count: counts.value.counseling.waitingList },
      { key: 'Not Required', count: counts.value.counseling.notRequired },
      { key: 'Availed', count: counts.value.counseling.availed }
    ],
    assessment: [
      { key: 'Conducted', count: counts.value.assessment.conducted },
      { key: 'Not Conducted', count: counts.value.assessment.notConducted }
    ],
    referral: [
      { key: 'Referred', count: counts.value.referral.referred },
      { key: 'Not Referred', count: counts.value.referral.notReferred }
    ],
    followUp: [
      { key: 'Treatment Completed', count: counts.value.followUp.treatmentCompleted },
      { key: 'Undergoing treatment', count: counts.value.followUp.undergoingTreatment },
      { key: 'Completed counselling sessions', count: counts.value.followUp.completedCounselling },
      { key: 'Undergoing counselling', count: counts.value.followUp.undergoingCounselling },
      { key: 'Unwilling to undergo treatment', count: counts.value.followUp.unwillingToUndergoTreatment },
      { key: 'Undergone Rehabilitation', count: counts.value.followUp.undergoneRehabilitation },
      { key: 'Undergoing Rehabilitation', count: counts.value.followUp.undergoingRehabilitation },
      { key: 'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)', count: counts.value.followUp.hospitalBasedPrimary },
      { key: 'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)', count: counts.value.followUp.hospitalBasedContinuing },
      { key: 'School-based SUD Treatment and Care', count: counts.value.followUp.schoolBased },
      { key: 'Institution-based SUD Treatment and Care', count: counts.value.followUp.institutionBased },
      { key: 'Follow up Drug Test Conducted', count: counts.value.followUp.followUpTest },
      { key: 'Detention-based SUD Treatment and Care', count: counts.value.followUp.detentionBased }
    ]
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
  background-color: #2C6975;
  color: white;
  font-weight: bold;
  text-align: center;
}

:deep(.p-datatable-tbody > tr > td) {
  text-align: center;
  border: 1px solid #ddd;
}

:deep(.p-datatable-tbody > tr) {
  border: 1px solid #ddd;
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

.bold-count {
  font-weight: bold;
}
</style>