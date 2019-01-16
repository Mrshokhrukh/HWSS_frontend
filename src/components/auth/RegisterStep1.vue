<template>
    <div class="container mt-5 text-center">
        <h2 class="mb-4">Step 1: User Type Selection</h2>
        <div class="row justify-content-center">
            <button @click="selectUserType('pre-recorded')" class="btn btn-primary m-2">
                Pre-Recorded User
            </button>
            <button @click="selectUserType('new-user')" class="btn btn-primary m-2">
                Register New User
            </button>
        </div>
    </div>
</template>
  
  
<script setup>
import { defineEmits } from 'vue';

const emit = defineEmits(['select-user-type']);

const selectUserType = (type) => {
    emit('select-user-type', type);
};
</script>
  