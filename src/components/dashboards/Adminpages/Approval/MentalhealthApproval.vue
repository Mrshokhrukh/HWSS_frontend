<template>
  <div class="container my-5">
    <!-- Tabs for Pending Request and Records of Approval -->
    <ul class="nav nav-tabs justify-content-center mb-3" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link btn-lg p-4" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">Pending Request</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link btn-lg p-4" :class="{ active: activeTab === 'approval' }" @click="activeTab = 'approval'">Records of Approval</button>
      </li>
    </ul>

    <!-- Tab content -->
    <div class="tab-content">
      <!-- Pending Request tab content -->
      <div class="tab-pane fade" :class="{ 'show active': activeTab === 'pending' }" id="pending" role="tabpanel" aria-labelledby="pending-tab">
        <PendingRequest v-if="activeTab === 'pending'" />
      </div>

      <!-- Records of Approval tab content -->
      <div class="tab-pane fade" :class="{ 'show active': activeTab === 'approval' }" id="approval" role="tabpanel" aria-labelledby="approval-tab">
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
</script>

<style scoped>
.btn-lg {
  font-size: 20px; /* Increase the font size */
  padding: 16px 24px; /* Increase padding for bigger buttons */
}
</style>
