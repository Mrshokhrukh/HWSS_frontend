<template>
  <div class="card text-center h-100 shadow-sm">
    <div class="card-header bg-gradient-dark">
      <h4 class="severity-title text-white mb-0">{{ cardTitle }}</h4>
    </div>
    <div class="card-body p-4">
      <div v-if="isLoading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else class="row g-3">
        <div class="col-12">
          <div v-for="(data, index) in processedIndicators" :key="index" class="mb-3">
            <router-link
              :to="`/counselor-dashboard/counselor-reports?severity=${data.text.toLowerCase()}&type=${cardTitle.toLowerCase()}`"
              class="card bg-hwss hover-effect">
              <div class="card-body d-flex align-items-center justify-content-between p-3">
                <div class="d-flex align-items-center">
                  <div class="color-dot" :style="{ background: data.color }"></div>
                  <h5 class="card-title mb-0 text-capitalize">{{ data.text }}</h5>
                </div>
                <div class="d-flex align-items-center">
                  <i :class="[data.icon, 'me-2']"></i>
                  <div class="count-number">
                    <h2 class="mb-0">{{ data.count }}</h2>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  cardTitle: {
    type: String,
    required: true
  },
  filteredData: {
    type: Array,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const processedIndicators = computed(() => {
  const counts = new Map();

  props.filteredData.forEach(entry => {
    let measurement = '';
    const cardTitleLower = props.cardTitle?.trim().toLowerCase();
    const screeningData = entry.screening_data || {};

    switch (cardTitleLower) {
      case 'suicidal behavior': {
        try {
          // Check if phq_data is already an object or needs parsing
          const phqDataString = screeningData.phq_data;
          const phqData = typeof phqDataString === 'string' 
            ? JSON.parse(phqDataString) 
            : phqDataString;
            
          const suicidalQuestion = phqData.responses?.[6];
          if (suicidalQuestion?.selectedOption) {
            measurement = suicidalQuestion.selectedOption;
          } else {
            console.warn(`No selectedOption for suicidal question in entry ${entry.id}`);
          }
        } catch (e) {
          console.error(`Error parsing phq_data for entry ${entry.id}:`, e);
        }
        break;
      }

      case 'depression': {
        measurement = screeningData.phq_interpretation || '';
        break;
      }

      case 'anxiety': {
        measurement = screeningData.gad_interpretation || '';
        break;
      }

      case 'ace': {
        measurement = screeningData.ace_interpretation || '';
        break;
      }

      default:
        console.warn(`Unhandled cardTitle: ${props.cardTitle}`);
    }

    if (measurement) {
      counts.set(measurement, (counts.get(measurement) || 0) + 1);
    } else {
      console.warn(`No measurement extracted for entry ${entry.id}`);
    }
  });

  return Array.from(counts.entries())
    .map(([text, count]) => ({
      text,
      count,
      color: getSeverityColor(text),
      icon: getSeverityIcon(text)
    }))
    .sort((a, b) => getSeverityOrder(a.text) - getSeverityOrder(b.text));
});


const getSeverityColor = (value) => {
  const lowerValue = value.toLowerCase();
  const colorMap = {
    'severe': '#dc3545',
    'moderately severe': '#ff4d4d',
    'moderate': '#ffc107',
    'mild': '#0dcaf0',
    'minimal': '#198754',
    'nearly everyday': '#dc3545',
    'more than half the days': '#ffc107',
    'several days': '#0dcaf0',
    'not at all': '#198754'
  };

  return colorMap[lowerValue] || '#6c757d';
};

const getSeverityIcon = (value) => {
  const lowerValue = value.toLowerCase();
  const iconMap = {
    'severe': 'fas fa-exclamation-triangle',
    'moderately severe': 'fas fa-exclamation-triangle',
    'moderate': 'fas fa-exclamation-circle',
    'mild': 'fas fa-info-circle',
    'minimal': 'fas fa-check-circle',
    'nearly everyday': 'fas fa-exclamation-triangle',
    'more than half the days': 'fas fa-exclamation-circle',
    'several days': 'fas fa-info-circle',
    'not at all': 'fas fa-check-circle'
  };

  return iconMap[lowerValue] || 'fas fa-question-circle';
};

const getSeverityOrder = (value) => {
  const orderMap = {
    'severe': 1,
    'moderately severe': 2,
    'moderate': 3,
    'mild': 4,
    'minimal': 5,
    'nearly everyday': 1,
    'more than half the days': 2,
    'several days': 3,
    'not at all': 4
  };

  return orderMap[value.toLowerCase()] || 99;
};
</script>

<style scoped>
.card {
  border: none;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.card-header {
  border-bottom: none;
  padding: 1.5rem;
}

.bg-gradient-dark {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.severity-title {
  color: white;
}

.bg-hwss {
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  color: #2b656f;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.hover-effect:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 10px;
}

.count-number {
  font-weight: bold;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
}

i {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .card-body {
    padding: 1rem;
  }

  .card-title {
    font-size: 0.9rem;
  }

  .count-number h2 {
    font-size: 1.5rem;
  }

  i {
    font-size: 1rem;
  }
}
</style>