<template>
    <span :class="badgeClasses">
        {{ displayStatus }}
    </span>
</template>
  
<script setup>
import { computed } from 'vue';

const props = defineProps({
    status: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: ''
    }
})

const displayStatus = computed(() => {
    return props.status == null || props.status === "" ? "N/A" : props.status;
});


const badgeClasses = computed(() => {
    let baseClass = 'badge';

    switch (displayStatus.value) {
        case 'Conducted':
            baseClass += ' bg-success';
            break;
        case 'Not Conducted':
            baseClass += ' bg-warning';
            break;
        case 'On Going':
            baseClass += ' bg-primary';
            break;
        case 'Case Closed':
            baseClass += ' bg-success';
            break;
        case 'Case Discontinued':
            baseClass += ' bg-danger';
            break;
        case 'Availed':
            baseClass += ' bg-success';
            break;
        case 'Not Required':
            baseClass += ' bg-secondary';
            break;
        case 'Waiting List':
            baseClass += ' bg-warning';
            break;
        case 'Treatment Completed':
        case 'Completed Counselling Sessions':
        case 'Follow-up Drug Test Conducted':
            baseClass += ' bg-success';
            break;
        case 'Undergoing Treatment':
        case 'Undergoing Rehabilitation':
        case 'Hospital-based Outpatient SUD Treatment and Care (Primary Phase)':
        case 'Hospital-based Outpatient SUD Treatment and Care (Continuing Care)':
        case 'School-based SUD Treatment and Care':
        case 'Institution-based SUD Treatment and Care':
        case 'Detention-based SUD Treatment and Care':
            baseClass += ' bg-primary';
            break;
        case 'Unwilling to Undergo Treatment':
        case 'Undergone Rehabilitation':
            baseClass += ' bg-danger';
            break;
        case "N/A":
            baseClass += ' bg-secondary';
            break;
        default:
            baseClass += ' bg-secondary';
    }
    return baseClass;
});
</script>