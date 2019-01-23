    <!-- <div>
        <h2>Step 2: Pre-Recorded User Verification</h2>
        <form @submit.prevent="verifyUser">
            <div>
                <label for="cid">CID Number:</label>
                <input type="text" id="cid" v-model="cid" required>
            </div>
            <div>
                <label for="dob">Date of Birth:</label>
                <input type="date" id="dob" v-model="dob" required>
            </div>
            <button type="submit">Verify</button>
        </form>
        <p v-if="errorMessage">{{ errorMessage }}</p>
    </div> -->
<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">

          <div class="logo-container">
            <img src="@/assets/images/NDILogo.png" alt="NDI Logo" class="ndi-logo" />
            <a href="#" class="text-dark font-weight-bold">Login with NDI</a>
          </div>

          <div class="text-center mt-3">
            <h1 class="display-4" style="color: #2B656F; font-weight: bold">Sign Up</h1>
            <p class="lead" style="color: #2B656F; font-weight: bold">Prerecorded User Validation</p>
          </div>
          <div class="container p-4">
          <div class="card-body text-start form">
            <h5 class="card-title cust-text bold h2">User Details</h5>
            <p class="card-text cust-text bold">Please kindly enter your details below to check if you are prerecorded or not</p>
            <form @submit.prevent="verifyUser">
              <div class="mb-3">
                <label for="cid" class="form-label cust-text bold">Enter Your Citizenship ID</label>
                <input type="text" class="form-control" id="cid" v-model="cid" required>
              </div>
              <div class="row g-3">
                <p class="cust-text bold">What’s your date of birth?</p>
                <div class="col-md-4">
                  <label for="day" class="form-label text-success">Day:</label>
                  <input type="number" id="day" v-model="day" min="1" max="31" class="form-control" required>
                </div>
                <div class="col-md-4">
                  <label for="month" class="form-label text-success">Month:</label>
                  <input type="number" id="month" v-model="month" min="1" max="12" class="form-control" required>
                </div>
                <div class="col-md-4">
                  <label for="year" class="form-label text-success">Year:</label>
                  <input type="number" id="year" v-model="year" min="1900" max="2100" class="form-control" required>
                </div>
              </div>
              <button type="submit" class="custom-btn mt-3 col-12 p-2">Check</button>
            </form>
            <p v-if="errorMessage" class="mt-2 text-danger">{{ errorMessage }}</p>
          </div>
        </div>
          <div class="card-footer text-muted text-center">
            Already have an Account? 
            <router-link to="/login" class="text-primary">Sign In</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>

  .logo-container {
    position: absolute;
    top: 20px;
    right: 20px;
    padding: 10px;
    background-color: #69B2A0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 30px;
  }

  .ndi-logo {
    height: 30px; /* Adjust the height as needed */
    margin-right: 5px;
  }
  .form {
    background-color:  #2B656F24;
    border-radius: 15px;
  }
  .custom-btn {
    background-color: #2B656F;
    color: #fff; 
    font-size: inherit; 
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  .cust-text{
    color: #2B656F;
  }
</style>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const cid = ref('');
const day = ref('');
const month = ref('');
const year = ref('');
const errorMessage = ref('');
const emit = defineEmits(['go-to-next-step']);

const verifyUser = async () => {
  try {
    const response = await axios.post('http://localhost:8000/api/v1/access/verify-pre-recorded-user/', {
      cid: cid.value,
      dob: `${year.value}-${month.value.toString().padStart(2, '0')}-${day.value.toString().padStart(2, '0')}`
    });
    if (response.data.success) {
      emit('go-to-next-step');
    } else {
      errorMessage.value = response.data.message || 'Verification failed';
    }
  } catch (error) {
    errorMessage.value = error.response.data.message || 'An error occurred during verification';
  }
};

</script>
