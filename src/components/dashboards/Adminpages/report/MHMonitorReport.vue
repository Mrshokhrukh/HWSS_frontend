<template>
  <div class="card p-4">
    <DataTable v-model:filters="filters" :value="filteredData" paginator showGridlines :rows="10" dataKey="id"
      filterDisplay="row" :loading="loading" :globalFilterFields="[
      'rescreening',
      'counselingServices',
      'assessment',
      'followUp',
      'referrals',
      'year',
      'gender',
      'dzongkha',
      'location',
      'age',
      'class',
      'employmentHistory'
    ]">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <Button type="button" icon="fa-solid fa-filter-circle-xmark" class="p-button-text" label="Clear" outlined
            @click="clearFilter()" />
          <div class="p-input-icon-left">
            <i class="fa-solid fa-magnifying-glass"></i>
            <InputText v-model="filters['global'].value" placeholder="Keyword Search" class="p-inputtext-sm" />
          </div>
        </div>
      </template>
      <template #empty> No customers found. </template>
      <template #loading> Loading customers data. Please wait. </template>

      <!-- Filter for Rescreening -->
      <Column header="Rescreening" filterField="rescreening" :showFilterMenu="false"
        :filterMenuStyle="{ width: '14rem' }" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.rescreening }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" @change="filterCallback('rescreening')"
            :options="rescreening.map((option) => option.value)" placeholder="Select" class="p-column-filter"
            style="min-width: 14rem" :maxSelectedLabels="1" />
        </template>
      </Column>

      <!-- Filter for Counseling Services -->
      <Column field="counselingServices" header="Counseling Services" :showFilterMenu="false" style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.counselingServices }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" @change="filterCallback('counselingServices')"
            :options="counselingServicesOptions.map((option) => option.value)" placeholder="Select"
            class="p-column-filter" />
        </template>
      </Column>

      <!-- Filter for Assessment -->
      <Column field="assessment" header="Assessment" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }"
        style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.assessment }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" @change="filterCallback('assessment')"
            :options="assessmentOptions.map((option) => option.value)" placeholder="Select" class="p-column-filter" />
        </template>
      </Column>

      <!-- Filter for Follow Up -->
      <Column field="followUp" header="Follow Up" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }"
        style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.followUp }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" @change="filterCallback('followUp')"
            :options="followUpOptions.map((option) => option.value)" placeholder="Select" class="p-column-filter" />
        </template>
      </Column>

      <!-- Filter for Referrals -->
      <Column field="referrals" header="Referrals" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }"
        style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.referrals }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" @change="filterCallback('referrals')"
            :options="referralsOptions.map((option) => option.value)" placeholder="Select" class="p-column-filter" />
        </template>
      </Column>
      <Column field="year" header="Year Wise" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }"
        style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.year }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" @change="filterCallback('year')"
            :options="yearOption.map((option) => option.value)" placeholder="Select" class="p-column-filter" />
        </template>
      </Column>
      <Column field="gender" header="Gender Wise" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }"
        style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.gender }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" @change="filterCallback('gender')"
            :options="genderOptions.map((option) => option.value)" placeholder="Select" class="p-column-filter" />
        </template>
      </Column>
      <Column field="dzongkha" header="Dzongkha Wise" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }"
        style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.dzongkha }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" @change="filterCallback('dzongkha')"
            :options="dzongkhaOptions.map((option) => option.value)" placeholder="Select" class="p-column-filter" />
        </template>
      </Column>

      <Column field="location" header="Location Wise" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }"
        style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.location }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" @change="filterCallback('location')"
            :options="locationOptions.map((option) => option.value)" placeholder="Select" class="p-column-filter" />
        </template>
      </Column>

      <Column field="age" header="Age Wise" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }"
        style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.age }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" @change="filterCallback('age')"
            :options="ageOptions.map((option) => option.value)" placeholder="Select" class="p-column-filter" />
        </template>
      </Column>

      <Column field="class" header="Class Wise" :showFilterMenu="false" :filterMenuStyle="{ width: '14rem' }"
        style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.class }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" @change="filterCallback('class')"
            :options="classOptions.map((option) => option.value)" placeholder="Select" class="p-column-filter" />
        </template>
      </Column>

      <Column field="employmentHistory" header="Employment History" :showFilterMenu="false"
        :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.employmentHistory }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" @change="filterCallback('employmentHistory')"
            :options="employmentHistoryOptions.map((option) => option.value)" placeholder="Select"
            class="p-column-filter" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
// import { FilterMatchMode, FilterOperator } from 'primevue/api';

