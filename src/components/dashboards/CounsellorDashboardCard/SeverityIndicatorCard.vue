<template>
  <!-- Main Card Container -->
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
  </div>

  <!-- First Modal - User List -->
  <Teleport to="body">
    <div v-if="showModal" class="modal-backdrop" @click="closeModal">
      <div class="modal-wrapper" @click.stop>
        <div class="modal-container">
          <div class="modal-header">
            <div class="header-content">
              <div class="severity-indicator" :style="{ background: selectedData?.color }"></div>
              <h4 class="modal-title">{{ selectedData?.text }} Patients</h4>
            </div>
            <button class="close-button" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="user-cards-list">
              <div v-for="(user, idx) in getUsersForSeverity" :key="idx" class="user-card">
                <div class="user-avatar-section">
                  <div class="avatar">
                    {{ getInitials(user.user?.first_name, user.user?.last_name) }}
                    <span class="status-badge" :style="{ background: selectedData?.color }">
                      <i :class="selectedData?.icon"></i>
                    </span>
                  </div>
                </div>

                <div class="user-info-section">
                  <div class="user-primary-info">
                    <h5 class="user-name">{{ user.user?.first_name }} {{ user.user?.last_name }}</h5>
                    <p class="user-email">{{ user.user?.email }}</p>
                  </div>

                  <div class="assessment-info">
                    <div class="score-badge" :class="getSeverityClass(selectedData?.text)">
                      Score: {{ getScoreForCard(user) }}
                    </div>
                    <div class="additional-info">
                      <span class="info-label">Screening Date:</span>
                      <span class="info-value">{{ formatDate(user.screening_data?.submission_date) }}</span>
                    </div>
                  </div>

                  <button class="view-details-btn" @click="viewUserDetails(user)">
                    <i class="fas fa-chart-line"></i>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Second Modal - Detailed User Report -->
    <Dialog v-model:visible="showUserDetailsModal" :modal="true" :header="false" :closable="false" class="detailed-modal">
      <div class="detailed-modal-content">
        <div class="detailed-modal-header">
          <div class="patient-info">
            <div class="patient-avatar">
              {{ getInitials(selectedUserForDetails?.user?.first_name, selectedUserForDetails?.user?.last_name) }}
            </div>
            <div class="patient-details">
              <h3>
                {{ selectedUserForDetails?.user?.first_name }}
                {{ selectedUserForDetails?.user?.last_name }}
              </h3>
              <span class="patient-id">ID: #{{ selectedUserForDetails?.user?.id }}</span>
            </div>
          </div>
          <Button icon="pi pi-times" @click="closeUserDetails" class="close-detailed-modal" />
        </div>

        <div class="detailed-modal-body">
          <div class="content-grid">
            <!-- Patient Information Card -->
            <div class="info-section">
              <div class="info-card h-100">
                <h4>Basic Information</h4>
                <div class="info-list">
                  <div class="info-item">
                    <i class="fas fa-birthday-cake"></i>
                    <div class="item-content">
                      <label>Age</label>
                      <span>{{ calculateAge(selectedUserForDetails?.user?.date_of_birth) }} years</span>
                    </div>
                  </div>
                  <div class="info-item">
                    <i class="fas fa-venus-mars"></i>
                    <div class="item-content">
                      <label>Gender</label>
                      <span>{{ selectedUserForDetails?.user?.gender }}</span>
                    </div>
                  </div>
                  <div class="info-item">
                    <i class="fas fa-phone"></i>
                    <div class="item-content">
                      <label>Contact</label>
                      <span>{{ selectedUserForDetails?.user?.mob_number }}</span>
                    </div>
                  </div>
                  <div class="info-item">
                    <i class="fas fa-envelope"></i>
                    <div class="item-content">
                      <label>Email</label>
                      <span>{{ selectedUserForDetails?.user?.email }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Assessment Results -->
            <div class="assessment-section">
              <div class="assessment-card mental-health h-100">
                <h4>Mental Health Assessment</h4>
                <div class="assessment-grid">
                  <div class="assessment-item"
                    :class="getSeverityClass(selectedUserForDetails?.screening_data?.phq_interpretation)">
                    <div class="item-header">
                      <i class="fas fa-brain"></i>
                      <h5>Depression (PHQ-9)</h5>
                    </div>
                    <div class="item-value">
                      {{ selectedUserForDetails?.screening_data?.phq_interpretation || 'N/A' }}
                    </div>
                    <div class="item-score">
                      Score: {{ selectedUserForDetails?.screening_data?.phq_score || 'N/A' }}
                    </div>
                  </div>

                  <div class="assessment-item"
                    :class="getSeverityClass(selectedUserForDetails?.screening_data?.gad_interpretation)">
                    <div class="item-header">
                      <i class="fas fa-head-side-virus"></i>
                      <h5>Anxiety (GAD-7)</h5>
                    </div>
                    <div class="item-value">
                      {{ selectedUserForDetails?.screening_data?.gad_interpretation || 'N/A' }}
                    </div>
                    <div class="item-score">
                      Score: {{ selectedUserForDetails?.screening_data?.gad_score || 'N/A' }}
                    </div>
                  </div>

                  <div class="assessment-item"
                    :class="getSeverityClass(selectedUserForDetails?.screening_data?.ace_interpretation)">
                    <div class="item-header">
                      <i class="fas fa-chart-line"></i>
                      <h5>ACE Score</h5>
                    </div>
                    <div class="item-value">
                      {{ selectedUserForDetails?.screening_data?.ace_interpretation || 'N/A' }}
                    </div>
                    <div class="item-score">
                      Score: {{ selectedUserForDetails?.screening_data?.ace_score || 'N/A' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

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
  },
  severityCounts: {
    type: Object,
    default: () => ({}),
  }
});

