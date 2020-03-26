<template>
  <div class="dashboard-container">
    <!-- Header Section -->
    <div class="filter-section mb-4">
      <div class="row align-items-center">
        <div class="col-md-4">
          <div class="year-filter">
            <label class="filter-label">Filter by Year</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="pi pi-calendar"></i>
              </span>
              <Dropdown v-model="selectedYear" :options="years" class="year-dropdown" optionLabel="label"
                optionValue="value" placeholder="Select Year" />
            </div>
          </div>
        </div>
        <div class="col-md-8 text-end">
          <Button type="button" icon="pi pi-filter-slash" class="clear-btn" label="Clear Filters" outlined
            @click="clearFilter()" />
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-card">
      <DataTable
        v-model:filters="filters"
        :value="filteredData"
        :paginator="true"
        :rows="10"
        :dataKey="'id'"
        filterMode="menu"
        :filters="{ 'global': { matchMode: 'contains' } }"
        :emptyMessage="'No referrals found.'"
        :loading="isLoading" 
        class="custom-table">

        <!-- Table Header -->
        <template #header>
          <div class="table-header">
            <h5 class="mb-0">Referral Records</h5>
            <span class="record-count">Total Records: {{ filteredData.length }}</span>
          </div>
        </template>

        <!-- Empty State -->
        <template #empty>
         <!-- This will now show correctly when isLoading is false AND filteredData is empty -->
          <div class="empty-state">
            <i class="pi pi-folder-open empty-icon"></i>
            <p>No referrals found</p>
          </div>
        </template>

        <!-- Loading State -->
        <template #loading>
          <!-- This will now show ONLY when isLoading is true -->
          <div class="loading-state">
            <i class="pi pi-spin pi-spinner loading-icon"></i>
            <p>Loading referrals data...</p>
          </div>
        </template>

        <!-- Table Columns -->
        <Column field="date" header="Date" :sortable="true" class="date-column">
          <template #body="{ data }">
            <span class="date-cell">{{ formatDate(data.date) }}</span>
          </template>
          <template #filter="{ filterModel }">
            <Calendar v-model="filterModel['date']" dateFormat="dd/mm/yy" placeholder="Search date" />
          </template>
        </Column>

        <Column field="user_data.name" header="Name" :sortable="true">
          <template #body="{ data }">
            <div class="name-cell">
              <span class="user-name">{{ data.user_data.name || 'No Data' }}</span>
            </div>
          </template>
        </Column>

        <Column field="user_data.age" header="Age" :sortable="true">
          <template #body="{ data }">
            <span class="age-badge">{{ data.user_data.age || 'N/A' }}</span>
          </template>
        </Column>

        <Column field="user_data.gender" header="Sex" :sortable="true">
          <template #body="{ data }">
            <span :class="['gender-badge', data.user_data.gender.toLowerCase()]">
              {{ data.user_data.gender || 'N/A' }}
            </span>
          </template>
        </Column>

        <Column field="referred_to.name" header="Referred To" :sortable="true">
          <template #body="{ data }">
            <div class="referral-cell">
              <i class="pi pi-user mr-2"></i>
              <span>{{ extractFullName(data.referred_to.name) || 'No Data' }}</span>
            </div>
          </template>
        </Column>

        <Column field="referral_status" header="Status" :sortable="true">
          <template #body="{ data }">
            <Tag :value="data.referral_status" :severity="getStatusSeverity(data.referral_status)" class="status-tag" />
          </template>
        </Column>

        <Column :exportable="false" style="min-width: 8rem">
          <template #body="{ data }">
            <Button label="View" icon="pi pi-eye" class="action-btn p-button-rounded" @click="viewDetails(data)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Details Modal -->
    <Dialog v-model:visible="showModal" :modal="true" :header="false" :closable="false"
      :style="{ width: '90vw', maxWidth: '1200px' }" :breakpoints="{ '991px': '95vw', '767px': '100vw' }"
      class="custom-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">User Records</h3>
          <Button icon="pi pi-times" @click="handleModalClose" class="p-button-rounded p-button-text" />
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-lg-4 col-md-5">
              <div class="profile-card">
                <div class="profile-image" :style="{ backgroundImage: `url(${selectedUser.profile_picture})` }"></div>
                <h4 class="profile-name">{{ selectedUser.first_name }} {{ selectedUser.middle_name }} {{
                  selectedUser.last_name }}</h4>
                <ul class="profile-details">
                  <li><strong>Age:</strong> {{ selectedUser.date_of_birth }}</li>
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
            <div class="col-lg-8 col-md-7">
              <div class="info-sections">
                <div class="info-section">
                  <h5 class="section-title">Personal Details</h5>
                  <div class="row">
                    <div class="col-md-6">
                      <label>Mother's Name:</label>
                      <input readonly="true" type="text" class="form-control" v-model="selectedUser.mother_name">
                    </div>
                    <div class="col-md-6">
                      <label>Father's Name:</label>
                      <input readonly="true" type="text" class="form-control" v-model="selectedUser.father_name">
                    </div>
                    <div class="col-md-6">
                      <label>Parents' Occupation:</label>
                      <input readonly="true" type="text" class="form-control" v-model="selectedUser.parents_occupation">
                    </div>
                    <div class="col-md-6">
                      <label>Parental Status:</label>
                      <input readonly="true" type="text" class="form-control" v-model="selectedUser.parental_status">
                    </div>
                  </div>
                </div>

                <div class="info-section">
                  <h5 class="section-title">Address Information</h5>
                  <div class="row">
                    <div class="col-md-6">
                      <h6>Permanent Address</h6>
                      <div class="address-details">
                        <p><strong>Village:</strong> {{ selectedUser.perm_add_village }}</p>
                        <p><strong>Gewog:</strong> {{ selectedUser.perm_add_gewog }}</p>
                        <p><strong>Dzongkhag:</strong> {{ selectedUser.perm_add_dzongkhag }}</p>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <h6>Present Address</h6>
                      <div class="address-details">
                        <p><strong>Village:</strong> {{ selectedUser.ps_add_village }}</p>
                        <p><strong>Gewog:</strong> {{ selectedUser.ps_add_gewog }}</p>
                        <p><strong>Dzongkhag:</strong> {{ selectedUser.ps_add_dzongkhag }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="info-section">
                  <h5 class="section-title">Case Status</h5>
                  <div class="row">
                    <div class="col-md-6"
                      v-if="selectedUser.service_and_treatment_details && selectedUser.service_and_treatment_details.length > 0">
                      <label for="caseStatus">Case Status:</label>
                      <select disabled class="form-control"
                        v-model="selectedUser.service_and_treatment_details[0].case_status">
                        <option :value="null" disabled>Select Case Status</option>
                        <option value="On Going">On Going</option>
                        <option value="Case Closed">Case Closed</option>
                        <option value="Case Discontinued">Case Discontinued</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="info-section"
                  v-if="selectedUser.substance_risk_measurement_details && selectedUser.substance_risk_measurement_details.length > 0">
                  <h5 class="section-title">Severity</h5>
                  <div class="severity-tags">
                    <template v-for="(substance, index) in selectedUser.substance_risk_measurement_details"
                      :key="index">
                      <div v-if="substance.risk_flag !== 'none'" class="severity-tag">
                        <span class="substance-name">{{ substance.substance_name.split('(')[0].trim() }}:</span>
                        <Tag :value="substance.risk_flag" :style="getSeverityStyles(substance.risk_flag)" rounded></Tag>
                      </div>
                    </template>
                  </div>
                </div>

                <div class="info-section" v-if="selectedUser">
                  <h5 class="section-title">Additional Information</h5>
                  <p><strong>Non-Medical Drug use through injection:</strong> <span class="highlight">{{
                    selectedUser.injection_use ? 'YES' : 'Not Applicable' }}</span></p>
                  <p><strong>Past Mental Health Disorder history:</strong> <span class="highlight">{{
                    selectedUser.past_disorder ? selectedUser.past_disorder : 'No Diagnosis' }}</span></p>
                </div>

                <div class="info-section" :class="{ 'greyout': selfRole === 'trained_professional' }"
                  v-if="selectedUser.service_and_treatment_details && selectedUser.service_and_treatment_details.length > 0">
                  <h5 class="section-title">Services and Treatment</h5>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="assessmentStatus">Assessment Status:</label>
                      <select disabled class="form-control" id="assessmentStatus"
                        v-model="selectedUser.service_and_treatment_details[0].assessment_status">
                        <option value="Not Conducted">Not Conducted</option>
                        <option value="Conducted">Conducted</option>
                      </select>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="counselingStatus">Counseling Status:</label>
                      <select disabled class="form-control" id="counselingStatus"
                        v-model="selectedUser.service_and_treatment_details[0].counseling">
                        <option value="Availed">Availed</option>
                        <option value="Not Required">Not Required</option>
                        <option value="Waiting List">Waiting List</option>
                      </select>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="followUpStatus">Follow Up Status:</label>
                      <select disabled class="form-control" id="followUpStatus"
                        v-model="selectedUser.service_and_treatment_details[0].follow_up">
                        <option value="Treatment Completed">Treatment Completed</option>
                        <option value="Undergoing Treatment">Undergoing Treatment</option>
                        <option value="Completed Counselling Sessions">Completed Counselling Sessions</option>
                        <option value="Unwilling to Undergo Treatment">Unwilling to Undergo Treatment</option>
                        <option value="Undergone Rehabilitation">Undergone Rehabilitation</option>
                        <option value="Undergoing Rehabilitation">Undergoing Rehabilitation</option>
                        <option value="Hospital-based Outpatient SUD Treatment and Care (Primary Phase)">Hospital-based
                          Outpatient SUD Treatment and Care (Primary Phase)</option>
                        <option value="Hospital-based Outpatient SUD Treatment and Care (Continuing Care)">
                          Hospital-based
                          Outpatient SUD Treatment and Care (Continuing Care)</option>
                        <option value="School-based SUD Treatment and Care">School-based SUD Treatment and Care</option>
                        <option value="Institution-based SUD Treatment and Care">Institution-based SUD Treatment and
                          Care
                        </option>
                        <option value="Follow-up Drug Test Conducted">Follow-up Drug Test Conducted</option>
                        <option value="Detention-based SUD Treatment and Care">Detention-based SUD Treatment and Care
                        </option>
                      </select>
                    </div>
                    <div class="col-md-12 mb-3">
                      <label for="comments">Comments:</label>
                      <textarea readonly="true" class="form-control" id="comments"
                        v-model="selectedUser.service_and_treatment_details[0].comments"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <Button label="Close" icon="pi pi-times" class="p-button-secondary" @click="handleModalClose" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';

const rowData = ref([]);
const isLoading = ref(true);
const filters = ref({});
const selectedUser = ref(null);
const showModal = ref(false);

// Year Filter
const selectedYear = ref(new Date().getFullYear()); // Default to current year
const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, index) => ({
    label: currentYear - index,
    value: currentYear - index,
  }));
});

