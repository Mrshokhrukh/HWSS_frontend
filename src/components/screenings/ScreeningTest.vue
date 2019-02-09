<template>
    <div class="container">
        <div class="row">
        <div class="col-md-12">
            <div class="mx-auto">
                <HelplineServices />
            </div>
            <div class="bg-white rounded mx-auto my-5">
                <ScreeningQuestion />
            </div>
        </div>
    </div></div>
</template>

<script setup>
import HelplineServices from "@/components/screenings/screeningCards/HelplineServices.vue"
import ScreeningQuestion from "@/components/screenings/screeningCards/ScreeningQuestion.vue"
</script>

<style scoped>

</style>