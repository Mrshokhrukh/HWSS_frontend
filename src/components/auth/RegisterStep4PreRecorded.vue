<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="text-center mt-3">
            <h1 class="display-4" style="color: #2B656F; font-weight: bold">Sign Up</h1>
            <p class="lead" style="color: #2B656F; font-weight: bold">Prerecorded User Validation</p>
          </div>
          <div class="container p-5 rounded">
            <div class="card-body text-start  form">
              <h5 class="card-title cust-tex ">User Detail</h5>
              <p class="card-text cust-tex ">Please set a unique Username and a strong password</p>
              <form @submit.prevent="createUser">
                <!-- Username and password fields -->
                <div class="form-group">
                  <label for="username">Username:</label>
                  <input type="text" id="username" v-model="username"
                    class=" cust-tex form-control bg-transparent border border-secondary" required>
                </div>
                <div class="form-group">
                  <label for="password">Password:</label>
                  <input type="password" id="password" v-model="password"
                    class=" cust-tex form-control bg-transparent border border-secondary" required>
                </div>
                <div class="form-group">
                  <label for="confirmPassword">Confirm Password:</label>
                  <input type="password" id="confirmPassword" v-model="confirmPassword"
                    class=" cust-tex form-control bg-transparent border border-secondary" required>
                </div>
                <button type="submit" class="btn btn-primary custom-btn mt-3 col-12 p-2">Sign Up</button>
              </form>

            </div>
          </div>
          <div class="card-footer text-muted text-center" style="color: #2B656F; font-weight: bold">
            Already have an Account?
            <router-link to="/login" class="text-primary cust-tex">Sign In</router-link>
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

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const router = useRouter();

const createUser = async () => {
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match.');
    return;
  }

  try {
    // Get user and agency data from sessionStorage
    let userData = JSON.parse(sessionStorage.getItem('user_data'));
    const agencyData = JSON.parse(sessionStorage.getItem('agency_data'));
    const userAgencyData = JSON.parse(sessionStorage.getItem('user_agency_data'));

    // Update username and password in the userData object
    userData.username = username.value;
    userData.password = password.value;

    // Set the updated userData back to sessionStorage
    sessionStorage.setItem('user_data', JSON.stringify(userData));

    // Prepare userSubmissionData
    const userSubmissionData = {
      userData,
      agencyData,
      userAgencyData
    };

    console.log(userSubmissionData);

    // API call to register the user and agency together
    const response = await axios.post(endpoints.registerPreRecordedUser, userSubmissionData);

    if (response.status === 201) {
      // Registration successful
      alert('Registration successful!');
      router.push({ name: 'login' });

      // Clear user and agency data from sessionStorage
      sessionStorage.removeItem('user_data');
      sessionStorage.removeItem('agency_data');
      sessionStorage.removeItem('user_agency_data');
    } else {
      // Registration failed
      alert(`Error: ${response.data.error}`);
    }
  } catch (error) {
    alert('Error creating user:', error);
  }
};
</script>
  
<style scoped>
/* Add custom styles */
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