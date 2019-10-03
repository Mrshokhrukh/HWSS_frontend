<template>
    <div>
        <div class="row">
            <div class="d-flex justify-content-end">
                <div class="col-1 ms-auto">
                    <Button label="Refresh List" @click="getServiceList" class="btn hwss-btn" />
                </div>
            </div>
        </div>
        <div class="row">
            <div class="card-header text-center">
                <h5 class="card-title">Service and Treatment List</h5>
            </div>
            <DataTable :value="filteredRows" :paginator="true" :rows="10" :paginatorTemplate="paginatorTemplate"
                :sortField="sortField" :sortOrder="sortOrder" @sortChange="onSortChange" resizableColumns
                columnResizeMode="fit">
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
                                <div class="col-6">Phone: <input type="text" class="form-control"
                                        v-model="selectedUser.mob_number" readonly disabled></div>
                            </div>
                        </div>
                    </div>
                    <div class="row mb-4 card p-4 bg-white">
                        <div class="col-md-12">
                            <h4 class="hwss-primary">Permanent Address</h4>
                            <div class="row">
                                <div class="col-6">Village: <input type="text" class="form-control"
                                        v-model="selectedUser.perm_add_village" readonly disabled></div>
                                <div class="col-6">Gewog: <input type="text" class="form-control"
                                        v-model="selectedUser.perm_add_gewog" readonly disabled></div>
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
                                <div class="col-6">Gewog: <input type="text" class="form-control"
                                        v-model="selectedUser.ps_add_gewog" readonly disabled></div>
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
                                    <select class="form-control"
                                        v-model="selectedUser.service_and_treatment_details[0].case_status"
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
                                <template v-for="(substance, index) in selectedUser.substance_risk_measurement_details"
                                    :key="index">
                                    <div v-if="substance.risk_flag !== 'none'" class="col-4 mb-2">
                                        <span class="substance">{{ substance.substance_name.split('(')[0].trim()
                                            }}:</span>
                                        <Tag class="ms-2 px-2 py-1" :value="substance.risk_flag"
                                            :style="getSeverityStyles(substance.risk_flag)" rounded></Tag>
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


                    <div class="row mb-4 card p-4 bg-white" :class="{ 'greyout': selfRole === 'trained_professional' }"
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
                                        <option
                                            value="Hospital-based Outpatient SUD Treatment and Care (Primary Phase)">
                                            Hospital-based Outpatient SUD Treatment and Care (Primary Phase)</option>
                                        <option
                                            value="Hospital-based Outpatient SUD Treatment and Care (Continuing Care)">
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
                                <Button label="Save" class="p-button-rounded hwss-btn mx-2" icon="pi pi-save"
                                    @click="saveChanges" />
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
                                <Button label="Refer Case" class="p-button-secondary p-mr-2 hwss-btn"
                                    icon="pi pi-external-link" @click="referCase" />
                            </div>
                        </div>
                    </div>
                    <div class="my-4" v-if="selectedUser.service_and_treatment_details[0].referred !== 'Not Referred'">
                        <h5 class="text-warning text-center">
                            User Already Referred
                        </h5>
                    </div>

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
import { ref, computed, onMounted, watchEffect } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import Swal from 'sweetalert2';

const showModal = ref(false);
const selectedUser = ref(null);
const officialOptions = ref([]);
const selfRole = ref('');

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

const myAgency = ref('');
const filteredRowData = computed(() => {
    if (!myAgency.value || !Array.isArray(rowData.value)) {
        return rowData.value;
    }

    return rowData.value.filter(row => {
        const userAgency = row.user?.user_agency?.agency_name;
        return userAgency === myAgency.value;
    });
});

