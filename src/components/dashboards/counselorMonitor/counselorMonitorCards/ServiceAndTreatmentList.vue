<template>
    <div class="dashboard-container">
        <div v-if="isLoading" class="loading-overlay">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
        <div v-else-if="hasError" class="error-message">
            <i class="pi pi-exclamation-triangle"></i>
            <p>Error loading data. Please try again.</p>
        </div>
        <div v-else>
            <div class="dashboard-header">
                <h4 class="dashboard-title">Service and Treatment List</h4>
                <Button label="Refresh List" @click="getServiceList" class="refresh-btn rounded" icon="pi pi-refresh" />
            </div>
            <DataTable :value="filteredRows" :paginator="true" :rows="10" :paginatorTemplate="paginatorTemplate"
                :sortField="sortField" :sortOrder="sortOrder" @sortChange="onSortChange" resizableColumns
                columnResizeMode="fit" class="custom-datatable">
                <Column field="date" header="Date" sortable :body="formatDate"></Column>
                <Column field="user.first_name" header="Name" sortable :body="formatFullName"></Column>
                <Column field="user.date_of_birth" header="Age" sortable :body="calculateAge"></Column>
                <Column field="user.gender" header="Sex" sortable></Column>
                <Column field="assessment_status" header="Assessment Status" sortable :body="formatEmpty"></Column>
                <Column field="case_status" header="Case Status" sortable :body="formatEmpty"></Column>
                <Column field="counseling" header="Counseling" sortable :body="formatEmpty"></Column>
                <Column field="follow_up" header="Follow Up" sortable :body="formatEmpty"></Column>
                <Column field="comments" header="Comments" sortable :body="formatEmpty"></Column>
                <Column header="Actions">
                    <template #body="slotProps">
                        <Button label="View Details" class="view-details-btn rounded"
                            @click="viewDetails(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

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
                                <h4 class="profile-name">{{ selectedUser?.user?.first_name }} {{
                                    selectedUser?.user?.middle_name
                                    }} {{
                                        selectedUser?.user?.last_name }}</h4>
                                <ul class="profile-details">
                                    <li><strong>Age:</strong> {{ calculateAge(selectedUser?.user?.date_of_birth) }}</li>
                                    <li><strong>Sex:</strong> {{ selectedUser?.user?.gender }}</li>
                                    <li><strong>Employee ID:</strong> {{ selectedUser?.user?.academy_code || 'N/A' }}
                                    </li>
                                    <li><strong>Citizen ID:</strong> {{ selectedUser?.user?.identity_number }}</li>
                                    <li><strong>Nationality:</strong> {{ selectedUser?.user?.nationality }}</li>
                                    <li><strong>Phone:</strong> {{ selectedUser?.user?.mob_number }}</li>
                                    <li><strong>Email:</strong> {{ selectedUser?.user?.email }}</li>
                                    <li><strong>Role:</strong> {{ selectedUser?.user?.role }}</li>
                                    <li><strong>Active Agency:</strong> {{
                                        selectedUser?.user?.active_agency?.agency_name }}
                                    </li>
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
                                            <input type="text" class="form-control"
                                                :value="selectedUser?.user?.mother_name || 'N/A'" readonly>
                                        </div>
                                        <div class="col-md-6">
                                            <label>Father's Name:</label>
                                            <input type="text" class="form-control"
                                                :value="selectedUser?.user?.father_name || 'N/A'" readonly>
                                        </div>
                                        <div class="col-md-6">
                                            <label>Parents' Occupation:</label>
                                            <input type="text" class="form-control"
                                                :value="selectedUser?.user?.agency_details?.parent_occupation || 'N/A'"
                                                readonly>
                                        </div>
                                        <div class="col-md-6">
                                            <label>Parental Status:</label>
                                            <input type="text" class="form-control"
                                                :value="selectedUser?.user?.agency_details?.parent_status || 'N/A'"
                                                readonly>
                                        </div>
                                    </div>
                                </div>

                                <div class="info-section">
                                    <h5 class="section-title">Address Information</h5>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <h6>Permanent Address</h6>
                                            <div class="address-details">
                                                <p><strong>Village:</strong> {{ selectedUser?.user?.perm_add_village }}
                                                </p>
                                                <p><strong>Gewog:</strong> {{ selectedUser?.user?.perm_add_gewog }}</p>
                                                <p><strong>Dzongkhag:</strong> {{ selectedUser?.user?.perm_add_dzongkhag
                                                    }}</p>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <h6>Present Address</h6>
                                            <div class="address-details">
                                                <p><strong>Village:</strong> {{ selectedUser?.user?.ps_add_village }}
                                                </p>
                                                <p><strong>Gewog:</strong> {{ selectedUser?.user?.ps_add_gewog }}</p>
                                                <p><strong>Dzongkhag:</strong> {{ selectedUser?.user?.ps_add_dzongkhag
                                                    }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="info-section">
                                    <h5 class="section-title">Case Status</h5>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <label for="caseStatus">Case Status:</label>
                                            <select class="form-control" v-model="selectedUser.case_status"
                                                :disabled="selfRole === 'trained_professional'">
                                                <option :value="null" disabled>Select Case Status</option>
                                                <option value="On Going">On Going</option>
                                                <option value="Case Closed">Case Closed</option>
                                                <option value="Case Discontinued">Case Discontinued</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="info-section" v-if="selectedUser?.screening_data">
                                    <h5 class="section-title">Severity</h5>
                                    <div class="severity-tags">
                                        <div v-if="selectedUser.screening_data.gad_interpretation" class="severity-tag">
                                            <span class="substance-name">GAD Score:</span>
                                            <Tag :value="selectedUser.screening_data.gad_interpretation"
                                                :style="getSeverityStyles(selectedUser.screening_data.gad_interpretation)"
                                                rounded>
                                            </Tag>
                                        </div>
                                        <div v-if="selectedUser.screening_data.phq_interpretation" class="severity-tag">
                                            <span class="substance-name">PHQ Score:</span>
                                            <Tag :value="selectedUser.screening_data.phq_interpretation"
                                                :style="getSeverityStyles(selectedUser.screening_data.phq_interpretation)"
                                                rounded>
                                            </Tag>
                                        </div>
                                    </div>
                                </div>

                                <div class="info-section" :class="{ 'greyout': selfRole === 'trained_professional' }">
                                    <h5 class="section-title">Services and Treatment</h5>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="assessmentStatus">Assessment Status:</label>
                                            <select class="form-control" id="assessmentStatus"
                                                v-model="selectedUser.assessment_status">
                                                <option value="Not Conducted">Not Conducted</option>
                                                <option value="Conducted">Conducted</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="counselingStatus">Counseling Status:</label>
                                            <select class="form-control" id="counselingStatus"
                                                v-model="selectedUser.counseling">
                                                <option value="Availed">Availed</option>
                                                <option value="Not Required">Not Required</option>
                                                <option value="Waiting List">Waiting List</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="followUpStatus">Follow Up Status:</label>
                                            <select class="form-control" id="followUpStatus"
                                                v-model="selectedUser.follow_up">
                                                <option value="Treatment Completed">Treatment Completed</option>
                                                <option value="Undergoing Treatment">Undergoing Treatment</option>
                                                <option value="Completed Counselling Sessions">Completed Counselling
                                                    Sessions
                                                </option>
                                                <option value="Unwilling to Undergo Treatment">Unwilling to Undergo
                                                    Treatment
                                                </option>
                                                <option value="Undergone Rehabilitation">Undergone Rehabilitation
                                                </option>
                                                <option value="Undergoing Rehabilitation">Undergoing Rehabilitation
                                                </option>
                                                <option
                                                    value="Hospital-based Outpatient SUD Treatment and Care (Primary Phase)">
                                                    Hospital-based Outpatient SUD Treatment and Care (Primary Phase)
                                                </option>
                                                <option
                                                    value="Hospital-based Outpatient SUD Treatment and Care (Continuing Care)">
                                                    Hospital-based Outpatient SUD Treatment and Care (Continuing Care)
                                                </option>
                                                <option value="School-based SUD Treatment and Care">School-based SUD
                                                    Treatment
                                                    and
                                                    Care</option>
                                                <option value="Institution-based SUD Treatment and Care">
                                                    Institution-based SUD
                                                    Treatment and Care</option>
                                                <option value="Follow-up Drug Test Conducted">Follow-up Drug Test
                                                    Conducted
                                                </option>
                                                <option value="Detention-based SUD Treatment and Care">Detention-based
                                                    SUD
                                                    Treatment and Care</option>
                                            </select>
                                        </div>
                                        <div class="col-md-12 mb-3">
                                            <label for="comments">Comments:</label>
                                            <textarea class="form-control" id="comments"
                                                v-model="selectedUser.comments"></textarea>
                                        </div>
                                    </div>
                                    <div class="d-flex justify-content-end mt-3">
                                        <Button label="Save Changes" icon="pi pi-check" class="p-button-success"
                                            @click="saveChanges" />
                                    </div>
                                </div>

                                <div class="info-section"
                                    :class="{ 'greyout': selectedUser.referred !== 'Not Referred' }">
                                    <h5 class="section-title">Referral Status</h5>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="referTo">Refer To:</label>
                                            <select class="form-control" id="referTo" v-model="selectedUser.refer_to">
                                                <option value="clinical_counselor">Clinical Counselor</option>
                                                <option value="school_counselor">School Counselor</option>
                                                <option value="mh_admin">Mental Health Counselor</option>
                                                <option value="mh_admin">Medical Officer</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="official">Official:</label>
                                            <select class="form-control" id="official" v-model="selectedUser.official">
                                                <option v-for="option in officialOptions" :key="option.id"
                                                    :value="option.id">
                                                    {{ option.full_name }}, {{ option.active_agency }}
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="d-flex justify-content-end mt-3">
                                        <Button label="Refer Case" icon="pi pi-send" class="p-button-info"
                                            @click="referCase" />
                                    </div>
                                </div>
                                <div v-if="selectedUser.referred !== 'Not Referred'" class="alert alert-warning mt-3">
                                    User Already Referred
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
import { ref, computed, onMounted, watchEffect } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import Swal from 'sweetalert2';

const showModal = ref(false);
const selectedUser = ref(null);
const officialOptions = ref([]);
const selfRole = ref('');
const isLoading = ref(true);
const hasError = ref(false);

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
    if (!searchQuery.value.trim() || !Array.isArray(rowData.value)) {
        return rowData.value;
    }

    return rowData.value.filter(row =>
        selectedFields.value.some(field => {
            const fieldValue = row[field.split('.').pop()];
            return fieldValue?.toString().toLowerCase().includes(searchQuery.value.toLowerCase());
        })
    );
});

const getServiceList = async () => {
    try {
        isLoading.value = true;
        hasError.value = false;
        const response = await axios.get(endpoints.newServiceAndTreatment);
        if (response?.data?.data) {
            rowData.value = response.data.data;
        } else {
            console.error('Invalid response format:', response);
        }
    } catch (error) {
        hasError.value = true;
        console.error('Error fetching data:', error);
    } finally {
        isLoading.value = false;
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

const viewDetails = (user) => {
    selectedUser.value = user;
    showModal.value = true;
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