<template>
    <div class="container authbg cust-margin">
        <div class="card shadow-card">
            <div class="row g-0 loginbg">
                <div class="col-md-7">
                    <div class="card-body">
                        <div class="auth-form text-center">
                            <h1 class="text-center my-3 bold" style="color: #2B656F;">Sign In</h1>
                            <form class="row justify-content-center" @submit.prevent="loginUser">
                                <div class="mb-3 col-md-8">
                                    <input v-model="username" type="text" class="form-control" placeholder="Username"
                                        required />
                                </div>
                                <div class="mb-5 col-md-8">
                                    <input v-model="password" type="password" class="form-control" placeholder="Password"
                                        required />
                                </div>
                                <div class="text-center col-md-8">
                                    <button type="submit" class="btn col-md-12 singin-button btnbg">Sign
                                        In</button>
                                </div>
                            </form>

                            <!-- Show status message based on loginStatus -->
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
                                Don't have an account? <br />
                                <router-link to="/register" style="color: #2B656F; font-weight: bold">Sign Up</router-link>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-md-5 custombg position-relative">
                    <!-- Float-start image -->
                    <img class="position-absolute bottom-0 start-0" src="../../assets/images/shape.png" alt="Shape Image">

                    <!-- Logo and tagline container -->
                    <div class="d-flex flex-column justify-content-center align-items-center h-100">
                        <img src="../../assets/images/Logo.png" alt="Logo" style="width: 250px;">
                        <h2 class="text-white display-7 mt-3 tag-line-login">Mental Health Matters</h2>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import endpoints from '@/api';

const router = useRouter();

const username = ref('');
const password = ref('');
const loginStatus = ref(null);
const loading = ref(false);

const loginUser = async () => {
    try {
        loading.value = true;

        const response = await axios.post(endpoints.loginUsers, {
            username: username.value,
            password: password.value.toString(),
        });

        const token = response.data.token;

        localStorage.setItem('authToken', token);

        const userRole = response.data.user_role_agency;

        sessionStorage.setItem('userRole', userRole)

        switch (userRole) {
            case 'student':
                router.push({ name: 'student-dashboard' });
                break;
            case 'school counsellor':
                router.push({ name: 'counsellor-dashboard' });
                break;
            default:
                router.push({ name: 'admin-dashboard' });
        }

    } catch (error) {
        console.error('Login failed:', error);

        if (error.response) {
            loginStatus.value = `Login failed: ${error.response.data.detail}`;
        } else if (error.request) {
            console.error('No response received:', error.request);
            loginStatus.value = 'Login failed: No response received';
        } else {
            console.error('Error message:', error.message);
            loginStatus.value = 'Login failed: An error occurred';
        }
    } finally {
        loading.value = false;
    }
};

</script>




<style scoped>
.tag-line-login{
    font-family: "Boogaloo", sans-serif;
    font-weight: 200;
}

.loginbg {
    background-image: url('@/assets/images/thePemabg2.png');
    background-size: cover;
    height: 500px;
    border-radius: 10px;
}

/* Add darker shadow to the card */
.shadow-card {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.custombg {
    background-color: #2C6975;
    border-radius: 20% 10px 10px 20%;
    height: 100%;
}

.cust-margin {
    margin-top: 7%;
    margin-bottom: auto;
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
    