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
    const currentIndex = menus.value.findIndex(menu => menu.name === currentMenuName);

    if (currentIndex === -1) {
        console.error(`Could not find the menu for "${currentMenuName}" in menus`);
        return;
    }

    // Mark the current menu as completed
    menus.value[currentIndex].completed = true;

    // Update localStorage with the new state of the menus
    localStorage.setItem('selectedMenu', JSON.stringify(menus.value));

    // Check if there is a next tool
    if (currentIndex < menus.value.length - 1) {
        const nextTool = menus.value[currentIndex + 1];

        selectedMenu.value = nextTool;
        currentScreeningComponent.value = componentMap[nextTool.name];
    } else {
        Swal.fire({
            icon: 'question',
            title: 'All tests have been completed',
            text: 'Do you wish to proceed to submission?',
            showCancelButton: true,
            confirmButtonText: 'Yes, submit',
            cancelButtonText: 'No, not yet'
        }).then((result) => {
            if (result.isConfirmed) {
                submitAssessments();
            }
        });
    }
};


const submitAssessments = async () => {
    try {

        // Get the patient user ID from sessionStorage
        const patientUserId = JSON.parse(sessionStorage.getItem('RescreeningUserID'));
        const userDetails = JSON.parse(localStorage.getItem('userDetailsStore'));
        const counselorUserId = userDetails?.user?.id || null;
        const clientAgeGroup = sessionStorage.getItem('clientAgeGroup')

        if (!counselorUserId) throw new Error('Counselor user ID not found in local storage');
        if (!patientUserId) throw new Error('Patient user ID not found in session storage');
        if (!clientAgeGroup) throw new Error('Client age group not found in session storage')

        // Retrieve assessment data from local storage with fallback to {}
        const getDataFromLocalStorage = (key) => {
            try {
                const data = localStorage.getItem(`${key}_set_counselor_screening`);
                return data ? JSON.parse(data) : (key === 'ASSIST' ? [] : {});
            } catch (error) {
                console.error(`Error parsing ${key} data:`, error);
                return key === 'ASSIST' ? [] : {};
            }
        };


        const gadData = getDataFromLocalStorage('GAD');
        const phqData = getDataFromLocalStorage('PHQ');
        const aceData = getDataFromLocalStorage('ACE');
        const assistData = getDataFromLocalStorage('ASSIST');
        const schoolEnvData = getDataFromLocalStorage('SCHOOLENV');

        // Construct form data with default empty objects if necessary
        const formData = new FormData();
        formData.append('userId', patientUserId);
        formData.append('rescreened_by', counselorUserId);
        formData.append('gadData', JSON.stringify(gadData || {}));
        formData.append('phqData', JSON.stringify(phqData || {}));
        formData.append('aceData', JSON.stringify(aceData || {}));

        // Calculate risk severity for ASSIST if data exists, else append an empty object
        const assistRiskSeverity = assistData ? calculateAssistRiskSeverity(assistData, clientAgeGroup) : {};
        formData.append('assistRiskSeverity', JSON.stringify(assistRiskSeverity));

        formData.append('schoolEnvData', JSON.stringify(schoolEnvData || {}));

        // Send the form data to the server
        const response = await axios.post(endpoints.rescreenSubmission, formData);

        // Handle successful submission
        Swal.fire({
            icon: 'success',
            title: 'Assessments Submitted Successfully',
            text: 'Assessments submitted successfully for the current user.',
            confirmButtonText: 'OK'
        }).then(() => {
            clearLocalStorageData();
            router.push('/counselor-dashboard');
        });
    } catch (error) {
        console.error('Error submitting assessments:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to submit assessments. Please try again later.',
            confirmButtonText: 'OK'
        });
    }
};


