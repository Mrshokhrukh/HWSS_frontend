<template>
    <div class="transfer-container">
      <div class="form-header">
        <h3 class="title">Transfer and Handover</h3>
      </div>
  
      <div class="content-section">
        <div class="content-header">
          <h5 class="content-title">Candidates Ready for Handover</h5>
          <p class="content-subtitle">These individuals have successfully completed monitoring and are now declared fit.</p>
        </div>
  
        <div class="search-bar-container">
          <i class="fas fa-search search-icon"></i>
          <input v-model="searchQuery" type="text" class="search-input" placeholder="Search by Name or CID..." />
        </div>
  
        <div class="table-wrapper">
          <table class="profiles-table">
            <thead>
              <tr>
                <th scope="col">Sl. No.</th>
                <th scope="col">Name</th>
                <th scope="col">CID</th>
                <th scope="col">Date Declared Fit</th>
                <th scope="col">Overseeing Counselor</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedCandidates.length === 0">
                <td :colspan="7" class="state-cell">No candidates are currently ready for transfer.</td>
              </tr>
              <tr v-for="(candidate, index) in paginatedCandidates" :key="candidate.cid">
                <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>{{ candidate.name }}</td>
                <td>{{ candidate.cid }}</td>
                <td>{{ candidate.dateDeclaredFit }}</td>
                <td>{{ candidate.counselor }}</td>
                <td>
                  <span class="status-badge status-fit">{{ candidate.status }}</span>
                </td>
                <td>
                  <button @click="openTransferModal(candidate)" class="action-btn action-btn-primary">
                    <i class="fas fa-paper-plane me-1"></i>
                    Transfer to HQ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <nav v-if="totalPages > 1" class="pagination-nav">
          <ul class="pagination-list">
            <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="setPage(currentPage - 1)">Previous</a>
            </li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ 'active': page === currentPage }">
              <a class="page-link" href="#" @click.prevent="setPage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ 'disabled': currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="setPage(currentPage + 1)">Next</a>
            </li>
          </ul>
        </nav>
      </div>
  
      <div class="modal fade" id="transferModal" tabindex="-1" aria-labelledby="transferModalLabel" aria-hidden="true" ref="transferModalRef">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content" v-if="selectedCandidateForTransfer">
            <div class="modal-header">
              <h5 class="modal-title" id="transferModalLabel">Confirm Handover</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to transfer <strong>{{ selectedCandidateForTransfer.name }}</strong> (CID: {{ selectedCandidateForTransfer.cid }}) to Gyalsung HQ?</p>
              <p class="text-muted small">This action will mark their monitoring as complete and remove them from this list. This cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-success" @click="confirmTransfer">
                <i class="fas fa-check-circle me-1"></i>
                Yes, Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { Modal } from 'bootstrap';
  
  // --- STATE & REFS ---
  const searchQuery = ref('');
  const currentPage = ref(1);
  const itemsPerPage = 5;
  const selectedCandidateForTransfer = ref(null);
  const transferModalRef = ref(null);
  let transferModalInstance = null;
  
  // --- DUMMY DATA ---
  const candidatesToTransfer = ref([
    { name: 'Dawa Pem', cid: '10203004455', dateDeclaredFit: '29-Apr-25', counselor: 'Ms. Pema Choden', status: 'Ready for Transfer' },
    { name: 'Tandin Wangmo', cid: '11502008899', dateDeclaredFit: '01-May-25', counselor: 'Dr. Yeshey Dorji', status: 'Ready for Transfer' },
    { name: 'Sonam Tobgay', cid: '10805001122', dateDeclaredFit: '02-May-25', counselor: 'Mr. Kinley Wangchuk', status: 'Ready for Transfer' },
    { name: 'Chimi Yangzom', cid: '10103004567', dateDeclaredFit: '05-May-25', counselor: 'Ms. Pema Choden', status: 'Ready for Transfer' },
    { name: 'Karma Jigme', cid: '11306007890', dateDeclaredFit: '06-May-25', counselor: 'Ms. Dechen Pelzom', status: 'Ready for Transfer' },
    { name: 'Dorji Gyeltshen', cid: '11909003344', dateDeclaredFit: '10-May-25', counselor: 'Dr. Yeshey Dorji', status: 'Ready for Transfer' }
  ]);
  
  // --- LIFECYCLE HOOKS ---
  onMounted(() => {
    if (transferModalRef.value) {
      transferModalInstance = new Modal(transferModalRef.value);
    }
  });
  
  // --- COMPUTED PROPERTIES ---
  const filteredCandidates = computed(() => {
    if (!searchQuery.value) {
      return candidatesToTransfer.value;
    }
    const lowerCaseQuery = searchQuery.value.toLowerCase();
    return candidatesToTransfer.value.filter(c =>
      c.name.toLowerCase().includes(lowerCaseQuery) ||
      c.cid.toLowerCase().includes(lowerCaseQuery)
    );
  });
  const totalPages = computed(() => Math.ceil(filteredCandidates.value.length / itemsPerPage));
  const paginatedCandidates = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCandidates.value.slice(start, end);
  });
  
  // --- METHODS ---
  const setPage = (page) => {
    if (page > 0 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };
  const openTransferModal = (candidate) => {
    selectedCandidateForTransfer.value = candidate;
    transferModalInstance?.show();
  };
  const confirmTransfer = () => {
    if (!selectedCandidateForTransfer.value) return;
    candidatesToTransfer.value = candidatesToTransfer.value.filter(
      c => c.cid !== selectedCandidateForTransfer.value.cid
    );
    transferModalInstance?.hide();
    alert(`${selectedCandidateForTransfer.value.name} has been successfully transferred.`);
    selectedCandidateForTransfer.value = null;
  };
  
  // --- WATCHERS ---
  watch(searchQuery, () => {
    currentPage.value = 1;
  });
  </script>
  
  <style scoped>
  /* Core Styles */
  .transfer-container {
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    border-radius: 16px;
    padding: 2rem;
    font-family: sans-serif;
  }
  .form-header { text-align: center; margin-bottom: 2rem; }
  .title { color: #2b656f; font-weight: 600; }
  .content-section { background: #ffffff; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 20px rgba(43, 101, 111, 0.08); }
  .content-header {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e9f1f3;
  }
  .content-title {
      color: #2b656f;
      font-weight: 600;
      margin: 0;
  }
  .content-subtitle {
      color: #7d979d;
      font-size: 0.9rem;
      margin: 0.25rem 0 0 0;
  }
  .search-bar-container { position: relative; margin-bottom: 2rem; }
  .search-icon { position: absolute; top: 50%; left: 1rem; transform: translateY(-50%); color: #9ab0b5; }
  .search-input { width: 100%; background: #f8fbfb; border: 1px solid rgba(43, 101, 111, 0.2); border-radius: 8px; padding: 0.8rem 1rem 0.8rem 2.5rem; color: #1d4851; font-size: 1rem; transition: all 0.3s ease; }
  .search-input:focus { outline: none; border-color: #2b656f; box-shadow: 0 0 0 3px rgba(43, 101, 111, 0.1); background: #fff; }
  .table-wrapper { overflow-x: auto; margin-bottom: 1.5rem; }
  .profiles-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
  .profiles-table thead { background-color: #2b656f; color: #ffffff; }
  .profiles-table th { padding: 1rem; text-align: left; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
  .profiles-table td { padding: 1rem; vertical-align: middle; color: #3e5a60; font-size: 0.9rem; }
  .profiles-table tbody tr { border-bottom: 1px solid #e9f1f3; transition: background-color 0.2s ease-in-out; }
  .profiles-table tbody tr:last-child { border-bottom: none; }
  .profiles-table tbody tr:hover { background-color: #f5f9fa; }
  .state-cell { text-align: center; color: #7d979d; padding: 3rem 1rem; font-style: italic; }
  
  /* Status Badge */
  .status-badge { display: inline-block; padding: 0.3rem 0.8rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500; text-transform: capitalize; }
  .status-fit { background-color: #e8f5e9; color: #43a047; }
  
  /* Action Button */
  .action-btn { border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 500; transition: all 0.2s ease; }
  .action-btn-primary { background-color: #2b656f; color: #ffffff; }
  .action-btn-primary:hover { background-color: #1d4851; }
  
  /* Custom Pagination */
  .pagination-nav { display: flex; justify-content: flex-end; margin-top: 1rem; }
  .pagination-list { display: flex; list-style: none; padding: 0; margin: 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(43, 101, 111, 0.07); overflow: hidden; }
  .page-item .page-link { padding: 0.5rem 1rem; color: #2b656f; background-color: #fff; border-left: 1px solid #e9f1f3; text-decoration: none; transition: background-color 0.2s ease; }
  .page-item:first-child .page-link { border-left: none; }
  .page-item:not(.disabled) .page-link:hover { background-color: #f5f9fa; }
  .page-item.active .page-link { background-color: #2b656f; color: #fff; font-weight: 600; }
  .page-item.disabled .page-link { color: #adb5bd; pointer-events: none; background-color: #f8f9fa; }
  
  /* Modal Styles */
  .modal-header { background-color: #f8f9fa; border-bottom: 1px solid #dee2e6; color: #2b656f;}
  </style>