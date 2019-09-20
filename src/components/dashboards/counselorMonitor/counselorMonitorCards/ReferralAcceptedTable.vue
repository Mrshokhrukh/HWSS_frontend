<template>
  <div>
    <DataTable v-model:filters="filters" :value="combinedReferrals" paginator showGridlines :rows="10" dataKey="id"
      filterDisplay="menu"
      :globalFilterFields="['name', 'age', 'gender', 'class', 'section_stream', 'school_name', 'dzongkhag', 'parental_status', 'assessment_status', 'counseling', 'follow_up', 'comments', 'referred_by']">
      <template #header>
        <div class="flex justify-content-between">
          <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
        </div>
      </template>
      <template #empty> No referrals found for you. </template>
      <template #loading> Loading referrals data. Please wait. </template>
      <Column field="name" header="Name" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by name" />
        </template>
      </Column>
      <Column field="age" header="Age" style="min-width: 8rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by age" />
        </template>
      </Column>
      <Column field="gender" header="Gender" style="min-width: 8rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="genderOptions" optionLabel="gender"
            placeholder="Search by gender" class="p-column-filter" />
        </template>
      </Column>
      <Column field="class" header="Class" style="min-width: 8rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="classOptions" optionLabel="class"
            placeholder="Search by class" class="p-column-filter" />
        </template>
      </Column>
      <Column field="section_stream" header="Section/Stream" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="sectionStreamOptions" optionLabel="sectionStream"
            placeholder="Search by section/stream" class="p-column-filter" />
        </template>
      </Column>
      <Column field="school_name" header="School Name" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="schoolNameOptions" optionLabel="schoolName"
            placeholder="Search by school name" class="p-column-filter" />
        </template>
      </Column>
      <Column field="dzongkhag" header="Dzongkhag" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="dzongkhagOptions" optionLabel="dzongkhag"
            placeholder="Search by dzongkhag" class="p-column-filter" />
        </template>
      </Column>
      <Column field="parental_status" header="Parental Status" style="min-width: 10rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="parentalStatusOptions" optionLabel="parentalStatus"
            placeholder="Search by parental status" class="p-column-filter" />
        </template>
      </Column>
      <Column field="assessment_status" header="Assessment Status" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="assessmentStatusOptions" optionLabel="assessmentStatus"
            placeholder="Search by assessment status" class="p-column-filter" />
        </template>
      </Column>
      <Column field="counseling" header="Counseling" style="min-width: 8rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="counselingOptions" optionLabel="counseling"
            placeholder="Search by counseling" class="p-column-filter" />
        </template>
      </Column>
      <Column field="follow_up" header="Follow-up" style="min-width: 8rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="followUpOptions" optionLabel="followUp"
            placeholder="Search by follow-up" class="p-column-filter" />
        </template>
      </Column>
      <Column field="comments" header="Comments" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search comments" />
        </template>
      </Column>
      <Column field="referred_by" header="Referred by" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="referredByOptions" optionLabel="referredBy"
            placeholder="Search by referred by" class="p-column-filter" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCounselorDashboardStore } from '@/stores/counselorDashboard';
import { FilterMatchMode } from 'primevue/api';

const store = useCounselorDashboardStore();
const { referralList, userDetails, reportData, measurementData, assistMeasurementData } = storeToRefs(store);

const filters = ref({});
const genderOptions = ref([]);
const classOptions = ref([]);
const sectionStreamOptions = ref([]);
const schoolNameOptions = ref([]);
const dzongkhagOptions = ref([]);
const parentalStatusOptions = ref([]);
const assessmentStatusOptions = ref([]);
const counselingOptions = ref([]);
const followUpOptions = ref([]);
const referredByOptions = ref([]);

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    age: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    gender: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    class: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    section_stream: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    school_name: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    dzongkhag: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    parental_status: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    assessment_status: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    counseling: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    follow_up: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    comments: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    referred_by: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
  };
};

const clearFilter = () => {
  initFilters();
};

const currentUserId = computed(() => userDetails.value?.user?.id);

const combinedReferrals = computed(() => {
  return referralList.value
    .filter(referral => referral.referred_to && referral.referred_to.user_id === currentUserId.value)
    .map(referral => {
      const reportItem = reportData.value.find(report => report.user?.id === referral.user_data.patient_id);
      const measurementItem = measurementData.value.find(measurement => measurement.user === referral.user_data.patient_id);
      const assistItem = assistMeasurementData.value.find(assist => assist.user === referral.user_data.patient_id);

      return {
        id: referral.id,
        name: referral.user_data.name,
        age: referral.user_data.age,
        gender: referral.user_data.gender,
        class: reportItem?.user?.fields?.class || 'N/A',
        section_stream: reportItem?.user?.fields?.section_stream || 'N/A',
        school_name: reportItem?.agency_name || 'N/A',
        dzongkhag: reportItem?.user?.fields?.dzongkhag || 'N/A',
        parental_status: reportItem?.user?.fields?.parental_status || 'N/A',
        assessment_status: measurementItem ? 'Completed' : 'Pending',
        counseling: assistItem ? 'Completed' : 'Pending',
        follow_up: referral.follow_up || 'N/A',
        comments: referral.comments || 'N/A',
        referred_by: referral.referred_by.name,
      };
    });
});

const updateFilterOptions = () => {
  genderOptions.value = [...new Set(combinedReferrals.value.map(r => r.gender))].map(gender => ({ gender }));
  classOptions.value = [...new Set(combinedReferrals.value.map(r => r.class))].map(cls => ({ class: cls }));
  sectionStreamOptions.value = [...new Set(combinedReferrals.value.map(r => r.section_stream))].map(ss => ({ sectionStream: ss }));
  schoolNameOptions.value = [...new Set(combinedReferrals.value.map(r => r.school_name))].map(sn => ({ schoolName: sn }));
  dzongkhagOptions.value = [...new Set(combinedReferrals.value.map(r => r.dzongkhag))].map(d => ({ dzongkhag: d }));
  parentalStatusOptions.value = [...new Set(combinedReferrals.value.map(r => r.parental_status))].map(ps => ({ parentalStatus: ps }));
  assessmentStatusOptions.value = [...new Set(combinedReferrals.value.map(r => r.assessment_status))].map(as => ({ assessmentStatus: as }));
  counselingOptions.value = [...new Set(combinedReferrals.value.map(r => r.counseling))].map(c => ({ counseling: c }));
  followUpOptions.value = [...new Set(combinedReferrals.value.map(r => r.follow_up))].map(fu => ({ followUp: fu }));
  referredByOptions.value = [...new Set(combinedReferrals.value.map(r => r.referred_by))].map(rb => ({ referredBy: rb }));
};

onMounted(() => {
  initFilters();
  updateFilterOptions();
});
</script>