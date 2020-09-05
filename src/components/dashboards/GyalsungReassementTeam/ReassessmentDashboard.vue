<template>
    <div class="container-fluid bg-color py-4">
      <div class="dashboard-header">
        <h1 class="header-title">Reassessment Dashboard</h1>
        <button class="btn btn-sm refresh-btn" @click="reloadData">
          <i class="fas fa-sync-alt me-2"></i>Refresh Data
        </button>
      </div>
  
      <div v-if="loading" class="state-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Fetching latest statistics...</p>
      </div>
  
      <div v-else-if="error" class="state-container">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">Failed to Load Data</h4>
            <p>There was an error retrieving dashboard statistics. Please try refreshing.</p>
            <hr>
            <p class="mb-0 small"><strong>Error:</strong> {{ error }}</p>
          </div>
      </div>
  
      <div v-else-if="stats" class="row">
        <div class="col-xl-4 col-md-6 mb-4">
          <div class="stat-card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="icon-circle bg-primary me-3">
                  <i class="fas fa-folder-open fa-lg"></i>
                </div>
                <div>
                  <div class="card-title text-primary">Total Cases Reviewed</div>
                  <div class="card-value">{{ stats.totalReviewed }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="col-xl-4 col-md-6 mb-4">
          <div class="stat-card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="icon-circle bg-warning me-3">
                  <i class="fas fa-exclamation-triangle fa-lg"></i>
                </div>
                <div>
                  <div class="card-title text-warning">Reassessment Needed</div>
                  <div class="card-value">{{ stats.reassessmentNeeded }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="col-xl-4 col-md-6 mb-4">
          <div class="stat-card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="icon-circle bg-success me-3">
                  <i class="fas fa-check-circle fa-lg"></i>
                </div>
                <div>
                  <div class="card-title text-success">Cleared (Not Needed)</div>
                  <div class="card-value">{{ stats.notNeeded }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="col-xl-4 col-md-6 mb-4">
          <div class="stat-card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="icon-circle bg-info me-3">
                  <i class="fas fa-hourglass-half fa-lg"></i>
                </div>
                <div>
                  <div class="card-title text-info">Pending Review</div>
                  <div class="card-value">{{ stats.pendingReview }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-4 col-md-6 mb-4">
          <div class="stat-card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="icon-circle bg-danger me-3">
                  <i class="fas fa-hospital fa-lg"></i>
                </div>
                <div>
                  <div class="card-title text-danger">Referred to JDWNRH</div>
                  <div class="card-value">{{ stats.referredJdwnrh }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="col-xl-4 col-md-6 mb-4">
          <div class="stat-card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="icon-circle bg-secondary me-3">
                  <i class="fas fa-clinic-medical fa-lg"></i>
                </div>
                <div>
                  <div class="card-title text-secondary">Referred to CRRH</div>
                  <div class="card-value">{{ stats.referredCrrh }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const stats = ref(null);
  const loading = ref(true);
  const error = ref(null);
  
  const fetchDashboardStats = async () => {
    // Reset state for reload
    loading.value = true;
    error.value = null;
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // To test error state: reject(new Error("Network connection failed."));
        resolve({
          totalReviewed: 1258,
          reassessmentNeeded: 112,
          notNeeded: 1146,
          pendingReview: 34,
          referredJdwnrh: 45,
          referredCrrh: 67,
        });
      }, 1500);
    });
  };
  
  const loadData = async () => {
    try {
      stats.value = await fetchDashboardStats();
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      error.value = err.message || "An unknown error occurred.";
    } finally {
      loading.value = false;
    }
  }
  
  const reloadData = () => {
    loadData();
  }
  
  onMounted(() => {
    loadData();
  });
  </script>
  
  <style scoped>
  /* Core layout styles from reference */
  .bg-color {
    background-color: #f8f9fa;
    min-height: calc(100vh - 120px);
  }
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 0 1rem;
  }
  
  .header-title {
    color: #2b656f;
    font-weight: 600;
    margin: 0;
    font-size: 1.75rem;
  }
  
  /* Button style adapted from reference */
  .refresh-btn {
    background-color: #2b656f;
    color: white;
    border: none;
    transition: background-color 0.3s ease;
  }
  
  .refresh-btn:hover {
    background-color: #1d4851;
  }
  
  .state-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    color: #1d4851;
  }
  
  /* Card styles adapted from a standard, flat design */
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
  
  .icon-circle {
    height: 3.5rem;
    width: 3.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
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
  
  /* Custom text colors for titles to match icon backgrounds */
  .text-primary { color: #0d6efd !important; }
  .text-warning { color: #ffc107 !important; }
  .text-success { color: #198754 !important; }
  .text-info { color: #0dcaf0 !important; }
  .text-danger { color: #dc3545 !important; }
  .text-secondary { color: #6c757d !important; }
  </style>