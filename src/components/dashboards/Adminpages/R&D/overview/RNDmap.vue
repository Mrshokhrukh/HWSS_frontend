<template>
  <div class="regional-mental-health-map">
    <h3 class="mb-4">Regional Mental Health Distribution</h3>
    <div class="bhutan-map-container">
      <div class="map-controls">
        <button @click="toggleView" class="toggle-btn">
          {{ isRegionView ? 'Switch to Dzongkhag View' : 'Switch to Region View' }}
        </button>
      </div>
      <div class="map-wrapper" v-html="svgContent" ref="mapWrapper"></div>
      <div v-if="selectedArea" class="tooltip" :style="tooltipStyle">
        <h4>{{ selectedArea.name }}</h4>
        <p>{{ isRegionView ? 'Region' : 'Dzongkhag' }}</p>
        <p>Mental Health Score: {{ selectedArea.score }}</p>
        <p>Cases: {{ selectedArea.cases }}</p>
      </div>
      <div class="legend">
        <div v-for="item in legendItems" :key="item.label" class="legend-item">
          <div class="color-box" :style="{ backgroundColor: item.color }"></div>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import bhutanSvg from './bhutan-map.svg';  // Make sure this file exists in your project

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});

const isRegionView = ref(false);
const selectedArea = ref(null);
const tooltipStyle = ref({
  display: 'none',
  position: 'absolute',
  top: '0px',
  left: '0px'
});
const svgContent = ref('');
const mapWrapper = ref(null);
const mentalHealthData = ref({});

const dzongkhags = [
  { id: 'BT-11', title: 'Paro', region: 'Western'},
  { id: 'BT-15', title: 'Thimphu', region: 'Western'},
  { id: 'BT-13', title: 'Haa', region: 'Western'},
  { id: 'BT-23', title: 'Punakha', region: 'Western'},
  { id: 'BT-GA', title: 'Gasa', region: 'Western'},
  { id: 'BT-24', title: 'Wangdue Phodrang', region: 'Western'},
  { id: 'BT-14', title: 'Trongsa', region: 'Central'},
  { id: 'BT-33', title: 'Bumthang', region: 'Central'},
  { id: 'BT-34', title: 'Zhemgang', region: 'Central'},
  { id: 'BT-31', title: 'Sarpang', region: 'Central'},
  { id: 'BT-32', title: 'Mongar', region: 'Eastern'},
  { id: 'BT-45', title: 'Trashigang', region: 'Eastern'},
  { id: 'BT-46', title: 'Trashi Yangtse', region: 'Eastern'},
  { id: 'BT-44', title: 'Lhuentse', region: 'Eastern'},
  { id: 'BT-47', title: 'Pema Gatshel', region: 'Eastern'},
  { id: 'BT-48', title: 'Samdrup Jongkhar', region: 'Eastern'},
  { id: 'BT-12', title: 'Chukha', region: 'Southern'},
  { id: 'BT-17', title: 'Samtse', region: 'Southern'},
  { id: 'BT-22', title: 'Dagana', region: 'Southern'},
  { id: 'BT-21', title: 'Tsirang', region: 'Southern' }
];

const regionColors = {
  'Western': '#FF6B6B',
  'Central': '#2C6975',
  'Eastern': '#45B7D1',
  'Southern': '#FFA07A'
};

const legendItems = Object.entries(regionColors).map(([region, color]) => ({
  color,
  label: region
}));

const getDzongkhagRegion = (dzongkhagId) => {
  const dzongkhag = dzongkhags.find(d => d.id === dzongkhagId);
  return dzongkhag ? dzongkhag.region : 'Unknown';
};

const calculateMentalHealthScore = (items) => {
  const validScores = items
    .map(item => {
      const phq = item.rescreening_data?.phq_score || item.measurement?.fields?.phq_score;
      const gad = item.rescreening_data?.gad_score || item.measurement?.fields?.gad_score;
      return (phq && gad) ? (phq + gad) / 2 : null;
    })
    .filter(score => score !== null);
  return validScores.length > 0 ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length : null;
};

const processMentalHealthData = (data) => {
  if (!Array.isArray(data)) {
    console.warn('Invalid data passed to RNDmap component');
    return {};
  }

  const processedData = {};
  dzongkhags.forEach(dzongkhag => {
    const dzongkhagItems = data.filter(item => 
      item && 
      item.user && 
      item.user.fields && 
      item.user.fields.perm_add_dzongkhag === dzongkhag.title
    );
    processedData[dzongkhag.id] = {
      score: calculateMentalHealthScore(dzongkhagItems),
      cases: dzongkhagItems.length
    };
  });
  return processedData;
};

const getColorByScore = (baseColor, scoreData) => {
  if (!scoreData || typeof scoreData.score !== 'number') return baseColor + '33'; // 20% opacity for no data
  const opacity = Math.min(Math.max((scoreData.score / 20) * 255, 20), 255).toString(16).padStart(2, '0');
  return baseColor + opacity;
};

const getDzongkhagColor = (dzongkhagId) => {
  const region = getDzongkhagRegion(dzongkhagId);
  const baseColor = regionColors[region] || '#CCCCCC';
  return getColorByScore(baseColor, mentalHealthData.value[dzongkhagId]);
};

const showTooltip = (event) => {
  const dzongkhagId = event.target.id;
  const dzongkhag = dzongkhags.find(d => d.id === dzongkhagId);
  const region = getDzongkhagRegion(dzongkhagId);

  let score, cases;
  if (isRegionView.value) {
    const regionDzongkhags = dzongkhags.filter(d => d.region === region);
    const regionData = regionDzongkhags.map(d => mentalHealthData.value[d.id]).filter(d => d);
    score = regionData.length > 0
      ? (regionData.reduce((sum, d) => sum + d.score, 0) / regionData.length).toFixed(2)
      : 'N/A';
    cases = regionData.reduce((sum, d) => sum + d.cases, 0);
  } else {
    const dzongkhagData = mentalHealthData.value[dzongkhagId];
    score = dzongkhagData?.score ? dzongkhagData.score.toFixed(2) : 'N/A';
    cases = dzongkhagData?.cases || 0;
  }

  selectedArea.value = {
    name: isRegionView.value ? region : dzongkhag.title,
    score: score,
    cases: cases
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

const toggleView = () => {
  isRegionView.value = !isRegionView.value;
  updateMapColors();
};

const updateMapColors = () => {
  if (!mapWrapper.value) return;

  const paths = mapWrapper.value.querySelectorAll('path');
  paths.forEach(path => {
    const dzongkhagId = path.id;
    const region = getDzongkhagRegion(dzongkhagId);
    const color = isRegionView.value ? regionColors[region] : getDzongkhagColor(dzongkhagId);
    path.setAttribute('fill', color);
  });
};

watch(() => props.data, (newData) => {
  if (newData) {
    mentalHealthData.value = processMentalHealthData(newData);
    nextTick(updateMapColors);
  }
}, { deep: true, immediate: true });

watch(isRegionView, updateMapColors);

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
.regional-mental-health-map {
  background-color: white;
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

.map-controls {
  margin-bottom: 10px;
}

.toggle-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.toggle-btn:hover {
  background-color: #45a049;
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

.legend {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-right: 20px;
  margin-bottom: 10px;
}

.color-box {
  width: 20px;
  height: 20px;
  margin-right: 5px;
  border: 1px solid #000;
}
</style>