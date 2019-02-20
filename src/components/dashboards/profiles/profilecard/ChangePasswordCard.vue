<template>
    <div class="card">
      <div class="card-header">
        <h3 style="color: #2B656F; font-weight: bold">Change Password</h3>
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
          <button type="submit" class="btn custom-btn">Change Password</button>
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
  <style scoped>
  .custom-btn {
    background-color: #2B656F;
    color: #fff;
    border-radius: 10px;
    cursor: pointer;
    margin-left: 0.5rem;
  }
</style>
  