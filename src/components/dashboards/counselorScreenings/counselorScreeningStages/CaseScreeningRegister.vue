<template>
    <div class="bg-white p-4">
        <div class="mb-3 text-center">
            <h4 class="mb-3">Description</h4>
            <h6 class="hwss-primary">*** This tool is for Case Screening Only ***</h6>
        </div>
        <form @submit.prevent="submitForm" :disabled="isFormDeactivated">
            <div class="px-5">
                <!-- Case Details Section -->
                <div class="mb-4 p-3">
                    <h4 class="mb-3">Case Details</h4>
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label for="caseName" class="form-label">Case Name (Presenting Issue)</label>
                            <input type="text" class="form-control hwss-primary w-50" id="caseName" v-model="caseName"
                                required>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="purpose" class="form-label">Purpose</label>
                            <select class="form-select hwss-primary" id="purpose" v-model="purpose" required>
                                <option value="" disabled selected>Select Purpose</option>
                                <option value="assessment">Assessment</option>
                                <option value="intervention">Intervention</option>
                                <option value="follow_up">Follow up</option>
                                <option value="termination">Termination</option>
                            </select>
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
                        <div class="col-md-2 col-md-offset-2 mb-3">
                            <label for="userScreenedToday" class="form-label">User Screened Today</label>
                            <input type="text" class="form-control hwss-primary w-50" id="userScreenedToday"
                                v-model="userScreenedToday" readonly disabled>
                        </div>
                    </div>
                </div>
                <!-- Client Details Section -->
                <div class="mb-4 p-3">
                    <h4 class="mb-3">Client Details (Ensure all details are correct)</h4>
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="CID" class="form-label">CID / Student Code / Work Permit / etc...</label>
                            <input type="text" class="form-control hwss-primary" id="CID" v-model="CID" required
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
                            <label for="gender" class="form-label">Gender</label>
                            <select class="form-select hwss-primary" id="gender" v-model="gender" required>
                                <option value="" disabled selected>Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="parentalStatus" class="form-label">Parental Status</label>
                            <select class="form-select hwss-primary" id="parentalStatus" v-model="parentalStatus"
                                required>
                                <option value="" disabled selected>Select Parental Status</option>
                                <option value="Married">Married</option>
                                <option value="Divorce">Divorce</option>
                                <option value="Single Parent">Single Parent</option>
                                <option value="One Deceased">One Deceased</option>
                                <!-- Add more options as needed -->
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="currentAddress" class="form-label">Current Address</label>
                            <textarea class="form-control hwss-primary" id="currentAddress" v-model="currentAddress"
                                rows="3" required></textarea>
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
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import endpoints from '@/api';

const emit = defineEmits(['proceedToSelectTools']);

const maxUsersPerDay = 10;

// Get the user's ID from localStorage
const userDetailsStore = JSON.parse(localStorage.getItem('userDetailsStore'));
const userId = userDetailsStore ? userDetailsStore.user.id : null;

const caseName = ref('');
const purpose = ref('');
const dzongkhag = ref('');

const CID = ref('');
const clientFullName = ref('');
const DOB = ref('');
const gender = ref('');
const parentalStatus = ref('');
const currentAddress = ref('');
const phoneNumber = ref('');
const email = ref('');

const dzongkhags = [
    'Bumthang', 'Chhukha', 'Dagana', 'Gasa', 'Haa', 'Lhuntse', 'Mongar', 'Paro', 'Pemagatshel', 'Punakha',
    'Samdrup Jongkhar', 'Samtse', 'Sarpang', 'Thimphu', 'Trashigang', 'Trashiyangtse', 'Trongsa', 'Tsirang', 'Wangdue Phodrang', 'Zhemgang'
];

const resetIfNewDay = () => {
    const today = new Date().toLocaleDateString();
    const storedDate = localStorage.getItem(`screeningDate_${userId}`);

    if (!storedDate || storedDate !== today) {
        resetUserScreenedToday();
        localStorage.setItem(`screeningDate_${userId}`, today);
        disableFormFields(); // Disable the form fields at the beginning of each new day
    }
};

// Define a function to reset the userScreenedToday counter
const resetUserScreenedToday = () => {
    localStorage.setItem(`userScreenedToday_${userId}`, JSON.stringify({
        count: 0,
        lastUpdated: Date.now()
    }));
};

// Check if the userScreenedToday data is stored in local storage, if not, initialize it
if (!localStorage.getItem(`userScreenedToday_${userId}`)) {
    resetUserScreenedToday();
}

// Define reactive variable for userScreenedToday
const userScreenedToday = ref(0);

// Watch for changes in userScreenedToday and update local storage accordingly
watch(userScreenedToday, (newValue) => {
    localStorage.setItem(`userScreenedToday_${userId}`, JSON.stringify({
        count: newValue,
        lastUpdated: Date.now()
    }));
});

