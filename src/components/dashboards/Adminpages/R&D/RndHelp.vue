<template>
  <div class="row">
    <div v-for="(video, index) in videos" :key="index" class="col-md-6">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title text-center mb-3">{{ video.topic }}</h5>
          <div class="row mt-4">
            <div class="col-md-12 text-center">
              <video :src="getVideoUrl(video.src)" controls></video>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 text-center">
              <button type="button" class="btn btn-primary mt-4" @click="toggleDetails(index)">
                {{ showDetails[index] ? 'Show Less' : 'Show Details' }}
              </button>
              <div class="mt-4" v-if="showDetails[index]">
                <p>{{ video.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';

const videos = ref([]);

onMounted(async () => {
  try {
    const response = await axios.get(endpoints.getVideo);
    videos.value = response.data;
  } catch (error) {
    console.error('Error fetching videos:', error);
  }
});

const getVideoUrl = (videoSrc) => {
  const isLocalhost5173 = window.location.hostname === 'localhost' && window.location.port === '5173';
  const baseUrl = isLocalhost5173 ? 'http://localhost:8000' : 'https://thepemasystem.gov.bt/api/core'; // Adjust the condition as needed
  return baseUrl + videoSrc;
};

const showDetails = ref([false, false, false, false]);

const toggleDetails = (index) => {
  showDetails.value[index] = !showDetails.value[index];
};
</script>

<style scoped>
.card {
  margin-bottom: 20px;
}
</style>