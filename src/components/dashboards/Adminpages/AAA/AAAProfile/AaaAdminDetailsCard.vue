<template>
    <div class="card custom-card p-3 h-100">
        <div class="card-header">
            <h5 class="header-title">Personal Details</h5>
        </div>
        <div class="card-body">
            <!-- Notification -->
            <!-- <div class="notification" :class="notification.type" v-if="notification.show">
                {{ notification.message }}
            </div> -->

            <!-- Personal Details Form -->
            <form @submit.prevent>
                <div class="row g-3">



                    <!-- Citizenship Identity Number -->
                    <div class="row mb-5">
                        <div class="col-md-6 mb-4">
                            <label>Citizenship Identity Number</label>
                            <input type="text" class="form-control input-noneditable" readonly disabled
                                v-model="userDetails.user.identityNumber">
                        </div>
                        <!-- Nationality -->
                        <div class="col-md-6 mb-4">
                            <label>Nationality</label>
                            <input type="text" class="form-control input-noneditable" readonly disabled
                                v-model="userDetails.user.nationality">
                        </div>
                        <!-- Phone -->
                        <div class="col-md-6 mb-4">
                            <label>Phone</label>
                            <input type="text" class="form-control input-noneditable" readonly disabled
                                v-model="userDetails.user.mobNumber">
                        </div>
                        <!-- Email -->
                        <div class="col-md-6 mb-4">
                            <label>Email</label>
                            <input type="email" class="form-control input-noneditable" readonly disabled
                                v-model="userDetails.user.email">
                        </div>
                    </div>



                    <!-- Permanent Address -->
                    <div class="row mb-5">
                        <div class="col-md-12">
                            <div class="card-header">
                                <h5 class="header-title">Permanent Address</h5>
                            </div>
                        </div>
                        <!-- Dzongkhag -->
                        <div class="col-md-6 mb-4">
                            <label>Dzongkhag</label>
                            <input type="text" class="form-control input-noneditable" readonly disabled
                                v-model="userDetails.user.permAddDzongkhag">
                        </div>
                        <!-- Gewog -->
                        <div class="col-md-6 mb-4">
                            <label>Gewog</label>
                            <input type="text" class="form-control input-noneditable" readonly disabled
                                v-model="userDetails.user.permAddGewog">
                        </div>
                        <!-- Village -->
                        <div class="col-md-6 mb-4">
                            <label>Village</label>
                            <input type="text" class="form-control input-noneditable" readonly disabled
                                v-model="userDetails.user.permAddVillage">
                        </div>
                    </div>



                    <!-- Present Address -->
                    <div class="row mb-5">
                        <div class="col-md-12">
                            <div class="card-header">
                                <h5 class="header-title">Present Address</h5>
                            </div>
                        </div>
                        <!-- Present Address -->
                        <!-- <div :class="{ 'col-md-6 mb-4': userDetails.user.currentLivingWith !== 'others', 'col-md-12': userDetails.user.currentLivingWith === 'others' }">
                            <label>Present Address</label>
                            <input type="text" class="form-control" :readonly="!isEditing" :disabled="!isEditing"
                                v-model="userDetails.user.psAddDzongkhag">
                        </div> -->
                        <!-- Dzongkhag -->
                        <div class="col-md-6 mb-4">
                            <label>Dzongkhag</label>
                            <input type="text" class="form-control input-noneditable" readonly disabled
                                v-model="userDetails.user.permAddDzongkhag">
                        </div>
                        <!-- Gewog -->
                        <div class="col-md-6 mb-4">
                            <label>Gewog</label>
                            <input type="text" class="form-control input-noneditable" readonly disabled
                                v-model="userDetails.user.permAddGewog">
                        </div>
                        <!-- Village -->
                        <div class="col-md-6 mb-4">
                            <label>Village</label>
                            <input type="text" class="form-control input-noneditable" readonly disabled
                                v-model="userDetails.user.permAddVillage">
                        </div>
                    </div>



                </div>
            </form>
        </div>
        <div class="card-footer text-end">
            <button v-if="isEditing" class="btn btn-secondary" @click="cancelChanges">Cancel</button>
            <button v-if="isEditing" class="btn custom-btn" type="submit" @click="saveChanges">Save Changes</button>
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

.if-others[editing]:not([readonly]) {
    display: block;
}


/* Add border and adjust spacing */
.custom-card {
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
}

.border {
    border: 1px solid #939393;
    border-radius: 10px;
}

.header-title {
    color: #2B656F;
    font-weight: bold;
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