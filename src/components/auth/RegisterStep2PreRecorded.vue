<template>
  <div class="d-flex justify-content-center align-items-center" style="min-height: 100vh;">
    <div class="col-md-8">
      <div class="card shadow">
        <div class="logo-container card d-flex flex-row justify-content-center align-items-center">
          <img src="@/assets/images/NDILogo.png" alt="NDI Logo" class="ndi-logo" />
          <a href="#" class="text-dark font-weight-bold">Login with NDI</a>
        </div>

        <div class="text-center mt-3">
          <h1 class="display-4" style="color: #2B656F; font-weight: bold">Sign Up</h1>
          <p class="lead" style="color: #2B656F; font-weight: bold">Prerecorded User Validation</p>
        </div>
        <div class="p-4">
          <div class="card p-4 text-start form">
            <h4 class="card-title cust-text bold  text-center">User Details</h4>
            <p class="card-text cust-text bold">Please kindly enter your details below to check if you are prerecorded
              or not</p>
            <form @submit.prevent="verifyUser">
              <div class="mb-3">
                <label for="cid" class="form-label cust-text bold">Enter Your Citizenship ID / Casefile no / Student Code /
                  Any other identity Number</label>
                <input type="text" class="form-control" id="cid" v-model="cid" required>
              </div>
              <div class="row g-3">
                <p class="cust-text mb-1 bold">What’s your date of birth?</p>
                <div class="col-md-4">
                  <label for="day" class="form-label hwss-primary">Day:</label>
                  <input type="number" id="day" v-model="day" min="1" max="31" class="form-control" required>
                </div>
                <div class="col-md-4">
                  <label for="month" class="form-label hwss-primary">Month:</label>
                  <input type="number" id="month" v-model="month" min="1" max="12" class="form-control" required>
                </div>
                <div class="col-md-4">
                  <label for="year" class="form-label hwss-primary">Year:</label>
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
          <router-link to="/login" class="hwss-primary bold">Sign In</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import endpoints from '@/api';
import Swal from 'sweetalert2';

const cid = ref('');
const day = ref('');
const month = ref('');
const year = ref('');
const errorMessage = ref('');
const emit = defineEmits(['go-to-next-step']);
const router = useRouter();

const verifyUser = async () => {
  try {
    // console.log('Sending request to verify user...');
    // console.log('CID:', cid.value);

    const response = await axios.get(endpoints.verifyPreRecordedUser, {
      params: {
        cid: cid.value,
      },
    });

    // console.log('Response received:', response.data);

    const dataArray = response.data;
    const dataObject = Array.isArray(dataArray) ? dataArray[0] : dataArray;

    if (dataObject.success) {
      // console.log('User verification successful.');

      const userDOB = dataObject.user.date_of_birth;

      if (userDOB !== `${year.value}-${month.value.toString().padStart(2, '0')}-${day.value.toString().padStart(2, '0')}`) {
        Swal.fire(`Dear ${dataObject.user.first_name}`, 'The entered DOB does not match with the records. Please re-enter the correct DOB.', 'error');
      } else {
        saveUserData(dataObject.user);
        saveAgencyData(dataObject.agency);
        saveUserAgencyData(dataObject.userAgency);

        Swal.fire(`Dear ${dataObject.user.first_name}`, 'Records successfully found. Please proceed to the next step and create a username and a strong password to log into the system and start using.', 'success');

        emit('go-to-next-step', 'step-two-prerecorded');
      }
    } else {
      // console.log('User verification failed:', dataObject.message);

      if (response.status === 400 && dataObject.message === 'Pre-recorded user is already registered.') {
        Swal.fire('Notice', 'User with this ID card is already registered. Please log in to continue.', 'info');
      } else {
        errorMessage.value = dataObject.message || 'Verification failed';

        if (dataObject.message && dataObject.message.toLowerCase().includes('not found')) {
          Swal.fire('User not found', 'Please register as a new user and continue your registration.', 'warning').then(() => {
            router.push('/register');
          });
        }
      }
    }
  } catch (error) {
    console.error('An error occurred during verification:', error);
    console.error('Error response data:', error.response.data);
    console.error('Error response status:', error.response.status);
    console.error('Error response headers:', error.response.headers);

    errorMessage.value = error.response.data.message || 'An error occurred during verification';
  }
};


// Helper method to save user_data to session/local storage
const saveUserData = (userData) => {
  // console.log('Saving user data to session storage:', userData);
  sessionStorage.setItem('user_data', JSON.stringify(userData));
};

// Helper method to save agency_data to session/local storage
const saveAgencyData = (agencyData) => {
  // console.log('Saving agency data to session storage:', agencyData);
  sessionStorage.setItem('agency_data', JSON.stringify(agencyData));
};

// Helper method to save user_agency_data to session/local storage
const saveUserAgencyData = (userAgencyData) => {
  // console.log('Saving user agency data to session storage:', userAgencyData);
  sessionStorage.setItem('user_agency_data', JSON.stringify(userAgencyData));
};
</script>


<style scoped>
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
  height: 30px;
  margin-right: 5px;
}

.form {
  background-color: #2B656F24;
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

.cust-text {
  color: #2B656F;
}
</style>