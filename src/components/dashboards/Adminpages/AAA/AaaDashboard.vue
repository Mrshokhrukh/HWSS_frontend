<template>
    <div>
        <div>
        <CurrentStatus :filteredData="treatmentData" />
    </div>
    <div>
        <ScreeningData />
    </div>
    <div>
        <TestTypeScreening />
    </div>
    </div>
</template>

<script setup>
import CurrentStatus from "@/components/dashboards/Adminpages/AAA/dashboardcard/CurrentStatus.vue";
import ScreeningData from "@/components/dashboards/Adminpages/AAA/dashboardcard/ScreeningData.vue";
import TestTypeScreening from "@/components/dashboards/Adminpages/AAA/dashboardcard/TestTypeScreening.vue";

</script>