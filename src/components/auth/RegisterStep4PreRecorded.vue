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
  console.log('Username:', username.value);
  console.log('Password:', password.value);

  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match.');
    return;
  }

  // Retrieve user data and agency data from session storage
  const userData = JSON.parse(sessionStorage.getItem('user_data'));
  const agencyData = JSON.parse(sessionStorage.getItem('agency_data'));

  if (!userData || !agencyData) {
    alert('User data or agency data not found in session storage.');
    return;
  }

  // Insert username and password into userData
  userData.username = username.value;
  userData.password = password.value;

  try {
    const csrfToken = document.cookie.match(/csrftoken=(.*?)(?:;|$)/)[1];

    // Register pre-recorded user
    const userResponse = await axios.post(endpoints.registerPreRecordedUser, userData, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      withCredentials: true,
    });

    if (userResponse.status === 201) {
      const userId = userResponse.data.userId;
      console.log('User ID received:', userId);

      agencyData.user = userId;

      console.log('User data being sent:', userData);
      console.log('Agency data being sent:', agencyData.user);

      // Register pre-recorded agency
      const agencyResponse = await axios.post(endpoints.registerPreRecordedAgency, { agency_data: agencyData }, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        withCredentials: true,
      });

      console.log('Agency registration response:', agencyResponse);

      if (agencyResponse.status === 201) {
        alert('Registration successful!');
        router.push({ name: 'login' });
      } else {
        alert('Error creating agency:', agencyResponse.statusText);
      }

      // Clear session storage after successful registration
      sessionStorage.removeItem('user_data');
      sessionStorage.removeItem('agency_data');
    } else {
      alert('Error creating user:', userResponse.statusText);
    }
  } catch (error) {
    alert('Error creating user:', error);
  }
};
</script>


  
<style>
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