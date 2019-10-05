<template>
  <div class="quick-tools-container">
    <div class="row">
      <div v-for="(tool, index) in quickTools" :key="index" class="col-12 mb-4">
        <router-link :to="`/counselor-dashboard/counselor-screening#${tool.link}`" class="tool-link">
          <div class="card tool-card">
            <div class="card-body d-flex align-items-center">
              <div class="icon-wrapper">
                <img :src="tool.image" :alt="tool.title" class="tool-icon">
              </div>
              <h5 class="card-title ms-3">{{ tool.title }}</h5>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import caseScreeningImg from '@/assets/images/casescreening.png';
import eventScreeningImg from '@/assets/images/eventscreening.png';

const quickTools = ref([
  { title: 'Case Screening', image: caseScreeningImg, link: 'case-screening' },
  { title: 'Event Based Screening', image: eventScreeningImg, link: 'event-based-screening' }
]);
</script>

<style scoped>
.quick-tools-container {
  padding: 1.5rem;
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(43, 101, 111, 0.1);
}

.tool-link {
  text-decoration: none;
  display: block;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.tool-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(43, 101, 111, 0.15);
}

.tool-card {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  border: none;
  border-radius: 12px;
  overflow: hidden;
}

.card-body {
  padding: 1.25rem;
}

.icon-wrapper {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
}

.tool-icon {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.card-title {
  color: #ffffff;
  font-weight: 600;
  font-size: 1.2rem;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .quick-tools-container {
    padding: 1rem;
  }

  .card-body {
    padding: 1rem;
  }

  .icon-wrapper {
    width: 50px;
    height: 50px;
  }

  .card-title {
    font-size: 1.1rem;
  }
}
</style>