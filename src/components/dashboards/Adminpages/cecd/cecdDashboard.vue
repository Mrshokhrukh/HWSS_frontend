<template>
    <div v-if="isLoading" class="flex justify-center items-center p-4">
        <p>Loading...</p>
    </div>
    <div v-else>
        <div class="mb-4">
            <cecdCurrentStatus :serviceAndTreatmentData="serviceAndTreatmentData" />
        </div>
        <div class="mb-4">
            <cecdScreeningData :serviceAndTreatmentData="serviceAndTreatmentData" />
        </div>
        <div>
            <cecdTestTypeScreening :serviceAndTreatmentData="serviceAndTreatmentData" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { inject, provide } from 'vue';
import cecdCurrentStatus from "@/components/dashboards/Adminpages/cecd/dashboardcard/cecdCurrentStatus.vue";
import cecdScreeningData from "@/components/dashboards/Adminpages/cecd/dashboardcard/cecdScreeningData.vue";
import cecdTestTypeScreening from "@/components/dashboards/Adminpages/cecd/dashboardcard/cecdTestTypeScreening.vue";

// Inject the data
const serviceAndTreatmentData = inject('serviceAndTreatmentData');

// Loading state
const isLoading = computed(() => !serviceAndTreatmentData?.value);


// Provide the data to all child components
provide('serviceAndTreatmentData', serviceAndTreatmentData);
</script>