<template>
    <!-- <div>
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
    </div> -->

   

    <div class="container-fluid p-5" >
        <div class="card shadow-card text-center">
          
            <h2 >Sign Up</h2>
            Pre-Recorded User Verification
        
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">User Details</h5>
                        <p class="card-text">Please kindly enter your details below to check if you are prerecorded or not</p>
                        <form @submit.prevent="verifyUser">
                          <div>
                              <label for="cid">Enter Your Citizenship ID</label> <br>
                              <input type="text" id="cid" v-model="cid" required>
                          </div>
                          <div>
                              <label for="dob">What’s your date of birth?</label> <br>
                              <input type="date" id="dob" v-model="dob" required>
                          </div>
                          <button type="submit">Verify</button>
                        </form>
                      <p v-if="errorMessage">{{ errorMessage }}</p>
                    </div>
                </div>
                    <div class=" card-footer text-muted text-center">
                    Already have an Account? 
                    <a href="#">Sign In</a>
                    </div>
        </div>
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
<style scoped>

</style>
  