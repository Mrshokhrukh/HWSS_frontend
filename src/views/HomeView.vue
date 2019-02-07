<template>
  <div class="landingimgbg d-flex justify-content-center align-items-center" style="height: 100vh;">
    <div class="container-fluid">
      <div class="mb-3">
        <div class="row g-0">
          <div>
            <img src="../assets/images/landingpage_toprightcorner.svg" style="height: 100%;" class="top-right-image" alt="...">
          </div>
          <div class="col-md-6 d-flex justify-content-center align-items-center mb-10">
            <div class="card-body">
              <p class="quote">"Touching People, Building Lives"</p>
              <p class="thepema fw-bold mb-4 blacktext text-center"> The PEMA</p>
              <p class="hwss fw-bold mb-5 bluetext text-center">Health & Wellbeing Screening <br
                  class="d-sm-none"> <br> System</p>
              <div class="getstarted_div d-flex justify-content-center">
                <router-link to="/login" class="btn m-2 btn-lg custom-button rounded">Get Started <i class="arrow-right fa-solid fa-arrow-right"></i></router-link>
                <!-- <router-link to="/register" class="btn m-2 btn-lg custom-button rounded">Sign Up</router-link> -->
              </div>
              <div class="lastrow_btns d-flex justify-content-center">
                <router-link to="#" class="btn m-2 btn-lg custom-button-lr rounded">Google Play</router-link>
                <router-link to="#" class="btn m-2 btn-lg custom-button-lr rounded">AppStore</router-link>
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

@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Roboto:wght@300;400;700&family=Sriracha&display=swap');

.landingimgbg {
  position: relative;
  background-color: #ffffff;
  height: 100vh; /* Set the height to cover the entire viewport */
  overflow: hidden; /* Hide any content that overflows */
}

.quote {
  font-size: 2.5rem;
  text-align: center;
  font-family: 'Sriracha', cursive;
  color: #000000;
  font-weight: 300;
  margin-bottom: 50px;
  margin-top: 50px;
}

.thepema {
  font-size: 3.5rem;
  text-align: center;
  font-family: Poppins;
}

.hwss{
  font-size: 1.8rem;
  text-align: center;
  margin-top: -30px;
}

.blacktext {
  color: #000000;
}

.bluetext {
  color: #2B656F;
}

.card-body {
  margin-left: 70px;
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
  width: 28%;
  font-family: 'Roboto', sans-serif;
  text-transform: none;
  font-size: 16px;
  cursor: pointer;
  text-decoration: none;
}

.custom-button-lr {
  background-color: #ffffff !important;
  color: #000000 !important;
  border: #d4cdcd 0.16px solid !important;
  width: 28%;
  font-family: 'Roboto', sans-serif;
  text-transform: none;
  font-size: 16px;
  cursor: pointer;
  text-decoration: none;
}

.getstarted_div {
  margin-top: -20px;
  margin-bottom: 40px;
}

.arrow-right {
  margin-left: 5px;
}

.lastrow_btns {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  display: flex;
  justify-content: center;
}

.lastrow_btns .btn {
  margin: 0 1px; /* Adjust the space between the buttons */
}

.top-right-image {
  position: absolute; /* Position the image absolutely */
  top: 0; /* Place the image at the top */
  right: 0; /* Place the image at the right */
  transform: scale(0.85) translate(10%, -10%); /* Reduce the size of the image by 45% */
  /* You can adjust the scale value to achieve the desired size */
}



</style>

