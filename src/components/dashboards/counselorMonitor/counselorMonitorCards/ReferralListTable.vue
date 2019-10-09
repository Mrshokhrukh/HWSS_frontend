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
        {{ data.referred_to.name || 'No Data' }}
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
        <Button label="View Details" icon="pi pi-external-link" class="hwss-primary" @click="viewDetails(data)" />
      </template>
    </Column>
  </DataTable>

  <Dialog v-model:visible="showModal" maximizable modal header="User Records" @hide="handleModalClose"
    :style="{ width: '80rem', minHeight: '40rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <div class="container-fluid mx-0 px-0">
      <div class="row">
        <!-- Profile Card -->
        <aside class="col-4">
          <div class="profile-card card mt-3 pt-4 h-full" style="position: fixed; height: auto">
            <div class="card-img-top" :style="{ backgroundImage: `url(${selectedUser.profile_picture})` }">
            </div>
            <div class="card-body">
              <h5 class="card-title mb-3 hwss-primary">{{ selectedUser.first_name }} {{
                selectedUser.middle_name }} {{
                  selectedUser.last_name }}</h5>
              <ul class="list-unstyled ">
                <li class="mb-3"><strong>Age:</strong> {{ selectedUser.date_of_birth }}</li>
                <li class="mb-3"><strong>Sex:</strong> {{ selectedUser.gender }}</li>
                <li class="mb-3"><strong>Employee ID:</strong> {{ selectedUser.academy_code }}</li>
                <li class="mb-3"><strong>Citizen ID:</strong> {{ selectedUser.identity_number }}</li>
                <li class="mb-3"><strong>Nationality:</strong> {{ selectedUser.nationality }}</li>
                <li class="mb-3"><strong>Phone Number:</strong> {{ selectedUser.mob_number }}</li>
                <li class="mb-3"><strong>Email:</strong> {{ selectedUser.email }}</li>
                <li class="mb-3"><strong>Role:</strong> {{ selectedUser.role }}</li>
                <li class="mb-3"><strong>Active Agency:</strong> {{ selectedUser.active_agency }}</li>
              </ul>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="col-md-8">
          <div class="row mb-4 card p-4 bg-white">
            <div class="col-md-12">
              <h4 class="hwss-primary">Personal Details</h4>
              <div class="row">
                <div class="col-6">Mother's Name: <input type="text" class="form-control"
                    v-model="selectedUser.mother_name" readonly disabled></div>
                <div class="col-6">Father's Name: <input type="text" class="form-control"
                    v-model="selectedUser.father_name" readonly disabled></div>
                <div class="col-6">Parents' Occupation: <input type="text" class="form-control"
                    v-model="selectedUser.parents_occupation" readonly disabled></div>
                <div class="col-6">Parental Status: <input type="text" class="form-control"
                    v-model="selectedUser.parental_status" readonly disabled></div>
                <div class="col-6">Phone: <input type="text" class="form-control" v-model="selectedUser.mob_number"
                    readonly disabled></div>
              </div>
            </div>
          </div>
          <div class="row mb-4 card p-4 bg-white">
            <div class="col-md-12">
              <h4 class="hwss-primary">Permanent Address</h4>
              <div class="row">
                <div class="col-6">Village: <input type="text" class="form-control"
                    v-model="selectedUser.perm_add_village" readonly disabled></div>
                <div class="col-6">Gewog: <input type="text" class="form-control" v-model="selectedUser.perm_add_gewog"
                    readonly disabled></div>
                <div class="col-6">Dzongkhag: <input type="text" class="form-control"
                    v-model="selectedUser.perm_add_dzongkhag" readonly disabled></div>
              </div>
            </div>
          </div>
          <div class="row mb-4 card p-4 bg-white">
            <div class="col-md-12">
              <h4 class="hwss-primary">Present Address</h4>
              <div class="row">
                <div class="col-6">Village: <input type="text" class="form-control"
                    v-model="selectedUser.ps_add_village" readonly disabled></div>
                <div class="col-6">Gewog: <input type="text" class="form-control" v-model="selectedUser.ps_add_gewog"
                    readonly disabled></div>
                <div class="col-6">Dzongkhag: <input type="text" class="form-control"
                    v-model="selectedUser.ps_add_dzongkhag" readonly disabled></div>
              </div>
            </div>
          </div>
          <div class="row mb-4 card p-4 bg-white">
            <div class="col-md-12">
              <h4 class="hwss-primary">Case Status</h4>
              <div class="row">
                <div class="col-6"
                  v-if="selectedUser.service_and_treatment_details && selectedUser.service_and_treatment_details.length > 0">
                  <label for="caseStatus">Case Status:</label>
                  <select class="form-control" v-model="selectedUser.service_and_treatment_details[0].case_status"
                    :disabled="selfRole === 'trained_professional'">
                    <option :value="null" disabled>Select Case Status</option>
                    <option value="On Going">On Going</option>
                    <option value="Case Closed">Case Closed</option>
                    <option value="Case Discontinued">Case Discontinued</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="row mb-4 card p-4 bg-white"
            v-if="selectedUser.substance_risk_measurement_details && selectedUser.substance_risk_measurement_details.length > 0">
            <div class="col-md-12">
              <h4 class="hwss-primary">Severity</h4>
              <div class="row">
                <template v-for="(substance, index) in selectedUser.substance_risk_measurement_details" :key="index">
                  <div v-if="substance.risk_flag !== 'none'" class="col-4 mb-2">
                    <span class="substance">{{ substance.substance_name.split('(')[0].trim() }}:</span>
                    <Tag class="ms-2 px-2 py-1" :value="substance.risk_flag"
                      :severity="getSeverity(substance.risk_flag)" rounded></Tag>
                  </div>
                </template>
              </div>
            </div>
          </div>


          <div class="row mb-4 card p-4" v-else>
            <div class="col-md-12">
              <h4 class="hwss-primary">Severity</h4>
              <div class="row">
                <div class="col-4 mb-2">
                  <span class="substance text-success">No ASSIST measurements found</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional fields -->
          <div class="mb-4 card p-4 mx-0 bg-white" v-if="selectedUser">
            <div class="col-12">
              <h6>Non-Medical Drug use through injection: <span class="text-primary">{{
                selectedUser.injection_use ? 'YES' : 'Not Applicable' }}</span></h6>
            </div>
            <div class="col-12 mt-3">
              <h6>Past Mental Health Disorder history: <span class="text-primary">{{
                selectedUser.past_disorder ?
                  selectedUser.past_disorder : 'No Diagnosis' }}</span></h6>
            </div>
          </div>


          <!-- <div class="row mb-4 card p-4 bg-white" :class="{ 'greyout': selfRole === 'trained_professional' }"
            v-if="selectedUser.service_and_treatment_details && selectedUser.service_and_treatment_details.length > 0">
            <div class="col-md-12">
              <h4 class="hwss-primary">Services and Treatment</h4>
              <div class="row">
                <div class="col-6 mb-3">
                  <label for="assessmentStatus">Assessment Status:</label>
                  <select class="form-control" id="assessmentStatus"
                    v-model="selectedUser.service_and_treatment_details[0].assessment_status">
                    <option value="Not Conducted">Not Conducted</option>
                    <option value="Conducted">Conducted</option>
                  </select>
                </div>
                <div class="col-6 mb-3">
                  <label for="counselingStatus">Counseling Status:</label>
                  <select class="form-control" id="counselingStatus"
                    v-model="selectedUser.service_and_treatment_details[0].counseling">
                    <option value="Availed">Availed</option>
                    <option value="Not Required">Not Required</option>
                    <option value="Waiting List">Waiting List</option>
                  </select>
                </div>
                <div class="col-6 mb-3">
                  <label for="followUpStatus">Follow Up Status:</label>
                  <select class="form-control" id="followUpStatus"
                    v-model="selectedUser.service_and_treatment_details[0].follow_up">
                    <option value="Treatment Completed">Treatment Completed</option>
                    <option value="Undergoing Treatment">Undergoing Treatment</option>
                    <option value="Completed Counselling Sessions">Completed Counselling Sessions
                    </option>
                    <option value="Unwilling to Undergo Treatment">Unwilling to Undergo Treatment
                    </option>
                    <option value="Undergone Rehabilitation">Undergone Rehabilitation</option>
                    <option value="Undergoing Rehabilitation">Undergoing Rehabilitation</option>
                    <option value="Hospital-based Outpatient SUD Treatment and Care (Primary Phase)">
                      Hospital-based Outpatient SUD Treatment and Care (Primary Phase)</option>
                    <option value="Hospital-based Outpatient SUD Treatment and Care (Continuing Care)">
                      Hospital-based Outpatient SUD Treatment and Care (Continuing Care)</option>
                    <option value="School-based SUD Treatment and Care">School-based SUD Treatment
                      and
                      Care</option>
                    <option value="Institution-based SUD Treatment and Care">Institution-based SUD
                      Treatment and Care</option>
                    <option value="Follow-up Drug Test Conducted">Follow-up Drug Test Conducted
                    </option>
                    <option value="Detention-based SUD Treatment and Care">Detention-based SUD
                      Treatment
                      and Care</option>
                  </select>
                </div>

                <div class="col-12">
                  <label for="comments">Comments:</label>
                  <textarea class="form-control" id="comments"
                    v-model="selectedUser.service_and_treatment_details[0].comments"></textarea>
                </div>
              </div>
            </div>
            <div class="row d-flex mt-4 justify-content-end">
              <div class="ms-auto">
                <Button label="Save" class="p-button-rounded hwss-btn mx-2" icon="pi pi-save" @click="saveChanges" />
              </div>
            </div>
          </div>

          <div class="row mb-4 card p-4"
            :class="{ 'greyout': selectedUser.service_and_treatment_details[0].referred !== 'Not Referred' }">
            <div class="col-md-12">
              <h4 class="hwss-primary">Referral Status</h4>
              <div class="row">
                <div class="col-6">
                  <label for="referTo">Refer To:</label>
                  <select class="form-control" id="referTo" v-model="selectedUser.refer_to">
                    <option value="clinical_counselor">Clinical Counselor</option>
                    <option value="school_counselor">School Counselor</option>
                    <option value="mh_admin">Mental Health Counselor</option>
                    <option value="mh_admin">Medical Officer</option>
                  </select>
                </div>
                <div class="col-6">
                  <label for="official">Official:</label>
                  <select class="form-control" id="official" v-model="selectedUser.official">
                    <option v-for="option in officialOptions" :key="option.id" :value="option.id"
                      :placeholder="option.full_name">{{
                        option.full_name }}, {{ option.active_agency }}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="row d-flex justify-co mt-4">
              <div class=" ms-auto">
                <Button label="Refer Case" class="p-button-secondary p-mr-2 hwss-btn" icon="pi pi-external-link"
                  @click="referCase" />
              </div>
            </div>
          </div>
          <div class="my-4" v-if="selectedUser.service_and_treatment_details[0].referred !== 'Not Referred'">
            <h5 class="text-warning text-center">
              User Already Referred
            </h5>
          </div> -->

        </main>
      </div>
    </div>

    <div class="mt-4 d-flex justify-content-end">
      <div>
        <Button label="Close" class="p-button-secondary p-mr-2 mx-2" @click="handleModalClose" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import Card from 'primevue/card';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Textarea from 'primevue/textarea';

