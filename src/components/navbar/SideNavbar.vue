<template>
  <div :class="{ 'sidebar': true, 'sidebar-open': sidebarActive }">

    <!-- User Profile Section -->
    <div class="user-profile text-center" v-if="sidebarActive">
      <img src="@/assets/images/icon.png" alt="User" class="profile-pic mb-2">
      <h5 class="user-name mb-0">{{ userName }}</h5>
    </div>

    <!-- Menu Items -->
    <div>
      <nav class="menu-items">
        <router-link v-for="(menu, index) in menus" :key="index" :to="menu.route" class="side-btn"
                     :class="{ 'active': $route.path === menu.route }"
                     v-b-tooltip.hover.bottom="menu.text">
          <i :class="menu.iconClass"></i>
          <span class="link-text" v-if="sidebarActive">{{ menu.text }}</span>
        </router-link>
      </nav>
    </div>

    <!-- Logout and Toggle Icon -->
    <div class="logout mt-auto p-0">
      <router-link to="#" class="side-btn" @click="logout">
        <i class="fas fa-sign-out-alt"></i>
        <span class="link-text" v-if="sidebarActive">Log Out</span>
      </router-link>
      <router-link to="#" class="side-btn" @click="toggle">
        <i :class="[sidebarActive ? 'fas fa-chevron-left' : 'fas fa-chevron-right']"></i>
        <span class="link-text" v-if="sidebarActive">Collapse</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios'
import endpoints from '@/api';

const router = useRouter();
// Define props and emits
const { sidebarActive, userName } = defineProps(['sidebarActive', 'userName']);
const emits = defineEmits(['toggleSidebar']);

// Define toggleSidebar as a ref
const toggleSidebar = ref(false);

// Function to toggle the sidebar
const toggle = () => {
  toggleSidebar.value = !toggleSidebar.value;
  // Emit an event to toggle the sidebar in the parent component
  emits('toggleSidebar');
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

// Menu items data
const menus = ref([
  { text: 'Dashboard', route: '/student-dashboard', iconClass: 'fas fa-chart-bar' },
  { text: 'Profile', route: '/profile', iconClass: 'fas fa-user' },
  { text: 'Screening', route: '/help', iconClass: 'fas fa-question-circle' }
]);
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #2c6975;
  color: white;
  transition: width 0.3s ease-in-out;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.sidebar-open {
  width: 250px;
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
  border: 0px solid white;
  object-fit: cover;
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
