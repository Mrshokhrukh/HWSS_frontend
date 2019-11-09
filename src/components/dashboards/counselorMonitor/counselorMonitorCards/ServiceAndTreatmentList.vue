<template>
    <div class="dashboard-container">
        <!-- Loading and error handling -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
        <div v-else-if="hasError" class="error-message">
            <i class="pi pi-exclamation-triangle"></i>
            <p>Error loading data. Please try again.</p>
        </div>
        <div v-else>
            <!-- Data Table -->
            <div class="dashboard-header">
                <h4 class="dashboard-title">Service and Treatment List</h4>
                <Button label="Refresh List" @click="getServiceList" class="refresh-btn rounded" icon="pi pi-refresh" />
            </div>
            <DataTable :value="processedRows" :paginator="true" :rows="10" :paginatorTemplate="paginatorTemplate"
                :sortField="sortField" :sortOrder="sortOrder" @sortChange="onSortChange" resizableColumns
                columnResizeMode="fit" class="custom-datatable">
                <Column field="date" header="Date" sortable :body="formatDate" />
                <Column field="full_name" header="Name" sortable :body="fullNameTemplate" />
                <Column field="age" header="Age" sortable :body="(slotProps) => calculateAge(slotProps.data.user)" />
                <Column field="user.gender" header="Sex" sortable />
                <Column field="assessment_status" header="Assessment Status" sortable :body="formatEmpty" />
                <Column field="case_status" header="Case Status" sortable :body="formatEmpty" />
                <Column field="counseling" header="Counseling" sortable :body="formatEmpty" />
                <Column field="follow_up" header="Follow Up" sortable :body="formatEmpty" />
                <Column field="comments" header="Comments" sortable :body="formatEmpty" />
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
                            <div v-if="selectedUser" class="profile-card">
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

                                <div class="info-section d-none">
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

                                <div class="info-section">
                                    <div class="severity-section">
                                        <h3 class="severity-section-title">Mental Health Severity</h3>
                                        <div class="severity-pills">
                                            <div class="severity-pill"
                                                :class="getSeverityClass(selectedUser.screening_data.phq_interpretation)">
                                                PHQ-9: {{ selectedUser.screening_data.phq_interpretation }}
                                            </div>
                                            <div class="severity-pill"
                                                :class="getSeverityClass(selectedUser.screening_data.gad_interpretation)">
                                                GAD-7: {{ selectedUser.screening_data.gad_interpretation }}
                                            </div>
                                            <div class="severity-pill"
                                                :class="getSeverityClass(selectedUser.screening_data.ace_interpretation)">
                                                ACE: {{ selectedUser.screening_data.ace_interpretation }}
                                            </div>
                                        </div>
                                    </div>

                                    <div class="severity-section">
                                        <h3 class="severity-section-title">SUD Severity</h3>
                                        <div class="severity-pills">
                                            <template v-if="selectedUser.screening_data.assist_data">
                                                <div v-for="(value, key) in filterNonInjectionSubstances(selectedUser.screening_data.assist_data)"
                                                    :key="key" class="severity-pill"
                                                    :class="getRiskClass(value.measurement)">
                                                    {{ formatSubstanceName(key) }}: {{ value.measurement }}
                                                </div>
                                            </template>
                                        </div>
                                    </div>

                                    <div class="severity-section">
                                        <h3 class="severity-section-title">Drug Intake by Injection</h3>
                                        <div class="severity-pills">
                                            <template
                                                v-if="selectedUser.screening_data.assist_data?.injection_measurement">
                                                <div class="severity-pill"
                                                    :class="getRiskClass(selectedUser.screening_data.assist_data.injection_measurement)">
                                                    Injection: {{
                                                        selectedUser.screening_data.assist_data.injection_measurement }}
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </div>

                                <div class="card" :class="{ 'disabled-section': selfRole === 'trained_professional' }">
                                    <div class="card-body">
                                        <!-- Header -->
                                        <h5 class="card-title mb-4">Services and Treatment</h5>

                                        <div class="row g-3">
                                            <!-- Assessment Status -->
                                            <div class="col-md-6">
                                                <div class="form-group">
                                                    <label for="assessmentStatus" class="form-label">Assessment
                                                        Status</label>
                                                    <select class="form-select" id="assessmentStatus"
                                                        v-model="selectedUser.assessment_status"
                                                        :disabled="selfRole === 'trained_professional'">
                                                        <option value="Not Conducted">Not Conducted</option>
                                                        <option value="Conducted">Conducted</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <!-- Case Status -->
                                            <div class="col-md-6">
                                                <div class="form-group">
                                                    <label for="caseStatus" class="form-label">Case Status</label>
                                                    <select class="form-select" id="caseStatus"
                                                        v-model="selectedUser.case_status"
                                                        :disabled="selfRole === 'trained_professional'">
                                                        <option value="On Going">On Going</option>
                                                        <option value="Case Closed">Case Closed</option>
                                                        <option value="Case Discontinued">Case Discontinued</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <!-- Counseling Status - New Field -->
                                            <div class="col-md-6">
                                                <div class="form-group">
                                                    <label for="counselingStatus" class="form-label">Counseling
                                                        Status</label>
                                                    <select class="form-select" id="counselingStatus"
                                                        v-model="selectedUser.counseling_status"
                                                        :disabled="selfRole === 'trained_professional'">
                                                        <option value="Availed">Availed</option>
                                                        <option value="Not Required">Not Required</option>
                                                        <option value="Waiting List">Waiting List</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <!-- Follow Up Status -->
                                            <div class="col-md-6">
                                                <div class="form-group">
                                                    <label for="followUpStatus" class="form-label">Follow Up
                                                        Status</label>
                                                    <select class="form-select" id="followUpStatus"
                                                        v-model="selectedUser.follow_up"
                                                        :disabled="selfRole === 'trained_professional'">
                                                        <option value="Treatment Completed">Treatment Completed</option>
                                                        <option value="Undergoing Treatment">Undergoing Treatment
                                                        </option>
                                                        <option value="Completed Counselling Sessions">Completed
                                                            Counselling
                                                            Sessions</option>
                                                        <option value="Unwilling to Undergo Treatment">Unwilling to
                                                            Undergo
                                                            Treatment</option>
                                                        <option value="Undergone Rehabilitation">Undergone
                                                            Rehabilitation
                                                        </option>
                                                        <option value="Undergoing Rehabilitation">Undergoing
                                                            Rehabilitation
                                                        </option>
                                                        <option
                                                            value="Hospital-based Outpatient SUD Treatment and Care (Primary Phase)">
                                                            Hospital-based Outpatient SUD Treatment and Care (Primary
                                                            Phase)
                                                        </option>
                                                        <option
                                                            value="Hospital-based Outpatient SUD Treatment and Care (Continuing Care)">
                                                            Hospital-based Outpatient SUD Treatment and Care (Continuing
                                                            Care)
                                                        </option>
                                                        <option value="School-based SUD Treatment and Care">School-based
                                                            SUD
                                                            Treatment and Care</option>
                                                        <option value="Institution-based SUD Treatment and Care">
                                                            Institution-based SUD Treatment and Care</option>
                                                        <option value="Follow-up Drug Test Conducted">Follow-up Drug
                                                            Test
                                                            Conducted</option>
                                                        <option value="Detention-based SUD Treatment and Care">
                                                            Detention-based
                                                            SUD Treatment and Care</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <!-- Comments -->
                                            <div class="col-12">
                                                <div class="form-group">
                                                    <label for="comments" class="form-label">Comments</label>
                                                    <textarea class="form-control" id="comments"
                                                        v-model="selectedUser.comments" rows="4"
                                                        :disabled="selfRole === 'trained_professional'"></textarea>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Save Button -->
                                        <div class="d-flex justify-content-end mt-4">
                                            <button class="btn refresh-btn" @click="saveChanges"
                                                :disabled="selfRole === 'trained_professional'">
                                                <i class="pi pi-check me-2"></i>
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div class="info-section" :class="{ 'greyout': selectedUser.referred === 'Referred' }">
                                    <h5 class="section-title">Referral Status</h5>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="referTo">Refer To:</label>
                                            <select class="form-control" id="referTo" v-model="selectedUser.refer_to">
                                                <option value="" selected="true" disabled>Select One</option>
                                                <option value="clinical_counselor">Clinical Counselor</option>
                                                <option value="psychiatrist">Psychiatrist</option>
                                                <option value="medical_officer">Medical Officer</option>
                                                <option value="school_counselor">School Counselor</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="official">Official:</label>
                                            <AutoComplete v-model="selectedUser.official"
                                                :suggestions="filteredOfficials" @complete="searchOfficials"
                                                field="full_name" placeholder="Type Official's Name"
                                                class="form-control p-0" :forceSelection="true">
                                            </AutoComplete>
                                        </div>
                                    </div>
                                    <div class="d-flex justify-content-end mt-3">
                                        <Button label="Refer Case" icon="pi pi-send" class="refresh-btn rounded"
                                            @click="referCase" />
                                    </div>
                                </div>
                                <div v-if="selectedUser.referred === 'Referred'" class="alert alert-warning mt-3">
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
import { ref, computed, onMounted, watchEffect, watch } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import Swal from 'sweetalert2';
import AutoComplete from 'primevue/autocomplete';