const rowData = ref([]);
const filters = ref({});
const selectedUser = ref(null);
const showModal = ref(false);

const statusOptions = [
  { label: 'Awaiting', value: 'awaiting' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
];

const caseStatusOptions = [
  { label: 'On Going', value: 'On Going' },
  { label: 'Case Closed', value: 'Case Closed' },
  { label: 'Case Discontinued', value: 'Case Discontinued' },
];

const assessmentStatusOptions = [
  { label: 'Not Conducted', value: 'Not Conducted' },
  { label: 'Conducted', value: 'Conducted' },
];

const counselingStatusOptions = [
  { label: 'Availed', value: 'Availed' },
  { label: 'Not Required', value: 'Not Required' },
  { label: 'Waiting List', value: 'Waiting List' },
];

const followUpStatusOptions = [
  { label: 'Treatment Completed', value: 'Treatment Completed' },
  { label: 'Undergoing Treatment', value: 'Undergoing Treatment' },
  { label: 'Completed Counselling Sessions', value: 'Completed Counselling Sessions' },
  { label: 'Unwilling to Undergo Treatment', value: 'Unwilling to Undergo Treatment' },
  { label: 'Undergone Rehabilitation', value: 'Undergone Rehabilitation' },
  { label: 'Undergoing Rehabilitation', value: 'Undergoing Rehabilitation' },
  { label: 'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)', value: 'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)' },
  { label: 'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)', value: 'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)' },
  { label: 'School-based SUD Treatment and Care', value: 'School-based SUD Treatment and Care' },
  { label: 'Institution-based SUD Treatment and Care', value: 'Institution-based SUD Treatment and Care' },
  { label: 'Follow-up Drug Test Conducted', value: 'Follow-up Drug Test Conducted' },
  { label: 'Detention-based SUD Treatment and Care', value: 'Detention-based SUD Treatment and Care' },
];

const referToOptions = [
  { label: 'Clinical Counselor', value: 'clinical_counselor' },
  { label: 'School Counselor', value: 'school_counselor' },
  { label: 'Mental Health Counselor', value: 'mh_admin' },
  { label: 'Medical Officer', value: 'medical_officer' },
];

const officialOptions = ref([]);

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

const getSeverity = (riskFlag) => {
  if (!riskFlag) return null;
  switch (riskFlag.toLowerCase()) {
    case 'severe': return 'danger';
    case 'moderate': return 'warning';
    case 'mild': return 'info';
    case 'no risk': return 'success';
    default: return null;
  }
};

const calculateAge = (birthDate) => {
  if (!birthDate) return '';
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
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

const saveChanges = async () => {
  try {
    // Implement the logic to save changes
    console.log('Saving changes:', selectedUser.value);
    // You may want to call an API endpoint to update the user data
  } catch (error) {
    console.error('Error saving changes:', error);
  }
};

const referCase = async () => {
  try {
    // Implement the logic to refer the case
    console.log('Referring case:', selectedUser.value);
    // You may want to call an API endpoint to update the referral status
  } catch (error) {
    console.error('Error referring case:', error);
  }
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
</style>