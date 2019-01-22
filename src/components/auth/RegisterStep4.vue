<template>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow p-5">
                    <div class="logo-container">
                        <img src="@/assets/images/NDILogo.png" alt="NDI Logo" class="ndi-logo" />
                        <a href="#" class="text-dark font-weight-bold">Use Bhutan NDI</a>
                    </div>

                    <div class="text-center mt-3">
                        <h1 class="display-4" style="color: #2B656F; font-weight: bold">Sign Up</h1>
                        <p class="lead" style="color: #2B656F; font-weight: bold">Agency Based User </p>
                    </div>

                    <div class="progress-bar" role="progressbar" :style="{ width: progressBarWidth }" aria-valuenow="0"
                        aria-valuemin="0" aria-valuemax="100" @click="handleProgressBarClick(1)">
                    </div>

                    <div class="step-container d-flex justify-content-between align-items-center">
                        <div class="step-circle bg-light text-dark" @click="handleProgressBarClick(1)">1</div>
                        <hr class="flex-grow-1 mx-2">
                        <div class="step-circle bg-light text-dark" @click="handleProgressBarClick(2)">2</div>
                        <hr class="flex-grow-1 mx-2">
                        <div class="step-circle" @click="handleProgressBarClick(3)">3</div>
                    </div>
                    <div class="card">
                        <div class="card-body text-muted form">
                            <h5 class="mb-4">1. Detail Fetch</h5>
                        </div>
                    </div>

                    <div class="card my-5">
                        <div class="card-body text-muted form">
                            <h5 class="mb-4">2. User Detail</h5>
                        </div>
                    </div>


                    <div class="container p-5" style="background-color: #E2E9EB; border-radius: 15px;">
                        <h2 class="cust-text">3. Login Details</h2>
                        <form @submit.prevent="createUser">
                            <!-- Username and password fields -->
                            <div class="form-group cust-text  mx-auto">
                                <label for="username">Username:</label>
                                <input type="text" id="username" v-model="username" class="form-control p-2" required>
                            </div>
                            <div class="form-group cust-text mt-3 mx-auto">
                                <label for="password">Password:</label>
                                <input type="password" id="password" v-model="password" class="form-control p-2" required>
                            </div>
                            <div class="form-group cust-text mt-3 mx-auto">
                                <label for="confirmPassword">Confirm Password:</label>
                                <input type="password" id="confirmPassword" v-model="confirmPassword"
                                    class="form-control p-2" required>
                            </div>
                            <button type="submit" class="btn  ml-2 custom-btn mt-3">Create Account</button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup>

import { ref, defineProps } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
    userData: Object,
    agencyData: Object,
    fetchedDataStepOne: Object,
});

// onMounted(() => {
//   console.log('Fetched Data from Previous Steps:', fetchedDataStepOne);
// });
``
// eslint-disable-next-line no-unused-vars
const emit = defineEmits(['go-to-next-step']);
// eslint-disable-next-line no-unused-vars
const route = useRoute();
const router = useRouter();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');

const createUser = async () => {
    if (password.value !== confirmPassword.value) {
        alert('Passwords do not match.');
        return;
    }

    // Prepare user data for submission
    const userSubmissionData = {
        ...props.userData,
        username: username.value,
        password: password.value,
        // Include any other necessary fields from userData or agencyData
    };

    // API call to create user
    try {
        const response = await fetch('http://localhost:8000/api/v1/access/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5173',  // Ensure this matches your frontend origin
            },
            credentials: 'include',  // Include this line for cross-origin requests with cookies
            body: JSON.stringify(userSubmissionData),
        });

        if (response.status === 201) {
            console.log('User created successfully');
            // Redirect to login or other appropriate page after successful account creation
            router.push({ name: 'login' });
        } else {
            console.error('Error creating user:', response.statusText);
            // Handle the error appropriately, e.g., show an error message to the user
        }
    } catch (error) {
        console.error('Error creating user:', error);
        // Handle the error appropriately, e.g., show an error message to the user
    }
};

</script>

<style>
cust-radi {
    border-radius: 15%;
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
}
</style>
