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
                                <!-- Add options for all 20 dzongkhags of Bhutan -->
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="userScreenedToday" class="form-label">User Screened Today</label>
                            <input type="number" class="form-control hwss-primary" id="userScreenedToday"
                                v-model="userScreenedToday" readonly>
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
            <button type="button" class="btn hwss-btn" @click="proceedToSelectTools">
                Proceed to Select Tools <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
const emit = defineEmits(['proceedToSelectTools']);

const caseName = ref('');
const purpose = ref('');
const dzongkhag = ref('');
const userScreenedToday = ref(0);

const CID = ref('');
const clientFullName = ref('');
const DOB = ref('');
const gender = ref('');
const parentalStatus = ref('');
const currentAddress = ref('');
const phoneNumber = ref('');
const email = ref('');

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
    // console.log('Proceed to Select Tools button clicked');
    emit('proceedToSelectTools');
};

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
  