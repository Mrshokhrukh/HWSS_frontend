<template>
    <div class="screening-container">
        <div class="screening-layout">
            <!-- Left Sidebar -->
            <div class="sidebar">
                <div class="sidebar-card">
                    <h4 class="sidebar-title">Selected Assessment:</h4>
                    <nav class="assessment-navigation">
                        <ul>
                            <li v-for="menu in menus" :key="menu.id" @click="selectMenu(menu)"
                                :class="{ 'active': selectedMenu && selectedMenu.id === menu.id }">
                                <a href="#" class="nav-link">
                                    <div class="checkbox-wrapper">
                                        <input type="checkbox" :checked="menu.completed" :disabled="menu.completed">
                                        <div class="checkbox-indicator"></div>
                                    </div>
                                    <span>{{ menu.name }}</span>
                                    <div class="nav-indicator"></div>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            <!-- Main Content -->
            <div class="main-content">
                <div class="content-card">
                    <!-- Dynamically render the current screening component -->
                    <component v-if="currentScreeningComponent" :is="currentScreeningComponent"
                        :current-question-set-name="selectedMenu?.name" @goToNext="handleChangeComponent" />
                    <div v-else class="empty-state">
                        <h4>Select the Assessment Tool you want to begin with!</h4>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import RescreeningGAD from './RescreeningGAD.vue';
import RescreeningPHQ from './RescreeningPHQ.vue';
import RescreeningASSIST from './RescreeningASSIST.vue';
import RescreeningACE from './RescreeningACE.vue';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import axios from 'axios';
import endpoints from '@/api';

const router = useRouter();

const emit = defineEmits(['goBackToSelectTools', 'goToNext']);

// Define reactive variables
const currentScreeningComponent = ref(null);
const selectedMenu = ref(null);
const menus = ref([]);
const nextMenu = ref(null);

// Define component mapping
const componentMap = {
    'PHQ9': RescreeningPHQ,
    'GAD7': RescreeningGAD,
    'ASSIST': RescreeningASSIST,
    'ACE': RescreeningACE,
};
// Method to select menu
const selectMenu = (menu) => {
    selectedMenu.value = menu;
    const nextMenuIndex = menus.value.findIndex(item => item.id === menu.id) + 1;
    nextMenu.value = nextMenuIndex < menus.value.length ? menus.value[nextMenuIndex] : null;
    emit('goToNext', nextMenu.value);
    currentScreeningComponent.value = componentMap[menu.name];
};

// Initialize selected menu on component mount
onMounted(() => {
    const savedTools = JSON.parse(localStorage.getItem('selectedTools'));
    if (savedTools && savedTools.length) {
        menus.value = savedTools.map(tool => ({ ...tool, completed: false }));  // Initialize as not completed
        selectedMenu.value = menus.value[0];  // Start with the first tool
        currentScreeningComponent.value = componentMap[selectedMenu.value.name];  // Load the first component
    }
});


// Watch for changes in selected menu and save to local storage
watch(selectedMenu, (newValue) => {
    localStorage.setItem('selectedMenu', JSON.stringify([newValue]));
});

const handleChangeComponent = (currentMenuName) => {
    console.log('--- Verbose Debugging ---');
    console.log('Current Menu Name:', currentMenuName);

    // Log the current state of menus before finding the current index
    console.log('Menus State (before finding current index):', JSON.stringify(menus.value, null, 2));

    // Find the current index
    const currentIndex = menus.value.findIndex(menu => menu.name === currentMenuName);
    console.log('Current Index:', currentIndex);

    if (currentIndex === -1) {
        console.error(`Could not find the menu for "${currentMenuName}" in menus`);
        return;
    }

    // Mark the current menu as completed
    menus.value[currentIndex].completed = true;
    console.log(`Menu "${currentMenuName}" marked as completed.`);

    // Update localStorage with the new state of the menus
    localStorage.setItem('selectedMenu', JSON.stringify(menus.value));
    console.log('Updated Menus (after marking current menu as completed):', JSON.stringify(menus.value, null, 2));

    // Check if there is a next tool
    if (currentIndex < menus.value.length - 1) {
        const nextTool = menus.value[currentIndex + 1];
        console.log('Next Tool:', nextTool);

        // Update the selected menu and load the next component
        selectedMenu.value = nextTool;
        currentScreeningComponent.value = componentMap[nextTool.name];
        console.log(`Switched to Next Tool: "${nextTool.name}"`);
    } else {
        console.log('No more menus, triggering submission process.');
        Swal.fire({
            icon: 'question',
            title: 'All tests have been completed',
            text: 'Do you wish to proceed to submission?',
            showCancelButton: true,
            confirmButtonText: 'Yes, submit',
            cancelButtonText: 'No, not yet'
        }).then((result) => {
            if (result.isConfirmed) {
                console.log('User confirmed submission.');
                submitAssessments();
            } else {
                console.log('User cancelled submission.');
            }
        });
    }

    console.log('--- End of Verbose Debugging ---');
};


const ClientUserIdCaseBase = JSON.parse(sessionStorage.getItem('RescreeningUserID')) || [];

