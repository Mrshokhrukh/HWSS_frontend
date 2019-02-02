<template>
    <div class="container">
        <img src="" alt="">
        <div class="row">
            <!-- <img src="@/assets/images/brainicon.png" alt=""> -->
            <div>
                <h6 class="card-subtitle mb-2 text-muted">Profile Details</h6>
                <form>
                    <div v-for="(field, label) in userFields" :key="label" class="mb-3">
                        <label :for="label" class="form-label">{{ label }}</label>
                        <input :type="field.type" class="form-control" :id="label" :value="field.value"
                            :disabled="field.disabled">
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';

// Define user and agency fields
const userFields = ref([
    { label: 'First Name', type: 'text', id: 'first_name', value: '', disabled: true },
    // Add other user fields as needed
]);

onMounted(() => {
    const userData = sessionStorage.getItem('userDetails') || {};


    userFields.value.forEach((field) => {
        field.value = userData[field.label.toLowerCase().replace(/\s+/g, '_')] || '';
    });

});

</script>