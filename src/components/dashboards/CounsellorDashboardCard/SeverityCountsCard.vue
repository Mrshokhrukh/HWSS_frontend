<template>
  <div class="severity-dashboard">
    <div class="row">
      <h4 class="col-12 mb-3 text-start dashboard-title">Severity</h4>
      <div v-for="(item, index) in SEVERITY_ITEMS" :key="index" class="col-md-2 mx-auto mb-4">
        <div @click="setActiveIndex(index)" :class="['severity-card', { 'active-card': isActive(index) }]">
          <div class="card-body d-flex flex-column align-items-center justify-content-center">
            <div class="count-circle">{{ item.count }}</div>
            <h6 class="mt-3 text-uppercase">{{ item.title }}</h6>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4" v-if="activeItem.title !== 'Assist'">
      <div class="col-md-4">
        <div class="card-container">
          <SeverityIndicatorCard 
            v-if="activeItem" 
            :cardTitle="activeItem.title"
            :filteredData="getRelevantData"
            :isLoading="isLoading"
          />
        </div>
      </div>
      <div class="col-md-8">
        <div class="card-container">
          <SeverityGraphCard 
            v-if="activeItem" 
            :cardTitle="activeItem.title"
            :filteredData="getRelevantData"
            :isLoading="isLoading"
          />
        </div>
      </div>
    </div>

    <div class="row mt-4" v-else>
      <div class="col-12">
        <div class="card-container">
          <AssistSeverityAndGraph 
            :filteredData="getAssistData"
            :isLoading="isLoading"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue';
import axios from 'axios';
import endpoints from '@/api';

import SeverityGraphCard from './SeverityGraphCard.vue';
import AssistSeverityAndGraph from './AssistSeverityAndGraph.vue';
import SeverityIndicatorCard from './SeverityIndicatorCard.vue';

// Constants for severity items with proper field mappings
const SEVERITY_ITEMS = ref([
  { 
    count: '0', 
    title: 'Suicidal Behavior', 
    field: 'phq_data',
    dataField: 'phq_data',
    threshold: value => {
      try {
        const phqData = JSON.parse(value);
        const suicidalThoughts = phqData.responses[6];
        return suicidalThoughts && suicidalThoughts.score >= 2;
      } catch (e) {
        return false;
      }
    }
  },
  { 
    count: '0', 
    title: 'Depression', 
    field: 'phq_score',
    dataField: 'phq_data', 
    threshold: value => value >= 10 
  },
  { 
    count: '0', 
    title: 'Anxiety', 
    field: 'gad_score',
    dataField: 'gad_data', 
    threshold: value => value >= 10 
  },
  { 
    count: '0', 
    title: 'ACE', 
    field: 'ace_score',
    dataField: 'ace_data', 
    threshold: value => value >= 4 
  },
  { 
    count: '0', 
    title: 'Assist', 
    field: 'assist_data',
    dataField: 'assist_data', 
    threshold: value => value.some(item => item.risk_flag && item.risk_flag !== 'none')
  }
]);

const activeIndex = ref(0);
const activeItem = computed(() => SEVERITY_ITEMS.value[activeIndex.value]);
const filteredData = ref([]);
const isLoading = ref(true);
const error = ref(null);

// Computed property to get relevant data based on active item
const getRelevantData = computed(() => {
  if (!activeItem.value || !filteredData.value.length) return [];

  return filteredData.value.map(item => {
    const screeningData = item.screening_data || {};
    return {
      ...item,
      screeningData: screeningData,
    };
  });
});


// Computed property specifically for ASSIST data
const getAssistData = computed(() => {
  if (!filteredData.value.length) return [];

  return filteredData.value.map(item => {
    const screeningData = item.screening_data || {};
    return {
      ...item, // Pass the entire item as-is
      assistData: screeningData.assist_data || [],
    };
  });
});


function isActive(index) {
  return index === activeIndex.value;
}

function setActiveIndex(index) {
  activeIndex.value = index;
}

const getUserDetailsFromStorage = () => {
  const userDetailsString = localStorage.getItem('userDetailsStore');
  if (!userDetailsString) {
    console.error('No userDetailsStore found in localStorage');
    return { agencyName: 'Unknown Agency' };
  }

  try {
    const userDetails = JSON.parse(userDetailsString);
    return {
      agencyName: userDetails?.agency?.agencyName || 'Unknown Agency'
    };
  } catch (error) {
    console.error('Error parsing user details:', error);
    return { agencyName: 'Unknown Agency' };
  }
};

const fetchAndFilterData = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await axios.get(endpoints.newServiceAndTreatment);
    const dataArray = response.data || [];
    const { agencyName } = getUserDetailsFromStorage();
    const currentYear = new Date().getFullYear();

    filteredData.value = dataArray.filter(item => {
      const agencyMatch = item.user?.active_agency?.agency_name === agencyName;
      const screeningDate = item.screening_data?.submission_date;
      const submissionYear = screeningDate ? new Date(screeningDate).getFullYear() : null;
      return agencyMatch && submissionYear === currentYear;
    });

    updateSeverityCounts();
    isLoading.value = false;
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = 'Failed to load data';
    isLoading.value = false;
  }
};

const updateSeverityCounts = () => {
  SEVERITY_ITEMS.value.forEach((item, index) => {
    let count = 0;
    
    filteredData.value.forEach(entry => {
      const screeningData = entry.screening_data;
      if (!screeningData) return;

      const value = screeningData[item.field];
      if (value !== undefined && value !== null) {
        if (item.threshold(value)) {
          count++;
        }
      }
    });

    SEVERITY_ITEMS.value[index] = { ...item, count: count.toString() };
  });
};

onMounted(async () => {
  await fetchAndFilterData();
});

watchEffect(() => {
  if (filteredData.value.length > 0) {
    updateSeverityCounts();
  }
});
</script>

<style scoped>
.severity-dashboard {
  padding: 2rem;
  background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(43, 101, 111, 0.1);
}

.dashboard-title {
  color: #2B656F;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.severity-card {
  background: linear-gradient(135deg, #ffffff, #f0f7f8);
  border: 2px solid transparent;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  box-shadow: 0 4px 6px rgba(43, 101, 111, 0.1);
}

.severity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(43, 101, 111, 0.15);
}

.active-card {
  border-color: #2B656F;
  background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.active-card .card-body h6,
.active-card .count-circle {
  color: #ffffff;
}

.card-body {
  padding: 1.25rem;
}

.count-circle {
  background-color: rgba(43, 101, 111, 0.1);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2B656F;
  margin-bottom: 0.5rem;
}

.card-body h6 {
  color: #2B656F;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.card-container {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(43, 101, 111, 0.1);
  height: 100%;
  transition: all 0.3s ease;
}

.card-container:hover {
  box-shadow: 0 6px 12px rgba(43, 101, 111, 0.15);
}

@media (max-width: 768px) {
  .severity-dashboard {
    padding: 1rem;
  }

  .count-circle {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }

  .card-body h6 {
    font-size: 0.7rem;
  }
}
</style>