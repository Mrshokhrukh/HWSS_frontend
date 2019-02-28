<template>
    <div class="card">
        <div class="card-header">
            <h5 style="color: #2B656F; font-weight: bold">Personal Details</h5>
        </div>
        <div class="card-body">
            <div class="row">
                <div v-if="notification.show" :class="`notification ${notification.type}`">
                    {{ notification.message }}
                </div>
            </div>
            <div class="row g-3">
                <div class="col-md-6">
                    <label>Citizenship Identity Number</label>
                    <input type="text" class="form-control input-noneditable" readonly disabled
                        v-model="userDetails.user.identityNumber">
                </div>
                <div class="col-md-6">
                    <label>Email</label>
                    <input type="email" class="form-control input-noneditable" readonly disabled
                        v-model="userDetails.user.email">
                </div>
                <div class="col-md-6">
                    <label>Phone</label>
                    <input type="text" class="form-control input-noneditable" readonly disabled
                        v-model="userDetails.user.phone">
                </div>
                <div class="col-md-6">
                    <label>Nationality</label>
                    <input type="text" class="form-control input-noneditable" readonly disabled
                        v-model="userDetails.user.nationality">
                </div>
                <div class="card-header">
                    <h5 style="color: #2B656F; font-weight: bold">Parents Details</h5>
                </div>
                <div class="col-md-6">
                    <label>Mother's Name</label>
                    <input type="text" class="form-control input-noneditable" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.user.motherName">
                </div>
                <div class="col-md-6">
                    <label>Father's Name</label>
                    <input type="text" class="form-control input-noneditable" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.user.fatherName">
                </div>
                <div class="col-md-6">
                    <label>Mother's Occupation</label>
                    <input type="text" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.user.motherOccupation">
                </div>
                <div class="col-md-6">
                    <label>Father's Occupation</label>
                    <input type="text" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.user.fatherOccupation">
                </div>
                <div class="col-md-6">
                    <label>Parent's Status</label>
                    <select class="form-select" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.user.parentalStatus">
                        <option value="single">Single Parent</option>
                        <option value="married">Married/Together</option>
                        <option value="divorced">Divorced</option>
                        <option value="dead">One of the Parent Dead</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label>Guardian Name (Optional)</label>
                    <input type="text" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.user.guardianName">
                </div>
                <div class="col-md-6">
                    <label>Guardian Occupation (Optional)</label>
                    <input type="text" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.user.guardianOccupation">
                </div>
                <div class="card-header">
                    <h5 style="color: #2B656F; font-weight: bold">Permanent Address</h5>
                </div>
                <div class="col-md-6">
                    <label>Village</label>
                    <input type="text" class="form-control input-noneditable" readonly disabled
                        v-model="userDetails.user.permAddVillage">
                </div>
                <div class="col-md-6">
                    <label>Gewog</label>
                    <input type="text" class="form-control input-noneditable" readonly disabled
                        v-model="userDetails.user.permAddGewog">
                </div>
                <div class="col-md-6">
                    <label>Dzongkhag</label>
                    <input type="text" class="form-control input-noneditable" readonly disabled
                        v-model="userDetails.user.permAddDzongkhag">
                </div>
                <div class="card-header">
                    <h5 style="color: #2B656F; font-weight: bold">Present Address</h5>
                </div>
                <div class="col-md-6">
                    <label>Currently Living With</label>
                    <select class="form-select" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.user.currentLivingWith">
                        <option value="parents">Parents</option>
                        <option value="guardian">Guardian</option>
                        <option value="sibling">Elder Sibling(s)</option>
                        <option value="others">Others(s)</option>
                    </select>
                </div>
                <!-- Conditional field that should appear if 'others' is selected -->
                <div v-if="userDetails.user.currentLivingWith === 'others'" class="col-md-6">
                    <label>Please Specify with whom you live with</label>
                    <input type="text" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.user.otherLivingWith">
                </div>
                <!-- Class for Present Address is conditional -->
                <div :class="userDetails.user.currentLivingWith === 'others' ? 'col-md-12' : 'col-md-6'">
                    <label>Present Address</label>
                    <input type="text" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.user.psAddDzongkhag">
                </div>
            </div>
        </div>
        <div class="card-footer text-end">
            <button v-if="isEditing" class="btn btn-secondary" @click="cancelChanges">Cancel</button>
            <button v-if="isEditing" class="btn custom-btn" @click="saveChanges">Save Changes</button>
            <button v-else class="btn custom-btn" @click="enableEdit">Edit Profile</button>
        </div>
    </div>
</template>
  
<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import { useUserDetailsStore } from '@/stores/userDetails';

const userDetailsStore = useUserDetailsStore();
const userDetails = ref(userDetailsStore.$state);
const isEditing = ref(false);
const originalUserDetails = ref({ ...userDetailsStore.$state });

const notification = ref({
    show: false,
    message: '',
    type: '', // 'success' or 'error'
});


const enableEdit = () => {
    isEditing.value = true;
};

const saveChanges = async () => {
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await axios.post(endpoints.updateUserInfo, userDetails.value, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${authToken}`,
            },
        });
        userDetailsStore.setUserDetails(response.data);
        originalUserDetails.value = { ...response.data };
        isEditing.value = false;
        // Set success notification
        notification.value = {
            show: true,
            message: 'Profile updated successfully!',
            type: 'success',
        };
    } catch (error) {
        console.error('Error saving changes:', error);
        // Set error notification
        notification.value = {
            show: true,
            message: 'Failed to update profile. Please try again.',
            type: 'error',
        };
    }
    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.value.show = false;
    }, 5000);
};

const cancelChanges = () => {
    userDetails.value = { ...originalUserDetails.value };
    isEditing.value = false;
};

watch(() => userDetailsStore.$state, (newState) => {
    originalUserDetails.value = { ...newState };
}, { deep: true });
</script>




<style scoped>
.input-editable {
    background-color: #fff;
}

.input-noneditable {
    background-color: #68B2A03D;
}

.if-others {
    display: none;


}

/* Show the input field when 'others' is selected and in edit mode */
.if-others[editing]:not([readonly]) {
    display: block;
}

.notification {
    padding: 1rem;
    margin-bottom: 1rem;
    border: 1px solid transparent;
    border-radius: 0.25rem;
    text-align: center;
    font-weight: bold;
}

.notification.success {
    color: #155724;
    background-color: #d4edda;
    border-color: #c3e6cb;
}

.notification.error {
    color: #721c24;
    background-color: #f8d7da;
    border-color: #f5c6cb;
}

.custom-btn {
    background-color: #2B656F;
    color: #fff;
    border-radius: 10px;
    cursor: pointer;
    margin-left: 0.5rem;
}
</style>
  