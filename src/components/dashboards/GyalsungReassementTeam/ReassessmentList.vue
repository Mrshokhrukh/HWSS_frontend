<template>
    <!-- Conditionally render the screening component -->
    <CounselorRescreening 
        v-if="isReassessing" 
        @back-to-list="handleBackToList" 
    />
  
    <!-- Or render the Reassessment List -->
    <div v-else class="reassessment-container">
        <div class="form-header">
            <h3 class="title">Reassessment List</h3>
        </div>

        <div class="content-section">
            <div class="search-bar-container">
                <i class="fas fa-search search-icon"></i>
                <input v-model="searchQuery" type="text" class="search-input" placeholder="Search by Name, CID, or Hospital..." />
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

                        <tr v-for="(entrant, index) in filteredEntrants" :key="entrant.cid">
                            <td>{{ index + 1 }}</td>
                            <td>{{ entrant.name }}</td>
                            <td>{{ entrant.cid }}</td>
                            <td>{{ entrant.dob }}</td>
                            <td>{{ entrant.contact }}</td>
                            <td>{{ entrant.appointmentDate }}</td>
                            <td>{{ entrant.hospital }}</td>
                            <td>
                                <span :class="getStatusClass(entrant.status)" class="status-badge">
                                    {{ entrant.status }}
                                </span>
                            </td>
                            <td>
                                <button 
                                    v-if="entrant.status === 'Pending'" 
                                    @click="startReassessment(entrant)"
                                    class="action-btn"
                                >
                                    Reassess
                                </button>
                                <span v-else class="action-placeholder">-</span>
                            </td>
                        </tr>

                        <tr v-if="!loading && filteredEntrants.length === 0 && !error">
                            <td colspan="9" class="state-cell">
                                {{ searchQuery ? 'No records found matching your search' : 'No records found' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { ref, computed, onMounted } from 'vue';
// 1. Import the reusable screening component
import CounselorRescreening from '@/components/dashboards/counselorRescreenings/CounselorRescreening.vue';

// 2. Add state to manage which view is active
const isReassessing = ref(false);
const selectedEntrant = ref(null);

const searchQuery = ref('');
const loading = ref(true);
const error = ref('');

// Mock data...
const entrants = ref([
    { name: 'Pema Yangden', cid: '10506000020', dob: '11-Apr-06', contact: '97517629899', appointmentDate: '3-Feb-25', hospital: 'Paro Hospital, Paro', status: 'Pending' },
    { name: 'Narath Basnet', cid: '11101007969', dob: '10-Feb-06', contact: '97517629890', appointmentDate: '1-Feb-25', hospital: 'Central Regional Referral Hospital, Gelephu', status: 'Pending' },
    { name: 'Karma Choden', cid: '11204001234', dob: '22-May-05', contact: '97517112233', appointmentDate: '5-Mar-25', hospital: 'JDWNRH, Thimphu', status: 'Pending' },
    { name: 'Pema Yangden', cid: '10506000021', dob: '11-Apr-06', contact: '97517629899', appointmentDate: '1-Feb-25', hospital: 'Paro Hospital, Paro', status: 'Completed' }
]);

const filteredEntrants = computed(() => {
    if (!searchQuery.value) return entrants.value;
    const lowerCaseQuery = searchQuery.value.toLowerCase();
    return entrants.value.filter(e => 
        e.name.toLowerCase().includes(lowerCaseQuery) ||
        e.cid.toLowerCase().includes(lowerCaseQuery) ||
        e.hospital.toLowerCase().includes(lowerCaseQuery)
    );
});

const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
        case 'completed': return 'status-completed';
        case 'pending': return 'status-pending';
        default: return 'status-default';
    }
};

// 3. Update the startReassessment function
const startReassessment = (entrant) => {
    console.log(`Navigating to screening for ${entrant.name} (CID: ${entrant.cid})`);
    selectedEntrant.value = entrant;

    // The screening components need user data in sessionStorage to function.
    sessionStorage.setItem('RescreeningUserID', JSON.stringify(entrant.cid));
    
    // You should calculate the age group from DOB for accuracy.
    // For this example, we'll use a placeholder.
    const userAgeData = { ageGroup: '15 to 17' }; 
    sessionStorage.setItem('userAgeData', JSON.stringify(userAgeData));

    // Switch the view to the screening component
    isReassessing.value = true;
};

// 4. Add a function to handle returning to the list
const handleBackToList = () => {
    isReassessing.value = false;
    selectedEntrant.value = null;

    // Clean up session storage to prevent data leaks
    sessionStorage.removeItem('RescreeningUserID');
    sessionStorage.removeItem('userAgeData');
};

onMounted(() => {
    setTimeout(() => { loading.value = false; }, 1000);
});
</script>
  
<style scoped>
/* All your existing styles remain unchanged */
.reassessment-container {
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
.error-alert { background-color: #fdeeee; color: #c93d3d; border: 1px solid #f8c9c9; border-radius: 8px; padding: 1rem; margin-bottom: 2rem; }
.table-wrapper { overflow-x: auto; }
.profiles-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
.profiles-table thead { background-color: #2b656f; color: #ffffff; }
.profiles-table th { padding: 1rem; text-align: left; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
.profiles-table td { padding: 1rem; vertical-align: middle; color: #3e5a60; font-size: 0.9rem; }
.profiles-table tbody tr { border-bottom: 1px solid #e9f1f3; transition: background-color 0.2s ease-in-out; }
.profiles-table tbody tr:last-child { border-bottom: none; }
.profiles-table tbody tr:hover { background-color: #f5f9fa; }
.status-badge { display: inline-block; padding: 0.3rem 0.8rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500; text-transform: capitalize; }
.status-completed { background-color: #e8f5e9; color: #43a047; }
.status-pending { background-color: #fff8e1; color: #ffb300; }
.status-default { background-color: #f5f5f5; color: #757575; }
.action-btn { background-color: #2b656f; color: white; border: none; padding: 0.4rem 0.9rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 500; transition: background-color 0.2s ease; }
.action-btn:hover { background-color: #1d4851; }
.action-placeholder { color: #9ab0b5; font-size: 0.9rem; }
.state-cell { text-align: center; color: #7d979d; padding: 3rem 1rem; font-style: italic; display: flex; justify-content: center; align-items: center; gap: 0.75rem; }
.loader { width: 20px; height: 20px; border: 2px solid #2b656f; border-bottom-color: transparent; border-radius: 50%; display: inline-block; box-sizing: border-box; animation: rotation 1s linear infinite; }
@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>