<template>
    <div class="card mt-5 b-0">
      <h3 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975">Mental Health Risk Level</h3>
      <div class="card-body">
        <div class="row">
          <div class="col">
            <div class="d-flex flex-column">
              <div class="row">
                <div class="col">
                  <button type="button" class="btn mb-2"
                          :class="{ 'btn-primary': activeButton === 'Depression' }"
                          @click="setActiveButton('Depression')">
                    Depression
                  </button>
                  <button type="button" class="btn mb-2"
                          :class="{ 'btn-primary': activeButton === 'Anxiety' }"
                          @click="setActiveButton('Anxiety')">
                    Anxiety
                  </button>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <button type="button" class="btn mb-2"
                          :class="{ 'btn-primary': activeButton === 'ACE' }"
                          @click="setActiveButton('ACE')">
                    ACE
                  </button>
                  <button type="button" class="btn mb-2"
                          :class="{ 'btn-primary': activeButton === 'Suicidal Behaviours' }"
                          @click="setActiveButton('Suicidal Behaviours')">
                    Suicidal Behaviours
                  </button>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <button type="button" class="btn mb-2"
                          :class="{ 'btn-primary': activeButton === 'Table' }"
                          @click="setActiveButton('Table')">
                    Table
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="col">
            <div v-if="activeButton === 'Table'">
              <MHDAASeverityTable />
            </div>
            <canvas v-else id="barCharts" width="100" height="50"></canvas>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import Chart from 'chart.js/auto'
  import MHDAASeverityTable from './MHDAASeverityTable.vue'
  
  const activeButton = ref(null)
  const chart = ref(null)
  
  const reportData = JSON.parse(sessionStorage.getItem('reportData')) || []
  
  // Debugging: log the reportData
  console.log('Report Data:', reportData)
  
  // Filter functions
  const filterData = (type, level) => reportData.filter(item => item.measurement?.fields[`${type}_measurement`] === level).length
  
  // Data counts
  const gadCounts = {
      severe: filterData('gad', 'severe'),
      minimal: filterData('gad', 'minimal'),
      moderate: filterData('gad', 'moderate'),
      mild: filterData('gad', 'mild'),
  }
  
  const phqCounts = {
      severe: filterData('phq', 'severe'),
      minimal: filterData('phq', 'minimal'),
      moderate: filterData('phq', 'moderate'),
      moderately_severe: filterData('phq', 'moderately severe'),
      mild: filterData('phq', 'mild'),
  }
  
  const aceCounts = {
      high_risk: filterData('ace', 'high risk'),
      intermediate_risk: filterData('ace', 'intermediate risk'),
      low_risk: filterData('ace', 'low risk'),
  }
  
  const suicidalCounts = {
      nearlyeveryday: filterData('suicidal', 'nearly everyday'),
      more_than_half_the_days: filterData('suicidal', 'more than half the days'),
      several_days: filterData('suicidal', 'several days'),
  }
  
  // Set active button and update chart
  const setActiveButton = (buttonName) => {
      activeButton.value = buttonName
      if (buttonName !== 'Table') {
          updateChart(buttonName)
      }
  }
  
  const updateChart = (buttonName) => {
      const labels = []
      const data = []
  
      if (buttonName === 'Depression') {
          labels.push('Severe', 'Minimal', 'Moderate', 'Moderately Severe', 'Mild')
          data.push(phqCounts.severe, phqCounts.minimal, phqCounts.moderate, phqCounts.moderately_severe, phqCounts.mild)
      } else if (buttonName === 'Anxiety') {
          labels.push('Severe', 'Minimal', 'Moderate', 'Mild')
          data.push(gadCounts.severe, gadCounts.minimal, gadCounts.moderate, gadCounts.mild)
      } else if (buttonName === 'ACE') {
          labels.push('High Risk', 'Intermediate Risk', 'Low Risk')
          data.push(aceCounts.high_risk, aceCounts.intermediate_risk, aceCounts.low_risk)
      } else if (buttonName === 'Suicidal Behaviours') {
          labels.push('Nearly Everyday', 'More Than Half The Days', 'Several Days')
          data.push(suicidalCounts.nearlyeveryday, suicidalCounts.more_than_half_the_days, suicidalCounts.several_days)
      }
  
      if (chart.value) {
          chart.value.destroy()
      }
  
      chart.value = new Chart(document.getElementById('barCharts'), {
          type: 'bar',
          data: {
              labels: labels,
              datasets: [{
                  label: `${buttonName} Counts`,
                  data: data,
                  backgroundColor: '#2c6975',
                  borderColor: '#2c6975',
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      })
  }
  
  onMounted(() => {
      if (activeButton.value && activeButton.value !== 'Table') {
          updateChart(activeButton.value)
      }
  })
  </script>
  
  <style scoped>
  .custom-card {
      background-color: #d3e2e4;
  }
  
  .btn {
      height: 50px;
      width: 150px;
  }
  
  .btn-primary {
      background-color: #2c6975 !important;
  }
  </style>
  