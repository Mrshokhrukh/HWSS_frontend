<template>
    <div class="card custom-card p-4 h-100">
        <div class="card-header">
            <h5 class="header-title">Personal Details</h5>
        </div>
        <div class="card-body">
            <!-- Notification -->
            <transition name="fade">
                <div v-if="notification.show" :class="['notification', notification.type]">
                    {{ notification.message }}
                </div>
            </transition>

            <!-- Personal Details Form -->
            <form @submit.prevent="saveChanges">
                <div class="row g-3">
                    <!-- Citizenship Identity Number -->
                    <div class="col-md-6">
                        <label for="identityNumber" class="form-label">Citizenship Identity Number</label>
                        <input type="text" id="identityNumber" class="form-control input-noneditable" readonly disabled
                            v-model="userDetails.user.identityNumber">
                    </div>
                    <!-- Email -->
                    <div class="col-md-6">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" id="email" class="form-control input-noneditable" readonly disabled
                            v-model="userDetails.user.email">
                    </div>
                    <!-- Phone -->
                    <div class="col-md-6">
                        <label for="mobile" class="form-label">Mobile</label>
                        <input type="text" id="mobile" class="form-control" :class="{'input-noneditable': !isEditing}"
                            :readonly="!isEditing" :disabled="!isEditing" v-model="userDetails.user.mobile">
                    </div>
                    <!-- Nationality -->
                    <div class="col-md-6">
                        <label for="nationality" class="form-label">Nationality</label>
                        <input type="text" id="nationality" class="form-control input-noneditable" readonly disabled
                            v-model="userDetails.user.nationality">
                    </div>
                    <!-- Parents Details -->
                    <div class="col-12">
                        <h6 class="section-title">Parents Details</h6>
                    </div>
                    <!-- Mother's Name -->
                    <div class="col-md-6">
                        <label for="motherName" class="form-label">Mother's Name</label>
                        <input type="text" id="motherName" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                            v-model="userDetails.user.motherName">
                    </div>
                    <!-- Father's Name -->
                    <div class="col-md-6">
                        <label for="fatherName" class="form-label">Father's Name</label>
                        <input type="text" id="fatherName" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                            v-model="userDetails.user.fatherName">
                    </div>
                    <!-- Parent's Occupation -->
                    <div class="col-md-6">
                        <label for="parentOccupation" class="form-label">Parent's Occupation</label>
                        <input type="text" id="parentOccupation" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                            v-model="userDetails.userAgency.parentOccupation">
                    </div>
                    <!-- Parent's Status -->
                    <div class="col-md-6">
                        <label for="parentStatus" class="form-label">Parent's Status</label>
                        <select id="parentStatus" class="form-select" :disabled="!isEditing"
                            v-model="userDetails.userAgency.parentStatus">
                            <option value="single">Single Parent</option>
                            <option value="married">Married/Together</option>
                            <option value="divorced">Divorced</option>
                            <option value="dead">One of the Parent Dead</option>
                        </select>
                    </div>
                    <!-- Guardian Name (Optional) -->
                    <div class="col-md-6">
                        <label for="guardianName" class="form-label">Guardian Name (Optional)</label>
                        <input type="text" id="guardianName" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                            v-model="userDetails.user.guardianName">
                    </div>
                    <!-- Guardian Occupation (Optional) -->
                    <div class="col-md-6">
                        <label for="guardianOccupation" class="form-label">Guardian Occupation (Optional)</label>
                        <input type="text" id="guardianOccupation" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                            v-model="userDetails.user.guardianOccupation">
                    </div>
                    <!-- Permanent Address -->
                    <div class="col-12">
                        <h6 class="section-title">Permanent Address</h6>
                    </div>
                    <!-- Village -->
                    <div class="col-md-4">
                        <label for="permAddVillage" class="form-label">Village</label>
                        <input type="text" id="permAddVillage" class="form-control input-noneditable" readonly disabled
                            v-model="userDetails.user.permAddVillage">
                    </div>
                    <!-- Gewog -->
                    <div class="col-md-4">
                        <label for="permAddGewog" class="form-label">Gewog</label>
                        <input type="text" id="permAddGewog" class="form-control input-noneditable" readonly disabled
                            v-model="userDetails.user.permAddGewog">
                    </div>
                    <!-- Dzongkhag -->
                    <div class="col-md-4">
                        <label for="permAddDzongkhag" class="form-label">Dzongkhag</label>
                        <input type="text" id="permAddDzongkhag" class="form-control input-noneditable" readonly disabled
                            v-model="userDetails.user.permAddDzongkhag">
                    </div>
                    <!-- Present Address -->
                    <div class="col-12">
                        <h6 class="section-title">Present Address</h6>
                    </div>
                    <!-- Currently Living With -->
                    <div class="col-md-6">
                        <label for="currentLivingWith" class="form-label">Currently Living With</label>
                        <select id="currentLivingWith" class="form-select" :disabled="!isEditing"
                            v-model="userDetails.user.currentLivingWith">
                            <option value="parents">Parents</option>
                            <option value="guardian">Guardian</option>
                            <option value="sibling">Elder Sibling(s)</option>
                            <option value="others">Others(s)</option>
                        </select>
                    </div>
                    <!-- Specify with whom you live with (Conditional) -->
                    <div v-if="userDetails.user.currentLivingWith === 'others'" class="col-md-6">
                        <label for="otherLivingWith" class="form-label">Specify with whom you live with</label>
                        <input type="text" id="otherLivingWith" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                            v-model="userDetails.user.otherLivingWith">
                    </div>
                    <!-- Present Address -->
                    <div
                        :class="{ 'col-md-6': userDetails.user.currentLivingWith !== 'others', 'col-md-12': userDetails.user.currentLivingWith === 'others' }">
                        <label for="psAddDzongkhag" class="form-label">Present Address</label>
                        <input type="text" id="psAddDzongkhag" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                            v-model="userDetails.user.psAddDzongkhag">
                    </div>
                </div>
            </form>
        </div>
        <div class="card-footer text-end">
            <button v-if="isEditing" class="btn btn-secondary me-2" @click="cancelChanges">Cancel</button>
            <button v-if="isEditing" class="btn custom-btn" type="submit" @click="saveChanges">Save Changes</button>
            <button v-else class="btn custom-btn" @click="enableEdit">Edit Profile</button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import endpoints from '@/api';
