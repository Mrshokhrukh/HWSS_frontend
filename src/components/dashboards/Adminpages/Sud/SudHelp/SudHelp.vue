<template>
  <div>
    <video ref="videoPlayer" class="video-js vjs-default-skin"></video>
  </div>
</template>

<script>
import videojs from 'video.js';

export default {
  name: 'VideoJSExample',
  data() {
    return {
      player: null,
      videoOptions: {
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
      }
    };
  },
  mounted() {
    this.player = videojs(this.$refs.videoPlayer, this.videoOptions, () => {
      this.player.log('video player ready', this);
    });
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }
};
</script>

<style>
/* Import Video.js styles */
@import 'video.js/dist/video-js.css';
</style>
