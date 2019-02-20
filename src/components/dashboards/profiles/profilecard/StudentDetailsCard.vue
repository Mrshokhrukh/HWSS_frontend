<template>
    <div class="card">
        <div class="card-header">
            <h5 style="color: #2B656F; font-weight: bold">Personal Details</h5>
        </div>
        <div class="card-body">
            <div class="row g-3">
                <div class="col-md-6">
                    <label>Citizenship Identity Number</label>
                    <input type="text" class="form-control input-noneditable" readonly disabled v-model="userDetails.identityNumber">
                </div>
                <div class="col-md-6">
                    <label>Email</label>
                    <input type="email" class="form-control input-noneditable" readonly disabled v-model="userDetails.email">
                </div>
                <div class="col-md-6">
                    <label>Phone</label>
                    <input type="text" class="form-control input-noneditable" readonly disabled v-model="userDetails.phone">
                </div>
                <div class="col-md-6">
                    <label>Nationality</label>
                    <input type="text" class="form-control input-noneditable" readonly disabled v-model="userDetails.nationality">
                </div>
                <div class="card-header">
                    <h5 style="color: #2B656F; font-weight: bold">Parents Details</h5>
                </div>
                <div class="col-md-6">
                    <label>Mother's Name</label>
                    <input type="text" class="form-control input-noneditable" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.motherName">
                </div>
                <div class="col-md-6">
                    <label>Father's Name</label>
                    <input type="text" class="form-control input-noneditable" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.fatherName">
                </div>
                <div class="col-md-6">
                    <label>Mother's Occupation</label>
                    <input type="text" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.motherOccupation">
                </div>
                <div class="col-md-6">
                    <label>Father's Occupation</label>
                    <input type="text" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.fatherOccupation">
                </div>
                <div class="col-md-6">
                    <label>Parent's Status</label>
                    <select class="form-select" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.parentalStatus">
                        <option value="single">Single Parent</option>
                        <option value="married">Married/Together</option>
                        <option value="divorced">Divorced</option>
                        <option value="dead">One of the Parent Dead</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label>Guardian Name (Optional)</label>
                    <input type="text" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.guardianName">
                </div>
                <div class="col-md-6">
                    <label>Guardian Occupation (Optional)</label>
                    <input type="text" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.guardianOccupation">
                </div>
                <div class="card-header">
                    <h5 style="color: #2B656F; font-weight: bold">Permanent Address</h5>
                </div>
                <div class="col-md-6">
                    <label>Village</label>
                    <input type="text" class="form-control input-noneditable" readonly disabled v-model="userDetails.permAddVillage">
                </div>
                <div class="col-md-6">
                    <label>Gewog</label>
                    <input type="text" class="form-control input-noneditable" readonly disabled v-model="userDetails.permAddGewog">
                </div>
                <div class="col-md-6">
                    <label>Dzongkhag</label>
                    <input type="text" class="form-control input-noneditable" readonly disabled v-model="userDetails.permAddDzongkhag">
                </div>
                <div class="card-header">
                    <h5 style="color: #2B656F; font-weight: bold">Present Address</h5>
                </div>
                <div class="col-md-6">
                    <label>Currently Living With</label>
                    <select class="form-select" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.currentLivingWith">
                        <option value="parents">Parents</option>
                        <option value="guardian">Guardian</option>
                        <option value="sibling">Elder Sibling(s)</option>
                        <option value="others">Others(s)</option>
                    </select>
                </div>
                <!-- Conditional field that should appear if 'others' is selected -->
                <div v-if="userDetails.currentLivingWith === 'others'" class="col-md-6">
                    <label>Please Specify with whom you live with</label>
                    <input type="text" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.otherLivingWith">
                </div>
                <!-- Class for Present Address is conditional -->
                <div :class="userDetails.currentLivingWith === 'others' ? 'col-md-12' : 'col-md-6'">
                    <label>Present Address</label>
                    <input type="text" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                        v-model="userDetails.psAddDzongkhag">
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

const enableEdit = () => {
    isEditing.value = true;
};

const saveChanges = async () => {
    try {
        const response = await axios.post(endpoints.saveProfileChanges, userDetails.value, {
            headers: { 'Content-Type': 'application/json' },
            // Include other necessary headers, like an Authorization token
        });
        // Handle response, update the store with the new details
        userDetailsStore.setUserDetails(response.data);
        originalUserDetails.value = { ...response.data };
        isEditing.value = false;
    } catch (error) {
        console.error('Error saving changes:', error);
        // Handle error, possibly show an error message to the user
    }
};

const cancelChanges = () => {
    userDetails.value = { ...originalUserDetails.value };
    isEditing.value = false;
};

// Watch for changes in userDetailsStore and keep originalUserDetails in sync
watch(() => userDetailsStore.$state, (newState) => {
    originalUserDetails.value = { ...newState };
}, { deep: true });

</script>




<style scoped>
.input-editable {
    background-color: #fff;
}
.input-noneditable{
    background-color:  #68B2A03D;
}

.if-others {
    display: none;
   
    
}

/* Show the input field when 'others' is selected and in edit mode */
.if-others[editing]:not([readonly]) {
    display: block;
}

/* Style for buttons */

.custom-btn {
    background-color: #2B656F;
    color: #fff;
    border-radius: 10px;
    cursor: pointer;
    margin-left: 0.5rem;
  }
</style>
  