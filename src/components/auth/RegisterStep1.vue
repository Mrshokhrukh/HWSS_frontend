<template>
    <div class="min-vh-100 d-flex justify-content-center align-items-center authbg">
        <div class="card shadow-lg bg-body rounded card-reg mx-auto" style="width: 100%; max-width: 1000px;">
            <div class="row g-0 loginbg">
                <div
                    class="col-md-5 d-flex flex-column align-items-center justify-content-center position-relative left-card-side">
                    <img class="position-absolute start-0 bottom-0 img-fluid" src="@/assets/images/shape.png"
                        alt="Shape Image" style="z-index: 1;">
                    <div id="reg-img" class="text-center z-2 position-relative">
                        <img :src="registrationLogo" class="img-fluid rounded reg-img bounce-animation" alt="Logo"
                            style="max-width: 100%; width: 350px;">
                        <h2 class="reg-heading display-7 mt-3">{{ tagline }}</h2>
                    </div>
                </div>
                <div class="col-md-7 d-flex flex-column justify-content-center right-card-side">
                    <div class="auth-form text-center px-3 px-md-5">
                        <h2 class="text-center mt-4 mb-4" style="color: #2B656F; font-weight: bold">Sign Up</h2>
                        <p class="text-center text-capitalize" style="color: #2B656F; font-weight: bold">Select type of
                            user</p>
                        <div class="row justify-content-center align-items-center g-3">
                            <div class="col-sm-6">
                                <div :class="['card', 'reg-card', { 'active': selectedOption === 'pre-recorded' }]"
                                    @click="updateSelectedUserType('pre-recorded')">
                                    <div class="card-body d-flex align-items-center flex-column">
                                        <img src="@/assets/images/pre-recorded-icon.png" alt="" class="img-fluid mb-2"
                                            style="max-width: 80px;">
                                        <h6 class="card-text" style="color: #2B656F;">Pre Recorded User</h6>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div :class="['card', 'reg-card', { 'active': selectedOption === 'new-user' }]"
                                    @click="updateSelectedUserType('new-user')">
                                    <div class="card-body d-flex align-items-center flex-column">
                                        <img src="@/assets/images/agency-based-icon.png" alt="" class="img-fluid mb-2"
                                            style="max-width: 80px;">
                                        <h6 class="card-text" style="color: #2B656F;">Agency Based User</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="text-center mt-4 mb-5">
                        <button class="btn btn-primary btn-lg rounded-3 continue-button mb-3 w-75"
                            :disabled="!selectedOption" @click="continueToPage">
                            Continue
                        </button>
                        <p style="color: #2B656F; margin-bottom: 5px;">
                            Already have an account? <br />
                            <router-link to="/login" style="color: #2B656F; font-weight: bold; text-decoration: none;"
                                class="text-decoration-underline">Sign In</router-link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import endpoints from '@/api';
import axios from 'axios'
import registrationLogo from '@/assets/images/seal.png';

const tagline = ref('');

// Fetch and update the registration component settings on component mount
onMounted(async () => {
    try {
        const response = await axios.get(endpoints.settings);
        // Assuming the response data is an object or an array where you fetch the first item
        const settings = response.data[0];
        tagline.value = settings.tagline; // Update the tagline
    } catch (error) {
        console.error('Error fetching settings:', error);
    }
});

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
    bottom: 23%;
    font-family: "Boogaloo", sans-serif;
    font-weight: 400;
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

.bounce-animation {
    animation: bounce 5s ease-in-out infinite;
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}

@media (max-width: 767px) {
    .card-reg {
        width: 90% !important;
    }

    .left-card-side {
        padding: 2rem 0;
    }

    .right-card-side {
        padding: 2rem 1rem;
    }

    .continue-button {
        width: 100% !important;
    }
}
</style>
