<template>
  <div :class="{ sidebar: true, 'sidebar-open': sidebarStore.isOpen }">
    <!-- User Profile Section -->
    <div class="user-profile text-center">
      <div class="profile-image-container">
        <img :src="profilePictureUrl" alt="User" :class="profilePicClass" />
        <span class="status-indicator online"></span>
      </div>
      <transition name="fade">
        <div v-if="sidebarStore.isOpen" class="user-info">
          <h5 class="user-name">{{ fullName }}</h5>
          <small class="user-role">{{ userType }}</small>
        </div>
      </transition>
    </div>

    <!-- Menu Items -->
    <div class="menu-wrapper">
      <div class="menu-background"></div>
      <nav class="menu-items">
        <template v-for="(menu, index) in filteredMenus" :key="index">
          <router-link
            :to="menu.route"
            class="menu-link"
            :class="{ active: $route.path === menu.route }"
            v-b-tooltip.hover.right="{ title: menu.text, disabled: sidebarStore.isOpen }"
          >
            <span class="link-content">
              <i :class="menu.iconClass" class="link-icon"></i>
              <span class="link-text" v-if="sidebarStore.isOpen">{{ menu.text }}</span>
            </span>
            <div class="curve-effect"></div>
          </router-link>
        </template>
      </nav>
    </div>

    <!-- Footer Section -->
    <div class="sidebar-footer">
      <router-link
        to="#"
        class="menu-link logout-link"
        @click="logout"
        v-b-tooltip.hover.right="{ title: 'Log Out', disabled: sidebarStore.isOpen }"
      >
        <span class="link-content">
          <i class="fas fa-sign-out-alt link-icon"></i>
          <span class="link-text" v-if="sidebarStore.isOpen">Log Out</span>
        </span>
      </router-link>

      <button
        class="menu-link toggle-btn d-none"
        @click="toggle"
        v-b-tooltip.hover.right="{
          title: sidebarStore.isOpen ? 'Collapse' : 'Expand',
          disabled: sidebarStore.isOpen
        }"
      >
        <span class="link-content">
          <i
            :class="[sidebarStore.isOpen ? 'fas fa-chevron-left' : 'fas fa-chevron-right']"
            class="link-icon"
          ></i>
          <span class="link-text" v-if="sidebarStore.isOpen">Collapse</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useUserDetailsStore } from '@/stores/userDetails'
import { useProgressStore } from '@/stores/progressStore'
import deFaultProfilePic from '@/assets/images/icon.png'
import Swal from 'sweetalert2'

const router = useRouter()
const sidebarStore = useSidebarStore()
const userDetailsStore = useUserDetailsStore()

// Static menu definitions
const menuConfig = {
  student: [
    { text: 'Dashboard', route: '/student-dashboard', iconClass: 'fas fa-tachometer-alt' },
    {
      text: 'Screening',
      route: '/student-dashboard/screening',
      iconClass: 'fas fa-question-circle'
    },
    { text: 'Profile', route: '/student-dashboard/profile', iconClass: 'fas fa-user' }
  ],
  counselor: [
    { text: 'Dashboard', route: '/counselor-dashboard', iconClass: 'fas fa-tachometer-alt' },
    {
      text: 'Screening',
      route: '/counselor-dashboard/counselor-screening',
      iconClass: 'fa-solid fa-person-circle-question'
    },
    {
      text: 'Monitor',
      route: '/counselor-dashboard/counselor-monitor',
      iconClass: 'fa-solid fa-clipboard-list'
    },
    {
      text: 'Reports',
      route: '/counselor-dashboard/counselor-reports',
      iconClass: 'fa-solid fa-file-waveform'
    },
    {
      text: 'Help',
      route: '/counselor-dashboard/counselor-help',
      iconClass: 'fa-solid fa-circle-question'
    },
    {
      text: 'Settings',
      route: '/counselor-dashboard/counselor-settings',
      iconClass: 'fa-solid fa-gear'
    }
  ],

  gyalsung_counselor: [
    { text: 'Dashboard', route: '/gyalsung-dashboard', iconClass: 'fas fa-tachometer-alt' },
    { text: 'Register', route: '/gyalsung-dashboard/register', iconClass: 'fa-solid fa-user-plus' },
    {
      text: 'Gyalsung Screening',
      route: '/gyalsung-dashboard/gyalsung-screening',
      iconClass: 'fa-solid fa-circle-question'
    },
    {
      text: 'Reports',
      route: '/gyalsung-dashboard/reports',
      iconClass: 'fa-solid fa-file-waveform'
    }
  ],

  admin: [
    { text: 'Dashboard', route: '/admin-dashboard', iconClass: 'fas fa-tachometer-alt' },
    {
      text: 'Approval',
      route: '/admin-dashboard/admin-approval',
      iconClass: 'fa-regular fa-thumbs-up'
    },
    {
      text: 'Reports',
      route: '/admin-dashboard/admin-report',
      iconClass: 'fa-regular fa-file-lines'
    },
    {
      text: 'Help',
      route: '/admin-dashboard/admin-help',
      iconClass: 'fa-regular fa-circle-question'
    },
    {
      text: 'Settings',
      route: '/admin-dashboard/admin-settings',
      iconClass: 'fa-solid fa-screwdriver-wrench'
    }
  ],
  limited_admin: [
    { text: 'Dashboard', route: '/admin-dashboard', iconClass: 'fas fa-tachometer-alt' },
    {
      text: 'Reports',
      route: '/admin-dashboard/admin-report',
      iconClass: 'fa-regular fa-file-lines'
    },
    {
      text: 'Help',
      route: '/admin-dashboard/admin-help',
      iconClass: 'fa-regular fa-circle-question'
    },
    {
      text: 'Settings',
      route: '/admin-dashboard/admin-settings',
      iconClass: 'fa-solid fa-screwdriver-wrench'
    }
  ],
  rnd_limited_admin: [
    { text: 'Dashboard', route: '/admin-dashboard', iconClass: 'fas fa-tachometer-alt' },
    {
      text: 'Help',
      route: '/admin-dashboard/admin-help',
      iconClass: 'fa-regular fa-circle-question'
    },
    {
      text: 'Settings',
      route: '/admin-dashboard/admin-settings',
      iconClass: 'fa-solid fa-screwdriver-wrench'
    }
  ]
}

