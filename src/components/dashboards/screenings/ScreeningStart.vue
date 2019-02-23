<template>
    <div class="row mt-1">
        <div class="col-md-12">
            <div class="mx-auto">
                <HelplineServices />
            </div>
            <div class="bg-white rounded mx-auto">
                <ScreeningTest class="mx-auto" style="min-width: 80vw; margin-top: 6rem" />
            </div>
        </div>
    </div>
</template>

<script setup>
import HelplineServices from "@/components/dashboards/screenings/screeningCards/HelplineServices.vue";
import ScreeningTest from "@/components/dashboards/screenings/screeningCards/ScreeningTest.vue";
</script>

<style scoped></style>
