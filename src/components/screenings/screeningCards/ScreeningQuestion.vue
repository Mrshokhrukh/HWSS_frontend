<template>
  <div class="row container-fluid p-5">
    <div class="col-md-8">
      <h1 class="text-center bold">{{ title }}</h1>
      <p class="custom-font">{{ content }}</p>
      <p class="custom-text-color">{{ disclaimer }}</p>
      <div class="d-flex justify-content-center mt-5">
        <button class="btn btn-primary btn-lg custom-size-btn" @click="continueAction">Continue</button>
      </div>
    </div>
    <div class="col-md-4 text-center">
      <img :src="imageUrl" :alt="imageAlt" class="img-fluid">
    </div>
  </div>
</template>
  
<script setup>
import { ref } from 'vue';
import bookImage from '@/assets/images/book 1.png';
const title = ref('"Your Mental Health Matters"');
const content = ref('Your mental health is important for overall health and wellbeing. It affects how you feel, think, and behave. Good mental health allows you to cope with daily stressors and challenges and enjoy your life. Sometimes, life can get tough, and you may find yourself feeling stressed or sad. These are normal reactions, but sometimes it affects your day-to-day functioning. That is when you need professional support and it is okay to ask for help.');
const disclaimer = ref('Please respond to all the questions. Your responses will help us determine the status of your mental health and safe interventions will be provided as per your need and convenience. Information will be handled with the highest level of integrity and confidentiality.');
const imageUrl = ref(bookImage);
const imageAlt = ref('Health and Well Being');

const continueAction = () => {
  // Define what happens when the user clicks continue.
  // This could change the state, navigate to a new route, etc.
};
</script>
  
<style scoped>
.custom-size-btn {
  width: 100%;
  height: auto;
  font-size: 18px;
  /* Example to increase font size */
  background-color: #2C6975;
}

.custom-text-color {
  color: #2C6975;
  font-weight: 800;
}

.custom-font {
  font-weight: 600;
}
</style>
  