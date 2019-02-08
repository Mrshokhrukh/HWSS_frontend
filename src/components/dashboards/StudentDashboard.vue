<template>
  <div class="container d-flex align-items-center justify-content-center min-vh-100">
    <div class="row row-cols-1 row-cols-md-2 g-4">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <LandingDashboardCard :userName="userName" />
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <ContactDetailCard />
          </div>
        </div>
      </div>
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <ImageCard />
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="container">
            <PemaResponseServicesCard />
          </div>

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
import ContactDetailCard  from "@/components/dashboards/dashboardCard/ContactDetailCard.vue";
import LandingDashboardCard from '@/components/dashboards/dashboardCard/LandingDashboardCard.vue';
import ImageCard from '@/components/dashboards/dashboardCard/ImageCard.vue';
import PemaResponseServicesCard from '@/components/dashboards/dashboardCard/PemaResponseServicesCard.vue';

const router = useRouter();

const userDetails = ref(null);
const agencyDetails = ref(null);
const userName = ref('');

// Function to fetch user details and agency details
const fetchUserAndAgencyDetails = async () => {
  try {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('Authentication token not found. Redirecting to login.');
      router.push('/login');
      return;
    }

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

      // getUsername();
      console.log('User details fetched successfully:', userDetails.value);
      console.log('Agency details fetched successfully:', agencyDetails.value);
    } else {
      console.error('Error: Incomplete user or agency details in response');
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
  }
};

fetchUserAndAgencyDetails();

</script>

  
<style scoped></style>
