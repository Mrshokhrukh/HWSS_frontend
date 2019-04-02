<template>
  <nav class="navbar navbar-expand-lg">
    <div class="container-fluid">
      <!-- Navbar brand -->
      <a class="navbar-brand hwss-primary" href="#">The PEMA HWSS</a>

      <!-- Navbar toggler -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navbar links -->
      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav d-flex align-items-center">
          <!-- Home icon -->
          <li class="nav-item">
            <router-link class="nav-link" aria-current="page" to="/"><i class="fas fa-home"></i></router-link>
          </li>

          <!-- Notifications using Element UI's dropdown -->
          <li class="nav-item m-3 mb-1">
            <el-dropdown @command="handleNotificationClick">
              <span class="el-dropdown-link">
                <i class="fas fa-bell fa-lg"></i>
                <span class="badge" v-if="notificationsCount > 0">{{ notificationsCount }}</span>
              </span>
              <template v-slot:dropdown>
                <el-dropdown-menu class="notification-dropdown">
                  <el-dropdown-item v-for="(notification, index) in notifications" :key="index">
                    {{ notification }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </li>

          <!-- Profile icon -->
          <li class="nav-item">
            <router-link class="nav-link" to="/profile"><i class="fas fa-user"></i></router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';

// Mock data for notifications
const notifications = ref([
  "Notification 1",
  "Notification 2",
  "Notification 3"
]);

// Compute notifications count
const notificationsCount = computed(() => notifications.value.length);

// Handle notification click
const handleNotificationClick = (command) => {
  // Handle notification click action here
  console.log("Notification clicked:", command);
}
</script>

<style scoped>
.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
}

.navbar-nav .nav-link {
  font-size: 1.2rem;
  margin: 0 15px;
}

.navbar-toggler {
  border: none;
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3e%3cpath stroke='rgba(0, 0, 0, 0.5)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

.badge {
  position: absolute;
  top: -10px;
  right: -20px;
  background-color: #ff4c4c;
  color: #fff;
  border-radius: 50px;
  padding: 5px 7px;
  font-size: 0.8rem;
}

.notification-dropdown {
  min-width: 200px;
}

.navbar {
  box-shadow: none;
}
</style>
