<template>
  <div class="card">
    <!-- <div class="card-header">
        Personal Details
      </div> -->
    <div class="user-profile text-center my-3">
      <img :src="userDetailsStore.user.profilePicture" alt="User" class="profile-pic" />

    </div>

    <div class="card-body">

      <!-- Example content -->
      <div class="col-md-12">
        <label>User Name</label>
        <input type="text" class="form-control input-noneditable" readonly disabled
          v-model="userDetailsStore.user.username">
      </div>
      <div class="col-md-12">
        <label>Student Number</label>
        <input type="text" class="form-control input-noneditable" readonly disabled
          v-model="userDetailsStore.userAgency.userCode">
      </div>
      <div class="col-md-12">
        <label>Is Gyalsung</label>
        <input type="text" class="form-control input-noneditable" readonly disabled
          v-model="userDetailsStore.user.isGyalsung">
      </div>
      <div class="col-md-12">
        <label>Gender</label>
        <input type="text" class="form-control input-noneditable" readonly disabled
          v-model="userDetailsStore.user.gender">
      </div>
      <div class="col-md-12">
        <label>Date of Birth</label>
        <input type="text" class="form-control input-noneditable" readonly disabled
          v-model="userDetailsStore.user.dateOfBirth">
      </div>
      <div class="col-md-12">
        <label>Role</label>
        <input type="text" class="form-control input-noneditable" readonly disabled v-model="userDetailsStore.user.role">
      </div>
      <div class="col-md-12">
        <label>Class/Section</label>
        <input type="text" class="form-control input-noneditable" readonly disabled v-model="userClassSection">
      </div>
      <div class="col-md-12">
        <label>School</label>
        <input type="text" class="form-control input-noneditable" readonly disabled
          v-model="userDetailsStore.agency.agencyName">
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { computed } from 'vue';
import { useUserDetailsStore } from '@/stores/userDetails';

const userDetailsStore = useUserDetailsStore();


const userClassSection = computed(() => {
  const { userClass, userStream, userSubClass } = userDetailsStore.userAgency;
  return `${userClass} ${userStream ? userStream + ' ' : ''}${userSubClass}`.trim();
});


</script>
<style scoped>
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

  padding: 0.5rem 0;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  height: auto;
}
</style>
  