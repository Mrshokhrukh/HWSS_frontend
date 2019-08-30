<template>
  <DataTable v-model:filters="filters" :value="filteredReferrals" paginator showGridlines :rows="10" dataKey="id"
    filterDisplay="menu"
    :globalFilterFields="['name', 'age', 'gender', 'class', 'section_stream', 'school_name', 'dzongkhag', 'parental_status', 'assessment_status', 'counseling_status', 'follow_up', 'comments', 'referred_by']">
    <template #header>
      <div class="flex justify-content-between">
        <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
      </div>
    </template>
    <template #empty> No referrals found. </template>
    <template #loading> Loading referrals data. Please wait. </template>
    <Column field="name" header="Name" style="min-width: 12rem">
      <template #body="{ data }">
        {{ data.user_data.name }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by name" />
      </template>
    </Column>
    <Column field="age" header="Age" style="min-width: 8rem">
      <template #body="{ data }">
        {{ data.user_data.age }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by age" />
      </template>
    </Column>
    <Column field="gender" header="Gender" style="min-width: 8rem">
      <template #body="{ data }">
        {{ data.user_data.gender }}
      </template>
      <template #filter="{ filterModel }">
        <MultiSelect v-model="filterModel.value" :options="genderOptions" optionLabel="gender"
          placeholder="Search by gender" class="p-column-filter" />
      </template>
    </Column>
    <Column field="class" header="Class" style="min-width: 8rem">
      <template #body="{ data }">
        {{ data.user_data.class }}
      </template>
      <template #filter="{ filterModel }">
        <MultiSelect v-model="filterModel.value" :options="classOptions" optionLabel="class"
          placeholder="Search by class" class="p-column-filter" />
      </template>
    </Column>
    <Column field="section_stream" header="Section/Stream" style="min-width: 12rem">
      <template #body="{ data }">
        {{ data.user_data.section_stream }}
      </template>
      <template #filter="{ filterModel }">
        <MultiSelect v-model="filterModel.value" :options="sectionStreamOptions" optionLabel="sectionStream"
          placeholder="Search by section/stream" class="p-column-filter" />
      </template>
    </Column>
    <Column field="school_name" header="School Name" style="min-width: 12rem">
      <template #body="{ data }">
        {{ data.user_data.school_name }}
      </template>
      <template #filter="{ filterModel }">
        <MultiSelect v-model="filterModel.value" :options="schoolNameOptions" optionLabel="schoolName"
          placeholder="Search by school name" class="p-column-filter" />
      </template>
    </Column>
    <Column field="dzongkhag" header="Dzongkhag (of the school)" style="min-width: 12rem">
      <template #body="{ data }">
        {{ data.user_data.dzongkhag }}
      </template>
      <template #filter="{ filterModel }">
        <MultiSelect v-model="filterModel.value" :options="dzongkhagOptions" optionLabel="dzongkhag"
          placeholder="Search by dzongkhag" class="p-column-filter" />
      </template>
    </Column>
    <Column field="parental_status" header="Parental Status" style="min-width: 10rem">
      <template #body="{ data }">
        {{ data.user_data.parental_status }}
      </template>
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
    <Column field="counseling_status" header="Counseling" style="min-width: 8rem">
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
        <MultiSelect v-model="filterModel.value" :options="commentsOptions" optionLabel="comments"
          placeholder="Search by comments" class="p-column-filter" />
      </template>
    </Column>
    <Column field="referred_by" header="Referred by" style="min-width: 12rem">
      <template #body="{ data }">
        {{ data.referred_by.username }}
      </template>
      <template #filter="{ filterModel }">
        <MultiSelect v-model="filterModel.value" :options="referredByOptions" optionLabel="referredBy"
          placeholder="Search by referred by" class="p-column-filter" />
      </template>
    </Column>
    <Column header="Action" style="min-width: 10rem">
      <template #body="{ data }">
        <Button type="button" icon="pi pi-check" class="p-button-success" @click="acceptAction(data)" />
        <Button type="button" icon="pi pi-times" class="p-button-danger" @click="rejectAction(data)" />
      </template>
    </Column>
  </DataTable>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import { FilterMatchMode } from 'primevue/api';

const referrals = ref([]);
const filters = ref();
const genderOptions = ref([]);
const classOptions = ref([]);
const sectionStreamOptions = ref([]);
const schoolNameOptions = ref([]);
const dzongkhagOptions = ref([]);
const parentalStatusOptions = ref([]);
const assessmentStatusOptions = ref([]);
const counselingOptions = ref([]);
const followUpOptions = ref([]);
const commentsOptions = ref([]);
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
    counseling_status: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    follow_up: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    comments: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    referred_by: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
  };
};

