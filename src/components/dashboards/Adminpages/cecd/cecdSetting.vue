<template>
    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-lg-8 mx-auto">
                <!-- Student Details Card -->
                <cecd-Admin-Details-Card :user-details="userDetails" />
            </div>
            <div class="col-lg-4 mx-auto">
                <div class="mx-auto mb-4">
                    <!-- Personal Details Card -->
                    <cecd-personal-details-card :user-details="userDetails" />
                </div>
                <div class="mx-auto mb-4 b-0">
                    <!-- Change Password Card -->
                    <cecd-change-password-card :user-details="userDetails" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import cecdAdminDetailsCard from "@/components/dashboards/Adminpages/cecd/cecdProfile/cecdAdminDetailsCard.vue"
import cecdChangePasswordCard from "@/components/dashboards/Adminpages/cecd/cecdProfile/cecdChangePasswordCard.vue"
import cecdPersonalDetailsCard from "@/components/dashboards/Adminpages/cecd/cecdProfile/cecdPersonalDetailsCard.vue"


</script>