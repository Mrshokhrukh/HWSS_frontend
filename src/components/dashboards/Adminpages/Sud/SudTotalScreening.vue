<template>
    <div class="container">
      <div class="row">
        <div class="col">
          <h2>Total Screened</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total New Entry</td>
                <td>{{ totalNewEntry }}</td>
              </tr>
              <tr>
                <td>Total Old Entry</td>
                <td>{{ totalOldEntry }}</td>
              </tr>
              <tr>
                <td>Total Screened</td>
                <td>{{ totalScreened }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col">
          <h2>Weekly Screened</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total New Entry</td>
                <td>{{ totalNewEntry }}</td>
              </tr>
              <tr>
                <td>Total Old Entry</td>
                <td>{{ totalOldEntry }}</td>
              </tr>
              <tr>
                <td>Total Screened</td>
                <td>{{ totalScreened }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  const totalNewEntry = ref(10); // Example count for Total New Entry
  const totalOldEntry = ref(15); // Example count for Total Old Entry
  const totalScreened = ref(25); // Example count for Total Screened
  </script>
  
  <style scoped>
  /* Add custom styles here */
  </style>
  