<template>
    <div class="row">
        <div class="container">
            <el-row :gutter="20" v-if="videos.length > 0">
                <el-col :span="12" v-for="(video, index) in videos" :key="index">
                    <el-card :body-style="{ padding: '0px' }">
                        <div class="card-body p-5">
                            <h5 class="card-title text-center mb-3">{{ video.topic }}</h5>
                            <img :src="getThumbnailUrl(video.thumbnail)" alt="Video Thumbnail"
                                class="img-fluid w-100 rounded">
                            <div class="text-center mt-3">
                                <el-button type="text" class="play-button" @click="playVideo(video.url)">
                                    <i class="el-icon-video-play"></i>
                                </el-button>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <div v-else class="card w-100 bg-light">
                <div class="card-body text-center">
                    <h5 class="card-title">No videos available</h5>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElRow, ElCol, ElCard, ElButton } from 'element-plus';
import endpoints from '@/api';

// Define a reactive variable to store the fetched videos
const videos = ref([]);

// Function to play the video
const playVideo = (url) => {
    // Logic to play the video
    console.log('Playing video:', url);
};

// Fetch videos from the backend when the component is mounted
onMounted(async () => {
    try {
        const response = await axios.get(endpoints.getVideo);
        videos.value = response.data;
    } catch (error) {
        console.error('Error fetching videos:', error);
    }
});

// Function to get the thumbnail URL with base URL
const getThumbnailUrl = (thumbnail) => {
    const isLocalhost5173 = window.location.hostname === 'localhost' && window.location.port === '5173';
  const baseUrl = isLocalhost5173 ? 'http://localhost:8000' : 'http://172.30.3.5'; // Adjust the condition as needed
  return baseUrl + thumbnail;
};
</script>

<style scoped>
/* Add custom styles here if needed */
.play-button {
    font-size: 24px;
}
</style>