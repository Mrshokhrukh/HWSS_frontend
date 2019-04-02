<template>
    <div class="container">
      <div class="row">
        <div class="col">
          <h2>Total Screened</h2>
          <table class="table">
            <thead class="bg-success text-white">
              <tr>
                <th class="text-white" style="background-color: green">Category</th>
                <th class="text-white" style="background-color: green">Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="bg-success text-white">Total New Entry</td>
                <td class="bg-white text-green-bg"> {{ totalNewEntry }}</td>
              </tr>
              <tr>
                <td class="bg-success text-white">Total Old Entry</td>
                <td class="bg-white text-green-bg">{{ totalOldEntry }}</td>
              </tr>
              <tr>
                <td class="bg-success text-white">Total Screened</td>
                <td class="bg-white text-green-bg">{{ totalScreened }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col">
          <h2>Weekly Screened</h2>
          <table class="table">
            <thead class="bg-success text-white">
              <tr>
                <th class="text-white" style="background-color: green">Category</th>
                <th class="text-white" style="background-color: green">Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="bg-success text-white">Total New Entry</td>
                <td class="bg-white text-green-bg">{{ totalNewEntry }}</td>
              </tr>
              <tr>
                <td class="bg-success text-white">Total Old Entry</td>
                <td class="bg-white text-green-bg">{{ totalOldEntry }}</td>
              </tr>
              <tr>
                <td class="bg-success text-white">Total Screened</td>
                <td class="bg-white text-green-bg">{{ totalScreened }}</td>
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
  
  .text-white {
    color: white;
  }
  .text-green-bg {
    color: rgb(0, 0, 0);
    background-color: white;
  }
  </style>
  