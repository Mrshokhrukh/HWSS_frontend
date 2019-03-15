<template>
    <div class="container-fluid screening-test p-5 card">
        <!-- VueConfetti component -->
        <div style="z-index: 9999;" class="text-center mx-auto" v-if="showConfetti">
            <ConfettiExplosion :particleCount="200" :particleSize="10" :duration="5000" :force="0.8" />
        </div>
        <div class="border-div-test p-3">
            <div class="card-inner">
                <div class="card-header mx-auto p-3" v-if="currentQuestionText">
                    <div class="test-info d-flex justify-content-between align-items-center d-none">
                        <h5>Current Section: {{ currentQuestionSetName }}</h5>
                        <p class="mx-3">PHQ2 Score: {{ progressStore.scores.PHQ2 }}</p>
                        <p class="mx-3">PHQ9 Score: {{ progressStore.scores.PHQ9 }}</p>
                        <p class="mx-3">GAD2 Score: {{ progressStore.scores.GAD2 }}</p>
                        <p class="mx-3">GAD7 Score: {{ progressStore.scores.GAD7 }}</p>
                    </div>
                </div>

                <!-- Progress bar -->
                <div class="card-body">

                    <!-- Layout for "ASSIST" question set -->
                    <div>
                        <h4 class="my-5 text-center">{{ currentQuestion.text }}</h4>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Substances</th>
                                    <th v-for="option in currentQuestion.answers" :key="option.id" class="text-center">
                                        {{ option.option }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="substance in filterSubstances(currentQuestion.substances)" :key="substance">
                                    <td class="text-capitalize">{{ renderSubstanceOptions(substance) }}</td>
                                    <td v-for="option in currentQuestion.answers" :key="option.id" class="text-center">
                                        <input type="radio" :name="`substance-${substance}`" :value="option.id"
                                            @change="handleAnswerSelection(option, substance)" required />
                                        <span class="d-none">{{ option.points }}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Footer buttons -->
                <div class="card-footer text-end">
                    <div class="button-group">
                        <button @click="goBack" class="btn rounded-btn back-button">
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                        <button v-if="currentQuestionSetName === 'SCHOOL ENV'"
                            @click="submitFormData(answerOption, question)" class="btn rounded-btn submit-button">
                            <i class="fas fa-check"></i> Submit
                        </button>
                        <button v-if="currentQuestionSetName === 'ASSIST'" @click="jumpToNextQuestion"
                            class="btn rounded-btn submit-button">
                            Next <i class="fas fa-chevron-right ms-2"></i>
                        </button>
                        <button @click="flushStore" class="btn rounded-btn back-button">
                            <i class="fas fa-undo"></i> Reset Progress
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, computed, watch, reactive } from 'vue';
import { useProgressStore } from '@/stores/progressStore';
import Swal from 'sweetalert2';
import ConfettiExplosion from "vue-confetti-explosion";

// Initial setup for reactive variables
const progressStore = useProgressStore();
const currentQuestionIndex = ref(0);
const questions = ref([]);
const answers = reactive({});
const substanceAnswered = reactive({});
const showAnswerAllPrompt = ref(false);
const storedResponses = ref({});
// const answerAtIndexZero = ref('');

const testResponses = reactive({
    responses: [],
    logs: []
});

const counselorScreeningQuestions = JSON.parse(sessionStorage.getItem('counselorScreeningQuestions'));

const currentQuestion = ref(counselorScreeningQuestions.find(set => set.name === 'Case Screening').question_sets.find(set => set.name === 'ASSIST').questions);

const showConfetti = ref(false);

const userAgeData = JSON.parse(sessionStorage.getItem('userAgeData'));
const userAgeGroup = userAgeData ? userAgeData.ageGroup : null;

function isUserAgeGroupIncluded(ageGroupTags) {
    return ageGroupTags.includes(userAgeGroup);
}


watch(currentQuestionIndex, (newIndex) => {
    if (currentQuestionSetName.value === 'ASSIST') {
        const currentQuestion = questions.value[newIndex];
        if (currentQuestion && (currentQuestion.id === 29 || currentQuestion.id === 30)) {
            const ageGroupTags = currentQuestion.age_group_tags;
            const includeUserAgeGroup = isUserAgeGroupIncluded(ageGroupTags);
            if (!includeUserAgeGroup) {
                jumpToNextRelevantSet();
            }
        }
    }
});

function findLoggedQuestionIndex(question, substance) {
    return testResponses.responses.findIndex(entry =>
        entry.question === question &&
        (entry.substance === undefined || entry.substance === substance)
    );
}

