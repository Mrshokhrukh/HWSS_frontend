<!-- ApprovalView.vue -->
<template>
    <div v-if="hasAccess" class="container-fluid my-5">
        <!-- Buttons for Pending Request and Records of Approval -->
        <div v-if="showTabs" class="row mb-2">
            <div class="mx-auto col-6 mx-auto text-center p-2 tab-container">
                <button v-for="tab in visibleTabs" :key="tab.key" :class="{
                    'col-3 btn tab-btn p-3': true,
                    'w-100': visibleTabs.length === 1,
                    'w-50': visibleTabs.length === 2,
                    'active': activeTab === tab.key
                }" @click="changeTab(tab.key)">
                    {{ tab.label }}
                </button>
            </div>
        </div>

        <!-- Tab content -->
        <div class="tab-content">
            <!-- Pending Request tab content - only for mh_admin -->
            <div v-if="isMhAdmin" class="tab-pane fade" :class="{ 'show active': activeTab === 'pending' }" id="pending"
                role="tabpanel" aria-labelledby="pending-tab">
                <PendingRequest v-if="activeTab === 'pending'" />
            </div>

            <!-- Records of Approval tab content -->
            <div class="tab-pane fade" :class="{ 'show active': activeTab === 'approval' }" id="approval"
                role="tabpanel" aria-labelledby="approval-tab">
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
    <!-- Access Denied Message -->
    <div v-else class="container text-center my-5">
        <div class="alert alert-warning" role="alert">
            You don't have access to this section.
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import PendingRequest from "./PendingRequest.vue";
import RecordsOfApproval from "./RecordsOfApproval.vue";

// Get user role from localStorage
const getUserRole = () => {
    try {
        const userDetails = JSON.parse(localStorage.getItem('userDetailsStore'));
        return userDetails?.user?.role || '';
    } catch (error) {
        console.error('Error getting user role:', error);
        return '';
    }
};

// Role-based computations
const userRole = ref(getUserRole());

// Check if user has access to this page
const hasAccess = computed(() => {
    return ['mh_admin', 'sud_admin'].includes(userRole.value);
});

// Check if user is mh_admin
const isMhAdmin = computed(() => userRole.value === 'mh_admin');

// All possible tabs
const allTabs = [
    { key: 'pending', label: 'Pending Request' },
    { key: 'approval', label: 'Records of Approval' }
];

// Visible tabs based on role
const visibleTabs = computed(() => {
    if (isMhAdmin.value) {
        return allTabs;
    }
    return allTabs.filter(tab => tab.key === 'approval');
});

// Show tabs only if there's more than one tab for the role
const showTabs = computed(() => {
    return isMhAdmin.value; // Only show tabs for mh_admin
});

// Active tab - default to 'approval' for sud_admin
const activeTab = ref(isMhAdmin.value ? 'pending' : 'approval');

// Modal visibility
const modalVisible = ref(false);

// Function to change active tab
const changeTab = (tabKey) => {
    activeTab.value = tabKey;
};

// Update role when component mounts
onMounted(() => {
    userRole.value = getUserRole();
});
</script>

<style scoped>
.tab-container {
    background: #00000014;
    border-radius: 10px;
}

.tab-btn {
    transition: all 0.3s ease;
    border: none;
    color: #495057;
}

/* Active button styling */
.tab-btn.active {
    background-color: #fff;
    color: #2B656F;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Inactive button styling */
.tab-btn:not(.active) {
    background-color: transparent;
}

.tab-btn:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.5);
}

/* Modal styles */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    position: relative;
}

.close {
    position: absolute;
    right: 10px;
    top: 10px;
    cursor: pointer;
    font-size: 1.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .col-6 {
        width: 90%;
    }

    .tab-btn {
        padding: 0.75rem !important;
        font-size: 0.9rem;
    }
}
</style>