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
import { ref } from 'vue';
import CounselorDetailsCard from './counselorProfileCard/CounselorDetailsCard.vue';
import PersonalDetailsCard from './counselorProfileCard/CounselorPersonalDetailsCard.vue';
import ChangePasswordCard from './counselorProfileCard/CounselorChangePasswordCard.vue';

const userDetails = ref({});

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
    flex: 0 0 66.666%; /* Equivalent to col-lg-8 */
}

.profile-column-right {
    flex: 0 0 33.333%; /* Equivalent to col-lg-4 */
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.card-wrapper {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.card-full-height {
    height: 100%; /* Full height for left column cards */
    display: flex;
    flex-direction: column;
}

.card-half-height {
    height: auto; /* Let the cards adjust their height based on content */
    display: flex;
    flex-direction: column;
    min-height: 200px; /* Optional: set a minimum height for half-height cards */
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