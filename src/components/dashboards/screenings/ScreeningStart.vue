<template>
    <div class="row mt-1">
        <div class="col-md-12">
            <div class="mx-auto">
                <HelplineServices />
            </div>
            <div class="rounded mx-auto my-5" style="position:absolute; top:15%">
                <ScreeningTest class="mx-auto mb-5" style="min-width: 80vw;" />
            </div>
        </div>
    </div>
</template>

<script setup>
import HelplineServices from "@/components/dashboards/screenings/screeningCards/HelplineServices.vue";
import ScreeningTest from "@/components/dashboards/screenings/screeningCards/ScreeningTest.vue";
</script>

<style scoped></style>
