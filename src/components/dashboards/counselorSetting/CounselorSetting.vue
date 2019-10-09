<template>
    <div class="container-fluid py-4">
        <div class="profile-layout">
            <div class="profile-column profile-column-left">
                <!-- Counselor Details Card -->
                <counselor-details-card :user-details="userDetails" class="card-full-height" />
            </div>
            <div class="profile-column profile-column-right">
                <div class="card-wrapper">
                    <!-- Personal Details Card -->
                    <personal-details-card :user-details="userDetails" class="card-half-height" />
                </div>
                <div class="card-wrapper">
                    <!-- Change Password Card -->
                    <change-password-card :user-details="userDetails" class="card-half-height" />
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

const userDetailsStore = useUserDetailsStore();
const userDetails = ref({});

onMounted(() => {
    // Initialize userDetails if needed
    // userDetails.value = userDetailsStore.getUserDetails();
});
</script>

<style scoped>
.profile-layout {
    display: flex;
    gap: 1.5rem;
    height: 100%;
}

.profile-column {
    display: flex;
    flex-direction: column;
}

.profile-column-left {
    flex: 0 0 66.666%;
    /* Equivalent to col-lg-8 */
}

.profile-column-right {
    flex: 0 0 33.333%;
    /* Equivalent to col-lg-4 */
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.card-wrapper {
    flex: 1;
    min-height: 0;
    /* This allows the card to shrink if needed */
}

.card-full-height,
.card-half-height {
    height: 100%;
    display: flex;
    flex-direction: column;
}

/* Responsive adjustments */
@media (max-width: 991px) {
    .profile-layout {
        flex-direction: column;
    }

    .profile-column-left,
    .profile-column-right {
        flex: 1 1 auto;
        width: 100%;
    }

    .card-wrapper {
        margin-bottom: 1.5rem;
    }
}
</style>