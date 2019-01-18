<!-- <template>
    <div class="container mt-5 text-center">
        <h2 class="mb-4">Step 1: User Type Selection</h2>
        <div class="row justify-content-center">
            <button @click="selectUserType('pre-recorded')" class="btn btn-primary m-2">
                Pre-Recorded User
            </button>
            <button @click="selectUserType('new-user')" class="btn btn-primary m-2">
                Register New User
            </button>
        </div>
    </div>
</template> -->
<template>
    <div class="container-fluid rounded">
        <div class="card mb-3 shadow-lg mb-5 bg-body rounded">
            <div class="row g-0 loginbg rounded">
                <div class="col-md-5">
                    <img src="../../assets/images/signup.png" class="img-fluid rounded" alt="...">
                </div>
                <div class="col-md-7">
                    <div class="auth-form text-center ">
                        <h2 class="text-center mt-5 mb-4" style="color: #2B656F; font-weight: bold">Sign Up</h2>
                        <p class="text-center" style="color: #2B656F; font-weight: bold">Select any type of user</p>
                        <div class="row justify-content-center">
                            <button @click="selectUserType('pre-recorded')" class="btn btn-primary m-2">
                                Pre-Recorded User
                            </button>
                            <button @click="selectUserType('new-user')" class="btn btn-primary m-2">
                                Register New User
                            </button>
                        </div>
                    </div>
                    <div class="text-center">
                        <button class="btn btn-primary continue-button " :disabled="!selectedOption"
                            @click="continueToPage">Continue</button>
                    </div>
                    <p class="text-center mt-3" style="color: #2B656F; ">
                        Already have an account? <br><a href="#" @click="toggleForm"
                            style="color: #2B656F; font-weight: bold">Sign In</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
    </template>

<script setup>

const emit = defineEmits(['select-user-type']);

const selectUserType = (type) => {
    emit('select-user-type', type);
};
</script>

<style scoped>
.body {
    background-image: url('@/assets/images/thePemabg.png');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
}

.loginbg {
    background-image: url('@/assets/images/thePemabg2.png');
    background-size: cover;
    height: 100%;
}
</style>