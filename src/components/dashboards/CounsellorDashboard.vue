<template>
    <div class="container vh-100 p-4 ">
    <div class="row ">
      <div class="row col-md-12 mb-5">
        <TopNavbarCard/>
      </div> 
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <QuickToolCard />
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <Screening2023Card />
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <Screening2022Card />
          </div>
        </div>
      </div> 
      <div class="row col-md-12 mt-4">
        <SeverityCountsCard/>
      </div>
      <div class=" col-md-6 mt-4">
        <div class="card">
          <div class="card-body">
            <SuicidalBehaviourCard />
          </div>
        </div>
      </div>

      <div class="mt-4 col-md-6">
        <div class="card">
          <div class="container">
            <GraphCard />
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
    
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import endpoints from '@/api';
import GraphCard from '@/components/dashboards/CounsellorDashboardCard/GraphCard.vue';
import QuickToolCard from '@/components/dashboards/CounsellorDashboardCard/QuickToolCard.vue';
import Screening2022Card from '@/components/dashboards/CounsellorDashboardCard/Screening2022Card.vue';
import Screening2023Card from '@/components/dashboards/CounsellorDashboardCard/Screening2023Card.vue';
import SeverityCountsCard from '@/components/dashboards/CounsellorDashboardCard/SeverityCountsCard.vue';
import SuicidalBehaviourCard from '@/components/dashboards/CounsellorDashboardCard/SuicidalBehaviourCard.vue';
import TopNavbarCard from '@/components/dashboards/CounsellorDashboardCard/TopNavbarCard.vue';

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
// const logout = async () => {
//   // console.log('button click detected')
//   try {
//     const response = await axios.post(endpoints.logOutUser);
//     if (response.data.message === 'Logout successful') {
//       sessionStorage.removeItem('userDetails');
//       sessionStorage.removeItem('agencyDetails');
//       sessionStorage.removeItem('userAgencyDetails');
//       localStorage.removeItem('authToken');
//       router.push('/login');
//     } else {
//       console.error('Logout failed:', response.data.message);
//     }
//   } catch (error) {
//     console.error('Logout failed:', error);
//   }
// };
</script>
    
<style scoped></style>
