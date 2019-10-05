<template>
  <div class="landing d-flex flex-column min-vh-100">
    <Particles />
    <div class="container my-auto py-5">
      <div class="row align-items-center">
        <div class="col-lg-6 mb-5 mb-lg-0">
          <div class="content text-center text-lg-start">
            <p class="d-none">Debug - landingTagLine: {{ landingTagLine }}</p>
            <p class="quote mb-4"
              v-typing="{ text: landingTagLine, loop: true, typeSpeed: 50, backSpeed: 30, backDelay: 2000 }"></p>
            <transition appear name="fade-slide-up">
              <h1 class="title">The PEMA</h1>
            </transition>
            <transition appear name="fade-slide-up" :delay="300">
              <h2 class="subtitle my-3">Health &amp; Wellbeing Screening System</h2>
            </transition>
            <transition appear name="fade-slide-up" :delay="600">
              <router-link to="/login" class="btn btn-lg mt-3 text-white get-started">
                Get Started <i class="fa-solid fa-arrow-right ms-2"></i>
              </router-link>
            </transition>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="image-background-container position-relative overflow-hidden">
            <transition name="fade-in" appear>
              <img :src="landingImgBg" alt="Background" class="bg-image img-fluid" @load="bgLoaded = true"
                v-show="bgLoaded">
            </transition>
            <transition name="zoom-fade" appear>
              <img :src="logoUrl" alt="PEMA Logo" class="logo-image img-fluid" @load="logoLoaded = true"
                v-show="logoLoaded" @mouseover="startLogoAnimation" @mouseleave="stopLogoAnimation"
                :class="{ 'logo-pulse': isLogoAnimating }">
            </transition>
          </div>
        </div>
      </div>
    </div>

    <div class="download-group-container text-center mt-auto py-4">
      <h3 class="download-title mb-3">Download our app from:</h3>
      <div class="store-buttons d-flex flex-wrap justify-content-center">
        <a :href="googlePlayLink" class="btn store-button google-play m-2" @mouseover="hoverStoreButton('google')"
          @mouseleave="unhoverStoreButton('google')">
          <div class="button-content">
            <div class="icon-area" v-if="googlePlayImg">
              <img :src="googlePlayImg" @error="googlePlayImg = null" alt="Google Play" class="store-icon">
            </div>
            <div v-else class="icon-area">
              <i class="fab fa-google-play"></i>
            </div>
            <div class="text-area">
              <div class="superscript-text">Get it On</div>
              <div class="store-name">Google Play</div>
            </div>
          </div>
        </a>
        <a :href="appleAppStoreLink" class="btn store-button app-store m-2" @mouseover="hoverStoreButton('apple')"
          @mouseleave="unhoverStoreButton('apple')">
          <div class="button-content">
            <div class="icon-area" v-if="appStoreImg">
              <img :src="appStoreImg" @error="appStoreImg = null" alt="App Store" class="store-icon">
            </div>
            <div v-else class="icon-area">
              <i class="fab fa-app-store-ios"></i>
            </div>
            <div class="text-area">
              <div class="superscript-text">Download on the</div>
              <div class="store-name">App Store</div>
            </div>
          </div>
        </a>
      </div>
    </div>

    <footer class="footer py-4">
      <div class="container">
        <div class="row align-items-center justify-content-between">
          <div class="col-md-8 text-center text-md-end">
            <p class="mb-0 footer-text">
              &copy; {{ currentYear }} The PEMA Secretariat. All rights reserved.
            </p>
            <p class="mb-0 footer-app-name">
              HWSS - Health & Wellbeing Screening System
            </p>
          </div>
          <!-- Social Media Icons -->
          <div class="col-md-4 text-center text-md-end social-icons">
            <a href="https://facebook.com" target="_blank">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com" target="_blank">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="https://linkedin.com" target="_blank">
              <i class="fab fa-linkedin-in"></i>
            </a>
            <a href="https://instagram.com" target="_blank">
              <i class="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { vTyping } from '@/directives/vTyping';
import axios from 'axios';
import endpoints from '@/api';
import logoUrl from '@/assets/images/landing_logo.png';
import landingImgBg from '@/assets/images/landing_bg.png';

const landingTagLine = ref('"Touching People, Building Lives"');
const googlePlayLink = ref('');
const appleAppStoreLink = ref('');
const googlePlayImg = ref(new URL('@/assets/images/playstore_logo.png', import.meta.url).href);
const appStoreImg = ref(new URL('@/assets/images/appstore_logo.png', import.meta.url).href);
const currentYear = computed(() => new Date().getFullYear());

const bgLoaded = ref(false);
const logoLoaded = ref(false);
const isLogoAnimating = ref(false);
let logoAnimationInterval = null;

onMounted(async () => {
  try {
    const response = await axios.get(endpoints.settings);
    if (response.data && response.data.length > 0) {
      const data = response.data[0];
      googlePlayLink.value = data.google_play_link;
      appleAppStoreLink.value = data.apple_appstore_link;
    }
  } catch (error) {
    console.error('Error fetching details:', error);
  }
});

const startLogoAnimation = () => {
  isLogoAnimating.value = true;
  logoAnimationInterval = setInterval(() => {
    isLogoAnimating.value = !isLogoAnimating.value;
  }, 1000);
};

const stopLogoAnimation = () => {
  clearInterval(logoAnimationInterval);
  isLogoAnimating.value = false;
};

</script>


<style scoped>
.social-icons a {
  margin: 0 10px;
  color: #ffffff;
  font-size: 1.2rem;
  transition: color 0.3s ease;
}

