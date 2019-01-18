<template>
    <div class="container mt-5">
        <div class="card mt-5">
            <div class="card-body">
                <form @submit.prevent="fetchCitizenDetails">
                    <h4 class="mb-4"> <span class="rounded-number bg-primary">1</span> Fetch User Details</h4>
                    <small class="text-muted">Select any Identifier </small>

                    <div class="form-group">
                        <label class="text-muted">Select Identifier:</label>
                        <div class="form-check form-check-inline" v-for="identifier in identifiers" :key="identifier.value">
                            <input class="form-check-input" type="radio" :id="identifier.id" :value="identifier.value"
                                v-model="formData.selectedIdentifier">
                            <label class="form-check-label text-muted" :for="identifier.id">{{ identifier.label }}</label>
                        </div>
                    </div>

                    <div v-if="formData.selectedIdentifier === 'cid'" class="form-group">
                        <label for="cid" class="text-muted">CID Number:</label>
                        <input type="text" id="cid" v-model="formData.cid" class="form-control">
                    </div>

                    <div v-if="formData.selectedIdentifier === 'casefile'" class="form-group">
                        <label for="casefile" class="text-muted">Case File Number:</label>
                        <input type="text" id="casefile" v-model="formData.casefile" class="form-control">
                    </div>

                    <div v-if="formData.selectedIdentifier === 'passport'" class="form-group">
                        <label for="passport" class="text-muted">Passport Number:</label>
                        <input type="text" id="passport" v-model="formData.passport" class="form-control">
                    </div>

                    <!-- Date pickers for month, date, and year -->
                    <div class="form-group">
                        <label for="dob" class="text-muted">Date of Birth:</label>
                        <div class="row">
                            <div class="col">
                                <select class="form-select" v-model="formData.selectedMonth">
                                    <option v-for="month in months" :key="month.value" :value="month.value">{{ month.label
                                    }}</option>
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

                    <button type="submit" class="btn btn-primary my-3">Next</button>
                </form>
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
});

const identifiers = [
    { id: 'cidRadio', value: 'cid', label: 'CID Number' },
    { id: 'casefileRadio', value: 'casefile', label: 'Casefile No' },
    { id: 'passportRadio', value: 'passport', label: 'Passport/Work Permit' },
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

const fetchCitizenDetails = async () => {
    try {
        // Ensure that the CSRF token is set in the headers
        const csrfToken = getCSRFToken();
        const headers = { 'X-CSRFToken': csrfToken };

        const response = await axios.get(`http://localhost:8000/api/v1/access/get-citizen-details/${formData.value.selectedIdentifier}/`, { headers });


        if (response.data) {
            const citizenDetails = response.data;
            const temporaryUsername = generateTemporaryUsername();
            const mappedData = {
                identity_number: citizenDetails[formData.value.selectedIdentifier],
                first_name: citizenDetails.firstName,
                middle_name: citizenDetails.middleName || '',
                last_name: citizenDetails.lastName,
                date_of_birth: formatDOB(citizenDetails.dob),
                gender: mapGender(citizenDetails.gender),
                mob_number: citizenDetails.mobileNumber,
                perm_add_village: citizenDetails.villageName,
                perm_add_gewog: citizenDetails.gewogName,
                perm_add_dzongkhag: citizenDetails.dzongkhagName,
                nationality: mapNationality(citizenDetails.country),
                username: temporaryUsername,
            };

            console.log(mappedData);

            await registerUser(mappedData);

            // Delay fetch action by 3 seconds
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Show success message and move to the next step
            showSuccessMessage.value = true;
            moveToStep3(mappedData);
        } else {
            showSuccessMessage.value = 'Citizen details not found';
        }
    } catch (error) {
        console.error('An error occurred during fetching details', error);
    }
};

const registerUser = async (userData) => {
    try {
        const response = await axios.post('http://localhost:8000/api/v1/access/register-api-user/', userData);
        console.log('User registration response:', response.data);
    } catch (error) {
        console.error('Error registering user:', error.response?.data?.error || 'An error occurred during user registration');
    }
};

function getCSRFToken() {
    const name = 'csrftoken';
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");

    if (parts.length === 2) {
        return parts.pop().split(";").shift();
    }

    return null;
}

const generateTemporaryUsername = () => {
    const generateRandomString = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    return `temp_user_${generateRandomString(8)}`;
};


// Helper functions
function formatDOB(dob) {
    return dob.split('/').reverse().join('-');
}

function mapGender(gender) {
    return gender === 'F' ? 'Female' : 'Male';
}
function mapNationality(country) {
    if (!country || country.trim() === '') {
        return 'Bhutanese';
    }
    return country;
}

const moveToStep3 = (citizenDetails) => {
    emit('go-to-next-step', 'step-three', citizenDetails);
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
</style>