function logQuestionAndResponse(option, substance) {
    const questionText = currentQuestionText.value;
    const questionSetName = currentQuestionSetName.value;
    const response = option.option;
    const point = option.points;

    const index = findLoggedQuestionIndex(questionText, substance);

    const logEntry = {
        question: questionText,
        setName: questionSetName,
        response: response,
        point: point,
        substance: substance || null, // Set substance to null if not provided
        diagnosis: null,
    };

    const answer = response.trim();

    if (questionSetName === 'ASSIST') {
        if (answer) {
            logEntry.substance = substance;
            answers.substanceName = substance;
            substanceAnswered[substance] = answer === 'Yes';
        }
    }

    if (index !== -1 && logEntry.substance === testResponses.responses[index].substance) {
        console.log('Log Entry Replacing (same substance):', logEntry);
        testResponses.responses[index] = logEntry;
    } else {
        console.log('Log Entry:', logEntry);
        // Log even if substance is different
        console.log('(Substance different from existing entry)');
        testResponses.responses.push(logEntry);
    }
}

// Watch for changes in current question index and save progress
watch(currentQuestionIndex, (newIndex) => {
    progressStore.setQuestionIndex(newIndex);
    progressStore.saveProgress();
});

const currentQuestionText = computed(() => {
    return currentQuestion.value ? currentQuestion.value.text : '';
});

const currentQuestionSetName = computed(() => {
    return currentQuestion.value ? currentQuestion.value.setName : '';
});

// Functions for handling answer selection and navigation
function handleAnswerSelection(option, substance) {
    if (currentQuestionSetName.value === 'ASSIST') {
        logQuestionAndResponse(option, substance);

        updateSubstanceAnswered(option, substance);
        storedResponses[currentQuestion.value.id] = { option, substance };
    }
}

answers.substanceName = '';
function updateSubstanceAnswered(option, substance) {
    const answer = option.option.trim();
    if (answer === 'Yes' || answer === 'No') {
        substanceAnswered[substance] = answer === 'Yes';
        saveSubstanceAnswersToLocalStorage();
        if (answer === 'Yes' && substance === 'Other - specify') {
            Swal.fire({
                title: 'Specify Substance',
                input: 'text',
                inputLabel: 'Enter the substance name:',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                inputValidator: (value) => {
                    if (!value) {
                        return 'You need to provide a substance name!';
                    }
                }
            }).then((result) => {
                if (result.isConfirmed && result.value) {

                    const logEntry = {
                        question: currentQuestionText.value,
                        setName: currentQuestionSetName.value,
                        response: answer,
                        substance: result.value // Update substance name here
                    };

                    testResponses.responses.push(logEntry);

                    localStorage.setItem('otherSubstanceName', result.value);
                    // Save the substance name to your answers object
                    answers.substanceName = result.value;
                    updateSubstanceCount();
                }
            });
        }
    }
}


function saveSubstanceAnswersToLocalStorage() {
    localStorage.setItem('answeredSubstances', JSON.stringify(substanceAnswered));
}

function updateSubstanceCount() {
    const countYes = Object.values(substanceAnswered).filter(answer => answer).length;
    checkAllSubstancesAnswered(countYes);
}

const checkInvalidInputs = () => {
    const invalidInputs = document.querySelectorAll('input:required:invalid');
    if (invalidInputs.length > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Incomplete Form',
            text: 'Please fill in all required fields before proceeding.',
        });
        return true;
    }
    return false;
};

function checkAllSubstancesAnswered(countYes) {
    const totalSubstances = Object.keys(substanceAnswered).length;
    if (countYes < totalSubstances) {
        showAnswerAllPrompt.value = false;
    }
}

function filterSubstances(substances) {
    const answeredSubstances = JSON.parse(localStorage.getItem('answeredSubstances')) || {};
    if (Object.keys(answeredSubstances).length === 0) {
        return substances;
    }
    const filteredSubstances = substances.filter(substance => {
        if (substance === 'Any Drug') {
            return true;
        }
        return answeredSubstances[substance];
    });
    return filteredSubstances;
}

// Function to jump to the next question
const jumpToNextQuestion = () => {
    if (currentQuestionSetName.value === 'ASSIST') {
        if (!checkInvalidInputs()) {
            const allSubstancesNo = Object.values(substanceAnswered).every(answer => answer === 'No' || answer === 'Yes');
            if (allSubstancesNo) {
                jumpToNextRelevantSet('ASSIST');
                return;
            }
        }
    } else {
        currentQuestionIndex.value++;
    }
    currentQuestionIndex.value++;
};


