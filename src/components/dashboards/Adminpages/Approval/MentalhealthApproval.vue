<template>
  <div class="container-fluid my-5">
    <!-- Buttons for Pending Request and Records of Approval -->
    <div class="row mb-2">
      <div class="mx-auto col-6 mx-auto text-center p-2 tab-container">
        <button v-for="(tab, index) in tabs" :key="index"
          :class="{ 'col-3 btn tab-btn p-3 w-50': true, 'active': activeTab === tab.key }" @click="changeTab(tab.key)">
          {{ tab.label }}
        </button>
      </div>  
    </div>

    <!-- Tab content -->
    <div class="tab-content">
      <!-- Pending Request tab content -->
      <div class="tab-pane fade" :class="{ 'show active': activeTab === 'pending' }" id="pending" role="tabpanel"
        aria-labelledby="pending-tab">
        <PendingRequest v-if="activeTab === 'pending'" />
      </div>

      <!-- Records of Approval tab content -->
      <div class="tab-pane fade" :class="{ 'show active': activeTab === 'approval' }" id="approval" role="tabpanel"
        aria-labelledby="approval-tab">
        <RecordsOfApproval v-if="activeTab === 'approval'" />
      </div>
    </div>

    <!-- Approval Modal -->
    <div v-if="modalVisible" class="modal">
      <div class="modal-content">
        <span class="close" @click="modalVisible = false">&times;</span>
        <p>Modal Content</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PendingRequest from "./PendingRequest.vue";
import RecordsOfApproval from "./RecordsOfApproval.vue";

// Active tab
const activeTab = ref('pending');

// Modal visibility
const modalVisible = ref(false);

// Tabs configuration
const tabs = [
  { key: 'pending', label: 'Pending Request' },
  { key: 'approval', label: 'Records of Approval' }
];

// Function to change active tab
const changeTab = (tabKey) => {
  activeTab.value = tabKey;
}
</script>

<style scoped>
.tab-container{
  background: #00000014;
  border-radius: 10px;
}
/* Active button styling */
.tab-btn.active {
  background-color: #fff;
  /* Active button color */
}

/* Inactive button styling */
.tab-btn:not(.active) {
  background-color: transparent;
}
</style>
