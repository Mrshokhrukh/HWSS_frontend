<template>
  <div class="container-fluid bg-color py-4">
    <!-- Main Dashboard Header -->
    <div class="dashboard-header">
      <h1 class="header-title">Reassessment Dashboard</h1>
    </div>

    <!-- Loading State for Initial Data (Stats) -->
    <div v-if="loading" class="state-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Fetching dashboard statistics...</p>
    </div>

    <!-- Error State for Stats -->
    <div v-else-if="error" class="state-container">
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Failed to Load Statistics</h4>
          <p>There was an error retrieving dashboard statistics. The user list may still be available below.</p>
          <hr>
          <p class="mb-0 small"><strong>Error:</strong> {{ error }}</p>
        </div>
    </div>

    <!-- Main Content: Stats Cards and User Table -->
    <div v-else>
      <!-- STATS CARDS SECTION (Restored) -->
      <div v-if="stats" class="row">
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
      
      <!-- USER LIST TABLE SECTION (Below Stats Cards) -->
      <div class="list-container mt-4">
        <div class="list-header">
          <h2 class="list-title">Reassessment Candidate List</h2>
          <div class="d-flex align-items-center">
            <input type="text" class="form-control search-input" placeholder="Type to Search" v-model="searchQuery">
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
              <tr v-for="(user, index) in filteredUsers" :key="user.cid">
                <td>{{ index + 1 }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.cid }}</td>
                <td>{{ user.dob }}</td>
                <td>{{ user.contact }}</td>
                <td>{{ user.appointmentDate }}</td>
                <td>{{ user.hospital }}</td>
                <td>
                  <span :class="getStatusClass(user.status)">{{ user.status }}</span>
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
import { ref, onMounted, computed } from 'vue';

// State for stats cards
const stats = ref(null);
const loading = ref(true);
const error = ref(null);

// State for the user list table
const users = ref([]);
const loadingUsers = ref(true);
const errorUsers = ref(null);
const searchQuery = ref('');

// --- DATA FETCHING ---

// Fetch data for the stats cards
const fetchDashboardStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalReviewed: 1258,
        reassessmentNeeded: 112,
        notNeeded: 1146,
      });
    }, 500); // Shorter delay for stats
  });
};

// Fetch data for the user list
const fetchUsers = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: 'Pema Yangden', cid: '10506000020', dob: '11-Apr-06', contact: '+97517629899', appointmentDate: '3-Feb-25', hospital: 'Paro Hospital, Paro', status: 'Registered' },
        { name: 'Narath Basnet', cid: '7969', dob: '10-Feb-06', contact: '+97517629890', appointmentDate: '1-Feb-25', hospital: 'Central Regional Referral Hospital, Gelephu', status: 'Registered' },
        { name: 'Pema Yangden', cid: '10506000021', dob: '11-Apr-06', contact: '+97517629899', appointmentDate: '1-Feb-25', hospital: 'Paro Hospital, Paro', status: 'Registered' },
        { name: 'Narath Basnet', cid: '79691', dob: '10-Feb-06', contact: '+97517629890', appointmentDate: '1-Feb-25', hospital: 'Central Regional Referral Hospital, Gelephu', status: 'Screened' },
        { name: 'Pema Yangden', cid: '10506000022', dob: '11-Apr-06', contact: '+97517629899', appointmentDate: '10-Jan-25', hospital: 'Paro Hospital, Paro', status: 'Screened' },
        { name: 'Narath Basnet', cid: '79692', dob: '10-Feb-06', contact: '+97517629890', appointmentDate: '10-Jan-25', hospital: 'Central Regional Referral Hospital, Gelephu', status: 'Screened' },
      ]);
    }, 1200); // Longer delay for user list
  });
};

// --- DATA LOADING LOGIC ---

// Load stats data
const loadStats = async () => {
  loading.value = true;
  error.value = null;
  try {
    stats.value = await fetchDashboardStats();
  } catch (err) {
    console.error("Failed to fetch dashboard stats:", err);
    error.value = err.message || "An unknown error occurred.";
  } finally {
    loading.value = false;
  }
};

// Load user data
const loadUsers = async () => {
  loadingUsers.value = true;
  errorUsers.value = null;
  try {
    users.value = await fetchUsers();
  } catch (err) {
    console.error("Failed to fetch users:", err);
    errorUsers.value = err.message || "An unknown error occurred.";
  } finally {
    loadingUsers.value = false;
  }
};

// --- COMPUTED & HELPERS ---

// Filter users based on search query
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  return users.value.filter(user =>
    Object.values(user).some(val =>
      String(val).toLowerCase().includes(lowerCaseQuery)
    )
  );
});

// Get CSS class for status
const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'registered': return 'status-registered';
    case 'screened': return 'status-screened';
    default: return 'status-default';
  }
};

// Load all data when component is mounted
onMounted(() => {
  loadStats();
  loadUsers();
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

/* Styles for Stats Cards */
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
.text-primary { color: #0d6efd !important; }
.text-warning { color: #ffc107 !important; }
.text-success { color: #198754 !important; }

/* Styles for the User List Table Container */
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

.user-table th, .user-table td {
  vertical-align: middle;
  padding: 0.9rem 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.user-table tbody tr:hover {
    background-color: #f8f9fa;
}

.status-registered, .status-screened {
  color: #0d6efd;
  font-weight: 600;
}

.status-default {
  color: #6c757d;
}
</style>