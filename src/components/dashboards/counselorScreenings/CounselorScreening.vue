<template>
    <div class="container-fluid">
        <div class="row mb-4">
            <div class="col-12">
                <div class="bg-transparent ">
                    <!-- Custom Tabs navigation -->
                    <div class="custom-tabs">
                        <div class="custom-tab" :class="{ 'active': activeTab === 'case-screening' }"
                            @click="activateTab('case-screening')">
                            Case Screening
                        </div>
                        <div class="custom-tab" :class="{ 'active': activeTab === 'event-based-screening' }"
                            @click="activateTab('event-based-screening')">
                            Event Based Screening
                        </div>
                    </div>
                    <!-- Tab content -->
                    <div class="p-4 card-element">
                        <!-- Case Screening tab -->
                        <div v-if="activeTab === 'case-screening'">
                            <component :is="currentComponent"
                                @proceedToSelectTools="switchComponent(CaseScreeningSelectTools)"
                                @proceedToScreening="switchComponent(CaseScreeningScreening)" />
                        </div>
                        <!-- Event Based Screening tab -->
                        <div v-if="activeTab === 'event-based-screening'">
                            <component :is="currentEventComponent"
                                @proceedToSelectTools="switchComponent(EventScreeningSelectTools)"
                                @proceedToScreening="switchComponent(EventScreeningScreening)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { ref, onMounted, provide } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import CaseScreeningRegister from '@/components/dashboards/counselorScreenings/counselorScreeningStages/CaseScreeningRegister.vue';
import CaseScreeningSelectTools from '@/components/dashboards/counselorScreenings/counselorScreeningStages/CaseScreeningSelectTools.vue';
import CaseScreeningScreening from '@/components/dashboards/counselorScreenings/counselorScreeningStages/CaseScreeningScreening.vue';
import EventScreeningRegister from '@/components/dashboards/counselorScreenings/counselorScreeningStages/EventScreeningRegister.vue';
import EventScreeningSelectTools from '@/components/dashboards/counselorScreenings/counselorScreeningStages/EventScreeningSelectTools.vue';
import EventScreeningScreening from '@/components/dashboards/counselorScreenings/counselorScreeningStages/EventScreeningScreening.vue';

const counselorScreeningQuestions = ref([]);
const isLoadingQuestions = ref(false);
const errorFetchingQuestions = ref(null);
const userAgeGroup = ref({});

// Define a ref to hold the current component
const currentComponent = ref(CaseScreeningRegister);
// Define a ref to hold the current component
const currentEventComponent = ref(EventScreeningRegister);
// Define a ref to hold the active tab
const activeTab = ref('case-screening');

function switchComponent(component) {
    currentComponent.value = component;
}

// Function to activate a tab
function activateTab(tabName) {
    activeTab.value = tabName;
}


async function fetchCounselorScreeningQuestions() {
    try {
        isLoadingQuestions.value = true;
        const response = await axios.get(`${endpoints.ScreeningPreTests}?name=Case Screening`);
        counselorScreeningQuestions.value = response.data;
        sessionStorage.setItem('counselorScreeningQuestions', JSON.stringify(counselorScreeningQuestions.value));
    } catch (error) {
        console.error('Error fetching questions:', error);
        errorFetchingQuestions.value = error;
    } finally {
        isLoadingQuestions.value = false;
    }
}

onMounted(fetchCounselorScreeningQuestions);

onMounted(() => {
    try {
        const userDataJSON = sessionStorage.getItem('userAgeData');
        if (userDataJSON) {
            const userData = JSON.parse(userDataJSON);
            if (userData.ageGroup !== undefined) {
                userAgeGroup.value = userData.ageGroup;
            } else {
                console.log('Error: ageGroup not found in userAgeData');
            }
        } else {
            console.log('Error: userAgeData not found in session storage');
        }
    } catch (error) {
        console.log('Error parsing userAgeData:', error);
    }
});


provide('counselorScreeningQuestions', counselorScreeningQuestions);
provide('isLoadingQuestions', isLoadingQuestions);
provide('errorFetchingQuestions', errorFetchingQuestions);
provide('userAgeGroup', userAgeGroup);
</script>

<style scoped>
.custom-tabs {
    display: flex;
    justify-content: start;
}

.custom-tab {
    cursor: pointer;
    padding: 1rem 3rem;
    border: 1px solid #cde0c9;
    background-color: #cde0c9;
    border-bottom: none;
    border-radius: 10px 55px 0 0;
    font-size: large;
    font-weight: 600;
}

.custom-tab.active {
    background-color: #a3cdb8;
    border: 1px solid #a3cdb8;
    z-index: 999;
}


.card-element {
    border-radius: 0 10px 10px 10px;
    background: #a3cdb8;
    box-shadow: 4px 4px 16px 8px rgb(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}
</style>
  