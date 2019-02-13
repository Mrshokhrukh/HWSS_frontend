<template>
  <div :class="{ 'sidebar': true, 'sidebar-open': sidebarStore.isOpen }">

    <!-- User Profile Section -->
    <div class="user-profile text-center" v-if="sidebarStore.isOpen">
      <img :src="profilePictureUrl" alt="User" class="profile-pic mb-2">
      <h5 class="user-name mb-0">{{ userName }}</h5>
    </div>

    <!-- Menu Items -->
    <div>
      <nav class="menu-items">
        <router-link v-for="(menu, index) in menus" :key="index" :to="menu.route" class="side-btn"
          :class="{ 'active': $route.path === menu.route }" v-b-tooltip.hover.bottom="menu.text">
          <i :class="menu.iconClass"></i>
          <span class="link-text" v-if="sidebarStore.isOpen">{{ menu.text }}</span>
        </router-link>
      </nav>
    </div>

    <!-- Logout and Toggle Icon -->
    <div class="logout mt-auto p-0">
      <router-link to="#" class="side-btn" @click="logout">
        <i class="fas fa-sign-out-alt"></i>
        <span class="link-text" v-if="sidebarStore.isOpen">Log Out</span>
      </router-link>
      <router-link to="#" class="side-btn" @click="toggle">
        <i :class="[sidebarStore.isOpen ? 'fas fa-chevron-left' : 'fas fa-chevron-right']"></i>
        <span class="link-text" v-if="sidebarStore.isOpen">Collapse</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import endpoints from '@/api';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useUserDetailsStore } from '@/stores/userDetails'; // Import the userDetails store

const router = useRouter();
const sidebarStore = useSidebarStore();
const userDetailsStore = useUserDetailsStore(); // Use the userDetails store

// Use computed properties to access user details and role from the store
const userName = computed(() => userDetailsStore.fullName); // Adjusted based on the updated store
const profilePicture = computed(() => userDetailsStore.profilePicture);
const userType = computed(() => userDetailsStore.userRole); // Now using computed property

sidebarStore.initializeSidebarState();

// Function to toggle the sidebar, now updates the Pinia store
const toggle = () => {
  sidebarStore.toggle();
};

// Function to logout the user
const logout = async () => {
  try {
    const response = await axios.post(endpoints.logOutUser);
    if (response.data.message === 'Logout successful') {
      localStorage.clear();
      // Clear user details from the store
      userDetailsStore.clearUserDetails();
      alert('You have been successfully logged out of the System');
      router.push('/login');
    } else {
      console.error('Logout failed:', response.data.message);
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

// Adjust menu items data to use userType from the store
const menus = computed(() => {
  let baseRoute = `/${userType.value}-dashboard`; // Adjusted to use userType.value
  let menuItems = [
    { text: 'Dashboard', route: baseRoute, iconClass: 'fas fa-chart-bar' },
    { text: 'Profile', route: `${baseRoute}/profile`, iconClass: 'fas fa-user' },
  ];

  if (userType.value === 'student') {
    menuItems.push({ text: 'Screening', route: `${baseRoute}/screening`, iconClass: 'fas fa-question-circle' });
  } else if (userType.value === 'admin') {
    menuItems.push({ text: 'Settings', route: `${baseRoute}/settings`, iconClass: 'fas fa-cog' });
  }

  return menuItems;
});

const profilePictureUrl = computed(() => {
  const isLocalhost5173 = window.location.hostname === 'localhost' && window.location.port === '5173';
  const baseUrl = isLocalhost5173 ? 'http://localhost:8000' : 'http://172.30.3.5';

  const defaultImageUrl = '/assets/images/icon.png';
  return profilePicture.value ? baseUrl + profilePicture.value : defaultImageUrl;
});
</script>


<style scoped>
.sidebar {
  background-color: #2c6975;
  color: white;
  transition: width 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: 3rem;
}

.sidebar-open {
  width: 100%;
}

.user-profile {
  background-color: #2c6975;
  padding: 1rem 0;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  height: auto;
}

.profile-pic {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 5px solid white;
  object-fit: cover;
  object-position: top;
  margin: 10px auto
}

.user-name {
  color: white;
  font-size: 1rem;
}

.menu-items {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.side-btn {
  display: flex;
  align-items: center;
  padding: 1rem;
  color: white;
  text-decoration: none;
  transition: background-color 0.3s;
}

.side-btn.active,
.side-btn:hover {
  background-color: #cde0c9;
  color: #2c6975;
  border-radius: 50px 0 0 50px;
}

.side-btn i {
  min-width: 20px;
}

.link-text {
  padding-left: 1rem;
}

.logout {
  padding: 1rem;
}

/* Adjust sidebar width when collapsed */
.sidebar:not(.sidebar-open) {
  width: 50px;
  /* Adjust according to your icon size */
}
</style>
