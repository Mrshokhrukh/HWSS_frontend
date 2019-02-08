<template>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow p-3 mb-5">


                    <div class="text-center mt-3">
                        <h1 class="display-4" style="color: #2B656F; font-weight: bold">Sign Up</h1>
                        <p class="lead" style="color: #2B656F; font-weight: bold">Agency Based User</p>
                    </div>
                    <div class="progress-bar" role="progressbar" :style="{ width: progressBarWidth }" aria-valuenow="0"
                        aria-valuemin="0" aria-valuemax="100" @click="handleProgressBarClick(1)">
                    </div>

                    <div class="step-container d-flex justify-content-between align-items-center px-5">
                        <div class="step-circle bg-light text-dark" @click="handleProgressBarClick(1)">1</div>
                        <hr class="flex-grow-1 mx-2">
                        <div class="step-circle" @click="handleProgressBarClick(2)">2</div>
                        <hr class="flex-grow-1 mx-2">
                        <div class="step-circle bg-light text-dark" @click="handleProgressBarClick(3)">3</div>
                    </div>

                    <div class="container mt-5">
                        <div class="card mt-3">
                            <div class="card-body text-muted form">
                                <h5 class="text-start mb-4">1. Fetch Details</h5>
                            </div>
                        </div>

                        <div class="container text-start mt-5 form p-5">
                            <form @submit.prevent="submitForm">
                                <h5 class="mb-2"><span class="rounded-number p-3 ">2</span> User Details</h5>
                                <small class="text-muted mb-5">Agree to the Details </small>

                                <div class="form-group row">
                                    <label for="fullName" class="col-sm-6 col-form-label cst-color bold"></label>
                                    <div class="col-md-12">
                                        <input type="text" id="fullName" :value="fullName" placeholder="Full Name"
                                            class="form-control cst-color bg-transparent border-dark" readonly disabled>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="phoneNumber" class="cst-color bold"></label>
                                            <input type="text" id="phoneNumber" placeholder="Phone Number"
                                                :value="userData.mob_number"
                                                class="form-control cst-color bg-transparent border-dark" readonly disabled>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="email" class="cst-color bold"></label>
                                            <input type="email" id="email" placeholder="Email" v-model="regEmail"
                                                class="form-control bg-white"
                                                :class="detailsConfirmed ? border - secondary : border - danger" required
                                                :disabled="detailsConfirmed" :readonly="detailsConfirmed">
                                            <!-- Validation message -->
                                            <small v-if="!isValidEmail && !detailsConfirmed" class="text-danger">Please
                                                enter a valid email address.</small>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="nationality" class="cst-color bold"></label>
                                            <input type="text" id="nationality" placeholder="Nationality"
                                                :value="userData.nationality"
                                                class="form-control cst-color bg-transparent border-dark" readonly disabled>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="gender" class="cst-color bold"></label>
                                            <input type="text" id="gender" placeholder="Gender" :value="userData.gender"
                                                class="form-control cst-color bg-transparent border-dark" readonly disabled>
                                        </div>
                                    </div>
                                </div>

                            </form>
                            <div class="mt-4 text-center p-0 mx-0 d-flex justify-content-around">
                                <!-- Bind the "disabled" attribute to the computed property -->
                                <button :disabled="!isValidEmail || detailsConfirmed" type="button"
                                    @click="confirmDetails(true)" class="btn custom-btn col-md-5 mb-2 true-btn"
                                    :style="{ cursor: detailsConfirmed ? 'not-allowed' : 'pointer' }">True</button>
                                <button :disabled="detailsConfirmed" type="button" @click="confirmDetails(false)"
                                    class="btn custom-btn col-md-5 mb-2 not-true-btn"
                                    :style="{ cursor: detailsConfirmed ? 'not-allowed' : 'pointer' }">Not
                                    True</button>
                            </div>


                            <!-- Additional fields shown after 'True' is clicked -->
                            <div v-if="detailsConfirmed" class="mt-5">
                                <!-- Agency dropdown -->
                                <div class="form-group">
                                    <!-- <label class="h3 cust-text bold " for="agency">Select Your Agency:</label> -->
                                    <select id="agency" v-model="selectedAgency"
                                        class="form-control bg-transparent border-dark">
                                        <option class="cst-color text-center" value="" selected disabled>Select Your Agency
                                        </option>
                                        <option class="cst-color" value="EMIS">EMIS</option>
                                        <option value="RCSC">RCSC</option>
                                    </select>
                                </div>

                                <!-- Parameter selection -->
                                <div v-if="selectedAgency === 'EMIS'" class="form-group">
                                    <label class="mt-5 cust-text bg-transparent border-dark">Select any of the
                                        Identifier:</label>
                                    <div class="mt-2">
                                        <div class="form-check form-check-inline">
                                            <input type="radio" id="studentCode" value="Student Code"
                                                v-model="selectedParameter"
                                                class="form-check-input bg-transparent border-dark">
                                            <label for="studentCode" class="form-check-label cust-text">Student Code</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input type="radio" id="employeeID" value="Employee ID"
                                                v-model="selectedParameter"
                                                class="form-check-input bg-transparent border-dark">
                                            <label for="employeeID" class="form-check-label cust-text">Employee ID</label>
                                        </div>
                                    </div>

                                    <!-- Date of Birth fields for Student ID -->
                                    <div v-if="selectedParameter === 'Student Code'" class="form-group mt-3">
                                        <small for="dob" class="text-muted">Your Date of Birth as per your school
                                            records</small>
                                        <div class="row">
                                            <div class="col">
                                                <select class="form-select bg-transparent border-dark"
                                                    v-model="formData.selectedMonth">
                                                    <option v-for="month in months" :key="month.value" :value="month.value">
                                                        {{ month.label }}</option>
                                                </select>
                                            </div>
                                            <div class="col">
                                                <select class="form-select bg-transparent border-dark"
                                                    v-model="formData.selectedDate">
                                                    <option v-for="date in dates" :key="date.value" :value="date.value">{{
                                                        date.label }}</option>
                                                </select>
                                            </div>
                                            <div class="col">
                                                <select class="form-select bg-transparent border-dark"
                                                    v-model="formData.selectedYear">
                                                    <option v-for="year in years" :key="year" :value="year">{{ year }}
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <!-- RCSC Parameter selection -->
                                <div v-else-if="selectedAgency === 'RCSC'" class="form-group">
                                    <label class="mt-5 cust-text">Select any of the Identifier:</label>
                                    <div class="mt-2">
                                        <div class="form-check form-check-inline">
                                            <input type="radio" id="citizenID" value="Citizen ID"
                                                v-model="selectedParameter" class="form-check-input">
                                            <label for="citizenID"
                                                class="form-check-label cust-text bg-transparent border-dark">Citizen
                                                ID</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Input for parameter value -->
                            <div v-if="selectedParameter && selectedParameter !== 'Student Code'"
                                class="form-group cust-text">
                                <label class="mt-2 cst-color bold" for="parameterValue">Enter {{ selectedParameter
                                }}:</label>
                                <input type="text" id="parameterValue" v-model="parameterValue"
                                    class="form-control mt-2 bg-transparent border-dark">
                            </div>

                            <div v-if="selectedParameter === 'Student Code'" class="form-group mt-3">
                                <label class="mt-2 cst-color bold" for="parameterValue">Enter {{ selectedParameter
                                }}:</label>
                                <input type="text" id="parameterValue" v-model="formattedStudentCode"
                                    @input="formatStudentCode" class="form-control mt-2 bg-transparent border-dark"
                                    maxlength="16">
                            </div>

                            <!-- Proceed button -->
                            <button type="button" @click="proceed" class="btn  col-md-12 custom-btn mt-3">Next</button>
                        </div>
                    </div>

                    <div class="card my-5">
                        <div class="card-body text-muted form">
                            <h5 class="mb-4">3. Login Info</h5>
                        </div>
                    </div>
                    <div class="text-center mt-4">
                        Already Have an Account? <router-link to="/login" style="color: #2B656F; font-weight: bold">Sign
                            In</router-link>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, defineProps, computed, onMounted, defineEmits } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
    userData: Object,
});

