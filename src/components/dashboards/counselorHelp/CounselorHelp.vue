<template>
  <div class="container py-5" :class="{ 'theme-light': isLightTheme }">
    <div v-if="loading" class="text-center my-5">
      <div class="spinner" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="videos.length === 0" class="alert text-center my-5" role="alert">
      No videos available at the moment. Please check back later.
    </div>
    <div v-else class="video-grid">
      <div v-for="(video, index) in videos" :key="index" class="video-card">
        <div class="card-content">
          <h3 class="video-title">{{ video.topic }}</h3>
          <div class="video-container">
            <iframe
              v-if="video.video_link"
              :src="getVideoEmbedUrl(video.video_link)"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
          <button class="toggle-btn" @click="toggleDetails(index)">
            {{ showDetails[index] ? 'Hide Details' : 'Show Details' }}
          </button>
          <transition name="fade">
            <div v-if="showDetails[index]" class="video-details">
              <p v-html="video.description"></p>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/apiClient'
import endpoints from '@/api'

const videos = ref([])
const loading = ref(true)
const showDetails = ref([])
const isLightTheme = ref(false) // You can toggle this based on user preference

onMounted(async () => {
  try {
    const response = await apiClient.get(endpoints.getVideo)
    videos.value = response.data.map((video) => ({
      topic: video.topic,
      description: JSON.parse(video.description).html,
      video_link: video.video_link
    }))
    showDetails.value = new Array(videos.value.length).fill(false)
  } catch (error) {
    console.error('Error fetching videos:', error)
  } finally {
    loading.value = false
  }
})

const getVideoEmbedUrl = (videoLink) => {
  const videoId = videoLink.split('v=')[1]
  return `https://www.youtube.com/embed/${videoId}`
}

const toggleDetails = (index) => {
  showDetails.value[index] = !showDetails.value[index]
}
</script>

<style scoped>
.theme-light {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.video-card {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-content {
  padding: 1.5rem;
}

.video-title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #2b656f;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  margin-bottom: 1rem;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.toggle-btn {
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.toggle-btn:hover {
  opacity: 0.9;
}

.video-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(43, 101, 111, 0.3);
  border-radius: 50%;
  border-top-color: #2b656f;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.alert {
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  color: white;
  padding: 1rem;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: 1fr;
  }
}
</style>