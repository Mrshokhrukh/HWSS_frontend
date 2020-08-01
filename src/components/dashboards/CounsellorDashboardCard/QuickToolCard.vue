<template>
  <div class="card quick-tools-card h-100">
    <div class="card-header">
      <h4 class="card-title">Quick Tools</h4>
    </div>
    <div class="card-body d-flex flex-column justify-content-center">
      <div class="tool-container">
        <div v-for="(tool, index) in quickTools" :key="index" class="tool-wrapper">
          <router-link :to="`/counselor-dashboard/counselor-screening#${tool.link}`" class="tool-link">
            <div class="tool-button d-flex align-items-center">
              <div class="icon-wrapper">
                <img :src="tool.image" :alt="tool.title" class="tool-icon">
              </div>
              <span class="tool-title ms-3">{{ tool.title }}</span>
            </div>
          </router-link>
        </div>
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
.quick-tools-card {
  border: none;
  border-radius: 15px;
  overflow: hidden;
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  box-shadow: 0 10px 20px rgba(43, 101, 111, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  padding: 1.5rem;
  border-bottom: none;
  text-align: center;
}

.card-title {
  color: #ffffff;
  margin: 0;
  font-size: 1.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.card-body {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tool-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.tool-wrapper {
  margin-bottom: 1.5rem;
}

.tool-wrapper:last-child {
  margin-bottom: 0;
}

.tool-link {
  text-decoration: none;
  display: block;
  width: 100%;
}

.tool-button {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  border-radius: 15px;
  padding: 1.25rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  height: 80px;
}

.tool-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(43, 101, 111, 0.2);
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
  flex-shrink: 0;
}

.tool-icon {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.tool-title {
  color: #ffffff;
  font-weight: 600;
  font-size: 1.2rem;
  margin-left: 1rem;
}

@media (max-width: 768px) {
  .card-header {
    padding: 1.25rem;
  }

  .card-body {
    padding: 1.25rem;
  }

  .tool-button {
    padding: 1rem;
    height: 70px;
  }

  .icon-wrapper {
    width: 50px;
    height: 50px;
  }

  .tool-title {
    font-size: 1.1rem;
  }

  .tool-wrapper {
    margin-bottom: 1.25rem;
  }
}
</style>