<template>
  <div class="card-container">
    <div class="card p-4">
      <!-- Report Type Toggle -->
      <div class="report-toggle mb-4">
        <div class="toggle-buttons">
          <Button
            :label="isCounselorReport ? 'Counselor Reports' : 'Switch to Counselor Reports'"
            :class="['toggle-btn', { active: isCounselorReport }]"
            @click="toggleReportType('counselor')"
            icon="pi pi-users"
          />
          <Button
            :label="!isCounselorReport ? 'Gyalsung Reports' : 'Switch to Gyalsung Reports'"
            :class="['toggle-btn', { active: !isCounselorReport }]"
            @click="toggleReportType('gyalsung')"
            icon="pi pi-shield"
          />
        </div>
      </div>

      <!-- Render the appropriate component based on selection -->
      <component :is="currentReportComponent" />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import CounselorReports from '../counselorReporting/CounselorReporting.vue';
import GyalsungReportContent from '../GyalsungModel/ GyalsungReportContent.vue';

export default {
  name: 'GyalsungReports',
  components: {
    CounselorReports,
    GyalsungReportContent
  },
  setup() {
    const isCounselorReport = ref(false);
    
    const currentReportComponent = computed(() => {
      return isCounselorReport.value ? 'CounselorReports' : 'GyalsungReportContent';
    });

    const toggleReportType = (type) => {
      isCounselorReport.value = type === 'counselor';
    };

    return {
      isCounselorReport,
      currentReportComponent,
      toggleReportType
    };
  }
};
</script>

<style scoped>
.card-container {
  padding: 1rem;
}

.report-toggle {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
}

.toggle-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.toggle-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid #dee2e6;
  background: #f8f9fa;
  color: #6c757d;
}

.toggle-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.toggle-btn:hover:not(.active) {
  background: #e9ecef;
  border-color: #adb5bd;
}

@media (max-width: 768px) {
  .toggle-buttons {
    flex-direction: column;
  }
  
  .toggle-btn {
    width: 100%;
  }
}
</style>