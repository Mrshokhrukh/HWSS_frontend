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
        {{ data.user_data.name || 'No Data' }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['user_data.name']" type="text" class="p-column-filter"
          placeholder="Search by name" />
      </template>
    </Column>
    <Column field="user_data.age" header="Age" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '8rem' }">
      <template #body="{ data }">
        {{ data.user_data.age || 'No Data' }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['user_data.age']" type="text" class="p-column-filter"
          placeholder="Search by age" />
      </template>
    </Column>
    <Column field="user_data.gender" header="Sex" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '8rem' }">
      <template #body="{ data }">
        {{ data.user_data.gender || 'No Data' }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['user_data.gender']" type="text" class="p-column-filter"
          placeholder="Search by gender" />
      </template>
    </Column>
    <Column field="referred_to.name" header="Referred To" :filterMatchMode="'contains'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ extractFullName(data.referred_to.name) || 'No Data' }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['referred_to.name']" type="text" class="p-column-filter"
          placeholder="Search by referred to" />
      </template>
    </Column>
    <Column field="referred_by.username" header="Referred By" :filterMatchMode="'contains'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        {{ data.referred_by.username || 'No Data' }}
      </template>
      <template #filter="{ filterModel }">
        <InputText v-model="filterModel['referred_by.username']" type="text" class="p-column-filter"
          placeholder="Search by referred by" />
      </template>
    </Column>
    <Column field="referral_status" header="Referral Status" :filterMatchMode="'equals'" :sortable="true"
      :style="{ 'min-width': '12rem' }">
      <template #body="{ data }">
        <Tag :value="data.referral_status" :severity="getStatusSeverity(data.referral_status)" />
      </template>
      <template #filter="{ filterModel }">
        <Dropdown v-model="filterModel['referral_status']" :options="statusOptions" optionLabel="label"
          optionValue="value" placeholder="Select Status" class="p-column-filter" style="min-width: 12rem" />
      </template>
    </Column>
    <Column :style="{ 'min-width': '8rem' }">
      <template #body="{ data }">
        <Button label="View" icon="pi pi-eye" class="hwss-primary rounded" @click="viewDetails(data)" />
      </template>
    </Column>
  </DataTable>

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
                  <template v-for="(substance, index) in selectedUser.substance_risk_measurement_details" :key="index">
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
                      <option value="Hospital-based Outpatient SUD Treatment and Care (Continuing Care)">Hospital-based
                        Outpatient SUD Treatment and Care (Continuing Care)</option>
                      <option value="School-based SUD Treatment and Care">School-based SUD Treatment and Care</option>
                      <option value="Institution-based SUD Treatment and Care">Institution-based SUD Treatment and Care
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
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
const filters = ref({});
const selectedUser = ref(null);
const showModal = ref(false);

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
  try {
    const response = await axios.get(endpoints.getReferralList);
    rowData.value = response.data.referral_list;
  } catch (error) {
    console.error('Error loading data:', error);
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