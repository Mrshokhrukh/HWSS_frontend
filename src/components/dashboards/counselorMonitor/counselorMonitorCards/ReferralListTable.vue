<template>
  <DataTable v-model:filters="filters" :value="rowData" :paginator="true" :rows="10" :dataKey="'id'"
            filterMode="menu" :filters="{'global': { matchMode: 'contains' }}"
            :emptyMessage="'No referrals found.'" :loading="rowData.length === 0">
    <template #header>
      <div class="flex justify-content-between">
        <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
      </div>
    </template>
    <template #empty> No referrals found. </template>
    <template #loading> Loading referrals data. Please wait. </template>
    <Column field="date" header="Date" :filterMatchMode="'startsWith'" :sortable="true" :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ formatDate(data.date) }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['date']" type="text" class="p-column-filter" placeholder="Search by date" />
      </template>
    </Column>
    <Column field="user_data.name" header="Name" :filterMatchMode="'contains'" :sortable="true" :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ data.user_data.name }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['user_data.name']" type="text" class="p-column-filter" placeholder="Search by name" />
      </template>
    </Column>
    <!-- Other columns go here -->
  </DataTable>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { DataTable, Column } from 'primevue/datatable';
import { Button } from 'primevue/button';
import { InputText } from 'primevue/inputtext';
import endpoints from '@/api';

const referrals = ref([]);
const rowData = ref([]);
const filters = ref({});
const ageOptions = ref([]);
const genderOptions = ref([]);
const referredToOptions = ref([]);
const referredByOptions = ref([]);
const referralStatusOptions = ref([]);
const referralRemarksOptions = ref([]);

const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
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

const clearFilter = () => {
  filters.value = {};
};

onMounted(async () => {
  await loadData();
});
</script>
