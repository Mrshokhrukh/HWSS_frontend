<template>
  <DataTable v-model:filters="filters" :value="filteredRowData" :paginator="true" :rows="10" :dataKey="'id'" filterMode="menu"
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
        {{ data.user_data.name ? data.user_data.name : '-- No Data --' }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['user_data.name']" type="text" class="p-column-filter"
          placeholder="Search by name" />
      </template>
    </Column>
    <Column field="user_data.age" header="Age" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '8rem' }">
      <template #body="{ data }">
        {{ data.user_data.age || '-- No Data --' }}
      </template>
    </Column>
    <Column field="user_data.gender" header="Gender" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '8rem' }">
      <template #body="{ data }">
        {{ data.user_data.gender ? data.user_data.gender : '-- No Data --' }}
      </template>
    </Column>
    <Column field="referred_to.name" header="Referred To" :filterMatchMode="'contains'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ data.referred_to.name ? data.referred_to.name : '-- No Data --' }}
      </template>
    </Column>
    <Column field="referred_by.username" header="Referred By" :filterMatchMode="'contains'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ data.referred_by.username ? data.referred_by.username : '-- No Data --' }}
      </template>
    </Column>
    <Column field="referral_status" header="Referral Status" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '10rem' }">
      <template #body="{ data }">
        {{ data.referral_status ? data.referral_status : '-- No Data --' }}
      </template>
    </Column>
    <Column field="assessment_status" header="Assessment Status" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ data.assessment_status ? data.assessment_status : '-- No Data --' }}
      </template>
    </Column>
    <Column field="counseling_status" header="Counseling Status" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ data.counseling_status ? data.counseling_status : '-- No Data --' }}
      </template>
    </Column>
    <Column field="follow_up" header="Follow Up" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ data.follow_up ? data.follow_up : '-- No Data --' }}
      </template>
    </Column>
    <Column field="comments" header="Comments" :filterMatchMode="'contains'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ data.comments ? data.comments : '-- No Data --' }}
      </template>
    </Column>

    <Column :style="{ 'min-width': '8rem' }" header="ACTIONS">
      <template #body="{ data }">
        <Button type="button" icon="pi pi-check" label="Accept/Reject" class="btn hwss-btn"
          @click="showCustomConfirmDialog(data)" />
      </template>
    </Column>

  </DataTable>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import Swal from 'sweetalert2';

const referrals = ref([]);
const rowData = ref([]);
const filters = ref({});

const filteredRowData = computed(() => {
  return rowData.value.filter(referral => referral.referral_status.toLowerCase() === 'awaiting');
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return '-- No Data --';
  } else {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
};

const loadData = async () => {
  const counselor_id = JSON.parse(localStorage.getItem('userDetailsStore'));
  try {
    const response = await axios.get(endpoints.getReferralList);
    referrals.value = response.data.referral_list.filter(referral => referral.referred_to.user_id === counselor_id.user.id);
    rowData.value = referrals.value;
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

const clearFilter = () => {
  filters.value = {};
};

const showCustomConfirmDialog = async (referral) => {
  Swal.fire({
    title: 'Confirm Action',
    html: `
      <p><strong>Referred By:</strong> ${referral.referred_by.username || '-- No Data --'}</p>
      <p><strong>Date of Referral:</strong> ${formatDate(referral.date)}</p>
      <p><strong>Patient Name:</strong> ${referral.user_data.name || '-- No Data --'}</p>
      <p>Do you want to accept or reject this referral?</p>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Accept',
    cancelButtonText: 'Reject'
  }).then((result) => {
    if (result.isConfirmed) {
      acceptReferral(referral);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      showRejectReasonDialog(referral);
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
  try {
    const response = await axios.post(endpoints.acceptReferral, {
      referredToUserId: referral.referred_to.user_id,
      patientId: referral.user_data.patient_id
    });
    Swal.fire({
      icon: 'success',
      title: 'Referral Accepted',
      text: response.data.message,
      timer: 1500
    });
    updateReferralStatus(referral, 'accepted');
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
    const response = await axios.post(endpoints.rejectReferral, {
      referredToUserId: referral.referred_to.user_id,
      patientId: referral.user_data.patient_id,
      reason
    });
    Swal.fire({
      icon: 'success',
      title: 'Referral Rejected',
      text: response.data.message
    });
    updateReferralStatus(referral, 'rejected');
  } catch (error) {
    console.error('Error rejecting referral:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while rejecting the referral.'
    });
  }
};

const updateReferralStatus = (referral, newStatus) => {
  const index = rowData.value.findIndex(r => r.id === referral.id);
  if (index !== -1) {
    rowData.value[index].referral_status = newStatus;
    rowData.value = [...rowData.value]; // Trigger reactivity
  }
};

onMounted(async () => {
  await loadData();
});
</script>