const showModal = ref(false);
const selectedUser = ref(null);
const officialOptions = ref([]);
const filteredOfficials = ref([]);
const selfRole = ref('');
const isLoading = ref(false);
const hasError = ref(false);

const rowData = ref([]);
const searchQuery = ref('');
const selectedFields = ref([
    'date',
    'user.first_name',
    'user.middle_name',
    'user.last_name',
    'full_name',
    'age',
    'user.gender',
    'assessment_status',
    'case_status',
    'counseling',
    'follow_up',
    'comments',
]);


const fullNames = ref(new Map());

const getUserRole = () => {
    try {
        const userDetails = JSON.parse(localStorage.getItem('userDetailsStore'));
        selfRole.value = userDetails?.user?.role || '';
    } catch (error) {
        console.error('Error getting user role:', error);
    }
}

const formatFullName = async (record) => {
    try {
        if (!record || !record.user) {
            console.error('Invalid record structure:', record);
            return '';
        }

        const user = record.user;
        const firstName = user.first_name || '';
        const middleName = user.middle_name ? ` ${user.middle_name}` : '';
        const lastName = user.last_name ? ` ${user.last_name}` : '';

        const fullName = `${firstName}${middleName}${lastName}`.trim();
        return fullName || '';
    } catch (error) {
        console.error('Error in formatFullName:', error);
        return '';
    }
};

