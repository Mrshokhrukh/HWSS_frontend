<!-- Modal component template -->
<template>
    <div class="modal">
      <div class="modal-content">
        <span class="close-button" @click="closeModal">&times;</span>
        <!-- Display the selectedButtonData content here -->
        <div v-if="selectedButtonData">
          <h2>{{ selectedButtonData.text }}</h2>
          <p>Count: {{ selectedButtonData.count }}</p>
          <!-- Display other relevant data as needed -->
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const selectedButtonData = ref(null);
  
  const closeModal = () => {
    selectedButtonData.value = null;
  };
  </script>
  
  <!-- Add CSS for modal styling -->
  <style scoped>
  /* CSS styles for the modal */
  </style>
  