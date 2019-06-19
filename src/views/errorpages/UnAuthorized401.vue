<template>
    <div class="error-container">
      <h1 class="error-title">401</h1>
      <p class="error-message">Unauthorized</p>
      <p class="error-description">You are not authorized to access this page. Please log in and try again.</p>
      <router-link to="/login" class="login-link">Go to Login</router-link>
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
  
  .login-link {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: #fff;
    text-decoration: none;
    border-radius: 0.25rem;
    transition: background-color 0.3s;
  }
  
  .login-link:hover {
    background-color: #0056b3;
  }
  </style>
  