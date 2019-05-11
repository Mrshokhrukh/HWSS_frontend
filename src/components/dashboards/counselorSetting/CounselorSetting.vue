<template>
    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-lg-8 mx-auto h-100">
                <!-- Counselor Details Card -->
                <counselor-details-card :user-details="userDetails" />
            </div>
            <div class="col-lg-4 mx-auto">
                <div class="mx-auto mb-4">
                    <!-- Personal Details Card -->
                    <personal-details-card :user-details="userDetails" />
                </div>
                <div class="mx-auto b-0">
                    <!-- Change Password Card -->
                    <change-password-card :user-details="userDetails" />
                </div>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue';
import { useUserDetailsStore } from '@/stores/userDetails';
import CounselorDetailsCard from './counselorProfileCard/CounselorDetailsCard.vue';
import PersonalDetailsCard from './counselorProfileCard/CounselorPersonalDetailsCard.vue';
import ChangePasswordCard from './counselorProfileCard/CounselorChangePasswordCard.vue';

// eslint-disable-next-line no-unused-vars
const userDetailsStore = useUserDetailsStore();
const userDetails = ref({});

onMounted(() => {
    // console.log(userDetailsStore.$state);
});
</script>
  
<style scoped>
/* Additional styles if needed */
</style>