const submitAssessments = async () => {
    try {
        const userId = ClientUserIdCaseBase;
        const getDataFromLocalStorage = (key) => {
            try {
                const data = localStorage.getItem(`${key}_set_counselor_screening`);
                return data ? JSON.parse(data) : {};
            } catch (error) {
                console.error(`Error parsing ${key} data:`, error);
                return {};
            }
        };

        const gadData = getDataFromLocalStorage('GAD');
        const phqData = getDataFromLocalStorage('PHQ');
        const aceData = getDataFromLocalStorage('ACE');
        const assistData = getDataFromLocalStorage('ASSIST');
        const schoolEnvData = getDataFromLocalStorage('SCHOOLENV');

        // Construct form data
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('gadData', JSON.stringify(gadData));
        formData.append('phqData', JSON.stringify(phqData));
        formData.append('aceData', JSON.stringify(aceData));

        // Calculate risk severity for ASSIST data and append it, even if assistData is empty
        if (assistData) {
            const assistRiskSeverity = calculateAssistRiskSeverity(assistData);
            formData.append('assistRiskSeverity', JSON.stringify(assistRiskSeverity));
        } else {
            formData.append('assistRiskSeverity', JSON.stringify({})); // Send empty object if no data
        }

        formData.append('schoolEnvData', JSON.stringify(schoolEnvData));

        // Send the form data to the server
        const response = await axios.post(endpoints.rescreenSubmission, formData);
        console.log(response)

        // Handle success
        sessionStorage.setItem('ClientUserIdCaseBase', JSON.stringify(ClientUserIdCaseBase));
        clearLocalStorageData();

        // Show success message
        Swal.fire({
            icon: 'success',
            title: 'Assessments Submitted Successfully',
            text: 'Assessments submitted successfully for the current user.',
            confirmButtonText: 'OK'
        }).then(() => {
            if (ClientUserIdCaseBase.length > 0) {
                window.location.reload();
            } else {
                router.push('/counselor-dashboard');
            }
        });
    } catch (error) {
        console.error('Error submitting assessments:', error);
        // Show error message
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to submit assessments. Please try again later.',
            confirmButtonText: 'OK'
        });
    }
};


const calculateAssistRiskSeverity = (assistData) => {
    const substanceScores = {};
    assistData.forEach(entry => {
        const substanceName = entry.substance;
        const point = entry.point;
        substanceScores[substanceName] = (substanceScores[substanceName] || 0) + point;
    });

    const thresholds = {
        mild: 3,
        moderate: 5,
        moderatelySevere: 8,
        severe: 11
    };

    const assistRiskSeverity = {};
    for (const substanceName in substanceScores) {
        const score = substanceScores[substanceName];
        if (score >= thresholds.severe) {
            assistRiskSeverity[substanceName] = 'severe';
        } else if (score >= thresholds.moderatelySevere) {
            assistRiskSeverity[substanceName] = 'moderately severe';
        } else if (score >= thresholds.moderate) {
            assistRiskSeverity[substanceName] = 'moderate';
        } else if (score >= thresholds.mild) {
            assistRiskSeverity[substanceName] = 'mild';
        } else {
            assistRiskSeverity[substanceName] = 'none';
        }
        assistRiskSeverity[substanceName] += ` (${score})`;
    }


    return assistRiskSeverity;
};

// Function to clear localStorage data for assessments
const clearLocalStorageData = () => {
    ['GAD', 'PHQ', 'ACE', 'ASSIST', 'SCHOOLENV'].forEach(key => {
        localStorage.removeItem(`${key}_set_counselor_screening`);
    });
    localStorage.removeItem('answeredSubstances');
    localStorage.removeItem('selectedMenu');
    localStorage.removeItem('selectedTools');
};
</script>

<style scoped>
.screening-container {
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(43, 101, 111, 0.08);
    min-height: 600px;
}

.screening-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    height: 100%;
}

/* Sidebar Styles */
.sidebar-card {
    background: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
    padding: 1.5rem;
    height: 100%;
}

.sidebar-title {
    color: #2B656F;
    font-weight: 600;
    margin-bottom: 2rem;
    padding-left: 0.5rem;
}

.assessment-navigation ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.nav-link {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    color: #1D4851;
    text-decoration: none;
    border-radius: 8px;
    position: relative;
    transition: all 0.3s ease;
    margin-bottom: 0.5rem;
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

/* Checkbox Styles */
.checkbox-wrapper {
    margin-right: 0.75rem;
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

/* Main Content Styles */
.main-content {
    height: 100%;
}

.content-card {
    background: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
    padding: 2rem;
    height: 100%;
    box-shadow: 0 4px 15px rgba(43, 101, 111, 0.1);
}

.empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.empty-state h4 {
    color: #2B656F;
    text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
    .screening-layout {
        grid-template-columns: 1fr;
    }

    .sidebar-card {
        margin-bottom: 1rem;
    }

    .assessment-navigation {
        display: flex;
        overflow-x: auto;
        padding-bottom: 1rem;
    }

    .assessment-navigation ul {
        display: flex;
        gap: 1rem;
        min-width: max-content;
    }

    .nav-link {
        white-space: nowrap;
    }
}
</style>