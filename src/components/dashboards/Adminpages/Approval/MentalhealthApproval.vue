<template>
  <div class="container my-5">
    <!-- Tabs for Pending Request and Records of Approval -->
    <ul class="nav nav-tabs justify-content-center mb-3" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link btn-lg" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">Pending Request</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link btn-lg" :class="{ active: activeTab === 'approval' }" @click="activeTab = 'approval'">Records of Approval</button>
      </li>
    </ul>

    <!-- Tab content -->
    <div class="tab-content">
      <!-- Pending Request tab content -->
      <div class="tab-pane fade" :class="{ 'show active': activeTab === 'pending' }" id="pending" role="tabpanel" aria-labelledby="pending-tab">
        <div class="input-group mb-3">
          <input type="text" class="form-control" placeholder="Search" aria-label="Search" aria-describedby="search-addon" v-model="searchQuery" />
          <button class="btn btn-outline-secondary" type="button" id="search-addon" @click="searchRecords">Search</button>
        </div>
        <!-- Table for Pending Request -->
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
              <td><button class="btn btn-primary" @click="showApprovalPopup(record)">Process for Approval</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Records of Approval tab content -->
      <div class="tab-pane fade" :class="{ 'show active': activeTab === 'approval' }" id="approval" role="tabpanel" aria-labelledby="approval-tab">
        <div class="input-group mb-3">
          <input type="text" class="form-control" placeholder="Search" aria-label="Search" aria-describedby="search-addon" v-model="searchQueryApproval" />
          <button class="btn btn-outline-secondary" type="button" id="search-addon" @click="searchRecordsApproval">Search</button>
        </div>
        <!-- Table for Records of Approval -->
        <table class="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Event Name</th>
              <th>Tools Used</th>
              <th>Duration</th>
              <th>Processed By</th>
            </tr>
          </thead>
          <!-- Table body -->
          <tbody>
            <!-- Loop through filtered records -->
            <tr v-for="record in filteredRecordsApproval" :key="record.id">
              <td>{{ record.date }}</td>
              <td>{{ record.eventName }}</td>
              <td>{{ record.toolsUsed }}</td>
              <td>{{ record.duration }}</td>
              <td>{{ record.Status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Approval Modal -->
    <div v-if="outerVisible" class="approval-modal">
      <div class="modal-content">
        <span class="close" @click="outerVisible = false">&times;</span>
        <p>Event Name: {{ selectedRecord.eventName }}</p>
        <p>Tools to be Used: {{ selectedRecord.toolsUsed }}</p>
        <p>Duration: {{ selectedRecord.duration }}</p>
        <p>Submitted By: {{ selectedRecord.submittedBy }}</p>
        <div class="text-center">
          <button class="btn btn-primary" @click="openInnerDialog('accept')">Accept</button>
          <button class="btn btn-success" @click="acceptApproval">Reject</button>
        </div>
      </div>
      <!-- Inner Dialog for Comment -->
      <div v-if="innerVisible && approvalAction === 'accept'" class="inner-modal">
        <div class="modal-content">
          <span class="close" @click="innerVisible = false">&times;</span>
          <h2>Add Comment</h2>
          <textarea v-model="comment" class="form-control" rows="4"></textarea>
          <div class="text-center">
            <button class="btn btn-primary" @click="saveComment">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Sample data for Pending Request
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

// Sample data for Records of Approval
const recordsApproval = ref([
  {
    id: 1,
    date: '21/02/24',
    eventName: 'Empower Wellness Summit',
    toolsUsed: 'Mental Health, SUD',
    duration: '5 days',
    Status: 'Rejected'
  },
  {
    id: 2,
    date: '21/02/24',
    eventName: 'Empower Wellness Summit',
    toolsUsed: 'Mental Health, SUD',
    duration: '5 days',
    Status: 'Approved'
  },
  // Add more records as needed
])

// Define search queries for both tabs
const searchQuery = ref('')
const searchQueryApproval = ref('')

// Function to filter records based on search query for Pending Request
const filteredRecords = computed(() => {
  return records.value.filter(record =>
    record.eventName.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Function to filter records based on search query for Records of Approval
const filteredRecordsApproval = computed(() => {
  return recordsApproval.value.filter(record =>
    record.eventName.toLowerCase().includes(searchQueryApproval.value.toLowerCase())
  )
})

// Function to perform search operation for Pending Request
const searchRecords = () => {
  // Perform search operation
}

// Function to perform search operation for Records of Approval
const searchRecordsApproval = () => {
  // Perform search operation
}

// Active tab
const activeTab = ref('pending')

// Approval Modal related data and methods
const outerVisible = ref(false)
const innerVisible = ref(false)
const selectedRecord = ref(null)
const comment = ref('')
const approvalAction = ref('') // To track the approval action

// Function to show the approval popup with selected record data
const showApprovalPopup = (record) => {
  selectedRecord.value = record;
  outerVisible.value = true;
};

// Function to open inner dialog for adding comment
const openInnerDialog = (action) => {
  innerVisible.value = true;
  approvalAction.value = action;
};

// Function to handle Accept action for approval
const acceptApproval = () => {
  console.log('Approval accepted for:', selectedRecord.value);
  outerVisible.value = false;
};

// Function to handle Reject action for approval
const rejectApproval = () => {
  console.log('Approval rejected for:', selectedRecord.value);
  outerVisible.value = false;
};

// Function to save the comment
const saveComment = () => {
  console.log('Comment saved:', comment.value);
  innerVisible.value = false;
};
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

.custom-table th,
.custom-table td {
  padding: 15px; /* Increased padding for space */
  text-align: left;
  border: none; /* Remove borders */
}

.custom-table tr:hover {
  background-color: #e6e6e6;
}

button {
  background-color: #34ab81;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #39c8c8;
}

.approval-modal {
  display: block;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 50%;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.inner-modal {
  display: block;
  position: fixed;
  z-index: 2;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.4);
}

.inner-modal .modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 30%;
}
</style>
