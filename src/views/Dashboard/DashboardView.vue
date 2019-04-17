<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Sidebar -->
      <aside class="col-lg-2 col-md-2 col-sm-12 px-0" :class="{ 'sidebar-open': sidebarOpen }">
        <SideNavbar :sidebarActive="sidebarOpen" @toggleSidebar="toggleSidebar" />
      </aside>

      <!-- Main Content with Top Navbar -->
      <main class="col-lg-10 col-md-10 col-sm-12">
        <!-- Top Navbar -->
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-12 mb-4 mt-3 card bg-light"
              v-if="currentComponent === CounsellorDashboard || currentComponent === AdminDashboard">
              <TopNavbarCard />
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="row">
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
import PublicDashboard from '@/components/dashboards/PublicDashboard.vue';
import CounsellorDashboard from '@/components/dashboards/CounsellorDashboard.vue';
import AdminDashboard from '@/components/dashboards/AdminDashboard.vue';
import { useUserDetailsStore } from '@/stores/userDetails';
import TopNavbarCard from '@/components/navbar/TopNavbarCard.vue';

const sidebarOpen = ref(false);


const userDetailsStore = useUserDetailsStore();

const currentComponent = computed(() => {
  const role = userDetailsStore.user.role.toLowerCase().replace(/\s+/g, '-');

  switch (role) {
    case 'student':
      return StudentDashboard;
    case 'school_counselor':
      return CounsellorDashboard;
    case 'clinical_counselor':
      return CounsellorDashboard;
    case 'trained_professional':
      return CounsellorDashboard;
    case 'mh_admin':
      return AdminDashboard;
    case 'sud_admin':
      return AdminDashboard;
    case 'aaa_admin':
      return AdminDashboard;
    case 'rd_admin':
      return AdminDashboard;
    default:
      return PublicDashboard;
  }
});


const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

</script>



<style scoped>
/* exampe css */
</style>