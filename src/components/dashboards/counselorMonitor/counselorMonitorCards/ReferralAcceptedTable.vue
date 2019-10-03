<template>
  <div>
    <DataTable v-model:filters="filters" :value="combinedReferrals" paginator showGridlines :rows="10" dataKey="id"
      filterDisplay="menu" :loading="loading"
      :globalFilterFields="['name', 'age', 'gender', 'date', 'referral_status', 'referred_by', 'referred_to', 'assessment_status', 'counseling_status', 'follow_up', 'comments']">
      <template #header>
        <div class="flex justify-content-between">
          <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
        </div>
      </template>
      <template #empty> No referrals found. </template>
      <template #loading> Loading referrals data. Please wait. </template>
      <Column field="date" header="Date" :sortable="true" style="min-width: 10rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by date" />
        </template>
      </Column>
      <Column field="name" header="Name" :sortable="true" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by name" />
        </template>
      </Column>
      <Column field="age" header="Age" :sortable="true" style="min-width: 8rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by age" />
        </template>
      </Column>
      <Column field="gender" header="Gender" :sortable="true" style="min-width: 8rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="genderOptions" optionLabel="gender"
            placeholder="Search by gender" class="p-column-filter" />
        </template>
      </Column>
      <Column field="referred_to" header="Referred To" :sortable="true" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter"
            placeholder="Search by referred to" />
        </template>
      </Column>
      <Column field="referred_by" header="Referred By" :sortable="true" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter"
            placeholder="Search by referred by" />
        </template>
      </Column>
      <Column field="referral_status" header="Referral Status" :sortable="true" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="statusOptions" optionLabel="status"
            placeholder="Search by status" class="p-column-filter" />
        </template>
      </Column>
      <Column field="assessment_status" header="Assessment Status" :sortable="true" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="assessmentStatusOptions" optionLabel="status"
            placeholder="Search by assessment status" class="p-column-filter" />
        </template>
      </Column>
      <Column field="counseling_status" header="Counseling Status" :sortable="true" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="counselingStatusOptions" optionLabel="status"
            placeholder="Search by counseling status" class="p-column-filter" />
        </template>
      </Column>
      <Column field="follow_up" header="Follow-up" :sortable="true" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter"
            placeholder="Search by follow-up" />
        </template>
      </Column>
      <Column field="comments" header="Comments" :sortable="true" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by comments" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import axios from 'axios';
import endpoints from '@/api';

const filters = ref({});
const genderOptions = ref([]);
const statusOptions = ref([]);
const assessmentStatusOptions = ref([]);
const counselingStatusOptions = ref([]);
const loading = ref(true);
const referralList = ref([]);
const serviceAndTreatmentList = ref([]);

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    date: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    name: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    age: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    gender: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    referred_to: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    referred_by: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    referral_status: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    assessment_status: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    counseling_status: { operator: FilterMatchMode.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    follow_up: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    comments: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  };
};

const clearFilter = () => {
  initFilters();
};

const combinedReferrals = computed(() => {
  return referralList.value.map(referral => {
    const serviceData = serviceAndTreatmentList.value.find(service => service.user.id === referral.user_data.id) || {};
    return {
      id: referral.id,
      date: referral.date,
      name: referral.user_data.name,
      age: referral.user_data.age,
      gender: referral.user_data.gender,
      referred_to: referral.referred_to.name,
      referred_by: referral.referred_by.username,
      referral_status: referral.referral_status,
      assessment_status: serviceData.assessment_status || 'Not Available',
      counseling_status: serviceData.counseling || 'Not Available',
      follow_up: serviceData.follow_up || 'Not Available',
      comments: serviceData.comments || 'No comments'
    };
  });
});

const updateFilterOptions = () => {
  genderOptions.value = [...new Set(combinedReferrals.value.map(r => r.gender))].map(gender => ({ gender }));
  statusOptions.value = [...new Set(combinedReferrals.value.map(r => r.referral_status))].map(status => ({ status }));
  assessmentStatusOptions.value = [...new Set(combinedReferrals.value.map(r => r.assessment_status))].map(status => ({ status }));
  counselingStatusOptions.value = [...new Set(combinedReferrals.value.map(r => r.counseling_status))].map(status => ({ status }));
};

const fetchData = async () => {
  try {
    const [referralResponse, serviceResponse] = await Promise.all([
      axios.get(endpoints.getReferralList),
      axios.get(endpoints.generateServiceAndTreatment)
    ]);
    if (referralResponse && referralResponse.data && Array.isArray(referralResponse.data.referral_list)) {
      referralList.value = referralResponse.data.referral_list;
    } else {
      console.error('Invalid referral response format:', referralResponse);
    }
    if (serviceResponse && serviceResponse.data && Array.isArray(serviceResponse.data.data)) {
      serviceAndTreatmentList.value = serviceResponse.data.data;
    } else {
      console.error('Invalid service response format:', serviceResponse);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

onMounted(async () => {
  initFilters();
  loading.value = true;
  try {
    await fetchData();
    updateFilterOptions();
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
});
</script>