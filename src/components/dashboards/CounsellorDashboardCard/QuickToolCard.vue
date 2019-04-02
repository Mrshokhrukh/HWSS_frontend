<template>
  <div class="text-center">
    <div class="row">
      <div v-for="(tool, index) in quickTools" :key="index" class="mb-4">
        <router-link :to="`/counselor-dashboard/counselor-screening#${tool.link}`"> <!-- Modified line -->
          <div class="card text-white bg-color">
            <div class="card-body d-flex align-items-center">
              <img :src="tool.image" alt="" class="img-fluid mx-3">
              <h5 class="card-title" :style="{ color: tool.textColor, fontWeight: 'bold' }">{{ tool.title }}</h5>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import caseScreeningImg from '@/assets/images/casescreening.png';
import eventScreeningImg from '@/assets/images/eventscreening.png';

const quickTools = [
  { title: 'Case Screening', image: caseScreeningImg, textColor: '#2B656F', link: 'case-screening' },
  { title: 'Event Base Screening', image: eventScreeningImg, textColor: '#2B656F', link: 'event-based-screening' }
];
</script>

<style scoped>
.bg-color {
  background-color: #2B656F29;
  border-radius: 10px;
}
</style>

