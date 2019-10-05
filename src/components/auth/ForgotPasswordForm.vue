<template>
    <div class="vh-100 d-flex justify-content-center align-items-center authbg">
        <div class="card shadow-card bg-body" style="width: 90%; max-width: 1000px;">
            <div class="row g-0 h-100">
                <div class="col-md-7 forgot-password-form-section">
                    <div class="card-body d-flex flex-column justify-content-center h-100">
                        <div class="auth-form text-center">
                            <h1 class="text-center mb-4 bold forgot-password-title">Forgot Password</h1>
                            <form class="row justify-content-center" @submit.prevent="requestPasswordReset">
                                <div class="mb-3 col-md-10">
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                                        <input v-model="email" type="email" class="form-control" placeholder="Email"
                                            required />
                                    </div>
                                </div>
                                <div class="text-center col-md-10">
                                    <button type="submit" class="btn col-12 reset-button btnbg">
                                        Send Reset Link
                                        <i class="fas fa-paper-plane ms-2"></i>
                                    </button>
                                </div>
                            </form>

                            <div v-if="resetStatus === 'success'" class="alert alert-success mt-3" role="alert">
                                Password reset link sent! Please check your email.
                            </div>
                            <div v-if="resetStatus === 'failed'" class="alert alert-danger mt-3" role="alert">
                                Failed to send reset link. Please check the email provided and try again.
                            </div>

                            <div class="mt-4">
                                <a href="#" class="ndi-link" @click.prevent="showNDILoginAlert">
                                    <img src="@/assets/images/NDILogo.png" alt="NDI Logo" class="ndi-logo me-2" />
                                    Login with NDI
                                </a>
                            </div>
                            <p class="mt-3 signup-link">
                                Don't have an account? <router-link to="/register">Sign Up</router-link>
                            </p>
                            <p class="mt-2">
                                <router-link to="/login" class="back-to-login-link">Back to Sign In</router-link>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-md-5 custombg d-flex flex-column justify-content-center align-items-center">
                    <img class="position-absolute bottom-0 start-0 shape-img" src="../../assets/images/shape.png"
                        alt="Shape Image">
                    <img :src="loginLogo" alt="Logo" class="img-fluid logo-image mb-3">
                    <h2 class="text-white text-center tag-line-login">{{ tagline }}</h2>
                </div>
            </div>
        </div>
        <div v-if="loading"
            class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-light bg-opacity-75">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import loginLogo from '@/assets/images/seal.png';
import Swal from 'sweetalert2';

const email = ref('');
const resetStatus = ref(null);
const loading = ref(false);
const tagline = ref('');

onMounted(async () => {
    try {
        const response = await axios.get(endpoints.settings);
        const settings = response.data[0];
        tagline.value = settings.tagline;
    } catch (error) {
        console.error('Error fetching settings:', error);
    }
});

const requestPasswordReset = async () => {
    loading.value = true;
    try {
        await axios.post(endpoints.passwordResetRequest, { email: email.value });
        resetStatus.value = 'success';
        Swal.fire({
            title: 'Reset Link Sent',
            text: 'Please check your email for the password reset link.',
            icon: 'success',
            confirmButtonColor: '#2B656F'
        });
    } catch (error) {
        console.error('Failed to send password reset link:', error);
        resetStatus.value = 'failed';
        Swal.fire({
            title: 'Reset Failed',
            text: 'Failed to send reset link. Please check the email provided and try again.',
            icon: 'error',
            confirmButtonColor: '#2B656F'
        });
    } finally {
        loading.value = false;
    }
};

const showNDILoginAlert = () => {
    Swal.fire({
        title: 'Coming Soon!',
        text: 'Login with NDI feature is coming soon. Stay tuned!',
        icon: 'info',
        confirmButtonColor: '#2B656F'
    });
};
</script>

<style scoped>
.card {
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.forgot-password-form-section {
    background-image: url('@/assets/images/thePemabg2.png');
    background-size: cover;
    background-position: center;
}

.custombg {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    position: relative;
    overflow: hidden;
}

.forgot-password-title {
    color: #2B656F;
    font-weight: 600;
}

.input-group-text {
    background-color: #f8f9fa;
    border-right: none;
}

.form-control {
    border-left: none;
}

.form-control:focus {
    box-shadow: none;
    border-color: #ced4da;
}

.reset-button {
    border-radius: 30px;
    padding: 10px 20px;
    font-weight: bold;
    transition: all 0.3s ease;
}

.btnbg {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    color: white;
}

.btnbg:hover {
    background-color: #1e4a52;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.ndi-logo {
    max-height: 30px;
}

.ndi-link,
.signup-link a,
.back-to-login-link {
    color: #2B656F;
    font-weight: bold;
    text-decoration: none;
    transition: color 0.3s ease;
}

.ndi-link:hover,
.signup-link a:hover,
.back-to-login-link:hover {
    color: #1e4a52;
    text-decoration: underline;
}

.shape-img {
    max-width: 100%;
    opacity: 0.1;
}

.logo-image {
    max-width: 70%;
    height: auto;
    animation: float 6s ease-in-out infinite;
}

.tag-line-login {
    font-family: "Boogaloo", sans-serif;
    font-weight: 200;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

@keyframes float {
    0% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-10px);
    }

    100% {
        transform: translateY(0px);
    }
}

@media (max-width: 768px) {
    .custombg {
        min-height: 200px;
    }

    .logo-image {
        max-width: 50%;
    }

    .tag-line-login {
        font-size: 1.5rem;
    }
}
</style>