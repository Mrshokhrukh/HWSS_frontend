<template>
<<<<<<< Updated upstream
    <div class="container mt-5 shadow-card" style="background-color: #DFE9E8;">
        <h2 class="bold my-5 cst-color">Step 3: Verify User Details</h2>
=======
    <div class="container mt-5">
        <div class="card mt-3">
            <div class="card-body text-muted">
                <h5 class="mb-4">1. Fetch Details</h5>
            </div>
        </div>

>>>>>>> Stashed changes
        <form @submit.prevent="submitForm">
            <h4 class="mb-2"> <span class="rounded-number bg-primary">1</span>2. User Details</h4>
            <small class="text-muted mb-5">Select any Identifier </small>
            <div class="form-group row">
                <label for="fullName" class="col-sm-3 col-form-label cst-color bold">Full Name:</label>
                <div class="col-sm-9">
                    <input type="text" id="fullName" :value="fullName" class="form-control cst-color" readonly>
                </div>
            </div>
            <div class="form-group row">
                <label for="phoneNumber" class="col-sm-3 col-form-label cst-color bold">Phone Number:</label>
                <div class="col-sm-9">
                    <input type="text" id="phoneNumber" :value="userData.mob_number" class="form-control cst-color" readonly>
                </div>
            </div>
            <div class="form-group row">
                <label for="email" class="col-sm-3 col-form-label cst-color bold">Email:</label>
                <div class="col-sm-9">
<<<<<<< Updated upstream
                    <input type="email" id="email" v-model="userData.email" class="form-control cst-color" required>
=======
                    // eslint-disable-next-line vue/no-mutating-props
                    <input type="email" id="email" v-model="userData.email" class="form-control" required>
>>>>>>> Stashed changes
                </div>
            </div>
            <div class="form-group row">
                <label for="nationality" class="col-sm-3 col-form-label cst-color bold">Nationality:</label>
                <div class="col-sm-9">
                    <input type="text" id="nationality" :value="userData.nationality" class="form-control cst-color" readonly>
                </div>
            </div>
            <div class="form-group row">
                <label for="gender" class="col-sm-3 col-form-label cst-color bold">Gender:</label>
                <div class="col-sm-9">
                    <input type="text" id="gender" :value="userData.gender" class="form-control cst-color" readonly>
                </div>
            </div>
        </form>

        <!-- True/Not True buttons -->
        <div class="mt-4">
            <button type="button" @click="confirmDetails(true)" class="btn btn-success mx-2">True</button>
            <button type="button" @click="confirmDetails(false)" class="btn btn-danger ml-2">Not True</button>
        </div>

        <!-- Additional fields shown after 'True' is clicked -->
        <div v-if="detailsConfirmed" class="mt-4">
            <!-- Agency dropdown -->
            <div class="form-group">
                <label class="h3 cst-color" for="agency">Select Agency:</label>
                <select id="agency" v-model="selectedAgency" class="form-control">
                    <option class="cst-color" value="EMIS">EMIS</option>
                    <option value="RCSC">RCSC</option>
                </select>
            </div>

            <!-- Parameter selection -->
            <div v-if="selectedAgency" class="form-group">
                <label class="mt-5 h3 cst-color">Select Parameter Type:</label>
                <div class="mt-2">
                    <div class="form-check form-check-inline">
                        <input type="radio" id="studentID" value="Student ID" v-model="selectedParameter"
                            class="form-check-input">
                        <label for="studentID" class="form-check-label cst-color">Student ID/Code</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input type="radio" id="employeeID" value="Employee ID" v-model="selectedParameter"
                            class="form-check-input">
                        <label for="employeeID" class="form-check-label cst-color">Employee ID</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input type="radio" id="citizenID" value="Citizen ID" v-model="selectedParameter"
                            class="form-check-input">
                        <label for="citizenID" class="form-check-label cst-color">Citizen ID</label>
                    </div>
                </div>
            </div>

            <div class="card mt-3">
                <div class="card-body text-muted">
                    <h5 class="mb-4">3. Login Info</h5>
                </div>
            </div>

            <!-- Input for parameter value -->
            <div v-if="selectedParameter" class="form-group">
                <label class="mt-2 cst-color bold" for="parameterValue">Enter {{ selectedParameter }}:</label>
                <input  type="text" id="parameterValue" v-model="parameterValue" class="form-control mt-2">
            </div>

            <!-- Proceed button -->
            <button type="button" @click="proceed" class="btn btn-primary mt-3">Proceed</button>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, computed, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

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

const confirmDetails = async (isTrue) => {
    if (isTrue) {
        const registrationData = {
            userData: { ...props.userData },
            // eslint-disable-next-line no-undef
            userEmail: userData.email,
        };

        await registerUser(registrationData);

        detailsConfirmed.value = true;
    } else {
        alert('Please verify your details again.');
        router.push({ name: 'register', params: { step: 'step-two' } });
    }
};

const registerUser = async (registrationData) => {
    const { userData, userEmail } = registrationData;

    try {
        const registrationPayload = {
            ...userData,
            email: userEmail,
        };

        await axios.post('http://localhost:8000/api/v1/access/register-api-user/', registrationPayload);
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
<<<<<<< Updated upstream
 .shadow-card {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  .cst-color{
    color: #2B656F;
  }
=======
/* Add your custom styles here */
>>>>>>> Stashed changes
</style>