initFilters();

const clearFilter = () => {
  initFilters();
};

const loadData = async () => {
  try {
    const response = await axios.get(endpoints.getReferralList);
    referrals.value = response.data.referral_list;
    updateFilterOptions();
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

const updateFilterOptions = () => {
  genderOptions.value = [...new Set(referrals.value.map(r => r.user_data.gender))].map(gender => ({ gender }));
  classOptions.value = [...new Set(referrals.value.map(r => r.user_data.class))].map(cls => ({ class: cls }));
  sectionStreamOptions.value = [...new Set(referrals.value.map(r => r.user_data.section_stream))].map(ss => ({ sectionStream: ss }));
  schoolNameOptions.value = [...new Set(referrals.value.map(r => r.user_data.school_name))].map(sn => ({ schoolName: sn }));
  dzongkhagOptions.value = [...new Set(referrals.value.map(r => r.user_data.dzongkhag))].map(d => ({ dzongkhag: d }));
  parentalStatusOptions.value = [...new Set(referrals.value.map(r => r.user_data.parental_status))].map(ps => ({ parentalStatus: ps }));
  assessmentStatusOptions.value = [...new Set(referrals.value.map(r => r.assessment_status))].map(as => ({ assessmentStatus: as }));
  counselingOptions.value = [...new Set(referrals.value.map(r => r.counseling_status))].map(c => ({ counseling: c }));
  followUpOptions.value = [...new Set(referrals.value.map(r => r.follow_up))].map(fu => ({ followUp: fu }));
  commentsOptions.value = [...new Set(referrals.value.map(r => r.comments))].map(c => ({ comments: c }));
  referredByOptions.value = [...new Set(referrals.value.map(r => r.referred_by.username))].map(rb => ({ referredBy: rb }));
};

const getUserDetails = () => {
  const userDetailsString = localStorage.getItem('userDetailsStore');
  return userDetailsString ? JSON.parse(userDetailsString) : null;
};

const filteredReferrals = computed(() => {
  const userDetails = getUserDetails();
  if (!userDetails) return [];

  return referrals.value.filter(referral =>
    referral.referred_to &&
    referral.referred_to.id === userDetails.user.id
  );
});

const acceptAction = async (data) => {
  try {
    await axios.post(endpoints.acceptReferral, {
      referredToUserId: data.referred_to.id,
      patientId: data.id
    });
    const index = referrals.value.findIndex(r => r.id === data.id);
    if (index !== -1) {
      referrals.value[index].referral_status = 'accepted';
      referrals.value = [...referrals.value];
    }
  } catch (error) {
    console.error('Error accepting referral:', error);
  }
};

const rejectAction = async (data) => {
  try {
    await axios.post(endpoints.rejectReferral, {
      referredToUserId: data.referred_to.id,
      patientId: data.id,
      reason: 'Rejection reason'
    });
    const index = referrals.value.findIndex(r => r.id === data.id);
    if (index !== -1) {
      referrals.value[index].referral_status = 'rejected';
      referrals.value = [...referrals.value];
    }
  } catch (error) {
    console.error('Error rejecting referral:', error);
  }
};

onMounted(async () => {
  await loadData();
});
</script>