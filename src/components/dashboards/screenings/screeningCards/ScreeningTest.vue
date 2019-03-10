<template>
    <div class="container-fluid screening-test p-0">
        <div class="card">
            <div class="card-header mx-auto p-3" v-if="currentQuestionText">
                <div class="test-info d-flex justify-content-between align-items-center">
                    <h5>Current Section: {{ currentQuestionSetName }}</h5>
                    <p class="mx-3">PHQ2 Score: {{ progressStore.scores.PHQ2 }}</p>
                    <p class="mx-3">PHQ9 Score: {{ progressStore.scores.PHQ9 }}</p>
                    <p class="mx-3">GAD2 Score: {{ progressStore.scores.GAD2 }}</p>
                    <p class="mx-3">GAD7 Score: {{ progressStore.scores.GAD7 }}</p>
                </div>
            </div>

            <!-- Progress bar -->
            <div class="card-body">
                <div class="progress-container py-3">
                    <div class="progress" style="height: 10px; border-radius: 5px">
                        <div class="progress-bar" role="progressbar" :style="{ width: progressPercentage + '%' }"
                            aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>

                <!-- Layout for "ASSIST" question set -->
                <div v-if="isAssistOrSchoolEnv && currentQuestionSetName === 'ASSIST'">
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

                <!-- Layout for "SCHOOL ENV" question set -->
                <div v-if="currentQuestionSetName === 'SCHOOL ENV'" class="school-env-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Strongly Agree</th>
                                <th>Agree</th>
                                <th>Neutral/Indifferent</th>
                                <th>Disagree</th>
                                <th>Strongly Disagree</th>
                                <th>Specify</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(question, index) in currentSetQuestions" :key="question.id">
                                <td>{{ question.text }}</td>
                                <template v-if="index < 8"> <!-- For questions 1-8 -->
                                    <td v-for="option in question.answers.slice().reverse()" :key="option.id"
                                        class="text-center">
                                        <input type="radio" :id="`question-${question.id}-answer-${option.id}`"
                                            :name="`question-${question.id}`" :value="option.id"
                                            v-model="answers[question.id]"
                                            @click="handleRadioClick(question.id, option.option)" required>
                                        <label :for="`question-${question.id}-answer-${option.id}`"></label>
                                    </td>
                                    <td v-if="requiresTextInput(question.id)">
                                        <input type="text" class="form-control" v-model="textResponses[question.id]"
                                            :required="requiresTextInput(question.id)" />
                                    </td>
                                </template>

                                <template v-else>
                                    <td colspan="6">
                                        <input type="text" class="form-control" placeholder="Answer 1"
                                            v-model="answers[question.id][0]" required>
                                        <input type="text" class="form-control mt-2" placeholder="Answer 2"
                                            v-model="answers[question.id][1]" required>
                                    </td>
                                </template>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="currentQuestionSetName !== 'SCHOOL ENV' && currentQuestionSetName !== 'ASSIST'">
                    <!-- Existing layout for other question sets -->
                    <div v-if="showBgGreen" class="card p-3 my-3 text-center bg-green">
                        <h4>Over the last 2 weeks, how often have you been bothered by any of the following problems:
                        </h4>
                    </div>
                    <div class="question-area text-center px-5" v-if="currentQuestion">
                        <div class="row my-4 justify-content-center text-center">
                            <div class="col d-flex justify-content-center align-items-center">
                                <div class="icon-container d-inline-flex align-items-center">
                                    <img :src="iconURL" alt="Question Icon" style="max-width: 100px;"
                                        class="mx-4 my-3 animated-icon" />
                                    <div class="question-text d-inline-block">
                                        <h2 class="text-capitalize">{{ processedQuestionText }}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="answer-options d-flex flex-wrap justify-content-center">
                            <div class="answer-option" v-for="option in currentQuestion.answers" :key="option.id">
                                <button :class="{ 'selected': isSelectedAnswer(option) }"
                                    @click="handleAnswerSelection(option)" class="btn btn-lg">
                                    {{ option.option }} <span class="d-none">{{ option.points }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Footer buttons -->
            <div class="card-footer text-end">
                <div class="button-group">
                    <button @click="goBack" class="btn rounded-btn back-button">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <button v-if="currentQuestionSetName === 'SCHOOL ENV'" @click="submitTest"
                        class="btn rounded-btn submit-button">
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
</template>


<script setup>
import { ref, computed, onMounted, watch, reactive, nextTick } from 'vue';
import { useProgressStore } from '@/stores/progressStore';
import Swal from 'sweetalert2';
import axios from 'axios';
import endpoints from "@/api";
import fallbackIcon from "@/assets/images/question.png";

// Initial setup for reactive variables
const progressStore = useProgressStore();
const currentQuestionIndex = ref(0);
const questions = ref([]);
const answers = reactive({});
const textResponses = reactive({});
const substanceAnswered = reactive({});
const showAnswerAllPrompt = ref(false);
const stronglyDisagreeSelected = reactive({});
// const isDevelopmentMode = computed(() => {
//     const envValue = import.meta.env.VITE_APP_DEVELOPMENT_MODE;
//     return envValue === 'true';
// });

// Retrieve user's age data from session storage
const userAgeData = JSON.parse(sessionStorage.getItem('userAgeData'));
// Determine user's age group
const userAgeGroup = userAgeData ? userAgeData.ageGroup : null;

// Function to check if user's age group matches any of the age group tags in the question
function isUserAgeGroupIncluded(ageGroupTags) {
    return ageGroupTags.includes(userAgeGroup);
}

// Fetch questions from API or session storage
onMounted(async () => {
    progressStore.loadProgress();
    currentQuestionIndex.value = progressStore.currentQuestionIndex;

    let storedQuestions = JSON.parse(sessionStorage.getItem('questions'));
    if (!storedQuestions) {
        const response = await axios.get(`${endpoints.ScreeningPreTests}?name=Cluster Screening`);
        storedQuestions = response.data;
        sessionStorage.setItem('questions', JSON.stringify(storedQuestions));
    }

    questions.value = storedQuestions.flatMap(data =>
        data.question_sets.flatMap(set =>
            set.questions.map(question => ({
                ...question,
                setName: set.name,
            }))
        )
    );
    questions.value.forEach(question => {
        answers[question.id] = question.answer_type === 5 ? '' : null;
    });

    if (currentQuestionSetName.value === 'ASSIST') {
        currentQuestion.value.substances.forEach(substance => {
            substanceAnswered[substance] = false;
        });
    }
});

// Watch for changes in current question index and handle ending ASSIST questions
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

// Watch for changes in current question index and save progress
watch(currentQuestionIndex, (newIndex) => {
    progressStore.setQuestionIndex(newIndex);
    progressStore.saveProgress();
});

// Computed properties for current question details
const currentQuestion = computed(() => {
    if (questions.value.length > 0) {
        const question = questions.value[currentQuestionIndex.value];
        if (!question) {
            console.error('Current question is undefined:', currentQuestionIndex.value);
        }
        // console.log('Current question set:', question); // Log currentQuestion
        // console.dir(question); // Log the object in a more expanded form
        return question;
    } else {
        return null;
    }
});

const currentQuestionText = computed(() => {
    const questionText = currentQuestion.value ? currentQuestion.value.text : '';
    console.log('Current question text:', questionText); // Log currentQuestionText
    return questionText;
});


const currentQuestionSetName = computed(() => {
    const setName = currentQuestion.value ? currentQuestion.value.setName : '';
    console.log('Current question set name:', setName); // Log currentQuestionSetName
    return setName;
});

const currentSetQuestions = computed(() => {
    const currentSetName = currentQuestionSetName.value;
    const setQuestions = questions.value.filter(question => question.setName === currentSetName);
    console.log('Current setName questions:', setQuestions); // Log currentSetQuestions
    return setQuestions;
});

// Computed properties for UI elements
const isAssistOrSchoolEnv = computed(() => ['ASSIST', 'SCHOOL ENV'].includes(currentQuestionSetName.value));
const showBgGreen = computed(() => ['PHQ2', 'PHQ9', 'GAD2', 'GAD7'].includes(currentQuestionSetName.value));
const iconURL = computed(() => {
    const iconPath = currentQuestion.value?.icon || '';
    if (iconPath) {
        return location.hostname === 'localhost' ? `http://localhost:8080${iconPath}` : `http://172.30.3.16${iconPath}`;
    } else {
        return fallbackIcon;
    }
});

const processedQuestionText = computed(() => {
    const regex = /over the last 2 weeks, how often have you been bothered by any of the following problems[:?]\s*/i;
    return currentQuestion.value?.text.replace(regex, '');
});

const progressPercentage = computed(() => (currentQuestionIndex.value / (questions.value.length - 1)) * 100);

// Functions for handling answer selection and navigation
function handleAnswerSelection(option, substance) {
    if (currentQuestionSetName.value === 'ASSIST') {
        updateSubstanceAnswered(option, substance);
    } else {
        // Access selectedAnswer and score from currentQuestion
        const selectedAnswer = option.option;
        const score = option.points;
        console.log('Selected Answer:', selectedAnswer);
        console.log('Score:', score);
        progressStore.setAnswer(currentQuestion.value.id, option);
        handleOtherQuestionSets(option);
    }
}


function updateSubstanceAnswered(option, substance) {
    const answer = option.option.trim();
    if (answer === 'Yes' || answer === 'No') {
        substanceAnswered[substance] = answer === 'Yes';
        saveSubstanceAnswersToLocalStorage();
        console.log('Selected Answer:', answer);
        console.log('Substance:', substance);
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
                    localStorage.setItem('otherSubstanceName', result.value);
                    updateSubstanceCount();
                }
            });
        }
    } else {
        console.warn('Invalid answer value:', option.option);
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

// Function to check if input text is required based on the selected answer
function requiresTextInput(questionId) {
    return stronglyDisagreeSelected[questionId];
}

// Function to handle the click event of radio buttons
function handleRadioClick(questionId, answerOption) {
    if (answerOption === "Strongly Disagree") {
        stronglyDisagreeSelected[questionId] = true;
    } else {
        stronglyDisagreeSelected[questionId] = false;
    }
}

function handleOtherQuestionSets(option) {
    progressStore.setAnswer(currentQuestion.value.id, option);

    setTimeout(() => {
        if (currentQuestion.value.question_set === 8 && option.option === "Yes") {
            Swal.fire({
                title: 'Please specify',
                input: 'text',
                inputLabel: 'What were you diagnosed with?',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                inputValidator: (value) => {
                    if (!value) {
                        return 'You need to write something!';
                    }
                }
            }).then((result) => {
                if (result.isConfirmed && result.value) {
                    progressStore.setDiagnosisDetail(currentQuestion.value.id, result.value);
                    nextTick(() => {
                        progressStore.setAnswer(currentQuestion.value.id, option);
                        jumpToNextRelevantSet();
                    });
                }
            });
        }
        else if (currentQuestionSetName.value === 'GAD2' && progressStore.shouldSkipGAD7) {
            nextTick(() => {
                progressStore.setAnswer(currentQuestion.value.id, option);
                jumpToNextRelevantSet('GAD7');
            });
        }
        else if (currentQuestionSetName.value === 'PHQ2' && progressStore.shouldSkipPHQ9) {
            nextTick(() => {
                progressStore.setAnswer(currentQuestion.value.id, option);
                jumpToNextRelevantSet('PHQ9');
            });
        }
        else {
            currentQuestionIndex.value++;
        }
    }, 500);
}

// Function to filter substances based on those answered "No" in local storage
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


const jumpToNextQuestion = () => {
    if (currentQuestionSetName.value === 'ASSIST') {
        if (checkInvalidInputs()) {
            return; // Invalid inputs found, stop execution
        }
    }
    currentQuestionIndex.value++;
};

function jumpToNextRelevantSet(setToSkip) {
    const nextIndex = questions.value.findIndex(
        (question, index) => question.setName !== setToSkip && index > currentQuestionIndex.value
    );
    if (nextIndex !== -1) {
        currentQuestionIndex.value = nextIndex;
    } else {
        console.error(`No question set found after skipping ${setToSkip}`);
    }
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

function submitTest() {
    progressStore.setQuestionIndex(0);
    progressStore.answers = [];
    progressStore.saveProgress();
    Swal.fire('Congratulations!', 'You have completed the test.', 'success');
}

function isSelectedAnswer(option) {
    const existingAnswer = progressStore.answers.find(a => a.questionId === currentQuestion.value.id);
    return existingAnswer && existingAnswer.answer.id === option.id;
}

function flushStore() {
    progressStore.resetStore();
    localStorage.removeItem('answeredSubstances');
    localStorage.removeItem('otherSubstanceName');
    localStorage.removeItem('submissionData');
    localStorage.removeItem('progress');
    Swal.fire('Progress Reset', 'All progress has been reset.', 'info').then(() => {
        location.reload();
    });
}

// Function to render substance options
function renderSubstanceOptions(substance) {
    const otherSubstanceName = localStorage.getItem('otherSubstanceName');
    return substance === 'Other - specify' ? (otherSubstanceName ? otherSubstanceName : 'Other - specify') : substance;
}
</script>

<style scoped>
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
