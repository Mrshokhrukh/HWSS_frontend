<template>
    <div class="card">
      <div class="card-header">
        Personal Details
      </div>
      <div class="card-body">
        <!-- Example content -->
        <p>Email: {{ userDetails.email }}</p>
        <p>Mobile Number: {{ userDetails.mobNumber }}</p>
        <!-- Add more personal detail fields here -->
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useUserDetailsStore } from '@/stores/userDetails';
  
  const userDetailsStore = useUserDetailsStore();
  const userDetails = ref(userDetailsStore.$state);
  </script>
  