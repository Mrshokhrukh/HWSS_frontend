<template>
  <div class="carousel slide">
    <div class="carousel-indicators">
      <button v-for="(image, index) in carouselImages" :key="'indicator-' + index" type="button"
        :class="{ 'active': index === activeIndex }" @click="activeIndex = index"
        aria-label="'Slide ' + (index + 1)"></button>
    </div>
    <div class="carousel-inner">
      <div v-for="(image, index) in carouselImages" :key="'carousel-item-' + index"
        :class="['carousel-item', { 'active': index === activeIndex }]">
        <img :src="image" class="d-block w-100" alt="">
      </div>
    </div>
    <button class="carousel-control-prev" type="button" @click="prevSlide">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" @click="nextSlide">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';
import endpoints from '@/api';

const carouselImages = ref([]);
const activeIndex = ref(0);
const intervalDuration = 5000;
let autoScrollInterval = null;

// Function to advance to the next slide
function nextSlide() {
  activeIndex.value = (activeIndex.value + 1) % carouselImages.value.length;
}

// Function to go to the previous slide
function prevSlide() {
  activeIndex.value = (activeIndex.value - 1 + carouselImages.value.length) % carouselImages.value.length;
}

// Function to start auto-scrolling
function startAutoScroll() {
  autoScrollInterval = setInterval(nextSlide, intervalDuration);
}

// Function to stop auto-scrolling
function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
  }
}

// Fetch carousel images on mounted
onMounted(async () => {
  try {
    const response = await axios.get(endpoints.settings);
    if (response && response.data && response.data.length > 0) {
      const data = response.data[0];
      carouselImages.value = [
        data.carousel_image_1,
        data.carousel_image_2,
        data.carousel_image_3,
        data.carousel_image_4,
      ];

      // Start auto-scrolling after images are loaded
      startAutoScroll();
    }
  } catch (error) {
    console.error('Error fetching carousel images:', error);
  }
});

// Restart auto-scrolling whenever the activeIndex changes due to manual navigation
watch(activeIndex, () => {
  stopAutoScroll();
  startAutoScroll();
});

// Clean up the interval when the component unmounts
onUnmounted(() => {
  stopAutoScroll();
});
</script>



<style scoped>
.carousel-item {
  transition: opacity 0.5s ease-in-out;
  height: 100%;
}

.image-card {
  width: 100%;
}

.carousel-item img {
  object-fit: cover;
  object-position: center;
  margin: 0;
  border: none;
  height: 100%;
  max-height: 570px;
  border-radius: 5px;
}

.carousel-indicators button {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ccc;
  margin: 0 5px;
  border: none;
}

.carousel-indicators button.active {
  background-color: rgba(7, 114, 77, 0.671);
}
</style>
