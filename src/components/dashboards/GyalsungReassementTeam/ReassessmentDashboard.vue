<template>
  <div class="container-fluid bg-color py-4">
    <div class="dashboard-header">
      <h1 class="header-title">Reassessment Dashboard</h1>
    </div>

    <div v-if="loading" class="state-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Fetching dashboard statistics...</p>
    </div>

    <div v-else-if="error" class="state-container">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Failed to Load Dashboard</h4>
        <p>There was an error retrieving dashboard data.</p>
        <hr />
        <p class="mb-0 small">
          <strong>Error:</strong> {{ error }}
        </p>
      </div>
    </div>

    <div v-else>
      <div v-if="stats" class="row">
        <!-- Stats Cards -->
        <div class="col-xl-4 col-md-6 mb-4">
          <div class="stat-card h-100">
            <div class="card-body d-flex align-items-center">
              <div>
                <div class="card-title text-primary">Total Cases Reviewed</div>
                <div class="card-value">{{ stats.totalReviewed }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-4 col-md-6 mb-4">
          <div class="stat-card h-100">
            <div class="card-body d-flex align-items-center">
              <div>
                <div class="card-title text-warning">Reassessment Needed</div>
                <div class="card-value">{{ stats.reassessmentNeeded }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-4 col-md-6 mb-4">
          <div class="stat-card h-100">
            <div class="card-body d-flex align-items-center">
              <div>
                <div class="card-title text-success">Cleared (Not Needed)</div>
                <div class="card-value">{{ stats.notNeeded }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="list-container mt-4">
        <div class="list-header">
          <h2 class="list-title">Reassessment Candidate List</h2>
          <div class="d-flex align-items-center">
            <input
              type="text"
              class="form-control search-input"
              placeholder="Type to Search"
              v-model="searchQuery"
            />
          </div>
        </div>

        <div v-if="loadingUsers" class="text-center py-5">
          <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">Loading users...</span>
          </div>
        </div>
        <div v-else-if="errorUsers" class="alert alert-warning">
          Could not load user list. {{ errorUsers }}
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover user-table">
            <thead>
              <tr>
                <th>Sl. No.</th>
                <th>Name</th>
                <th>CID</th>
                <th>DOB</th>
                <th>Personal Contact No.</th>
                <th>Appointment Date</th>
                <th>Hospital</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="8" class="text-center">No matching records found.</td>
              </tr>
              <!-- UPDATED a v-for loop with correct property names -->
              <tr v-else v-for="(user, index) in filteredUsers" :key="user.identity_number">
                <td>{{ index + 1 }}</td>
                <td>{{ user.first_name }} {{ user.last_name }}</td>
                <td>{{ user.identity_number }}</td>
                <td>{{ user.date_of_birth }}</td>
                <td>{{ user.mob_number }}</td>
                <td>{{ user.appointment_date }}</td>
                <td>{{ user.hospital_name }}</td>
                <td>
                  <span :class="getStatusClass(user.gyalsung_status)">{{ user.gyalsung_status || 'N/A' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import apiClient from "@/apiClient";
import endpoints from "@/api";

// State for stats cards
const stats = ref(null);
const loading = ref(true);
const error = ref(null);

// State for the user list table
const users = ref([]);
const loadingUsers = ref(true);
const errorUsers = ref(null);
const searchQuery = ref("");

const fetchDashboardData = async () => {
  loading.value = true;
  loadingUsers.value = true;
  error.value = null;
  errorUsers.value = null;

  try {
    const response = await apiClient.get(endpoints.getCounselorUsers);
    
  
    const userList = response.data;

    
    if (!Array.isArray(userList)) {
      throw new Error("The data received from the API is not a valid list (array).");
    }

    users.value = userList;

  
    const totalReviewed = userList.length;
    const reassessmentNeeded = userList.filter(
      (u) => u.gyalsung_status?.toLowerCase() === "registered"
    ).length;
    const notNeeded = userList.filter(
      (u) => u.gyalsung_status?.toLowerCase() === "screened"
    ).length;

    stats.value = {
      totalReviewed,
      reassessmentNeeded,
      notNeeded,
    };
  } catch (err) {
    console.error("Failed to fetch dashboard data:", err);
    const errorMessage =
      err.response?.data?.message || err.message || "An unknown error occurred.";
    error.value = errorMessage;
    errorUsers.value = errorMessage;
  } finally {
    loading.value = false;
    loadingUsers.value = false;
  }
};

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const lowerCaseQuery = searchQuery.value.toLowerCase();

  return users.value.filter((user) => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    
    return (
      fullName.includes(lowerCaseQuery) ||
      (user.identity_number && user.identity_number.toLowerCase().includes(lowerCaseQuery)) ||
      (user.hospital_name && user.hospital_name.toLowerCase().includes(lowerCaseQuery)) ||
      (user.gyalsung_status && user.gyalsung_status.toLowerCase().includes(lowerCaseQuery))
    );
  });
});

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "registered":
      return "status-registered";
    case "screened":
      return "status-screened";
    default:
      return "status-default";
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.bg-color {
  background-color: #f0f2f5;
  min-height: 100vh;
}
.dashboard-header {
  padding-bottom: 0.5rem;
  border-bottom: 3px solid #005f73;
  margin-bottom: 2rem;
}
.header-title {
  color: #1d3557;
  font-weight: 700;
  font-size: 2.25rem;
}
.state-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
.stat-card {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease-in-out;
}
.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.card-body {
  padding: 1.5rem;
}
.card-title {
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}
.card-value {
  font-size: 2rem;
  font-weight: 700;
  color: #212529;
}
.text-primary {
  color: #0d6efd !important;
}
.text-warning {
  color: #ffc107 !important;
}
.text-success {
  color: #198754 !important;
}
.list-container {
  background-color: #e9f5e9;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #d4e9d4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.list-title {
  color: #008080;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}
.search-input {
  max-width: 300px;
  border-radius: 0.25rem;
  border: 1px solid #008080;
}
.search-input:focus {
  border-color: #005f73;
  box-shadow: 0 0 0 0.25rem rgba(0, 128, 128, 0.25);
}
.user-table {
  background-color: #fff;
  border: 1px solid #ddd;
}
.user-table thead {
  background-color: #008080;
  color: white;
}
.user-table th,
.user-table td {
  vertical-align: middle;
  padding: 0.9rem 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}
.user-table tbody tr:hover {
  background-color: #f8f9fa;
}
.status-registered,
.status-screened {
  color: #0d6efd;
  font-weight: 600;
}
.status-default {
  color: #6c757d;
}
</style>