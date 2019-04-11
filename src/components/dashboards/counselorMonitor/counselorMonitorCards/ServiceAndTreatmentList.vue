<template>
    <div>
        <div class="row">
            <div class="d-flex justify-content-end">
                <div class="col-1 ms-auto">
                    <Button label="Refresh List" @click="getServiceList"
                        class="btn hwss-btn" />
                </div>
            </div>
        </div>
        <div class="row">
            <div class="card-header text-center">
                <h5 class="card-title">Service and Treatment List</h5>
            </div>
            <DataTable :value="filteredRows" :paginator="true" :rows="10" :paginatorTemplate="paginatorTemplate"
                :sortField="sortField" :sortOrder="sortOrder" @sortChange="onSortChange">
                <Column field="date" header="Date" sortable :body="formatDate"></Column>
                <Column field="user.full_name" header="Name" sortable></Column>
                <Column field="user.age" header="Age" sortable></Column>
                <Column field="user.gender" header="Sex" sortable></Column>
                <Column field="assessment_status" header="Assessment Status" sortable :body="formatEmpty"></Column>
                <Column field="case_status" header="Case Status" sortable :body="formatEmpty"></Column>
                <Column field="counseling" header="Counseling" sortable :body="formatEmpty"></Column>
                <Column field="follow_up" header="Follow Up" sortable :body="formatEmpty"></Column>
                <Column field="comments" header="Comments" sortable :body="formatEmpty"></Column>
                <Column header="Actions">
                    <template #body="rowData">
                        <Button label="View Details" class="p-button-primary hwss-btn" @click="viewDetails(rowData)" />
                    </template>
                </Column>
            </DataTable>

        </div>
    </div>
    <Dialog v-model:visible="showModal" maximizable modal header="User Details" @hide="handleModalClose"
        :style="{ width: '100rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <div class="container-fluid mx-0 px-0">
            <div class="row">
                <!-- Profile Card -->
                <aside class="col-md-4 sticky-top">
                    <div class="profile-card card h-100">
                        <div class="card-img-top" :style="{ backgroundImage: `url(${selectedUser.profile_picture})` }">
                        </div>
                        <div class="card-body">
                            <h5 class="card-title mb-3">{{ selectedUser.first_name }} {{ selectedUser.middle_name }} {{
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
                <main class="col-md-8 card p-3">
                    <div class="row mb-4">
                        <div class="col-md-12">
                            <h4>Personal Details</h4>
                            <div class="row">
                                <div class="col-6">Mother's Name: <input type="text" class="form-control"
                                        v-model="selectedUser.mother_name"></div>
                                <div class="col-6">Father's Name: <input type="text" class="form-control"
                                        v-model="selectedUser.father_name"></div>
                                <div class="col-6">Parents' Occupation: <input type="text" class="form-control"
                                        v-model="selectedUser.parents_occupation"></div>
                                <div class="col-6">Parental Status: <input type="text" class="form-control"
                                        v-model="selectedUser.parental_status"></div>
                                <div class="col-6">Phone: <input type="text" class="form-control"
                                        v-model="selectedUser.phone"></div>
                            </div>
                        </div>
                    </div>
                    <div class="row mb-4">
                        <div class="col-md-12">
                            <h4>Permanent Address</h4>
                            <div class="row">
                                <div class="col-6">Village: <input type="text" class="form-control"
                                        v-model="selectedUser.perm_add_village"></div>
                                <div class="col-6">Gewog: <input type="text" class="form-control"
                                        v-model="selectedUser.perm_add_gewog"></div>
                                <div class="col-6">Dzongkhag: <input type="text" class="form-control"
                                        v-model="selectedUser.perm_add_dzongkhag"></div>
                            </div>
                        </div>
                    </div>
                    <div class="row mb-4">
                        <div class="col-md-12">
                            <h4>Present Address</h4>
                            <div class="row">
                                <div class="col-6">Village: <input type="text" class="form-control"
                                        v-model="selectedUser.ps_add_village"></div>
                                <div class="col-6">Gewog: <input type="text" class="form-control"
                                        v-model="selectedUser.ps_add_gewog"></div>
                                <div class="col-6">Dzongkhag: <input type="text" class="form-control"
                                        v-model="selectedUser.ps_add_dzongkhag"></div>
                            </div>
                        </div>
                    </div>
                    <div class="row mb-4">
                        <div class="col-md-12">
                            <h4>Case Status</h4>
                            <div class="row">
                                <div class="col-6">
                                    <label for="caseStatus">Case Status:</label>
                                    <select class="form-control" v-model="selectedUser.case_status">
                                        <option :value="null" disabled>Select Case Status</option>
                                        <option value="On Going">On Going</option>
                                        <option value="Case Closed">Case Closed</option>
                                        <option value="Case Discontinued">Case Discontinued</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-md-12">
                            <h4>Severity</h4>
                            <div class="row">
                                <div class="col-4">
                                    <h6>PHQ Severity:</h6>
                                    <div class="pill severe">{{ selectedUser.rescreening_details[0]?.phq_interpretation
                                        }}
                                    </div>
                                </div>
                                <div class="col-4">
                                    <h6>GAD Severity:</h6>
                                    <div class="pill moderate">{{
                        selectedUser.rescreening_details[0]?.gad_interpretation }}
                                    </div>
                                </div>
                                <div class="col-4">
                                    <h6>ACE Severity:</h6>
                                    <div class="pill mild">{{ selectedUser.rescreening_details[0]?.ace_interpretation }}
                                    </div>
                                </div>
                                <div class="col-12 mt-3">
                                    <h6>Substance Severity:</h6>
                                    <div class="row">
                                        <div class="col-4 mb-2">
                                            <span class="substance">Alcohol:</span>
                                            <div class="pill severe">{{ selectedUser.alcohol_severity }}</div>
                                        </div>
                                        <div class="col-4 mb-2">
                                            <span class="substance">Cannibis:</span>
                                            <div class="pill moderate">{{ selectedUser.cannibis_severity }}</div>
                                        </div>
                                        <div class="col-4 mb-2">
                                            <span class="substance">Tobacco:</span>
                                            <div class="pill moderate">{{ selectedUser.tobacco_severity }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="my-3">
                                    <div class="col-12 mt-3">
                                        <h5>Non-Medical Drug use through injection: <span class="text-danger">{{
                        selectedUser.injection_use }}</span>
                                        </h5>
                                    </div>
                                    <div class="col-12 mt-3">
                                        <h5>Past Mental Health Disorder history: <span class="text-dark">{{
                        selectedUser.past_disorder }}</span>
                                        </h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-md-12">
                            <h4>Services and Treatment</h4>
                            <div class="row">
                                <div class="col-6 mb-3">
                                    <label for="assessmentStatus">Assessment Status:</label>
                                    <select class="form-control" id="assessmentStatus"
                                        v-model="selectedUser.assessment_status">
                                        <option value="Not Conducted">Not Conducted</option>
                                        <option value="Conducted">Conducted</option>
                                    </select>
                                </div>
                                <div class="col-6 mb-3">
                                    <label for="counselingStatus">Counseling Status:</label>
                                    <select class="form-control" id="counselingStatus"
                                        v-model="selectedUser.counseling_status">
                                        <option value="Availed">Availed</option>
                                        <option value="Not Required">Not Required</option>
                                        <option value="Waiting List">Waiting List</option>
                                    </select>
                                </div>
                                <div class="col-6 mb-3">
                                    <label for="followUpStatus">Follow Up Status:</label>
                                    <select class="form-control" id="followUpStatus"
                                        v-model="selectedUser.follow_up_status">
                                        <option value="Treatment Completed">Treatment Completed</option>
                                        <option value="Undergoing Treatment">Undergoing Treatment</option>
                                    </select>
                                </div>
                                <div class="col-12">
                                    <label for="comments">Comments:</label>
                                    <textarea class="form-control" id="comments"
                                        v-model="selectedUser.comments"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-md-12">
                            <h4>Referral Status</h4>
                            <div class="row">
                                <div class="col-6">
                                    <label for="referTo">Refer To:</label>
                                    <select class="form-control" id="referTo" v-model="selectedUser.refer_to">
                                        <option value="Clinical Counselor">Clinical Counselor</option>
                                        <option value="School Counselor">School Counselor</option>
                                        <option value="Mental Health Counselor">Psychiatrist</option>
                                        <option value="Mental Health Counselor">Medical Officer</option>
                                    </select>
                                </div>
                                <div class="col-6">
                                    <label for="official">Official:</label>
                                    <input type="text" class="form-control" id="official"
                                        v-model="selectedUser.official">
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <!-- Foot area with cancel and save buttons -->
        <div class="mt-4 d-flex justify-content-end"> <!-- Use justify-content-end to align items to the right -->
            <div>
                <Button label="Cancel" class="p-button-secondary p-mr-2 mx-2" @click="handleModalClose" />
                <Button label="Save Changes" class="p-button-rounded hwss-btn mx-2" @click="saveChanges" />
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import Swal from 'sweetalert2';

const showModal = ref(false);
const selectedUser = ref(null);
const selectedServiceAndTreatment = ref(null);
const selectedReferral = ref(null);

const rowData = ref([]);
const searchQuery = ref('');
const selectedFields = ref([
    'date',
    'user.full_name',
    'user.age',
    'user.gender',
    'assessment_status',
    'case_status',
    'counseling',
    'follow_up',
    'comments',
]);

const formatEmpty = (rowData, column) => {
    if (rowData[column.field] === 'follow_up' && rowData[column.field] === '') {
        return '----';
    }
    return rowData[column.field];
};

const filteredRows = computed(() => {
    if (!searchQuery.value.trim() || !Array.isArray(rowData.value) || rowData.value.length === 0) {
        return rowData.value;
    }

    return rowData.value.filter(row => {
        return selectedFields.value.some(field => {
            const fieldValue = row[field.split('.').pop()];
            return fieldValue !== undefined && fieldValue.toString().toLowerCase().includes(searchQuery.value.toLowerCase());
        });
    });
});

const getServiceList = async () => {
    try {
        const response = await axios.get(endpoints.generateServiceAndTreatment);
        if (response && response.data && Array.isArray(response.data.data)) {
            rowData.value = response.data.data;
        } else {
            console.error('Invalid response format:', response);
        }
    } catch (error) {
        console.error(error);
    }
};

const openModal = async (user) => {
    try {
        selectedUser.value = user;
        if (user.service_and_treatment_details && user.service_and_treatment_details.length > 0) {
            selectedServiceAndTreatment.value = user.service_and_treatment_details[0];
        } else {
            selectedServiceAndTreatment.value = null;
        }
        if (user.referral_details && user.referral_details.length > 0) {
            selectedReferral.value = user.referral_details[0];
        } else {
            selectedReferral.value = null;
        }
        showModal.value = true;
    } catch (error) {
        console.error('Error opening modal:', error);
    }
};


const handleModalClose = () => {
    selectedUser.value = null;
    showModal.value = false;
}

const viewDetails = async (userData) => {
    try {
        if (userData && userData.data && userData.data.user && userData.data.user.id) {
            const userId = userData.data.user.id; // Extracting user ID
            console.log('User ID:', userId); // Log the user ID
            const userDetails = await fetchUserDetails(userId);
            console.log('User Details:', userDetails); // Log the user details
            await openModal(userDetails);
        } else {
            console.error('User ID is missing or invalid.');
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
};

// Function to fetch user details from the server
const fetchUserDetails = async (userId) => {
    const response = await axios.get(`${endpoints.getUserMonitoringDetails}?user_id=${userId}`);
    console.log(response.data);
    return response.data;
};

const saveChanges = () => {
    // Perform any necessary saving logic here
    handleModalClose()
    // Show success message using SweetAlert
    Swal.fire({
        icon: 'success',
        title: 'Changes saved successfully!',
        showConfirmButton: false,
        timer: 1500 // Auto close after 1.5 seconds
    });
}

onMounted(getServiceList);
</script>


<style scoped>
.sticky-top {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
}
</style>