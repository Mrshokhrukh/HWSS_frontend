<template>
    <div class="kpi-dashboard p-4">
      <h2 class="h3 mb-4 text-gray-800">Key Performance Indicators</h2>
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        <div v-for="kpi in kpis" :key="kpi.title" class="col">
          <div class="card h-100 shadow-sm hover-shadow">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="icon-wrapper bg-light rounded-circle p-3">
                  <i :class="['fas', kpi.icon, 'fa-lg', 'custom-icon-color']"></i>
                </div>
                <div class="trend-indicator">
                  <i :class="getTrendIconClass(kpi.trend)"></i>
                  <span :class="['ms-1', 'small', getTrendTextClass(kpi.trend)]">{{ kpi.trendValue }}</span>
                </div>
              </div>
              <h5 class="card-title">{{ kpi.title }}</h5>
              <p class="card-text display-6 fw-bold">{{ kpi.value }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    data: {
      type: Array,
      required: true
    }
  });
  
  const calculateAverage = (data, key) => {
    const validScores = data
      .map(item => {
        if (item.rescreening_data && item.rescreening_data[key] !== undefined) {
          return item.rescreening_data[key];
        } else if (item.measurement && item.measurement.fields && item.measurement.fields[key] !== undefined) {
          return item.measurement.fields[key];
        } else if (item[key] !== undefined) {
          return item[key];
        }
        return null;
      })
      .filter(score => score !== null && !isNaN(score));
    return validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
  };
  
  const calculateTrend = (value, total) => {
    const percentage = (value / total) * 100;
    return percentage > 50 ? 'up' : 'down';
  };
  
  const kpis = computed(() => {
    const totalCases = props.data.length;
    const ongoingCases = props.data.filter(item => item.service_and_treatment?.case_status === "On Going").length;
    const closedCases = props.data.filter(item => item.service_and_treatment?.case_status === "Case Closed").length;
    const referredCases = props.data.filter(item => item.service_and_treatment?.referred === "Referred").length;
    const avgPhqScore = calculateAverage(props.data, 'phq_score');
    const avgGadScore = calculateAverage(props.data, 'gad_score');
    const avgAceScore = calculateAverage(props.data, 'ace_score');
    const suicidalCases = props.data.filter(item => {
      const suicidalMeasurement = 
        item.measurement?.fields?.suicidal_measurement || 
        item.rescreening_data?.suicidal_measurement ||
        item.suicidal_measurement;
      return suicidalMeasurement && suicidalMeasurement !== 'not at all';
    }).length;
  
    return [
      {
        title: 'Total Cases',
        value: totalCases,
        trend: 'neutral',
        trendValue: 'N/A',
        icon: 'fa-users'
      },
      {
        title: 'Ongoing Cases',
        value: ongoingCases,
        trend: calculateTrend(ongoingCases, totalCases),
        trendValue: `${((ongoingCases / totalCases) * 100).toFixed(1)}%`,
        icon: 'fa-user-clock'
      },
      {
        title: 'Closed Cases',
        value: closedCases,
        trend: calculateTrend(closedCases, totalCases),
        trendValue: `${((closedCases / totalCases) * 100).toFixed(1)}%`,
        icon: 'fa-check-circle'
      },
      {
        title: 'Referred Cases',
        value: referredCases,
        trend: calculateTrend(referredCases, totalCases),
        trendValue: `${((referredCases / totalCases) * 100).toFixed(1)}%`,
        icon: 'fa-exchange-alt'
      },
      {
        title: 'Avg PHQ-9 Score',
        value: avgPhqScore.toFixed(1),
        trend: avgPhqScore <= 7 ? 'down' : 'up',
        trendValue: `${Math.abs(avgPhqScore - 7).toFixed(1)}`,
        icon: 'fa-chart-line',
      },
      {
        title: 'Avg GAD-7 Score',
        value: avgGadScore.toFixed(1),
        trend: avgGadScore <= 7 ? 'down' : 'up',
        trendValue: `${Math.abs(avgGadScore - 7).toFixed(1)}`,
        icon: 'fa-brain'
      },
      {
        title: 'Avg ACE Score',
        value: avgAceScore.toFixed(1),
        trend: avgAceScore <= 2 ? 'down' : 'up',
        trendValue: `${Math.abs(avgAceScore - 2).toFixed(1)}`,
        icon: 'fa-child'
      },
      {
        title: 'Suicidal Cases',
        value: suicidalCases,
        trend: calculateTrend(suicidalCases, totalCases),
        trendValue: `${((suicidalCases / totalCases) * 100).toFixed(1)}%`,
        icon: 'fa-heartbeat'
      }
    ];
  });
  
  const getTrendIconClass = (trend) => [
    'fas',
    {
      'fa-arrow-up text-success': trend === 'up',
      'fa-arrow-down text-danger': trend === 'down',
      'fa-minus text-secondary': trend === 'neutral'
    }
  ];
  
  const getTrendTextClass = (trend) => ({
    'text-success': trend === 'up',
    'text-danger': trend === 'down',
    'text-secondary': trend === 'neutral'
  });
  </script>
  
  <style scoped>
  .kpi-dashboard {
    background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
  }
  
  .card {
    background-color: #fff;
    transition: box-shadow 0.3s ease-in-out;
    border: solid 3px #2C6975;
  }
  
  .hover-shadow:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
  }
  
  .icon-wrapper {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .custom-icon-color {
    color: #2C6975;
  }
  </style>