.social-icons a:hover {
  color: #f8f9fa;
}

.landing {
  background: linear-gradient(135deg, #9cbcc2, #f0f7f8);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite, gradientMorph 30s ease infinite;
  position: relative;
  overflow: hidden;
}

.landing::before,
.landing::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at center, rgba(220, 240, 235, 0.3) 0%, rgba(202, 232, 225, 0.1) 70%);
  animation: radialMove 20s ease-in-out infinite;
  z-index: 1;
  opacity: 0.7;
}

.landing::after {
  animation: radialMove 30s ease-in-out infinite reverse;
  background: radial-gradient(ellipse at center, rgba(203, 235, 226, 0.3) 0%, rgba(184, 226, 213, 0.1) 70%);
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes gradientMorph {
  0%, 100% {
    background: linear-gradient(135deg, #9cbcc2, #f0f7f8);
  }
  25% {
    background: radial-gradient(circle at top left, #9cbcc2, #f0f7f8);
  }
  50% {
    background: linear-gradient(45deg, #f0f7f8, #9cbcc2);
  }
  75% {
    background: radial-gradient(circle at bottom right, #f0f7f8, #9cbcc2);
  }
}

@keyframes radialMove {
  0% { transform: translate(0, 0); }
  25% { transform: translate(10%, 10%); }
  50% { transform: translate(-5%, 5%); }
  75% { transform: translate(5%, -10%); }
  100% { transform: translate(0, 0); }
}

/* Ensure content is above the background */
.landing > * {
  position: relative;
  z-index: 2;
}

.content {
  padding: 0 1rem;
}

.quote {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-family: Sriracha, cursive;
  color: #2b656f;
  font-weight: 300;
}

.title {
  font-family: "Poppins", sans-serif;
  font-weight: 600;
  font-size: clamp(2rem, 5vw, 3.5rem);
  color: #000;
}

.subtitle {
  color: #2b656f;
  font-size: clamp(1.2rem, 3vw, 1.8rem);
}

.get-started {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  transition: background-color 0.3s ease;
  border-radius: 20px;
}

.get-started:hover {
  background-color: #1e4a52;
}

.download-group-container {
  background-color: #f8f9fa38;
  backdrop-filter: blur(10px);
}

.download-title {
  font-size: 1.2rem;
}

/* New and updated styles */
.image-background-container {
  max-width: 100%;
  overflow: hidden;
  border-radius: 15px;
  transition: transform 0.3s ease;
}

.image-background-container:hover {
  transform: scale(1.02);
}

.bg-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.image-background-container:hover .bg-image {
  transform: scale(1.1);
}

.logo-image {
  position: absolute;
  max-width: 80%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.logo-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
  }

  50% {
    transform: translate(-50%, -50%) scale(1.05);
  }

  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

.fade-in-enter-active,
.fade-in-leave-active {
  transition: opacity 0.5s ease;
}

.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
}

.zoom-fade-enter-active,
.zoom-fade-leave-active {
  transition: all 0.5s ease;
}

.zoom-fade-enter-from,
.zoom-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

.store-button {
  transition: all 0.3s ease;
  background: #f0f7f8a8;
}

.store-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  background: #f0f7f8;
}

.image-background-container {
  max-width: 100%;
  overflow: hidden;
}

.bg-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.logo-image {
  position: absolute;
  max-width: 80%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.button-content {
  display: flex;
  align-items: center;
}

.icon-area {
  margin-right: 10px;
}

.store-icon,
.fab {
  height: 30px;
  width: auto;
}

.text-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.superscript-text {
  font-size: 0.7rem;
  line-height: 1;
}

.store-name {
  font-size: 1rem;
  font-weight: bold;
}

@media (max-width: 768px) {
  .content {
    text-align: center;
  }

  .logo-image {
    max-width: 60%;
  }
}

.footer {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  color: #ffffff;
}

.footer-text {
  font-size: 0.9rem;
  opacity: 0.9;
}

.footer-app-name {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .footer-logo {
    max-height: 40px;
    margin-bottom: 1rem;
  }

  .footer-text,
  .footer-app-name {
    font-size: 0.8rem;
  }
}

/* Add a subtle hover effect to the footer */
.footer {
  position: relative;
  overflow: hidden;
}

.footer::before {
  content: '';
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent);
  transition: top 0.3s ease;
}

.footer:hover::before {
  top: 0;
}

/* Add a subtle animation to the download buttons */
.store-button {
  transition: all 0.3s ease;
}

.store-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Improve the get started button */
.get-started {
  position: relative;
  overflow: hidden;
}

.get-started::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.get-started:hover::after {
  left: 100%;
}

/* Fade and slide up animation */
.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-up-enter-from,
.fade-slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Typing cursor effect */
.quote::after {
  content: '|';
  animation: blink 0.7s infinite;
}

@keyframes blink {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

/* Enhance the get started button */
.get-started {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.get-started::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: all 0.5s ease;
}

.get-started:hover::before {
  left: 100%;
}

.get-started:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(43, 101, 111, 0.3);
}

.get-started i {
  transition: transform 0.3s ease;
}

.get-started:hover i {
  transform: translateX(5px);
}

/* Add a subtle animation to the title and subtitle */
.title,
.subtitle {
  position: relative;
}

.title::after,
.subtitle::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 0;
  height: 2px;
  background-color: #2B656F;
  transition: width 0.5s ease;
}

.title:hover::after,
.subtitle:hover::after {
  width: 100%;
}
</style>