const calculateAssistRiskSeverity = (assistData, ageGroup) => {
    // Ensure assistData is an array, even if it's empty or undefined
    const validAssistData = Array.isArray(assistData) ? assistData : [];

    const substanceScores = {};
    validAssistData.forEach(entry => {
        const substanceName = entry.substance;
        const point = entry.point;
        if (substanceName) {
            substanceScores[substanceName] = (substanceScores[substanceName] || 0) + point;
        }
    });

    // Define thresholds based on age group
    let thresholds;
    if (ageGroup === 'Below 14') {
        thresholds = {
            'Tobacco products (cigarettes, chewing tobacco etc)': { low: 0, moderate: 3, high: 27 },
            'Alcoholic beverages (beer, wine, spirits, ara etc.)': { low: 0, moderate: 10, high: 27 },
            'Cannabis (marijuana, pot, grass, hash, black etc.)': { low: 0, moderate: 3, high: 27 },
            'Cocaine': { low: 0, moderate: 3, high: 27 },
            'Amphetamine-type stimulants (meth, ecstasy, diet pills etc.)': { low: 0, moderate: 3, high: 27 },
            'Inhalants (dendrite, glue, petrol, paint thinner, etc.)': { low: 0, moderate: 3, high: 27 },
            'Sedatives or Sleeping Pills (N-10, diazepam etc.)': { low: 0, moderate: 3, high: 27 },
            'Hallucinogens (LSD, trips, Ketamine, etc.)': { low: 0, moderate: 3, high: 27 },
            'Opioids (heroin, morphine, fentanyl, codeine, SP+, tramadol, BS etc)': { low: 0, moderate: 3, high: 27 },
            'Other - specify': { low: 0, moderate: 3, high: 27 }
        };
    } else if (ageGroup === '15 to 17') {
        thresholds = {
            'Tobacco products (cigarettes, chewing tobacco etc)': { low: 2, moderate: 11, high: 12 },
            'Alcoholic beverages (beer, wine, spirits, ara etc.)': { low: 5, moderate: 17, high: 18 },
            'Cannabis (marijuana, pot, grass, hash, black etc.)': { low: 2, moderate: 11, high: 12 },
            'Cocaine': { low: 2, moderate: 6, high: 7 },
            'Amphetamine-type stimulants (meth, ecstasy, diet pills etc.)': { low: 2, moderate: 8, high: 9 },
            'Inhalants (dendrite, glue, petrol, paint thinner, etc.)': { low: 2, moderate: 8, high: 9 },
            'Sedatives or Sleeping Pills (N-10, diazepam etc.)': { low: 2, moderate: 6, high: 7 },
            'Hallucinogens (LSD, trips, Ketamine, etc.)': { low: 2, moderate: 8, high: 9 },
            'Opioids (heroin, morphine, fentanyl, codeine, SP+, tramadol, BS etc)': { low: 2, moderate: 6, high: 7 },
            'Other - specify': { low: 2, moderate: 6, high: 7 }
        };
    } else { // Above 18
        thresholds = {
            'Tobacco products (cigarettes, chewing tobacco etc)': { low: 0, moderate: 3, high: 27 },
            'Alcoholic beverages (beer, wine, spirits, ara etc.)': { low: 0, moderate: 10, high: 27 },
            'Cannabis (marijuana, pot, grass, hash, black etc.)': { low: 0, moderate: 3, high: 27 },
            'Cocaine': { low: 0, moderate: 3, high: 27 },
            'Amphetamine-type stimulants (meth, ecstasy, diet pills etc.)': { low: 0, moderate: 3, high: 27 },
            'Inhalants (dendrite, glue, petrol, paint thinner, etc.)': { low: 0, moderate: 3, high: 27 },
            'Sedatives or Sleeping Pills (N-10, diazepam etc.)': { low: 0, moderate: 3, high: 27 },
            'Hallucinogens (LSD, trips, Ketamine, etc.)': { low: 0, moderate: 3, high: 27 },
            'Opioids (heroin, morphine, fentanyl, codeine, SP+, tramadol, BS etc)': { low: 0, moderate: 3, high: 27 },
            'Other - specify': { low: 0, moderate: 3, high: 27 }
        };
    }

    const assistRiskSeverity = {};
    for (const substanceName in substanceScores) {
        const score = substanceScores[substanceName];
        let riskLevel;
        if (score >= thresholds[substanceName]?.high) {
            riskLevel = 'high risk';
        } else if (score >= thresholds[substanceName]?.moderate) {
            riskLevel = 'moderate risk';
        } else if (score > thresholds[substanceName]?.low) {
            riskLevel = 'low risk';
        }
        else {
            riskLevel = 'no risk'
        }
        assistRiskSeverity[substanceName] = `${riskLevel} (${score})`;
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