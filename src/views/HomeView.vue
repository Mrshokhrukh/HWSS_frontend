

<template>
  <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
    <div class="container-fluid">
      <div class="mb-3">
        <div class="row g-0">
          <div class="col-md-3 rounded">
            <img src="../assets/images/girl.svg" style="height: 100%;" class="img-fluid rounded-end rounded" alt="...">
          </div>
          <div class="col-md-6 d-flex justify-content-center align-items-center mb-10">
            <div class="card-body">
              <h1 class="card-title display-3 fw-bold mb-4 greentext text-center"> The PEMA</h1>
              <h2 class="card-text display-5 fw-bold mb-5 greentext text-center">Health & Wellbeing Screening <br class="d-sm-none">System</h2>
              <div class="d-flex justify-content-center">
                <router-link to="/login" class="btn m-2 btn-lg custom-button rounded">Sign In</router-link>
                <router-link to="/register" class="btn m-2 btn-lg custom-button rounded">Sign Up</router-link>
              </div>
            </div>
          </div>
          <div class="col-md-3">
                  <img src="../assets/images/boy.svg" style="height: 100%;" class="img-fluid rounded-end rounded" alt="...">
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
  background-image: url('src/assets/images/thePemabg2.png');
  background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    background-color: rgba(43, 101, 111, 0.2);
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