function jumpToNextRelevantSet(setToSkip) {
    const nextIndex = findNextSetIndex(setToSkip);
    if (nextIndex !== -1) {
        currentQuestionIndex.value = nextIndex;
    } else {
        console.error(`No question set found after skipping ${setToSkip}`);
    }
}

function findNextSetIndex(setToSkip) {
    return questions.value.findIndex(
        (question, index) => question.setName !== setToSkip && index > currentQuestionIndex.value
    );
}


function goBack() {
    if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--;
    } else {
        Swal.fire({
            icon: 'info',
            title: 'Start of Screening',
            text: 'This is the beginning of the screening, no more previous questions exist.',
        });
    }
}

// Function to render substance options
function renderSubstanceOptions(substance) {
    const otherSubstanceName = localStorage.getItem('otherSubstanceName');
    return substance === 'Other - specify' ? (otherSubstanceName ? otherSubstanceName : 'Other - specify') : substance;
}
</script>

<style scoped>
.border-div-test {
    border: 1px solid #c9c9c9;
    border-radius: 10px;
}

.message {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    color: #5d5d5d;
    background-color: #ffffff;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.emoji {
    font-size: 40px;
}

.pride-message {
    font-size: 28px;
    margin-top: 10px;
}

input {
    border-radius: 10px;
}

.bg-green {
    background: #2c6975;
    color: #fff;
}

.answer-option button,
.next-button {
    appearance: none;
    background-color: #f0f0f0;
    border: 2px solid #2c6975;
    border-radius: 20px;
    padding: 10px 20px;
    margin: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    width: calc(50% - 10px);
}

.next-button {
    appearance: none;
    background-color: #2c6975;
    /* Dark greenish-blue */
    color: white;
    border: 2px solid transparent;
    border-radius: 20px;
    padding: 10px 20px;
    margin: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.answer-option button.selected {
    background-color: #2c6975;
    /* Base color of the app */
    color: white;
    border-color: #2c6975;
}

.answer-options.d-flex>.answer-option {
    flex: 1 0 45%;
    /* Adjust based on preference for 2 per line */
}

textarea {
    width: 100%;
    margin-top: 10px;
}

.screening-test {
    max-width: 80vw;
    margin: auto;
    background-color: #ffffff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}

.progress-container .progress {
    height: 10px;
    /* Make the progress bar thicker */
    border-radius: 5px;
    /* Rounded corners for the progress bar */
}

.progress-bar {
    background-color: #2c6975;
    /* Dark greenish-blue */
    border-radius: 5px;
    /* Ensure the fill also has rounded corners */
}

.question-area .row {
    align-items: center;
    /* Vertically center content */
}

.icon-container img {
    display: block;
    /* Ensure the image is block-level to center it if needed */
    margin: 0 auto;
    /* Center the icon horizontally within its container */
    max-width: 100px;
    /* Limit icon size */
}

.question-text h2 {
    color: #333;
    font-size: 24px;
    font-weight: 600;
}

.answer-options {
    margin-bottom: 20px;
}

.answer-button {
    width: 100%;
    padding: 10px;
    margin: 5px 0;
    border: 1px solid #ccc;
    border-radius: 20px;
    background-color: #f5f5f5;
    color: #333;
    font-size: 18px;
    transition: background-color 0.3s, color 0.3s;
}

.answer-button.selected {
    background-color: #2c6975;
    /* Dark greenish-blue */
    color: #ffffff;
}

.back-button-area {
    margin-top: 20px;
}

.back-button {
    background-color: transparent;
    border: 2px solid #2c6975;
    color: #2c6975;
    font-size: 14px;
    cursor: pointer;
    border-radius: 5rem;
    transition: 800ms;
    box-shadow: none;
}

.back-button:hover {
    background-color: #2c6975;
    color: #fff;
}

.submit-button {
    background-color: #2c6975;
    /* border: 2px solid #2c6975; */
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    border-radius: 5rem;
    transition: 800ms;
    box-shadow: none;
}

.submit-button:hover {
    background-color: transparent;
    color: #2c6975;
    border: 2px solid #2c6975;
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 20px;
    /* Adjust the gap as needed */
}

textarea {
    width: 100%;
    padding: 10px;
    margin-top: 10px;
    border: 2px solid #ccc;
    /* Make border slightly thicker */
    border-radius: 20px;
    /* Rounded corners */
    box-shadow: none;
    /* Optional: remove or adjust box-shadow */
}

.col-auto .icon-container img {
    max-width: 100px;
    /* Limit the size of the icon */
    margin-right: 20px;
    /* Add some space between the icon and the text */
}

input[type="radio"] {
    background: #2c6975;
}

input[type="radio"] {
    transform: scale(1.5);
}
</style>
