<template>
    <div class="container mt-5">
        <div class="card mt-5">
            <div class="logo-container">
                <img src="@/assets/images/NDILogo.png" alt="NDI Logo" class="ndi-logo" />
                <a href="#" class="text-dark font-weight-bold">Use Bhutan NDI</a>
              </div>
    
              <div class="text-center mt-3">
                <h1 class="display-4" style="color: #2B656F; font-weight: bold">Sign Up</h1>
                <p class="lead" style="color: #2B656F; font-weight: bold">Agency Based User</p>
              </div> <br>

              <div class="progress-bar" role="progressbar" :style="{ width: progressBarWidth }" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" @click="handleProgressBarClick(1)">
            </div>
    
            <div class="step-container d-flex justify-content-between">
              <div class="step-circle" @click="handleProgressBarClick(1)">1</div>
              <div class="step-circle" @click="handleProgressBarClick(2)">2</div>
              <div class="step-circle" @click="handleProgressBarClick(3)">3</div>
            </div>
            <div class="container p-5 ">
                <div class="card-body text-start form rounded">
                    <form @submit.prevent="fetchCitizenDetails">
                        <h4 class="mb-2 text-muted"> <span class="rounded-number bg-success p-3">1</span> Fetch User Details</h4>
                        <small class="text-muted mb-5">Select any Identifier </small>
    
                        <div class="form-group mb-3">
                            <div class="form-check form-check-inline" v-for="identifier in identifiers" :key="identifier.value">
                                <input class="form-check-input" type="radio" :id="identifier.id" :value="identifier.value"
                                    v-model="formData.selectedIdentifier">
                                <label class="form-check-label text-muted" :for="identifier.id">{{ identifier.label }}</label>
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
                                            <option v-for="date in dates" :key="date.value" :value="date.value">{{ date.label }}
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
                            <p class="text-danger">Please Contact The PEMA,directly if you are a Case File holder for proceeding
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
                                    <input type="date" id="date_of_birth" v-model="formData.date_of_birth" class="form-control">
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
import axios from 'axios';

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

// this is the comment which needs to be removed after the css is applied
// const fetchCitizenDetails = async () => {
//     if (formData.value.selectedIdentifier === 'cid') {
//         try {
//             // Ensure that the CSRF token is set in the headers
//             const csrfToken = getCSRFToken();
//             const headers = { 'X-CSRFToken': csrfToken };

//             const response = await axios.get(`http://localhost:8000/api/v1/access/get-citizen-details/${formData.value.cid}/`, { headers });

//             if (response.data) {
//                 const citizenDetails = response.data;

//                 const formattedMonth = formData.value.selectedMonth.padStart(2, '0');
//                 const formattedDate = formData.value.selectedDate.padStart(2, '0');
//                 const usernameSuffix = citizenDetails.firstName.toLowerCase() + formattedMonth + formattedDate;
//                 console.log(usernameSuffix);
//                 const mappedData = {
//                     identity_number: citizenDetails[formData.value.selectedIdentifier],
//                     first_name: citizenDetails.firstName,
//                     middle_name: citizenDetails.middleName || '',
//                     last_name: citizenDetails.lastName,
//                     date_of_birth: formatDOB(citizenDetails.dob),
//                     gender: mapGender(citizenDetails.gender),
//                     mob_number: citizenDetails.mobileNumber,
//                     perm_add_village: citizenDetails.villageName,
//                     perm_add_gewog: citizenDetails.gewogName,
//                     perm_add_dzongkhag: citizenDetails.dzongkhagName,
//                     nationality: mapNationality(citizenDetails.country),
//                     username: usernameSuffix,
//                 };

//                 console.log(mappedData);

//                 // Delay fetch action by 3 seconds
//                 await new Promise(resolve => setTimeout(resolve, 3000));

//                 // Show success message and move to the next step
//                 showSuccessMessage.value = true;
//                 moveToStep3(mappedData);
//             } else {
//                 showSuccessMessage.value = 'Citizen details not found';
//             }
//         } catch (error) {
//             console.error('An error occurred during fetching details', error);
//         }
//     } else if (formData.value.selectedIdentifier === 'casefile') {
//         // Display a prompt for Case File registration
//         window.alert('Contact PEMA directly for Case File registration.');
//     } else if (formData.value.selectedIdentifier === 'passport') {
//         // Display input fields for Passport registration
//         const proceed = window.confirm('Enter relevant fields for Passport registration. Proceed to next step?');
//         if (proceed) {
//             // Handle Passport registration logic here
//         }
//     }
// };

// const registerUser = async (userData) => {
//     try {
//         const formData = new FormData();

//         // Append each field to the FormData object
//         for (const key in userData) {
//             formData.append(key, userData[key]);
//         }

//         formData.append('email', 'placeholder@email.com');

//         console.log('User Data for Registration:', formData);

//         const response = await axios.post('http://localhost:8000/api/v1/access/register-api-user/', formData);

//         console.log('User registration response:', response.data);
//     } catch (error) {
//         console.error('Error registering user:', error.response?.data?.error || 'An error occurred during user registration');
//     }
// };

// this is the comment which needs to be removed after the css is applied

// function getCSRFToken() {
//     const name = 'csrftoken';
//     const value = "; " + document.cookie;
//     const parts = value.split("; " + name + "=");

//     if (parts.length === 2) {
//         return parts.pop().split(";").shift();
//     }

//     return null;
// }

// this is the comment which needs to be removed after the css is applied
// Helper functions
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

// this is the end of the comment for CSS




// const moveToStep3 = (citizenDetails) => {
//     emit('go-to-next-step', 'step-three', citizenDetails);
// };
const fetchCitizenDetails = () => {
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
    background-color:  #2B656F24;
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
    background-color: #fff;
    border: 2px solid #007bff;
    line-height: 30px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    cursor: pointer; /* Added cursor pointer */
  }
</style>