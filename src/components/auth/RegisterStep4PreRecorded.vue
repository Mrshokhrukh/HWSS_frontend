<template>
  <div class="d-flex justify-content-center align-items-center" style="min-height: 100vh;">
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
                    <input type="text" id="username" v-model="username"
                      class=" cust-tex form-control bg-transparent border border-secondary" required>
                  </div>
                  <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" v-model="password"
                      class=" cust-tex form-control bg-transparent border border-secondary" required>
                  </div>
                  <div class="form-group">
                    <label for="confirmPassword">Confirm Password:</label>
                    <input type="password" id="confirmPassword" v-model="confirmPassword"
                      class=" cust-tex form-control bg-transparent border border-secondary" required>
                  </div>


                  <div class="my-4 row">
                    <!-- Disclaimer -->
                    <div class="disclaimer-container d-flex align-items-center mb-3">
                      <input type="checkbox" id="disclaimer" v-model="disclaimerChecked" class="me-2">
                      <label for="disclaimer">
                        The information I have provided is true to the best of my knowledge. I
                        understand that the information collected may be shared to provide services
                        and interventions.
                      </label>
                    </div>

                    <!-- Agreement Link -->
                    <div class="agreement-link">
                      <input type="checkbox" id="termsAndPolicy" v-model="termsAndPolicy" class="me-2">
                      By signing up, I agree to
                      <a class="hwss-primary fw-bold" href="#" @click.prevent="showTermsModal = true">Terms and
                        Policies</a>
                      of The PEMA HWSS Platform.
                    </div>
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
  </div>


  <!-- Modal for Terms and Policies -->
  <Dialog v-model:visible="showTermsModal" header="Terms and Policies" :style="{ width: '50vw' }">
    <div>
      <p>Welcome to The PEMA HWSS (Health and Wellbeing Screening System) platform ("PEMA HWSS"). By accessing or
        using PEMA HWSS, you agree to be bound by these Terms of Service ("Terms"). Please read these Terms
        carefully before accessing or using PEMA HWSS. If you do not agree with these Terms, you may not access
        or use PEMA HWSS.</p>

      <p><b>Use of PEMA HWSS:</b> PEMA HWSS is intended for personal and non-commercial use only. You may not use
        PEMA HWSS for any illegal or unauthorized purpose.</p>

      <p><b>Account Registration:</b> In order to access certain features of PEMA HWSS, you may be required to
        register for an account. You agree to provide accurate, current, and complete information during the
        registration process and to keep your account information updated.</p>

      <p><b>Privacy:</b> Your privacy is important to us. Please review our Privacy Policy to understand how we
        collect, use, and disclose information about you when you access or use PEMA HWSS.</p>

      <p><b>User Content:</b> You retain ownership of any content you submit, post, or display on PEMA HWSS ("User
        Content"). By submitting, posting, or displaying User Content, you grant PEMA HWSS a worldwide,
        non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute,
        and display such User Content in connection with providing PEMA HWSS.</p>

      <p><b>Prohibited Conduct:</b> You may not engage in any conduct that, in our sole discretion, restricts or
        inhibits any other user from using or enjoying PEMA HWSS, or that could damage, disable, overburden, or
        impair PEMA HWSS.</p>

      <p><b>Intellectual Property:</b> All intellectual property rights in PEMA HWSS are owned by or licensed to
        us. You may not use PEMA HWSS for any purpose not expressly permitted by these Terms.</p>

      <p><b>Disclaimer of Warranties:</b> PEMA HWSS is provided on an "as is" and "as available" basis, without
        any warranties of any kind, either express or implied.</p>

      <p><b>Limitation of Liability:</b> In no event shall PEMA HWSS be liable for any indirect, incidental,
        special, consequential, or punitive damages, arising out of or in connection with your use of PEMA HWSS.
      </p>

      <p><b>Governing Law:</b> These Terms shall be governed by and construed in accordance with the laws of
        Bhutan.</p>

      <p><b>Changes to Terms:</b> We reserve the right to modify or update these Terms at any time without prior
        notice. Your continued use of PEMA HWSS after any such changes constitutes your acceptance of the new
        Terms.</p>
    </div>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import endpoints from '@/api';
import Swal from 'sweetalert2';

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const router = useRouter();
const showTermsModal = ref(false);
const disclaimerChecked = ref(false);
const termsAndPolicy = ref(false);

const createUser = async () => {
  if (password.value !== confirmPassword.value) {
    Swal.fire('Error', 'Passwords do not match.', 'error');
    return;
  }

  if (!disclaimerChecked.value || !termsAndPolicy.value) {
        // Show an error message using SweetAlert
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Please agree to both the disclaimer and terms and policies before signing up.'
        });
        return;
    }

  try {
    let userData = JSON.parse(sessionStorage.getItem('user_data'));
    const agencyData = JSON.parse(sessionStorage.getItem('agency_data'));
    const userAgencyData = JSON.parse(sessionStorage.getItem('user_agency_data'));

    userData.username = username.value;
    userData.password = password.value;

    sessionStorage.setItem('user_data', JSON.stringify(userData));

    const userSubmissionData = {
      userData,
      agencyData,
      userAgencyData
    };

    console.log(userSubmissionData);

    const response = await axios.post(endpoints.registerPreRecordedUser, userSubmissionData);

    if (response.status === 201) {
      Swal.fire('Success', 'Registration successful!', 'success').then(() => {
        router.push({ name: 'login' });
        sessionStorage.removeItem('user_data');
        sessionStorage.removeItem('agency_data');
        sessionStorage.removeItem('user_agency_data');
      });
    } else {
      Swal.fire('Error', `Error: ${response.data.error}`, 'error');
    }
  } catch (error) {
    Swal.fire('Error', 'Error creating user: ' + error, 'error');
  }
};

</script>

<style scoped>
/* Add custom styles */
.form {
  background-color: #2B656F24;
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

.cust-text {
  color: #2B656F;
}
</style>