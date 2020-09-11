<template>
    <CounselorRescreening
      v-if="isReassessing"
      @back-to-list="handleBackToList"
    />
  
    <div v-else class="reassessment-container">
      <div class="form-header">
        <h3 class="title">Reassessment List</h3>
      </div>
  
      <div class="content-section">
        <div class="search-bar-container">
          <i class="fas fa-search search-icon"></i>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search by Name, Identity Number, or Hospital..."
          />
        </div>
  
        <div v-if="error" class="error-alert" role="alert">
          <strong>Error:</strong> {{ error }}
        </div>
  
        <div class="table-wrapper">
          <table class="profiles-table">
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="9" class="state-cell">
                  <div class="loader"></div>
                  Loading list...
                </td>
              </tr>
  
              <tr v-else-if="!loading && filteredEntrants.length === 0 && !error">
                <td colspan="9" class="state-cell">
                  {{
                    searchQuery
                      ? "No records found matching your search"
                      : "No records found"
                  }}
                </td>
              </tr>
  
              <tr
                v-else
                v-for="(entrant, index) in filteredEntrants"
                :key="entrant.identity_number"
              >
                <td>{{ index + 1 }}</td>
                <td>{{ entrant.first_name }} {{ entrant.last_name }}</td>
                <td>{{ entrant.identity_number }}</td>
                <td>{{ entrant.date_of_birth }}</td>
                <td>{{ entrant.mob_number }}</td>
                <td>{{ entrant.appointment_date }}</td>
                <td>{{ entrant.hospital_name }}</td>
                <td>
                  <span :class="getStatusClass(entrant.gyalsung_status)" class="status-badge">
                    {{ entrant.gyalsung_status || 'N/A' }}
                  </span>
                </td>
                <td>
                  <button
                    v-if="entrant.gyalsung_status?.toLowerCase() === 'pending'"
                    @click="startReassessment(entrant)"
                    class="action-btn"
                  >
                    Reassess
                  </button>
                  <span v-else class="action-placeholder">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from "vue";
  import CounselorRescreening from "./ReassessmentScreening.vue";
  
  import apiClient from "@/apiClient";
  import endpoints from "@/api";
  const isReassessing = ref(false);
  const selectedEntrant = ref(null);
  
  // State for the list data
  const entrants = ref([]);
  const searchQuery = ref("");
  const loading = ref(true);
  const error = ref("");
  
  const fetchReassessmentList = async () => {
    loading.value = true;
    error.value = "";
    try {
      // 2. Use the consistent fetching pattern
      const response = await apiClient.get(endpoints.getReassessmentUsers);
      entrants.value = response.data;
    } catch (err) {
      console.error("Failed to fetch reassessment list:", err);
      error.value =
        err.response?.data?.message ||
        err.message ||
        "An unknown error occurred while fetching the list.";
    } finally {
      loading.value = false;
    }
  };
  
  const filteredEntrants = computed(() => {
    if (!searchQuery.value) return entrants.value;
    const lowerCaseQuery = searchQuery.value.toLowerCase();
  
    return entrants.value.filter((e) => {
     
      const fullName = `${e.first_name || ''} ${e.last_name || ''}`.toLowerCase();
      
      return (
        fullName.includes(lowerCaseQuery) ||
        (e.identity_number && e.identity_number.toLowerCase().includes(lowerCaseQuery)) ||
        (e.hospital_name && e.hospital_name.toLowerCase().includes(lowerCaseQuery))
      );
    });
  });
  
  const getStatusClass = (status) => {
   
    const currentStatus = status?.toLowerCase() || '';
    switch (currentStatus) {
      case "completed":
        return "status-completed";
      case "pending":
        return "status-pending";
      
      default:
        return "status-default";
    }
  };
  
  const startReassessment = (entrant) => {
    console.log(`Navigating to screening for ${entrant.first_name} (CID: ${entrant.identity_number})`);
    selectedEntrant.value = entrant;
    sessionStorage.setItem("RescreeningUserID", JSON.stringify(entrant.identity_number)); 
    const userAgeData = { ageGroup: "15 to 17" }; 
    sessionStorage.setItem("userAgeData", JSON.stringify(userAgeData));
    isReassessing.value = true;
  };
  
  const handleBackToList = () => {
    isReassessing.value = false;
    selectedEntrant.value = null;
    sessionStorage.removeItem("RescreeningUserID");
    sessionStorage.removeItem("userAgeData");
  
    fetchReassessmentList();
  };
  
  onMounted(() => {
    fetchReassessmentList();
  });
  </script>
  
  <style scoped>
 
  .reassessment-container {
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    border-radius: 16px;
    padding: 2rem;
    font-family: sans-serif;
  }
  .form-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  .title {
    color: #2b656f;
    font-weight: 600;
  }
  .content-section {
    background: #ffffff;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(43, 101, 111, 0.08);
  }
  .search-bar-container {
    position: relative;
    margin-bottom: 2rem;
  }
  .search-icon {
    position: absolute;
    top: 50%;
    left: 1rem;
    transform: translateY(-50%);
    color: #9ab0b5;
  }
  .search-input {
    width: 100%;
    background: #f8fbfb;
    border: 1px solid rgba(43, 101, 111, 0.2);
    border-radius: 8px;
    padding: 0.8rem 1rem 0.8rem 2.5rem;
    color: #1d4851;
    font-size: 1rem;
    transition: all 0.3s ease;
  }
  .search-input:focus {
    outline: none;
    border-color: #2b656f;
    box-shadow: 0 0 0 3px rgba(43, 101, 111, 0.1);
    background: #fff;
  }
  .error-alert {
    background-color: #fdeeee;
    color: #c93d3d;
    border: 1px solid #f8c9c9;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 2rem;
  }
  .table-wrapper {
    overflow-x: auto;
  }
  .profiles-table {
    width: 100%;
    border-collapse: collapse;
    white-space: nowrap;
  }
  .profiles-table thead {
    background-color: #2b656f;
    color: #ffffff;
  }
  .profiles-table th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .profiles-table td {
    padding: 1rem;
    vertical-align: middle;
    color: #3e5a60;
    font-size: 0.9rem;
  }
  .profiles-table tbody tr {
    border-bottom: 1px solid #e9f1f3;
    transition: background-color 0.2s ease-in-out;
  }
  .profiles-table tbody tr:last-child {
    border-bottom: none;
  }
  .profiles-table tbody tr:hover {
    background-color: #f5f9fa;
  }
  .status-badge {
    display: inline-block;
    padding: 0.3rem 0.8rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: capitalize;
  }
  .status-completed {
    background-color: #e8f5e9;
    color: #43a047;
  }
  .status-pending {
    background-color: #fff8e1;
    color: #ffb300;
  }
  .status-default {
    background-color: #f5f5f5;
    color: #757575;
  }
  .action-btn {
    background-color: #2b656f;
    color: white;
    border: none;
    padding: 0.4rem 0.9rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }
  .action-btn:hover {
    background-color: #1d4851;
  }
  .action-placeholder {
    color: #9ab0b5;
    font-size: 0.9rem;
  }
  .state-cell {
    text-align: center;
    color: #7d979d;
    padding: 3rem 1rem;
    font-style: italic;
  }
  .loader {
    width: 20px;
    height: 20px;
    border: 2px solid #2b656f;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
    margin-right: 0.75rem;
    vertical-align: middle;
  }
  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  </style>