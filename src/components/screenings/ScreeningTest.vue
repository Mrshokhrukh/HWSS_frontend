<template>
    <div class="row">
        <div class="col-md-12">
            <div>
                <HelplineServices />
            </div>
            <div class="bg-white rounded">
                <ScreeningQuestion />
            </div>
        </div>
    </div>
</template>

<script setup>
import HelplineServices from "@/components/screenings/screeningCards/HelplineServices.vue"
import ScreeningQuestion from "@/components/screenings/screeningCards/ScreeningQuestion.vue"
</script>