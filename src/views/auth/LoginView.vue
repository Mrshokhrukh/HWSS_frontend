<template>
    <div class="container-fluid authbg p-5">
      <div class="card shadow-card">
        <div class="row g-0">
          <div class="col-md-8">
            <div class="card-body loginbg">
              <div class="auth-form">
                <h2 class="text-center mb-4" style="color: #2B656F; font-weight: bold">Sign In</h2>
                <form @submit.prevent="">
                  <div class="mb-3">
                    <input type="text" class="form-control" placeholder="Username" required />
                  </div>
                  <div class="mb-3">
                    <input type="password" class="form-control" placeholder="Password" required />
                  </div>
                  <div class="text-center">
                    <button type="submit" class="btn btn-primary signin-button">Sign In</button>
                  </div>
                </form>
                <br />
                <div>
                  <p class="text-center mt-3">
                    <img src="@/assets/images/NDILogo.png" alt="NDI Logo" />
                    <a href="#" style="color: black; font-weight: bold"> Login with NDI</a>
                  </p>
                </div>
                <p class="text-center mt-3" style="color: #2B656F;">
                  Don't have an account? <br />
                  <router-link to="/register" style="color: #2B656F; font-weight: bold">Sign Up</router-link>
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <img src="@/assets/images/signin.png" class="img-fluid rounded-start" alt="Sign In Image" />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts"></script>
  
  <style scoped>
  .authbg {
    background-image: url('@/assets/images/thePemabg.png');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    height: 100vh;
  }
  
  .loginbg {
    background-image: url('@/assets/images/thePemabg2.png');
    background-size: cover;
    height: 100%;
  }
  
  /* Add darker shadow to the card */
  .shadow-card {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  </style>
  