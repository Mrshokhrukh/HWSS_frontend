<template>
    <div class="card mt-3 b-0">
      <h3 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975;"> SUD Risk Level</h3>
      <div class="card-body">
        <div class="row">
          <div class="col">
            <div class="d-flex flex-column">
              <div class="row">
                <div class="col">
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Tobacco' }"
                    @click="setActiveButton('Tobacco')">Tobacco</button>
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Alcohol' }"
                    @click="setActiveButton('Alcohol')">Alcohol</button>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Cannabis' }"
                    @click="setActiveButton('Cannabis')">Cannabis</button>
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Cocaine' }"
                    @click="setActiveButton('Cocaine')">Cocaine</button>
                </div>
              </div>
  
              <div class="row">
                <div class="col">
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Amphetamine-type' }"
                    @click="setActiveButton('Amphetamine-type')">Amphetamine-type</button>
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Inhalant' }"
                    @click="setActiveButton('Inhalant')">Inhalant</button>
                </div>
              </div>
  
              <div class="row">
                <div class="col">
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Sedative' }"
                    @click="setActiveButton('Sedative')">Sedative</button>
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Hallucinate' }"
                    @click="setActiveButton('Hallucinate')">Hallucinate</button>
                </div>
              </div>
  
  
              <div class="row">
                <div class="col">
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Opioids' }"
                    @click="setActiveButton('Opioids')">Opioids</button>
                  <button type="button" class="btn mb-2" :class="{ 'btn-primary': activeButton === 'Others' }"
                    @click="setActiveButton('Others')">Others</button>
                </div>
              </div>
  
            </div>
          </div>
          <div class="col text-center">
            <h4 class="text-capitalize">High Risk Count by gender</h4>
            <div class="w-100">
              <canvas id="donutChartTotal" class="h-100"></canvas>
            </div>
          </div>
          <div class="col text-center">
            <h4 class="text-capitalize">Moderate Risk Count by gender</h4>
            <div class="w-100">
              <canvas id="donutChartModerate" class="h-100"></canvas>
            </div>
          </div>
          <div class="col">
            <canvas id="barChart" width="100" height="50"></canvas>
          </div>
        </div>
      </div>
    </div>
  
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import Chart from 'chart.js/auto';
  
  const activeButton = ref(null);
  
  const substances = [
    'Tobacco',
    'Alcohol',
    'Cannabis',
    'Cocaine',
    'Amphetamine-type',
    'Inhalant',
    'Sedative',
    'Hallucinate',
    'Opioids',
    'Others'
  ];
  const reportData = JSON.parse(sessionStorage.getItem('reportData')) || [];
  const riskCounts = ref(Array(substances.length).fill({ low: 0, moderate: 0, high: 0 }));
  function extractMeasurementData(reportData) {
    const results = [];
  
    reportData.forEach(person => {
      const measurementAssist = person.measurement_assist?.fields; // Safe navigation to avoid null/undefined errors
      const gender = person.user?.fields?.gender || "unknown";
      if (measurementAssist) {
        const data = {
          gender: gender,
          alcoholic: measurementAssist.alcoholic_measurement || "no data",
          amphetamine: measurementAssist.amphetamine_measurement || "no data",
          cannabis: measurementAssist.cannabis_measurement || "no data",
          cocaine: measurementAssist.cocaine_measurement || "no data",
          hallucinogens: measurementAssist.hallucinogens_measurement || "no data",
          inhalants: measurementAssist.inhalants_measurement || "no data",
          opioids: measurementAssist.opioids_measurement || "no data",
          sedatives: measurementAssist.sedatives_measurement || "no data",
          tobacco: measurementAssist.tobacco_measurement || "no data",
          other: measurementAssist.other_measurement || "no data"
        };
  
        results.push(data);
      }
    });
  
    return results;
  }
  const extractedData = extractMeasurementData(reportData);
  console.log("extracted data", extractedData);
  
  // Function to count risk levels for each substance
  function countRiskLevels(data) {
    const counts = {
      tobacco_moderate_male: 0, tobacco_moderate_female: 0,
      tobacco_high_male: 0, tobacco_high_female: 0,
  
      alcoholic_moderate_male: 0, alcoholic_moderate_female: 0,
      alcoholic_high_male: 0, alcoholic_high_female: 0,
  
      cannabis_moderate_male: 0, cannabis_moderate_female: 0,
      cannabis_high_male: 0, cannabis_high_female: 0,
  
      cocaine_moderate_male: 0, cocaine_moderate_female: 0,
      cocaine_high_male: 0, cocaine_high_female: 0,
  
      amphetamine_moderate_male: 0, amphetamine_moderate_female: 0,
      amphetamine_high_male: 0, amphetamine_high_female: 0,
  
      inhalant_moderate_male: 0, inhalant_moderate_female: 0,
      inhalant_high_male: 0, inhalant_high_female: 0,
  
      sedative_moderate_male: 0, sedative_moderate_female: 0,
      sedative_high_male: 0, sedative_high_female: 0,
  
      hallucinate_moderate_male: 0, hallucinate_moderate_female: 0,
      hallucinate_high_male: 0, hallucinate_high_female: 0,
  
      opioids_moderate_male: 0, opioids_moderate_female: 0,
      opioids_high_male: 0, opioids_high_female: 0,
  
      others_moderate_male: 0, others_moderate_female: 0,
      others_high_male: 0, others_high_female: 0,
    };
  
    // Iterate over each object in the array
    data.forEach(personData => {
      // Iterate over each key (substance) in the object
      Object.keys(personData).forEach(substance => {
        const riskLevel = personData[substance]; // Get the risk level for the current substance
        const substanceKey = substance.toLowerCase().replace('-', '_'); // Convert substance name to lower case and replace '-' with '_'
  
        // Determine gender-specific keys based on risk level and substance
        if (riskLevel === 'moderate risk' || riskLevel === 'high risk') {
          const genderKeyModerate = `${substanceKey}_moderate`;
          const genderKeyHigh = `${substanceKey}_high`;
  
          // Increment the appropriate counter based on the risk level and gender
          if (personData.gender === 'Male') {
            if (riskLevel === 'moderate risk') counts[`${genderKeyModerate}_male`]++;
            if (riskLevel === 'high risk') counts[`${genderKeyHigh}_male`]++;
          } else if (personData.gender === 'Female') {
            if (riskLevel === 'moderate risk') counts[`${genderKeyModerate}_female`]++;
            if (riskLevel === 'high risk') counts[`${genderKeyHigh}_female`]++;
          }
        }
      });
    });
  
    return counts;
  }
  const counts = countRiskLevels(extractedData);
  const mapCountsToDummyData = (counts) => {
    return {
      Tobacco: {
        'High-risk total male': counts.tobacco_high_male || 0,
        'High-risk total female': counts.tobacco_high_female || 0,
        'Moderate-risk total male': counts.tobacco_moderate_male || 0,
        'Moderate-risk total female': counts.tobacco_moderate_female || 0,
      },
      Alcohol: {
        'High-risk total male': counts.alcoholic_high_male || 0,
        'High-risk total female': counts.alcoholic_high_female || 0,
        'Moderate-risk total male': counts.alcoholic_moderate_male || 0,
        'Moderate-risk total female': counts.alcoholic_moderate_female || 0,
      },
      Cannabis: {
        'High-risk total male': counts.cannabis_high_male || 0,
        'High-risk total female': counts.cannabis_high_female || 0,
        'Moderate-risk total male': counts.cannabis_moderate_male || 0,
        'Moderate-risk total female': counts.cannabis_moderate_female || 0,
      },
      Cocaine: {
        'High-risk total male': counts.cocaine_high_male || 0,
        'High-risk total female': counts.cocaine_high_female || 0,
        'Moderate-risk total male': counts.cocaine_moderate_male || 0,
        'Moderate-risk total female': counts.cocaine_moderate_female || 0,
      },
      'Amphetamine-type': {
        'High-risk total male': counts.amphetamine_high_male || 0,
        'High-risk total female': counts.amphetamine_high_female || 0,
        'Moderate-risk total male': counts.amphetamine_moderate_male || 0,
        'Moderate-risk total female': counts.amphetamine_moderate_female || 0,
      },
      Inhalant: {
        'High-risk total male': counts.inhalant_high_male || 0,
        'High-risk total female': counts.inhalant_high_female || 0,
        'Moderate-risk total male': counts.inhalant_moderate_male || 0,
        'Moderate-risk total female': counts.inhalant_moderate_female || 0,
      },
      Sedative: {
        'High-risk total male': counts.sedative_high_male || 0,
        'High-risk total female': counts.sedative_high_female || 0,
        'Moderate-risk total male': counts.sedative_moderate_male || 0,
        'Moderate-risk total female': counts.sedative_moderate_female || 0,
      },
      Hallucinate: {
        'High-risk total male': counts.hallucinate_high_male || 0,
        'High-risk total female': counts.hallucinate_high_female || 0,
        'Moderate-risk total male': counts.hallucinate_moderate_male || 0,
        'Moderate-risk total female': counts.hallucinate_moderate_female || 0,
      },
      Opioids: {
        'High-risk total male': counts.opioids_high_male || 0,
        'High-risk total female': counts.opioids_high_female || 0,
        'Moderate-risk total male': counts.opioids_moderate_male || 0,
        'Moderate-risk total female': counts.opioids_moderate_female || 0,
      },
      Others: {
        'High-risk total male': counts.others_high_male || 0,
        'High-risk total female': counts.others_high_female || 0,
        'Moderate-risk total male': counts.others_moderate_male || 0,
        'Moderate-risk total female': counts.others_moderate_female || 0,
      },
    };
  };
  
  const dummyData = mapCountsToDummyData(counts);
  
  
  // Call countRiskLevels with your extracted data and log the result
  
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  
  let donutChartTotalInstance = null;
  let donutChartModerateInstance = null;
  let barChartInstance = null;
  
  const renderDonutChart = (canvasId, data) => {
    if (canvasId === 'donutChartTotal' && donutChartTotalInstance) {
      donutChartTotalInstance.destroy();
    }
    if (canvasId === 'donutChartModerate' && donutChartModerateInstance) {
      donutChartModerateInstance.destroy();
    }
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (ctx) {
      return new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: chartOptions,
      });
    }
  };
  
  const renderBarChart = (data) => {
    if (barChartInstance) {
      barChartInstance.destroy();
    }
    const ctx = document.getElementById('barChart').getContext('2d');
    if (ctx) {
      return new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
          ...chartOptions,
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
            },
          },
        },
      });
    }
  };
  
  const setActiveButton = (buttonName) => {
    activeButton.value = buttonName;
    if (buttonName) {
      updateCharts();
    }
  };
  
  const updateCharts = () => {
    const data = dummyData[activeButton.value];
    if (!data) return; // Return if data is not available for the selected button
  
    const donutDataTotal = {
      labels: ['Male', 'Female'],
      datasets: [{
        data: [data['High-risk total male'], data['High-risk total female']],
        backgroundColor: ['#2c6975', '#00000'],
        hoverBackgroundColor: ['#2c6975', '#00000'],
      }],
    };
    const donutDataModerate = {
      labels: ['Male', 'Female'],
      datasets: [{
        data: [data['Moderate-risk total male'], data['Moderate-risk total female']],
        backgroundColor: ['#2c6975', '#00000'],
        hoverBackgroundColor: ['#2c6975', '#00000'],
      }],
    };
    const barData = {
      labels: ['High Risk', 'Moderate Risk'],
      datasets: [{
        label: 'Male',
        backgroundColor: '#2c6975',
        data: [data['High-risk total male'], data['Moderate-risk total male']],
      }, {
        label: 'Female',
        backgroundColor: '#00000',
        data: [data['High-risk total female'], data['Moderate-risk total female']],
      }],
    };
  
    donutChartTotalInstance = renderDonutChart('donutChartTotal', donutDataTotal);
    donutChartModerateInstance = renderDonutChart('donutChartModerate', donutDataModerate);
    barChartInstance = renderBarChart(barData);
  };
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