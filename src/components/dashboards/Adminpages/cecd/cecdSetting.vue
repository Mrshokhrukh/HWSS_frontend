<template>
    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-lg-8 mx-auto">
                <!-- Student Details Card -->
                <Aaa-Admin-Details-Card :user-details="userDetails" />
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
import AaaAdminDetailsCard from "@/components/dashboards/Adminpages/AAA/AAAProfile/AaaAdminDetailsCard.vue"
import ChangePasswordCard from "@/components/dashboards/Adminpages/AAA/AAAProfile/ChangePasswordCard.vue"
import PersonalDetailsCard from "@/components/dashboards/Adminpages/AAA/AAAProfile/PersonalDetailsCard.vue"


</script>