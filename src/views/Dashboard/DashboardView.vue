<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Sidebar -->
      <aside class="col-lg-2 col-md-2 col-sm-12 px-0" :class="{ 'sidebar-open': sidebarOpen }">
        <SideNavbar :sidebarActive="sidebarOpen" @toggleSidebar="toggleSidebar" />
      </aside>

      <!-- Main Content with Top Navbar -->
      <main class="col-10">
        <!-- Top Navbar -->
        <div class="container-fluid">
          <div class="row">
            <div class="col-12 mb-4 mt-3 card bg-light"
              v-if="currentComponent === CounsellorDashboard || currentComponent === AdminDashboard">
              <TopNavbarCard />
            </div>
            <div class="col-12 mb-4"
              v-if="currentComponent === StudentDashboard || currentComponent === PublicDashboard">
              <HelplineServices />
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
import { useUserDetailsStore } from '@/stores/userDetails';

// Components
import SideNavbar from '@/components/navbar/SideNavbar.vue';
import StudentDashboard from '@/components/dashboards/StudentDashboard.vue';
import PublicDashboard from '@/components/dashboards/PublicDashboard.vue';
import CounsellorDashboard from '@/components/dashboards/CounsellorDashboard.vue';
import AdminDashboard from '@/components/dashboards/AdminDashboard.vue';
import TopNavbarCard from '@/components/navbar/TopNavbarCard.vue';
import HelplineServices from "@/components/dashboards/screenings/screeningCards/HelplineServices.vue";

// Refs
const sidebarOpen = ref(false);
// Store
const userDetailsStore = useUserDetailsStore();

// Computed
const currentComponent = computed(() => {
  const role = userDetailsStore.user.role.toLowerCase().replace(/\s+/g, '-');

  switch (role) {
    case 'student':
      return StudentDashboard;
    case 'school_counselor':
    case 'clinical_counselor':
    case 'gyalsung_counselor':
    case 'trained_professional':
      return CounsellorDashboard;
    case 'mh_admin':
    case 'sud_admin':
    case 'aaa_admin':
    case 'rd_admin':
      return AdminDashboard;
    default:
      return PublicDashboard;
  }
});

// Methods
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

</script>
