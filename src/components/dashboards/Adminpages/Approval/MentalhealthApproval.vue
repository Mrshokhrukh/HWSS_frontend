<template>
  <div class="container my-5">
    <div class="d-flex justify-content-between mb-3">
      <h2>Pending Request</h2>
      <h2>Records of Approval</h2>
    </div>
    <div class="input-group mb-3">
      <input type="text" class="form-control" placeholder="Search" aria-label="Search" aria-describedby="search-addon" v-model="searchQuery" />
      <button class="btn btn-outline-secondary" type="button" id="search-addon" @click="searchRecords">Search</button>
    </div>
    <table class="custom-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Event Name</th>
          <th>Tools to be Used</th>
          <th>Duration</th>
          <th>Submitted By</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in filteredRecords" :key="record.id">
          <td>{{ record.date }}</td>
          <td>{{ record.eventName }}</td>
          <td>{{ record.toolsUsed }}</td>
          <td>{{ record.duration }}</td>
          <td>{{ record.submittedBy }}</td>
          <td><button class="btn btn-primary">Process for Approval</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Sample data
const records = ref([
  {
    id: 1,
    date: '21/02/24',
    eventName: 'Empower Wellness Summit',
    toolsUsed: 'Mental Health, SUD',
    duration: '5 days',
    submittedBy: 'Ms. Nangay Tshering, Clinical Counselor'
  },
  {
    id: 2,
    date: '21/02/24',
    eventName: 'Empower Wellness Summit',
    toolsUsed: 'Mental Health, SUD',
    duration: '5 days',
    submittedBy: 'Ms. Nangay Tshering, Clinical Counselor'
  },
  // Add more records as needed
])

const searchQuery = ref('')

const filteredRecords = computed(() => {
  return records.value.filter(record =>
    record.eventName.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const searchRecords = () => {
  // Perform search operation
}
</script>

<style scoped>
.custom-table {
  width: 100%;
  font-family: Arial, sans-serif;
  background-color: #ffffff; /* Set the background color */
  border-collapse: separate; /* Separate borders between cells */
  border-spacing: 0 10px; /* Set white space between rows */
  
}

.custom-table thead th {
  background-color: white; /* White background for thead */
  color: #2B656F; /* Text color for thead */
}

.custom-table tbody tr {
  background-color: #E1E9Eb; /* Gray color for rows */
  
}

.custom-table th, .custom-table td {
  padding: 15px; /* Increased padding for space */
  text-align: left;
  border: none; /* Remove borders */
}

.custom-table tr:hover {
  background-color: #e6e6e6;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
