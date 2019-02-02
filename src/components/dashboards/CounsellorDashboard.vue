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

const userDetails = ref(null);
const agencyDetails = ref(null);

const userName = ref('');

// Function to retrieve username from sessionStorage
const getUsername = () => {
  const userData = JSON.parse(sessionStorage.getItem('userDetails'));
  if (userData) {
    userName.value = userData.first_name;
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
  // console.log('button click detected')
  try {
    const response = await axios.post(endpoints.logOutUser);
    if (response.data.message === 'Logout successful') {
      sessionStorage.removeItem('userDetails');
      sessionStorage.removeItem('agencyDetails');
      sessionStorage.removeItem('userAgencyDetails');
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
    
<style scoped></style>
