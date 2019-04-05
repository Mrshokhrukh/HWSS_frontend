<template>
  <div class="card p-4 h-100">
    <div class="border-div-password p-3">
      <div class="card-header text-center">
        <h4 style="color: #2B656F; font-weight: bold">Change Password</h4>
      </div>
      <div class="card-body p-1">
        <form @submit.prevent="changePassword">
          <div class="mb-3">
            <label for="oldPassword" class="form-label">Old Password</label>
            <input type="password" class="form-control" id="oldPassword" v-model="oldPassword">
          </div>
          <div class="mb-3">
            <label for="newPassword" class="form-label">New Password</label>
            <input type="password" class="form-control" id="newPassword" v-model="newPassword">
          </div>
          <div class="mb-3">
            <label for="confirmPassword" class="form-label">Confirm New Password</label>
            <input type="password" class="form-control" id="confirmPassword" v-model="confirmPassword">
          </div>
          <button type="submit" class="btn custom-btn">Change Password</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import endpoint from '@/api';
import { useRouter } from 'vue-router';
import { useUserDetailsStore } from "@/stores/userDetails";

// Define variables to hold old, new, and confirm passwords
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const userDetailsStore = useUserDetailsStore();

// Define the change password function
const changePassword = async () => {
  // Validate if new password and confirm password match
  if (newPassword.value !== confirmPassword.value) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'New password and confirm password do not match!'
    });
    return;
  }

  try {

    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    // Make API call to change password
    const response = await axios.post(endpoint.changePassword, {
      current_password: oldPassword.value,
      new_password: newPassword.value,
      confirm_password: confirmPassword.value
    }, {
      headers: {
        'Authorization': `Token ${authToken}`
      }
    });

    if (response.status !== 200) {
      throw new Error('Failed to change password');
    }

    // Password changed successfully
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Password changed successfully!'
    }).then(() => {
      if (localStorage) {
        for (let key in localStorage) {
          if (key !== 'userScreenedToday') {
            localStorage.removeItem(key);
          }
        }
      }
      if (sessionStorage) {
        sessionStorage.clear();
      }
      if (userDetailsStore) {
        userDetailsStore.clearUserDetails();
      }
      const router = useRouter();
      router.push('/login');
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: error.message || 'Failed to change password!'
    });
  }
};
</script>
<style scoped>
.border-div-password {
  border: 1px solid #c9c9c9;
  border-radius: 10px;
}

.custom-btn {
  background-color: #2B656F;
  color: #fff;
  border-radius: 10px;
  cursor: pointer;
  margin-left: 0.5rem;
}
</style>
