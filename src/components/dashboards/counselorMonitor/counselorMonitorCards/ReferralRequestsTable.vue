<template>
  <DataTable v-model:filters="filters" :value="rowData" :paginator="true" :rows="10" :dataKey="'id'" filterMode="menu"
    :filters="{ 'global': { matchMode: 'contains' } }" :emptyMessage="'No referral requests found.'"
    :loading="rowData.length === 0">
    <template #header>
      <div class="flex justify-content-between">
        <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
      </div>
    </template>
    <template #empty> No referral requests found. </template>
    <template #loading> Loading referral requests data. Please wait. </template>
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
    <!-- Include additional columns -->

    <Column field="user_data.age" header="Age" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '8rem' }" />
    <Column field="user_data.gender" header="Gender" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '8rem' }" />
    <Column field="referred_to.name" header="Referred To" :filterMatchMode="'contains'" :sortable="true"
      :style="{ 'min-width': '12rem' }" />
    <Column field="referred_by.username" header="Referred By" :filterMatchMode="'contains'" :sortable="true"
      :style="{ 'min-width': '12rem' }" />
    <Column field="referral_status" header="Referral Status" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '10rem' }" />
    <Column field="assessment_status" header="Assessment Status" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '12rem' }" />
    <Column field="counseling_status" header="Counseling Status" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '12rem' }" />
    <Column field="follow_up" header="Follow Up" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '12rem' }" />
    <Column field="comments" header="Comments" :filterMatchMode="'contains'" :sortable="true"
      :style="{ 'min-width': '12rem' }" />

    <Column :style="{ 'min-width': '8rem' }" header="Actions">
      <template #body="{ rowData }">
        <Button type="button" icon="pi pi-pencil" label="View" class="btn hwss-btn"
          @click="showCustomConfirmDialog(rowData)" />
      </template>
    </Column>

  </DataTable>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import Swal from 'sweetalert2';

const referrals = ref([]);
const rowData = ref([]);
const filters = ref({});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return ''; 
  } else {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
};

const loadData = async () => {
  const counselor_id = JSON.parse(localStorage.getItem('userDetailsStore'));
  console.log(counselor_id.user.id);
  try {
    const response = await axios.get(endpoints.getReferralList);
    console.log(response.data)
    referrals.value = response.data.referral_list.filter(referral => referral.referred_to.user_id === counselor_id.user.id);
    rowData.value = referrals.value;
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

const clearFilter = () => {
  filters.value = {};
};

const showCustomConfirmDialog = async () => {
  await loadData(); // Wait for data to be loaded
  Swal.fire({
    title: 'Confirm Action',
    text: 'Do you want to accept or reject this referral?',
    icon: false,
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Accept',
    cancelButtonText: 'Reject'
  }).then((result) => {
    if (result.isConfirmed) {
      acceptReferral(rowData.value[0]); // Pass the first element of rowData
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      showRejectReasonDialog(rowData.value[0]);
    }
  });
};


const showRejectReasonDialog = (referral) => {
  Swal.fire({
    title: 'Reject Reason',
    input: 'text',
    inputLabel: 'Please provide a reason for rejection',
    inputPlaceholder: 'Reason...',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Submit',
    cancelButtonText: 'Cancel',
    inputValidator: (value) => {
      if (!value) {
        return 'You need to provide a reason!';
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      rejectReferral(referral, result.value);
    }
  });
};

const acceptReferral = async (referral) => {
  console.log('Referral:', referral); 
  try {
    const referredToUserId = referral.referred_to.user_id;
    const patientId = referral.user_data.patient_id;

    const response = await axios.post(endpoints.acceptReferral, { referredToUserId, patientId });
    console.log('Referral accepted:', referral);
    Swal.fire({
      icon: 'success',
      title: 'Referral Accepted',
      text: response.data.message,
      timer: 1500
    });
    setTimeout(() => {
      window.location.reload();
    },2000)
  } catch (error) {
    console.error('Error accepting referral:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while accepting the referral.'
    });
  }
};


const rejectReferral = async (referral, reason) => {
  try {
    const referredToUserId = referral.referred_to.user_id;
    const patientId = referral.user_data.patient_id;

    const response = await axios.post(endpoints.rejectReferral, { referredToUserId, patientId, reason });
    // Optionally, you can reload data or show a success message
    console.log('Referral rejected with reason:', referral, reason);
    Swal.fire({
      icon: 'success',
      title: 'Referral Rejected', 
      text: response.data.message
    });
  } catch (error) {
    console.error('Error rejecting referral:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while rejecting the referral.'
    });
  }
};

onMounted(async () => {
  await loadData();
});
</script>
