<template>
    <div class="bg-white p-4">
        <div class="mb-3 text-center">
            <h4 class="mb-3">Description</h4>
            <h6 class="hwss-primary">*** This tool is for Event Screening Only ***</h6>
        </div>
        <form @submit.prevent="submitForm" :disabled="isFormDeactivated">
            <div class="px-5">
                <!-- Client Details Section -->
                <div class="mb-4 p-3">
                    <h4 class="mb-3">Client Details</h4>
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="CID" class="form-label">CID</label>
                            <input type="number" class="form-control hwss-primary" id="CID" v-model="CID" required
                                min="11">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="clientFullName" class="form-label">Full Name</label>
                            <input type="text" class="form-control hwss-primary" id="clientFullName"
                                v-model="clientFullName" required>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="DOB" class="form-label">Date of Birth</label>
                            <input type="date" class="form-control hwss-primary" id="DOB" v-model="DOB" required>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="age" class="form-label">Age</label>
                            <input type="text" class="form-control hwss-primary" id="age" :value="calculatedAge"
                                readonly disabled>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="gender" class="form-label">Sex</label>
                            <select class="form-select hwss-primary" id="gender" v-model="gender" required>
                                <option value="" disabled selected>Select Sex</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div v-if="showParentalStatus" class="col-md-4 mb-3">
                            <label for="parentalStatus" class="form-label">Parental Status</label>
                            <select class="form-select hwss-primary" id="parentalStatus" v-model="parentalStatus"
                                required>
                                <option value="" disabled selected>Select Parental Status</option>
                                <option value="Married">Married</option>
                                <option value="Divorce">Divorce</option>
                                <option value="Single Parent">Single Parent</option>
                                <option value="One Deceased">One Deceased</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="currentAddress" class="form-label">Current Address</label>
                            <textarea class="form-control hwss-primary" id="currentAddress" v-model="currentAddress"
                                rows="3" required></textarea>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="dzongkhag" class="form-label">Dzongkhag</label>
                            <select class="form-select hwss-primary" id="dzongkhag" v-model="dzongkhag" required>
                                <option value="" disabled selected>Select Dzongkhag</option>
                                <!-- Dynamically generate options for all 20 dzongkhags of Bhutan -->
                                <option v-for="dzongkhag in dzongkhags" :key="dzongkhag" :value="dzongkhag">{{ dzongkhag
                                    }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="phoneNumber" class="form-label">Phone Number</label>
                            <input type="tel" class="form-control hwss-primary" id="phoneNumber" v-model="phoneNumber"
                                required maxlength="8">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="email" class="form-label">Email address</label>
                            <input type="email" class="form-control hwss-primary" id="email" v-model="email" required>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        <!-- Button Section -->
        <div class="d-flex justify-content-end">
            <button type="button" class="btn hwss-btn" :disabled="!isProceedButtonActive" @click="proceedToSelectTools">
                Proceed to Select Tools <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    </div>
    <div ref="swalDialog"></div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import endpoints from '@/api';

const emit = defineEmits(['proceedToSelectTools']);

const CID = ref('');
const clientFullName = ref('');
const DOB = ref('');
const gender = ref('');
const parentalStatus = ref('');
const currentAddress = ref('');
const phoneNumber = ref('');
const email = ref('');
const dzongkhag = ref('');

const dzongkhags = [
    'Bumthang', 'Chhukha', 'Dagana', 'Gasa', 'Haa', 'Lhuentse', 'Mongar', 'Paro', 'Pemagatshel', 'Punakha',
    'Samdrup Jongkhar', 'Samtse', 'Sarpang', 'Thimphu', 'Trashigang', 'Trashiyangtse', 'Trongsa', 'Tsirang', 'Wangdue Phodrang', 'Zhemgang'
];

const getCounselorName = JSON.parse(localStorage.getItem('userDetailsStore'));
const userRole = ref(getCounselorName?.user?.role || '');

const showParentalStatus = computed(() => {
    return userRole.value !== 'clinical_counselor';
});

const validateCID = (cid) => {
    const cidPattern = /^[1235]\d{10}$/;
    return cidPattern.test(cid);
};

const isProceedButtonActive = computed(() => {
    return validateCID(CID.value) &&
        clientFullName.value !== '' &&
        DOB.value !== '' &&
        gender.value !== '' &&
        (showParentalStatus.value ? parentalStatus.value !== '' : true) &&
        currentAddress.value !== '' &&
        dzongkhag.value !== '' &&
        phoneNumber.value !== '' &&
        email.value !== '';
});

const submitForm = async () => {
    if (!validateCID(CID.value)) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid CID',
            text: 'CID must be 11 digits and start with 1, 2, 3, or 5.',
        });
        return;
    }

    if (!showParentalStatus.value) {
        parentalStatus.value = "None";
    }
    try {
        // Await the username generation
        const username = await makeUserName();
        const getCounselorName = JSON.parse(localStorage.getItem('userDetailsStore'));

        // Ensure getCounselorName is not null and user is defined
        if (getCounselorName && getCounselorName.user) {
            const userAgency = getCounselorName.agency?.agencyName || 'Unknown Agency';
            const userAgencyCode = getCounselorName.agency?.agencyCode || 'Unknown Code';
            const formData = {
                userData: {
                    username: username,
                    CID: CID.value,
                    clientFullName: clientFullName.value,
                    DOB: DOB.value,
                    gender: gender.value,
                    parentalStatus: parentalStatus.value,
                    currentAddress: currentAddress.value,
                    phoneNumber: phoneNumber.value,
                    email: email.value,
                    counselorName: `${getCounselorName.user.firstName} ${getCounselorName.user.lastName}`,
                    dzongkhag: dzongkhag.value,
                },
                userAgencyData: {
                    agency: userAgencyCode,
                },
                agencyData: {
                    agency_code: userAgencyCode,
                    agency_name: userAgency
                },
            };
            // Send a submit request to the endpoint
            const response = await axios.post(endpoints.registerCounselorEventUser, formData);

            const userId = response.data.userId;
            localStorage.setItem('ClientUserIdEventBase', userId);
            return response.data; // Return the response data
        } else {
            throw new Error('User details not found in localStorage');
        }

    } catch (error) {
        // Handle errors
        console.error('Error submitting form:', error);

        if (error.response && error.response.data && error.response.data.error.includes('Duplicate entry')) {
            // Show a confirmation dialog using SweetAlert
            const confirmDuplicate = await Swal.fire({
                icon: 'warning',
                title: 'Duplicate Entry',
                text: 'Seems like this user was already screened. Do you wish to continue with existing user data?',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            });

            if (confirmDuplicate.isConfirmed) {
                try {
                    const response = await axios.post(endpoints.registerCounselorUser, this.formData);

                    const userId = response.data.userId;
                    localStorage.setItem('ClientUserIdCaseBase', userId);
                    return response.data;
                } catch (resendError) {
                    console.error('Error resending form:', resendError);
                    throw resendError;
                }
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Mobile number too long, please use Bhutanese standard mobile number excluding country code.`,
            });
            throw error;
        }

    };
}

const calculatedAge = computed(() => {
    if (!DOB.value) return '';
    const birthDate = new Date(DOB.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    let ageGroup;
    if (age < 14) {
        ageGroup = 'Below 14';
    } else if (age >= 14 && age <= 17) {
        ageGroup = '15 to 17';
    } else {
        ageGroup = 'Above 18';
    }
    sessionStorage.setItem('clientAgeGroup', ageGroup);

    return age;
});

const makeUserName = () => {
    return new Promise((resolve) => {
        const fullName = clientFullName.value;
        const dob = DOB.value;

        const username = `${fullName}${dob}`.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        resolve(username);
    });
};

const proceedToSelectTools = async () => {
    try {
        const responseData = await submitForm();
        if (responseData) {
            emit('proceedToEventSelectTools');
        } else {
            // Handle case where form submission failed
            console.error('Form submission failed');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
    }
};

watch(DOB, (newValue) => {
    if (newValue) {
        calculatedAge.value;
    }
});

watch(CID, (newCID) => {
    if (newCID && !validateCID(newCID)) {
        console.warn('CID must be 11 digits and start with 1, 2, 3, or 5');
    }
});

</script>

<style scoped>
input,
select,
textarea {
    border-radius: 10px;
    border: 1px solid #c9c9c9;
    padding: 0.5rem;
}

.hwss-btn {
    border-radius: 50px;
}
</style>