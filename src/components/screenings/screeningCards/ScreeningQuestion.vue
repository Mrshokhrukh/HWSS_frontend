<template>
  <div class="container-fluid p-4">
    <div class="col-md-8">
      <h2 class="text-center mt-5 bold">{{ title }}</h2>
      <p>{{ content }}</p>
      <p class="text-muted">{{ disclaimer }}</p>
      <button class="btn btn-primary" @click="continueAction">Continue</button>
    </div>
    <div class="col-md-4">
      <img :src="imageUrl" :alt="imageAlt" class="img-fluid">
    </div>
  </div>
</template>
  
<script setup>
import { ref } from 'vue';

const title = ref('"Your Mental Health Matters"');
const content = ref('Your mental health is important for overall health and wellbeing. It affects how you feel, think, and behave. Good mental health allows you to cope with daily stressors and challenges and enjoy your life. Sometimes, life can get tough, and you may find yourself feeling stressed or sad. These are normal reactions, but sometimes it affects your day-to-day functioning. That is when you need professional support and it is okay to ask for help.');
const disclaimer = ref('Please respond to all the questions. Your responses will help us determine the status of your mental health and safe interventions will be provided as per your need and convenience. Information will be handled with the highest level of integrity and confidentiality.');
const imageUrl = ref('src/assets/images/book 1.png');
const imageAlt = ref('Health and Well Being');

const continueAction = () => {
  // Define what happens when the user clicks continue.
  // This could change the state, navigate to a new route, etc.
};
</script>
  
<style scoped>
/* Add any specific styling you need here */
</style>
  