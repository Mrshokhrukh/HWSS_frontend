<template>
  <div class="min-vh-100 d-flex justify-content-center align-items-center authbg">
    <div
      class="card shadow-lg bg-body rounded card-reg mx-auto"
      style="width: 100%; max-width: 1000px"
    >
      <div class="row g-0 loginbg">
        <div
          class="col-md-5 d-flex flex-column align-items-center justify-content-center position-relative left-card-side"
        >
          <img
            class="position-absolute start-0 bottom-0 img-fluid"
            src="@/assets/images/shape.png"
            alt="Shape Image"
            style="z-index: 1"
          />
          <div id="reg-img" class="text-center z-2 position-relative">
            <img
              :src="registrationLogo"
              class="img-fluid rounded reg-img bounce-animation"
              alt="Logo"
              style="max-width: 100%; width: 300px"
            />
            <h2 class="reg-heading display-7 mt-3">{{ tagline }}</h2>
          </div>
        </div>
        <div class="col-md-7 d-flex flex-column justify-content-center right-card-side">
          <div class="auth-form text-center px-3 px-md-5">
            <h2 class="text-center mt-4 mb-4 main-heading">Sign Up</h2>
            <p class="text-center text-capitalize sub-heading">Select type of user</p>
            <div class="row justify-content-center align-items-center g-3">
              <div class="col-sm-6">
                <div
                  :class="['card', 'reg-card', { active: selectedOption === 'pre-recorded' }]"
                  @click="updateSelectedUserType('pre-recorded')"
                >
                  <div class="card-body d-flex align-items-center flex-column">
                    <img
                      src="@/assets/images/pre-recorded-icon.png"
                      alt=""
                      class="img-fluid mb-3"
                      style="max-width: 60px"
                    />
                    <h6 class="card-text">Pre Recorded User</h6>
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div
                  :class="['card', 'reg-card', { active: selectedOption === 'new-user' }]"
                  @click="updateSelectedUserType('new-user')"
                >
                  <div class="card-body d-flex align-items-center flex-column">
                    <img
                      src="@/assets/images/agency-based-icon.png"
                      alt=""
                      class="img-fluid mb-3"
                      style="max-width: 60px"
                    />
                    <h6 class="card-text">Agency Based User</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="text-center mt-4 mb-5">
            <button
              class="btn btn-primary btn-lg rounded-pill continue-button mb-3"
              :disabled="!selectedOption"
              @click="continueToPage"
            >
              Continue
            </button>
            <p class="sign-in-text">
              Already have an account? <br />
              <router-link to="/login" class="sign-in-link">Sign In</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import endpoints from '@/api'
import apiClient from '@/apiClient'
import registrationLogo from '@/assets/images/seal.png'

const tagline = ref('')

onMounted(async () => {
  try {
    const response = await apiClient.get(endpoints.settings)
    const settings = response.data[0]
    tagline.value = settings.tagline
  } catch (error) {
    console.error('Error fetching settings:', error)
  }
})

const selectedOption = ref(null)

const emit = defineEmits(['select-user-type'])

const updateSelectedUserType = (type) => {
  selectedOption.value = type
}

const continueToPage = () => {
  if (selectedOption.value) {
    emit('select-user-type', selectedOption.value)
  }
}
</script>

<style scoped>
.card-reg {
  border-radius: 20px !important;
}

.loginbg {
  background-image: url('@/assets/images/thePemabg2.png');
  background-size: cover;
  min-height: 500px;
  border-radius: 20px;
  overflow: hidden;
}

#reg-img {
  height: 100%;
  border-radius: 5px 80px 80px 5px;
  width: 100%;
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.reg-heading {
  position: absolute;
  color: #fff;
  bottom: 23%;
  font-family: 'Boogaloo', sans-serif;
  font-weight: 400;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.continue-button {
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  color: #fff;
  width: 200px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.continue-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.continue-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reg-card {
  width: 15rem;
  height: 10rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 20px;
  padding: 1rem;
  border-radius: 20px;
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.reg-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.reg-card.active {
  border: 3px solid #2b656f;
  transform: scale(1.05);
}

.reg-card .card-text {
  color: #2b656f;
  font-weight: 600;
  margin-top: 10px;
}

.main-heading {
  color: #2b656f;
  font-weight: bold;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.sub-heading {
  color: #2b656f;
  font-weight: 600;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.sign-in-text {
  color: #2b656f;
  margin-bottom: 5px;
  font-size: 1rem;
}

.sign-in-link {
  color: #2b656f;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s ease;
}

.sign-in-link:hover {
  text-decoration: underline;
  opacity: 0.8;
}

.bounce-animation {
  animation: bounce 5s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@media (max-width: 767px) {
  .card-reg {
    width: 90% !important;
  }

  .left-card-side {
    padding: 2rem 0;
  }

  .right-card-side {
    padding: 2rem 1rem;
  }

  .continue-button {
    width: 80% !important;
  }

  .reg-card {
    width: 100%;
    margin: 10px 0;
  }
}
</style>