<template>
    <div class="card p-4 h-100">
      <div class="border-div-password p-3">
        <div class="card-header text-center">
          <h4 style="color: #2B656F; font-weight: bold">Change Password</h4>
        </div>
        <div class="card-body p-1">
          <form @submit.prevent="changePassword">
            <div class="mb-2">
              <label for="oldPassword" class="form-label">Old Password</label>
              <input type="password" class="form-control" id="oldPassword">
            </div>
            <div class="mb-2">
              <label for="newPassword" class="form-label">New Password</label>
              <input type="password" class="form-control" id="newPassword">
            </div>
            <div class="mb-2">
              <label for="confirmPassword" class="form-label">Confirm New Password</label>
              <input type="password" class="form-control" id="confirmPassword">
            </div>
            <button type="submit" class="btn custom-btn">Change Password</button>
          </form>
        </div>
      </div>
    </div>
  </template>
    
  <script setup>
  // Define your change password logic here
  const changePassword = () => {
    // Logic to change password
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
    