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
                                <th v-if="requiresTextInput()">Specify</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(question, index) in currentSetQuestions" :key="question.id">
                                <td>{{ question.text }}</td>
                                <template v-if="index < 8"> <!-- For questions 1-8 -->
                                    <td v-for="option in question.answers.slice().reverse()" :key="option.id"
                                        class="text-center">
                                        <input type="radio" :id="`question-${question.id}-answer-${option.id}`"
                                            :name="`question-${question.id}`" :value="option.option"
                                            v-model="answers[question.id]"
                                            @change="handleRadioClick(question.id, option.option)" required>

                                        <label :for="`question-${question.id}-answer-${option.id}`"></label>
                                    </td>
                                    <td v-if="requiresTextInput(question.id)">
                                        <input type="text" class="form-control" v-model="textResponses[question.id]"
                                            :required="requiresTextInput(question.id)" placeholder="Specify" />
                                    </td>
                                </template>

                                <template v-else>
                                    <td colspan="6">
                                        <input type="text" class="form-control mb-3" placeholder="Answer 1"
                                            v-model="textResponses[question.id + '_1']" required>
                                        <input type="text" class="form-control" placeholder="Answer 2"
                                            v-model="textResponses[question.id + '_2']" required>
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
            <!-- VueConfetti component -->
            <div style="z-index: 9999;" class="text-center mx-auto" v-if="showConfetti">
                <ConfettiExplosion :particleCount="400" :particleSize="10" :duration="5000" :force="0.8" />
            </div>

            <!-- Footer buttons -->
            <div class="card-footer text-end">
                <div class="button-group">
                    <button @click="goBack" class="btn rounded-btn back-button">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <button v-if="currentQuestionSetName === 'SCHOOL ENV'" @click="submitFormData"
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
import { useRoute } from 'vue-router';
import ConfettiExplosion from "vue-confetti-explosion";

// Initial setup for reactive variables
const progressStore = useProgressStore();
const currentQuestionIndex = ref(0);
const questions = ref([]);
const answers = reactive({});
const textResponses = reactive({});
const substanceAnswered = reactive({});
const showAnswerAllPrompt = ref(false);
const stronglyDisagreeSelected = reactive({});
const router = useRoute();
const storedResponses = ref({});
// const answerAtIndexZero = ref('');

const testResponses = reactive({
    responses: [],
    logs: []
});


const schoolEnvFormData = ref({
    question1: {
        answer: '',
        specify: '',
    },
    question2: {
        answer: '',
        specify: '',
    },
    question3: {
        answer: '',
        specify: '',
    },
    question4: {
        answer: '',
        specify: '',
    },
    question5: {
        answer: '',
        specify: '',
    },
    question6: {
        answer: '',
        specify: '',
    },
    question7: {
        answer: '',
        specify: '',
    },
    question8: {
        answer: '',
        specify: '',
    },
    question9: {
        answer1: '',
        answer2: '',
    },
    question10: {
        answer1: '',
        answer2: '',
    },
});

const showConfetti = ref(false);
const showMessage = ref(false);
const answeredSubstances = ref({});


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

