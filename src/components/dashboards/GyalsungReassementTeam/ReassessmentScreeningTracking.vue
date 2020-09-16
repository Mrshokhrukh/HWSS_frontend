<template>
  <div class="tracking-container">
    <div class="form-header">
      <h3 class="title">Reassessment Screening Tracking</h3>
    </div>

    <div class="content-section">
      <div class="search-bar-container">
        <i class="fas fa-search search-icon"></i>
        <input v-model="searchQuery" type="text" class="search-input" placeholder="Search by Name or CID..." />
      </div>

      <!-- Global Error Message -->
      <div v-if="error" class="alert alert-danger" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
      </div>

      <!-- =================================== -->
      <!-- UNFIT CANDIDATES TABLE (CORRECTED)  -->
      <!-- =================================== -->
      <div class="table-section">
        <h2 class="section-title text-unfit">
          <i class="fas fa-times-circle me-2"></i>Unfit Candidates
        </h2>
        <div class="table-wrapper">
          <table class="profiles-table">
            <thead>
              <tr>
                <th>Sl. No.</th>
                <th>Name</th>
                <th>CID</th>
                <th>DOB</th>
                <th>Reassessments</th>
                <th>Final Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading State -->
              <tr v-if="isLoading">
                <td :colspan="7" class="state-cell">
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Loading candidates...
                </td>
              </tr>
              <!-- No Data State -->
              <tr v-else-if="paginatedUnfitCandidates.length === 0">
                <td :colspan="7" class="state-cell">No matching unfit candidates found.</td>
              </tr>
              <!-- Data Display (Corrected Properties) -->
              <tr v-else v-for="(candidate, index) in paginatedUnfitCandidates" :key="candidate.cid">
                <td>{{ (unfitCurrentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>{{ candidate.name }}</td>
                <td>{{ candidate.cid }}</td>
                <td>{{ candidate.dob }}</td>
                <td class="reassessment-count">{{ candidate.reassessments || 0 }}</td>
                <td>
                  <span class="status-badge status-unfit">{{ candidate.finalStatus }}</span>
                </td>
                <td>
                  <button @click="viewHistory(candidate)" class="action-btn">
                    View History
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <nav v-if="!isLoading && unfitTotalPages > 1" class="pagination-nav">
          <ul class="pagination-list">
            <li class="page-item" :class="{ 'disabled': unfitCurrentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="setUnfitPage(unfitCurrentPage - 1)">Previous</a>
            </li>
            <li class="page-item" v-for="page in unfitTotalPages" :key="page" :class="{ 'active': page === unfitCurrentPage }">
              <a class="page-link" href="#" @click.prevent="setUnfitPage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ 'disabled': unfitCurrentPage === unfitTotalPages }">
              <a class="page-link" href="#" @click.prevent="setUnfitPage(unfitCurrentPage + 1)">Next</a>
            </li>
          </ul>
        </nav>
      </div>

      <!-- ================================= -->
      <!-- FIT CANDIDATES TABLE (CORRECTED)  -->
      <!-- ================================= -->
      <div class="table-section">
        <h2 class="section-title text-fit">
          <i class="fas fa-check-circle me-2"></i>Fit Candidates
        </h2>
        <div class="table-wrapper">
          <table class="profiles-table">
            <thead>
              <tr>
                <th>Sl. No.</th>
                <th>Name</th>
                <th>CID</th>
                <th>DOB</th>
                <th>Reassessments</th>
                <th>Final Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading State -->
              <tr v-if="isLoading">
                <td :colspan="7" class="state-cell">
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Loading candidates...
                </td>
              </tr>
               <!-- No Data State -->
              <tr v-else-if="paginatedFitCandidates.length === 0">
                <td :colspan="7" class="state-cell">No matching fit candidates found.</td>
              </tr>
               <!-- Data Display (Corrected Properties) -->
              <tr v-else v-for="(candidate, index) in paginatedFitCandidates" :key="candidate.cid">
                <td>{{ (fitCurrentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>{{ candidate.name }}</td>
                <td>{{ candidate.cid }}</td>
                <td>{{ candidate.dob }}</td>
                <td class="reassessment-count">{{ candidate.reassessments || 0 }}</td>
                <td>
                  <span class="status-badge status-fit">{{ candidate.finalStatus }}</span>
                </td>
                <td>
                  <button @click="viewDetails(candidate)" class="action-btn">
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <nav v-if="!isLoading && fitTotalPages > 1" class="pagination-nav">
          <ul class="pagination-list">
            <li class="page-item" :class="{ 'disabled': fitCurrentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="setFitPage(fitCurrentPage - 1)">Previous</a>
            </li>
            <li class="page-item" v-for="page in fitTotalPages" :key="page" :class="{ 'active': page === fitCurrentPage }">
              <a class="page-link" href="#" @click.prevent="setFitPage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ 'disabled': fitCurrentPage === fitTotalPages }">
              <a class="page-link" href="#" @click.prevent="setFitPage(fitCurrentPage + 1)">Next</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- ================================= -->
    <!-- MODAL (CORRECTED)                 -->
    <!-- ================================= -->
    <div class="modal fade" id="historyModal" tabindex="-1" aria-labelledby="historyModalLabel" aria-hidden="true" ref="historyModalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" v-if="selectedCandidateForHistory">
          <div class="modal-header">
            <h5 class="modal-title" id="historyModalLabel">
              History for {{ selectedCandidateForHistory.name }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p><strong>Name:</strong> {{ selectedCandidateForHistory.name }}</p>
            <p><strong>CID:</strong> {{ selectedCandidateForHistory.cid }}</p>
            <p><strong>Date of Birth:</strong> {{ selectedCandidateForHistory.dob }}</p>
            <hr>
            <p class="fw-bold">Total Reassessments: {{ selectedCandidateForHistory.reassessments || 0 }}</p>
            <p><strong>Final Status:</strong> <span class="status-badge status-unfit">{{ selectedCandidateForHistory.finalStatus }}</span></p>
            <p><small>This is a placeholder for detailed history records.</small></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
// import { Modal } from 'bootstrap';
import endpoints from '@/api';
import apiClient from '@/apiClient';

// --- STATE MANAGEMENT ---
const searchQuery = ref('');
const unfitCurrentPage = ref(1);
const fitCurrentPage = ref(1);
const itemsPerPage = 5;
const selectedCandidateForHistory = ref(null);
const historyModalRef = ref(null);
let historyModalInstance = null;

// --- DYNAMIC DATA STATE ---
const unfitCandidates = ref([]);
const fitCandidates = ref([]);
const isLoading = ref(true);
const error = ref(null);

// --- API FETCHING LOGIC (CORRECTED) ---
const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const [unfitResponse, fitResponse] = await Promise.all([
      apiClient.get(endpoints.getUnfitCandidates), // Correct endpoint name
      apiClient.get(endpoints.getFitCandidates)   // Correct endpoint name
    ]);

    // Use response data directly, default to empty array if response is falsy
    unfitCandidates.value = unfitResponse.data || [];
    fitCandidates.value = fitResponse.data || [];

  } catch (e) {
    console.error('API Error:', e);
    error.value = e.response?.data?.detail || e.message || 'An unexpected error occurred.';
    unfitCandidates.value = [];
    fitCandidates.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();

  if (historyModalRef.value) {
    historyModalInstance = new Modal(historyModalRef.value);
  }
});

onUnmounted(() => {
  historyModalInstance?.dispose();
});

// --- COMPUTED PROPERTIES for Filtering and Pagination (CORRECTED) ---
const filteredUnfitCandidates = computed(() => {
  if (!unfitCandidates.value) return [];
  if (!searchQuery.value) return unfitCandidates.value;
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  return unfitCandidates.value.filter(c =>
    (c.name && c.name.toLowerCase().includes(lowerCaseQuery)) ||
    (c.cid && c.cid.toLowerCase().includes(lowerCaseQuery))
  );
});

const filteredFitCandidates = computed(() => {
  if (!fitCandidates.value) return [];
  if (!searchQuery.value) return fitCandidates.value;
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  return fitCandidates.value.filter(c =>
    (c.name && c.name.toLowerCase().includes(lowerCaseQuery)) ||
    (c.cid && c.cid.toLowerCase().includes(lowerCaseQuery))
  );
});

const fitTotalPages = computed(() => Math.ceil(filteredFitCandidates.value.length / itemsPerPage));
const unfitTotalPages = computed(() => Math.ceil(filteredUnfitCandidates.value.length / itemsPerPage));

const paginatedFitCandidates = computed(() => {
  if (!filteredFitCandidates.value) return [];
  const start = (fitCurrentPage.value - 1) * itemsPerPage;
  return filteredFitCandidates.value.slice(start, start + itemsPerPage);
});

const paginatedUnfitCandidates = computed(() => {
  if (!filteredUnfitCandidates.value) return [];
  const start = (unfitCurrentPage.value - 1) * itemsPerPage;
  return filteredUnfitCandidates.value.slice(start, start + itemsPerPage);
});

// --- METHODS (CORRECTED) ---
const setFitPage = (page) => {
  if (page > 0 && page <= fitTotalPages.value) fitCurrentPage.value = page;
};

const setUnfitPage = (page) => {
  if (page > 0 && page <= unfitTotalPages.value) unfitCurrentPage.value = page;
};

const viewDetails = (candidate) => {
  alert(`Viewing details for ${candidate.name} (CID: ${candidate.cid}).`);
};

const viewHistory = (candidate) => {
  selectedCandidateForHistory.value = candidate;
  historyModalInstance?.show();
};

watch(searchQuery, () => {
  fitCurrentPage.value = 1;
  unfitCurrentPage.value = 1;
});
</script>

<style scoped>
  /* Core Styles from Gyalsung Profiles Reference */
  .tracking-container {
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
  .table-wrapper {
    overflow-x: auto;
    margin-bottom: 1.5rem; /* Space between table and pagination */
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
  .state-cell {
    text-align: center;
    color: #7d979d;
    padding: 3rem 1rem;
    font-style: italic;
  }
  
  /* Component-specific Styles */
  .table-section {
    margin-bottom: 3rem;
  }
  .table-section:last-child {
    margin-bottom: 1rem;
  }
  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e9f1f3;
  }
  .text-unfit {
    color: #c93d3d;
  }
  .text-fit {
    color: #43a047;
  }
  .status-badge {
    display: inline-block;
    padding: 0.3rem 0.8rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: capitalize;
  }
  .status-unfit { background-color: #ffebee; color: #e53935; }
  .status-fit { background-color: #e8f5e9; color: #43a047; }
  .reassessment-count {
    font-weight: 700;
    color: #1d4851;
    text-align: center;
  }
  .action-btn {
    background-color: #f5f9fa;
    color: #3e5a60;
    border: 1px solid #d3e0e3;
    padding: 0.4rem 0.9rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  .action-btn:hover {
    background-color: #2b656f;
    color: #ffffff;
    border-color: #2b656f;
  }
  
  /* Custom Pagination Styles */
  .pagination-nav {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }
  .pagination-list {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(43, 101, 111, 0.07);
    overflow: hidden;
  }
  .page-item .page-link {
    padding: 0.5rem 1rem;
    color: #2b656f;
    background-color: #fff;
    border-left: 1px solid #e9f1f3;
    text-decoration: none;
    transition: background-color 0.2s ease;
  }
  .page-item:first-child .page-link {
    border-left: none;
  }
  .page-item:not(.disabled) .page-link:hover {
    background-color: #f5f9fa;
  }
  .page-item.active .page-link {
    background-color: #2b656f;
    color: #fff;
    font-weight: 600;
  }
  .page-item.disabled .page-link {
    color: #adb5bd;
    pointer-events: none;
    background-color: #f8f9fa;
  }
</style>