import { useUserDetailsStore } from '@/stores/userDetails';

const userDetailsStore = useUserDetailsStore();
const userDetails = ref(userDetailsStore.$state);
const isEditing = ref(false);
const originalUserDetails = ref({ ...userDetailsStore.$state });

const notification = ref({
    show: false,
    message: '',
    type: '',
})

const enableEdit = () => {
    isEditing.value = true;
};

const getEditableFields = () => {
    return {
        user: {
            mob_number: userDetails.value.user.mobile,
            father_name: userDetails.value.user.fatherName,
            mother_name: userDetails.value.user.motherName,
        },
        userAgency: {
            parent_occupation: userDetails.value.userAgency.parentOccupation,
            parent_status: userDetails.value.userAgency.parentStatus,
            guardian_name: userDetails.value.user.guardianName,
            guardian_occupation: userDetails.value.user.guardianOccupation,
            current_living_with: userDetails.value.user.currentLivingWith,
        }
    };
};

const saveChanges = async () => {
    try {
        const authToken = localStorage.getItem('authToken');
        const editableData = getEditableFields();
        const response = await axios.post(endpoints.updateUserInfo, editableData, {
        // const response = await axios.post('http://localhost:8123/api/v1/access/update-user-info/', editableData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${authToken}`,
            },
        });

        userDetailsStore.setUserDetails(response.data);
        originalUserDetails.value = { ...response.data };
        isEditing.value = false;

        showNotification('Profile updated successfully!', 'success');

        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Profile updated successfully!',
        });
    } catch (error) {
        showNotification('Failed to update profile. Please try again.', 'error');

        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to update profile. Please try again.',
        });
    }
};

const cancelChanges = () => {
    userDetails.value = { ...originalUserDetails.value };
    isEditing.value = false;
};

const showNotification = (message, type) => {
    notification.value = { show: true, message, type };
    setTimeout(() => {
        notification.value.show = false;
    }, 3000);
};

watch(() => userDetailsStore.$state, (newState) => {
    originalUserDetails.value = { ...newState };
}, { deep: true });
</script>

<style scoped>
.custom-card {
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-title {
    color: #2B656F;
    font-weight: bold;
}

.section-title {
    color: #2B656F;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 0.5rem;
}

.form-label {
    font-weight: 600;
    color: #333;
}

.input-noneditable {
    background-color: #68B2A03D;
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
    transition: background-color 0.3s ease;
}

.custom-btn:hover {
    background-color: #1e4a52;
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}
</style>