// Filtered Data
const filteredData = computed(() => {
  return rowData.value.filter(row => {
    const submissionDate = row.date ? new Date(row.date).getFullYear() : null;
    return submissionDate === selectedYear.value;
  });
});

const statusOptions = [
  { label: 'Awaiting', value: 'awaiting' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
];

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
};

const loadData = async () => {
  isLoading.value = true; // <-- Set loading to true before fetching
  try {
    const response = await axios.get(endpoints.getReferralList);
    // Ensure rowData is always an array, even if API returns null/undefined
    rowData.value = response.data.referral_list || [];
  } catch (error) {
    console.error('Error loading data:', error);
    rowData.value = []; // Clear data on error
    // Optionally, you could set an error state here to display a message
  } finally {
    isLoading.value = false; // <-- Set loading to false after fetching completes
  }
};

const clearFilter = () => {
  filters.value = {};
};

const getStatusSeverity = (status) => {
  switch (status.toLowerCase()) {
    case 'awaiting': return 'warning';
    case 'accepted': return 'success';
    case 'rejected': return 'danger';
    default: return 'info';
  }
};

const extractFullName = (nameString) => {
  try {
    const parsedData = JSON.parse(nameString.replace(/'/g, '"')); // Replace single quotes with double quotes
    return parsedData.full_name || 'No Data';
  } catch (error) {
    console.error('Error parsing name string:', error);
    return 'No Data';
  }
};

const viewDetails = async (userData) => {
  try {
    if (userData && userData.user_data && userData.user_data.patient_id) {
      const patientId = userData.user_data.patient_id;
      const userDetails = await fetchUserDetails(patientId);
      selectedUser.value = userDetails;
      showModal.value = true;
    } else {
      console.error('Patient ID is missing or invalid.');
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
  }
};

const fetchUserDetails = async (patientId) => {
  const response = await axios.get(`${endpoints.getUserMonitoringDetails}?user_id=${patientId}`);
  return response.data;
};

const handleModalClose = () => {
  showModal.value = false;
  selectedUser.value = null;
};

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
.hwss-primary {
  background-color: #2c6975 !important;
  color: #ffffff !important;
}

.p-dialog .p-dialog-content {
  padding: 0 !important;
}

.dashboard-container {
  padding: 2rem;
  background: #f8f9fa;
}

.filter-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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

.custom-table {
  border-radius: 8px;
  overflow: hidden;
}

.custom-table ::v-deep(.p-datatable-header) {
  background: white;
  border: none;
}

.custom-table ::v-deep(.p-datatable-thead > tr > th) {
  background: #f8f9fa;
  color: #344767;
  font-weight: 600;
  padding: 1rem;
  border: none;
}

.custom-table ::v-deep(.p-datatable-tbody > tr) {
  transition: all 0.3s ease;
}

.custom-table ::v-deep(.p-datatable-tbody > tr:hover) {
  background: #f8f9fa;
}

.date-cell {
  color: #344767;
  font-weight: 500;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-name {
  color: #344767;
  font-weight: 500;
}

.age-badge {
  background: #e9ecef;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.gender-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  text-transform: capitalize;
}

.gender-badge.male {
  background: #cfe2ff;
  color: #0a58ca;
}

.gender-badge.female {
  background: #f8d7da;
  color: #842029;
}

.referral-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-tag {
  border-radius: 12px;
  padding: 0.25rem 0.75rem;
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

.empty-state, .loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: #6c757d;
}

.empty-icon, .loading-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #2c6975;
}

.details-modal ::v-deep(.p-dialog-content) {
  padding: 0;
  border-radius: 12px;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }
  
  .filter-section {
    padding: 1rem;
  }
  
  .table-card {
    padding: 1rem;
  }
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.dashboard-title {
  color: #2B656F;
}

.refresh-btn {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  border: none;
  color: white;
}

.custom-datatable {
  background: white;
  border-radius: 8px;
}

.view-details-btn {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  border: none;
  color: white;
}

.custom-modal {
  border-radius: 12px;
  overflow: hidden;
}

.modal-content {
  background: white;
}

.modal-header {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
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
}

.profile-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.profile-image {
  display: none;
}

.profile-name {
  color: #2B656F;
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
  gap: 2rem;
}

.info-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.section-title {
  color: #2B656F;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.address-details p {
  margin-bottom: 0.5rem;
}

.severity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.severity-tag {
  display: flex;
  align-items: center;
  background: #f0f7f8;
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
}

.substance-name {
  margin-right: 0.5rem;
  font-weight: 600;
}

.highlight {
  color: #2B656F;
  font-weight: 600;
}

.greyout {
  opacity: 0.6;
  pointer-events: none;
}

.form-control {
  border: 1px solid #d1e0e3;
  border-radius: 4px;
  padding: 0.5rem;
}

.form-control:focus {
  border-color: #2B656F;
  box-shadow: 0 0 0 0.2rem rgba(43, 101, 111, 0.25);
}

.modal-footer {
  border-top: 1px solid #e6f3f5;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .profile-card {
    margin-bottom: 1rem;
  }
}

/* Loading and Error styles */
.loading-overlay,
.error-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: rgba(255, 255, 255, 0.8);
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2B656F;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 1rem;
  text-align: center;
}

.error-message i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
</style>