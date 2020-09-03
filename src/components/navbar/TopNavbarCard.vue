<template>
  <nav class="navbar navbar-expand-lg">
    <div class="container-fluid">
      <!-- Navbar brand -->
      <a class="navbar-brand" href="#">
        <span class="brand-text">The PEMA HWSS</span>
      </a>

      <!-- Navbar toggler -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
        aria-controls="navbarContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navbar content -->
      <div class="collapse navbar-collapse justify-content-end" id="navbarContent">
        <ul class="navbar-nav align-items-center">
          <!-- Home icon -->
          <li class="nav-item">
            <router-link class="nav-link nav-icon" :to="homePath" v-b-tooltip.hover title="Home">
              <i class="fas fa-home"></i>
            </router-link>
          </li>

          <!-- Notifications -->
          <li class="nav-item dropdown">
            <a
              class="nav-link nav-icon position-relative"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              v-b-tooltip.hover
              title="Notifications"
              @click="handleDropdownToggle(true)"
            >
              <i class="fas fa-bell"></i>
              <span v-if="unreadNotificationsCount > 0" class="notification-badge">
                {{ unreadNotificationsCount }}
              </span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end notification-dropdown">
              <li
                v-for="notification in notifications"
                :key="notification.id"
                class="dropdown-item-container"
              >
                <div
                  class="notification-item d-flex"
                  :class="{ unread: notification.notification_status === 'unread' }"
                >
                  <div class="notification-content flex-grow-1">
                    <p class="notification-message">{{ notification.notification }}</p>
                    <small class="notification-time">{{
                      formatTimestamp(notification.created_at)
                    }}</small>
                  </div>
                  <button
                    v-if="notification.notification_status === 'unread'"
                    class="mark-read-btn"
                    @click.stop="markAsRead(notification.id)"
                    v-b-tooltip.hover
                    title="Mark as read"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                </div>
              </li>
              <li v-if="notifications.length === 0">
                <span class="dropdown-item text-muted">No notifications</span>
              </li>
            </ul>
          </li>

          <!-- User menu -->
          <li class="nav-item dropdown ms-3">
            <a
              class="nav-link dropdown-toggle d-flex align-items-center"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                :src="profilePictureUrl"
                alt="User"
                class="rounded-circle me-2"
                width="32"
                height="32"
              />
              <span class="d-none d-lg-inline user-name">{{ fullName }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end user-dropdown">
              <li>
                <span class="dropdown-item disabled user-role">
                  <i class="fas fa-user me-2"></i>{{ formattedUserRole }}
                </span>
              </li>
              <li>
                <router-link class="dropdown-item" :to="settingsPath">
                  <i class="fas fa-cog me-2"></i>Settings
                </router-link>
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>
              <li>
                <a class="dropdown-item logout-item" href="#" @click="logout">
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import { useUserDetailsStore } from '@/stores/userDetails'
import { useProgressStore } from '@/stores/progressStore'
import apiClient from '@/apiClient'
import endpoints from '@/api'
import Swal from 'sweetalert2'
import profileIcon from '@/assets/images/icon.png'

const router = useRouter()
const userDetailsStore = useUserDetailsStore()

const notifications = ref([])
const isNotificationOpen = ref(false)

// Computed property for unread notifications count
const unreadNotificationsCount = computed(
  () => notifications.value.filter((n) => n.notification_status === 'unread').length
)

// Function to fetch notifications
const fetchNotifications = async () => {
  try {
    const userId = userDetailsStore.user.id
    const response = await apiClient.get(`${endpoints.getNotifications}${userId}/`)
    notifications.value = response.data.notifications.sort((a, b) => {
      // Sort by status (unread first) and then by date
      if (a.notification_status === b.notification_status) {
        return new Date(b.created_at) - new Date(a.created_at)
      }
      return a.notification_status === 'unread' ? -1 : 1
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
  }
}

// Function to mark notification as read
const markAsRead = async (notificationId) => {
  try {
    await apiClient.post(endpoints.markNotificationAsRead, {
      notification_id: notificationId
    })
    // Update local notification status immediately
    const notification = notifications.value.find((n) => n.id === notificationId)
    if (notification) {
      notification.notification_status = 'read'
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

const formattedUserRole = computed(() => {
  return userRole.value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

const handleDropdownToggle = (isOpen) => {
  isNotificationOpen.value = isOpen
}

// Format timestamp using date-fns
const formatTimestamp = (timestamp) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
}

// Fetch notifications when component mounts
onMounted(() => {
  fetchNotifications()
})

const fullName = computed(() => {
  const { firstName, middleName, lastName } = userDetailsStore.user
  return `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim()
})

const userRole = computed(() => userDetailsStore.user.role || 'User')

const profilePictureUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL || ''
  return userDetailsStore.user.profilePicture
    ? baseUrl + userDetailsStore.user.profilePicture
    : profileIcon
})

const logout = async () => {
  const progressStore = useProgressStore()
  progressStore.resetStore()

  try {
    const response = await apiClient.post(endpoints.logOutUser)
    if (response.data.message === 'Logout successful') {
      localStorage.clear()
      sessionStorage.clear()
      userDetailsStore.clearUserDetails()

      await Swal.fire({
        title: 'Logged Out',
        text: 'You have been successfully logged out of the system.',
        icon: 'success',
        showConfirmButton: false,
        timer: 1200
      })

      router.push('/login')
    } else {
      throw new Error(response.data.message)
    }
  } catch (error) {
    console.error('Logout failed:', error)
    await Swal.fire({
      title: 'Error',
      text: 'Logout failed. Please try again.',
      icon: 'error',
      confirmButtonText: 'OK'
    })
  }
}

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
    cecd_admin: 'admin-dashboard'
  }

  const role = userDetailsStore.user.role?.toLowerCase()
  return { name: dashboardRoutes[role] || 'public-dashboard' } // Default to public dashboard if no match
})

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
    cecd_admin: 'admin-dashboard/admin-setting'
  }

  const role = userDetailsStore.user.role?.toLowerCase()
  return { path: `/${settingsRoutes[role]}` || '/public-dashboard/public-settings' } // Default if no match
})
</script>

<style scoped>
.brand-text {
  color: #1d4851;
  font-weight: 700;
  font-size: 1.2rem;
}

.nav-link {
  color: #1d4851;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: #64ac99;
}

.nav-icon {
  font-size: 1.2rem;
  padding: 0.5rem;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ff4757;
  color: white;
  border-radius: 50%;
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
}

.notification-dropdown {
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  right: 0;
  left: auto;
  /* Add these new properties */
  position: absolute;
  max-width: calc(100vw - 20px);
  /* Prevent overflow on mobile */
  transform-origin: top right;
  margin-top: 10px;
}

.notification-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mark-read-btn {
  background: none;
  border: none;
  color: #2b656f;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.mark-read-btn:hover {
  background-color: #e9ecef;
  color: #1d4851;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #e9ecef;
}

.notification-sender {
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.notification-message {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.2rem;
  word-wrap: break-word;
  /* Add this */
  white-space: normal;
  /* Add this */
  line-height: 1.4;
  /* Add this for better readability */
}

@media (max-width: 576px) {
  .notification-dropdown {
    width: calc(100vw - 20px);
    position: fixed;
    top: 60px;
    /* Adjust based on your navbar height */
    right: 10px;
  }

  .notification-item {
    padding: 0.5rem;
  }
}

.nav-item.dropdown {
  position: relative;
}

.dropdown-item {
  white-space: normal;
  width: 100%;
}

.notification-content {
  padding: 8px 0;
  width: 100%;
  max-width: 100%;
}

.notification-time {
  font-size: 0.8rem;
  color: #adb5bd;
}

.notification-item.unread {
  background-color: #f0f7ff;
}

.notification-item.unread .notification-message {
  font-weight: 600;
}

.notification-time {
  display: block;
  margin-top: 4px;
  color: #666;
  font-size: 0.8rem;
}

.user-dropdown {
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.user-name {
  font-weight: 600;
}

.user-role {
  font-weight: 600;
  color: #2b656f;
}

.logout-item {
  color: #ff4757;
}

.logout-item:hover {
  background-color: #ffe5e5;
}

@media (max-width: 991px) {
  .navbar-nav {
    flex-direction: row;
  }

  .nav-item {
    padding: 0 0.5rem;
  }
}
</style>