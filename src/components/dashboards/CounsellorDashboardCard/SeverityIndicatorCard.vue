<template>
  <div class="card text-center h-100 shadow-lg">
    <div class="card-header bg-gradient-primary">
      <h4 class="severity-title text-white mb-0 font-bold">{{ cardTitle }}</h4>
    </div>
    <div class="card-body p-4">
      <div v-if="isLoading" class="text-center">
        <div class="spinner-border text-teal-600" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else class="row g-4">
        <div class="col-12">
          <div v-for="(data, index) in processedIndicators" :key="index" class="mb-4">
            <div class="severity-card" @click="openModal(data)">
              <div class="card-content">
                <div class="indicator-info">
                  <div class="severity-marker" :style="{ background: data.color }"></div>
                  <h5 class="indicator-title text-capitalize">{{ data.text }}</h5>
                </div>
                <div class="count-info">
                  <i :class="[data.icon, 'status-icon']"></i>
                  <div class="count-display">
                    <h2 class="mb-0">{{ data.count }}</h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">{{ selectedData?.text }} Details</h4>
          <button class="close-button" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="user-list">
            <div v-for="(user, idx) in getUsersForSeverity" :key="idx" class="user-card">
              <div class="user-header">
                <div class="user-avatar">
                  {{ getInitials(user.user?.first_name, user.user?.last_name) }}
                </div>
                <div class="user-info">
                  <h5>{{ user.user?.first_name }} {{ user.user?.last_name }}</h5>
                  <p class="text-muted">{{ user.user?.email }}</p>
                </div>
              </div>
              <div class="user-details">
                <div class="detail-item">
                  <span class="detail-label">Gender:</span>
                  <span class="detail-value">{{ user.user?.gender || 'Not specified' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Screening Date:</span>
                  <span class="detail-value">{{ formatDate(user.screening_data?.submission_date) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Score:</span>
                  <span class="detail-value" :class="getSeverityClass(selectedData?.text)">
                    {{ getScoreForCard(user) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

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

const showModal = ref(false);
const selectedData = ref(null);

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to get user initials
const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return (first + last).toUpperCase();
};

// Get score based on card type
const getScoreForCard = (user) => {
  const screeningData = user.screening_data || {};
  
  switch (props.cardTitle.toLowerCase()) {
    case 'suicidal behavior': {
      try {
        const phqData = JSON.parse(screeningData.phq_data);
        return phqData.responses[6]?.selectedOption || 'N/A';
      } catch (e) {
        return 'N/A';
      }
    }
    case 'depression':
      return `${screeningData.phq_score || 0} - ${screeningData.phq_interpretation || 'N/A'}`;
    case 'anxiety':
      return `${screeningData.gad_score || 0} - ${screeningData.gad_interpretation || 'N/A'}`;
    case 'ace':
      return `${screeningData.ace_score || 0} - ${screeningData.ace_interpretation || 'N/A'}`;
    default:
      return 'N/A';
  }
};

// Get severity class for styling
const getSeverityClass = (severity) => {
  const severityMap = {
    'severe': 'text-red-600',
    'moderately severe': 'text-orange-600',
    'moderate': 'text-yellow-600',
    'mild': 'text-blue-600',
    'minimal': 'text-green-600'
  };
  return severityMap[severity?.toLowerCase()] || 'text-gray-600';
};

// Get filtered users for selected severity
const getUsersForSeverity = computed(() => {
  if (!selectedData.value) return [];
  
  return props.filteredData.filter(user => {
    const screeningData = user.screening_data || {};
    const measurement = getMeasurementForCard(screeningData);
    return measurement === selectedData.value.text;
  });
});

// Get measurement based on card type
const getMeasurementForCard = (screeningData) => {
  switch (props.cardTitle.toLowerCase()) {
    case 'suicidal behavior': {
      try {
        const phqData = JSON.parse(screeningData.phq_data);
        return phqData.responses[6]?.selectedOption || null;
      } catch (e) {
        return null;
      }
    }
    case 'depression':
      return screeningData.phq_interpretation;
    case 'anxiety':
      return screeningData.gad_interpretation;
    case 'ace':
      return screeningData.ace_interpretation;
    default:
      return null;
  }
};

const openModal = (data) => {
  selectedData.value = data;
  showModal.value = true;
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  showModal.value = false;
  selectedData.value = null;
  document.body.style.overflow = 'auto';
};

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
  border-radius: 1.25rem;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 10px 20px rgba(43, 101, 111, 0.1);
}

.card-header {
  border-bottom: none;
  padding: 1.75rem;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.severity-title {
  letter-spacing: 0.5px;
  font-size: 1.5rem;
}

.severity-card {
  display: block;
  text-decoration: none;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.severity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(43, 101, 111, 0.15);
}

.card-content {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.indicator-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.severity-marker {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.indicator-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: white;
}

.count-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-icon {
  font-size: 1.3rem;
  opacity: 0.9;
}

.count-display h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  color: #2B656F;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  color: white;
  border-radius: 1rem 1rem 0 0;
}

.modal-title {
  margin: 0;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 1.5rem;
}

.user-list {
  display: grid;
  gap: 1rem;
}

.user-card {
  background: #f8fafc;
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-info h5 {
  margin: 0;
  color: #1f2937;
  font-weight: 600;
}

.user-info p {
  margin: 0;
  font-size: 0.875rem;
}

.user-details {
  display: grid;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 0.5rem;
}

.detail-label {
  color: #4b5563;
  font-weight: 500;
}

.detail-value {
  font-weight: 600;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .user-card {
    padding: 1rem;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    font-size: 0.875rem;
  }
}

@media (max-width: 768px) {
  .card-header {
    padding: 1.25rem;
  }

  .severity-title {
    font-size: 1.25rem;
  }

  .card-content {
    padding: 1rem;
  }

  .indicator-title {
    font-size: 1rem;
  }

  .count-display h2 {
    font-size: 1.5rem;
  }

  .status-icon {
    font-size: 1.1rem;
  }
}
</style>