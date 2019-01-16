<template>
  <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
    <div class="card text-center">
      <div class="card-body">
        <h5 class="card-title">Welcome to The PEMA Secretariat Health & Wellbeing Screening System</h5>
        <p class="card-text">Choose one of the following to proceed</p>
        <router-link to="/login" class="btn btn-primary m-2">Login</router-link>
        <router-link to="/register" class="btn btn-secondary m-2">Register</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// import { defineComponent } from 'vue';
import { RouterLink } from 'vue-router';

// You can add reactive states, computed properties, or methods here if needed in the future
</script>

<style>
/* Additional styles if needed */
</style>
