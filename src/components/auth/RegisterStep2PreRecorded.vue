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

   

    <div class=" d-flex justify-content-center align-items-center p-5" >
        <div class="card shadow-card   ">
          
            <div class="text-center" style="flex-grow: 10;" >
                <h1 class="display-4" style="color: #2B656F; font-weight: bold" >Sign Up</h1>
                <p class="lead" style="color: #2B656F; font-weight: bold" >Prerecorded User Validation</p>
                
              </div>
              
        
                <div class="card border-radius:5px flex-start " style="flex-grow: 10; text-align: left;">
                    <div class="card-body form mb-3  ">
                        <h5 class="card-title ">User Details</h5>
                        <p class="card-text">Please kindly enter your details below to check if you are prerecorded or not</p>
                        <form @submit.prevent="verifyUser">
                          <div >
                              <label for="cid" class="form-label">Enter Your Citizenship ID</label> <br>
                              <input type="text" class="form-control transparent-border mb-3" id="cid" v-model="cid" required>
                          </div>
                          <div class="mb-3">
                              <label for="dob" class="mb-3">What’s your date of birth?</label> <br>
                              <input type="date" id="dob" v-model="dob" required>
                          </div>
                          <button type="submit" class=" btn custom-btn">Check</button>
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
.form {
    background-color:  #2B656F24;
  }
  .custom-btn {
    background-color: #2B656F;
    color: #fff; /* Text color */
    padding: 0.7rem 17.5rem; /* Adjust padding for the desired size */
    font-size: inherit; 
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
</style>
  