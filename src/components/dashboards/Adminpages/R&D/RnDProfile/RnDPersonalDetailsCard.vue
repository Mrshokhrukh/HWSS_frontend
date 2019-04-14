<template>
  <div class="card p-3">
          <div class="card-header">
              <h5 style="color: #2B656F; font-weight: bold" class="text-center">Personal Details</h5>
          </div>
          <div class="user-profile text-center">
              <img :src="profilePictureUrl" alt="User" class="profile-pic" />
              <button class="edit-button" @click="openFileSelection">
                  <i class="fas fa-edit"></i>
              </button>
          </div>

          <div class="card-body p-1 h-100">
              <!-- Example content -->
              <div class="col-md-12 mb-3">
                  <label>Full Name</label>
                  <input type="text" class="form-control input-noneditable" readonly disabled
                      v-model="userDetailsStore.user.username">
              </div>
              <div class="col-md-12 mb-3">
                  <label>Gender</label>
                  <input type="text" class="form-control input-noneditable" readonly disabled
                      v-model="userDetailsStore.user.gender">
              </div>
              <div class="col-md-12 mb-3">
                  <label>Date of Birth</label>
                  <input type="text" class="form-control input-noneditable" readonly disabled
                      v-model="userDetailsStore.user.dateOfBirth">
              </div>
              <div class="col-md-12 mb-3">
                  <label>Role</label>
                  <input type="text" class="form-control input-noneditable" readonly disabled
                      v-model="userDetailsStore.user.role">
              </div>
              <div class="col-md-12 mb-3">
                  <label>School/Agency/Gyalsung Academy</label>
                  <input type="text" class="form-control input-noneditable" readonly disabled
                      v-model="userDetailsStore.agency.agencyName">
              </div>
          </div>
      </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useUserDetailsStore } from '@/stores/userDetails';
import deFaultProfilePic from "@/assets/images/icon.png";

const userDetailsStore = useUserDetailsStore();

const profilePicture = computed(() => userDetailsStore.user.profilePicture);

const profilePictureUrl = computed(() => {
  const baseUrl =
      window.location.hostname === "localhost" && window.location.port === "5173"
          ? "http://localhost:8000"
          : "http://172.30.3.5";
  return profilePicture.value ? baseUrl + profilePicture.value : deFaultProfilePic;
});

const userAge = computed(() => {
  const dob = userDetailsStore.user.dateOfBirth;
  if (!dob) return ''; // Handle case where date of birth is not available
  const dobDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - dobDate.getFullYear();
  const monthDiff = today.getMonth() - dobDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
  }
  return age;
});

const userAgeGroup = computed(() => {
  const age = parseInt(userAge.value);
  if (age < 14) {
      return 'Below 14';
  } else if (age >= 15 && age <= 17) {
      return '15 to 17';
  } else {
      return '18 and above';
  }
});

const openFileSelection = () => {
  // Implement the logic to open file selection dialog here
};

onMounted(() => {
  localStorage.setItem('userAge', userAge.value.toString());
  localStorage.setItem('userAgeGroup', userAgeGroup.value);
});

</script>

<style scoped>
.border-div-personal {
  border: 1px solid #c9c9c9;
  border-radius: 10px;
}

.input-noneditable {
  background-color: #68B2A03D;
}

.profile-pic {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 5px solid #2c6975;
  object-fit: cover;
  object-position: top;
  margin: 10px auto;
}

.user-profile {
  position: relative;
  padding: 0.5rem 0;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  height: auto;
}

.edit-button {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background-color: transparent;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}

.edit-button:hover {
  color: #2c6975;
}
</style>
