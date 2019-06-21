<template>
  <div class="card">
    <DataTable :value="customers" rowGroupMode="rowspan" :groupRowsBy="groupsofrows" tableStyle="min-width: 50rem">
      <Column field="representative.name" header="Rescreening Count" style="min-width: 200px"
        :headerStyle="{ backgroundColor: '#f0f0f0' }" :bodyStyle="{ backgroundColor: '#f9f9f9' }">
        <template #body="slotProps">
          <div class="text-center">
            <p>{{ slotProps.data.representative.tag }}</p>
            <span>{{ slotProps.data.representative.name }}</span>
          </div>
        </template>
      </Column>
      <Column field="Assement.type" header="Assement" style="min-width: 200px" :headerStyle="{ backgroundColor: '#e0e0e0' }"
        :bodyStyle="{ backgroundColor: '#fafafa' }">
        <template #body="slotProps">
          <div class="text-center">
            <p>{{ slotProps.data.Assement.title }}</p>
            <span>{{ slotProps.data.Assement.type }}</span>
          </div>
        </template>
      </Column>
  
      <Column field="Counseling.type" header="counseling " style="min-width: 200px" :headerStyle="{ backgroundColor: '#d0d0d0' }"
        :bodyStyle="{ backgroundColor: '#fbfbfb' }">
        <template #body="slotProps">
          <div class="text-center">
            <p>{{ slotProps.data.Counseling.title }}</p>
            <span>{{ slotProps.data.Counseling.type}}</span>
          </div>
        </template>
      </Column>
      <Column field="Referral_Status.type" header="Referral Status " style="min-width: 200px" :headerStyle="{ backgroundColor: '#d0d0d0' }"
        :bodyStyle="{ backgroundColor: '#fbfbfb' }">
        <template #body="slotProps">
          <div class="text-center">
            <p>{{ slotProps.data.Referral_Status.title }}</p>
            <span>{{ slotProps.data.Referral_Status.type}}</span>
          </div>
        </template>
      </Column>
      <Column field="follow_up.type" header="Follow Up " style="min-width: 200px" :headerStyle="{ backgroundColor: '#d0d0d0' }"
        :bodyStyle="{ backgroundColor: '#fbfbfb' }">
        <template #body="slotProps">
          <div class="text-center">
  <div class="d-inline-flex ">
    <p >{{ slotProps.data.follow_up.title }}</p>
    <span>{{ slotProps.data.follow_up.type }}</span>
  </div>
</div>

        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

//real data fetch from sessionstorage
const reportData = ref(JSON.parse(sessionStorage.getItem('reportData')) || [])
const Rescreening_count = ref(0)
const Rescreening_filter = ref([])
Rescreening_filter.value = reportData.value.filter((item) => item.rescreened === false)
Rescreening_count.value = Rescreening_filter.value.length

//assement
// Not conducted
const Conducted_Count = ref(0);
const ConductedCount_filter = ref([]);
ConductedCount_filter.value = reportData.value.filter(item => item.service_and_treatment?.assessment_status === 'Conducted');
Conducted_Count.value = ConductedCount_filter.value.length;


//Coducted
const NotConducted_Count = ref(0);
const NotConductedCount_filter = ref([]);
NotConductedCount_filter.value = reportData.value.filter(item => item.service_and_treatment?.assessment_status === 'Not Conducted');
NotConducted_Count.value = NotConductedCount_filter.value.length;
// Counseling
//WaitingList
const WaitingList_Count = ref(0);
const WaitingListCount_filter = ref([]);
WaitingListCount_filter.value = reportData.value.filter(item => item.service_and_treatment?.counseling === 'Waiting List');
WaitingList_Count.value = WaitingListCount_filter.value.length;

//Not Required
const NotRequired_Count = ref(0);
const NotRequiredCount_filter = ref([]);
NotRequiredCount_filter.value = reportData.value.filter(item => item.service_and_treatment?.counseling === 'Not Required');
NotRequired_Count.value = NotRequiredCount_filter.value.length;

//Availed
const Availed_Count = ref(0);
const AvailedCount_filter = ref([]);
AvailedCount_filter.value = reportData.value.filter(item => item.service_and_treatment?.counseling === 'Availed');
Availed_Count.value = AvailedCount_filter.value.length;

  // Referred
  const referredDataFilter = ref(reportData.value.filter(item => item.service_and_treatment?.referred === 'Referred'));
  const referredCount = ref(referredDataFilter.value.length);
  
  // Not Referred
  const notReferredDataFilter = ref(reportData.value.filter(item => item.service_and_treatment?.referred === 'Not Referred'));
  const notReferredCount = ref(notReferredDataFilter.value.length);
    // followup
    const followupDataFilter = ref(reportData.value.filter(item => item.service_and_treatment?.follow_up == 'Treatment Completed'));
  const followup_TCCount = ref(followupDataFilter.value.length);


const customers = ref([
  {
    
    representative: { name: Rescreening_count, tag: 'Total Rescreening' },
    Assement: { type: NotConducted_Count, title: 'Not Conducted' },
    Counseling: { type: Availed_Count, title: 'Availed' },
    Referral_Status:{type: referredCount, title: 'Referred' },
    follow_up:{type: followup_TCCount, title: 'Treatment completed :' },

  },
  {
    
    representative: { name: Rescreening_count },
    Assement: { type: NotConducted_Count, title: 'Not Conducted' },
    Counseling: { type: Availed_Count, title: 'Availed' },
    Referral_Status:{type: referredCount, title: 'Referred' },
    follow_up:{type: followup_TCCount, title: 'Treatment completed :' },
  },
  {
    representative: { name: Rescreening_count },
    Assement: { type: Conducted_Count, title: 'Conducted' },
    Counseling: { type: NotRequired_Count, title: 'Not required'},
    Referral_Status:{type: referredCount, title: 'Referred' },
    follow_up:{type: followup_TCCount, title: 'Treatment completed :' },
  },
  {
    representative: { name: Rescreening_count },
    Assement: { type: Conducted_Count, title: 'Conducted' },
    Counseling: { type: WaitingList_Count, title: 'Waiting list ' },
    Referral_Status:{type: notReferredCount, title: ' Not Referred' },
    follow_up:{type: followup_TCCount, title: 'Treatment completed :' },
  },
  {

    representative: { name: Rescreening_count },
    Assement: { type: Conducted_Count, title: 'Conducted' },
    Counseling: { type: NotRequired_Count, title: 'Not required'},
    Referral_Status:{type: notReferredCount, title: ' Not Referred' },
    follow_up:{type: followup_TCCount, title: 'Treatment completed :' },
  }
])

const groupsofrows = ref(['representative.name', 'Assement.type', 'Counseling.type','Referral_Status.type','follow_up.type'])
</script>
<style scoped></style>