// Replace the async fullNameTemplate with this synchronous version
const fullNameTemplate = (rowData) => {
    if (!rowData || !rowData.user) return '';

    const user = rowData.user;
    const firstName = user.first_name || '';
    const middleName = user.middle_name ? ` ${user.middle_name}` : '';
    const lastName = user.last_name ? ` ${user.last_name}` : '';

    return `${firstName}${middleName}${lastName}`.trim();
};

const searchOfficials = (event) => {
    const query = event.query.toLowerCase();
    filteredOfficials.value = officialOptions.value.filter((official) =>
        official.full_name.toLowerCase().includes(query)
    );
};

const formatEmpty = (rowData, column) => {
    if (rowData[column.field] === 'follow_up' && rowData[column.field] === '') {
        return '----';
    }
    return rowData[column.field];
};

const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
        case 'severe':
        case 'high risk':
            return 'risk-high';
        case 'moderate':
        case 'moderately severe':
            return 'risk-moderate';
        case 'mild':
        case 'low risk':
            return 'risk-low';
        default:
            return '';
    }
};

// const filterSubstances = (assistData) => {
//     if (!assistData) return {};

//     const substances = {};
//     Object.keys(assistData).forEach(key => {
//         if (key.endsWith('_measurement')) {
//             const substanceName = key.replace('_measurement', '');
//             substances[substanceName] = {
//                 measurement: assistData[key],
//                 flag: assistData[`${substanceName}_flag`]
//             };
//         }
//     });
//     return substances;
// };

