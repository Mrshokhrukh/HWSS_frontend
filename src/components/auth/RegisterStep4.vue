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
                                    <input type="password" id="password" v-model="password" @input="validatePassword"
                                        class="form-control p-2 bg-transparent border-dark" required>
                                    <small class="text-danger">{{ passwordValidationMessage }}</small>
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

        <div v-if="errorMessage" class="error-modal d-none" @click="errorMessage = ''">
            <div class="modal-content">
                <p>{{ errorMessage }}</p>
                <button class="close-btn" @click="errorMessage = ''">Close</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import endpoints from '@/api';
import axios from 'axios';
import Swal from 'sweetalert2';

const router = useRouter();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');

const passwordValidationMessage = computed(() => {
    const messages = [];
    let requirementsMet = true;

    if (password.value.length < 8) {
        messages.push("be at least 8 characters long,");
        requirementsMet = false;
    }
    if (!/\d/.test(password.value)) {
        messages.push("include at least one number,");
        requirementsMet = false;
    }
    if (!/[A-Z]/.test(password.value)) {
        messages.push("include at least one uppercase letter,");
        requirementsMet = false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password.value)) {
        messages.push("include at least one special character (!@#$%^&*(),.?\":{}|<>).");
        requirementsMet = false;
    }

    if (!requirementsMet) {
        messages.unshift("Your password must:");
    }

    return messages.join(' ');
});

const createUser = async () => {
    if (password.value !== confirmPassword.value) {
        Swal.fire('Error', 'Passwords do not match.', 'error');
        return;
    }

    try {
<<<<<<< Updated upstream
        let userData = JSON.parse(sessionStorage.getItem('user_data'));
        const agencyData = JSON.parse(sessionStorage.getItem('agencyData'));
        const userAgencyData = JSON.parse(sessionStorage.getItem('userAgencyData'));

        userData = { ...userData, username: username.value, password: password.value };

        sessionStorage.setItem('user_data', JSON.stringify(userData));

        const userSubmissionData = { userData, agencyData, userAgencyData };

        console.log(userSubmissionData);

        const csrftoken = document.cookie.match(/csrftoken=(.*?)(?:;|$)/)?.[1];
        if (!csrftoken) {
            Swal.fire('Error', 'CSRF token not found in cookies.', 'error');
            return;
        }

        const response = await axios.post(endpoints.registerUser, userSubmissionData, {
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
            withCredentials: true,
=======
        const response = await fetch('http://localhost:8000/api/v1/access/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5173',  // Ensure this matches your frontend origin
            },
            credentials: 'include',  // Include this line for cross-origin requests with cookies
            body: JSON.stringify(userSubmissionData),
>>>>>>> Stashed changes
        });

        if (response.status === 201) {
            Swal.fire('Success', 'Registration successful!', 'success').then(() => {
                router.push({ name: 'login' });
                sessionStorage.removeItem('user_data');
                sessionStorage.removeItem('agencyData');
                sessionStorage.removeItem('userAgencyData');
            });
        } else {
            Swal.fire('Error', `Error: ${response.data.error}`, 'error');
        }
    } catch (error) {
        console.log(error);

        if (error.response && error.response.data && error.response.data.error) {
            const errorDetail = error.response.data.error;
            if (errorDetail.includes('access_customuser.username')) {
                errorMessage.value = 'Oops! That username is already taken. Try something unique.';
            } else if (errorDetail.includes('access_customuser.identity_number')) {
                errorMessage.value = 'It seems this CID/Identity number already exists. Are you sure you don’t have an account already?';
            } else if (errorDetail.includes('access_customuser.email')) {
                errorMessage.value = 'This email has already been registered. Please consider using a new email or try logging in instead.';
            } else {
                errorMessage.value = 'Error creating user. Please try again.';
            }
        } else {
            errorMessage.value = 'An unexpected error occurred. Please try again later.';
        }
        Swal.fire('Error', errorMessage.value, 'error');
    }
};

</script>


<style scoped>
.error-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
    cursor: pointer;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    max-width: 500px;
    width: 90%;
    cursor: auto;
    position: relative;
}

.close-btn {
    display: inline-block;
    background-color: #2B656F;
    color: white;
    border: none;
    padding: 10px 20px;
    margin-top: 20px;
    border-radius: 5px;
    cursor: pointer;
    /* float: right; */
}

.close-btn:hover {
    background-color: #1f4d55;
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
