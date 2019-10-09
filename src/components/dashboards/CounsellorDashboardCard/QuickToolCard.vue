<template>
  <div class="card quick-tools-card h-100">
    <div class="card-header">
      <h4 class="card-title">Quick Tools</h4>
    </div>
    <div class="card-body">
      <div class="row">
        <div v-for="(tool, index) in quickTools" :key="index" class="col-12 mb-3">
          <router-link :to="`/counselor-dashboard/counselor-screening#${tool.link}`" class="tool-link">
            <div class="tool-button d-flex align-items-center mb-5">
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
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  box-shadow: 0 10px 20px rgba(43, 101, 111, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  padding: 1.25rem;
  border-bottom: none;
  text-align: center;
}

.card-title {
  color: #ffffff;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.card-body {
  flex: 1; 
  display: flex;
  justify-content: center;
  align-items: center; 
}

.row {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.tool-link {
  text-decoration: none;
  display: block;
  width: 100%; 
}

.tool-button {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  border-radius: 12px;
  padding: 0.75rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  align-items: center;
}

.tool-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(43, 101, 111, 0.15);
}

.icon-wrapper {
  background-color: rgba(255, 255, 255, 0.498);
  border-radius: 50%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
}

.tool-icon {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.tool-title {
  color: #ffffff;
  font-weight: 500;
  font-size: 1.1rem;
  margin-left: 0.75rem;
}

@media (max-width: 768px) {
  .card-header {
    padding: 1rem;
  }

  .card-body {
    padding: 1rem;
  }

  .tool-button {
    padding: 0.6rem;
  }

  .icon-wrapper {
    width: 40px;
    height: 40px;
  }

  .tool-title {
    font-size: 1rem;
  }
}
</style>
