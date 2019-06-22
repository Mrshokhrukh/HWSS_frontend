<template>
  <!-- Your deep child component content -->
   <div>hi</div>
  <div>
    <!-- Use the filteredData -->
    <p v-for="data in filteredData" :key="data.id">{{ data }}</p>
  </div>
</template>

<script setup>
// Import necessary modules

// Inject filteredData from parent component
import { inject } from 'vue'

// Inject the filteredData
const filteredData = inject('filteredData')
</script>
