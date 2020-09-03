<template>
  <div class="dashboard-container">
    <!-- Filter Section (Year Filter - keep if needed) -->
    <div class="filter-section mb-4">
      <div class="row align-items-center">
        <div class="col-md-4">
          <div class="year-filter">
            <label class="filter-label">Filter by Year</label>
            <div class="input-group">
              <span class="input-group-text"><i class="pi pi-calendar"></i></span>
              <Dropdown
                v-model="selectedYear"
                :options="years"
                class="year-dropdown w-full"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Year"
              />
            </div>
          </div>
        </div>
        <div class="col-md-8 text-end">
          <Button
            type="button"
            icon="pi pi-filter-slash"
            class="clear-btn"
            label="Clear Table Filters"
            outlined
            @click="clearTableFilters()"
          />
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-card">
      <DataTable
        v-model:filters="tableFilters"
        :value="displayData"
        :paginator="true"
        :rows="10"
        dataKey="id"
        filterDisplay="menu"
        :loading="isLoading"
        class="custom-table"
        :globalFilterFields="['user_data.name', 'referral_status', 'referred_by.username']"
      >
        <template #header>
          <div class="table-header">
            <h5 class="mb-0">My Referral Records</h5>
            <!-- Global search for this table can be enabled here if parent search isn't enough -->
            <!-- <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="tableFilters['global'].value" placeholder="Search in this table" />
            </span> -->
            <span class="record-count">Total Records: {{ displayData.length }}</span>
          </div>
        </template>

        <template #empty>
          <div class="empty-state">
            <i class="pi pi-folder-open empty-icon"></i>
            <p>No referrals found for you.</p>
          </div>
        </template>
        <template #loading>
          <div class="loading-state">
            <i class="pi pi-spin pi-spinner loading-icon"></i>
            <p>Loading your referrals...</p>
          </div>
        </template>

        <Column field="date" header="Date" :sortable="true" class="date-column">
          <template #body="{ data }">
            <span class="date-cell">{{ formatDate(data.date) }}</span>
          </template>
        </Column>
        <Column field="user_data.name" header="Patient Name" :sortable="true">
          <template #body="{ data }">
            <span class="user-name">{{ data.user_data?.name || 'N/A' }}</span>
          </template>
        </Column>
        <Column field="referred_by.username" header="Referred By" :sortable="true">
          <template #body="{ data }">
            {{ data.referred_by?.username || 'N/A' }}
          </template>
        </Column>
        <Column field="referral_status" header="Status" :sortable="true">
          <template #body="{ data }">
            <Tag
              :value="data.referral_status"
              :severity="getStatusSeverity(data.referral_status)"
              class="status-tag"
            />
          </template>
        </Column>
        <Column header="Actions" :exportable="false" style="min-width: 12rem">
          <template #body="{ data }">
            <template
              v-if="data.referral_status && data.referral_status.toLowerCase() === 'awaiting'"
            >
              <Button
                icon="pi pi-check"
                class="p-button-success p-button-sm me-2"
                aria-label="Accept"
                v-tooltip.top="'Accept Referral'"
                @click="showAcceptConfirmDialog(data)"
              />
              <Button
                icon="pi pi-times"
                class="p-button-danger p-button-sm"
                aria-label="Reject"
                v-tooltip.top="'Reject Referral'"
                @click="showRejectReasonDialog(data)"
              />
            </template>
            <Button
              v-else
              label="View"
              icon="pi pi-eye"
              class="action-btn p-button-rounded p-button-sm"
              @click="viewDetails(data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Details Modal (copied from your original ReferralListTable) -->
    <Dialog
      v-model:visible="showModal"
      :modal="true"
      :header="false"
      :closable="false"
      :style="{ width: '90vw', maxWidth: '1200px' }"
      :breakpoints="{ '991px': '95vw', '767px': '100vw' }"
      class="custom-modal"
    >
      <!-- ... modal content from your ReferralListTable ... -->
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">User Records</h3>
          <Button
            icon="pi pi-times"
            @click="handleModalClose"
            class="p-button-rounded p-button-text"
          />
        </div>
        <div class="modal-body" v-if="selectedUser">
          <!-- Profile Card -->
          <div class="row">
            <div class="col-lg-4 col-md-5">
              <div class="profile-card">
                <div
                  class="profile-image"
                  :style="{
                    backgroundImage: selectedUser.profile_picture
                      ? `url(${selectedUser.profile_picture})`
                      : 'none'
                  }"
                >
                  <span v-if="!selectedUser.profile_picture" class="profile-initials">{{
                    getInitials(selectedUser.first_name, selectedUser.last_name)
                  }}</span>
                </div>
                <h4 class="profile-name">
                  {{ selectedUser.first_name }} {{ selectedUser.middle_name }}
                  {{ selectedUser.last_name }}
                </h4>
                <ul class="profile-details">
                  <li><strong>Age:</strong> {{ calculateAge(selectedUser.date_of_birth) }}</li>
                  <li><strong>Sex:</strong> {{ selectedUser.gender }}</li>
                  <li><strong>Employee ID:</strong> {{ selectedUser.academy_code }}</li>
                  <li><strong>Citizen ID:</strong> {{ selectedUser.identity_number }}</li>
                  <li><strong>Nationality:</strong> {{ selectedUser.nationality }}</li>
                  <li><strong>Phone:</strong> {{ selectedUser.mob_number }}</li>
                  <li><strong>Email:</strong> {{ selectedUser.email }}</li>
                  <li><strong>Role:</strong> {{ selectedUser.role }}</li>
                  <li><strong>Active Agency:</strong> {{ selectedUser.active_agency }}</li>
                </ul>
              </div>
            </div>
            <!-- Info Sections -->
            <div class="col-lg-8 col-md-7">
              <div class="info-sections">
                <!-- Personal Details, Address, Case Status etc. -->
                <!-- Ensure all v-model and bindings are correct for selectedUser -->
                <div class="info-section">
                  <h5 class="section-title">Personal Details</h5>
                  <div class="row">
                    <div class="col-md-6">
                      <label>Mother's Name:</label
                      ><input
                        readonly
                        type="text"
                        class="form-control"
                        :value="selectedUser.mother_name"
                      />
                    </div>
                    <div class="col-md-6">
                      <label>Father's Name:</label
                      ><input
                        readonly
                        type="text"
                        class="form-control"
                        :value="selectedUser.father_name"
                      />
                    </div>
                    <div class="col-md-6">
                      <label>Parents' Occupation:</label
                      ><input
                        readonly
                        type="text"
                        class="form-control"
                        :value="selectedUser.parents_occupation"
                      />
                    </div>
                    <div class="col-md-6">
                      <label>Parental Status:</label
                      ><input
                        readonly
                        type="text"
                        class="form-control"
                        :value="selectedUser.parental_status"
                      />
                    </div>
                  </div>
                </div>
                <!-- ... other sections from your original modal ... -->
                <div class="info-section">
                  <h5 class="section-title">Case Status</h5>
                  <div class="row">
                    <div
                      class="col-md-6"
                      v-if="
                        selectedUser.service_and_treatment_details &&
                        selectedUser.service_and_treatment_details.length > 0
                      "
                    >
                      <label for="caseStatus">Case Status:</label>
                      <select
                        disabled
                        class="form-control"
                        v-model="selectedUser.service_and_treatment_details[0].case_status"
                      >
                        <option :value="null" disabled>Select Case Status</option>
                        <option value="On Going">On Going</option>
                        <option value="Case Closed">Case Closed</option>
                        <option value="Case Discontinued">Case Discontinued</option>
                      </select>
                    </div>
                    <div v-else class="col-md-12">
                      <p>No service and treatment details available.</p>
                    </div>
                  </div>
                </div>
                <!-- ... etc. ... -->
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <Button
            label="Close"
            icon="pi pi-times"
            class="p-button-secondary"
            @click="handleModalClose"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import apiClient from '@/apiClient'
