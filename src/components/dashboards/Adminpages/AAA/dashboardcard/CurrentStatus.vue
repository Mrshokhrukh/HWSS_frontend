<template>
      <h1 class="text-center mt-5 mb-4">Current Status In Bhutan</h1>
  
      <div class="row">
        <div class="col-md-4">
          <div class="card">
            <div class="card-header text-center">
              <h5 class="card-title mb-0">Total Case Ongoing</h5>
            </div>
            <div class="card-body d-flex justify-content-between align-items-center">
              <i class="bi bi-person-circle fs-3 text-primary me-2"></i>
              <p class="card-text fs-4 text-center mb-0">{{ totalCaseOngoing }}</p>
            </div>
          </div>
        </div>
  
        <div class="col-md-4">
          <div class="card">
            <div class="card-header text-center">
              <h5 class="card-title mb-0">Total Case Discontinue</h5>
            </div>
            <div class="card-body d-flex justify-content-between align-items-center">
              <i class="bi bi-person-dash fs-3 text-danger me-2"></i>
              <p class="card-text fs-4 text-center mb-0">{{ totalCaseDiscontinue }}</p>
            </div>
          </div>
        </div>
  
        <div class="col-md-4">
          <div class="card">
            <div class="card-header text-center">
              <h5 class="card-title mb-0">Total Case Closed</h5>
            </div>
            <div class="card-body d-flex justify-content-between align-items-center">
              <i class="bi bi-person-check fs-3 text-success me-2"></i>
              <p class="card-text fs-4 text-center mb-0">{{ totalCaseClosed }}</p>
            </div>
          </div>
        </div>
      </div>
  </template>
  
  <script setup>
  const totalCaseOngoing = 10; // Example data, replace with actual counts
  const totalCaseDiscontinue = 5; // Example data, replace with actual counts
  const totalCaseClosed = 20; // Example data, replace with actual counts
  </script>
  
  <style scoped>

  </style>
  