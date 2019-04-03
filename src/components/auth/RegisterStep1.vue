<template>
<<<<<<< Updated upstream
    <div class="d-flex justify-content-center align-items-center" style="min-height: 100vh;">
        <div class="container-fluid rounded">
            <div class="card my-5 shadow-lg bg-body rounded card-reg mx-auto" style="max-width: 100%;">
                <div class="row g-0 loginbg rounded">
                    <div
                        class="col-md-5 d-flex flex-column align-items-center justify-content-center position-relative left-card-side">
                        <!-- Float-start image -->
                        <img class="position-absolute start-0 bottom-0" src="@/assets/images/shape.png"
                            alt="Shape Image" style="z-index: 999;">

                        <!-- Centered and sized logo -->
                        <div id="reg-img">
                            <img :src="registrationLogo" class="img-fluid rounded reg-img" alt="Logo"
                                style="width: 350px;">
                            <!-- Dynamic tagline -->
                            <h2 class="reg-heading display-7">{{ tagline }}</h2>
                        </div>
                    </div>
                    <div class="col-md-7 d-flex flex-column justify-content-center right-card-side">
                        <div class="auth-form text-center">
                            <h2 class="text-center mt-5 mb-4" style="color: #2B656F; font-weight: bold">Sign Up</h2>
                            <p class="text-center text-capitalize" style="color: #2B656F; font-weight: bold">Select type
                                of user</p>
                            <div class="row justify-content-center">
                                <div :class="['card', 'reg-card', { 'active': selectedOption === 'pre-recorded' }]"
                                    @click="updateSelectedUserType('pre-recorded')">
                                    <div class="card-body p-2">
                                        <img src="@/assets/images/pre-recorded-icon.png" alt="" class="img-fluid">
                                        <br />
                                        <h6 class="card-text" style="color: #2B656F;">Pre Recorded User</h6>
                                    </div>
                                </div>

                                <div :class="['card', 'reg-card', { 'active': selectedOption === 'new-user' }]"
                                    @click="updateSelectedUserType('new-user')">
                                    <div class="card-body p-2">
                                        <!-- <i class="fas fa-user" style="color: #2B656F;"></i> -->
                                        <img src="@/assets/images/agency-based-icon.png" alt="" class="img-fluid">
                                        <br />
                                        <h6 class="card-text" style="color: #2B656F;">Agency Based User</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="text-center mt-4 mb-5">
                            <button class="btn btn-primary btn-lg rounded-3 continue-button mb-5 w-50"
                                :disabled="!selectedOption" @click="continueToPage">
                                Continue
                            </button>
                            <p style="color: #2B656F; margin-bottom: 5px;">
                                Already have an account? <br />
                                <router-link to="/login"
                                    style="color: #2B656F; font-weight: bold; text-decoration: none;"
                                    class="text-decoration-underline">Sign In</router-link>
                            </p>
                        </div>
                    </div>
