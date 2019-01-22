<template>
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow">
            <div class="text-center mt-3">
              <h1 class="display-4" style="color: #2B656F; font-weight: bold">Sign Up</h1>
              <p class="lead" style="color: #2B656F; font-weight: bold">Prerecorded User Validation</p>
            </div>
            <div class="container p-5 rounded">
            <div class="card-body text-start  form">
              <h5 class="card-title cust-tex ">User Detail</h5>
              <p class="card-text cust-tex ">Please set a unique Username and a strong password</p>
              <form @submit.prevent="createUser">
                <!-- Username and password fields -->
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" v-model="username" class=" cust-tex form-control bg-transparent border border-secondary" required>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" v-model="password" class=" cust-tex form-control bg-transparent border border-secondary" required>
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password:</label>
                    <input type="password" id="confirmPassword" v-model="confirmPassword" class=" cust-tex form-control bg-transparent border border-secondary" required>
                </div>
                <button type="submit" class="btn btn-primary custom-btn mt-3 col-12 p-2">Sign Up</button>
              </form>
          
            </div>
          </div>
            <div class="card-footer text-muted text-center" style="color: #2B656F; font-weight: bold">
              Already have an Account? 
              <router-link to="/login" class="text-primary cust-tex">Sign In</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  
  import { ref, defineProps} from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  
  const props = defineProps({
    userData: Object,
    agencyData: Object,
    fetchedDataStepOne: Object,
  });
  
  // onMounted(() => {
  //   console.log('Fetched Data from Previous Steps:', fetchedDataStepOne);
  // });
  ``
  // eslint-disable-next-line no-unused-vars
  const emit = defineEmits(['go-to-next-step']);
  // eslint-disable-next-line no-unused-vars
  const route = useRoute();
  const router = useRouter();
  
  const username = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  
  const createUser = async () => {
    if (password.value !== confirmPassword.value) {
        alert('Passwords do not match.');
        return;
    }
  
    // Prepare user data for submission
    const userSubmissionData = {
        ...props.userData,
        username: username.value,
        password: password.value,
        // Include any other necessary fields from userData or agencyData
    };
  
    // API call to create user
    try {
        const response = await fetch('http://localhost:8000/api/v1/access/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5173',  // Ensure this matches your frontend origin
            },
            credentials: 'include',  // Include this line for cross-origin requests with cookies
            body: JSON.stringify(userSubmissionData),
        });
  
        if (response.status === 201) {
            console.log('User created successfully');
            // Redirect to login or other appropriate page after successful account creation
            router.push({ name: 'login' });
        } else {
            console.error('Error creating user:', response.statusText);
            // Handle the error appropriately, e.g., show an error message to the user
        }
    } catch (error) {
        console.error('Error creating user:', error);
        // Handle the error appropriately, e.g., show an error message to the user
    }
  };
  
  </script>
  
  <style>
  /* Add custom styles */
  .form {
    background-color:  #2B656F24;
    border-radius: 15px;
  }
  .custom-btn {
    background-color: #2B656F;
    color: #fff; 
    font-size: inherit; 
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  .cust-text{
    color: #2B656F;
  }
  </style>