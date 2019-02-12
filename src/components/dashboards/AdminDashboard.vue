<template>
    <div class="container">
        <h1 class="text-center mb-5 mt-3"> Hi {{ userName }}, Welcome to to your dashboard! </h1>
    </div>
    <div class="container">
        <div class="row justify-content-center my-5">
            <div class="col-md-6">
                <ProfileCard :userDetails="userDetails" :agencyDetails="agencyDetails" />
            </div>
        </div>
        <div class="row justify-content-center">
            <button class="btn btn-danger" @click="logout">Logout</button>
        </div>
    </div>
</template> 

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import ProfileCard from '@/components/dashboards/dashboardCard/ProfileCard.vue';
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

// onMounted(async () => {
//     try {
//         const authToken = localStorage.getItem('authToken');

//         const response = await axios.get(endpoints.getUserDetails, {
//             headers: {
//                 Authorization: `Token ${authToken}`,
//             },
//         });

//         const data = response.data;

//         // Check if both user and agency details are present in the response
//         if (data.user && data.agency) {
//             sessionStorage.setItem('userDetails', JSON.stringify(data.user));
//             sessionStorage.setItem('agencyDetails', JSON.stringify(data.agency));

//             userDetails.value = data.user;
//             agencyDetails.value = data.agency;

//             getUsername();
//         } else {
//             console.error('Error: Incomplete user or agency details in response');
//         }
//     } catch (error) {
//         console.error('Error fetching user details:', error);
//     }
// });

// Function to logout the user
const logout = async () => {
    try {
        const response = await axios.post(endpoints.logOutUser);
        if (response.data.message === 'Logout successful') {
            sessionStorage.removeItem('userDetails');
            sessionStorage.removeItem('agencyDetails');
            sessionStorage.removeItem('userAgencyDetails');
            sessionStorage.removeItem('userRole');
            localStorage.removeItem('authToken');
            router.push('/login');
        } else {
            console.error('Logout failed:', response.data.message);
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
};
getUsername()
</script>


<style scoped>
</style>