const fullName = computed(() => {
  const { firstName, middleName, lastName } = userDetailsStore.user
  return `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim()
})

const profilePicture = computed(() => userDetailsStore.user.profilePicture)

const userType = computed(() => {
  const role = userDetailsStore.user.role || 'User' // Get raw role

  // Optional: Keep the Administrator override if you like it
  if (role.toLowerCase().includes('admin')) {
    return 'Administrator'
  }

  // Apply the same formatting logic as the Topbar
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

const filteredMenus = computed(() => {
  const role = String(userDetailsStore.user?.role ?? '').toLowerCase()

  // Special handling for CECD_ADMIN
  if (role === 'cecd_admin') {
    return menuConfig.limited_admin
  }

  // Special handling for RD_ADMIN
  if (role === 'rd_admin') {
    return menuConfig.rnd_limited_admin
  }

  // Regular role-based menu selection
  if (role === 'student') return menuConfig.student

  // if (role === 'gyalsung_clinical_counselor' || role === 'gyalsung_counselor')
  //   return menuConfig.gyalsung_counselor

  if (role.includes('counselor') || role.includes('trained')) return menuConfig.counselor
  //   if (role.includes('counselor') || role.includes('trained')) return menuConfig.gyalsung_counselor
  if (role.includes('admin')) return menuConfig.admin

  return [] // Default empty menu if no role matches
})

const profilePicClass = computed(() => {
  return sidebarStore.isOpen ? 'profile-pic' : 'mini-profile-pic'
})

const profilePictureUrl = computed(() => {
  const baseUrl =
    window.location.hostname === 'localhost' && window.location.port === '5173'
      ? 'http://localhost:8000'
      : 'https://thepemasystem.gov.bt'
  return profilePicture.value ? baseUrl + profilePicture.value : deFaultProfilePic
})

const toggle = () => {
  sidebarStore.toggle()
}

const logout = async () => {
  const progressStore = useProgressStore()
  if (progressStore) {
    progressStore.resetStore()
  }

  try {
    if (localStorage) {
      for (let key in localStorage) {
        if (!key.startsWith('userScreenedToday_')) {
          localStorage.removeItem(key)
        }
      }
    }
    if (sessionStorage) {
      sessionStorage.clear()
    }
    if (userDetailsStore) {
      userDetailsStore.clearUserDetails()
    }

    await Swal.fire({
      title: 'Logged Out',
      text: 'You have been successfully logged out of the system.',
      icon: 'success',
      showConfirmButton: false,
      timer: 1200
    })

    router.push('/login')
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
</script>

<style scoped>
.sidebar {
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  width: 4.5rem;
  transition: width 0.3s ease-in-out;
  overflow: hidden;
  z-index: 999;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-open {
  width: 16rem;
}

/* Profile Section */
.user-profile {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-image-container {
  position: relative;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.profile-pic {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  border: 2px solid #cde0c9;
  object-fit: cover;
  transition: all 0.3s ease;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #4caf50;
  border: 2px solid #2c6975;
}

.user-info {
  margin-top: 0.5rem;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #fff;
}

.user-role {
  color: #cde0c9;
  font-size: 0.8rem;
}

/* Menu Section */
.menu-wrapper {
  position: relative;
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.menu-background {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: calc(100% - 4px);
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 16px 0 0 16px;
}

.menu-items {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
}

.menu-link {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 12px 0 0 12px;
}

.menu-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.link-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1;
}

.link-icon {
  font-size: 1.2rem;
  min-width: 1.5rem;
  text-align: center;
}

.link-text {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

/* Active Link Styling */
.menu-link.active {
  background-color: #cde0c9;
  color: #2c6975;
  border-radius: 10px;
}

/* Footer Section */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-link {
  margin-bottom: 0.5rem;
}

.toggle-btn {
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
}

/* Scrollbar Styling */
.menu-wrapper::-webkit-scrollbar {
  width: 4px;
}

.menu-wrapper::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.menu-wrapper::-webkit-scrollbar-thumb {
  background: #cde0c9;
  border-radius: 4px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