const showModal = ref(false);
const selectedData = ref(null);
const showUserDetailsModal = ref(false);
const selectedUserForDetails = ref(null);

const viewUserDetails = (user) => {
  selectedUserForDetails.value = user;
  showUserDetailsModal.value = true;
};

const closeUserDetails = () => {
  selectedUserForDetails.value = null;
  showUserDetailsModal.value = false;
};

const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const filterNonInjectionSubstances = (assistData) => {
  if (!assistData) return {};

  const substances = {};
  Object.keys(assistData).forEach((key) => {
    if (key.endsWith('_measurement') && !key.includes('injection')) {
      const substanceName = key.replace('_measurement', '');
      substances[substanceName] = {
        measurement: assistData[key],
      };
    }
  });
  return substances;
};

const formatSubstanceName = (name) => {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getRiskClass = (measurement) => {
  switch (measurement?.toLowerCase()) {
    case 'high risk':
      return 'risk-high bg-red-50 border-red-200';
    case 'moderate risk':
      return 'risk-moderate bg-yellow-50 border-yellow-200';
    case 'low risk':
      return 'risk-low bg-green-50 border-green-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const getRiskTextClass = (measurement) => {
  switch (measurement?.toLowerCase()) {
    case 'high risk':
      return 'text-red-700';
    case 'moderate risk':
      return 'text-yellow-700';
    case 'low risk':
      return 'text-green-700';
    default:
      return 'text-gray-700';
  }
};

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
        const suicidalQuestion = phqData.responses.find(q =>
          q.question && q.question.toLowerCase().includes('thoughts that you would be better off dead')
        );
        return suicidalQuestion?.selectedOption || 'N/A';
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
  const cardTitleLower = props.cardTitle?.trim().toLowerCase();

  return props.filteredData.filter(user => {
    const screeningData = user.screening_data || {};
    let measurement = '';
    let hasSuicidalThoughts = false;
    switch (cardTitleLower) {
      case 'suicidal behavior': {
        try {
          const phqDataString = screeningData.phq_data;
          const phqData = typeof phqDataString === 'string'
            ? JSON.parse(phqDataString)
            : phqDataString;


          if (Array.isArray(phqData)) {
            const suicideQuestion = phqData.find(q =>
              q.question && q.question.toLowerCase().includes('thoughts that you would be better off dead')
            );
            hasSuicidalThoughts = suicideQuestion?.score >= 1;
          } else if (phqData?.responses) {
            const suicideQuestion = phqData.responses.find(q =>
              q.question && q.question.toLowerCase().includes('thoughts that you would be better off dead')
            );
            hasSuicidalThoughts = suicideQuestion?.score >= 1;
          }

          if (hasSuicidalThoughts) {
            measurement = 'Has Suicidal Thoughts'
          }

        } catch (e) {
          console.error("error in filtering suicidal data", e);
        }
        break;
      }
      case 'depression': {
        measurement = screeningData.phq_interpretation || null;
        break;
      }
      case 'anxiety': {
        measurement = screeningData.gad_interpretation || null;
        break;
      }

      case 'ace': {
        measurement = screeningData.ace_interpretation || null;
        break;
      }
      default:
        return false;
    }
    return measurement === selectedData.value.text;
  });
});

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
  const cardTitleLower = props.cardTitle?.trim().toLowerCase();
  const counts = props.severityCounts[props.cardTitle] || {};

  return Object.entries(counts)
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
    'not at all': '#198754',
    'has suicidal thoughts': '#dc3545',
    'has risk': '#ffc107'
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
    'not at all': 'fas fa-check-circle',
    'has suicidal thoughts': 'fas fa-exclamation-triangle',
    'has risk': 'fas fa-exclamation-circle'
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
    'not at all': 4,
    'has suicidal thoughts': 1,
    'has risk': 2
  };
  return orderMap[value.toLowerCase()] || 99;
};
</script>

