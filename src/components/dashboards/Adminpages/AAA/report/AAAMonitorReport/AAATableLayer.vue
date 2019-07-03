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
  
  const reportData = ref(JSON.parse(sessionStorage.getItem('reportData')) || []);
  
  // Existing count calculations...
  const Rescreening_count = ref(reportData.value.filter(item => item.rescreened === false).length);
  const WaitingList_Count = ref(reportData.value.filter(item => item.service_and_treatment?.counseling === 'Waiting List').length);
  const NotRequired_Count = ref(reportData.value.filter(item => item.service_and_treatment?.counseling === 'Not Required').length);
  const Availed_Count = ref(reportData.value.filter(item => item.service_and_treatment?.counseling === 'Availed').length);
  const Conducted_Count = ref(reportData.value.filter(item => item.service_and_treatment?.assessment_status === 'Conducted').length);
  const NotConducted_Count = ref(reportData.value.filter(item => item.service_and_treatment?.assessment_status === 'Not Conducted').length);
  const Referred_Count = ref(reportData.value.filter(item => item.service_and_treatment?.referred === 'Referred').length);
  const Notreferred_Count = ref(reportData.value.filter(item => item.service_and_treatment?.referred === 'Not Referred').length);
  // follow-up counts
  const Treatmentcompleted_count = ref(reportData.value.filter(item => item.service_and_treatment?.follow_up === 'Treatment Completed').length);
  const Undergoingtreatment_count = ref(reportData.value.filter(item => item.service_and_treatment?.follow_up === 'Undergoing treatment').length);
  const Completedcounsellingsessions_count = ref(reportData.value.filter(item => item.service_and_treatment?.follow_up === 'Completed counselling sessions').length);
  const Undergoingcounselling_count = ref(reportData.value.filter(item => item.service_and_treatment?.follow_up === 'Undergoing counselling').length);
  const Unwillingtoundergotreatment_count = ref(reportData.value.filter(item => item.service_and_treatment?.follow_up === 'Unwilling to undergo treatment').length);
  const UndergoneRehabilitation_count = ref(reportData.value.filter(item => item.service_and_treatment?.follow_up === 'Undergone Rehabilitation').length);
  const UndergoingRehabilitation_count = ref(reportData.value.filter(item => item.service_and_treatment?.follow_up === 'Undergoing Rehabilitation').length);
  const HospitalbasedOutpatientSUDTreatmentandCarePrimaryPhase_count = ref(reportData.value.filter(item => item.service_and_treatment?.follow_up === 'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)').length);
  const HospitalbasedOutpatientSUDTreatmentandCareContinuingCare_count = ref(reportData.value.filter(item => item.service_and_treatment?.follow_up === 'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)').length);
  const SchoolbasedSUDTreatmentandCare_count = ref(reportData.value.filter(item => item.service_and_treatment?.follow_up === 'School-based SUD Treatment and Care').length);
  const InstitutionbasedSUDTreatmentandCare_count = ref(reportData.value.filter(item => item.service_and_treatment?.follow_up === 'Institution-based SUD Treatment and Care').length);
  const FollowupDrugTestConducted_count = ref(reportData.value.filter(item => item.service_and_treatment?.follow_up === 'Follow up Drug Test Conducted').length);
  const DetentionbasedSUDTreatmentandCare_count = ref(reportData.value.filter(item => item.service_and_treatment?.follow_up === 'Detention-based SUD Treatment and Care').length);
  
  const columns = ref([
    { field: 'rescreening', header: 'Rescreening' },
    { field: 'counseling', header: 'Counseling' },
    { field: 'assessment', header: 'Assessment' },
    { field: 'referral', header: 'Referral' },
    { field: 'followUp', header: 'Follow-Up' },
  ]);
  
  const aggregateData = computed(() => [
    {
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
        { key: 'Referred', count: Referred_Count.value },
        { key: 'Not Referred', count: Notreferred_Count.value }
      ],
      followUp: [
        { key: 'Treatment completed', count: Treatmentcompleted_count.value },
        { key: 'Undergoing treatment', count: Undergoingtreatment_count.value },
        { key: 'Completed counselling sessions', count: Completedcounsellingsessions_count.value },
        { key: 'Undergoing counselling', count: Undergoingcounselling_count.value },
        { key: 'Unwilling to undergo treatment', count: Unwillingtoundergotreatment_count.value },
        { key: 'Undergone Rehabilitation', count: UndergoneRehabilitation_count.value },
        { key: 'Undergoing Rehabilitation', count: UndergoingRehabilitation_count.value },
        { key: 'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)', count: HospitalbasedOutpatientSUDTreatmentandCarePrimaryPhase_count.value },
        { key: 'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)', count: HospitalbasedOutpatientSUDTreatmentandCareContinuingCare_count.value },
        { key: 'School-based SUD Treatment and Care', count: SchoolbasedSUDTreatmentandCare_count.value },
        { key: 'Institution-based SUD Treatment and Care', count: InstitutionbasedSUDTreatmentandCare_count.value },
        { key: 'Follow up Drug Test Conducted', count: FollowupDrugTestConducted_count.value },
        { key: 'Detention-based SUD Treatment and Care', count: DetentionbasedSUDTreatmentandCare_count.value }
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
    border: 1px solid #ddd; /* Adding border to td elements for grid lines */
  }
  
  :deep(.p-datatable-tbody > tr) {
    border: 1px solid #ddd; /* Adding border to tr elements for grid lines */
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
    font-weight: bold; /* Styling to make item.count bold */
  }
  </style>
  