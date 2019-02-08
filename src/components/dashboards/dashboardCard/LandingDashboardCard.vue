<template>
  <div class="container">
    <div class="row">
      <div class="col-md-8">
        <h1 class="text-center mb-5 mt-3"> Hi {{ userName }}! </h1>
        <h3>Welcome to Mental Health & Well Being Screening!</h3>
        <div class="row justify-content-center">
          <button class="btn custom-btn arrow-button" @click="logout">Screen your mental Health</button>
        </div>
      </div>
      <div class="col-md-4 d-flex align-items-center justify-content-center">
        <img src="@/assets/images/brainicon.png" class="img-fluid" alt="">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

import endpoints from '@/api';

const router = useRouter();

const userDetails = ref(null);
const agencyDetails = ref(null);

const userName = ref('');

// Function to retrieve username from sessionStorage
const getUsername = () => {
  const userData = JSON.parse(sessionStorage.getItem('userDetails'));
  if (userData) {
    userName.value = `${userData[0].first_name} ${userData[0].last_name}`
  }
};

onMounted(async () => {
  try {
    const authToken = localStorage.getItem('authToken');

    const response = await axios.get(endpoints.getUserDetails, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });

    const data = response.data;

    // Check if both user and agency details are present in the response
    if (data.user && data.agency) {
      sessionStorage.setItem('userDetails', JSON.stringify(data.user));
      sessionStorage.setItem('agencyDetails', JSON.stringify(data.agency));

      userDetails.value = data.user;
      agencyDetails.value = data.agency;

      getUsername();
    } else {
      console.error('Error: Incomplete user or agency details in response');
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
  }
});

// Function to logout the user
const logout = async () => {
  try {
    const response = await axios.post(endpoints.logOutUser);
    if (response.data.message === 'Logout successful') {
      sessionStorage.removeItem('userDetails');
      sessionStorage.removeItem('agencyDetails');
      localStorage.removeItem('authToken');
      router.push('/login');
    } else {
      console.error('Logout failed:', response.data.message);
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>


<style scoped>
.custom-btn {
  background-color: #2B656F;
  color: #fff;
  font-size: inherit;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.arrow-button {
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #2B656F;
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.arrow-button::after {
  content: '\2192';
  /* Unicode character for right arrow */
  font-size: 20px;
  position: absolute;
  right: 10px;
  /* Adjust this value to control the distance of the arrow from the right edge */
}

.arrow-button::before {
  content: '';
  width: 40px;
  /* Adjust the width of the circle */
  height: 40px;
  /* Adjust the height of the circle */
  background-color: #2B656F;
  /* Same as the button background color */
  border-radius: 50%;
  position: absolute;
  right: 0;
  transform: translateX(50%);
  /* Center the circle on the right side */
  display: flex;
  justify-content: center;
  align-items: center;
}</style>
