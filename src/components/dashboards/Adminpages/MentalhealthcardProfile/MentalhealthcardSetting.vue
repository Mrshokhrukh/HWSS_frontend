<template>
    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-lg-8 mx-auto">
                <!-- Student Details Card -->
                <Mentalhealthcard-Admin-Details-Card :user-details="userDetails" />
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
import MentalhealthcardAdminDetailsCard from "@/components/dashboards/Adminpages/MentalhealthcardProfile/MentalhealthcardAdminDetailsCard.vue"
import ChangePasswordCard from "@/components/dashboards/Adminpages/MentalhealthcardProfile/ChangePasswordCard.vue"
import PersonalDetailsCard from "@/components/dashboards/Adminpages//MentalhealthcardProfile/PersonalDetailsCard.vue"


</script>