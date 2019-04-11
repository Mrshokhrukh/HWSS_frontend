<template>
    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-lg-8 mx-auto">
                <!-- Student Details Card -->
                <RnD-Admin-Details-Card :user-details="userDetails" />
            </div>
            <div class="col-lg-4 mx-auto">
                <div class="mx-auto mb-4">
                    <!-- Personal Details Card -->
                    <RnD-personal-details-card :user-details="userDetails" />
                </div>
                <div class="mx-auto mb-4 b-0">
                    <!-- Change Password Card -->
                    <RnD-change-password-card :user-details="userDetails" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import RnDAdminDetailsCard from "@/components/dashboards/Adminpages/R&D/RnDProfile/RnDAdminDetailsCard.vue"
import RnDChangePasswordCard from "@/components/dashboards/Adminpages/R&D/RnDProfile/RnDChangePasswordCard.vue"
import RnDPersonalDetailsCard from "@/components/dashboards/Adminpages/R&D/RnDProfile/RnDPersonalDetailsCard.vue"


</script>