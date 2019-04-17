<template>
    <div>
        <div class="row p-4 bg-light">
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
                            <button class="btn hwss-btn2 me-3" @click="selectAll"
                                :disabled="selectedMenu.value === 0">{{
                            selectAllText }}</button>
                            <button class="btn hwss-btn" @click="proceed"
                                :disabled="selectedTools.length === 0">Proceed</button>
                        </div>
                    </div>
                </div>
                <div class="row">
                    
                <div class="col-md-4 mb-4" v-for="(tool, index) in selectedMenu.tools" :key="index">
                    <div class="selectable-card card py-5"
                        :class="{ 'disabled': !isSchoolCounselor && tool.name === 'SCHOOL ENV' }"
                        @click="toggleSelection(tool)">
                        <div class="tick-area">
                            <input class="form-check-input" type="checkbox" :checked="isSelected(tool)"
                                :disabled="!isSchoolCounselor && tool.name === 'SCHOOL ENV'">
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
import { ref, computed, onMounted } from 'vue';

const emit = defineEmits(['proceedToEventScreening', 'goBack']);

// Retrieve userOriginalRole from local storage
const userDetailsStore = JSON.parse(localStorage.getItem('userDetailsStore'));
const userOriginalRole = userDetailsStore.user.role;

// Check if the user is a school counselor
const isSchoolCounselor = ref(userOriginalRole === 'school_counselor');

// Define a separate array of tool objects
const allTools = [
    { id: 1, name: 'PHQ9', icon: 'self_improvement' },
    { id: 2, name: 'GAD7', icon: 'sentiment_calm' },
    { id: 3, name: 'ASSIST', icon: 'vaccines' },
    { id: 4, name: 'ACE', icon: 'family_restroom' },
    { id: 5, name: 'SCHOOL ENV', icon: 'school' }
];

const menus = ref([
    {
        name: 'All Tools', tools: allTools
    },
    {
        name: 'Mental Health Tools', tools: allTools.filter(tool => tool.name !== 'ASSIST')
    },
    {
        name: 'SUD Tools', tools: allTools.filter(tool => tool.name === 'ASSIST')
    },
    {
        name: 'School Environment Tools', tools: allTools.filter(tool => tool.name === 'SCHOOL ENV')
    },
]);

const selectedMenuIndex = ref(0);

const selectedMenu = computed(() => menus.value[selectedMenuIndex.value]);

const selectedToolsKey = 'selectedTools';

// Initialize selected tools array from localStorage or empty if not found
let selectedToolsFromLocalStorage = localStorage.getItem(selectedToolsKey);
selectedToolsFromLocalStorage = selectedToolsFromLocalStorage ? JSON.parse(selectedToolsFromLocalStorage) : [];

const selectedTools = ref(selectedToolsFromLocalStorage);

const selectMenu = (index) => {
    selectedMenuIndex.value = index;
};

const toggleSelection = (tool) => {
    const existingToolIndex = selectedTools.value.findIndex(t => t.id === tool.id);
    if (existingToolIndex !== -1) {
        // Remove the tool if it's already selected
        selectedTools.value.splice(existingToolIndex, 1);
    } else {
        // Add the tool if it's not selected
        selectedTools.value.push({ id: tool.id, name: tool.name });
    }
    
    // Reorder the selected tools array based on the order in allTools array
    selectedTools.value.sort((a, b) => {
        return allTools.findIndex(tool => tool.id === a.id) - allTools.findIndex(tool => tool.id === b.id);
    });

    // Save selected tools to local storage whenever they change
    saveSelectedTools();
};

const goBack = () => {
    // Implement go back logic
    console.log('Go back clicked');
    emit('goBackToRegister');
};

const selectAll = () => {
    if (selectedTools.value.length === selectedMenu.value.tools.length) {
        selectedTools.value = [];
    } else {
        selectedTools.value = selectedMenu.value.tools.map(tool => ({ id: tool.id, name: tool.name }));
    }
    // Save selected tools to local storage whenever they change
    saveSelectedTools();
};

const proceed = () => {
    emit('proceedToEventScreening');
};

const selectAllText = computed(() => selectedTools.value.length === selectedMenu.value.tools.length ? 'Deselect All' : 'Select All');

const isSelected = (tool) => {
    return selectedTools.value.some(selectedTool => selectedTool.id === tool.id);
};

const saveSelectedTools = () => {
    localStorage.setItem(selectedToolsKey, JSON.stringify(selectedTools.value));
};

onMounted(() => {
    selectMenu(selectedMenuIndex.value);
});

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

.disabled{
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.5;
}

.disabled span{
    color: #353535
}
</style>