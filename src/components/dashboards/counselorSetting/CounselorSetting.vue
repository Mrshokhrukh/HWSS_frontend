<template>
    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-lg-8 mx-auto">
                <!-- Counselor Details Card -->
                <counselor-details-card :user-details="userDetails" />
            </div>
            <div class="col-lg-4 mx-auto">
                <div class="mx-auto mb-4">
                    <!-- Personal Details Card -->
                    <personal-details-card :user-details="userDetails" />
                </div>
                <div class="mx-auto mb-4 b-0">
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
import CounselorDetailsCard from '@/components/dashboards/counselorSetting/profileCard/CounselorDetailsCard.vue';
import PersonalDetailsCard from '@/components/dashboards/counselorSetting/profileCard/PersonalDetailsCard.vue';
import ChangePasswordCard from '@/components/dashboards/counselorSetting/profileCard/ChangePasswordCard.vue';

const userDetailsStore = useUserDetailsStore();
const userDetails = ref({});

onMounted(() => {
    console.log(userDetailsStore.$state);
});
</script>
  
<style scoped>
/* Additional styles if needed */
</style>
