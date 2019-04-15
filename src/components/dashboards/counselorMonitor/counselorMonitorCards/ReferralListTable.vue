<template>
  <DataTable v-model:filters="filters" :value="rowData" :paginator="true" :rows="10" :dataKey="'id'" filterMode="menu"
    :filters="{ 'global': { matchMode: 'contains' } }" :emptyMessage="'No referrals found.'"
    :loading="rowData.length === 0">
    <template #header>
      <div class="flex justify-content-between">
        <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
      </div>
    </template>
    <template #empty> No referrals found. </template>
    <template #loading> Loading referrals data. Please wait. </template>
    <Column field="date" header="Date" :filterMatchMode="'startsWith'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ formatDate(data.date) }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['date']" type="text" class="p-column-filter" placeholder="Search by date" />
      </template>
    </Column>
    <Column field="user_data.name" header="Name" :filterMatchMode="'contains'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ data.user_data.name }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['user_data.name']" type="text" class="p-column-filter"
          placeholder="Search by name" />
      </template>
    </Column>
    <Column field="user_data.age" header="Age" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '8rem' }">
      <template #body="{ data }">
        {{ data.user_data.age }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['user_data.age']" type="text" class="p-column-filter"
          placeholder="Search by age" />
      </template>
    </Column>
    <Column field="user_data.gender" header="Sex" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '8rem' }">
      <template #body="{ data }">
        {{ data.user_data.gender }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['user_data.gender']" type="text" class="p-column-filter"
          placeholder="Search by gender" />
      </template>
    </Column>
    <Column field="referred_to.name" header="Referred To" :filterMatchMode="'contains'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ data.referred_to.name }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['referred_to.name']" type="text" class="p-column-filter"
          placeholder="Search by referred to" />
      </template>
    </Column>
    <Column field="referred_by.username" header="Referred By" :filterMatchMode="'contains'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ data.referred_by.username }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['referred_by.username']" type="text" class="p-column-filter"
          placeholder="Search by referred by" />
      </template>
    </Column>
    <Column field="referral_status" header="Referral Status" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ data.referral_status }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['referral_status']" type="text" class="p-column-filter"
          placeholder="Search by referral status" />
      </template>
    </Column>
  </DataTable>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';

const rowData = ref([]);
const filters = ref({});

const formatDate = (timestamp) => {
  if (!timestamp) return ''; // Return empty string if timestamp is not provided

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const loadData = async () => {
  try {
    const response = await axios.get(endpoints.getReferralList);
    console.log(response.data.referral_list);
    rowData.value = response.data.referral_list;
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
