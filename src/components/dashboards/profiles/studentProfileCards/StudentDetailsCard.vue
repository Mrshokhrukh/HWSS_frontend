<template>
  <div class="personal-details-card">
    <div class="card-content">
      <div class="card-header">
        <h5>Personal Details</h5>
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
          <div class="detail-section">
            <div class="detail-grid">
              <div class="detail-row">
                <label for="identityNumber">Citizenship Identity Number</label>
                <input type="text" id="identityNumber" class="detail-input" readonly
                  :value="userDetails.user.identityNumber">
              </div>
              <div class="detail-row">
                <label for="email">Email</label>
                <input type="email" id="email" class="detail-input" readonly :value="userDetails.user.email">
              </div>
              <div class="detail-row">
                <label for="mobile">Mobile</label>
                <input type="text" id="mobile" class="detail-input" :class="{ 'editable': isEditing }"
                  :readonly="!isEditing" v-model="userDetails.user.mobNumber">
              </div>
              <div class="detail-row">
                <label for="nationality">Nationality</label>
                <input type="text" id="nationality" class="detail-input" readonly :value="userDetails.user.nationality">
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h6 class="section-title">Parents Details</h6>
            <div class="detail-grid">
              <div class="detail-row">
                <label for="motherName">Mother's Name</label>
                <input type="text" id="motherName" class="detail-input" :class="{ 'editable': isEditing }"
                  :readonly="!isEditing" v-model="userDetails.user.motherName">
              </div>
              <div class="detail-row">
                <label for="fatherName">Father's Name</label>
                <input type="text" id="fatherName" class="detail-input" :class="{ 'editable': isEditing }"
                  :readonly="!isEditing" v-model="userDetails.user.fatherName">
              </div>
              <div class="detail-row">
                <label for="parentOccupation">Parent's Occupation</label>
                <input type="text" id="parentOccupation" class="detail-input" :class="{ 'editable': isEditing }"
                  :readonly="!isEditing" v-model="userDetails.userAgency.parentOccupation">
              </div>
              <div class="detail-row">
                <label for="parentStatus">Parent's Status</label>
                <select id="parentStatus" class="detail-input" :disabled="!isEditing" :class="{ 'editable': isEditing }"
                  v-model="userDetails.userAgency.parentStatus">
                  <option value="both_parents">Both parents together</option>
                  <option value="divorced">Divorced</option>
                  <option value="single_deceased">Single (one deceased)</option>
                  <option value="orphan">Orphan</option>
                </select>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h6 class="section-title">Guardian Details</h6>
            <div class="detail-grid">
              <div class="detail-row">
                <label for="guardianName">Guardian Name (Optional)</label>
                <input type="text" id="guardianName" class="detail-input" :class="{ 'editable': isEditing }"
                  :readonly="!isEditing" v-model="userDetails.userAgency.guardianName">
              </div>
              <div class="detail-row">
                <label for="guardianOccupation">Guardian Occupation (Optional)</label>
                <input type="text" id="guardianOccupation" class="detail-input" :class="{ 'editable': isEditing }"
                  :readonly="!isEditing" v-model="userDetails.userAgency.guardianOccupation">
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h6 class="section-title">Permanent Address</h6>
            <div class="detail-grid">
              <div class="detail-row">
                <label for="permAddVillage">Village</label>
                <input type="text" id="permAddVillage" class="detail-input" readonly
                  :value="userDetails.user.permAddVillage">
              </div>
              <div class="detail-row">
                <label for="permAddGewog">Gewog</label>
                <input type="text" id="permAddGewog" class="detail-input" readonly
                  :value="userDetails.user.permAddGewog">
              </div>
              <div class="detail-row">
                <label for="permAddDzongkhag">Dzongkhag</label>
                <input type="text" id="permAddDzongkhag" class="detail-input" readonly
                  :value="userDetails.user.permAddDzongkhag">
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h6 class="section-title">Present Address</h6>
            <div class="detail-grid">
              <div class="detail-row">
                <label for="currentLivingWith">Currently Living With</label>
                <select id="currentLivingWith" class="detail-input" :disabled="!isEditing"
                  :class="{ 'editable': isEditing }" v-model="userDetails.userAgency.currentLivingWith">
                  <option value="parents">Parents</option>
                  <option value="guardian">Guardian</option>
                  <option value="friend">Friend</option>
                  <option value="self">All by myself</option>
                  <option value="hostel">Hostel</option>
                </select>
              </div>
              <div v-if="userDetails.userAgency.currentLivingWith === 'others'" class="detail-row">
                <label for="otherLivingWith">Specify with whom you live with</label>
                <input type="text" id="otherLivingWith" class="detail-input" :class="{ 'editable': isEditing }"
                  :readonly="!isEditing" v-model="userDetails.userAgency.otherLivingWith">
              </div>
              <div class="detail-row">
                <label for="psAddDzongkhag">Present Address</label>
                <input type="text" id="psAddDzongkhag" class="detail-input" :class="{ 'editable': isEditing }"
                  :readonly="!isEditing" v-model="userDetails.user.psAddDzongkhag">
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="card-footer">
        <button v-if="isEditing" class="btn btn-secondary" @click="cancelChanges">Cancel</button>
        <button v-if="isEditing" class="btn btn-primary" type="submit" @click="saveChanges">Save
          Changes</button>
        <button v-else class="btn btn-primary" @click="enableEdit">Edit Profile</button>
      </div>
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
});

const enableEdit = () => {
  isEditing.value = true;
};

const getEditableFields = () => {
  return {
    user: {
      mob_number: userDetails.value.user.mobNumber,
      father_name: userDetails.value.user.fatherName,
      mother_name: userDetails.value.user.motherName,
    },
    userAgency: {
      parent_occupation: userDetails.value.userAgency.parentOccupation,
      parent_status: userDetails.value.userAgency.parentStatus,
      guardian_name: userDetails.value.userAgency.guardianName,
      guardian_occupation: userDetails.value.userAgency.guardianOccupation,
      current_living_with: userDetails.value.userAgency.currentLivingWith,
    }
  };
};

const saveChanges = async () => {
  try {
    const authToken = localStorage.getItem('authToken');
    const editableData = getEditableFields();
    const response = await axios.post(endpoints.updateUserInfo, editableData, {
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
.personal-details-card {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;

  height: 100%;
}

.personal-details-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  color: white;
  border-bottom: none;
  padding: 1rem;
  border-radius: 10px 10px 0 0;
}

.card-header h5 {
  color: #ffffff;
  font-weight: bold;
  text-align: center;
  font-size: 1.5rem;
  margin: 0;
}

.card-body {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 10px;
  padding: 1.5rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.section-title {
  color: #2B656F;
  font-weight: bold;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #c2dada;
  padding-bottom: 0.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-row label {
  color: #2B656F;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}

.detail-input {
  width: 100%;
  padding: 0.3rem 1rem;
  border: none;
  background-color: #c2dadafa;
  color: #666;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border-radius: 10px;
}

.detail-input:focus {
  outline: none;
  border-color: #2B656F;
  box-shadow: 0 0 0 2px rgba(43, 101, 111, 0.2);
}

.detail-input.editable {
  background-color: #ffffff;
}

.card-footer {
  background: transparent;
  border-top: none;
  text-align: right;
  padding: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #2B656F;
  border-color: #2B656F;
}

.btn-primary:hover {
  background-color: #1D4851;
  border-color: #1D4851;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  margin-right: 0.5rem;
  color: white;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .card-content {
    padding: 1rem;
  }

  .card-header h5 {
    font-size: 1.3rem;
  }

  .detail-input {
    font-size: 0.9rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>