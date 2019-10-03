<template>
    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-lg-8 mx-auto">
                <!-- Student Details Card -->
                <student-details-card :user-details="userDetails" />
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
import StudentDetailsCard from './studentProfileCards/StudentDetailsCard.vue';
import PersonalDetailsCard from './studentProfileCards/StudentPersonalDetailsCard.vue';
import ChangePasswordCard from './studentProfileCards/StudentChangePasswordCard.vue';

</script>
