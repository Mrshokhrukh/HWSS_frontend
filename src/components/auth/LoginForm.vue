<template>
    <div class="vh-100 d-flex justify-content-center align-items-center authbg cust-margin">
        <div class="card shadow-card my-5 shadow-lg bg-body" style="width: 60vw;">
            <div class="row g-0 loginbg">
                <div class="col-7 d-flex align-items-center">
                    <div class="card-body">
                        <div class="auth-form text-center">
                            <h1 class="text-center my-3 bold" style="color: #2B656F;">Sign In</h1>
                            <form class="row justify-content-center" @submit.prevent="loginUser">
                                <div class="mb-3 col-md-8">
                                    <input v-model="username" type="text" class="form-control" placeholder="Username"
                                        required />
                                </div>
                                <div class="mb-5 col-md-8">
                                    <input v-model="password" type="password" class="form-control"
                                        placeholder="Password" required />
                                </div>
                                <div class="text-center col-md-8">
                                    <button type="submit" class="btn col-md-12 singin-button btnbg">Sign In</button>
                                </div>
                            </form>

                            <div v-if="loginStatus === 'success'" class="alert alert-success mt-3" role="alert">
                                Login successful! Redirecting...
                            </div>
                            <div v-if="loginStatus === 'failed'" class="alert alert-danger mt-3" role="alert">
                                Login failed. Please check your credentials and try again.
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
                            <p class="text-center my-3">
                                <router-link to="/forgot-password" style="color: #2B656F; font-weight: bold;">Forgot
                                    Password?</router-link>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-md-5 custombg position-relative">
                    <img class="position-absolute bottom-0 start-0" src="../../assets/images/shape.png"
                        alt="Shape Image">

                    <div class="d-flex flex-column justify-content-center align-items-center h-100">
                        <img :src="loginLogo" alt="Logo" class="img-fluid" style="max-width: 100%; height: auto;">
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
                timer: 1500
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