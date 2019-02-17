<template>
    <div class="d-flex justify-content-center align-items-center" style="min-height: 100vh;">
        <div class="container my-5">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card shadow p-3 mb-5">

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


                        <div class="container p-5 text-start" style="background-color: #E2E9EB; border-radius: 15px;">
                            <h5 class="mb-3 text-mutedcust-text"> <span class="rounded-number  p-3">3</span> Login Details
                            </h5>
                            <form @submit.prevent="createUser">
                                <!-- Username and password fields -->
                                <div class="form-group cust-text  mx-auto">
                                    <label for="username">Username:</label>
                                    <input type="text" id="username" v-model="username"
                                        class="form-control p-2 bg-transparent border-dark" required>
                                </div>
                                <div class="form-group cust-text mt-3 mx-auto">
                                    <label for="password">Password:</label>
                                    <input type="password" id="password" v-model="password"
                                        class="form-control p-2 bg-transparent border-dark" required>
                                </div>
                                <div class="form-group cust-text mt-3 mx-auto">
                                    <label for="confirmPassword">Confirm Password:</label>
                                    <input type="password" id="confirmPassword" v-model="confirmPassword"
                                        class="form-control p-2 bg-transparent border-dark" required>
                                </div>
                                <button type="submit" class="btn  ml-2 custom-btn mt-3 col-md-12">Sign Up</button>
                            </form>
                        </div>
                        <div class="text-center mt-4">
                            Already Have an Account? <router-link to="login" style="color: #2B656F; font-weight: bold">Sign
                                In</router-link>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import endpoints from '@/api';
import axios from 'axios';


const router = useRouter();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');

const createUser = async () => {
    if (password.value !== confirmPassword.value) {
        alert('Passwords do not match.');
        return;
    }

    try {
        let userData = JSON.parse(sessionStorage.getItem('user_data'));
        const agencyData = JSON.parse(sessionStorage.getItem('agencyData'));
        const userAgencyData = JSON.parse(sessionStorage.getItem('userAgencyData'));

        userData = { ...userData, username: username.value, password: password.value };

        sessionStorage.setItem('user_data', JSON.stringify(userData));

        const userSubmissionData = { userData, agencyData, userAgencyData };

        console.log(userSubmissionData);

        const csrftoken = document.cookie.match(/csrftoken=(.*?)(?:;|$)/)[1];
        const response = await axios.post(endpoints.registerUser, userSubmissionData, {
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
            withCredentials: true,
        });

        if (response.status === 201) {
            alert('Registration successful!');
            router.push({ name: 'login' });
            sessionStorage.removeItem('user_data');
            sessionStorage.removeItem('agencyData');
            sessionStorage.removeItem('userAgencyData');
        } else {
            alert(`Error: ${response.data.error}`);
        }
    } catch (error) {
        let message = 'Error creating user. Please try again.';
        console.log(error)

        if (error.response && error.response.data) {
            console.log('Error response:', error.response.data); 

            const errors = error.response.data;
            let errorMessages = [];

            if (errors['identity_number']) {
                errorMessages.push(errors['identity_number'][0].string);
            }

            if (errors['email']) {
                errorMessages.push(errors['email'][0].string);
            }

            message = errorMessages.length > 0 ? errorMessages.join(' ') : message;
        }

        alert(message);
    }
};
</script>




<style scoped>
cust-radi {
    border-radius: 15%;
}

.form {
    background-color: #2B656F24;
    border-radius: 10px;
}

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

.custom-btn {
    background-color: #2B656F;
    color: white;
    font-size: inherit;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
</style>
