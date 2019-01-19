<template>
  <div class="container authbg cust-margin">
    <div class="card shadow-card">
      <div class="row g-0 loginbg">
        <div class="col-md-7">
          <div class="card-body">
            <div class="auth-form text-center">
              <h1 class="text-center mb-4 bold" style="color: #2B656F;">Sign In</h1>
              <form class="row justify-content-center" @submit.prevent="">
                <div class="mb-3 col-md-8">
                  <input type="text" class="form-control" placeholder="Username" required />
                </div>
                <div class="mb-3 col-md-8">
                  <input type="password" class="form-control" placeholder="Password" required />
                </div>
                <div class="text-center col-md-8">
                  <button type="submit" class="btn  col-md-12 rounded-pill singin-button btnbg" >Sign In</button>
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
        <div class="col-md-5 custombg text-center ">
          <img class="mt-5" src="../../assets/images/Logo.png" alt="Logo" style="width: 350px;">
          <h2 class="text-white display-4">Mental Health matters</h2>
          <img src="" alt="">
          <img class="float-start" src="../../assets/images/shape.png" alt="">
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup lang="ts"></script>
  
  <style scoped>

  .loginbg {
    background-image: url('@/assets/images/thePemabg2.png');
    background-size: cover;
    height: 100%;
  }
  
  /* Add darker shadow to the card */
  .shadow-card {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  .custombg{
    background-color: #2C6975;
    border-radius: 20% 0 0 20%;
    height: 60vh;
  }
  .cust-margin{
    margin-top: 7%;
    margin-bottom: auto;
  }
  .cust-border{
    border-radius: 50%;
  }


.auth-form .signin-button {
  border-radius: 20px; /* Adjust the border-radius as needed for rounded corners */
 
}
.btnbg{
  background-color: #2B656F;
  color: white;
}
  </style>
  