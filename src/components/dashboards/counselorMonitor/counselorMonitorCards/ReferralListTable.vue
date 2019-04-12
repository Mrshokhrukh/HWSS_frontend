<template>
  <DataTable v-model:filters="filters" :value="rowData" paginator showGridlines :rows="10" dataKey="id"
            filterDisplay="menu" :globalFilterFields="['user_data.name', 'referred_to_name', 'referred_by_name', 'referral_status', 'referral_remarks']">
    <template #header>
      <div class="flex justify-content-between">
        <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
      </div>
    </template>
    <template #empty> No referrals found. </template>
    <template #loading> Loading referrals data. Please wait. </template>
    <Column field="date" header="Date" style="min-width: 12rem">
      <template #body="{ data }">
        {{ formatDate(data.date) }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by date" />
      </template>
    </Column>
    <Column field="user_data.name" header="Name" style="min-width: 12rem">
      <template #body="{ data }">
        {{ data.user_data.name }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel.value" type="text" class="p-column-filter" placeholder="Search by name" />
      </template>
    </Column>
    <Column field="user_data.age" header="Age" :showFilterMatchModes="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
      <template #body="{ data }">
        {{ data.user_data.age }}
      </template>
      <template #filter="{ filterModel }">
        <MultiSelect v-model="filterModel.value" :options="ageOptions" optionLabel="age" placeholder="Search by age" class="p-column-filter" />
      </template>
    </Column>
    <Column field="user_data.gender" header="Sex" :showFilterMatchModes="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
      <template #body="{ data }">
        {{ data.user_data.gender }}
      </template>
      <template #filter="{ filterModel }">
        <MultiSelect v-model="filterModel.value" :options="genderOptions" optionLabel="gender" placeholder="Search by gender" class="p-column-filter" />
      </template>
    </Column>
    <Column field="referred_to_name" header="Referred To" :showFilterMatchModes="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
      <template #body="{ data }">
        {{ data.referred_to_name || '----' }}
      </template>
      <template #filter="{ filterModel }">
        <MultiSelect v-model="filterModel.value" :options="referredToOptions" optionLabel="referredTo" placeholder="Search by referred to" class="p-column-filter" />
      </template>
    </Column>
    <Column field="referred_by_name" header="Referred By" :showFilterMatchModes="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
      <template #body="{ data }">
        {{ data.referred_by_name || '----' }}
      </template>
      <template #filter="{ filterModel }">
        <MultiSelect v-model="filterModel.value" :options="referredByOptions" optionLabel="referredBy" placeholder="Search by referred by" class="p-column-filter" />
      </template>
    </Column>
    <Column field="referral_status" header="Referral Status" :showFilterMatchModes="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
      <template #body="{ data }">
        {{ data.referral_status || '----' }}
      </template>
      <template #filter="{ filterModel }">
        <MultiSelect v-model="filterModel.value" :options="referralStatusOptions" optionLabel="status" placeholder="Search by referral status" class="p-column-filter" />
      </template>
    </Column>
    <Column field="referral_remarks" header="Referral Remarks" :showFilterMatchModes="false" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
      <template #body="{ data }">
        {{ data.referral_remarks || '----' }}
      </template>
      <template #filter="{ filterModel }">
        <MultiSelect v-model="filterModel.value" :options="referralRemarksOptions" optionLabel="remarks" placeholder="Search by referral remarks" class="p-column-filter" />
      </template>
    </Column>
  </DataTable>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import { FilterMatchMode } from 'primevue/api';

const referrals = ref([]);
const rowData = ref([]);
const filters = ref();
const ageOptions = ref([]);
const genderOptions = ref([]);
const referredToOptions = ref([]);
const referredByOptions = ref([]);
const referralStatusOptions = ref([]);
const referralRemarksOptions = ref([]);

const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  return formattedDate;
};

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    date: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    'user_data.name': { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    'user_data.age': { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
    'user_data.gender': { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
    'referred_to_name': { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
    'referred_by_name': { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
    'referral_status': { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
    'referral_remarks': { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
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
    rowData.value = referrals.value;

    // Extract unique options for MultiSelect filters
    const ages = [...new Set(referrals.value.map(referral => referral.user_data.age))];
    ageOptions.value = ages.map(age => ({ age }));

    const genders = [...new Set(referrals.value.map(referral => referral.user_data.gender))];
    genderOptions.value = genders.map(gender => ({ gender }));

    const referredTo = [...new Set(referrals.value.map(referral => referral.referred_to_name))];
    referredToOptions.value = referredTo.map(referredTo => ({ referredTo: referredTo || '----' }));

    const referredBy = [...new Set(referrals.value.map(referral => referral.referred_by_name))];
    referredByOptions.value = referredBy.map(referredBy => ({ referredBy: referredBy || '----' }));

    const referralStatus = [...new Set(referrals.value.map(referral => referral.referral_status))];
    referralStatusOptions.value = referralStatus.map(status => ({ status: status || '----' }));

    const referralRemarks = [...new Set(referrals.value.map(referral => referral.referral_remarks))];
    referralRemarksOptions.value = referralRemarks.map(remarks => ({ remarks: remarks || '----' }));
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

onMounted(async () => {
  await loadData();
});
</script>