<template>

    <div class="mb-4">
        <cecdCurrentStatus />
    </div>
    <div class="mb-4">
        <cecdScreeningData />
    </div>
    <div>
        <cecdTestTypeScreening />
    </div>
</template>

<script setup>
import cecdCurrentStatus from "@/components/dashboards/Adminpages/cecd/dashboardcard/cecdCurrentStatus.vue";
import cecdScreeningData from "@/components/dashboards/Adminpages/cecd/dashboardcard/cecdScreeningData.vue";
import cecdTestTypeScreening from "@/components/dashboards/Adminpages/cecd/dashboardcard/cecdTestTypeScreening.vue";
</script>

<style scoped></style>