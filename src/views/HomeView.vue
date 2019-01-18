<!-- <template>
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
import { RouterLink } from 'vue-router';


</script>

<style>

</style> -->

<template>
  <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
    <div class="container">
      <div class="card mb-3">
        <div class="row g-0">
          <div class="col-md-5 landingimgbg rounded">
            <img src="../assets/images/landingbg.png" class="img-fluid rounded-end rounded float-start" alt="...">
          </div>
          <div class="col-md-7">
            <div class="card-body">
              <h1 class="card-title display-3 fw-bold mb-4 mt-5 greentext"> The PEMA <span class="higtext">Secretariat</span></h1>
              <h2 class="card-text display-5 fw-bold mb-5 greentext">Health & Wellbeing Screening <br class="d-sm-none">System</h2>
              <div class="d-flex justify-content-center">
                <router-link to="/login" class="btn m-2 btn-lg custom-button rounded">Sign In</router-link>
                <router-link to="/register" class="btn m-2 btn-lg custom-button rounded">Sign Up</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';


</script>

<style>
.landingimgbg {
  background-color: #2B656F;
}

.greentext {
  color: #2B656F;
}

.bold {
  font-weight: bold;
}

.higtext {
  color: #69B2A0;
}

.custom-button {
  background-color: #2B656F !important;
  color: #ffffff !important;
  width: 50%;
}
</style>