import endpoints from '@/api'
import Swal from 'sweetalert2'
import { FilterMatchMode } from 'primevue/api'

const props = defineProps({
  userId: {
    type: [String, Number],
    required: true
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['refresh-needed'])

const allUserReferrals = ref([]) // All referrals for the current user
const isLoading = ref(true)
const tableFilters = ref({})
const selectedUser = ref(null) // For the details modal
const showModal = ref(false)

// Year Filter
const selectedYear = ref(new Date().getFullYear())
const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 10 }, (_, index) => ({
    label: String(currentYear - index),
    value: currentYear - index
  }))
})

const initTableFilters = () => {
  tableFilters.value = {
    global: { value: props.searchQuery || null, matchMode: FilterMatchMode.CONTAINS }
  }
}

watch(
  () => props.searchQuery,
  (newValue) => {
    if (tableFilters.value.global) {
      tableFilters.value.global.value = newValue
    } else {
      tableFilters.value.global = { value: newValue, matchMode: FilterMatchMode.CONTAINS }
    }
  }
)

const clearTableFilters = () => {
  initTableFilters() // This will reset column filters and set global from prop
  selectedYear.value = new Date().getFullYear() // Reset year filter too
}

// Filtered Data for display
const displayData = computed(() => {
  let data = allUserReferrals.value
  if (selectedYear.value) {
    data = data.filter((row) => {
      const submissionYear = row.date ? new Date(row.date).getFullYear() : null
      return submissionYear === selectedYear.value
    })
  }
  // The DataTable's internal global filter will handle props.searchQuery
  return data
})

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  try {
    return new Date(timestamp).toLocaleDateString()
  } catch (e) {
    return 'Invalid Date'
  }
}

