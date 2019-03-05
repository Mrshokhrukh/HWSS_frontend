<template>
    <div class="container-fluid screening-test p-0">
        <div class="card">
            <!-- <div class="card-header text-center">
                <h4>{{ currentQuestionSetName }}</h4>
            </div> -->
            <div class="card-body">
                <div class="progress-container py-3">
                    <div class="progress" style="height: 10px; border-radius: 5px">
                        <div class="progress-bar" role="progressbar" :style="{ width: progressPercentage + '%' }"
                            aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
                <div v-if="showBgGreen" class="card p-3 my-3 text-center bg-green">
                    <h4>Over the last 2 weeks, how often have you been bothered by any of the following problems:</h4>
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
                                {{ option.option }}
                            </button>
                        </div>
                    </div>
                </div>
                <button v-if="isLastQuestion" @click="submitTest" class="btn btn-success mt-2">Submit</button>
            </div>
            <div class="card-footer text-center">
                <button @click="goBack" class="btn rounded-btn back-button">Back</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useProgressStore } from '@/stores/progressStore';
import Swal from 'sweetalert2';
import axios from 'axios';
import endpoints from "@/api";
import fallbackIcon from "@/assets/images/question.png";

const progressStore = useProgressStore();

// Initial setup for reactive variables
const currentQuestionIndex = ref(0);
const questions = ref([]);

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
});

// Save progress whenever the current question index changes
watch(currentQuestionIndex, (newIndex) => {
    progressStore.setQuestionIndex(newIndex);
    progressStore.saveProgress();
});

// Computed properties for current question details
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
const currentQuestionSetName = computed(() => currentQuestion.value?.setName || '');


// Determine if the bg-green area should be shown
const showBgGreen = computed(() => ['PHQ2', 'PHQ9', 'GAD2', 'GAD7'].includes(currentQuestionSetName.value));

// Compute the icon URL, adjusting for local development or production environment
const iconURL = computed(() => {
    const iconPath = currentQuestion.value?.icon || '';
    if (iconPath) {
        return location.hostname === 'localhost' ? `http://localhost:8080${iconPath}` : `http://172.30.3.16${iconPath}`;
    } else {
        return fallbackIcon
    }
});

// Remove the common phrase from the question text
const processedQuestionText = computed(() => {
    // This regex is case-insensitive (`i` flag) and allows for a colon or a question mark at the end
    const regex = /over the last 2 weeks, how often have you been bothered by any of the following problems[:?]\s*/i;
    return currentQuestion.value?.text.replace(regex, '');
});

// Calculate progress percentage
const progressPercentage = computed(() => (currentQuestionIndex.value / (questions.value.length - 1)) * 100);

// Determine if the current question is the last one
const isLastQuestion = computed(() => currentQuestionIndex.value === (questions.value.length - 1));

// Handle answer selection and automatically move to the next question
function handleAnswerSelection(option) {
    progressStore.setAnswer(currentQuestion.value.id, option);

    // Use setTimeout to delay the transition
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
                    jumpToNextRelevantSet();
                }
            });
        } else if (currentQuestionSetName.value === 'PHQ2' && progressStore.shouldSkipPHQ9) {
            jumpToNextRelevantSet('PHQ9');
        } else if (currentQuestionSetName.value === 'GAD2' && progressStore.shouldSkipGAD7) {
            jumpToNextRelevantSet('GAD7');
        } else {
            // Move to next question after a 500ms delay
            currentQuestionIndex.value++;
        }
    }, 500); // 500ms delay
}

// A method to jump to the next relevant set based on conditions
function jumpToNextRelevantSet(setToSkip) {
    const nextIndex = questions.value.findIndex(
        (question, index) => question.setName !== setToSkip && index > currentQuestionIndex.value
    );
    if (nextIndex !== -1) {
        currentQuestionIndex.value = nextIndex;
    } else {
        // No more questions, or logic needs adjustment
        console.error(`No question set found after skipping ${setToSkip}`);
    }
}

// Navigate back to the previous question
function goBack() {
    if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--;
    }
}

// Submit the test and show a success message
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
</script>


<style scoped>
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
</style>
