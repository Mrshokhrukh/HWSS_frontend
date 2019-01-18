<!-- eslint-disable vue/no-mutating-props -->
<template>
    <div class="container mt-5">
        <h2>Step 3: Verify User Details</h2>
        <form @submit.prevent="submitForm">
            <div class="form-group row">
                <label for="fullName" class="col-sm-3 col-form-label">Full Name:</label>
                <div class="col-sm-9">
                    <input type="text" id="fullName" :value="fullName" class="form-control" readonly>
                </div>
            </div>
            <div class="form-group row">
                <label for="phoneNumber" class="col-sm-3 col-form-label">Phone Number:</label>
                <div class="col-sm-9">
                    <input type="text" id="phoneNumber" :value="userData.mob_number" class="form-control" readonly>
                </div>
            </div>
            <div class="form-group row">
                <label for="email" class="col-sm-3 col-form-label">Email:</label>
                <div class="col-sm-9">
                    <input type="email" id="email" v-model="userData.email" class="form-control" required>
                </div>
            </div>
            <div class="form-group row">
                <label for="nationality" class="col-sm-3 col-form-label">Nationality:</label>
                <div class="col-sm-9">
                    <input type="text" id="nationality" :value="userData.nationality" class="form-control" readonly>
                </div>
            </div>
            <div class="form-group row">
                <label for="gender" class="col-sm-3 col-form-label">Gender:</label>
                <div class="col-sm-9">
                    <input type="text" id="gender" :value="userData.gender" class="form-control" readonly>
                </div>
            </div>
        </form>

        <!-- True/Not True buttons -->
        <div class="mt-4">
            <button type="button" @click="confirmDetails(true)" class="btn btn-success">True</button>
            <button type="button" @click="confirmDetails(false)" class="btn btn-danger">Not True</button>
        </div>

        <!-- Additional fields shown after 'True' is clicked -->
        <div v-if="detailsConfirmed" class="mt-4">
            <!-- Agency dropdown -->
            <div class="form-group">
                <label for="agency">Select Agency:</label>
                <select id="agency" v-model="selectedAgency" class="form-control">
                    <option value="EMIS">EMIS</option>
                    <option value="RCSC">RCSC</option>
                </select>
            </div>

            <!-- Parameter selection -->
            <div v-if="selectedAgency" class="form-group">
                <label>Select Parameter Type:</label>
                <div>
                    <div class="form-check form-check-inline">
                        <input type="radio" id="studentID" value="Student ID" v-model="selectedParameter"
                            class="form-check-input">
                        <label for="studentID" class="form-check-label">Student ID/Code</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input type="radio" id="employeeID" value="Employee ID" v-model="selectedParameter"
                            class="form-check-input">
                        <label for="employeeID" class="form-check-label">Employee ID</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input type="radio" id="citizenID" value="Citizen ID" v-model="selectedParameter"
                            class="form-check-input">
                        <label for="citizenID" class="form-check-label">Citizen ID</label>
                    </div>
                </div>
            </div>

            <!-- Input for parameter value -->
            <div v-if="selectedParameter" class="form-group">
                <label for="parameterValue">Enter {{ selectedParameter }}:</label>
                <input type="text" id="parameterValue" v-model="parameterValue" class="form-control">
            </div>

            <!-- Proceed button -->
            <button type="button" @click="proceed" class="btn btn-primary">Proceed</button>
        </div>
    </div>
</template>
  

<script setup>
import { ref, defineProps, computed } from 'vue';
import { useRouter } from 'vue-router';

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

const confirmDetails = (isTrue) => {
    if (isTrue) {
        detailsConfirmed.value = true;
    } else {
        alert('Please verify your details again.');
        router.push({ name: 'register', params: { step: 'step-two' } }); // Modify as per your routing logic
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
            apiURL = '/path/to/emis/student/api'; // Replace with actual API endpoint
        } else if (selectedParameter.value === 'Employee ID') {
            apiURL = '/path/to/emis/employee/api'; // Replace with actual API endpoint
        }
    }

    // API call (template, replace with actual call logic)
    try {
        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        console.log('API Response:', data);

        // Update the user data with the RCSC details
        emit('go-to-next-step', 'step-four', {
            userData: { ...props.userData, ...data },
            agencyData: data
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        // Set loading to false after the API call completes
        loading.value = false;
    }
};

</script>
<style>
/* Add your custom styles here */
</style>