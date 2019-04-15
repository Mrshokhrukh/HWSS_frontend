<template>
  <div>
    <video ref="videoPlayer" class="video-js vjs-default-skin" controls preload="auto" width="200" height="360"></video>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import videojs from 'video.js';

const videoPlayer = ref(null);
const videoOptions = {
  autoplay: true,
  controls: true,
  preload: true,
  fluid: true,
  sources: [
    {
      src: 'http://127.0.0.1:8000/media/videos/dog.mp4',
      type: 'video/mp4'
    }
  ]
};

let player = null;

onMounted(() => {
  player = videojs(videoPlayer.value, videoOptions, () => {
    player.log('video player ready', player);
  });
});

onBeforeUnmount(() => {
  if (player) {
    player.dispose();
  }
});
</script>

<style>
/* Import Video.js styles */
@import 'video.js/dist/video-js.css';
</style>
