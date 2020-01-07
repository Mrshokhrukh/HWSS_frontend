<template>
    <div class="referral-manager">
        <div class="container-fluid p-4">
            <!-- Header Controls -->
            <div class="row g-3 mb-4 align-items-end">
                <!-- Dropdown Selection -->
                <div class="col-md-4">
                    <div class="select-wrapper">
                        <select v-model="selectedValue" class="form-select form-select-lg shadow-sm"
                            aria-label="Select referral type">
                            <option value="referralRequests">Referral Requests</option>
                            <option value="referralList">Referral List</option>
                            <option value="referralAccepted">Referral Accepted</option>
                        </select>
                    </div>
                </div>

                <!-- Search Box -->
                <div class="col-md-8">
                    <div class="search-box">
                        <div class="input-group input-group-lg shadow-sm">
                            <span class="input-group-text bg-white border-end-0">
                                <i class="bi bi-search text-muted"></i>
                            </span>
                            <input type="text" class="form-control border-start-0" v-model="searchQuery"
                                placeholder="Search by name..." aria-label="Search referrals">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Table Component -->
            <div class="table-container shadow-sm rounded">
                <component :is="selectedTable" :referrals="filteredReferrals" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import ReferralListTable from './ReferralListTable.vue';
import ReferralRequestsTable from './ReferralRequestsTable.vue';
import ReferralAcceptedTable from './ReferralAcceptedTable.vue';

// Search Query
const searchQuery = ref('');

// Referral Data
const referrals = ref([
    { id: 1, name: 'John Doe', date: '2023-10-15', status: 'Pending' },
    { id: 2, name: 'Jane Smith', date: '2022-05-20', status: 'Accepted' },
    { id: 3, name: 'Alice Johnson', date: '2023-03-10', status: 'Pending' },
    { id: 4, name: 'Bob Brown', date: '2021-12-01', status: 'Rejected' },
]);

// Filter Referrals by Search Query
const filteredReferrals = computed(() => {
    return referrals.value.filter(referral => {
        return referral.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    });
});

// Table Selection
const selectedValue = ref('referralList');
const selectedTable = ref(ReferralRequestsTable);

watchEffect(() => {
    switch (selectedValue.value) {
        case 'referralList':
            selectedTable.value = ReferralListTable;
            break;
        case 'referralAccepted':
            selectedTable.value = ReferralAcceptedTable;
            break;
        default:
            selectedTable.value = ReferralRequestsTable;
    }
});
</script>

<style scoped>
.referral-manager {
    background-color: #f8f9fa;
    min-height: 100%;
    padding: 1.5rem 0;
}

.select-wrapper select {
    background-color: white;
    border-color: #dee2e6;
}

.search-box .input-group {
    background-color: white;
}

.search-box .input-group-text {
    border-color: #dee2e6;
}

.search-box .form-control {
    border-color: #dee2e6;
}

.search-box .form-control:focus {
    box-shadow: none;
    border-color: #86b7fe;
}

.search-box .input-group-text:focus-within {
    border-color: #86b7fe;
}

.table-container {
    background-color: white;
    border: 1px solid #dee2e6;
    overflow: hidden;
}

/* Custom focus states */
.form-select:focus {
    border-color: #86b7fe;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .referral-manager {
        padding: 1rem 0;
    }
}
</style>