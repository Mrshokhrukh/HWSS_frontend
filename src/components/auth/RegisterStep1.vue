<template>
    <div class="container-fluid rounded">
        <div class="card my-5 shadow-lg bg-body rounded card-reg">
            <div class="row g-0 loginbg rounded">
                <div class="col-md-5 d-flex flex-column align-items-center justify-content-center position-relative">
                    <!-- Float-start image -->
                    <img class="position-absolute start-0 bottom-0" src="@/assets/images/shape.png" alt="Shape Image" style="z-index: 999;">

                    <!-- Centered and sized logo -->
                    <div id="reg-img">
                        <img src="@/assets/images/logoxs.png" class="img-fluid rounded reg-img" alt="Logo"
                            style="width: 250px;">
                        <h2 class="reg-heading display-7">Mental Health Matters</h2>
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
                                    <img src="@/assets/images/pre-recorded-icon.png" alt="" class="img-fluid"> <br />
                                    <h6 class="card-text" style="color: #2B656F;">Pre Recorded User</h6>
                                </div>
                            </div>

                            <div :class="['card', 'reg-card', { 'active': selectedOption === 'new-user' }]"
                                @click="updateSelectedUserType('new-user')">
                                <div class="card-body">
                                    <!-- <i class="fas fa-user" style="color: #2B656F;"></i> -->
                                    <img src="@/assets/images/agency-based-icon.png" alt="" class="img-fluid"> <br />
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
                            <router-link to="/login" style="color: #2B656F; font-weight: bold"
                                class="text-decoration-underline">Sign In</router-link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';

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
    bottom: 30%;
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
</style>
  