<template>
    <div class="container mt-5">
        <div class="card mt-5">
            <div class="logo-container">
                <img src="@/assets/images/NDILogo.png" alt="NDI Logo" class="ndi-logo" />
                <a href="#" class="text-dark font-weight-bold">Use Bhutan NDI</a>
            </div>

            <div class="logo-container">
                <img src="@/assets/images/NDILogo.png" alt="NDI Logo" class="ndi-logo" />
                <a href="#" class="text-dark font-weight-bold">Login with NDI</a>
            </div>

            <div class="text-center mt-3">
                <h1 class="display-4" style="color: #2B656F; font-weight: bold">Sign Up</h1>
                <p class="lead" style="color: #2B656F; font-weight: bold">Agency Based User</p>
            </div> <br>

            <div class="progress-bar" role="progressbar" :style="{ width: progressBarWidth }" aria-valuenow="0"
                aria-valuemin="0" aria-valuemax="100" @click="handleProgressBarClick(1)">
            </div>

            <div class="step-container d-flex justify-content-between align-items-center px-5">
                <div class="step-circle" @click="handleProgressBarClick(1)">1</div>
                <hr class="flex-grow-1 mx-2">
                <div class="step-circle bg-light text-dark" @click="handleProgressBarClick(2)">2</div>
                <hr class="flex-grow-1 mx-2">
                <div class="step-circle bg-light text-dark" @click="handleProgressBarClick(3)">3</div>
            </div>
            <div class="container p-5 ">
                <div class="card-body text-start form rounded">
                    <form @submit.prevent="fetchCitizenDetails">
                        <h4 class="mb-2 text-muted"> <span class="rounded-number bg-success p-3">1</span> Fetch User Details
                        </h4>
                        <small class="text-muted mb-5">Select any Identifier </small>

                        <div class="form-group mb-3">
                            <div class="form-check form-check-inline" v-for="identifier in identifiers"
                                :key="identifier.value">
                                <input class="form-check-input" type="radio" :id="identifier.id" :value="identifier.value"
                                    v-model="formData.selectedIdentifier">
                                <label class="form-check-label text-muted" :for="identifier.id">{{ identifier.label
                                }}</label>
                            </div>
                        </div>

                        <div v-if="formData.selectedIdentifier === 'cid'" class="form-group mb-4">
                            <!-- Display CID-specific fields -->
                            <small for="cid" class="text-muted">Enter your CID/SRP Number:</small>
                            <input type="text" id="cid" v-model="formData.cid" class="form-control">
                            <!-- Date pickers for month, date, and year -->
                            <div class="form-group mt-3">
                                <small for="dob" class="text-muted">When is your Date of Birth?</small>
                                <div class="row">
                                    <div class="col">
                                        <select class="form-select" v-model="formData.selectedMonth">
                                            <option v-for="month in months" :key="month.value" :value="month.value">{{
                                                month.label }}</option>
                                        </select>
                                    </div>
                                    <div class="col">
                                        <select class="form-select" v-model="formData.selectedDate">
                                            <option v-for="date in dates" :key="date.value" :value="date.value">{{
                                                date.label }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="col">
                                        <select class="form-select" v-model="formData.selectedYear">
                                            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="formData.selectedIdentifier === 'casefile'" class="form-group">
                            <!-- Display message or prompt for Case File -->
                            <p class="text-danger">Please Contact The PEMA,directly if you are a Case File holder for
                                proceeding
                                with registration.</p>
                        </div>

                        <div v-if="formData.selectedIdentifier === 'passport'" class="form-group">
                            <!-- Display input fields for Passport -->
                            <div class="row">
                                <div class="col-md-6">
                                    <label for="passport" class="text-muted">Foreign Passport Number:</label>
                                    <input type="text" id="passport" v-model="formData.passport" class="form-control">
                                </div>
                                <div class="col-md-6">
                                    <label for="nationality" class="text-muted">Nationality:</label>
                                    <input type="text" id="nationality" v-model="formData.nationality" class="form-control">
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-4">
                                    <label for="first_name" class="text-muted">First Name:</label>
                                    <input type="text" id="first_name" v-model="formData.first_name" class="form-control">
                                </div>
                                <div class="col-md-4">
                                    <label for="middle_name" class="text-muted">Middle Name:</label>
                                    <input type="text" id="middle_name" v-model="formData.middle_name" class="form-control">
                                </div>
                                <div class="col-md-4">
                                    <label for="last_name" class="text-muted">Last Name:</label>
                                    <input type="text" id="last_name" v-model="formData.last_name" class="form-control">
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-4">
                                    <label for="date_of_birth" class="text-muted">Date of Birth:</label>
                                    <input type="date" id="date_of_birth" v-model="formData.date_of_birth"
                                        class="form-control">
                                </div>
                                <div class="col-md-4">
                                    <label for="gender" class="text-muted">Sex:</label>
                                    <select id="gender" v-model="formData.gender" class="form-select">
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label for="mob_number" class="text-muted">Mobile Number:</label>
                                    <input type="text" id="mob_number" v-model="formData.mob_number" class="form-control">
                                </div>
                            </div>


                            <div class="row">
                                <div class="col-md-4">
                                    <label for="perm_add_village" class="text-muted">Permanent Address Village:</label>
                                    <input type="text" id="perm_add_village" v-model="formData.perm_add_village"
                                        class="form-control">
                                </div>
                                <div class="col-md-4">
                                    <label for="perm_add_gewog" class="text-muted">Permanent Address Gewog:</label>
                                    <input type="text" id="perm_add_gewog" v-model="formData.perm_add_gewog"
                                        class="form-control">
                                </div>
                                <div class="col-md-4">
                                    <label for="perm_add_dzongkhag" class="text-muted">Permanent Address Dzongkhag:</label>
                                    <input type="text" id="perm_add_dzongkhag" v-model="formData.perm_add_dzongkhag"
                                        class="form-control">
                                </div>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary reg-btn my-3">Next</button>
                    </form>
                </div>

            </div>

        </div>

        <div class="card mt-3">
            <div class="card-body text-muted">
                <h5 class="mb-4">2. User Details</h5>
            </div>
        </div>

        <div class="card mt-3">
            <div class="card-body text-muted">
                <h5 class="mb-4">3. Login Info</h5>
            </div>
        </div>

        <div v-if="showSuccessMessage" class="alert alert-success mt-3" role="alert">
            Details fetched successfully! Registering user...
        </div>

        <div class="text-center mt-3">
            Already Have an Account? <a href="#" @click="toggleForm" style="color: #2B656F; font-weight: bold">Sign In</a>
        </div>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
// import axios from 'axios';

const formData = ref({
    selectedIdentifier: '',
    cid: '',
    casefile: '',
    passport: '',
    selectedMonth: '',
    selectedDate: '',
    selectedYear: '',
    date_of_birth: '',
    gender: '',
});

const identifiers = [
    { id: 'cidRadio', value: 'cid', label: 'CID Number' },
    { id: 'casefileRadio', value: 'casefile', label: 'Casefile No' },
    { id: 'passportRadio', value: 'passport', label: 'Foreign Passport/Work Permit' },
];

const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

const dates = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: String(i + 1) }));

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

