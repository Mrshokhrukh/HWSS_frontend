<template>
  <div class="card">
    <DataTable v-model:filters="filters" :value="acceptedReferrals" paginator :rows="10" dataKey="id"
      filterDisplay="menu" :loading="loading" scrollable scrollHeight="400px"
      :globalFilterFields="['name', 'age', 'gender', 'date', 'referral_status', 'referred_by', 'referred_to', 'assessment_status', 'counseling_status', 'follow_up', 'comments']"
      tableStyle="min-width: 75rem" striped class="p-datatable-sm">
      <template #header>
        <div class="flex justify-content-between">
          <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
        </div>
      </template>
      <template #empty> No accepted referrals found. </template>
      <template #loading> Loading referrals data. Please wait. </template>

      <Column field="date" header="Date" :sortable="true">
        <template #body="{ data }">
          {{ new Date(data.date).toLocaleDateString() }}
        </template>
      </Column>
      <Column field="name" header="Name" :sortable="true" />
      <Column field="age" header="Age" :sortable="true" />
      <Column field="gender" header="Gender" :sortable="true" />
      <Column field="referred_to" header="Referred To" :sortable="true" />
      <Column field="referred_by" header="Referred By" :sortable="true" />
      <Column field="referral_status" header="Status" :sortable="true">
        <template #body="{ data }">
          <Tag :value="data.referral_status" :severity="getStatusSeverity(data.referral_status)" />
        </template>
      </Column>
      <Column field="assessment_status" header="Assessment" :sortable="true">
        <template #body="{ data }">
          <Tag :value="data.assessment_status" :severity="getStatusSeverity(data.assessment_status)" />
        </template>
      </Column>
      <Column field="counseling_status" header="Counseling" :sortable="true">
        <template #body="{ data }">
          <Tag :value="data.counseling_status" :severity="getStatusSeverity(data.counseling_status)" />
        </template>
      </Column>
      <Column field="follow_up" header="Follow-up" :sortable="true" />
      <Column field="comments" header="Comments" :sortable="true">
        <template #body="{ data }">
          <Button icon="pi pi-comment" class="p-button-text" @click="showComments(data.comments)" />
        </template>
      </Column>
    </DataTable>
  </div>

  <Dialog v-model:visible="commentsVisible" header="Comments" :style="{ width: '50vw' }">
    <p>{{ selectedComments }}</p>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import axios from 'axios';
import endpoints from '@/api';

const filters = ref({});
const loading = ref(true);
const referralList = ref([]);
const serviceAndTreatmentList = ref([]);
const commentsVisible = ref(false);
const selectedComments = ref('');
const currentUserId = ref(null);

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

const getUserDetailsFromLocalStorage = () => {
  const userDetailsString = localStorage.getItem('userDetailsStore');
  if (userDetailsString) {
    try {
      const userDetails = JSON.parse(userDetailsString);
      currentUserId.value = userDetails.user.id;
    } catch (error) {
      console.error('Error parsing user details from local storage:', error);
    }
  } else {
    console.error('User details not found in local storage');
  }
};


const acceptedReferrals = computed(() => {
  return combinedReferrals.value.filter(referral =>
    referral.referral_status.toLowerCase() === 'accepted' &&
    referral.referred_to_id === currentUserId.value
  );
});

const combinedReferrals = computed(() => {
  return referralList.value.map(referral => {
    const serviceData = serviceAndTreatmentList.value.find(service => service.user.id === referral.user_data.patient_id) || {};
    return {
      id: referral.user_data.patient_id,
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
      comments: serviceData.comments || 'No comments',
      referred_to_id: referral.referred_to.user_id
    };
  });
});


const getStatusSeverity = (status) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('complete') || statusLower === 'accepted') return 'success';
  if (statusLower.includes('progress') || statusLower === 'scheduled') return 'warning';
  if (statusLower.includes('not') || statusLower === 'pending') return 'danger';
  return 'info';
};

const showComments = (comments) => {
  selectedComments.value = comments;
  commentsVisible.value = true;
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
  getUserDetailsFromLocalStorage();
  loading.value = true;
  try {
    await fetchData();
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.p-datatable .p-datatable-thead>tr>th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
}

.p-datatable .p-datatable-tbody>tr {
  transition: box-shadow 0.2s;
}

.p-datatable .p-datatable-tbody>tr:hover {
  background-color: #e9ecef;
  cursor: pointer;
}

.p-tag {
  width: 80px;
  justify-content: center;
}
</style>