# ReferralRequestTable.vue
<template>
  <DataTable
    v-model:filters="filters"
    :value="filteredRowData"
    :paginator="true"
    :rows="10"
    dataKey="id"
    filterMode="menu"
    :filters="tableFilters"
    :emptyMessage="'No referral requests found.'"
    :loading="isLoading"
  >
    <template #header>
      <div class="flex justify-content-between">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear"
          outlined
          @click="clearFilter()"
        />
      </div>
    </template>

    <template #empty>No referral requests found.</template>
    <template #loading>Loading referral requests data. Please wait.</template>

    <!-- Standard Columns -->
    <Column
      v-for="col in columns"
      :key="col.field"
      :field="col.field"
      :header="col.header"
      :filterMatchMode="col.filterMatchMode"
      :sortable="true"
      :style="{ 'min-width': col.minWidth }"
    >
      <template #body="{ data }">
        <template v-if="col.field === 'date'">
          {{ formatDate(getNestedValue(data, col.field)) }}
        </template>
        <template v-else>
          {{ getNestedValue(data, col.field) || '-- No Data --' }}
        </template>
      </template>
      <template #filter="{ filterModel }" v-if="col.filterable">
        <InputText
          v-model="filterModel[col.field]"
          type="text"
          class="p-column-filter"
          :placeholder="`Search by ${col.header.toLowerCase()}`"
        />
      </template>
    </Column>

    <!-- Actions Column -->
    <Column :style="{ 'min-width': '8rem' }" header="ACTIONS">
      <template #body="{ data }">
        <Button
          type="button"
          icon="pi pi-check"
          label="Accept/Reject"
          class="btn hwss-btn"
          @click="showCustomConfirmDialog(data)"
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import apiClient from '@/apiClient'
import endpoints from '@/api'
import Swal from 'sweetalert2'

// State management
const referrals = ref([])
const rowData = ref([])
const filters = ref({})
const isLoading = ref(true)

// Table configuration
const columns = [
  {
    field: 'date',
    header: 'Date',
    filterMatchMode: 'startsWith',
    minWidth: '12rem',
    filterable: true
  },
  {
    field: 'user_data.name',
    header: 'Name',
    filterMatchMode: 'contains',
    minWidth: '12rem',
    filterable: true
  },
  {
    field: 'user_data.age',
    header: 'Age',
    filterMatchMode: 'equals',
    minWidth: '8rem',
    filterable: true
  },
  {
    field: 'user_data.gender',
    header: 'Gender',
    filterMatchMode: 'equals',
    minWidth: '8rem',
    filterable: true
  },
  {
    field: 'referred_to.name',
    header: 'Referred To',
    filterMatchMode: 'contains',
    minWidth: '12rem',
    filterable: true
  },
  {
    field: 'referred_by.username',
    header: 'Referred By',
    filterMatchMode: 'contains',
    minWidth: '12rem',
    filterable: true
  },
  {
    field: 'referral_status',
    header: 'Referral Status',
    filterMatchMode: 'equals',
    minWidth: '10rem',
    filterable: true
  },
  {
    field: 'assessment_status',
    header: 'Assessment Status',
    filterMatchMode: 'equals',
    minWidth: '12rem',
    filterable: true
  },
  {
    field: 'counseling_status',
    header: 'Counseling Status',
    filterMatchMode: 'equals',
    minWidth: '12rem',
    filterable: true
  },
  {
    field: 'follow_up',
    header: 'Follow Up',
    filterMatchMode: 'equals',
    minWidth: '12rem',
    filterable: true
  },
  {
    field: 'comments',
    header: 'Comments',
    filterMatchMode: 'contains',
    minWidth: '12rem',
    filterable: true
  }
]

// Computed properties
const tableFilters = computed(() => ({
  global: { matchMode: 'contains' }
}))

const filteredRowData = computed(() => {
  return rowData.value.filter((referral) => referral.referral_status.toLowerCase() === 'awaiting')
})

// Helper functions
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const formatDate = (dateString) => {
  if (!dateString) return '-- No Data --'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-- No Data --'

  return date.toISOString().split('T')[0]
}

// Data loading
const loadData = async () => {
  isLoading.value = true
  try {
    const counselor_id = JSON.parse(localStorage.getItem('userDetailsStore'))
    const response = await apiClient.get(endpoints.getReferralList)

    if (response?.data?.referral_list) {
      referrals.value = response.data.referral_list.filter(
        (referral) => referral.referred_to.user_id === counselor_id.user.id
      )
      rowData.value = referrals.value
    }
  } catch (error) {
    console.error('Error loading data:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load referral data'
    })
  } finally {
    isLoading.value = false
  }
}

// Filter management
const clearFilter = () => {
  filters.value = {}
}

// Referral actions
const showCustomConfirmDialog = async (referral) => {
  const result = await Swal.fire({
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
  })

  if (result.isConfirmed) {
    await acceptReferral(referral)
  } else if (result.dismiss === Swal.DismissReason.cancel) {
    await showRejectReasonDialog(referral)
  }
}

const showRejectReasonDialog = async (referral) => {
  const result = await Swal.fire({
    title: 'Reject Reason',
    input: 'text',
    inputLabel: 'Please provide a reason for rejection',
    inputPlaceholder: 'Reason...',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Submit',
    cancelButtonText: 'Cancel',
    inputValidator: (value) => {
      if (!value) return 'You need to provide a reason!'
    }
  })

  if (result.isConfirmed) {
    await rejectReferral(referral, result.value)
  }
}

const acceptReferral = async (referral) => {
  try {
    const response = await apiClient.post(endpoints.acceptReferral, {
      referredToUserId: referral.referred_to.user_id,
      patientId: referral.user_data.patient_id
    })

    await Swal.fire({
      icon: 'success',
      title: 'Referral Accepted',
      text: response.data.message,
      timer: 1500
    })

    updateReferralStatus(referral, 'accepted')
  } catch (error) {
    console.error('Error accepting referral:', error)
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while accepting the referral.'
    })
  }
}

const rejectReferral = async (referral, reason) => {
  try {
    const response = await apiClient.post(endpoints.rejectReferral, {
      referredToUserId: referral.referred_to.user_id,
      patientId: referral.user_data.patient_id,
      reason
    })

    await Swal.fire({
      icon: 'success',
      title: 'Referral Rejected',
      text: response.data.message
    })

    updateReferralStatus(referral, 'rejected')
  } catch (error) {
    console.error('Error rejecting referral:', error)
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while rejecting the referral.'
    })
  }
}

const updateReferralStatus = (referral, newStatus) => {
  const index = rowData.value.findIndex((r) => r.id === referral.id)
  if (index !== -1) {
    rowData.value = [
      ...rowData.value.slice(0, index),
      { ...rowData.value[index], referral_status: newStatus },
      ...rowData.value.slice(index + 1)
    ]
  }
}

// Lifecycle hooks
onMounted(async () => {
  await loadData()
})
</script>

<style scoped>
.hwss-btn {
  background-color: #2c6975 !important;
  color: #ffffff !important;
  border: none;
}

.p-column-filter {
  width: 100%;
}
</style>