// Computed property to check if all substances are answered with "NO"
const allSubstancesNo = computed(() => {
    if (!answeredSubstances.value) return false;

    const falseCount = Object.values(answeredSubstances.value).filter(answer => !answer).length;
    return falseCount === 10;
});
// Watch for changes in allSubstancesNo
watch(allSubstancesNo, (allNo) => {
    if (allNo) {
        showConfetti.value = true;
        showMessage.value = true;
        setTimeout(() => {
            jumpToNextRelevantSet();
        }, 3000);
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

const handleStorageChange = () => {
    const updatedAnsweredSubstances = JSON.parse(localStorage.getItem('answeredSubstances'));

    // Wait until 10 objects are added to the key
    const answeredSubstancesArray = Object.values(updatedAnsweredSubstances);
    if (answeredSubstancesArray.length === 10) {
        const allFalse = answeredSubstancesArray.every(state => state === false);
        if (allFalse) {
            Swal.fire({
                icon: null, // Remove the icon
                title: '<div style="display: flex; justify-content: center; align-items: center;"><span style="font-size: 48px;">🎉</span> <span style="font-size: 24px;">Tashi Delek for not using any substances</span> <span style="font-size: 48px;">🎉</span></div>',
                html: "<div style='font-size: 18px; text-align: center; margin-top: 20px;'>We're proud of you!</div><div style='font-size: 48px; margin-top: 20px;'>👏🏼</div>",
                confirmButtonText: 'Next',
                confirmButtonClass: 'swal-button',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCloseButton: false,
                willClose: () => {
                    showConfetti.value = true;
                    setTimeout(() => {
                        jumpToNextRelevantSet('ASSIST');
                    }, 200);
                },
                didClose: () => {
                    showConfetti.value = false;
                },
                onOpen: () => {
                    const modal = Swal.getPopup();
                    modal.style.width = '80%'; // Adjust modal width
                    modal.style.maxWidth = '800px'; // Set maximum modal width
                    modal.style.padding = '30px'; // Add padding for better appearance
                }
            });
        }
    }

    answeredSubstances.value = updatedAnsweredSubstances;
};

function logQuestionAndResponse(option, substance) {
    const questionText = currentQuestionText.value;
    const questionSetName = currentQuestionSetName.value;
    const response = option.option;
    const point = option.points;

    if (questionSetName === 'ASSIST') {
        const selectedSubstance = substance;

        if (selectedSubstance) {
            const substanceName = selectedSubstance.name;

            const logEntry = {
                question: questionText,
                setName: questionSetName,
                response: response,
                point: point,
                substance: substanceName
            };

            testResponses.logs.push(logEntry);
        } else {
            console.error('Selected substance not found.');
        }
    } else if (questionSetName === 'SCHOOL ENV') {
        const formRows = document.querySelectorAll('.table tbody tr');
        const formResponses = [];

        formRows.forEach(row => {
            const question = row.querySelector('td:first-child').textContent.trim();
            const inputs = row.querySelectorAll('input[type="text"]');
            const answers = [];

            inputs.forEach(input => {
                answers.push(input.value.trim());
            });

            formResponses.push({ question, answers });
        });

        // Log the form responses
        const logEntry = {
            question: questionText,
            setName: questionSetName,
            responses: formResponses
        };

        testResponses.logs.push(logEntry);
    } else {
        const logEntry = {
            question: questionText,
            setName: questionSetName,
            response: response,
            point: point
        };

        testResponses.logs.push(logEntry);
    }
}

function logQuestionAndResponseWithDiagnosis(option) {
    logQuestionAndResponse(option);

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
            const diagnosis = result.value;
            // Save the diagnosis to the log entry
            const logEntry = testResponses.logs[testResponses.logs.length - 1];
            logEntry.diagnosis = diagnosis;
            // Save the diagnosis to your answers object
            answers.diagnosis = diagnosis;
            progressStore.setDiagnosisDetail(currentQuestion.value.id, diagnosis);
            nextTick(() => {
                progressStore.setAnswer(currentQuestion.value.id, option);
                jumpToNextRelevantSet();
            });
        }
    });
}

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
        // Log the selected substance and its answer
        console.log('Selected Substance:', substance);
        console.log('Selected Answer:', option.option);
        logQuestionAndResponse(option, substance);
        // Update the reactive variable to reflect the answer selection
        updateSubstanceAnswered(option, substance);
        storedResponses[currentQuestion.value.id] = { option, substance };
    } else {
        // Handle answer selection for other question sets
        const selectedAnswer = option.option;
        const score = option.points;
        console.log('Selected Answer:', selectedAnswer);
        console.log('Score:', score);
        logQuestionAndResponse(option);
        if (currentQuestionSetName.value === 'SCHOOL ENV') {
            const questionId = currentQuestion.value.id;
            const answer = option.option;
            schoolEnvFormData.value[`question${questionId}`].answer = answer;
            // You may need additional logic here to handle specifying answers if required
        }
        progressStore.setAnswer(currentQuestion.value.id, option);
        handleOtherQuestionSets(option);
    }
}