const filteredRows = computed(() => {
    if (!searchQuery.value.trim() || !Array.isArray(filteredRowData.value) || filteredRowData.value.length === 0) {
        return filteredRowData.value;
    }

    return filteredRowData.value.filter(row => {
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
            console.log('service and treatment:', response.data);
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
        selectedUser.value = {
            id: user.id,
            username: user.username,
            is_staff: user.is_staff,
            is_active: user.is_active,
            identity_number: user.identity_number,
            nationality: user.nationality,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            date_of_birth: user.date_of_birth,
            academy_code: user.academy_code,
            access_level: user.access_level,
            active_agency: user.active_agency,
            date_joined: user.date_joined,
            email: user.email,
            father_name: user.father_name,
            gender: user.gender,
            mob_number: user.mob_number,
            mother_name: user.mother_name,
            perm_add_dzongkhag: user.perm_add_dzongkhag,
            perm_add_gewog: user.perm_add_gewog,
            perm_add_village: user.perm_add_village,
            profile_picture: user.profile_picture,
            ps_add_dzongkhag: user.ps_add_dzongkhag,
            ps_add_gewog: user.ps_add_gewog,
            ps_add_village: user.ps_add_village,
            referral_details: user.referral_details,
            rescreening_details: user.rescreening_details,
            role: user.role,
            service_and_treatment_details: user.service_and_treatment_details,
            substance_risk_measurement_details: user.substance_risk_measurement_details,
            user_referred: user.service_and_treatment_details.referred
        };

        showModal.value = true;
    } catch (error) {
        console.error('Error opening modal:', error);
    }
};

const getSeverityStyles = (riskFlag) => {
    switch (riskFlag.toLowerCase()) {
        case 'severe':
            return { color: 'red', backgroundColor: 'pink' };
        case 'moderate':
            return { color: 'orange', backgroundColor: 'lightyellow' };
        case 'mild':
            return { color: 'green', backgroundColor: 'lightgreen' };
        case 'no risk':
            return { color: 'blue', backgroundColor: 'lightblue' };
        default:
            return {};
    }
};

watchEffect(async () => {
    if (selectedUser.value && selectedUser.value.refer_to) {
        try {
            const response = await axios.get(`${endpoints.fetchReferralCounselors}?role=${selectedUser.value.refer_to}`);
            if (response && response.data && Array.isArray(response.data.data)) {
                officialOptions.value = response.data.data;
            } else {
                console.error('Invalid response format:', response);
            }
        } catch (error) {
            console.error('Error fetching official options:', error);
        }
    }
});


const handleModalClose = () => {
    selectedUser.value = null;
    showModal.value = false;
}

const viewDetails = async (userData) => {
    try {
        if (userData && userData.data && userData.data.user && userData.data.user.id) {
            const userId = userData.data.user.id; // Extracting user ID
            const userDetails = await fetchUserDetails(userId);
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
    // console.log(response.data);
    return response.data;
};

const saveChanges = () => {
    // get self id from localstorage
    const counselor = JSON.parse(localStorage.getItem('userDetailsStore'));
    const counselorId = counselor.user.id;
    // Get form data
    const formData = {
        updateData: {
            assessment_status: selectedUser.value.service_and_treatment_details[0].assessment_status,
            counseling: selectedUser.value.service_and_treatment_details[0].counseling,
            follow_up: selectedUser.value.service_and_treatment_details[0].follow_up,
            comments: selectedUser.value.service_and_treatment_details[0].comments,
            case_status: selectedUser.value.service_and_treatment_details[0].case_status,
            id: selectedUser.value.id,
            updated_by: counselorId
        }
    };

    handleModalClose();
    Swal.fire({
        title: 'Confirm Save Changes!',
        text: 'All Changes will be saved!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, save it!'
    }).then((result) => {
        if (result.isConfirmed) {
            axios.post(endpoints.updateServiceAndTreatment, JSON.stringify(formData))
                .then(response => {
                    if (response.status === 200) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Changes saved successfully!',
                            showConfirmButton: false,
                            timer: 1500,
                        });
                        window.location.reload();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Something went wrong!',
                            footer: 'Please try again later.',
                            confirmButtonText: 'OK'
                        })
                    }
                })
                .catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong!',
                        footer: 'Please try again later.',
                        confirmButtonText: 'OK'
                    })
                    console.error('Error saving data:', error);
                });
        }
    });
};

const referCase = async () => {
    if (!selectedUser.value) {
        console.error('Selected user is missing.');
        return;
    }
    // Get self id from localstorage
    const counselor = JSON.parse(localStorage.getItem('userDetailsStore'));
    const counselorId = counselor.user.id;
    const selectedUserData = selectedUser.value;
    const referredToName = selectedUserData.official;

    // Get form data
    const formData = {
        referData: {
            referred_by: counselorId,
            referred_to_name: referredToName,
            user: selectedUserData.id,
        },
    };

    // console.log(formData);
    handleModalClose();
    Swal.fire({
        title: 'Confirm Save Changes!',
        text: 'All Changes will be saved!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, save it!'
    }).then((result) => {
        if (result.isConfirmed) {
            axios.post(endpoints.updateReferralStatus, JSON.stringify(formData))
                .then(response => {
                    if (response.status === 200) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Referral saved successfully!',
                            showConfirmButton: false,
                            timer: 1500
                        });
                        window.location.reload();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Something went wrong!',
                            footer: 'Please try again later.',
                            confirmButtonText: 'OK'
                        })
                    }
                })
                .catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong!',
                        footer: 'Please try again later.',
                        confirmButtonText: 'OK'
                    })
                    console.error('Error saving data:', error);
                });
        }
    });
};

onMounted(async () => {
    await getServiceList();

    // Get user's agency from localStorage
    const userDetails = JSON.parse(localStorage.getItem('userDetailsStore'));
    if (userDetails && userDetails.agency && userDetails.agency.agencyName) {
        myAgency.value = userDetails.agency.agencyName;
    }
});

</script>


<style scoped>
.sticky-top {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
}

.greyout {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}
</style>