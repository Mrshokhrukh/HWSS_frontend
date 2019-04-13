<template>
    <div>
        <div class="row mb-4 d-flex justify-content-end">
            <div class="col-md-6">
                <div class="input-group rounded">
                    <select class="form-select" v-model="selectedValue">
                        <option value="referralList">Referral List</option>
                        <option value="referralRequests">Referral Requests</option>
                        <option value="referralAccepted">Referral Accepted</option>
                    </select>
                    <input type="text" class="form-control p-4" placeholder="Search Name">
                    <button class="btn btn-outline-secondary" type="button">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="row">
            <!-- <h5 class="card-title">{{ selectedValue }}</h5> -->
            <component :is="selectedTable" :referrals="referrals"></component>
        </div>
        <div class="row mt-4 d-flex justify-content-end">
            <button class="btn hwss-btn col-1" @click="saveChanges">Save Changes</button>
        </div>
    </div>
</template>
  
<script setup>
import { ref, watchEffect } from 'vue';

import ReferralListTable from './ReferralListTable.vue';
import ReferralRequestsTable from './ReferralRequestsTable.vue';
import ReferralAcceptedTable from './ReferralAcceptedTable.vue';

const referrals = ref([]);
const selectedValue = ref('referralList');

const selectedTable = ref(ReferralListTable);

const saveChanges = async () => {
    // Implement saveChanges logic
};


watchEffect(() => {
    switch (selectedValue.value) {
        case 'referralRequests':
            selectedTable.value = ReferralRequestsTable;
            break;
        case 'referralAccepted':
            selectedTable.value = ReferralAcceptedTable;
            break;
        default:
            selectedTable.value = ReferralListTable;
    }
});
</script>
  