=======
    <div class="container-fluid rounded">
        <div class="card mb-3 shadow-lg mb-5 bg-body rounded card-reg">
            <div class="row g-0 loginbg rounded">
                <div class="col-md-5 d-flex flex-column align-items-center justify-content-center">
                    <!-- Centered and sized logo -->
                    <div id="reg-img" class="position-relative">
                        <img src="@/assets/images/logoxs.png" class="img-fluid rounded reg-img" alt="Logo">
                        <h2 class="reg-heading">Mental Health Matters</h2>
                    </div>
                </div>
                <div class="col-md-7 d-flex flex-column justify-content-between">
                    <div class="auth-form text-center">
                        <h2 class="text-center mt-5 mb-4" style="color: #2B656F; font-weight: bold">Sign Up</h2>
                        <p class="text-center" style="color: #2B656F; font-weight: bold">Select any type of user</p>
                        <div class="row justify-content-center">
                            <div :class="['card', 'reg-card', { 'active': selectedOption === 'pre-recorded' }]"
                                @click="updateSelectedUserType('pre-recorded')">
                                <div class="card-body">
                                    <!-- <i class="fas fa-video" style="color: #2B656F;"></i> -->
                                    <img src="@/assets/images/pre-recorded-icon.png" alt="" class="img-fluid"> <br/>
                                    <h6 class="card-text" style="color: #2B656F;">Pre Recorded User</h6>
                                </div>
                            </div>

                            <div :class="['card', 'reg-card', { 'active': selectedOption === 'new-user' }]"
                                @click="updateSelectedUserType('new-user')">
                                <div class="card-body">
                                    <!-- <i class="fas fa-user" style="color: #2B656F;"></i> -->
                                    <img src="@/assets/images/agency-based-icon.png" alt="" class="img-fluid"> <br/>
                                    <h6 class="card-text" style="color: #2B656F;">Agency Based User</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="text-center mb-5">
                        <button class="btn btn-primary btn-lg rounded-3 continue-button mb-5" :disabled="!selectedOption"
                            @click="continueToPage">
                            Continue
                        </button>
                        <p style="color: #2B656F; margin-bottom: 5px;">
                            Already have an account? <br />
                            <a href="#" @click="toggleForm" style="color: #2B656F; font-weight: bold">Sign In</a>
                        </p>
                    </div>
>>>>>>> Stashed changes
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
<<<<<<< Updated upstream
import { ref, onMounted } from 'vue';
import endpoints from '@/api';
import axios from 'axios'


const registrationLogo = ref('');
const tagline = ref('');

// Fetch and update the registration component settings on component mount
onMounted(async () => {
    try {
        const response = await axios.get(endpoints.settings);
        // Assuming the response data is an object or an array where you fetch the first item
        const settings = response.data[0];
        registrationLogo.value = settings.registration_logo; // Update the registration logo
        tagline.value = settings.tagline; // Update the tagline
    } catch (error) {
        console.error('Error fetching settings:', error);
    }
});
=======
import { ref } from 'vue';
>>>>>>> Stashed changes

const selectedOption = ref(null);

const emit = defineEmits(['select-user-type']);

const updateSelectedUserType = (type) => {
    selectedOption.value = type;
};

const continueToPage = () => {
    if (selectedOption.value) {
        emit('select-user-type', selectedOption.value);
    }
};
</script>

<style scoped>
<<<<<<< Updated upstream
=======
.card-reg {
    height: 70vh;
}

>>>>>>> Stashed changes
.loginbg {
    background-image: url('@/assets/images/thePemabg2.png');
    background-size: cover;
    min-height: 500px;
}

#reg-img {
    height: 100%;
    border-radius: 5px 80px 80px 5px;
    width: 100%;
    background-color: #2b656f;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.reg-heading {
    position: absolute;
    color: #fff;
<<<<<<< Updated upstream
    bottom: 23%;
=======
    bottom: 30%;
>>>>>>> Stashed changes
    font-family: "Boogaloo", sans-serif;
    font-weight: 400;
    font-style: normal;
}

.reg-img img {
    max-width: 350px;
    width: 100%;
}

.continue-button {
    background-color: #2b656f;
    color: #fff;
    width: 150px;
}

.reg-card {
    width: 15rem;
    height: 10rem;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s;
    margin: 20px;
    padding: 1rem;
    border-radius: 20px;
}

.reg-card i {
    font-size: 24px;
    margin-bottom: 8px;
}

.reg-card p {
    margin: 0;
    font-size: 12px;
}

.reg-card:hover {
    background-color: #f5f5f5;
}

.reg-card.active {
    border: 4px solid #2b656f;
}
<<<<<<< Updated upstream

.row.g-0.loginbg.rounded {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
}


@media (max-width: 768px) {
    .loginbg {
        min-height: 600px;
    }

    .left-card-side,
    .right-card-side {
        flex: 1 0 100%;
    }
}
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
</style>
  
=======
</style>
>>>>>>> Stashed changes
