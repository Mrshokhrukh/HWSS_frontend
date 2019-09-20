<template>
    <div class="vh-100 d-flex justify-content-center align-items-center authbg">
        <div class="card shadow-card bg-body" style="width: 90%; max-width: 1000px;">
            <div class="row g-0 h-100">
                <div class="col-md-7 login-form-section">
                    <div class="card-body d-flex flex-column justify-content-center h-100">
                        <div class="auth-form text-center">
                            <h1 class="text-center mb-4 bold login-title">Sign In</h1>
                            <form class="row justify-content-center" @submit.prevent="loginUser">
                                <div class="mb-3 col-md-10">
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-user"></i></span>
                                        <input v-model="username" type="text" class="form-control"
                                            placeholder="Username" required />
                                    </div>
                                </div>
                                <div class="mb-4 col-md-10">
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                        <input v-model="password" type="password" class="form-control"
                                            placeholder="Password" required />
                                    </div>
                                </div>
                                <div class="text-center col-md-10">
                                    <button type="submit" class="btn col-12 signin-button btnbg">
                                        Sign In
                                        <i class="fas fa-sign-in-alt ms-2"></i>
                                    </button>
                                </div>
                            </form>

                            <div class="mt-4">
                                <a href="#" class="ndi-link">
                                    <img src="@/assets/images/NDILogo.png" alt="NDI Logo" class="ndi-logo me-2" />
                                    Login with NDI
                                </a>
                            </div>
                            <p class="mt-3 signup-link">
                                Don't have an account? <router-link to="/register">Sign Up</router-link>
                            </p>
                            <p class="mt-2">
                                <router-link to="/forgot-password" class="forgot-password-link">Forgot
                                    Password?</router-link>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-md-5 custombg d-flex flex-column justify-content-center align-items-center">
                    <img class="position-absolute bottom-0 start-0 shape-img" src="../../assets/images/shape.png"
                        alt="Shape Image">
                    <img :src="loginLogo" alt="Logo" class="img-fluid logo-image mb-3">
                    <h2 class="text-white text-center tag-line-login">Mental Health Matters</h2>
                </div>
            </div>
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

const router = useRouter();

const username = ref('');
const password = ref('');
const loginStatus = ref(null);
const loading = ref(false);
const loginLogo = ref('');
const tagline = ref('');

onMounted(async () => {
    try {
        const response = await axios.get(endpoints.settings);
        const settings = response.data[0];
        loginLogo.value = settings.login_logo;
        tagline.value = settings.tagline;
    } catch (error) {
        console.error('Error fetching settings:', error);
    }
});

const loginUser = async () => {
    loading.value = true;
    try {
        const response = await axios.post(endpoints.loginUsers, {
            username: username.value,
            password: password.value,
        });

        localStorage.setItem('authToken', response.data.token);
        await fetchUserAndAgencyDetails(response.data.user_role, response.data.token);
    } catch (error) {
        handleLoginError(error);
    } finally {
        loading.value = false;
    }
};

const fetchUserAndAgencyDetails = async (userRole, authToken) => {
    try {
        // Fetch user details from the API
        const response = await axios.get(endpoints.getUserDetails, {
            headers: { Authorization: `Token ${authToken}` },
        });

        // Destructure the response data
        const { user, agency, userAgency } = response.data;
        const userAgencyDetails = userAgency.length ? userAgency[0] : {};

        // Access the userDetails store instance
        const userDetailsStore = useUserDetailsStore();

        // Call the setUserDetails action with the retrieved data
        const storeResponse = await userDetailsStore.setUserDetails({ user, agency, userAgency: userAgencyDetails });

        // Handle the response from the store
        if (storeResponse.status === 'success') {
            Swal.fire({
                title: 'Login Successful!',
                text: 'Your data has been successfully retrieved.',
                icon: 'success',
                showConfirmButton: false,
                timer: 500
            }).then(() => {
                redirectToDashboard(userRole);
            });
        } else {
            // Show error message based on the response message
            if (storeResponse.message.includes('Invalid Credentials')) {
                Swal.fire('Error', 'Invalid username or password.', 'error');
            } else if (storeResponse.message.includes('User with username:')) {
                Swal.fire('Error', 'User with the given username not found.', 'error');
            } else {
                Swal.fire('Error', 'Failed to fetch user details.', 'error');
            }
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        Swal.fire('Error', 'Failed to fetch user details.', 'error');
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
    };

    const routeName = dashboardRoutes[userRole] || 'public-dashboard';
    router.push({ name: routeName });
};

const handleLoginError = (error) => {
    let errorMessage = 'Login failed';
    if (error.response && error.response.data) {
        const data = error.response.data.error;
        if (data === 'Wrong password') {
            errorMessage = 'The given password for your username is invalid.';
        } else if (data === 'User not found') {
            errorMessage = 'User with the given username was not found in our system.';
        } else {
            errorMessage = `Login failed: ${data.error}`;
        }
    }
    loginStatus.value = errorMessage;
    Swal.fire('Login Failed', errorMessage, 'error');
};

</script>

<style scoped>
.card {
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.login-form-section {
    background-image: url('@/assets/images/thePemabg2.png');
    background-size: cover;
    background-position: center;
}

.custombg {
    background-color: #2C6975;
    position: relative;
    overflow: hidden;
}

.login-title {
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

.signin-button {
    border-radius: 30px;
    padding: 10px 20px;
    font-weight: bold;
    transition: all 0.3s ease;
}

.btnbg {
    background-color: #2B656F;
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
.forgot-password-link {
    color: #2B656F;
    font-weight: bold;
    text-decoration: none;
    transition: color 0.3s ease;
}

.ndi-link:hover,
.signup-link a:hover,
.forgot-password-link:hover {
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