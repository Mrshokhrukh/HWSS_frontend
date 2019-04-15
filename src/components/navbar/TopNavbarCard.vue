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

          <!-- Bell icon for notifications -->
          <li class="nav-item m-3 mb-1">
            <div class="notification-icon" @click="showNotifications = !showNotifications">
              <i class="fas fa-bell fa-lg"></i>
              <span v-if="unreadNotificationsCount > 0" class="badge">{{ unreadNotificationsCount }}</span>
            </div>
            <!-- Notification dropdown -->
            <div v-show="showNotifications" class="notification-dropdown">
              <ul>
                <li v-for="(notification, index) in notifications" :key="index">
                  <div class="notification-item" :class="{ 'unread': !notification.read }" @click="handleNotificationClick(notification)">
                    <div>{{ notification.sender }} ({{ notification.senderId }})</div>
                    <div>{{ notification.message }}</div>
                    <div>{{ notification.timestamp }}</div>
                    <Button v-if="!notification.read" icon="pi pi-check" class="mark-read-btn" @click.stop="markNotificationRead(index)"></Button>
                  </div>
                </li>
              </ul>
            </div>
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
import Button from 'primevue/button';

// Mock data for notifications
const notifications = ref([
  {
    sender: 'Sender Name',
    senderId: '123',
    message: 'Notification 1',
    timestamp: '2024-04-14 10:00:00',
    read: false
  },
  {
    sender: 'Another Sender',
    senderId: '456',
    message: 'Notification 2',
    timestamp: '2024-04-14 11:00:00',
    read: false
  }
]);

// Compute unread notifications count
const unreadNotificationsCount = computed(() => notifications.value.filter(notification => !notification.read).length);

// Show/hide notification dropdown
const showNotifications = ref(false);

// Mark notification as read
const markNotificationRead = (index) => {
  notifications.value[index].read = true;
}

// Handle notification click
const handleNotificationClick = (notification) => {
  if (!notification.read) {
    markNotificationRead(notifications.value.indexOf(notification));
  }
  // Additional actions can be performed here, such as displaying the full message
  alert(notification.message);
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

.notification-icon {
  position: relative;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 5px;
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 999;
  display: none;
  min-width: 250px;
  max-height: 300px;
  overflow-y: auto;
}

.notification-dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notification-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.notification-item.unread {
  background-color: #f0f0f0;
}

.notification-item:last-child {
  border-bottom: none;
}

.mark-read-btn {
  margin-left: 1rem;
}

.navbar {
  box-shadow: none;
}
</style>
