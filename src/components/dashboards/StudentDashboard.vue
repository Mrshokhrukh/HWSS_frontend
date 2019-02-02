<template>
  <div class="container">
    <div class="row row-cols-1 row-cols-md-2 g-4">
      <div class="col">
        <div class="card">
          <div class="card-body">
            <LandingDashboardCard />
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card">
          <div class="card-body">
            <ContactDetailCard />
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card">
          <div class="card-body">
            <ImageCard />
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card">
          <div class="container">
            <PemaResponseServicesCard />
          </div>

        </div>
      </div>
    </div>
    <div class="row my-5">
      <div class="col-md-12">
        <button class="btn btn-secondary text-center" @click="logout">Log Out</button>
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

// const userDetails = ref(null);
// const agencyDetails = ref(null);
const userName = ref('');

// Function to retrieve username from sessionStorage
const getUsername = () => {
  const userData = JSON.parse(sessionStorage.getItem('userDetails'));
  if (userData) {
    userName.value = `${userData.first_name} ${userData.last_name}`;
    console.log('Username retrieved from sessionStorage:', userName.value);
  }
};

// Function to logout the user
const logout = async () => {
  try {
    const response = await axios.post(endpoints.logOutUser);
    if (response.data.message === 'Logout successful') {
      sessionStorage.removeItem('userDetails');
      sessionStorage.removeItem('agencyDetails');
      localStorage.removeItem('authToken');
      router.push('/login');
      console.log('User logged out successfully.');
    } else {
      console.error('Logout failed:', response.data.message);
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

// Call the function to retrieve username from sessionStorage
onMounted(getUsername);
</script>

<style scoped></style>
