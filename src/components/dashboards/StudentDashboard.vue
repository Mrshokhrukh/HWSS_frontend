<template>
  <div class="container-fluid d-flex align-items-center justify-content-center min-vh-100">
    <!-- General Dashboard View -->
    <div v-if="currentRoute === '/student-dashboard'" class="row row-cols-1 row-cols-md-2 g-4">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <LandingDashboardCard :userName="userName" />
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <ContactDetailCard />
          </div>
        </div>
      </div>
      <div class="col-md-8">
        <div class="card m-0 p-0">
          <div class="card-body m-0 p-0">
            <ImageCard />
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="container">
            <PemaResponseServicesCard />
          </div>
        </div>
      </div>
    </div>

    <!-- Screening Dashboard View -->
    <div v-if="currentRoute === '/student-dashboard/screening'" class="screening-dashboard">
      <ScreeningTest />
    </div>
    <!-- Screening Dashboard View -->
    <div v-if="currentRoute === '/student-dashboard/profile'" class="screening-dashboard">
      <StudentProfile />
    </div>
  </div>
</template>

  
<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import ContactDetailCard from "@/components/dashboards/dashboardCard/ContactDetailCard.vue";
import LandingDashboardCard from '@/components/dashboards/dashboardCard/LandingDashboardCard.vue';
import ImageCard from '@/components/dashboards/dashboardCard/ImageCard.vue';
import PemaResponseServicesCard from '@/components/dashboards/dashboardCard/PemaResponseServicesCard.vue';
import ScreeningTest from '@/components/dashboards/screenings/ScreeningTest.vue';
import StudentProfile from '@/components/dashboards/profiles/StudentProfile.vue';

const userName = ref('');
const route = useRoute();

const currentRoute = computed(() => route.path);
</script>


  
<style scoped></style>
