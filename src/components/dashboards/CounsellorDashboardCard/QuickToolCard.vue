<template>
  <div class="container text-center">
    <div class="row">
      <div v-for="(tool, index) in quickTools" :key="index" class="mb-4">
        <div class="card text-white bg-color">
          <div class="card-body d-flex align-items-center">
            <img :src="tool.image" alt="" class="img-fluid mx-3">
            <h5 class="card-title" :style="{ color: tool.textColor, fontWeight: 'bold' }">{{ tool.title }}</h5>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import caseScreeningImg from '@/assets/images/casescreening.png';
import eventScreeningImg from '@/assets/images/eventscreening.png';

const quickTools = [
  { title: 'Case Screening', image: caseScreeningImg, textColor: '#2B656F' },
  { title: 'Event Base Screening', image: eventScreeningImg, textColor: '#2B656F' }
];
</script>

<style scoped>
.bg-color {
  background-color: #2B656F29;
  border-radius: 10px;
}
</style>
