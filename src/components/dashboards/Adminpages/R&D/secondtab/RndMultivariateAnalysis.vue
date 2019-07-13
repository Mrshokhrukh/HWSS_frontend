<template>
    <div class="multivariate-analysis">
      <h3 class="mb-4">Multivariate Analysis</h3>
      <div class="chart-container" ref="chartContainer"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import * as d3 from 'd3';
  
  const props = defineProps({
    data: {
      type: Array,
      required: true
    }
  });
  
  const chartContainer = ref(null);
  
  const variables = [
    'phq_score', 'gad_score', 'ace_score', 'age', 'substance_use_risk'
  ];
  
  const processData = (data) => {
    return data.map(item => {
      const result = {};
      variables.forEach(variable => {
        if (variable === 'age') {
          const birthDate = new Date(item.user?.fields?.date_of_birth);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          result[variable] = age;
        } else if (variable === 'substance_use_risk') {
          const assistData = item.measurement_assist?.fields || {};
          const riskLevels = Object.values(assistData).filter(val => typeof val === 'string');
          const riskScore = riskLevels.reduce((sum, level) => {
            switch (level) {
              case 'no risk': return sum + 0;
              case 'low risk': return sum + 1;
              case 'moderate risk': return sum + 2;
              case 'high risk': return sum + 3;
              default: return sum;
            }
          }, 0);
          result[variable] = riskScore;
        } else {
          result[variable] = item.rescreening_data?.[variable] || 
                             item.measurement?.fields?.[variable] || 
                             0;
        }
      });
      return result;
    });
  };
  
  const createChart = (data) => {
    const container = chartContainer.value;
    const margin = {top: 30, right: 50, bottom: 10, left: 50};
    const width = container.offsetWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    d3.select(container).selectAll("*").remove();
  
    const svg = d3.select(container)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const y = {};
    for (let i in variables) {
      const name = variables[i];
      y[name] = d3.scaleLinear()
        .domain(d3.extent(data, d => +d[name]))
        .range([height, 0]);
    }
  
    const x = d3.scalePoint()
      .range([0, width])
      .domain(variables);
  
    const line = d3.line()
      .defined(d => !isNaN(d[1]))
      .x((d, i) => x(variables[i]))
      .y(d => y[d[0]](d[1]));
  
    svg.selectAll("myPath")
      .data(data)
      .join("path")
      .attr("d", d => line(variables.map(p => [p, d[p]])))
      .style("fill", "none")
      .style("stroke", "#69b3a2")
      .style("opacity", 0.5);
  
    svg.selectAll("myAxis")
      .data(variables)
      .join("g")
      .attr("transform", d => `translate(${x(d)})`)
      .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
      .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(d => d)
        .style("fill", "black");
  };
  
  watch(() => props.data, (newData) => {
    const processedData = processData(newData);
    createChart(processedData);
  }, { deep: true });
  
  onMounted(() => {
    const processedData = processData(props.data);
    createChart(processedData);
  });
  </script>
  
  <style scoped>
  .multivariate-analysis {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .chart-container {
    height: 400px;
    width: 100%;
  }
  </style>