const loadData = async () => {
  if (!props.userId) {
    isLoading.value = false
    console.warn('User ID not available for fetching referrals.')
    allUserReferrals.value = []
    return
  }
  isLoading.value = true
  try {
    const response = await apiClient.get(endpoints.getReferralList)
    if (response?.data?.referral_list && Array.isArray(response.data.referral_list)) {
      allUserReferrals.value = response.data.referral_list
        .filter((referral) => referral.referred_to && referral.referred_to.user_id === props.userId)
        .map((r) => ({ ...r, id: r.user_data.patient_id + '_' + r.date })) 
    } else {
      allUserReferrals.value = []
      console.error('Invalid referral list data:', response)
    }
  } catch (error) {
    console.error('Error loading referral list data:', error)
    allUserReferrals.value = []
  } finally {
    isLoading.value = false
  }
}

const getStatusSeverity = (status) => {
  if (!status) return 'info'
  const statusLower = status.toLowerCase()
  switch (statusLower) {
    case 'awaiting':
      return 'warning'
    case 'accepted':
      return 'success'
    case 'rejected':
      return 'danger'
    case 'pending':
      return 'info' // Or 'warning'
    default:
      return 'info'
  }
}

// --- Accept/Reject Logic (from ReferralRequestsTable) ---
const showAcceptConfirmDialog = async (referral) => {
  Swal.fire({
    title: 'Accept Referral?',
    html: `
      <p><strong>Patient:</strong> ${referral.user_data?.name || 'N/A'}</p>
      <p><strong>Referred By:</strong> ${referral.referred_by?.username || 'N/A'}</p>
      <p><strong>Date:</strong> ${formatDate(referral.date)}</p>
      <p>Do you want to accept this referral?</p>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Yes, Accept',
    cancelButtonText: 'No'
  }).then((result) => {
    if (result.isConfirmed) {
      acceptReferral(referral)
    }
  })
}

const acceptReferral = async (referral) => {
  try {
    isLoading.value = true // Indicate loading state for action
    const response = await apiClient.post(endpoints.acceptReferral, {
      referredToUserId: props.userId, // Current user is the one accepting
      patientId: referral.user_data.patient_id
    })
    Swal.fire('Accepted!', response.data.message || 'Referral has been accepted.', 'success')
    await loadData() // Refresh the list
    emit('refresh-needed') // Inform parent if necessary
  } catch (error) {
    console.error('Error accepting referral:', error)
    Swal.fire('Error', error.response?.data?.message || 'Could not accept referral.', 'error')
  } finally {
    isLoading.value = false
  }
}

const showRejectReasonDialog = async (referral) => {
  const { value: reason } = await Swal.fire({
    title: 'Reject Referral',
    input: 'textarea',
    inputLabel: 'Reason for rejection',
    inputPlaceholder: 'Enter reason here...',
    showCancelButton: true,
    confirmButtonText: 'Submit Rejection',
    confirmButtonColor: '#d33',
    inputValidator: (value) => {
      if (!value) {
        return 'You need to provide a reason!'
      }
    }
  })

  if (reason) {
    rejectReferral(referral, reason)
  }
}

const rejectReferral = async (referral, reason) => {
  try {
    isLoading.value = true
    const response = await apiClient.post(endpoints.rejectReferral, {
      referredToUserId: props.userId,
      patientId: referral.user_data.patient_id,
      reason: reason
    })
    Swal.fire('Rejected!', response.data.message || 'Referral has been rejected.', 'success')
    await loadData() // Refresh
    emit('refresh-needed')
  } catch (error) {
    console.error('Error rejecting referral:', error)
    Swal.fire('Error', error.response?.data?.message || 'Could not reject referral.', 'error')
  } finally {
    isLoading.value = false
  }
}

// --- View Details Modal Logic (from original ReferralListTable) ---
const viewDetails = async (referralData) => {
  try {
    if (referralData?.user_data?.patient_id) {
      isLoading.value = true // Use main loading or a specific modal loading
      const patientId = referralData.user_data.patient_id
      const response = await apiClient.get(
        `${endpoints.getUserMonitoringDetails}?user_id=${patientId}`
      )
      selectedUser.value = response.data
      showModal.value = true
    } else {
      console.error('Patient ID is missing for viewing details.')
      Swal.fire('Error', 'Cannot fetch details: Patient ID missing.', 'error')
    }
  } catch (error) {
    console.error('Error fetching user details for modal:', error)
    Swal.fire('Error', 'Could not fetch patient details.', 'error')
  } finally {
    isLoading.value = false
  }
}

const handleModalClose = () => {
  showModal.value = false
  selectedUser.value = null
}

// Helper for modal profile image initials
const getInitials = (firstName, lastName) => {
  let initials = ''
  if (firstName) initials += firstName.charAt(0)
  if (lastName) initials += lastName.charAt(0)
  return initials.toUpperCase() || 'N/A'
}
// Helper for modal age calculation
const calculateAge = (dobString) => {
  if (!dobString) return 'N/A'
  const birthDate = new Date(dobString)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age >= 0 ? age : 'N/A'
}

onMounted(async () => {
  initTableFilters()
  if (props.userId) {
    await loadData()
  } else {
    isLoading.value = false
  }
})

watch(
  () => props.userId,
  async (newUserId) => {
    if (newUserId) {
      await loadData()
    } else {
      allUserReferrals.value = []
      isLoading.value = false
    }
  }
)
</script>

<style scoped>
/* Styles from your original ReferralListTable */
.hwss-primary {
  background-color: #2c6975 !important;
  color: #ffffff !important;
}
.p-dialog .p-dialog-content {
  padding: 0 !important;
}
.dashboard-container {
  padding: 1rem 0;
  background: transparent;
} /* Adjusted padding */
.filter-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.filter-label {
  font-weight: 600;
  color: #344767;
  margin-bottom: 0.5rem;
}
.year-dropdown {
  width: 100%;
  box-shadow: none !important;
}
.year-dropdown:hover {
  border-color: #2c6975;
}
.clear-btn {
  background: #fff;
  border: 1px solid #2c6975;
  color: #2c6975;
  transition: all 0.3s ease;
}
.clear-btn:hover {
  background: #2c6975;
  color: white;
}
.table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-top: 1rem;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}
.record-count {
  color: #6c757d;
  font-size: 0.9rem;
}
.custom-table ::v-deep(.p-datatable-thead > tr > th) {
  background: #f8f9fa;
  color: #344767;
  font-weight: 600;
  padding: 1rem;
  border: none;
}
.custom-table ::v-deep(.p-datatable-tbody > tr:hover) {
  background: #f8f9fa;
}
.date-cell {
  color: #344767;
  font-weight: 500;
}
.user-name {
  color: #344767;
  font-weight: 500;
}
.status-tag {
  border-radius: 12px;
  padding: 0.25rem 0.75rem;
  min-width: 80px;
  display: inline-flex;
  justify-content: center;
}
.action-btn {
  background: #2c6975;
  border: none;
  transition: all 0.3s ease;
}
.action-btn:hover {
  background: #1d4851;
  transform: translateY(-1px);
}
.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: #6c757d;
}
.empty-icon,
.loading-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #2c6975;
}

/* Styles for Modal from original component */
.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  margin: 0 auto 1rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e9ecef; /* Fallback background */
  color: #495057; /* Fallback text color for initials */
  font-size: 2rem;
  font-weight: bold;
}
.profile-initials {
  /* For when there's no image */
  /* Style as needed */
}
.modal-content {
  background: white;
}
.modal-header {
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px 8px 0 0;
}
.modal-title {
  margin: 0;
  font-size: 1.2rem;
}
.modal-body {
  padding: 2rem;
  max-height: 70vh;
  overflow-y: auto;
}
.profile-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}
.profile-name {
  color: #2b656f;
  text-align: center;
  margin-bottom: 1rem;
}
.profile-details {
  list-style-type: none;
  padding: 0;
}
.profile-details li {
  margin-bottom: 0.5rem;
}
.info-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
} /* Reduced gap */
.info-section {
  background: #f8f9fa;
  border-radius: 8px; /*box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);*/
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}
.section-title {
  color: #2b656f;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
}
.form-control[readonly],
.form-control[disabled] {
  background-color: #e9ecef;
  opacity: 1;
}
.modal-footer {
  border-top: 1px solid #e6f3f5;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
}
</style>