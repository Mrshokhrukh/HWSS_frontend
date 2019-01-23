<template>
    <div class="app-container">
        <SideNavbar :showSidebar="true" />
        <div class="main-content">
            <RouterView />
            <!-- Use the StudentDashboard component -->
            <StudentDashboard />
        </div>
    </div>
</template>
  
<script setup lang="ts">
import SideNavbar from '@/components/navbar/SideNavbar.vue';
import StudentDashboard from '@/components/StudentDashboard/StudentDashboard.vue';
</script>
<script lang="ts">

</script>

<style scoped>
.app-container {
    display: flex;
    width: 98%;
    /* Set the width to 80% of the viewport */
    margin: 0 auto;
    /* Center the container */
    min-height: 100vh;
    background-color: #f9f9f9;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.main-content {
    flex-grow: 1;
    margin: 1rem;
    background-color: white;
    border-radius: 10px;
    padding: 20px;
    overflow: hidden;
}

@media (max-width: 1200px) {
    .app-container {
        flex-direction: column;
        width: 100%;
        /* Full width on smaller screens */
        margin: 0;
        /* Remove margins on smaller screens */
        max-width: none;
    }

    .main-content {
        order: 2;
        margin-top: 0;
    }
}</style>