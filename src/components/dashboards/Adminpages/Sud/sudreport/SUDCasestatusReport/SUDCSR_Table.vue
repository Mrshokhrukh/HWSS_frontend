<template>
  <div>
    <h2>Case Status Report Table</h2>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Case Status</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in reportData" :key="item.status">
          <td>{{ item.status }}</td>
          <td>{{ item.count }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  reportData: Array,
});
</script>

<style scoped>
/* Add scoped styles as needed */
</style>