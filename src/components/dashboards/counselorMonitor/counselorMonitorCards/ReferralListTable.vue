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
    :style="{ width: '80vw', minHeight: '80vh' }" :breakpoints="{ '1199px': '90vw', '575px': '95vw' }">
    <div class="p-4">
      <div class="grid">
        <!-- Profile Card -->
        <div class="col-12 md:col-4 lg:col-3">
          <Card class="h-full">
            <template #header>
              <img :src="selectedUser?.profile_picture || '/path/to/default/image.jpg'" alt="User Profile"
                class="w-full" />
            </template>
            <template #title>
              {{ `${selectedUser?.first_name} ${selectedUser?.middle_name} ${selectedUser?.last_name}` }}
            </template>
            <template #content>
              <ul class="list-none p-0 m-0">
                <li class="mb-3"><strong>Age:</strong> {{ calculateAge(selectedUser?.date_of_birth) }}</li>
                <li class="mb-3"><strong>Sex:</strong> {{ selectedUser?.gender }}</li>
                <li class="mb-3"><strong>Employee ID:</strong> {{ selectedUser?.academy_code }}</li>
                <li class="mb-3"><strong>Citizen ID:</strong> {{ selectedUser?.identity_number }}</li>
                <li class="mb-3"><strong>Nationality:</strong> {{ selectedUser?.nationality }}</li>
                <li class="mb-3"><strong>Phone:</strong> {{ selectedUser?.mob_number }}</li>
                <li class="mb-3"><strong>Email:</strong> {{ selectedUser?.email }}</li>
                <li class="mb-3"><strong>Role:</strong> {{ selectedUser?.role }}</li>
                <li class="mb-3"><strong>Active Agency:</strong> {{ selectedUser?.active_agency }}</li>
              </ul>
            </template>
          </Card>
        </div>

        <!-- Main Content -->
        <div class="col-12 md:col-8 lg:col-9">
          <TabView>
            <TabPanel header="Personal Details">
              <div class="grid">
                <div class="col-12 md:col-6 mb-3">
                  <label for="motherName">Mother's Name:</label>
                  <InputText id="motherName" v-model="selectedUser.mother_name" class="w-full" disabled />
                </div>
                <div class="col-12 md:col-6 mb-3">
                  <label for="fatherName">Father's Name:</label>
                  <InputText id="fatherName" v-model="selectedUser.father_name" class="w-full" disabled />
                </div>
                <div class="col-12 md:col-6 mb-3">
                  <label for="parentsOccupation">Parents' Occupation:</label>
                  <InputText id="parentsOccupation" v-model="selectedUser.parents_occupation" class="w-full" disabled />
                </div>
                <div class="col-12 md:col-6 mb-3">
                  <label for="parentalStatus">Parental Status:</label>
                  <InputText id="parentalStatus" v-model="selectedUser.parental_status" class="w-full" disabled />
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Address">
              <div class="grid">
                <div class="col-12 md:col-6">
                  <h5>Permanent Address</h5>
                  <div class="mb-3">
                    <label for="permVillage">Village:</label>
                    <InputText id="permVillage" v-model="selectedUser.perm_add_village" class="w-full" disabled />
                  </div>
                  <div class="mb-3">
                    <label for="permGewog">Gewog:</label>
                    <InputText id="permGewog" v-model="selectedUser.perm_add_gewog" class="w-full" disabled />
                  </div>
                  <div class="mb-3">
                    <label for="permDzongkhag">Dzongkhag:</label>
                    <InputText id="permDzongkhag" v-model="selectedUser.perm_add_dzongkhag" class="w-full" disabled />
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <h5>Present Address</h5>
                  <div class="mb-3">
                    <label for="presVillage">Village:</label>
                    <InputText id="presVillage" v-model="selectedUser.ps_add_village" class="w-full" disabled />
                  </div>
                  <div class="mb-3">
                    <label for="presGewog">Gewog:</label>
                    <InputText id="presGewog" v-model="selectedUser.ps_add_gewog" class="w-full" disabled />
                  </div>
                  <div class="mb-3">
                    <label for="presDzongkhag">Dzongkhag:</label>
                    <InputText id="presDzongkhag" v-model="selectedUser.ps_add_dzongkhag" class="w-full" disabled />
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Case Details">
              <div class="grid">
                <div class="col-12 mb-3">
                  <h5>Case Status</h5>
                  <Dropdown
                    v-if="selectedUser.service_and_treatment_details && selectedUser.service_and_treatment_details.length > 0"
                    v-model="selectedUser.service_and_treatment_details[0].case_status" :options="caseStatusOptions"
                    optionLabel="label" optionValue="value" placeholder="Select Case Status" class="w-full"
                    :disabled="selfRole === 'trained_professional'" />
                </div>
                <div class="col-12 mb-3">
                  <h5>Severity</h5>
                  <div v-if="selectedUser?.substance_risk_measurement_details?.length > 0" class="flex flex-wrap gap-2">
                    <Tag v-for="substance in selectedUser.substance_risk_measurement_details"
                      :key="substance?.substance_name || 'unknown'"
                      :value="substance?.substance_name?.split('(')[0].trim() || 'Unknown'"
                      :severity="getSeverity(substance?.risk_flag)"
                      v-if="substance?.risk_flag && substance.risk_flag !== 'none'" />
                  </div>
                  <p v-else class="text-green-500">No ASSIST measurements found</p>
                </div>
                <div class="col-12 mb-3">
                  <h5>Additional Information</h5>
                  <p><strong>Non-Medical Drug use through injection:</strong> {{ selectedUser.injection_use ? 'YES' :
                    'Not Applicable' }}</p>
                  <p><strong>Past Mental Health Disorder history:
                    </strong> {{ selectedUser.past_disorder || 'No Diagnosis'
                    }}</p>
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Services and Treatment" :disabled="selfRole === 'trained_professional'">
              <div class="grid">
                <div class="col-12 md:col-6 mb-3">
                  <label for="assessmentStatus">Assessment Status:</label>
                  <Dropdown id="assessmentStatus"
                    v-model="selectedUser.service_and_treatment_details[0].assessment_status"
                    :options="assessmentStatusOptions" optionLabel="label" optionValue="value" class="w-full" />
                </div>
                <div class="col-12 md:col-6 mb-3">
                  <label for="counselingStatus">Counseling Status:</label>
                  <Dropdown id="counselingStatus" v-model="selectedUser.service_and_treatment_details[0].counseling"
                    :options="counselingStatusOptions" optionLabel="label" optionValue="value" class="w-full" />
                </div>
                <div class="col-12 md:col-6 mb-3">
                  <label for="followUpStatus">Follow Up Status:</label>
                  <Dropdown id="followUpStatus" v-model="selectedUser.service_and_treatment_details[0].follow_up"
                    :options="followUpStatusOptions" optionLabel="label" optionValue="value" class="w-full" />
                </div>
                <div class="col-12 mb-3">
                  <label for="comments">Comments:</label>
                  <Textarea id="comments" v-model="selectedUser.service_and_treatment_details[0].comments" rows="5"
                    class="w-full" />
                </div>
              </div>
              <div class="flex justify-content-end mt-4">
                <Button label="Save" icon="pi pi-save" class="hwss-primary" @click="saveChanges" />
              </div>
            </TabPanel>

            <TabPanel header="Referral"
              :disabled="selectedUser.service_and_treatment_details[0].referred !== 'Not Referred'">
              <div class="grid">
                <div class="col-12 md:col-6 mb-3">
                  <label for="referTo">Refer To:</label>
                  <Dropdown id="referTo" v-model="selectedUser.refer_to" :options="referToOptions" optionLabel="label"
                    optionValue="value" class="w-full" />
                </div>
                <div class="col-12 md:col-6 mb-3">
                  <label for="official">Official:</label>
                  <Dropdown id="official" v-model="selectedUser.official" :options="officialOptions"
                    optionLabel="full_name" optionValue="id" class="w-full" />
                </div>
              </div>
              <div class="flex justify-content-end mt-4">
                <Button label="Refer Case" icon="pi pi-external-link" class="hwss-primary" @click="referCase" />
              </div>
            </TabPanel>
          </TabView>
        </div>
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