<style scoped>
/* Base Card Styles */
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

/* Severity Card Styles */
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

/* Indicator Styles */
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

/* Count Info Styles */
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

/* ========================= */
/* COMMON & GENERIC STYLES */
/* ========================= */
button {
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

/* Typography */
.text-center {
  text-align: center;
}

.text-white {
  color: white;
}

.text-gray {
  color: #6b7280;
}

.text-primary {
  color: #2B656F;
}


/* ========================= */
/* CARD BASE STYLES */
/* ========================= */
.card {
  background: white;
  border: none;
  border-radius: 1.25rem;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(43, 101, 111, 0.1);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(43, 101, 111, 0.15);
}

.card-header {
  border-bottom: none;
  padding: 1.75rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 0.5px;
}

/* ========================= */
/* BUTTON STYLES */
/* ========================= */
.btn-primary {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  color: white;
  padding: 0.75rem 1.5rem;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1D4851 0%, #0E3238 100%);
}

.btn-light {
  background: #f9fafb;
  color: #333;
}

.btn-light:hover {
  background: #f3f4f6;
}

/* ========================= */
/* SPINNER */
/* ========================= */
.spinner-border {
  width: 3rem;
  height: 3rem;
  color: #2B656F;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* ========================= */
/* MODAL BASE STYLES */
/* ========================= */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-wrapper {
  width: 95%;
  max-width: 800px;
  /* Reduced for single column layout */
  max-height: 90vh;
  margin: 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Modal Header */
.modal-header {
  background: #2B656F;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.severity-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.modal-title {
  color: white;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
}

.close-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* User Cards List */
.user-cards-list {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-card {
  display: flex;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  gap: 1.5rem;
  transition: all 0.2s;
}

.user-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

/* Avatar Section */
.user-avatar-section {
  flex-shrink: 0;
}

.avatar {
  position: relative;
  width: 48px;
  height: 48px;
  background: #2B656F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.status-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-badge i {
  font-size: 8px;
  color: white;
}

/* User Info Section */
.user-info-section {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-primary-info {
  margin-bottom: 0.5rem;
}

.user-name {
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.user-email {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

/* Assessment Info */
.assessment-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.score-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
}

.additional-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-label {
  color: #6b7280;
  font-size: 0.9rem;
}

.info-value {
  color: #1f2937;
  font-size: 0.9rem;
  font-weight: 500;
}

/* View Details Button */
.view-details-btn {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background: #2B656F;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-details-btn:hover {
  background: #1D4851;
}

.view-details-btn i {
  font-size: 0.9rem;
}

/* Severity Classes */
.severity-low {
  background-color: #d1fae5;
  color: #065f46;
}

.severity-moderate {
  background-color: #fef3c7;
  color: #92400e;
}

.severity-high {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Modal Body Scroll */
.modal-body {
  max-height: calc(90vh - 70px);
  overflow-y: auto;
}

@media (max-width: 640px) {
  .user-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .assessment-info {
    flex-direction: column;
    gap: 0.75rem;
  }

  .view-details-btn {
    align-self: center;
  }
}

/* Details Button */
.details-button {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.details-button:hover {
  background: linear-gradient(135deg, #1D4851 0%, #0E3238 100%);
}

.detailed-modal {
  max-width: 1200px !important;
  width: 95vw !important;
  margin: 20px !important;
  border-radius: 16px !important;
  overflow: hidden !important;
}

.detailed-modal-content {
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

.detailed-modal-header {
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.patient-avatar {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.patient-details {
  color: white;
}

.patient-details h3 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1.2;
}

.patient-id {
  font-size: 0.875rem;
  opacity: 0.8;
}

.close-detailed-modal {
  background: rgba(255, 255, 255, 0.1) !important;
  border: none !important;
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  transition: all 0.2s !important;
}

.close-detailed-modal:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

/* Detailed Modal Body */
.detailed-modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex-grow: 1;
}

.content-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

/* Info Section Styles */
.info-section .info-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.info-card h4 {
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-item i {
  width: 36px;
  height: 36px;
  background: #f1f5f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2B656F;
  font-size: 1rem;
}

.item-content {
  flex-grow: 1;
}

.item-content label {
  display: block;
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.item-content span {
  color: #1e293b;
  font-weight: 500;
}

/* Assessment Section Styles */
.assessment-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.assessment-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.assessment-card h4 {
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.assessment-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.assessment-item {
  background: #f8fafc;
  border-radius: 10px;
  padding: 1.25rem;
  transition: transform 0.2s;
}

.assessment-item:hover {
  transform: translateY(-2px);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.item-header i {
  color: #2B656F;
  font-size: 1.25rem;
}

.item-header h5 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.item-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.item-score {
  font-size: 0.875rem;
  color: #64748b;
}

/* Substance Use Grid */
.substance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.substance-item {
  border: 1px solid;
  border-radius: 10px;
  padding: 1rem;
  transition: all 0.2s;
}

.substance-item:hover {
  transform: translateY(-2px);
}

.substance-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.substance-header i {
  color: #2B656F;
}

.substance-header h5 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.substance-risk {
  font-size: 1.125rem;
  font-weight: 700;
}

.risk-high {
  border-color: rgb(239, 68, 68);
  background-color: rgb(254, 226, 226);
}

.risk-moderate {
  border-color: rgb(234, 179, 8);
  background-color: rgb(254, 249, 195);
}

.risk-low {
  border-color: rgb(34, 197, 94);
  background-color: rgb(220, 252, 231);
}

/* Text colors for risk levels */
.text-red-700 {
  color: rgb(185, 28, 28);
}

.text-yellow-700 {
  color: rgb(161, 98, 7);
}

.text-green-700 {
  color: rgb(21, 128, 61);
}

.injection-item {
  background: #fee2e2;
}

/* Severity Classes */
.severity-low {
  background: #dcfce7;
}

.severity-moderate {
  background: #fef3c7;
}

.severity-high {
  background: #fee2e2;
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .assessment-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .detailed-modal-header {
    padding: 1rem;
  }

  .patient-avatar {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }

  .patient-details h3 {
    font-size: 1.5rem;
  }

  .detailed-modal-body {
    padding: 1rem;
  }

  .assessment-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .metrics-container {
    grid-template-columns: 1fr;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: center;
  }

  .info-item i {
    margin: 0 auto;
  }
}
</style>