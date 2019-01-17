<template>
    <div>
        <h2>Step 2: Pre-Recorded User Verification</h2>
        <form @submit.prevent="verifyUser">
            <div>
                <label for="cid">CID Number:</label>
                <input type="text" id="cid" v-model="cid" required>
            </div>
            <div>
                <label for="dob">Date of Birth:</label>
                <input type="date" id="dob" v-model="dob" required>
            </div>
            <button type="submit">Verify</button>
        </form>
        <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
import axios from 'axios';

const cid = ref('');
const dob = ref('');
const errorMessage = ref('');
const emit = defineEmits(['go-to-next-step']);

const verifyUser = async () => {
    try {
        const response = await axios.post('http://localhost:8000/api/v1/access/verify-pre-recorded-user/', {
            cid: cid.value,
            dob: dob.value
        });
        if (response.data.success) {
            // Proceed to next step
            emit('go-to-next-step');
        } else {
            errorMessage.value = response.data.message || 'Verification failed';
        }
    } catch (error) {
        errorMessage.value = error.response.data.message || 'An error occurred during verification';
    }
};
</script>
  