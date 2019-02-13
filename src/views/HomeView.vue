<template>
  <div class="landing d-flex flex-column vh-100">
    <div class="container my-auto">
      <div class="row align-items-center">
        <div class="col-md-6">
          <div class="content text-center">
            <p class="quote mb-5">"{{ landingTagLine }}"</p>
            <h1 class="title">The PEMA</h1>
            <h2 class="subtitle my-3">Health & Wellbeing Screening System</h2>
            <router-link to="/login" class="btn btn-lg mt-2 text-white get-started">Get Started <i
                class="fa-solid fa-arrow-right"></i></router-link>
          </div>
        </div>

        <div class="col-md-6">
          <div class="image-background-container">
            <img :src="landingImgBg" alt="Background" class="bg-image">
            <img :src="logoUrl" alt="PEMA Logo" class="logo-image">
          </div>
        </div>
      </div>
    </div>

    <div class="download-group-container text-center mt-auto mb-5">
      <h3 class="download-title mb-3">Download our app from:</h3>
      <div class="store-buttons d-flex justify-content-center">
        <!-- Google Play Button -->
        <a :href="googlePlayLink" class="btn store-button google-play me-2">
          <div class="button-content">
            <div class="icon-area" v-if="googlePlayImg">
              <img :src="googlePlayImg" @error="googlePlayImg = null" alt="Google Play" class="store-icon" />
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
        <!-- Apple App Store Button -->
        <a :href="appleAppStoreLink" class="btn store-button app-store ms-2">
          <div class="button-content">
            <div class="icon-area" v-if="appStoreImg">
              <img :src="appStoreImg" @error="appStoreImg = null" alt="App Store" class="store-icon" />
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

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';

// Declare reactive variables for the new dynamic links
const logoUrl = ref('');
const landingImgBg = ref('');
const landingTagLine = ref('');
const googlePlayLink = ref('');
const appleAppStoreLink = ref('');
const googlePlayImg = ref('src/assets/images/playstore_logo.png');
const appStoreImg = ref('src/assets/images/appstore_logo.png');

onMounted(async () => {
  try {
    const response = await axios.get(endpoints.settings);
    if (response.data && response.data.length > 0) {
      const data = response.data[0];
      logoUrl.value = data.landing_page_logo;
      landingImgBg.value = data.landing_img_bg;
      landingTagLine.value = data.landing_tag_line;
      googlePlayLink.value = data.google_play_link;
      appleAppStoreLink.value = data.apple_appstore_link;
    }
  } catch (error) {
    console.error('Error fetching details:', error);
  }
});
</script>

<style scoped>
.landing {
  background-color: #FFFFFF;
}

.content {
  margin: 0 auto;
  padding: 0 2rem;
}

.quote {
  font-size: 2.5rem;
  font-family: Sriracha, cursive;
  color: #000;
  font-weight: 300;
}

.title {
  font-family: "Poppins", sans-serif;
  font-weight: 600;
  font-size: 3.5rem;
  color: #000;
}

.subtitle {
  color: #2b656f;
}

.get-started {
  background-color: #2B656F;
}

.download-group-container {
  padding: 2rem 0 3rem 0;
}

.download-title {
  font-size: 1.2rem;
}

.google-play,
.app-store {
  color: #363636;
  font-size: 1rem;
}

.image-background-container {
  height: 100%;
  width: 100%;
}

.bg-image {
  position: absolute;
  top: 0;
  right: 0;
  width: auto;
  max-height: 100%;
}

.logo-image {
  position: absolute;
  max-width: 450px;
  top: 50%;
  right: 10rem;
  transform: translateY(-50%);
}

.store-button {
  display: inline-flex;
  align-items: center;
  background-color: #f5f5f5; 
  padding: 10px 20px; 
  text-decoration: none;
  color: inherit;
}

.button-content {
  display: flex;
  align-items: center;
}

.icon-area {
  margin-right: 10px; 
}

.store-icon, .fab {
  height: 40px;
  width: auto;
}

.text-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.superscript-text {
  font-size: smaller;
  line-height: 1;
}

.store-name {
  font-size: larger; /* Adjust store name text size as needed */
  font-weight: bold;
}

</style>