// Define a computed property to check if all fields are filled
const isAllFieldsFilled = computed(() => {
    return (
        caseName.value !== '' &&
        purpose.value !== '' &&
        dzongkhag.value !== '' &&
        CID.value !== '' &&
        clientFullName.value !== '' &&
        DOB.value !== '' &&
        gender.value !== '' &&
        parentalStatus.value !== '' &&
        currentAddress.value !== '' &&
        phoneNumber.value !== '' &&
        email.value !== ''
    );
});

// Define a computed property to check if userScreenedToday is 10 or less
const isUserScreenedTodayValid = computed(() => {
    return userScreenedToday.value <= 10;
});

// Define a computed property to check if the form should be deactivated
const isFormDeactivated = computed(() => {
    return userScreenedToday.value >= 10;
});

// Combine conditions to determine if the "Proceed to Select Tools" button should be active
const isProceedButtonActive = computed(() => {
    return (
        isAllFieldsFilled.value && // Check if all form fields are filled
        isUserScreenedTodayValid.value && // Check if the daily screening limit has not been reached
        !isFormDeactivated.value // Check if the form is not deactivated
    );
});

// Define a function to display Swal alert when the limit is reached
const showAlert = () => {
    Swal.fire({
        icon: 'warning',
        title: 'Daily Limit Reached',
        text: 'You have reached the maximum limit for screening today.',
        showConfirmButton: true
    });
};

// Increment the userScreenedToday counter on "Proceed to Select Tools" button click
const incrementOnButtonClicked = () => {
    if (!isFormDeactivated.value) {
        incrementUserScreenedToday();
    } else {
        showAlert();
    }
};

// Define a function to increment the userScreenedToday counter
const incrementUserScreenedToday = () => {
    const userData = JSON.parse(localStorage.getItem(`userScreenedToday_${userId}`));

    if (userData.count < maxUsersPerDay) {
        userScreenedToday.value = userData.count + 1;
        userData.count += 1;
        localStorage.setItem(`userScreenedToday_${userId}`, JSON.stringify(userData));
    } else {
        showAlert();
        disableFormFields(); // Disable the form fields when the limit is reached
    }
};


const submitForm = async () => {
    try {
        // Await the username generation
        const username = await makeUserName();
        const getCounselorName = JSON.parse(localStorage.getItem('userDetailsStore'));

        // Ensure getCounselorName is not null and user is defined
        if (getCounselorName && getCounselorName.user) {
            const formData = {
                userData: {
                    caseName: caseName.value,
                    purpose: purpose.value,
                    dzongkhag: dzongkhag.value,
                    userScreenedToday: userScreenedToday.value,
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
                },
                userAgencyData: {
                    agency: "11001",
                },
                agencyData: {
                    agency_code: "11001",
                    agency_name: "Case Base Clients"
                },
            };
            // Send a submit request to the endpoint
            const response = await axios.post(endpoints.registerCounselorCaseUser, formData);

            const userId = response.data.userId;
            localStorage.setItem('ClientUserIdCaseBase', userId);
            return response.data;
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

                    // console.log('Form submitted successfully:', response.data);
                    const userId = response.data.userId;
                    localStorage.setItem('ClientUserIdCaseBase', userId);
                    return response.data; // Return the response data
                } catch (resendError) {
                    // Handle errors during resend
                    console.error('Error resending form:', resendError);
                    throw resendError; // Re-throw the error to be caught by the caller
                }
            }
        } else {
            // Display error message to the user using SweetAlert
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Mobile number too long, please use Bhutanese standard mobile number excluding country code.`,
            });

            // Re-throw the error to be caught by the caller
            throw error;
        }

    };
}

const makeUserName = () => {
    return new Promise((resolve) => {
        // Assuming clientFullName and DOB are reactive ref objects
        const fullName = clientFullName.value;
        const dob = DOB.value;

        // Generate the username
        const username = `${fullName}${dob}`.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

        // Resolve with the generated username
        resolve(username);
    });
};



const proceedToSelectTools = async () => {
    try {
        const responseData = await submitForm(); // Wait for form submission
        if (responseData) { // Check if form submission was successful
            emit('proceedToSelectTools');
            incrementOnButtonClicked();
        } else {
            // Handle case where form submission failed
            console.error('Form submission failed');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
    }
};


const disableFormFields = () => {
    const form = document.querySelector('form');
    const inputFields = form.querySelectorAll('input, select, textarea, button');
    inputFields.forEach(field => {
        field.disabled = true;
    });
};

watch(isFormDeactivated, (newValue) => {
    if (newValue) {
        disableFormFields();
    }
});

onMounted(() => {
    // incrementUserScreenedToday();
    resetIfNewDay();
    const userData = JSON.parse(localStorage.getItem(`userScreenedToday_${userId}`));
    if (userData) {
        userScreenedToday.value = userData.count;
        if (userScreenedToday.value === 10) {
            showAlert()
        }
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