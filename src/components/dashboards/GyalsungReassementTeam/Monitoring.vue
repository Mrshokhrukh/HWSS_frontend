<template>
    <div class="monitoring-container">
      <div class="form-header">
        <h3 class="title">Unfit Candidates Monitoring</h3>
      </div>
  
      <div class="content-section">
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
                <th scope="col">Last Assessed</th>
                <th scope="col">Referral Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedCandidates.length === 0">
                <td :colspan="6" class="state-cell">No matching candidates found.</td>
              </tr>
              <tr v-for="(candidate, index) in paginatedCandidates" :key="candidate.cid">
                <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>{{ candidate.name }}</td>
                <td>{{ candidate.cid }}</td>
                <td>{{ candidate.lastAssessedDate }}</td>
                <td>
                  <span class="status-badge" :class="getReferralStatusClass(candidate.referralStatus)">
                    {{ candidate.referralStatus }}
                  </span>
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
  
      <div class="modal fade" id="detailsModal" tabindex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true" ref="detailsModalRef">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content" v-if="selectedCandidate">
            <div class="modal-header">
              <h5 class="modal-title" id="detailsModalLabel">
                Details for {{ selectedCandidate.name }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div v-if="selectedCandidate.referralStatus === 'Referred'">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <div class="modal-card">
                      <div class="modal-card-header">Case Overview</div>
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item d-flex justify-content-between align-items-center"><strong>Case Status:</strong> <span class="status-badge status-fit">{{ selectedCandidate.caseStatus }}</span></li>
                        <li class="list-group-item d-flex justify-content-between align-items-center"><strong>Follow-up:</strong> <span class="status-badge status-pending">{{ selectedCandidate.followUpStatus }}</span></li>
                        <li class="list-group-item"><strong>Referred To:</strong><br>{{ selectedCandidate.referredTo }}</li>
                      </ul>
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                     <div class="modal-card">
                      <div class="modal-card-header">History Log</div>
                      <ul class="list-group list-group-flush small" style="max-height: 130px; overflow-y: auto;">
                        <li v-for="(item, i) in selectedCandidate.historyLog" :key="i" class="list-group-item">{{ item.date }}: {{ item.event }}</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <h6 class="modal-section-title">Service & Treatment History</h6>
                <div class="table-wrapper-modal">
                  <table class="modal-table">
                    <thead><tr><th>Date</th><th>Service</th><th>Notes</th></tr></thead>
                    <tbody>
                      <tr v-for="(item, i) in selectedCandidate.treatmentHistory" :key="i">
                        <td>{{ item.date }}</td><td>{{ item.service }}</td><td>{{ item.notes }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-else>
                <p>Candidate assessed on <strong>{{ selectedCandidate.lastAssessedDate }}</strong> and found to be unfit based on initial screening criteria.</p>
                <h6 class="modal-section-title">Severity Details</h6>
                <div class="row">
                  <div class="col-sm-6 col-lg-3 mb-3" v-for="(detail, key) in selectedCandidate.severityDetails" :key="key">
                    <div class="modal-card text-center h-100">
                      <div class="modal-card-header text-uppercase">{{ key }}</div>
                      <div class="d-flex flex-column justify-content-center flex-grow-1 p-2">
                        <h5 class="score-title">{{ detail.score }}</h5>
                        <p class="mb-0"><span class="status-badge" :class="getSeverityBadgeClass(detail.level)">{{ detail.level }}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button v-if="selectedCandidate.referralStatus !== 'Referred'" @click="openReferModal" class="btn btn-primary">
                <i class="fas fa-share-square me-1"></i>Refer to Counselor
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <div class="modal fade" id="referModal" tabindex="-1" aria-labelledby="referModalLabel" aria-hidden="true" ref="referModalRef">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content" v-if="selectedCandidate">
            <div class="modal-header"><h5 class="modal-title" id="referModalLabel">Refer {{ selectedCandidate.name }}</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">
              <p>Please select a Clinical Counselor to refer this case to.</p>
              <div class="form-group"><label for="counselorSelect" class="form-label">Clinical Counselor</label><select id="counselorSelect" class="form-select" v-model="selectedCounselor"><option disabled value="">-- Please select --</option><option v-for="counselor in counselors" :key="counselor.name" :value="counselor.name">{{ counselor.name }} ({{ counselor.agency }})</option></select></div>
            </div>
            <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button type="button" class="btn btn-success" @click="handleReferral" :disabled="!selectedCounselor">Confirm Referral</button></div>
          </div>
        </div>
      </div>
    </div>
  </template>


  <script setup>
  // 1. IMPORT `onUnmounted`
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { Modal } from 'bootstrap';
  
  const searchQuery = ref('');
  const currentPage = ref(1);
  const itemsPerPage = 5;
  const selectedCandidate = ref(null);
  const selectedCounselor = ref('');
  const detailsModalRef = ref(null);
  let detailsModalInstance = null;
  const referModalRef = ref(null);
  let referModalInstance = null;
  
  const counselors = ref([
      { name: 'Dr. Yeshey Dorji', agency: 'JDWNRH, Thimphu' },
      { name: 'Ms. Pema Choden', agency: 'Mongar RRH, Mongar' },
  ]);
  
  const unfitCandidates = ref([
      { name: 'Kinley Dorji', cid: '11204009876', lastAssessedDate: '01-Feb-25', referralStatus: 'Not Referred', severityDetails: { phq: { score: 18, level: 'Severe' }, gad: { score: 15, level: 'Severe' }, assist: { score: 12, level: 'Moderate' }, psychometric: { score: 88, level: 'High Risk' } } },
      { name: 'Ugyen Tshering', cid: '11808001122', lastAssessedDate: '20-Mar-25', referralStatus: 'Referred', caseStatus: 'Open', followUpStatus: 'Scheduled', referredTo: 'Dr. Yeshey Dorji (JDWNRH, Thimphu)', treatmentHistory: [{ date: '22-Mar-25', service: 'Initial Consultation', notes: 'Patient cooperative.' }], historyLog: [{ date: '21-Mar-25', event: 'Case referred to Dr. Yeshey Dorji.' }, { date: '20-Mar-25', event: 'Marked as Unfit.' }] },
      { name: 'Jigme Singye', cid: '11405005566', lastAssessedDate: '05-Mar-25', referralStatus: 'Not Referred', severityDetails: { phq: { score: 11, level: 'Moderate' }, gad: { score: 9, level: 'Mild' }, assist: { score: 5, level: 'Low' }, psychometric: { score: 65, level: 'Moderate Risk' } } },
      { name: 'Dawa Pem', cid: '10203004455', lastAssessedDate: '10-Apr-25', referralStatus: 'Referred', caseStatus: 'Closed', followUpStatus: 'Completed', referredTo: 'Ms. Pema Choden (Mongar RRH, Mongar)', treatmentHistory: [ { date: '15-Apr-25', service: 'CBT Session 1', notes: 'Progress noted.' }], historyLog: [{ date: '12-Apr-25', event: 'Case referred to Ms. Pema Choden.' }] },
  ]);
  
  onMounted(() => {
    if (detailsModalRef.value) detailsModalInstance = new Modal(detailsModalRef.value);
    if (referModalRef.value) referModalInstance = new Modal(referModalRef.value);
  });
  
  // 2. ADD THE onUnmounted HOOK FOR CLEANUP
  onUnmounted(() => {
    detailsModalInstance?.dispose();
    referModalInstance?.dispose();
  });
  
  const filteredCandidates = computed(() => {
    if (!searchQuery.value) return unfitCandidates.value;
    const lowerCaseQuery = searchQuery.value.toLowerCase();
    return unfitCandidates.value.filter(c =>
      c.name.toLowerCase().includes(lowerCaseQuery) || c.cid.toLowerCase().includes(lowerCaseQuery)
    );
  });
  
  const totalPages = computed(() => Math.ceil(filteredCandidates.value.length / itemsPerPage));
  
  const paginatedCandidates = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCandidates.value.slice(start, end);
  });
  
  const setPage = (page) => {
    if (page > 0 && page <= totalPages.value) currentPage.value = page;
  };
  
  const viewDetails = (candidate) => {
    selectedCandidate.value = candidate;
    detailsModalInstance?.show();
  };
  
  const openReferModal = () => {
    selectedCounselor.value = '';
    detailsModalInstance?.hide();
    referModalInstance?.show();
  };
  
  const handleReferral = () => {
    if (!selectedCandidate.value || !selectedCounselor.value) return;
    const candidateInList = unfitCandidates.value.find(c => c.cid === selectedCandidate.value.cid);
    if (candidateInList) {
      const counselorObj = counselors.value.find(c => c.name === selectedCounselor.value);
      const referredToText = `${counselorObj.name} (${counselorObj.agency})`;
      candidateInList.referralStatus = 'Referred';
      candidateInList.caseStatus = 'Open';
      candidateInList.followUpStatus = 'Pending';
      candidateInList.referredTo = referredToText;
      candidateInList.treatmentHistory = [];
      candidateInList.historyLog = [
        { date: new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'2-digit'}).replace(/ /g, '-'), event: `Case referred to ${selectedCounselor.value}.` },
        { date: candidateInList.lastAssessedDate, event: 'Marked as Unfit.' }
      ];
      delete candidateInList.severityDetails;
    }
    referModalInstance?.hide();
    alert(`Successfully referred ${selectedCandidate.value.name} to ${selectedCounselor.value}.`);
  };
  
  const getReferralStatusClass = (status) => {
      return status === 'Referred' ? 'status-referred' : 'status-not-referred';
  };
  
  const getSeverityBadgeClass = (level) => {
    const lvl = level.toLowerCase();
    if (lvl.includes('severe') || lvl.includes('high')) return 'status-unfit';
    if (lvl.includes('moderate')) return 'status-pending';
    return 'status-fit';
  };
  
  watch(searchQuery, () => { currentPage.value = 1; });
  </script>
  
  <style scoped>
  /* Core Styles */
  .monitoring-container {
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    border-radius: 16px;
    padding: 2rem;
    font-family: sans-serif;
  }
  .form-header { text-align: center; margin-bottom: 2rem; }
  .title { color: #2b656f; font-weight: 600; }
  .content-section { background: #ffffff; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 20px rgba(43, 101, 111, 0.08); }
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
  .action-btn { background-color: #f5f9fa; color: #3e5a60; border: 1px solid #d3e0e3; padding: 0.4rem 0.9rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 500; transition: all 0.2s ease; }
  .action-btn:hover { background-color: #2b656f; color: #ffffff; border-color: #2b656f; }
  
  /* Status Badges */
  .status-badge { display: inline-block; padding: 0.3rem 0.8rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500; text-transform: capitalize; }
  .status-referred { background-color: #e3f2fd; color: #1e88e5; }
  .status-not-referred { background-color: #f5f5f5; color: #757575; }
  .status-unfit { background-color: #ffebee; color: #e53935; } /* Severe/High */
  .status-pending { background-color: #fff8e1; color: #ffb300; } /* Moderate */
  .status-fit { background-color: #e8f5e9; color: #43a047; } /* Low/Mild/Open/Closed */
  
  /* Custom Pagination */
  .pagination-nav { display: flex; justify-content: flex-end; margin-top: 1rem; }
  .pagination-list { display: flex; list-style: none; padding: 0; margin: 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(43, 101, 111, 0.07); overflow: hidden; }
  .page-item .page-link { padding: 0.5rem 1rem; color: #2b656f; background-color: #fff; border-left: 1px solid #e9f1f3; text-decoration: none; transition: background-color 0.2s ease; }
  .page-item:first-child .page-link { border-left: none; }
  .page-item:not(.disabled) .page-link:hover { background-color: #f5f9fa; }
  .page-item.active .page-link { background-color: #2b656f; color: #fff; font-weight: 600; }
  .page-item.disabled .page-link { color: #adb5bd; pointer-events: none; background-color: #f8f9fa; }
  
  /* Modal specific styles */
  .modal-header { background-color: #f8f9fa; border-bottom: 1px solid #dee2e6; color: #2b656f;}
  .modal-section-title { font-size: 1.1rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 1rem; color: #2b656f; }
  .modal-card { border: 1px solid #dee2e6; border-radius: 8px; background-color: #fff; }
  .modal-card-header { background-color: #f8f9fa; font-weight: 600; padding: 0.5rem 1rem; border-bottom: 1px solid #dee2e6; font-size: 0.9rem; }
  .modal-table { font-size: 0.9rem; width: 100%; }
  .modal-table th, .modal-table td { padding: 0.5rem; border: 1px solid #e9ecef; }
  .modal-table thead { background-color: #e9ecef; }
  .table-wrapper-modal { border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; }
  .score-title { font-size: 1.5rem; font-weight: 700; color: #2b656f; margin-bottom: 0.25rem; }
  .btn-primary { background-color: #2b656f; border-color: #2b656f; }
  .btn-primary:hover { background-color: #1d4851; border-color: #1d4851; }
  </style>