answers.substanceName = '';

// Update the updateSubstanceAnswered function to handle capturing the substance name
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
                    // Log the substance name along with the answer
                    console.log('Selected Answer:', answer);
                    console.log('Substance:', result.value);

                    // Push the information into the testResponses.logs array
                    const logEntry = {
                        question: currentQuestionText.value,
                        setName: currentQuestionSetName.value,
                        response: answer,
                        substance: result.value
                    };

                    testResponses.logs.push(logEntry);

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
    handleStorageChange();
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

    // Call the logQuestionAndResponse function to log the response
    logQuestionAndResponseSchoolEnv(answerOption);
}

function logQuestionAndResponseSchoolEnv(answerOption) {
    const questionText = currentQuestionText.value;
    const questionSetName = currentQuestionSetName.value;

    const logEntry = {
        question: questionText,
        setName: questionSetName,
        response: answerOption,
    };

    testResponses.logs.push(logEntry);
}



function handleOtherQuestionSets(option) {
    progressStore.setAnswer(currentQuestion.value.id, option);

    setTimeout(() => {
        if (currentQuestion.value.question_set === 8 && option.option === "Yes") {
            // No need for Swal.fire here
            logQuestionAndResponseWithDiagnosis(option);
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


// Function to jump to the next question
const jumpToNextQuestion = () => {
    if (currentQuestionSetName.value === 'ASSIST') {
        if (!checkInvalidInputs()) {
            const allSubstancesNo = Object.values(substanceAnswered).every(answer => answer === false);
            if (allSubstancesNo) {
                jumpToNextRelevantSet('ASSIST');
            }
        }
    }
    currentQuestionIndex.value++;
};


// Function to jump to the next relevant set
function jumpToNextRelevantSet(setToSkip) {
    const nextIndex = findNextSetIndex(setToSkip);
    if (nextIndex !== -1) {
        currentQuestionIndex.value = nextIndex;
    } else {
        console.error(`No question set found after skipping ${setToSkip}`);
    }
}

// Helper function to find the index of the next question set
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

const submitFormData = async () => {
    try {
        if (checkInvalidInputs()) {
            return;
        }

        // Call the logging function with the appropriate parameters
        logQuestionAndResponse(schoolEnvFormData.value);

        // Log the test responses in a human-readable form
        console.log('Test Responses:');

        testResponses.logs.forEach(entry => {
            console.log('---------------------------------');
            console.log('Question:', entry.question);
            console.log('Set Name:', entry.setName);

            if (entry.substance) {
                console.log('Substance:', entry.substance);
            }

            if (entry.responses) {
                console.log('Responses:');

                entry.responses.forEach(response => {
                    console.log('  - Question:', response.question);
                    console.log('    Answers:', response.answers.join(', '));
                });
            } else {
                console.log('Response:', entry.response);
                console.log('Point:', entry.point);
            }

            if (entry.diagnosis) {
                console.log('Diagnosis:', entry.diagnosis);
            }

            console.log('---------------------------------');
        });

        // Submit form data
        const response = await axios.post(endpoints.submitCluster, schoolEnvFormData.value);

        // Check response status
        if (response.status === 200) {
            Swal.fire('Congratulations!', 'You have completed the test.', 'success');
            router.push('/student-dashboard');
        } else {
            Swal.fire('Error!', 'Failed to submit data', 'error');
        }

        // Clear stored responses after submission
        storedResponses.value = {};
    } catch (error) {
        Swal.fire('Error!', 'Failed to submit data', 'error');
    }
};



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
