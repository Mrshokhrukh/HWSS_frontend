<template>
    <DataTable v-model:filters="filters" :value="filteredReferrals" paginator showGridlines :rows="10" dataKey="id"
               filterDisplay="menu" :globalFilterFields="['name', 'age', 'gender', 'class', 'section_stream', 'school_name', 'dzongkhag', 'parental_status', 'assessment_status', 'counseling', 'follow_up', 'comments', 'referred_by']">
      <template #header>
        <div class="flex justify-content-between">
          <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
        </div>
      </template>
      <template #empty> No referrals found. </template>
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
          <MultiSelect v-model="filterModel.value" :options="genderOptions" optionLabel="gender" placeholder="Search by gender" class="p-column-filter" />
        </template>
      </Column>
      <Column field="class" header="Class" style="min-width: 8rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="classOptions" optionLabel="class" placeholder="Search by class" class="p-column-filter" />
        </template>
      </Column>
      <Column field="section_stream" header="Section/Stream" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="sectionStreamOptions" optionLabel="sectionStream" placeholder="Search by section/stream" class="p-column-filter" />
        </template>
      </Column>
      <Column field="school_name" header="School Name" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="schoolNameOptions" optionLabel="schoolName" placeholder="Search by school name" class="p-column-filter" />
        </template>
      </Column>
      <Column field="dzongkhag" header="Dzongkhag (of the school)" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="dzongkhagOptions" optionLabel="dzongkhag" placeholder="Search by dzongkhag" class="p-column-filter" />
        </template>
      </Column>
      <Column field="parental_status" header="Parental Status" style="min-width: 10rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="parentalStatusOptions" optionLabel="parentalStatus" placeholder="Search by parental status" class="p-column-filter" />
        </template>
      </Column>
      <Column field="assessment_status" header="Assessment Status" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="assessmentStatusOptions" optionLabel="assessmentStatus" placeholder="Search by assessment status" class="p-column-filter" />
        </template>
      </Column>
      <Column field="counseling" header="Counseling" style="min-width: 8rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="counselingOptions" optionLabel="counseling" placeholder="Search by counseling" class="p-column-filter" />
        </template>
      </Column>
      <Column field="follow_up" header="Follow-up" style="min-width: 8rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="followUpOptions" optionLabel="followUp" placeholder="Search by follow-up" class="p-column-filter" />
        </template>
      </Column>
      <Column field="comments" header="Comments" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="commentsOptions" optionLabel="comments" placeholder="Search by comments" class="p-column-filter" />
        </template>
      </Column>
      <Column field="referred_by" header="Referred by" style="min-width: 12rem">
        <template #filter="{ filterModel }">
          <MultiSelect v-model="filterModel.value" :options="referredByOptions" optionLabel="referredBy" placeholder="Search by referred by" class="p-column-filter" />
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
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import endpoints from '@/api';
  import { FilterMatchMode } from 'primevue/api';
  
  const referrals = ref([]);
  const rowData = ref([]);
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
      name: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
      age: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
      gender: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
      class: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
      section_stream: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
      school_name: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
      dzongkhag: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
      parental_status: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
      assessment_status: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
      counseling: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
      follow_up: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
      comments: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
      referred_by: { operator: FilterMatchMode.AND, constraints: [{ value: null, matchMode: FilterMatchMode.IN }] },
    };
  };
  
  initFilters();
  
  const clearFilter = () => {
    initFilters();
    applyFilters();
  };
  
  const applyFilters = () => {
    // Apply filters logic based on the selected filter values
  };
  
  const loadData = async () => {
    try {
      const response = await axios.get(endpoints.getReferralList);
      referrals.value = response.data.referral_list;
      applyFilters();
      // Extract unique options for filters if needed
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  
  const acceptAction = (data) => {
    // Logic for accepting referral
  };
  
  const rejectAction = (data) => {
    // Logic for rejecting referral
  };
  
  onMounted(async () => {
    await loadData();
  });
  </script>
  