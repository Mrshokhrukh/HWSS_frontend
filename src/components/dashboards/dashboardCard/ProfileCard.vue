<template>
    <div class="card">
        <div class="card-header">
            <h5 class="card-title">Profile</h5>
        </div>
        <div class="card-body">
            <!-- User Details -->
            <div class="border p-3 mb-3">
                <h6 class="card-subtitle mb-2 text-muted">User Details</h6>
                <form>
                    <div v-for="(field, label) in userFields" :key="label" class="mb-3">
                        <label :for="label" class="form-label">{{ label }}</label>
                        <input :type="field.type" class="form-control" :id="label" :value="field.value"
                            :disabled="field.disabled">
                    </div>
                </form>
            </div>

            <!-- Agency Details -->
            <div class="border p-3">
                <h6 class="card-subtitle mb-2 text-muted">Agency Details</h6>
                <form>
                    <div v-for="(field, label) in agencyFields" :key="label" class="mb-3">
                        <label :for="label" class="form-label">{{ label }}</label>
                        <input :type="field.type" class="form-control" :id="label" :value="field.value"
                            :disabled="field.disabled">
                    </div>
                </form>
            </div>
        </div>

        <!-- Card Footer with Edit Button -->
        <div class="card-footer">
            <button class="btn btn-success" @click="editDetails">
                <i class="bi bi-pencil"></i> Edit Your Details
            </button>
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

const agencyFields = ref([
    { label: 'User Role at Agency', type: 'text', id: 'user_role_agency', value: '', disabled: true },
    // Add other agency fields as needed
]);

// Retrieve data from sessionStorage and populate fields
onMounted(() => {
    const userData = JSON.parse(sessionStorage.getItem('userDetails')) || {};
    const agencyData = JSON.parse(sessionStorage.getItem('agencyDetails')) || {};

    userFields.value.forEach((field) => {
        field.value = userData[field.label.toLowerCase().replace(/\s+/g, '_')] || '';
    });

    agencyFields.value.forEach((field) => {
        field.value = agencyData[field.label.toLowerCase().replace(/\s+/g, '_')] || '';
    });
});

// Method to handle edit button click
const editDetails = () => {
    // Add your edit functionality here
    console.log('Edit button clicked');
};
</script>
  
<style scoped>
/* Add any scoped styles here if needed */
.card-body {
    padding: 0;
    /* Remove default padding to align with card-header and card-footer */
}

.card-footer {
    padding: 1rem;
    /* Add padding to the card footer for better spacing */
}</style>
  