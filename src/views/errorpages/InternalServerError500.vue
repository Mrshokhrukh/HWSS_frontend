<template>
    <div class="error-container">
      <h1 class="error-title">500</h1>
      <p class="error-message">Internal Server Error</p>
      <p class="error-description">Oops! Something went wrong on our end. Please try again later or contact support if the issue persists.</p>
      <router-link to="/" class="home-link">Go to Home</router-link>
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f8f9fa;
    text-align: center;
    color: #343a40;
  }
  
  .error-title {
    font-size: 10rem;
    margin: 0;
  }
  
  .error-message {
    font-size: 2rem;
    margin: 1rem 0;
  }
  
  .error-description {
    font-size: 1.2rem;
    margin: 1rem 0;
    max-width: 600px;
  }
  
  .home-link {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: #fff;
    text-decoration: none;
    border-radius: 0.25rem;
    transition: background-color 0.3s;
  }
  
  .home-link:hover {
    background-color: #0056b3;
  }
  </style>
  