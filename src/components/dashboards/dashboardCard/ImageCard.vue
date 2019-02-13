<template>
  <div id="carouselExampleCaptions" class="carousel slide" data-bs-ride="carousel">
    <div class="carousel-indicators">
      <button v-for="(image, index) in carouselImages" :key="'indicator-' + index" type="button"
        data-bs-target="#carouselExampleCaptions" :data-bs-slide-to="index" :class="{ 'active': index === 0 }"
        aria-label="'Slide ' + (index + 1)"></button>
    </div>
    <div class="carousel-inner">
      <div v-for="(image, index) in carouselImages" :key="'carousel-item-' + index"
        :class="['carousel-item', { 'active': index === 0 }]">
        <img :src="image" alt="" class="d-block carousel-image">
        <!-- Optional: Carousel caption, if you have dynamic captions, they can be integrated here -->
        <div class="carousel-caption d-none d-md-block">
          <!-- Dynamic caption content if needed -->
        </div>
      </div>
    </div>
    <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>
</template>

<style>
.carousel-image {
  max-height: 24em;
  /* Adjust this value to fit your design needs */
  object-fit: cover;
  /* This makes the image cover the area of the div without stretching it. You can use 'contain' if you want to fit the whole image inside the div */
  width: 100%;
  /* This ensures the image is responsive and covers the width of the carousel */
}
</style>


<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const carouselImages = ref([]);

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/v1/settings/');
    if (response && response.data && response.data.length > 0) {
      const data = response.data[0];
      // Extracting carousel images from the API response
      carouselImages.value = [
        data.carousel_image_1,
        data.carousel_image_2,
        data.carousel_image_3,
        data.carousel_image_4
      ];
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
  return isLocalhost ? `` : '';
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
