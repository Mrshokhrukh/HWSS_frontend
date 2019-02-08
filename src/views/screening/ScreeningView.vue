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
            <!-- ScreeningTest Component -->
            <div class="col-12">
              <ScreeningTest />
            </div>
          </div>
        </main>
      </div>
    </div>
  </template>

<script setup>
import SideNavbar from '@/components/navbar/SideNavbar.vue';
import ScreeningTest from '@/components/screenings/ScreeningTest.vue'; // Import ScreeningTest component
</script>