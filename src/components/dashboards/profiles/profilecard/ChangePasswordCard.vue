<template>
    <div class="card">
      <div class="card-header">
        Change Password
      </div>
      <div class="card-body">
        <form @submit.prevent="changePassword">
          <div class="mb-3">
            <label for="oldPassword" class="form-label">Old Password</label>
            <input type="password" class="form-control" id="oldPassword">
          </div>
          <div class="mb-3">
            <label for="newPassword" class="form-label">New Password</label>
            <input type="password" class="form-control" id="newPassword">
          </div>
          <div class="mb-3">
            <label for="confirmPassword" class="form-label">Confirm New Password</label>
            <input type="password" class="form-control" id="confirmPassword">
          </div>
          <button type="submit" class="btn btn-primary">Change Password</button>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  // Define your change password logic here
  const changePassword = () => {
    // Logic to change password
  };
  </script>
  