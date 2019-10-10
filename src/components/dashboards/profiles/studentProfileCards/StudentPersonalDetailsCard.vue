<template>
  <div class="personal-details-card">
    <div class="card-content">
      <div class="card-header">
        <h5>User Profile</h5>
      </div>
      <div class="user-profile">
        <div class="profile-pic-container">
          <img :src="profilePictureUrl" alt="User" class="profile-pic" />
        </div>
      </div>
      <div class="card-body">
        <div class="detail-row">
          <label>User Name</label>
          <input type="text" class="detail-input" readonly :value="userDetailsStore.user.username">
        </div>
        <div class="detail-row">
          <label>Student Number</label>
          <input type="text" class="detail-input" readonly :value="userDetailsStore.userAgency.userCode">
        </div>
        <div class="detail-row">
          <label>Is Gyalsung</label>
          <input type="text" class="detail-input" readonly :value="userDetailsStore.user.isGyalsung">
        </div>
        <div class="detail-row">
          <label>Gender</label>
          <input type="text" class="detail-input" readonly :value="userDetailsStore.user.gender">
        </div>
        <div class="detail-row">
          <label>School/Agency/Gyalsung Academy</label>
          <input type="text" class="detail-input" readonly :value="userDetailsStore.agency.agencyName">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useUserDetailsStore } from '@/stores/userDetails';
import defaultProfilePic from "@/assets/images/icon.png";

const userDetailsStore = useUserDetailsStore();

const profilePicture = computed(() => userDetailsStore.user.profilePicture);

const profilePictureUrl = computed(() => {
  const baseUrl =
    window.location.hostname === "localhost" && window.location.port === "5173"
      ? "http://localhost:8000"
      : "https://thepemasystem.gov.bt/api/core";
  return profilePicture.value ? baseUrl + profilePicture.value : defaultProfilePic;
});

const userAge = computed(() => {
  const dob = userDetailsStore.user.dateOfBirth;
  if (!dob) return '';
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

onMounted(() => {
  localStorage.setItem('userAge', userAge.value.toString());
  localStorage.setItem('userAgeGroup', userAgeGroup.value);
});
</script>

<style scoped>
.personal-details-card {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
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
  margin-bottom: 1rem;
  border-radius: 10px 10px 0 0;
}

.card-header h5 {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  color: #ffffff;
  font-weight: bold;
  text-align: center;
  font-size: 1.5rem;
  margin: 0;
}

.user-profile {
  text-align: center;
}

.profile-pic-container {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border-radius: 50%;
  padding: 5px;
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.profile-pic {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
  border: 3px solid white;
}

.card-body {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 10px;
  padding: 1.5rem;
}

.detail-row {
  margin-bottom: 1rem;
}

.detail-row label {
  color: #2B656F;
  font-weight: 600;
  margin-bottom: 0.5rem;
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
  overflow: hidden;
}

.detail-input:focus {
  outline: none;
  border-color: #2B656F;
  box-shadow: 0 0 0 2px rgba(43, 101, 111, 0.2);
}

@media (max-width: 768px) {
  .card-content {
    padding: 1.5rem;
  }

  .profile-pic-container {
    width: 100px;
    height: 100px;
  }

  .card-header h5 {
    font-size: 1.3rem;
  }

  .detail-input {
    font-size: 0.9rem;
  }
}
</style>