const filterNonInjectionSubstances = (assistData) => {
    if (!assistData) return {};

    const substances = {};
    Object.keys(assistData).forEach(key => {
        // Only include non-injection measurements
        if (key.endsWith('_measurement') && !key.includes('injection')) {
            const substanceName = key.replace('_measurement', '');
            substances[substanceName] = {
                measurement: assistData[key],
                flag: assistData[`${substanceName}_flag`]
            };
        }
    });
    return substances;
};
const formatSubstanceName = (name) => {
    return name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const getRiskClass = (measurement) => {
    switch (measurement?.toLowerCase()) {
        case 'high risk':
            return 'risk-high';
        case 'moderate risk':
            return 'risk-moderate';
        case 'low risk':
            return 'risk-low';
        default:
            return '';
    }
};

const myAgency = ref('');

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

const processedRows = computed(() => {
    if (!filteredRows.value) return [];

    return filteredRows.value.map(row => ({
        ...row,
        full_name: fullNameTemplate(row),
        age: calculateAge(row.user?.date_of_birth)
    }));
});

const getServiceList = async () => {
    try {
        isLoading.value = true;
        hasError.value = false;
        const response = await axios.get(endpoints.newServiceAndTreatment);
        rowData.value = response.data.filter(row => {
            const agencyName = row?.user?.active_agency?.agency_name;
            return agencyName === myAgency.value;
        });
    } catch (error) {
        hasError.value = true;
        console.error('Error fetching data:', error);
    } finally {
        isLoading.value = false;
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

const viewDetails = (user) => {
    selectedUser.value = user;
    showModal.value = true;
};
const handleModalClose = () => {
    selectedUser.value = null;
    showModal.value = false;
};


const formatDate = (rowData) => {
    return new Date(rowData.date).toLocaleDateString();
};

const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const saveChanges = () => {
    const counselor = JSON.parse(localStorage.getItem('userDetailsStore'));
    const counselorId = counselor.user.id;

    const formData = {
        updateData: {
            assessment_status: selectedUser.value.assessment_status,
            counseling: selectedUser.value.counseling_status,
            follow_up: selectedUser.value.follow_up,
            comments: selectedUser.value.comments,
            case_status: selectedUser.value.case_status,
            id: selectedUser.value.user.id,
            updated_by: counselorId
        }
    };

    handleModalClose();
    Swal.fire({
        title: 'Confirm Save Changes!',
        text: 'All changes will be saved!',
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
                        getServiceList();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Something went wrong!',
                            footer: 'Please try again later.',
                            confirmButtonText: 'OK'
                        });
                    }
                })
                .catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong!',
                        footer: 'Please try again later.',
                        confirmButtonText: 'OK'
                    });
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

    // Get form data - Fix: Use the correct user ID from the nested user object
    const formData = {
        referData: {
            referred_by: counselorId,
            referred_to_name: referredToName,
            // Fix: Use the ServiceAndTreatment record's ID instead of user's ID
            user: selectedUserData.user.id  // Changed from selectedUserData.id to selectedUserData.user.id
        },
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
                    // Improve error handling to show the specific error message from backend
                    const errorMessage = error.response?.data?.error || 'Something went wrong!';
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: errorMessage,
                        footer: 'Please try again later.',
                        confirmButtonText: 'OK'
                    })
                    console.error('Error saving data:', error);
                });
        }
    });
};

onMounted(() => {
    getUserRole();
    const userDetails = JSON.parse(localStorage.getItem('userDetailsStore'));
    myAgency.value = userDetails?.agency?.agencyName || '';
    getServiceList();
});


watch(() => filteredRows.value, async (newRows) => {
    if (!newRows) return;

    // Update all full names
    for (const row of newRows) {
        if (!fullNames.value.has(row.id)) {
            const formattedName = await formatFullName(row);
            fullNames.value.set(row.id, formattedName);
        }
    }
}, { immediate: true, deep: true });
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

.save-btn,
.refer-btn {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.2s;
}

.save-btn:hover,
.refer-btn:hover {
    opacity: 0.9;
}

.severity-section {
    margin-bottom: 2rem;
}

.severity-section-title {
    color: #2B656F;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.severity-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.severity-pill {
    display: flex;
    align-items: center;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.9rem;
}

.risk-high {
    background-color: #FFE4E4;
    color: #D32F2F;
}

.risk-moderate {
    background-color: #FFF3E0;
    color: #E65100;
}

.risk-low {
    background-color: #E8F5E9;
    color: #2E7D32;
}

:deep(.p-autocomplete) {
    width: 100%;
}

:deep(.p-autocomplete-input) {
    border: 1px solid #ced4da;
    border-radius: 4px;
    width: 100%;
    padding: 0.5rem;
}

:deep(.p-autocomplete-input:focus) {
    border-color: #2B656F;
    box-shadow: 0 0 0 0.2rem rgba(43, 101, 111, 0.25);
    outline: none;
}

:deep(.p-autocomplete-panel) {
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.disabled-section {
    opacity: 0.6;
    pointer-events: none;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
}

.disabled-section::after {
    content: "Access restricted for trained professionals";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    display: none;
}

.disabled-section:hover::after {
    display: block;
}
</style>