const monitorData = ref()
const filters = ref({
  global: { value: [], matchMode: FilterMatchMode.CONTAINS },
  rescreening: { value: [], matchMode: FilterMatchMode.IN },
  counselingServices: { value: [], matchMode: FilterMatchMode.IN },
  assessment: { value: [], matchMode: FilterMatchMode.IN },
  followUp: { value: [], matchMode: FilterMatchMode.IN },
  referrals: { value: [], matchMode: FilterMatchMode.IN },
  year: { value: [], matchMode: FilterMatchMode.IN },
  gender: { value: [], matchMode: FilterMatchMode.IN },
  dzongkha: { value: [], matchMode: FilterMatchMode.IN },
  location: { value: [], matchMode: FilterMatchMode.IN },
  age: { value: [], matchMode: FilterMatchMode.IN },
  class: { value: [], matchMode: FilterMatchMode.IN },
  employmentHistory: { value: [], matchMode: FilterMatchMode.IN }
})

const rescreening = ref([
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' }
])

const counselingServicesOptions = [
  { label: 'Availed', value: 'Availed' },
  { label: 'Not required', value: 'Not required' },
  { label: 'Waiting list', value: 'Waiting list' }
]

const followUpOptions = [
  { label: 'Treatment completed', value: 'Treatment completed' },
  { label: 'Undergoing treatment', value: 'Undergoing treatment' },
  { label: 'Completed counselling sessions', value: 'Completed counselling sessions' },
  { label: 'Undergoing counselling', value: 'Undergoing counselling' },
  { label: 'Unwilling to undergo treatment', value: 'Unwilling to undergo treatment' },
  { label: 'Undergone Rehabilitation', value: 'Undergone Rehabilitation' },
  { label: 'Undergoing Rehabilitation', value: 'Undergoing Rehabilitation' },
  {
    label: 'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)',
    value: 'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)'
  },
  {
    label: 'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)',
    value: 'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)'
  },
  { label: 'School-based SUD Treatment and Care', value: 'School-based SUD Treatment and Care' },
  {
    label: 'Institution-based SUD Treatment and Care ',
    value: 'Institution-based SUD Treatment and Care '
  },
  { label: 'Follow up Drug Test Conducted ', value: 'Follow up Drug Test Conducted ' },
  {
    label: 'Detention-based SUD Treatment and Care',
    value: 'Detention-based SUD Treatment and Care'
  }

  // Add more options as needed
]
const assessmentOptions = [
  { label: 'Not conducted', value: 'Not conducted' },
  { label: 'Conducted', value: 'Conducted' }
]

const referralsOptions = [
  { label: 'Clinical counsellor', value: 'Clinical counsellor' },
  { label: 'Psychiatrist', value: 'Psychiatrist' },
  { label: 'Medical Officer', value: 'Medical Officer' },
  { label: 'School counsellor', value: 'School counsellor' }
]
const yearOption = [{ label: '2021', value: '2021' }]
const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' }
]
const dzongkhaOptions = [
  { label: 'Bumthang', value: 'Bumthang' },
  { label: 'Chhukha', value: 'Chhukha' },
  { label: 'Dagana', value: 'Dagana' },
  { label: 'Gasa', value: 'Gasa' },
  { label: 'Haa', value: 'Haa' },
  { label: 'Lhuentse', value: 'Lhuentse' },
  { label: 'Mongar', value: 'Mongar' },
  { label: 'Paro', value: 'Paro' },
  { label: 'Pemagatshel', value: 'Pemagatshel' },
  { label: 'Punakha', value: 'Punakha' },
  { label: 'Samdrup Jongkhar', value: 'Samdrup Jongkhar' },
  { label: 'Samtse', value: 'Samtse' },
  { label: 'Sarpang', value: 'Sarpang' },
  { label: 'Thimphu', value: 'Thimphu' },
  { label: 'Trashigang', value: 'Trashigang' },
  { label: 'Trashiyangtse', value: 'Trashiyangtse' },
  { label: 'Trongsa', value: 'Trongsa' },
  { label: 'Tsirang', value: 'Tsirang' },
  { label: 'Wangdue Phodrang', value: 'Wangdue Phodrang' },
  { label: 'Zhemgang', value: 'Zhemgang' }
]


const locationOptions = [
  // Add your options here
];

const ageOptions = [
  { label: '0-10', value: '0-10' },
  { label: '11-20', value: '11-20' },
  { label: '21-30', value: '21-30' },
  { label: '31-40', value: '31-40' },
  { label: '41-50', value: '41-50' },
  { label: '51-60', value: '51-60' },
  { label: '61-70', value: '61-70' },
  { label: '71-80', value: '71-80' },
  { label: '81-90', value: '81-90' },
  { label: '91-100', value: '91-100' },
  { label: 'Above 100', value: 'Above 100' }
];


