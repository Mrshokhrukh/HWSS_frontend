<template>
  <div class="regional-user-distribution-map">
    <h3 class="mb-4 text-center">User Distribution Across Bhutan</h3>
    <div class="bhutan-map-container">
      <div class="map-wrapper" v-html="svgContent" ref="mapWrapper"></div>
      <div v-if="selectedArea" class="tooltip" :style="tooltipStyle">
        <h4>{{ selectedArea.name }}</h4>
        <p>Users: {{ selectedArea.users }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import bhutanSvg from './bhutan-map.svg';  // Make sure this file exists in your project

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

const selectedArea = ref(null);
const tooltipStyle = ref({
  display: 'none',
  position: 'absolute',
  top: '0px',
  left: '0px'
});
const svgContent = ref('');
const mapWrapper = ref(null);
const userDistribution = ref({});

const processUserData = (filteredData) => {
  const distribution = {};
  filteredData.forEach(item => {
    const dzongkhag = item.user.fields.perm_add_dzongkhag;
    if (dzongkhag) {
      distribution[dzongkhag] = (distribution[dzongkhag] || 0) + 1;
    }
  });
  return distribution;
};

const getColorByUserCount = (count, maxCount) => {
  if (count === 0) return '#666';  // White for no users

  const percentage = count / maxCount;

  if (percentage <= 0.2) return '#E1EDF0';  // Lightest shade
  if (percentage <= 0.4) return '#B3D5DD';
  if (percentage <= 0.6) return '#85BDC9';
  if (percentage <= 0.8) return '#57A5B6';
  return '#2C6975';  // Darkest shade for highest counts
};

const showTooltip = (event) => {
  const dzongkhagName = event.target.getAttribute('title');
  const userCount = userDistribution.value[dzongkhagName] || 0;

  selectedArea.value = {
    name: dzongkhagName,
    users: userCount
  };

  tooltipStyle.value = {
    display: 'block',
    position: 'absolute',
    top: `${event.clientY + 10}px`,
    left: `${event.clientX + 10}px`
  };
};

const hideTooltip = () => {
  selectedArea.value = null;
  tooltipStyle.value.display = 'none';
};

const updateMapColors = () => {
  if (!mapWrapper.value) return;

  const paths = mapWrapper.value.querySelectorAll('path');
  const maxUserCount = Math.max(...Object.values(userDistribution.value));

  paths.forEach(path => {
    const dzongkhagName = path.getAttribute('title');
    const userCount = userDistribution.value[dzongkhagName] || 0;
    const color = getColorByUserCount(userCount, maxUserCount);
    path.setAttribute('fill', color);

    // Remove existing text if any
    const existingText = path.parentNode.querySelector(`text[data-name="${dzongkhagName}"]`);
    if (existingText) {
      existingText.remove();
    }

    // Add text element for user count
    const bbox = path.getBBox();
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute('x', bbox.x + bbox.width / 2);
    text.setAttribute('y', bbox.y + bbox.height / 2);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', '#FFF');
    text.setAttribute('font-size', '10');
    text.setAttribute('data-name', dzongkhagName);
    text.textContent = userCount;
    path.parentNode.appendChild(text);
  });
};

watch(() => props.filteredData, (newData) => {
  if (newData) {
    userDistribution.value = processUserData(newData);
    nextTick(updateMapColors);
  }
}, { deep: true, immediate: true });

onMounted(async () => {
  try {
    // Load the SVG content
    const response = await fetch(bhutanSvg);
    svgContent.value = await response.text();

    // Wait for the next tick to ensure the SVG is rendered
    await nextTick();

    // Add event listeners to the SVG paths
    const paths = mapWrapper.value.querySelectorAll('path');
    paths.forEach(path => {
      path.addEventListener('mouseover', showTooltip);
      path.addEventListener('mouseout', hideTooltip);
    });

    // Initial color update
    updateMapColors();
  } catch (error) {
    console.error('Error loading or processing SVG:', error);
  }
});
</script>

<style scoped>
.regional-user-distribution-map {
  background-color: #FFF;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bhutan-map-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.map-wrapper {
  width: 100%;
  height: auto;
}

.map-wrapper :deep(svg) {
  width: 100%;
  height: auto;
}

.tooltip {
  background-color: white;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.tooltip h4 {
  margin-top: 0;
  margin-bottom: 5px;
}

.tooltip p {
  margin: 3px 0;
}

svg path#BT-11:hover {
  background: #fff !important;
}
</style>