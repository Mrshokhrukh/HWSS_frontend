<template>
  <div class="image-card">
    <div id="carouselExampleCaptions" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-indicators">
        <button v-for="(image, index) in prefixedCarouselImages" :key="index" type="button" data-bs-target="#carouselExampleCaptions" :data-bs-slide-to="index" :class="{ active: index === activeIndex }"></button>
      </div>
      <div class="carousel-inner">
        <div v-for="(image, index) in prefixedCarouselImages" :key="index" :class="{ 'carousel-item': true, active: index === activeIndex }">
          <img :src="image" class="d-block w-100" :alt="`Slide ${index + 1}`">
          <div class="carousel-caption d-none d-md-block">
            <!-- Add any captions here if needed -->
          </div>
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev" @click="prevSlide">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next" @click="nextSlide">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';  
import axios from 'axios';
import endpoints from '@/api'; // Import the API endpoints

const activeIndex = ref(0);
const carouselImages = ref([]);
let intervalId;

onMounted(() => {
  fetchCarouselImages();
  startAutoScroll();
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});

async function fetchCarouselImages() {
  try {
    const cachedImages = sessionStorage.getItem('carouselImages');
    if (cachedImages) {
      carouselImages.value = JSON.parse(cachedImages);
    } else {
      const response = await axios.get(endpoints.settings);
      const settings = response.data[0];
      carouselImages.value = [
        settings.carousel_image_1,
        settings.carousel_image_2,
        settings.carousel_image_3,
        settings.carousel_image_4
      ];
      sessionStorage.setItem('carouselImages', JSON.stringify(carouselImages.value));
    }
  } catch (error) {
    console.error('Error fetching carousel images:', error);
  }
}


function startAutoScroll() {
  intervalId = setInterval(() => {
    nextSlide();
  }, 5000);
}

function nextSlide() {
  activeIndex.value = (activeIndex.value + 1) % carouselImages.value.length;
}

function prevSlide() {
  activeIndex.value = (activeIndex.value - 1 + carouselImages.value.length) % carouselImages.value.length;
}

const baseUrl = computed(() => {
  const isLocalhost = window.location.hostname === 'localhost' && window.location.port === '5173';
  return isLocalhost ? `` : 'http://172.30.3.5';
});

const prefixedCarouselImages = computed(() => {
  return carouselImages.value.map(image => `${baseUrl.value}${image}`);
});

</script>


<style scoped>.carousel-item {
  transition: opacity 0.5s ease-in-out;
}

.image-card {
  width: 100%;
  
}

.carousel-item img {
  object-fit: contain;
  margin: 0;
  border: none;
  aspect-ratio: 16/9;
  max-height: 500px;
}

/* .carousel-indicators {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
} */

.carousel-indicators button {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ccc; /* Default color */
  margin: 0 5px;
  border: none;
}

.carousel-indicators button.active {
  background-color: rgba(7, 114, 77, 0.671); /* Active color */
}
</style>
