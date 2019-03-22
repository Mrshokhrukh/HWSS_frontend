<template>
    <div class="bg-white p-4">
        <div class="mb-3 text-center">
            <h4 class="mb-3">Description</h4>
            <h6 class="hwss-primary">*** This tool is for Case Screening Only ***</h6>
        </div>
        <form @submit.prevent="submitForm">
            <div class="px-5">
                <!-- Case Details Section -->
                <div class="mb-4 p-3">
                    <h4 class="mb-3">Case Details</h4>
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label for="caseName" class="form-label">Case Name</label>
                            <input type="text" class="form-control hwss-primary w-50" id="caseName" v-model="caseName"
                                required>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="purpose" class="form-label">Purpose</label>
                            <select class="form-select hwss-primary" id="purpose" v-model="purpose" required>
                                <option value="" disabled selected>Select Purpose</option>
                                <option value="Assessment">Assessment</option>
                                <option value="Intervention">Intervention</option>
                                <option value="Follow up">Follow up</option>
                                <option value="Termination">Termination</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="dzongkhag" class="form-label">Dzongkhag</label>
                            <select class="form-select hwss-primary" id="dzongkhag" v-model="dzongkhag" required>
                                <option value="" disabled selected>Select Dzongkhag</option>
                                <!-- Dynamically generate options for all 20 dzongkhags of Bhutan -->
                                <option v-for="dzongkhag in dzongkhags" :key="dzongkhag" :value="dzongkhag">{{ dzongkhag }}
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
                    <h4 class="mb-3">Client Details</h4>
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="CID" class="form-label">CID</label>
                            <input type="text" class="form-control hwss-primary" id="CID" v-model="CID" required>
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
                            <select class="form-select hwss-primary" id="parentalStatus" v-model="parentalStatus" required>
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
                                required>
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
import { ref, computed, watchEffect, watch, onMounted } from 'vue';
import Swal from 'sweetalert2';
const emit = defineEmits(['proceedToSelectTools']);

const maxUsersPerDay = 10;

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

// Define a function to reset the userScreenedToday counter
const resetUserScreenedToday = () => {
    localStorage.setItem('userScreenedToday', JSON.stringify({
        count: 0,
        lastUpdated: Date.now() // Store the current timestamp
    }));
};

// Check if the userScreenedToday data is stored in local storage, if not, initialize it
if (!localStorage.getItem('userScreenedToday')) {
    resetUserScreenedToday();
}

// Define reactive variable for userScreenedToday
const userScreenedToday = ref(0);

// Watch for changes in userScreenedToday and update local storage accordingly
watch(userScreenedToday, (newValue) => {
    localStorage.setItem('userScreenedToday', JSON.stringify({
        count: newValue,
        lastUpdated: Date.now() // Update the lastUpdated timestamp whenever the count changes
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
    return userScreenedToday.value === 10;
});

// Combine conditions to determine if the "Proceed to Select Tools" button should be active
const isProceedButtonActive = computed(() => {
    return isAllFieldsFilled.value && isUserScreenedTodayValid.value && !isFormDeactivated.value;
});

// Define a function to display Swal alert when the limit is reached
const showAlert = () => {
    Swal.fire({
        icon: 'warning',
        title: 'Daily Limit Reached',
        text: 'You have reached the maximum limit for screening today.',
        showConfirmButton: false
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
    const userData = JSON.parse(localStorage.getItem('userScreenedToday'));
    const currentTime = Date.now();

    // Check if 24 hours have passed since the last update
    if (currentTime - userData.lastUpdated >= 24 * 60 * 60 * 1000) {
        // Reset the counter if 24 hours have passed
        resetUserScreenedToday();
        userScreenedToday.value = 0; // Start counting from 1 for the new day
    } else {
        // Increment the counter if within 24 hours and limit it to maxUsersPerDay
        if (userData.count < maxUsersPerDay) {
            userScreenedToday.value = userData.count + 1;
        } else {
            // Handle max limit reached scenario
            showAlert();
        }
    }
};

// Watch for changes in reactive variables
watchEffect(() => {
    // Log the current state for debugging purposes
    console.log('Current State:', {
        caseName: caseName.value,
        purpose: purpose.value,
        dzongkhag: dzongkhag.value,
        userScreenedToday: userScreenedToday.value,
        CID: CID.value,
        clientFullName: clientFullName.value,
        DOB: DOB.value,
        gender: gender.value,
        parentalStatus: parentalStatus.value,
        currentAddress: currentAddress.value,
        phoneNumber: phoneNumber.value,
        email: email.value
    });
});

const submitForm = () => {
    // Handle form submission logic here
    console.log('Form submitted:', {
        caseName: caseName.value,
        purpose: purpose.value,
        dzongkhag: dzongkhag.value,
        userScreenedToday: userScreenedToday.value,
        CID: CID.value,
        clientFullName: clientFullName.value,
        DOB: DOB.value,
        gender: gender.value,
        parentalStatus: parentalStatus.value,
        currentAddress: currentAddress.value,
        phoneNumber: phoneNumber.value,
        email: email.value
    });
};

const proceedToSelectTools = () => {
    emit('proceedToSelectTools');
    incrementOnButtonClicked(); // Increment the userScreenedToday counter on button click
};

// Increment the userScreenedToday counter on component mount
onMounted(() => {
    incrementUserScreenedToday(); // Increment the userScreenedToday counter on component mount
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
  