const showSuccessMessage = ref(false);

const emit = defineEmits(['go-to-next-step']);


const fetchCitizenDetails =  () => {
    
                moveToStep3();
};



// function getCSRFToken() {
//     const name = 'csrftoken';
//     const value = "; " + document.cookie;
//     const parts = value.split("; " + name + "=");

//     if (parts.length === 2) {
//         return parts.pop().split(";").shift();
//     }

//     return null;
// }


// // Helper functions
// function formatDOB(dob) {
//     return dob.split('/').reverse().join('-');
// }

// function mapGender(gender) {
//     return gender === 'F' ? 'Female' : 'Male';
// }
// function mapNationality(country) {
//     if (!country || country.trim() === '') {
//         return 'Bhutanese';
//     }
//     return country;
// }

const moveToStep3 = () => {
    emit('go-to-next-step', 'step-three');
};

</script>

<style scoped>
.rounded-number {
    color: #fff;
    height: 1rem;
    width: 1rem;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.reg-btn {
    background-color: #2B656F !important;
    width: 100%;
}

.text-muted {
    color: #2B656F !important;
}

.form-check-input {
    background-color: #2B656F !important;
}

.form-check-label {
    color: #2B656F !important;
}

.form {
    background-color: #2B656F24;
}

.step-line {
    border: none;
    height: 2px;
    background-color: #2B656F;
    /* Set your desired color */
}

.step-container {
    position: relative;
    text-align: center;
    transform: translateY(-43%);
}

.step-circle {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: #2B656F;
    border: 2px solid #2B656F;
    color: white;
    line-height: 30px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    cursor: pointer;
    /* Added cursor pointer */
}</style>