<template>
  <div class="container">
    <div class="row">
      <div class="col-md-8">
        <h1 class="text-center mb-5 mt-3"> Hi {{ userName }}! </h1>
        <h3>Welcome to Mental Health & Well Being Screening!</h3>
        <div class="row justify-content-center">
          <button class="btn custom-btn arrow-button" @click="logout">Screen your mental Health</button>
        </div>
      </div>
      <div class="col-md-4 d-flex align-items-center justify-content-center">
        <img src="@/assets/images/brainicon.png" class="img-fluid" alt="">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const userName = ref('')

const constructUsername = () => {
  const userFullName = JSON.parse(sessionStorage.getItem('userDetails'));

  let userNameFirst = userFullName[0].first_name;
  let userNameLast = userFullName[0].last_name;

  userName.value = `${userNameFirst} ${userNameLast}`
}

onMounted(constructUsername)
</script>


<style scoped>
.custom-btn {
  background-color: #2B656F;
  color: #fff;
  font-size: inherit;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.arrow-button {
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #2B656F;
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.arrow-button::after {
  content: '\2192';
  /* Unicode character for right arrow */
  font-size: 25px;
  font-weight: 800;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  position: absolute;
  right: -10px;
  /* Adjust this value to control the distance of the arrow from the right edge */
}

.arrow-button::before {
  content: '';
  width: 40px;
  /* Adjust the width of the circle */
  height: 40px;
  /* Adjust the height of the circle */
  background-color: #2B656F;
  /* Same as the button background color */
  border-radius: 50%;
  position: absolute;
  right: 0;
  transform: translateX(50%);
  /* Center the circle on the right side */
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #fff;
}
</style>
