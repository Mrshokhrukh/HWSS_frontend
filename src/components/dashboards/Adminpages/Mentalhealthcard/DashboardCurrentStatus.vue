<template>
  <div class="">
    <h1 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975;">Current Status in Bhutan</h1>
    <div class="row">
      <div class="col-md-4">
        <div class="card bg-light mb-3">
          <div class="card-body text-center">
            <h5 class="card-title">Total Case Ongoing</h5>
            <p class="card-text display-4 fw-bold"><i class="fas fa-user-injured me-2"></i>{{ totalCaseOngoing }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card bg-light mb-3">
          <div class="card-body text-center">
            <h5 class="card-title">Total Case Discontinued</h5>
            <p class="card-text display-4 fw-bold"><i class="fas fa-exclamation-triangle me-2"></i>{{
              totalCaseUnresolved }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card bg-light mb-3">
          <div class="card-body text-center">
            <h5 class="card-title">Total Case Closed</h5>
            <p class="card-text display-4 fw-bold"><i class="fas fa-check-circle me-2"></i>{{ totalCaseClosed }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Variables to store the numbers fetched from the API
const totalCaseOngoing = ref(0);
const totalCaseUnresolved = ref(0);
const totalCaseClosed = ref(0);

// Function to fetch data from the API
const fetchData = async () => {
  try {
    const response = await fetch('YOUR_API_ENDPOINT');
    const data = await response.json();
    // Assuming API response contains total case ongoing, unresolved, and closed counts
    totalCaseOngoing.value = data.totalCaseOngoing;
    totalCaseUnresolved.value = data.totalCaseUnresolved;
    totalCaseClosed.value = data.totalCaseClosed;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* Add custom styles here */
.display-4 {
  font-size: 2.5rem;
}

.card-title {
  font-size: 1.5rem;
}
</style>