const fullName = computed(() => {
    const { first_name, middle_name, last_name } = props.userData;
    return `${first_name} ${middle_name} ${last_name}`.trim();
});

const emit = defineEmits(['go-to-next-step', 'go-to-prev-step']);

const detailsConfirmed = ref(false);
const selectedAgency = ref('');
const selectedParameter = ref('');
const parameterValue = ref('');
const regEmail = ref('');
const formData = {
    selectedMonth: '',
    selectedDate: '',
    selectedYear: ''
};

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

const isValidEmail = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regEmail.value && emailRegex.test(regEmail.value) && !detailsConfirmed.value;
});

const confirmDetails = async (isTrue) => {
    if (isTrue) {
        const userConfirmed = window.confirm("Are you sure the information is true? The details cannot be edited after confirmation.");

        if (userConfirmed) {
            // Proceed with the logic for confirming details
            detailsConfirmed.value = true;

            // Update the user_data object in session storage with the email field
            const userData = JSON.parse(sessionStorage.getItem('user_data')) || {};
            userData.email = regEmail.value;
            sessionStorage.setItem('user_data', JSON.stringify(userData));
        } else {
            // User didn't confirm, allow them to edit
            detailsConfirmed.value = false;
        }
    } else {
        const userVerified = window.confirm("Please verify your details again.");

        if (userVerified) {
            emit('go-to-prev-step', 'step-two');
        }
    }
};

