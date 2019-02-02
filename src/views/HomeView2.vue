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
    <div class="d-flex justify-content-center align-items-center landingbg" >
      <div class="container">
        <div class="mb-3">
          <div class="row g-0">     
            <div class="col-md-12 d-flex justify-content-center align-items-center  ">
              <div class="card-body text-center">
                <h1 class="card-title display-2 fw-bold mb-10  text-dark"> The PEMA</h1>
                <h2 class="card-text display-6 fw-bold mb-12 text-dark">Health & Wellbeing Screening <br>System</h2>
                <div class="  d-flex justify-content-center">
                  <router-link to="/login" class="btn m-2 btn-lg custom-button  ">Sign In</router-link>
                  <router-link to="/register" class="btn m-2 btn-lg custom-button  ">Sign Up</router-link>
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
  
  
  <style scoped>
  .landingbg{
      background-image: url('src/assets/images/LandingPage2.png'); /* Adjust the path based on your project structure */
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      height: 100vh;
  
  }
  .bold {
      font-weight: bold;
     
    }

  .custom-button {
      background-color:white !important;
      color: black!important;    
      border-radius: 20px;
      width: 150px;

    }
  
  
  </style>