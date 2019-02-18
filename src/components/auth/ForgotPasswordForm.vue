<template>
    <div class="d-flex justify-content-center align-items-center" style="min-height: 100vh;">
        <!-- This container centers its children -->
        <div class="container my-auto">
            <div class="container authbg cust-margin">
                <div class="card shadow-card my-5  shadow-lg bg-body rounded">
                    <div class="row g-0 loginbg">
                        <div class="col-md-7">
                            <div class="card-body d-flex flex-column justify-content-center align-items-center"
                                style="min-height: 100%;">
                                <div class="auth-form text-center w-100">
                                    <h1 class="text-center my-3 bold" style="color: #2B656F;">Forgot Password</h1>

                                    <form class="row justify-content-center align-items-center"
                                        @submit.prevent="requestPasswordReset">
                                        <div class="mb-3 mt-3 col-md-8">
                                            <input v-model="email" type="email" class="form-control" placeholder="Email"
                                                required />
                                        </div>
                                        <div class="text-center col-md-8">
                                            <button type="submit" class="btn col-md-12 singin-button btnbg">Send Reset
                                                Link</button>
                                        </div>
                                    </form>

                                    <!-- Show status message based on resetStatus -->
                                    <div v-if="resetStatus === 'success'" class="alert alert-success mt-3" role="alert">
                                        Password reset link sent! Please check your email.
                                    </div>
                                    <div v-if="resetStatus === 'failed'" class="alert alert-danger mt-3" role="alert">
                                        Failed to send reset link. Please check the email provided and try again.
                                    </div>
                                    <br />
                                    <div>
                                        <p class="text-center my-4">
                                            <img src="@/assets/images/NDILogo.png" alt="NDI Logo" />
                                            <a href="#" style="color: black; font-weight: bold"> Login with NDI</a>
                                        </p>
                                    </div>
                                    <p class="text-center my-3" style="color: #2B656F;">
                                        Don't have an account? <router-link to="/register"
                                            style="color: #2B656F; font-weight: bold">Sign Up</router-link>
                                    </p>
                                    <!-- Add Forgot Password link -->
                                    <p class="text-center my-3">
                                        <router-link to="/login" style="color: #2B656F; font-weight: bold;">Back to Sign
                                            In</router-link>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-5 custombg position-relative">
                            <!-- Float-start image -->
                            <img class="position-absolute bottom-0 start-0" src="../../assets/images/shape.png"
                                alt="Shape Image">

                            <!-- Logo and tagline container -->
                            <div class="d-flex flex-column justify-content-center align-items-center h-100">
                                <!-- Bind src to the dynamic logo -->
                                <img :src="loginLogo" alt="Logo" style="width: 350px;">
                                <!-- Bind text to the dynamic tagline -->
                                <h2 class="text-white display-7 mt-3 tag-line-login">{{ tagline }}</h2>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="loading === true" class="loader">
                    <div class="container">
                        <div class="row justify-content-center">
                            <div class="col-md-8">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';

const email = ref('');
const resetStatus = ref(null);
const loading = ref(false);
const loginLogo = ref('');
const tagline = ref('');

onMounted(async () => {
    try {
        const response = await axios.get(endpoints.settings);
        const settings = response.data[0];
        loginLogo.value = settings.login_logo; // Update the login logo
        tagline.value = settings.tagline; // Update the tagline
    } catch (error) {
        console.error('Error fetching settings:', error);
    }
});

const requestPasswordReset = async () => {
    try {
        loading.value = true;
        await axios.post(endpoints.passwordResetRequest, { email: email.value });
        resetStatus.value = 'success';
    } catch (error) {
        console.error('Failed to send password reset link:', error);
        resetStatus.value = 'failed';
    } finally {
        loading.value = false;
    }
};
</script>


<style scoped>
.tag-line-login {
    font-family: "Boogaloo", sans-serif;
    font-weight: 200;
}

.loginbg {
    background-image: url('@/assets/images/thePemabg2.png');
    background-size: cover;
    height: 500px;
    border-radius: 10px;
}

.custombg {
    background-color: #2C6975;
    border-radius: 20% 10px 10px 20%;
    height: 100%;
}

.auth-form .signin-button {
    border-radius: 5px;
}

.btnbg {
    background-color: #2B656F;
    color: white;
}

.loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}
</style>
