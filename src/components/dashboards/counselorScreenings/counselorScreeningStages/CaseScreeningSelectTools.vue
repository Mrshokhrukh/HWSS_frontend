<template>
    <div>
        <div class="row p-5 pt-2">
            <div class="col-3 left-selectors">
                <h5 class="hwss-primary mb-5">Screening Tools</h5>
                <div>
                    <ul>
                        <li v-for="(menu, index) in menus" :key="index" @click="selectMenu(index)"
                            :class="{ 'active': index === selectedMenuIndex }">
                            <a href="#">{{ menu.name }}</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="col-9">
                <div class="row mb-5">
                    <div class="d-flex align-items-center justify-content-between w-100">
                        <div>
                            <button class="btn hwss-btn-outline" @click="goBack">Back</button>
                        </div>
                        <div>
                            <button class="btn hwss-btn2 me-3" @click="selectAll">{{ selectAllText }}</button>
                            <button class="btn hwss-btn" @click="proceed">Proceed</button>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4 mb-4" v-for="(tool, index) in selectedMenu.tools" :key="index">
                        <div class="selectable-card card py-5" @click="toggleSelection(index)">
                            <div class="tick-area">
                                <input class="form-check-input" type="checkbox" :checked="selectedTools.includes(index)">
                            </div>
                            <span class="hwss-icon material-symbols-outlined">{{ tool.icon }}</span>
                            <p>{{ tool.name }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
    
<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['proceed', 'goBack']);

const menus = ref([
    {
        name: 'Both Tools', tools: [
            { name: 'PHQ', icon: 'self_improvement' },
            { name: 'GAD', icon: 'sentiment_calm' },
            { name: 'ASSIST', icon: 'vaccines' },
            { name: 'ACE', icon: 'family_restroom' }
        ]
    },
    {
        name: 'Mental Health Tools', tools: [
            { name: 'PHQ', icon: 'self_improvement' },
            { name: 'GAD', icon: 'sentiment_calm' }
        ]
    },
    {
        name: 'SUD Tools', tools: [
            { name: 'ASSIST', icon: 'vaccines' },
            { name: 'ACE', icon: 'family_restroom' }
        ]
    }
]);

const selectedMenuIndex = ref(0);

const selectedMenu = computed(() => menus.value[selectedMenuIndex.value]);

const selectedTools = ref([]);

const selectMenu = (index) => {
    selectedMenuIndex.value = index;
    selectedTools.value = [];
};

const toggleSelection = (toolIndex) => {
    if (selectedTools.value.includes(toolIndex)) {
        selectedTools.value = selectedTools.value.filter(item => item !== toolIndex);
    } else {
        selectedTools.value.push(toolIndex);
    }
};

const goBack = () => {
    // Implement go back logic
    console.log('Go back clicked');
};

const selectAll = () => {
    if (selectedTools.value.length === selectedMenu.value.tools.length) {
        selectedTools.value = [];
    } else {
        selectedTools.value = [...Array(selectedMenu.value.tools.length).keys()];
    }
};

const proceed = () => {
    emit('proceedToScreening');
};

const selectAllText = computed(() => selectedTools.value.length === selectedMenu.value.tools.length ? 'Deselect All' : 'Select All');

</script>
  
<style scoped>
.hwss-icon {
    font-size: 5rem;
    color: #2B656F;
}

.tick-area {
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 10;
    border-radius: 50%;
}

.tick-area input[type="checkbox"] {
    border: 2px solid #2B656F !important;
    border-radius: 50%;
    scale: 1.5;
}

.selectable-card {
    text-align: center;
    border-radius: 8px;
    cursor: pointer;
}

.left-selectors ul {
    padding: 0;
}

.left-selectors ul li {
    list-style: none;
    margin-bottom: 1.5rem;
}

.left-selectors ul li a {
    text-decoration: none;
    color: #5d5d5d;
    font-weight: 500;
    position: relative;
    /* Add relative positioning */
}

.left-selectors ul li.active a {
    border-bottom: 2px solid #2B656F;
    color: #2B656F;
    font-weight: 600;
}

/* Hover effect */
.left-selectors ul li a::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    /* Start with full width */
    height: 2px;
    background-color: #2B656F;
    transition: width 0.3s ease, left 0.3s ease;
    /* Add transition for width and left */
    transform: scaleX(0);
    /* Initially scale the width to 0 */
    transform-origin: center;
    /* Set the transform origin to the center */
}

.left-selectors ul li a:hover::after {
    left: 0;
    /* Start from left edge */
    width: 100%;
    /* Expand width to 100% on hover */
    transform: scaleX(1);
    /* Scale width to 1 */
}
</style>
  