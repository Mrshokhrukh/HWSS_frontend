<template>
  <div class="carousel-container" @mouseenter="pauseAutoScroll" @mouseleave="resumeAutoScroll">
    <div class="carousel" ref="carousel">
      <div
        v-for="(image, index) in carouselImages"
        :key="'carousel-item-' + index"
        :class="['carousel-item', { active: index === activeIndex }]"
      >
        <img :src="image" :alt="`Slide ${index + 1}`" class="carousel-image" />
      </div>
    </div>

    <div class="carousel-controls">
      <button class="control-button prev" @click="prevSlide" aria-label="Previous slide">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button class="control-button next" @click="nextSlide" aria-label="Next slide">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <div class="carousel-indicators d-none">
      <button
        v-for="(image, index) in carouselImages"
        :key="'indicator-' + index"
        :class="['indicator', { active: index === activeIndex }]"
        @click="setActiveIndex(index)"
        :aria-label="`Go to slide ${index + 1}`"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import apiClient from '@/apiClient'
import endpoints from '@/api'

const carouselImages = ref([])
const activeIndex = ref(0)
const intervalDuration = 5000
let autoScrollInterval = null
const carousel = ref(null)

const nextSlide = () => {
  activeIndex.value = (activeIndex.value + 1) % carouselImages.value.length
}

const prevSlide = () => {
  activeIndex.value =
    (activeIndex.value - 1 + carouselImages.value.length) % carouselImages.value.length
}

const setActiveIndex = (index) => {
  activeIndex.value = index
}

const startAutoScroll = () => {
  autoScrollInterval = setInterval(nextSlide, intervalDuration)
}

const stopAutoScroll = () => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval)
  }
}

const pauseAutoScroll = () => {
  stopAutoScroll()
}

const resumeAutoScroll = () => {
  startAutoScroll()
}

onMounted(async () => {
  try {
    const response = await apiClient.get(endpoints.settings)
    if (response && response.data && response.data.length > 0) {
      const data = response.data[0]
      carouselImages.value = [
        data.carousel_image_1,
        data.carousel_image_2,
        data.carousel_image_3,
        data.carousel_image_4
      ].filter(Boolean) // Remove any undefined or null values
    }
    startAutoScroll()
  } catch (error) {
    console.error('Error fetching carousel images:', error)
  }
})

watch(activeIndex, (newIndex, oldIndex) => {
  stopAutoScroll()
  startAutoScroll()

  if (carousel.value) {
    const items = carousel.value.querySelectorAll('.carousel-item')
    items[oldIndex].classList.remove('active')
    items[newIndex].classList.add('active')
  }
})

onUnmounted(() => {
  stopAutoScroll()
})
</script>

<style scoped>
.carousel-container {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
}

.carousel {
  position: relative;
  height: 570px;
}

.carousel-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.carousel-item.active {
  opacity: 1;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.carousel-controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}

.control-button {
  background-color: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.control-button:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

.control-button .icon {
  width: 24px;
  height: 24px;
  color: #333;
}

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  display: flex;
  gap: 10px;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.indicator.active {
  background-color: rgba(7, 114, 77, 0.9);
  transform: scale(1.2);
}

.indicator:hover {
  background-color: rgba(255, 255, 255, 0.8);
}
</style>