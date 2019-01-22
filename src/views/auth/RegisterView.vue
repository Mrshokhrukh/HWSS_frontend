<template>
    <div class="container mt-5 text-center">
        <div v-if="isLoading" class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
        </div>
        <div v-else>
            <component :is="currentStepComponent" :user-data="fetchedCitizenDetails" @go-to-next-step="goToNextStep"
                @select-user-type="handleUserTypeSelection" />
            <last-component v-if="currentStep === 'step-four'" :fetchedDataStepOne="fetchedCitizenDetails"/>
        </div>
        <div v-if="error" class="alert alert-danger mt-3" role="alert">
            Oops! Something went wrong. Please try again.
        </div>
    </div>
</template>
  
<script setup>
import { ref, computed } from 'vue';
import RegisterStep1 from '@/components/auth/RegisterStep1.vue';
import RegisterStep2PreRecorded from '@/components/auth/RegisterStep2PreRecorded.vue';
import RegisterStep2NewUser from '@/components/auth/RegisterStep2NewUser.vue';
import RegisterStep3 from '@/components/auth/RegisterStep3.vue';
import RegisterStep4 from '@/components/auth/RegisterStep4.vue';
import RegisterStep4PreRecorded from '@/components/auth/RegisterStep4PreRecorded.vue';

const steps = {
    'start': RegisterStep1,
    'pre-recorded': RegisterStep2PreRecorded,
    'new-user': RegisterStep2NewUser,
    'step-three': RegisterStep3,
    'step-four': RegisterStep4,
    'step-two-prerecorded': RegisterStep4PreRecorded,
};

const currentStep = ref('start');
const currentStepComponent = computed(() => steps[currentStep.value]);
let fetchedCitizenDetails = ref({});

const goToNextStep = (targetStep, data) => {
    console.log('Fetched Data for Current Step:', fetchedCitizenDetails.value);
    currentStep.value = targetStep;
    if (data) {
        fetchedCitizenDetails.value = data;
    }
};


const handleUserTypeSelection = (type) => {
    if (type === 'pre-recorded') {
        currentStep.value = 'pre-recorded';
    } else if (type === 'pre-recorded2') {
        currentStep.value = 'pre-recorded2';
    } else if (type === 'new-user') {
        currentStep.value = 'new-user';
    } else if (type === 'step-three') {
        currentStep.value = 'step-three';
    } else if (type === 'step-four') {
        currentStep.value = 'step-four';
    }else {
        throw new Error('Invalid user type');
    }
};
</script>