const loading = ref(false);

const storedApiCID = localStorage.getItem('userCID');

onMounted(() => {
    parameterValue.value = storedApiCID || '';
});


const formattedStudentCode = computed(() => {
    // Format the student code with periods at the specified intervals
    return parameterValue.value.replace(/[^0-9]/g, '')  // Remove any non-digit characters
        .replace(/(\d{3})(\d{5})(\d{2})(\d{4})/, '$1.$2.$3.$4');  // Insert periods at specified intervals
});

function formatStudentCode(event) {
    // Update the parameterValue with the formatted input
    const input = event.target.value.replace(/[^0-9]/g, '');
    parameterValue.value = input.substr(0, 3)
        + (input.length > 3 ? '.' : '')
        + input.substr(3, 5)
        + (input.length > 8 ? '.' : '')
        + input.substr(8, 2)
        + (input.length > 10 ? '.' : '')
        + input.substr(10);
}

const proceed = async () => {
    loading.value = true;
    let apiURL;

    switch (selectedAgency.value) {
        case 'RCSC':
            if (selectedParameter.value === 'Citizen ID') {
                apiURL = `${endpoints.getRcscDetails}${parameterValue.value}/${regEmail.value}/`;
                localStorage.removeItem('userCID');
            }
            break;
        case 'EMIS':
            if (selectedParameter.value === 'Student CID') {
                const dob = `${formData.selectedYear}-${formData.selectedMonth}-${formData.selectedDate}`;
                apiURL = `${endpoints.getEmisStudent}${parameterValue.value}/${regEmail.value}/${dob}/`;
                localStorage.removeItem('userCID');
            } else if (selectedParameter.value === 'Employee ID') {
                apiURL = `${endpoints.getEmisEmployee}${parameterValue.value}/${regEmail.value}/`;
            }
            break;
        default:
            console.error('Invalid agency selected');
            return;
    }

    try {
        console.log('Sending request to:', apiURL);

        if (!apiURL) {
            console.error('apiURL is undefined');
            return;
        }

        const response = await axios.get(apiURL, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Response status:', response.status);
        console.log('RCSC data:', response.data);

        if (response.status === 200) {
            const data = response.data;

            if (!data.error) {
                // Store agencyData and userAgencyData in session storage
                sessionStorage.setItem('agencyData', JSON.stringify(data.agency_data));
                sessionStorage.setItem('userAgencyData', JSON.stringify(data.user_agency_data));

                // Retrieve existing userData from session storage
                let userData = JSON.parse(sessionStorage.getItem('user_data'));

                // Update userData with role from API response
                userData.role = data.user_agency_data.user_role_agency;

                // Save updated userData back to session storage
                sessionStorage.setItem('user_data', JSON.stringify(userData));

                emit('go-to-next-step', 'step-four');
            } else {
                alert(data.error);
            }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching data. Please try again.');
        router.push('/register');
    } finally {
        loading.value = false;
    }
}


</script>



<style scoped>
.rounded-number {
    background-color: #2B656F;
    color: #fff;
    height: 1rem;
    width: 1rem;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.form {
    background-color: #2B656F24;
    border-radius: 10px;
}

.custom-btn {
    background-color: #2B656F;
    color: white;
    font-size: inherit;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.true-btn {
    background-color: #2B656F;
    color: #fff;
}

.not-true-btn {
    background-color: #afcfd5;
    border: 1px solid #2B656F;
    color: #2B656F;
}

.cust-text {
    color: #2B656F;
}
</style>
