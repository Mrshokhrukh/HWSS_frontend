<template>
    <div class="container-fluid">
        <div class="row mb-4">
            <div class="col-12">
                <div class="card bg-white">
                    <div class="card-header">
                        <!-- Tabs navigation -->
                        <ul class="nav nav-tabs" id="myTab" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="case-screening-tab" data-bs-toggle="tab"
                                    data-bs-target="#case-screening" type="button" role="tab" aria-controls="case-screening"
                                    aria-selected="true">Case Screening</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="event-based-screening-tab" data-bs-toggle="tab"
                                    data-bs-target="#event-based-screening" type="button" role="tab"
                                    aria-controls="event-based-screening" aria-selected="false">Event Based
                                    Screening</button>
                            </li>
                        </ul>
                    </div>
                    <!-- Tab content -->
                    <div class="card-body">
                        <div class="tab-content" id="myTabContent">
                            <!-- Case Screening tab -->
                            <div class="tab-pane fade show active" id="case-screening" role="tabpanel"
                                aria-labelledby="case-screening-tab">
                                <component :is="currentComponent"
                                    @proceedToSelectTools="switchComponent(CaseScreeningSelectTools)"
                                    @proceedToScreening="switchComponent(CaseScreeningScreening)" />

                                <!-- {{ currentComponent }} -->

                            </div>
                            <!-- Event Based Screening tab -->
                            <div class="tab-pane fade" id="event-based-screening" role="tabpanel"
                                aria-labelledby="event-based-screening-tab">
                                <!-- Include sub-components for Event Based Screening -->
                                <!-- Add your sub-components here -->
                            </div>
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

const counselorScreeningQuestions = ref([]);
const isLoadingQuestions = ref(false);
const errorFetchingQuestions = ref(null);
const userAgeGroup = ref({});

// Define a ref to hold the current component
const currentComponent = ref(CaseScreeningRegister);

// Function to switch the component
function switchComponent(component) {
    currentComponent.value = component;
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
  