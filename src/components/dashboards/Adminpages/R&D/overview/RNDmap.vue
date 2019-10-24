<template>
  <div class="regional-user-distribution-map">
    <h3 class="mb-4 text-center text-2xl font-bold text-gray-800">User Distribution Across Bhutan</h3>
    <div class="bhutan-map-container">
      <div class="map-wrapper" v-html="svgContent" ref="mapWrapper"></div>
      <div v-if="hoveredArea" class="hover-info" :style="hoverInfoStyle">
        <h4 class="font-bold text-lg">{{ hoveredArea.name }}</h4>
        <p class="text-md">Users: {{ hoveredArea.users }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import bhutanSvg from './bhutan-map.svg';

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

const hoveredArea = ref(null);
const hoverInfoStyle = ref({
  display: 'none',
  position: 'absolute',
  top: '0px',
  left: '0px'
});
const svgContent = ref('');
const mapWrapper = ref(null);
const userDistribution = ref({});

const legendColors = ['#666', '#E1EDF0', '#B3D5DD', '#85BDC9', '#57A5B6', '#2C6975'];
const legendLabels = ['No users', '1-20%', '21-40%', '41-60%', '61-80%', '81-100%'];

const processUserData = (filteredData) => {
  const distribution = {};
  filteredData.forEach(item => {
    // Updated to access perm_add_dzongkhag directly from user object
    if (item.user && item.user.perm_add_dzongkhag) {
      const dzongkhag = item.user.perm_add_dzongkhag;
      distribution[dzongkhag] = (distribution[dzongkhag] || 0) + 1;
    }
  });
  return distribution;
};

const getColorByUserCount = (count, maxCount) => {
  if (count === 0) return '#666';  // Gray for no users

  const percentage = count / maxCount;

  if (percentage <= 0.2) return '#E1EDF0';  // Lightest shade
  if (percentage <= 0.4) return '#B3D5DD';
  if (percentage <= 0.6) return '#85BDC9';
  if (percentage <= 0.8) return '#57A5B6';
  return '#2C6975';  // Darkest shade for highest counts
};

const showHoverInfo = (event) => {
  const dzongkhagName = event.target.getAttribute('title');
  const userCount = userDistribution.value[dzongkhagName] || 0;

  hoveredArea.value = {
    name: dzongkhagName,
    users: userCount
  };

  // Get the position relative to the map container
  const rect = event.target.getBoundingClientRect();
  const mapRect = mapWrapper.value.getBoundingClientRect();

  hoverInfoStyle.value = {
    display: 'block',
    position: 'absolute',
    top: `${rect.top - mapRect.top + rect.height / 2}px`,
    left: `${rect.left - mapRect.left + rect.width / 2}px`,
    transform: 'translate(-50%, -50%)'
  };

  // Highlight the hovered path
  event.target.setAttribute('stroke-width', '2');
  event.target.setAttribute('stroke', '#FFD700');
};

const hideHoverInfo = (event) => {
  hoveredArea.value = null;
  hoverInfoStyle.value.display = 'none';

  // Remove highlight
  event.target.setAttribute('stroke-width', '0.5');
  event.target.setAttribute('stroke', '#000');
};

const updateMapColors = () => {
  if (!mapWrapper.value) return;

  const paths = mapWrapper.value.querySelectorAll('path');
  const maxUserCount = Math.max(...Object.values(userDistribution.value), 1); // Ensure non-zero denominator

  paths.forEach(path => {
    const dzongkhagName = path.getAttribute('title');
    const userCount = userDistribution.value[dzongkhagName] || 0;
    const color = getColorByUserCount(userCount, maxUserCount);

    // Apply color with transition
    path.setAttribute('fill', color);
    path.style.transition = 'fill 0.3s ease-in-out';

    // Remove existing text if any
    const existingText = path.parentNode.querySelector(`text[data-name="${dzongkhagName}"]`);
    if (existingText) {
      existingText.remove();
    }
  });
};

// Watch for changes in filtered data
watch(() => props.filteredData, (newData) => {
  if (newData) {
    userDistribution.value = processUserData(newData);
    nextTick(updateMapColors);
  }
}, { deep: true, immediate: true });

onMounted(async () => {
  try {
    // Load and set the SVG content
    const response = await fetch(bhutanSvg);
    svgContent.value = await response.text();

    // Wait for the SVG to be rendered
    await nextTick();

    // Add event listeners to all paths
    const paths = mapWrapper.value.querySelectorAll('path');
    paths.forEach(path => {
      path.addEventListener('mouseover', showHoverInfo);
      path.addEventListener('mouseout', hideHoverInfo);

      // Add hover animation
      path.style.transition = 'all 0.3s ease-in-out';
      path.addEventListener('mouseover', () => {
        path.style.transform = 'scale(1.02)';
      });
      path.addEventListener('mouseout', () => {
        path.style.transform = 'scale(1)';
      });
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
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.1));
}

.hover-info {
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid #E2E8F0;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: all 0.3s ease-in-out;
  pointer-events: none;
}

.hover-info h4 {
  margin: 0;
  color: #2D3748;
}

.hover-info p {
  margin: 4px 0 0;
  color: #4A5568;
}
</style>