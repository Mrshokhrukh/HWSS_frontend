<template>
    <div class="row mt-1">
        <div class="col-md-12">
            <div class="mx-auto">
                <HelplineServices />
            </div>
            <div class="bg-white rounded mx-auto my-5">
                <ScreeningQuestion />
            </div>
        </div>
    </div>
</template>

<script setup>
import HelplineServices from "@/components/dashboards/screenings/screeningCards/HelplineServices.vue"
import ScreeningQuestion from "@/components/dashboards/screenings/screeningCards/ScreeningQuestion.vue"
</script>

<style scoped></style>