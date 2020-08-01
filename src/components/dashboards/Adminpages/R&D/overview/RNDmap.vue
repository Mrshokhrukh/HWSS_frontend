<template>
  <div class="regional-user-distribution-map">
    <h3 class="mb-4 text-center text-2xl font-bold text-gray-800">User Distribution Across Bhutan</h3>
    <div class="bhutan-map-container">
      <div class="map-wrapper relative" v-html="svgContent" ref="mapWrapper"></div>
      <Transition name="fade">
        <div v-if="hoveredArea" class="tooltip" :style="tooltipStyle">
          <div class="tooltip-content">
            <h4 class="font-bold text-lg text-emerald-900">{{ hoveredArea.name }}</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Total Users</span>
                <span class="stat-value">{{ hoveredArea.users.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
      <div class="legend">
        <div class="legend-title">User Distribution</div>
        <div v-for="(range, index) in userRanges" :key="index" class="legend-item">
          <div class="legend-color" :style="{ backgroundColor: legendColors[index] }"></div>
          <span class="legend-label">{{ range }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import bhutanSvg from './bhutan-map.svg';

const props = defineProps({
  filteredData: {
    type: Array,
    required: true
  }
});

const hoveredArea = ref(null);
const tooltipStyle = ref({
  display: 'none',
  position: 'absolute',
  top: '0px',
  left: '0px'
});
const svgContent = ref('');
const mapWrapper = ref(null);
const userDistribution = ref({});

const legendColors = [
  '#C1E6EA',  // Lightest
  '#8ACAD5',  // Light
  '#4FAEBF',  // Medium
  '#347A85',  // Medium dark
  '#255965',  // Darker
  '#123C4B'   // Darkest
];

const userRanges = [
  '0 users',
  '1-9 users',
  '10-49 users',
  '50-99 users',
  '100-299 users',
  '300+ users'
];

const totalUsers = computed(() => {
  return Object.values(userDistribution.value).reduce((sum, count) => sum + count, 0);
});

const processUserData = (filteredData) => {
  const distribution = {};
  filteredData.forEach(item => {
    let dzongkhag = null;

    // Check direct screening_data for ps_add_dzongkhag
    if (item.screening_data?.ps_add_dzongkhag) {
      dzongkhag = item.screening_data.ps_add_dzongkhag;
    }
    // Check user object for ps_add_dzongkhag
    else if (item.user?.ps_add_dzongkhag) {
      dzongkhag = item.user.ps_add_dzongkhag;
    }
    // Check if screening_data id exists and has ps_add_dzongkhag
    else if (typeof item.screening_data === 'object' && 'id' in item.screening_data) {
      dzongkhag = item.screening_data.ps_add_dzongkhag;
    }

    // Only count if we found a valid dzongkhag
    if (dzongkhag) {
      // Clean up dzongkhag name by removing "Thromde" if present
      dzongkhag = dzongkhag.replace(' Thromde', '');
      // Convert to title case for consistency
      dzongkhag = dzongkhag.charAt(0).toUpperCase() + dzongkhag.slice(1).toLowerCase();
      distribution[dzongkhag] = (distribution[dzongkhag] || 0) + 1;
    }
  });

  return distribution;
};

const getColorByUserCount = (count) => {
  if (count === 0) return legendColors[0];
  if (count < 10) return legendColors[1];
  if (count < 50) return legendColors[2];
  if (count < 100) return legendColors[3];
  if (count < 300) return legendColors[4];
  return legendColors[5];
};

// Define showHoverInfo function
const showHoverInfo = (event) => {
  const dzongkhagName = event.target.getAttribute('title');
  const userCount = userDistribution.value[dzongkhagName] || 0;

  hoveredArea.value = {
    name: dzongkhagName,
    users: userCount
  };

  const rect = event.target.getBoundingClientRect();
  const mapRect = mapWrapper.value.getBoundingClientRect();

  tooltipStyle.value = {
    display: 'block',
    position: 'absolute',
    top: `${rect.top - mapRect.top - 10}px`,
    left: `${rect.left - mapRect.left + (rect.width / 2)}px`,
    transform: 'translate(-50%, -100%)'
  };

  // Apply hover effects
  event.target.style.transform = 'scale(1.02) translateZ(10px)';
  event.target.style.zIndex = '100';
  event.target.style.filter = 'drop-shadow(0 8px 12px rgba(43, 101, 111, 0.3))';
};

// Define hideHoverInfo function
const hideHoverInfo = (event) => {
  hoveredArea.value = null;
  tooltipStyle.value.display = 'none';

  // Remove hover effects
  event.target.style.transform = 'scale(1) translateZ(0)';
  event.target.style.zIndex = '1';
  event.target.style.filter = 'none';
};

const updateMapColors = () => {
  if (!mapWrapper.value) return;

  const paths = mapWrapper.value.querySelectorAll('path');
  paths.forEach(path => {
    const dzongkhagName = path.getAttribute('title');
    const userCount = userDistribution.value[dzongkhagName] || 0;
    const color = getColorByUserCount(userCount);

    path.setAttribute('fill', color);
    path.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    path.style.transformOrigin = 'center center';
  });
};

// Watch for changes in filteredData
watch(() => props.filteredData, (newData) => {
  if (newData) {
    userDistribution.value = processUserData(newData);
    nextTick(updateMapColors);
  }
}, { deep: true, immediate: true });

onMounted(async () => {
  try {
    // Load SVG content
    const response = await fetch(bhutanSvg);
    svgContent.value = await response.text();

    await nextTick();

    // Add event listeners to paths
    const paths = mapWrapper.value.querySelectorAll('path');
    paths.forEach(path => {
      path.addEventListener('mouseenter', showHoverInfo);
      path.addEventListener('mouseleave', hideHoverInfo);

      // Set initial styles
      path.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      path.style.transformOrigin = 'center center';
      path.style.position = 'relative';
      path.style.zIndex = '1';
    });

    updateMapColors();
  } catch (error) {
    console.error('Error loading or processing SVG:', error);
  }
});
</script>

<style scoped>
.regional-user-distribution-map {
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.bhutan-map-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  perspective: 1000px;
}

.map-wrapper {
  width: 100%;
  height: auto;
  transform-style: preserve-3d;
}

.map-wrapper :deep(svg) {
  width: 100%;
  height: auto;
}

.map-wrapper :deep(path) {
  cursor: pointer;
  stroke: #FFFFFF;
  stroke-width: 0.5;
}

.tooltip {
  display: block;
  position: absolute;
  z-index: 1000;
  pointer-events: none;
  opacity: 1;
  /* Ensure opacity is not set to 0 */
}


.tooltip-content {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(41, 98, 110, 0.5) 100%);
  border: 1px solid rgba(43, 101, 111, 0.2);
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(43, 101, 111, 0.15);
  backdrop-filter: blur(8px);
  min-width: 240px;
}

.stats-grid {
  display: grid;
  gap: 12px;
  margin-top: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
}

.stat-label {
  font-size: 0.875rem;
  color: #2B656F;
}

.stat-value {
  font-weight: 600;
  color: #1D4851;
}

.legend {
  position: absolute;
  top: 20px;
  right: 5px;
  background: linear-gradient(135deg, rgba(43, 101, 111, 0.03) 0%, rgba(29, 72, 81, 0.05) 100%);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(43, 101, 111, 0.2);
  box-shadow: 0 4px 12px rgba(43, 101, 111, 0.2);
  backdrop-filter: blur(8px);
}


.legend-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #2B656F;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 6px 0;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 8px;
}

.legend-label {
  font-size: 0.875rem;
  color: #1D4851;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>