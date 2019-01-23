<template>

    <div class="container mt-5">
        <div class="text-center mt-3">
            <h1 class="display-4" style="color: #2B656F; font-weight: bold">Sign Up</h1>
            <p class="lead" style="color: #2B656F; font-weight: bold">Agency Based User</p>
          </div> <br>
          </div>

<div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
            <div class="logo-container">
                <img src="@/assets/images/NDILogo.png" alt="NDI Logo" class="ndi-logo" />
                <a href="#" class="text-dark font-weight-bold">Use Bhutan NDI</a>
              </div>

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
>>>>>>> 8cf3608fd9a5c9955a813a9e85b46e60b9c78819
        <div class="card mt-3">
            <div class="card-body text-muted form">
                <h5 class="mb-4">1. Fetch Details</h5>
            </div>
        </div>
        


        <div class="container mt-5 form p-5">
            <form @submit.prevent="submitForm">
                <h4 class="mb-2"><span class="rounded-number bg-success">2</span> User Details</h4>
                <small class="text-muted mb-5">Select any Identifier </small>

                <div class="form-group row">
                    <label for="fullName" class="col-sm-6 col-form-label cst-color bold"></label>
                    <div class="col-sm-9">
                        <input type="text" id="fullName" :value="fullName" placeholder="Full Name" class="form-control cst-color" readonly>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="phoneNumber" class="cst-color bold"></label>
                            <input type="text" id="phoneNumber" placeholder="Phone Number" :value="userData.mob_number" class="form-control cst-color"
                                readonly>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="email" class="cst-color bold"></label>
                            <input type="email" id="email" placeholder="Email" v-model="regEmail" class="form-control" required>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="nationality" class="cst-color bold"></label>
                            <input type="text" id="nationality" placeholder="Nationality" :value="userData.nationality" class="form-control cst-color"
                                readonly>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="gender" class="cst-color bold"></label>
                            <input type="text" id="gender"  placeholder="Gender" :value="userData.gender" class="form-control cst-color" readonly>
                        </div>
                    </div>
                </div>

            </form>
             <!-- True/Not True buttons -->
        <div class="mt-4">
            <button type="button" @click="confirmDetails(true)" class="btn  mx-2 custom-btn">True</button>
            <button type="button" @click="confirmDetails(false)" class="btn  ml-2 custom-btn">Not True</button>
        </div>

        <!-- Additional fields shown after 'True' is clicked -->
        <div v-if="detailsConfirmed" class="mt-4">
            <!-- Agency dropdown -->
            <div class="form-group">
                <label class="h3 cust-text bold" for="agency">Select Agency:</label>
                <select id="agency" v-model="selectedAgency" class="form-control">
                    <option class="cst-color" value="EMIS">EMIS</option>
                    <option value="RCSC">RCSC</option>
                </select>
            </div>

            <!-- Parameter selection -->
            <div v-if="selectedAgency" class="form-group">
                <label class="mt-5 h3 cust-text">Select Parameter Type:</label>
                <div class="mt-2">
                    <div class="form-check form-check-inline">
                        <input type="radio" id="studentID" value="Student ID" v-model="selectedParameter"
                            class="form-check-input">
                        <label for="studentID" class="form-check-label cust-text">Student ID/Code</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input type="radio" id="employeeID" value="Employee ID" v-model="selectedParameter"
                            class="form-check-input">
                        <label for="employeeID" class="form-check-label cust-text">Employee ID</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input type="radio" id="citizenID" value="Citizen ID" v-model="selectedParameter"
                            class="form-check-input">
                        <label for="citizenID" class="form-check-label cust-text">Citizen ID</label>
                    </div>
                </div>
            </div>

            <!-- Input for parameter value -->
            <div v-if="selectedParameter" class="form-group cust-text">
                <label class="mt-2 cst-color bold" for="parameterValue">Enter {{ selectedParameter }}:</label>
                <input type="text" id="parameterValue" v-model="parameterValue" class="form-control mt-2">
            </div>

            <!-- Proceed button -->
            <button type="button" @click="proceed" class="btn  ml-2 custom-btn mt-3">Proceed</button>
        </div>
        </div>

        <div class="card my-5">
            <div class="card-body text-muted form">
                <h5 class="mb-4">3. Login Info</h5>
            </div>
        </div>
    </div>



        </div>
      </div>
    </div>
</div>
    
</template>

<script setup>
import { ref, defineProps, computed, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
// import axios from 'axios';

const props = defineProps({
    userData: Object,
});

const fullName = computed(() => {
    return `${props.userData.first_name} ${props.userData.middle_name} ${props.userData.last_name}`.trim();
});

const emit = defineEmits(['go-to-next-step']);

const router = useRouter();
const detailsConfirmed = ref(false);
const selectedAgency = ref('');
const selectedParameter = ref('');
const parameterValue = ref('');
const regEmail = ref('');

const confirmDetails = async (isTrue) => {
    if (isTrue) {
        const registrationData = {
            userData: { ...props.userData },
            userEmail: regEmail,
        };

        await registerUser(registrationData);

        detailsConfirmed.value = true;
    } else {
        alert('Please verify your details again.');
        router.push({ name: 'register', params: { step: 'step-two' } });
    }
};

const registerUser = async (registrationData) => {
    const { userData, regEmail } = registrationData;

    try {
        const registrationPayload = {
            ...userData,
            email: regEmail,
        };

        console.log(registrationPayload);

        // await axios.post('http://localhost:8000/api/v1/access/register-api-user/', registrationPayload);
    } catch (error) {
        console.error('Error registering user:', error.response?.data?.error || 'An error occurred during user registration');
    }
};

const loading = ref(false);

const proceed = async () => {
    loading.value = true;
    // Data preparation for the API call
    let apiURL;
    if (selectedAgency.value === 'RCSC' && selectedParameter.value === 'Citizen ID') {
        apiURL = `http://localhost:8000/api/v1/access/get-rcsc-details/${parameterValue.value}`;
    }
    else if (selectedAgency.value === 'EMIS') {
        if (selectedParameter.value === 'Student ID') {
            apiURL = '/path/to/emis/student/api';
        } else if (selectedParameter.value === 'Employee ID') {
            apiURL = '/path/to/emis/employee/api';
        }
    }

    try {
        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        console.log('API Response:', data);

        emit('go-to-next-step', 'step-four', {
            userData: { ...props.userData, ...data },
            agencyData: data
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {

        loading.value = false;
    }
};

</script>

<style>

.form {
    background-color:  #2B656F24;
    border-radius: 10px;
  }
  .custom-btn {
    background-color: #2B656F;
    color: #fff; 
    font-size: inherit; 
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  .cust-text{
    color: #2B656F;
  }
</style>
