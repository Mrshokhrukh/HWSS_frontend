<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Sidebar -->
      <aside class="col-lg-2 col-md-2 col-sm-12 px-0" :class="{ 'sidebar-open': sidebarOpen }">
        <SideNavbar :sidebarActive="sidebarOpen" @toggleSidebar="toggleSidebar" />
      </aside>

      <!-- Main Content -->
      <main class="col-lg-10 col-md-10 col-sm-12">
        <div class="row">
          <!-- Dashboard Component -->
          <div class="col-12">
            <component :is="currentComponent"></component>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import SideNavbar from '@/components/navbar/SideNavbar.vue';
import StudentDashboard from '@/components/dashboards/StudentDashboard.vue';
import CounsellorDashboard from '@/components/dashboards/CounsellorDashboard.vue';
import AdminDashboard from '@/components/dashboards/AdminDashboard.vue';
import axios from 'axios';
import endpoints from '@/api';
import { useRouter } from 'vue-router';
import { useUserDetailsStore } from '@/stores/userDetails';

const router = useRouter();
const sidebarOpen = ref(false);

const age = ref('');
const ageGroup = ref('')

const userDetailsStore = useUserDetailsStore();

const currentComponent = computed(() => {
  const role = userDetailsStore.userRole;

  switch (role) {
    case 'student':
      return StudentDashboard;
    case 'school_counselor':
    case 'clinical_counselor':
      return CounsellorDashboard;
    case 'admin':
      return AdminDashboard;
    default:
      return StudentDashboard;
  }
});

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const fetchUserAndAgencyDetails = async () => {
  try {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      alert('User not Authenticated. Redirecting to login.');
      router.push('/login');
      return; // Stop further execution if not authenticated
    }

    const response = await axios.get(endpoints.getUserDetails, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });

    const { user, agency, userAgency } = response.data;

    // Prepare user details
    const userDetails = {
      age: age,
      ageGroup: ageGroup,
      id: user.id,
      username: user.username,
      isStaff: user.is_staff,
      isActive: user.is_active,
      identityNumber: user.identity_number,
      nationality: user.nationality,
      firstName: user.first_name,
      middleName: user.middle_name,
      lastName: user.last_name,
      dateOfBirth: user.date_of_birth,
      gender: user.gender,
      email: user.email,
      mobNumber: user.mob_number,
      fatherName: user.father_name,
      motherName: user.mother_name,
      permAddVillage: user.perm_add_village,
      permAddGewog: user.perm_add_gewog,
      permAddDzongkhag: user.perm_add_dzongkhag,
      profilePicture: user.profile_picture,
      isGyalsung: user.is_gyalsung,
      academyCode: user.academy_code,
      dateJoined: user.date_joined,
      role: user.role,
      accessLevel: user.access_level,
    };

    // Store the age and age group in session storage
    sessionStorage.setItem('userAge', age.value.toString());
    sessionStorage.setItem('userAgeGroup', ageGroup);

    userDetailsStore.setUserDetails(userDetails, agency, userAgency);

  } catch (error) {
    console.error('Error fetching user details:', error);
  }
};

// Function to calculate age
function calculateAge(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// Function to determine age group according to your specifications
function determineAgeGroup(age) {
  if (age <= 14) return '14 and below';
  if (age >= 15 && age <= 17) return '15 to 17';
  return '18 and above';
}

// Watch for route changes
onMounted(() => {
  fetchUserAndAgencyDetails();
  calculateAge();
  determineAgeGroup();
});
</script>



<style scoped>
/* Add any additional styles if needed */
</style>
