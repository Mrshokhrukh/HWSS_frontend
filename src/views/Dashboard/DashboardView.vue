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
import { ref, computed } from 'vue';
import SideNavbar from '@/components/navbar/SideNavbar.vue';
import StudentDashboard from '@/components/dashboards/StudentDashboard.vue';
import CounsellorDashboard from '@/components/dashboards/CounsellorDashboard.vue';
import AdminDashboard from '@/components/dashboards/AdminDashboard.vue';
import { useUserDetailsStore } from '@/stores/userDetails';

const sidebarOpen = ref(false);


const userDetailsStore = useUserDetailsStore();

const currentComponent = computed(() => {
  const role = userDetailsStore.user.role;

  console.log(role);

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
</script>



<style scoped>
/* Add any additional styles if needed */
</style>
