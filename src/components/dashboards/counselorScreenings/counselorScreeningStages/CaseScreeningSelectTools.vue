<template>
    <div class="tool-selector-container">
        <div class="tool-selector-layout">
            <!-- Left Sidebar -->
            <div class="sidebar">
                <h4 class="sidebar-title">Screening Tools</h4>
                <nav class="tool-navigation">
                    <ul>
                        <li v-for="(menu, index) in menus" :key="index" @click="selectMenu(index)"
                            :class="{ 'active': index === selectedMenuIndex }">
                            <a href="#" class="nav-link">
                                {{ menu.name }}
                                <div class="nav-indicator"></div>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>

            <!-- Main Content -->
            <div class="main-content">
                <!-- Action Bar -->
                <div class="action-bar">
                    <button class="btn-back" @click="goBack">
                        <span class="material-symbols-outlined">arrow_back</span>
                        Back
                    </button>
                    <div class="action-buttons">
                        <button class="btn-secondary" @click="selectAll" :disabled="selectedMenu.value === 0">
                            {{ selectAllText }}
                        </button>
                        <button class="btn-primary" @click="proceed" :disabled="selectedTools.length === 0">
                            Proceed
                        </button>
                    </div>
                </div>

                <!-- Tools Grid -->
                <div class="tools-grid">
                    <div v-for="(tool, index) in selectedMenu.tools" :key="index" class="tool-card"
                        :class="{ 'disabled': !isSchoolCounselor && tool.name === 'SCHOOL ENV' }"
                        @click="toggleSelection(tool)">
                        <div class="checkbox-wrapper">
                            <input type="checkbox" :checked="isSelected(tool)"
                                :disabled="!isSchoolCounselor && tool.name === 'SCHOOL ENV'">
                            <div class="checkbox-indicator"></div>
                        </div>
                        <span class="tool-icon material-symbols-outlined">{{ tool.icon }}</span>
                        <p class="tool-name">{{ tool.name }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const emit = defineEmits(['proceedToScreening', 'goBack']);

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
        name: 'All Tools', tools: allTools // Show all tools
    },
    {
        name: 'Mental Health Tools', tools: allTools.filter(tool => ['GAD7', 'PHQ9', 'ACE'].includes(tool.name)) // Show only GAD7, PHQ9, ACE
    },
    {
        name: 'SUD Tools', tools: allTools.filter(tool => tool.name === 'ASSIST') // Show only ASSIST
    },
    {
        name: 'School Environment Tools', tools: allTools.filter(tool => tool.name === 'SCHOOL ENV') // Show only SCHOOL ENV
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
    // console.log('Go back clicked');
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
    emit('proceedToScreening');
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
.tool-selector-container {
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(43, 101, 111, 0.08);
}

.tool-selector-layout {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 2rem;
    min-height: 600px;
}

/* Sidebar Styles */
.sidebar {
    padding: 1rem;
}

.sidebar-title {
    color: #2B656F;
    font-weight: 600;
    margin-bottom: 2rem;
    padding-left: 1rem;
}

.tool-navigation ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.nav-link {
    display: block;
    padding: 0.75rem 1rem;
    color: #1D4851;
    text-decoration: none;
    border-radius: 8px;
    position: relative;
    transition: all 0.3s ease;
}

.nav-link:hover {
    background: rgba(43, 101, 111, 0.05);
}

.active .nav-link {
    color: #2B656F;
    font-weight: 600;
    background: rgba(43, 101, 111, 0.08);
}

.nav-indicator {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 2px;
    width: 0;
    background: #2B656F;
    transition: all 0.3s ease;
}

.active .nav-indicator {
    width: 100%;
}

/* Main Content Styles */
.main-content {
    background: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
    padding: 1.5rem;
}

.action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

/* Button Styles */
.btn-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid rgba(43, 101, 111, 0.2);
    border-radius: 25px;
    background: white;
    color: #2B656F;
    transition: all 0.3s ease;
}

.btn-back:hover {
    background: rgba(43, 101, 111, 0.05);
}

.action-buttons {
    display: flex;
    gap: 1rem;
}

.btn-primary, .btn-secondary {
    padding: 0.5rem 1.5rem;
    border-radius: 25px;
    border: none;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    color: white;
}

.btn-secondary {
    background: white;
    border: 1px solid rgba(43, 101, 111, 0.2);
    color: #2B656F;
}

.btn-primary:hover:not(:disabled), 
.btn-secondary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(43, 101, 111, 0.15);
}

/* Tools Grid */
.tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
}

.tool-card {
    position: relative;
    background: white;
    border-radius: 12px;
    padding: 2rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(43, 101, 111, 0.1);
}

.tool-card:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(43, 101, 111, 0.1);
}

.checkbox-wrapper {
    position: absolute;
    top: 1rem;
    left: 1rem;
}

.checkbox-wrapper input[type="checkbox"] {
    width: 20px;
    height: 20px;
    border: 2px solid #2B656F;
    border-radius: 50%;
    appearance: none;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
}

.checkbox-wrapper input[type="checkbox"]:checked {
    background-color: #2B656F;
}

.checkbox-wrapper input[type="checkbox"]:checked::after {
    content: "✓";
    position: absolute;
    color: white;
    font-size: 12px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.tool-icon {
    font-size: 3.5rem;
    color: #2B656F;
    margin-bottom: 1rem;
    display: block;
}

.tool-name {
    color: #1D4851;
    font-weight: 500;
    margin: 0;
}

.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

@media (max-width: 768px) {
    .tool-selector-layout {
        grid-template-columns: 1fr;
    }

    .sidebar {
        padding: 0;
    }

    .tool-navigation {
        display: flex;
        overflow-x: auto;
        padding-bottom: 1rem;
    }

    .tool-navigation ul {
        display: flex;
        gap: 1rem;
    }

    .action-bar {
        flex-direction: column;
        gap: 1rem;
    }

    .action-buttons {
        width: 100%;
        justify-content: space-between;
    }
}
</style>