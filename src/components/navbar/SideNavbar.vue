<template>
  <div class="sidebar" :class="{ 'is-active': sidebarActive }">
    <!-- User Profile Section -->
    <div class="user-profile text-center">
      <img src="@/assets/images/icon.png" alt="User" class="profile-pic mb-2">
      <h5 class="user-name mb-0">Phurba Thinley</h5>
    </div>

    <!-- Menu Items -->
    <nav class="menu-items">
      <router-link to="/profile" class="side-btn" active-class="active">
        <i class="bi bi-person"></i>
        <span class="link-text ms-2">Profile</span>
      </router-link>
      <router-link to="/dashboard" class="side-btn" active-class="active">
        <i class="bi bi-bar-chart"></i>
        <span class="link-text ms-2">Dashboard</span>
      </router-link>
      <router-link to="/help" class="side-btn" active-class="active">
        <i class="bi bi-question-circle"></i>
        <span class="link-text ms-2">Help</span>
      </router-link>
    </nav>

    <!-- Log Out Button -->
    <div class="logout mt-auto">
      <router-link to="#" class="side-btn">
        <i class="bi bi-box-arrow-right"></i>
        <span class="link-text ms-2">Log Out</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">

const { sidebarActive  }: { sidebarActive: boolean } = defineProps(['sidebarActive']);


</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #2c6975; /* Dark blue background */
  color: white; /* Text color */
  transition: transform 0.3s ease-in-out;
  transform: translateX(0); /* Always visible */
  z-index: 1000;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.user-profile {
  background-color: #2c6975; /* Slightly lighter blue for the header */
  padding: 1rem 0;
}

.profile-pic {
  width: 100px; /* Adjusted size */
  height: 100px; /* Adjusted size */
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
}

.side-btn.active {
  background-color: #E0EBDD; /* Active state background */
}

.side-btn i {
  min-width: 20px; /* Ensures icons align */
}

.link-text {
  padding-left: 1rem; /* Space between icon and text */
}

.logout {
  padding: 1rem;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    transform: translateX(-100%);
  }

  .sidebar.is-active {
    transform: translateX(0);
  }
}
</style>