const classOptions = [
  { label: 'Class 6', value: 'Class 6' },
  { label: 'Class 7', value: 'Class 7' },
  { label: 'Class 8', value: 'Class 8' },
  { label: 'Class 9', value: 'Class 9' },
  { label: 'Class 10', value: 'Class 10' },
  { label: 'Class 11', value: 'Class 11' },
  { label: 'Class 12', value: 'Class 12' }
  // Add more class options as needed
];
const employmentHistoryOptions = [
  { label: 'Full-time Employee', value: 'Full-time Employee' },
  { label: 'Part-time Employee', value: 'Part-time Employee' },
  { label: 'Contractor', value: 'Contractor' },
  { label: 'Freelancer', value: 'Freelancer' },
  { label: 'Intern', value: 'Intern' }
];


const loading = ref(true)

const filteredData = computed(() => {
  let filtered = monitorData.value
  // Apply filters based on the selected values
  for (const key in filters.value) {
    if (filters.value[key].value.length > 0) {
      filtered = filtered.filter((item) => filters.value[key].value.includes(item[key]))
    }
  }
  return filtered
})

onMounted(() => {
  // Dummy Data
  monitorData.value = [
    {
      id: 1,
      rescreening: 'Yes',
      counselingServices: 'Availed',
      assessment: 'Conducted',
      followUp: 'Treatment completed',
      referrals: 'Clinical counsellor',
      year: '2023',
      gender: 'Male',
      dzongkha: 'Thimphu',
      location: 'Mothithang',
      age: '28',
      class: '8',
      employmentHistory: 'clinical'
    },
    {
      id: 2,
      rescreening: 'No',
      counselingServices: 'Not required',
      assessment: 'Not conducted',
      followUp: 'Undergoing treatment',
      referrals: 'Psychiatrist',
      year: '2020',
      gender: 'Male',
      dzongkha: 'Paro',
      location: 'Paro',
      age: '35',
      class: '9',
      employmentHistory: 'clinical'
    },
    {
      id: 3,
      rescreening: 'Yes',
      counselingServices: 'Waiting list',
      assessment: 'Not conducted',
      followUp: 'Completed counselling sessions',
      referrals: 'Medical Officer',
      year: '2023',
      gender: 'Female',
      dzongkha: 'Punakha',
      location: 'Punakha',
      age: '42',
      class: '10',
      employmentHistory: 'clinical'
    },
    {
      id: 4,
      rescreening: 'No',
      counselingServices: 'Availed',
      assessment: 'Conducted',
      followUp: 'Undergoing counselling',
      referrals: 'School counsellor',
      year: '2019',
      gender: 'Male',
      dzongkha: 'Bumthang',
      location: 'Bumthang',
      age: '25',
      class: '11',
      employmentHistory: 'clinical'
    },
    {
      id: 5,
      rescreening: 'Yes',
      counselingServices: 'Waiting list',
      assessment: 'Not conducted',
      followUp: 'Unwilling to undergo treatment',
      referrals: 'Clinical counsellor',
      year: '2023',
      gender: 'Female',
      dzongkha: 'Samtse',
      location: 'Samtse',
      age: '30',
      class: '12',
      employmentHistory: 'clinical'
    },
    {
      id: 6,
      rescreening: 'No',
      counselingServices: 'Not required',
      assessment: 'Conducted',
      followUp: 'Undergone Rehabilitation',
      referrals: 'Psychiatrist',
      year: '2022',
      gender: 'Male',
      dzongkha: 'Trongsa',
      location: 'Trongsa',
      age: '37',
      class: '6',
      employmentHistory: 'clinical'
    },
    {
      id: 7,
      rescreening: 'Yes',
      counselingServices: 'Waiting list',
      assessment: 'Conducted',
      followUp: 'Undergoing Rehabilitation',
      referrals: 'Medical Officer',
      year: '2021',
      gender: 'Female',
      dzongkha: 'Haa',
      location: 'Haa',
      age: '45',
      class: '7',
      employmentHistory: 'clinical'
    },
    {
      id: 8,
      rescreening: 'No',
      counselingServices: 'Availed',
      assessment: 'Not conducted',
      followUp: 'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)',
      referrals: 'School counsellor',
      year: '2023',
      gender: 'Male',
      dzongkha: 'Thimphu',
      location: 'Thimphu',
      age: '32',
      class: '8',
      employmentHistory: 'clinical'
    },
    {
      id: 9,
      rescreening: 'Yes',
      counselingServices: 'Waiting list',
      assessment: 'Not conducted',
      followUp: 'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)',
      referrals: 'Clinical counsellor',
      year: '2023',
      gender: 'Female',
      dzongkha: 'Paro',
      location: 'Paro',
      age: '29',
      class: '9',
      employmentHistory: 'clinical'
    },
    {
      id: 10,
      rescreening: 'No',
      counselingServices: 'Availed',
      assessment: 'Conducted',
      followUp: 'School-based SUD Treatment and Care',
      referrals: 'Medical Officer',
      year: '2024',
      gender: 'Male',
      dzongkha: 'Punakha',
      location: 'Punakha',
      age: '40',
      class: '10',
      employmentHistory: 'clinical'
    }
  ]

  loading.value = false
})
</script>
