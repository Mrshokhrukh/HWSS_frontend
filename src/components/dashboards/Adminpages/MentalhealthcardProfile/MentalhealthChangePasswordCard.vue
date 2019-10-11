<template>
  <div class="card h-100 change-password-card">
      <div class="card-content">
          <div class="card-header text-center">
              <h4>Change Password</h4>
          </div>
          <div class="card-body">
              <form @submit.prevent="changePassword">
                  <div class="form-group">
                      <label for="oldPassword" class="form-label">Old Password</label>
                      <div class="input-group">
                          <input :type="showOldPassword ? 'text' : 'password'" class="form-control" id="oldPassword"
                              v-model="oldPassword">
                          <button type="button" class="btn btn-outline-secondary" @click="toggleOldPassword">
                              <i :class="showOldPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                          </button>
                      </div>
                  </div>
                  <div class="form-group">
                      <label for="newPassword" class="form-label">New Password</label>
                      <div class="input-group">
                          <input :type="showNewPassword ? 'text' : 'password'" class="form-control" id="newPassword"
                              v-model="newPassword">
                          <button type="button" class="btn btn-outline-secondary" @click="toggleNewPassword">
                              <i :class="showNewPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                          </button>
                      </div>
                  </div>
                  <div class="form-group">
                      <label for="confirmPassword" class="form-label">Confirm New Password</label>
                      <div class="input-group">
                          <input :type="showConfirmPassword ? 'text' : 'password'" class="form-control"
                              id="confirmPassword" v-model="confirmPassword">
                          <button type="button" class="btn btn-outline-secondary" @click="toggleConfirmPassword">
                              <i :class="showConfirmPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                          </button>
                      </div>
                  </div>
                  <button type="submit" class="btn custom-btn">
                      <span>Change Password</span>
                      <i class="bi bi-arrow-right"></i>
                  </button>
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

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const userDetailsStore = useUserDetailsStore();

const toggleOldPassword = () => showOldPassword.value = !showOldPassword.value;
const toggleNewPassword = () => showNewPassword.value = !showNewPassword.value;
const toggleConfirmPassword = () => showConfirmPassword.value = !showConfirmPassword.value;

const changePassword = async () => {
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
.change-password-card {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border: none;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.change-password-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  color: white;
  border-bottom: none;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 10px 10px 0 0;
}

.card-header h4 {
  margin: 0;
  font-weight: bold;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  color: #2B656F;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.input-group {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  overflow: hidden;
}

.form-control {
  border: none;
  padding: 0.75rem 1rem;
}

.input-group .btn {
  border: none;
  background-color: #f8f9fa;
  color: #2B656F;
}

.custom-btn {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.custom-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.custom-btn span {
  margin-right: 0.5rem;
}

.custom-btn i {
  transition: transform 0.3s ease;
}

.custom-btn:hover i {
  transform: translateX(5px);
}
</style>