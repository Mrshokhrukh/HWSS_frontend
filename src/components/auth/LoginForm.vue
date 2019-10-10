<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-content">
                <!-- Login Form Section -->
                <div class="login-form-section">
                    <div class="form-container">
                        <h1 class="login-title">Sign In</h1>
                        <form @submit.prevent="loginUser" class="login-form">
                            <div class="input-group">
                                <span class="input-icon"><i class="fas fa-user"></i></span>
                                <input v-model="username" type="text" class="form-input" placeholder="Username"
                                    required />
                            </div>
                            <div class="input-group">
                                <span class="input-icon"><i class="fas fa-lock"></i></span>
                                <input v-model="password" type="password" class="form-input" placeholder="Password"
                                    required />
                            </div>
                            <button type="submit" class="signin-button">
                                Sign In
                                <i class="fas fa-sign-in-alt"></i>
                            </button>
                        </form>
                        <div class="ndi-login">
                            <a @click.prevent="showNDILoginAlert" href="#" class="ndi-link">
                                <img src="@/assets/images/NDILogo.png" alt="NDI Logo" class="ndi-logo" />
                                Login with NDI
                            </a>
                        </div>
                        <p class="signup-link">
                            Don't have an account? <router-link to="/register">Sign Up</router-link>
                        </p>
                        <p class="forgot-password-link">
                            <router-link to="/forgot-password">Forgot Password?</router-link>
                        </p>
                    </div>
                </div>
                <!-- Logo and Tagline Section -->
                <div class="logo-section">
                    <img class="shape-img" src="../../assets/images/shape.png" alt="Shape Image">
                    <img :src="loginLogo" alt="Logo" class="logo-image">
                    <h2 class="tagline">{{ tagline }}</h2>
                </div>
            </div>
        </div>
        <!-- Loading Overlay -->
        <div v-if="loading" class="loading-overlay">
            <div class="spinner"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import endpoints from '@/api';
import { useUserDetailsStore } from '@/stores/userDetails';
import Swal from 'sweetalert2';
import loginLogo from '@/assets/images/seal.png';

const router = useRouter();
const userDetailsStore = useUserDetailsStore();

const username = ref('');
const password = ref('');
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

const loginUser = async () => {
    loading.value = true;
    try {
        const loginResponse = await axios.post(endpoints.loginUsers, {
            username: username.value,
            password: password.value,
        });

        const authToken = loginResponse.data.token;

        // Generate a token expiry time on the frontend (e.g., 1 hour from now)
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Set expiry to 1 hour from now

        // Store the token and expiry time in local storage
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('tokenExpiry', tokenExpiry.toISOString()); // Save in ISO 8601 format for easy parsing

        // Fetch minimal user details needed for routing
        const userDetailsResponse = await axios.get(endpoints.getUserDetails, {
            headers: { Authorization: `Token ${authToken}` },
        });

        const { user } = userDetailsResponse.data;

        // Show success message and redirect
        Swal.fire({
            title: 'Login Successful!',
            text: 'Redirecting to dashboard...',
            icon: 'success',
            showConfirmButton: false,
            timer: 1000,
        });

        // Redirect to dashboard
        redirectToDashboard(user.role);

        // Fetch full user details in the background
        fetchFullUserDetails(authToken);

    } catch (error) {
        handleLoginError(error);
    } finally {
        loading.value = false;
    }
};

const fetchFullUserDetails = async (authToken) => {
    try {
        const response = await axios.get(endpoints.getUserDetails, {
            headers: { Authorization: `Token ${authToken}` },
        });

        const { user, agency, userAgency } = response.data;
        const userAgencyDetails = userAgency.length ? userAgency[0] : {};

        await userDetailsStore.setUserDetails({ user, agency, userAgency: userAgencyDetails });
    } catch (error) {
        console.error('Error fetching full user details:', error);
    }
};

const redirectToDashboard = (userRole) => {
    const dashboardRoutes = {
        student: 'student-dashboard',
        school_counselor: 'counselor-dashboard',
        gyalsung_counselor: 'counselor-dashboard',
        clinical_counselor: 'counselor-dashboard',
        trained_professional: 'counselor-dashboard',
        mh_admin: 'admin-dashboard',
        rd_admin: 'admin-dashboard',
        sud_admin: 'admin-dashboard',
        aaa_admin: 'admin-dashboard',
        cecd_admin: 'admin-dashboard',
    };

    const routeName = dashboardRoutes[userRole] || 'public-dashboard';
    router.push({ name: routeName });
};

const handleLoginError = (error) => {
    let errorMessage = 'Login failed. Please try again.';
    if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.error === 'Wrong password') {
            errorMessage = 'Invalid password. Please try again.';
        } else if (data.error === 'User not found') {
            errorMessage = 'User not found. Please check your username.';
        }
    }
    Swal.fire('Login Failed', errorMessage, 'error');
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
@import url('https://fonts.googleapis.com/css2?family=Boogaloo&display=swap');

.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.login-card {
    width: 100%;
    max-width: 1000px;
    background-image: url('@/assets/images/thePemabg2.png');
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.login-content {
    display: flex;
    flex-direction: column;
}

.login-form-section {
    flex: 1;
    padding: 2rem;
}

.form-container {
    max-width: 400px;
    margin: 0 auto;
}

.login-title {
    font-size: 2rem;
    font-weight: bold;
    text-align: center;
    color: #2B656F;
    margin-bottom: 2rem;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.input-group {
    position: relative;
}

.input-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
}

.form-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 1rem;
}

.form-input:focus {
    outline: none;
    border-color: #2B656F;
}

.signin-button {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    color: white;
    font-weight: bold;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.signin-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.ndi-login {
    margin-top: 2rem;
    text-align: center;
}

.ndi-link {
    display: inline-flex;
    align-items: center;
    color: #2B656F;
    font-weight: bold;
    text-decoration: none;
}

.ndi-logo {
    height: 1.5rem;
    margin-right: 0.5rem;
}

.signup-link,
.forgot-password-link {
    margin-top: 1rem;
    text-align: center;
}

.signup-link a,
.forgot-password-link a {
    color: #2B656F;
    font-weight: bold;
    text-decoration: none;
}

.signup-link a:hover,
.forgot-password-link a:hover {
    text-decoration: underline;
}

.logo-section {
    flex: 1;
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    border-radius: 80px 15px 15px 80px;
}

.shape-img {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    opacity: 0.1;
}

.logo-image {
    width: 70%;
    max-width: 300px;
    margin-bottom: 2rem;
    animation: float 6s ease-in-out infinite;
}

.tagline {
    font-family: "Boogaloo", sans-serif;
    font-size: 2rem;
    color: white;
    text-align: center;
    font-weight: 200;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #2B656F;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@media (min-width: 768px) {
    .login-content {
        flex-direction: row;
    }

    .login-form-section,
    .logo-section {
        width: 50%;
    }
}
</style>