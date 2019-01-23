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
                            <!-- Update the v-model to bind to regEmail instead of email -->
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
            <!-- Bind the "disabled" attribute to the computed property -->
            <button :disabled="!isValidEmail" type="button" @click="confirmDetails(true)"
                class="btn btn-success mx-2">True</button>
            <button type="button" @click="confirmDetails(false)" class="btn btn-danger ml-2">Not True</button>
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
import { ref, defineProps, computed } from 'vue';
import axios from 'axios';

const props = defineProps({
    userData: Object,
});

const fullName = computed(() => {
    const { first_name, middle_name, last_name } = props.userData;
    return `${first_name} ${middle_name} ${last_name}`.trim();
});

const emit = defineEmits(['go-to-next-step']);

const detailsConfirmed = ref(false);
const selectedAgency = ref('');
const selectedParameter = ref('');
const parameterValue = ref('');
const regEmail = ref('');

const isValidEmail = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regEmail.value && emailRegex.test(regEmail.value);
});

const submitForm = async () => {
    try {
        if (!isValidEmail.value) {
            alert('Please enter a valid email address.');
            return;
        }

        const registrationData = {
            userData: { ...props.userData },
            userEmail: regEmail.value,
        };

        const response = await axios.post('http://your-backend-url/your-fetch-endpoint', registrationData);

        if (response.status === 200) {
            emit('go-to-next-step', 'step-two');
        } else {
            console.error('Error registering user:', response.statusText);
            alert('Error registering user. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
};

const confirmDetails = (isTrue) => {
    if (isTrue) {
        if (isValidEmail.value) {
            // Proceed with the logic for confirming details
            detailsConfirmed.value = true;
        } else {
            alert('Please enter a valid email address.');
        }
    } else {
        alert('Please verify your details again.');
        emit('go-to-next-step', 'step-two');
    }
};

const loading = ref(false);

const proceed = async () => {
    loading.value = true;
    let apiURL;

    if (selectedAgency.value === 'RCSC' && selectedParameter.value === 'Citizen ID') {
        apiURL = `http://localhost:8000/api/v1/access/get-rcsc-details/${parameterValue.value}/${regEmail.value}/`;
    } else if (selectedAgency.value === 'EMIS') {
        // ... (existing code)
    }

    try {
        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('API Response:', data);

            localStorage.setItem('agencyData', JSON.stringify(data));

            // Pass the obtained data to the step 4 component
            emit('go-to-next-step', 'step-four', {
                userData: { ...props.userData, ...data },
                agencyData: data.agencyData,  // Assuming the structure of data returned from the API
            });
        } else {
            console.error('Error fetching data:', response.statusText);
            alert('Error fetching data. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching data. Please try again.');
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
