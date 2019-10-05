<template>
  <nav class="navbar navbar-expand-lg shadow-none">
    <div class="container-fluid">
      <!-- Navbar brand -->
      <a class="navbar-brand" href="#">
        <span class="ms-2 fw-bold hwss-primary">The PEMA HWSS</span>
      </a>

      <!-- Navbar toggler -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent"
        aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navbar content -->
      <div class="collapse navbar-collapse justify-content-end" id="navbarContent">
        <ul class="navbar-nav align-items-center">
          <!-- Home icon -->
          <li class="nav-item">
            <router-link class="nav-link" :to="homePath" v-b-tooltip.hover title="Home">
              <i class="fas fa-home fa-lg"></i>
            </router-link>
          </li>

          <!-- Notifications -->
          <li class="nav-item dropdown">
            <a class="nav-link position-relative" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false"
              v-b-tooltip.hover title="Notifications">
              <i class="fas fa-bell fa-lg"></i>
              <span v-if="unreadNotificationsCount > 0"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {{ unreadNotificationsCount }}
                <span class="visually-hidden">unread notifications</span>
              </span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end notification-dropdown">
              <li v-for="(notification, index) in notifications" :key="index">
                <a class="dropdown-item notification-item" href="#" :class="{ 'unread': !notification.read }"
                  @click="handleNotificationClick(notification)">
                  <div class="d-flex align-items-center">
                    <div class="flex-shrink-0">
                      <img :src="notification.senderAvatar" alt="Sender Avatar" class="rounded-circle" width="40"
                        height="40">
                    </div>
                    <div class="flex-grow-1 ms-3">
                      <p class="mb-0 fw-bold">{{ notification.sender }}</p>
                      <p class="mb-0 text-muted">{{ notification.message }}</p>
                      <small class="text-muted">{{ formatTimestamp(notification.timestamp) }}</small>
                    </div>
                  </div>
                </a>
              </li>
              <li v-if="notifications.length === 0">
                <span class="dropdown-item text-muted">No notifications</span>
              </li>
              <li>
                <hr class="dropdown-divider">
              </li>
              <li><a class="dropdown-item text-center" href="#">View all notifications</a></li>
            </ul>
          </li>

          <!-- User menu -->
          <li class="nav-item dropdown ms-3">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button"
              data-bs-toggle="dropdown" aria-expanded="false">
              <img :src="profilePictureUrl" alt="User" class="rounded-circle me-2" width="32" height="32">
              <span class="d-none d-lg-inline">{{ fullName }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <span class="dropdown-item disabled">
                  <i class="fas fa-user me-2"></i>{{ formattedUserRole }}
                </span>
              </li>
              <li>
                <router-link class="dropdown-item" :to="settingsPath">
                  <i class="fas fa-cog me-2"></i>Settings
                </router-link>
              </li>
              <li>
                <hr class="dropdown-divider">
              </li>
              <li>
                <a class="dropdown-item text-danger" href="#" @click="logout">
                  <i class="fas fa-sign-out-alt me-2"></i>Logout
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { formatDistanceToNow } from 'date-fns';
import { useUserDetailsStore } from '@/stores/userDetails';
import { useProgressStore } from '@/stores/progressStore';
import axios from 'axios';
import endpoints from '@/api';
import Swal from 'sweetalert2';
import profileIcon from '@/assets/images/icon.png';

const router = useRouter();
const userDetailsStore = useUserDetailsStore();

const notifications = ref([]);

const unreadNotificationsCount = computed(() => notifications.value.filter(n => !n.read).length);

const handleNotificationClick = (notification) => {
  notification.read = true;
};

const formattedUserRole = computed(() => {
  // Replace underscores with spaces and capitalize each word
  return userRole.value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
});

const formatTimestamp = (timestamp) => {
  return formatDistanceToNow(timestamp, { addSuffix: true });
};

const fullName = computed(() => {
  const { firstName, middleName, lastName } = userDetailsStore.user;
  return `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();
});

const userRole = computed(() => userDetailsStore.user.role || 'User');

const profilePictureUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL || '';
  return userDetailsStore.user.profilePicture
    ? baseUrl + userDetailsStore.user.profilePicture
    : profileIcon;
});

const logout = async () => {
  const progressStore = useProgressStore();
  progressStore.resetStore();

  try {
    const response = await axios.post(endpoints.logOutUser);
    if (response.data.message === "Logout successful") {
      localStorage.clear();
      sessionStorage.clear();
      userDetailsStore.clearUserDetails();

      await Swal.fire({
        title: 'Logged Out',
        text: 'You have been successfully logged out of the system.',
        icon: 'success',
        showConfirmButton: false,
        timer: 1200
      });

      router.push("/login");
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error("Logout failed:", error);
    await Swal.fire({
      title: 'Error',
      text: 'Logout failed. Please try again.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
};

const homePath = computed(() => {
  // Define mapping for user role to the respective dashboard route
  const dashboardRoutes = {
    student: 'student-dashboard',
    school_counselor: 'counselor-dashboard',
    gyalsung_counselor: 'counselor-dashboard',
    clinical_counselor: 'counselor-dashboard',
    trained_professional: 'counselor-dashboard',
    mh_admin: 'admin-dashboard',
    rd_admin: 'admin-dashboard',
    sud_admin: 'admin-dashboard',
    aaa_admin: 'admin-dashboard',
    cecd_admin: 'admin-dashboard',
  };

  const role = userDetailsStore.user.role?.toLowerCase();
  return { name: dashboardRoutes[role] || 'public-dashboard' }; // Default to public dashboard if no match
});

const settingsPath = computed(() => {
  // Use the same mapping but add '-settings' to create the settings route
  const settingsRoutes = {
    student: 'student-dashboard/student-settings',
    school_counselor: 'counselor-dashboard/counselor-settings',
    gyalsung_counselor: 'counselor-dashboard/counselor-settings',
    clinical_counselor: 'counselor-dashboard/counselor-settings',
    trained_professional: 'counselor-dashboard/counselor-settings',
    mh_admin: 'admin-dashboard/admin-setting',
    rd_admin: 'admin-dashboard/admin-setting',
    sud_admin: 'admin-dashboard/admin-setting',
    aaa_admin: 'admin-dashboard/admin-setting',
    cecd_admin: 'admin-dashboard/admin-setting',
  };

  const role = userDetailsStore.user.role?.toLowerCase();
  return { path: `/${settingsRoutes[role]}` || '/public-dashboard/public-settings' }; // Default if no match
});

</script>

<style scoped>
.navbar {
  padding: 0.5rem 1rem;
}

.notification-dropdown {
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #e9ecef;
}

.notification-item:last-child {
  border-bottom: none;
}

@media (max-width: 991px) {
  .navbar-nav {
    flex-direction: row;
  }

  .nav-item {
    padding: 0 0.5rem;
  }
}

.dropdown-item.disabled {
  cursor: default;
  pointer-events: none; /* Make it non-clickable */
}

</style>