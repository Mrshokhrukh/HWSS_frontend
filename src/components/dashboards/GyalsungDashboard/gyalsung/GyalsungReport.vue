<template>
  <div class="container-fluid bg-color pt-3">
    <div class="row">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-teal text-white">
            <h5 class="mb-0">Gyalsung Reports</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4 mb-3">
                <div class="card text-center">
                  <div class="card-body">
                    <h3 class="text-teal">{{ totalUsers }}</h3>
                    <p class="text-muted">Total Registered Users</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card text-center">
                  <div class="card-body">
                    <h3 class="text-success">{{ screenedUsers }}</h3>
                    <p class="text-muted">Screened Users</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card text-center">
                  <div class="card-body">
                    <h3 class="text-warning">{{ pendingUsers }}</h3>
                    <p class="text-muted">Pending Screenings</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="alert alert-info">
              <i class="fas fa-info-circle me-2"></i>
              Detailed reports and analytics will be available here.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import endpoints from '@/api'

const totalUsers = ref(0)
const screenedUsers = ref(0)
const pendingUsers = ref(0)

const fetchReportData = async () => {
  try {
    const response = await axios.get(endpoints.getUsers)
    const users = response.data || []
    
    totalUsers.value = users.length
    screenedUsers.value = users.filter(user => user.status === 'Screened').length
    pendingUsers.value = users.filter(user => user.status === 'Pending').length
  } catch (error) {
    console.error('Failed to fetch report data:', error)
  }
}

onMounted(() => {
  fetchReportData()
})
</script>

<style scoped>
.bg-color {
  background-color: #e8f6ee;
  min-height: 100vh;
}

.text-teal {
  color: #2c6975;
}

.bg-teal {
  background-color: #2c6975;
}
</style>
