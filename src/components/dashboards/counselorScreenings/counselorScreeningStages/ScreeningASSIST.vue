<template>
    <div v-if="currentQuestion" class="questionnaire-container">
        <div class="question-header">
            <h2 class="question-text">{{ currentQuestion.text }}</h2>
            <div class="options-legend">
                <span v-for="option in currentQuestion.answers" :key="option.id" class="option-label">
                    {{ option.option }}
                </span>
            </div>
        </div>

        <div class="substances-grid">
            <div v-for="(substance, index) in currentQuestion.substances" :key="index" class="substance-card"
                :class="{ 'disabled': shouldDisableSubstance(substance) || disabledSubstancesQ345.includes(substance) }">

                <div class="substance-name">
                    <template v-if="substance !== 'Other - specify'">
                        {{ substance }}
                    </template>
                    <template v-else>
                        <input type="text" class="other-input" placeholder="Other - specify" v-model="otherSubstance"
                            :readonly="isOtherSubstanceLocked"
                            :disabled="shouldDisableSubstance(substance) || disabledSubstancesQ345.includes(substance)" />
                    </template>
                </div>

                <div class="options-group">
                    <label v-for="option in currentQuestion.answers" :key="option.id" class="radio-label">
                        <input type="radio" :value="option" @change="handleAnswerSelection(option, substance)"
                            :name="'question_' + index"
                            :disabled="shouldDisableSubstance(substance) || disabledSubstancesQ345.includes(substance)" />
                        <span class="radio-custom"></span>
                    </label>
                </div>
            </div>
        </div>

        <div class="footer">
            <button class="nav-btn back-btn d-none" @click="goBack">Back</button>
            <div class="flex-grow-1"></div>
            <button v-if="isLastQuestion" class="nav-btn next-btn" @click="proceed">Next</button>
            <button v-else class="nav-btn next-btn" @click="jumpToNextQuestion">Next</button>
        </div>
    </div>
    <div v-else class="no-questions">
        <p>No more questions for the selected age group.</p>
    </div>
</template>


<script setup>
import { ref, computed, inject, reactive, watch } from 'vue';
import Swal from 'sweetalert2';

const emit = defineEmits(['goToNext', 'goBack']);
const substanceAnswered = reactive({});
const answers = reactive({});
const showAnswerAllPrompt = ref(false);
const currentQuestionIndex = ref(1);
const showConfetti = ref(false);
const answeredSubstances = ref({});
const testResponses = reactive({
    responses: [],
    logs: []
});
let alertShown = false;
const otherSubstance = ref('');

const isOtherSubstanceLocked = computed(() => {
    return currentQuestionIndex.value > 1;
});

const counselorScreeningQuestions = ref(inject('counselorScreeningQuestions'));

const disabledSubstances = computed(() => {
    const question1Responses = testResponses.question1Responses || {};

    if (currentQuestionIndex.value > 1) {
        return currentQuestion.value.substances.filter(substance => {
            return question1Responses[substance] === 'No';
        });
    }
    return [];
});

const disabledSubstancesQ345 = computed(() => {
    const question2Responses = testResponses.question2Responses || {};
    const currentQuestion = filteredQuestions.value[currentQuestionIndex.value - 1];

    // Get the index of question 68 in our filtered questions
    const q68Index = filteredQuestions.value.findIndex(q => q.id === 68);

    if (q68Index === -1) return []; // Question 68 not found

    // Only apply this disable logic for question 68 and the next 3 questions
    const currentPosition = currentQuestionIndex.value - 1; // 0-based index
    const isInRange = currentPosition >= q68Index && currentPosition <= q68Index + 3;

    if (isInRange) {
        return currentQuestion.substances.filter(substance => {
            return question2Responses[substance]?.id === 242;
        });
    }
    return [];
});

// Function to check if a substance should be disabled
const shouldDisableSubstance = (substance) => {
    // Question 67's disable logic applies throughout
    const isDisabledFromQ67 = disabledSubstances.value.includes(substance);

    // Question 68's disable logic applies to next 3 questions based on position
    const q68Index = filteredQuestions.value.findIndex(q => q.id === 68);
    const currentPosition = currentQuestionIndex.value - 1;
    const isInQ68Range = q68Index !== -1 &&
        currentPosition >= q68Index &&
        currentPosition <= q68Index + 3;

    const isDisabledFromQ68 = isInQ68Range && disabledSubstancesQ345.value.includes(substance);

    return isDisabledFromQ67 || isDisabledFromQ68;
};

const currentQuestionSetName = computed(() => {
    return 'ASSIST';
});

const handleAnswerSelection = (option, substance) => {
    if (!option || !substance) return;

    if (!testResponses.question2Responses) {
        testResponses.question2Responses = {};
    }

    if (currentQuestion.value.id === 68) {  // Check for specific question ID
        testResponses.question2Responses[substance] = {
            id: option.id,
            option: option.option
        };
        watchQuestion68Responses();
    }

    if (currentQuestion.value.id === 67) {
        if (!testResponses.question1Responses) {
            testResponses.question1Responses = {};
        }

        testResponses.question1Responses[substance] = {
            id: option.id,
            option: option.option
        };
    }

    if (!substance && currentQuestionSetName.value === 'ASSIST') {
        console.error('ASSIST: Null pointer exception in handleAnswerSelection. substance is null');
        return;
    }
    logQuestionAndResponse(option, substance);
    updateSubstanceAnswered(option, substance);
}

const currentQuestion = computed(() => {
    const questions = filteredQuestions.value;
    if (!questions.length) return null;

    const currentIndex = currentQuestionIndex.value - 1;
    if (currentIndex < 0 || currentIndex >= questions.length) {
        console.error('Invalid question index:', currentIndex);
        return null;
    }

    return questions[currentIndex];
});

const isLastQuestion = computed(() => {
    return currentQuestionIndex.value >= filteredQuestions.value.length;
});


let assistAnswer = [];

function logQuestionAndResponse(option, substance) {
    const questionText = currentQuestionText.value;
    if (!questionText) {
        console.error('ASSIST: Null pointer exception in logQuestionAndResponse. currentQuestionText.value is null');
        return;
    }
    const questionSetName = currentQuestionSetName.value;
    if (!questionSetName) {
        console.error('ASSIST: Null pointer exception in logQuestionAndResponse. currentQuestionSetName.value is null');
        return;
    }
    const response = option.option;
    if (!response) {
        console.error('ASSIST: Null pointer exception in logQuestionAndResponse. option.option is null');
        return;
    }
    const point = option.points;
    if (isNaN(point)) {
        console.error('ASSIST: NaN value in logQuestionAndResponse. option.points is', point);
        return;
    }

    const logEntry = {
        question: questionText,
        setName: questionSetName,
        response: response,
        point: point,
        substance: substance || null,
        diagnosis: null,
    };

    assistAnswer.push(logEntry);

    const answer = response.trim();

    // Check if the question is from the ASSIST set
    if (questionSetName === 'ASSIST') {
        if (currentQuestionIndex.value === 1) {
            if (!testResponses.question1Responses) {
                testResponses.question1Responses = {};
            }
            testResponses.question1Responses[substance] = answer;
        }

        // Update substanceAnswered based on the response
        if (answer) {
            logEntry.substance = substance;
            if (!substance) {
                console.error('ASSIST: Null pointer exception in logQuestionAndResponse. substance is null');
                return;
            }
            answers.substanceName = substance;
            if (!substanceAnswered) {
                console.error('ASSIST: Null pointer exception in logQuestionAndResponse. substanceAnswered is null');
                return;
            }
            substanceAnswered[substance] = answer === 'Yes';
        }
    }

    // Update or add the log entry to testResponses.responses array
    const index = findLoggedQuestionIndex(questionText, substance);
    if (index !== -1 && logEntry.substance === testResponses.responses[index].substance) {
        testResponses.responses[index] = logEntry;
    } else {
        if (!testResponses.responses) {
            console.error('ASSIST: Null pointer exception in logQuestionAndResponse. testResponses.responses is null');
            return;
        }
        testResponses.responses.push(logEntry);
    }
}

const proceed = () => {
    localStorage.setItem('ASSIST_set_counselor_screening', JSON.stringify(assistAnswer));
    emit('goToNext', 'ASSIST');
};

const currentQuestionText = computed(() => {
    return currentQuestion.value ? currentQuestion.value.text : '';
});

function findLoggedQuestionIndex(question, substance) {
    return testResponses.responses.findIndex(entry =>
        entry.question === question &&
        (entry.substance === undefined || entry.substance === substance)
    );
}

function saveSubstanceAnswersToLocalStorage() {
    localStorage.setItem('answeredSubstances', JSON.stringify(substanceAnswered));
    handleStorageChange();
}

function updateSubstanceCount() {
    const countYes = Object.values(substanceAnswered).filter(answer => answer).length;
    checkAllSubstancesAnswered(countYes);
}


const handleStorageChange = () => {
    const updatedAnsweredSubstances = JSON.parse(localStorage.getItem('answeredSubstances'));

    answeredSubstances.value = updatedAnsweredSubstances;

    if (Object.values(updatedAnsweredSubstances).every(state => state === false)) {
        showConfetti.value = true;
    }
};

function checkAllSubstancesAnswered(countYes) {
    const totalSubstances = Object.keys(substanceAnswered).length;
    if (countYes < totalSubstances) {
        showAnswerAllPrompt.value = false;
    }
}

const jumpToNextQuestion = () => {
    try {
        if (!checkInvalidInputs()) return;

        // Special handling for question 67
        if (currentQuestion.value?.id === 67) {
            Object.entries(testResponses.question1Responses || {}).forEach(([substance, response]) => {
                if (response.id === 241) {
                    substanceAnswered[substance] = false;
                }
            });
            saveSubstanceAnswersToLocalStorage();
        }
        if (currentQuestionIndex.value < filteredQuestions.value.length) {
            currentQuestionIndex.value++;
            checkAllSubstancesDisabled();
        }
    } catch (e) {
        console.error('jumpToNextQuestion threw an error', e);
        throw e;
    }
};

const goBack = () => {
    if (currentQuestionIndex.value > 1) {
        currentQuestionIndex.value -= 1;
    }
};

const checkInvalidInputs = () => {
    try {
        const invalidInputs = document.querySelectorAll('input:required:invalid');
        if (invalidInputs && invalidInputs.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Form',
                text: 'Please fill in all required fields before proceeding.',
            });
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error in checkInvalidInputs', error);
        return false;
    }
};

function updateSubstanceAnswered(option, substance) {
    let answer = option.option;
    if (!answer) {
        return;
    }
    answer = answer.trim();
    if (answer === 'Yes' || answer === 'No') {
        substanceAnswered[substance] = answer === 'Yes';
        if (answer === 'Yes' && substance === 'Other - specify') {
            const logEntry = {
                question: currentQuestionText.value,
                setName: currentQuestionSetName.value,
                response: answer,
                substance: localStorage.getItem('otherSubstanceName')
            };
            if (testResponses.responses) {
                testResponses.responses.push(logEntry);
            }
            if (answers) {
                answers.substanceName = localStorage.getItem('otherSubstanceName');
            }
        }
        saveSubstanceAnswersToLocalStorage();
        updateSubstanceCount();
    }
}

const filteredQuestions = computed(() => {
    // Get Case Screening set
    const caseScreeningSet = counselorScreeningQuestions.value.find(set =>
        set.name === 'Case Screening'
    );

    if (!caseScreeningSet) {
        console.error('Case Screening set not found');
        return [];
    }

    // Get CNE ASSIST set
    const cneAssistSet = caseScreeningSet.question_sets.find(set =>
        set.name === 'CNE ASSIST'
    );

    if (!cneAssistSet) {
        console.error('CNE ASSIST question set not found');
        return [];
    }

    // Get client age group, with validation
    const validAgeGroups = ['Below 14', '15 to 17', 'Above 18'];
    const clientAgeGroup = sessionStorage.getItem('clientAgeGroup');

    if (!validAgeGroups.includes(clientAgeGroup)) {
        console.error('Invalid age group:', clientAgeGroup);
        return [];
    }

    // First sort questions by ID
    const sortedQuestions = [...cneAssistSet.questions].sort((a, b) => {
        return Number(a.id) - Number(b.id);
    });

    // Then filter by age group
    const ageFilteredQuestions = sortedQuestions.filter(question => {
        if (!question.age_group_tags || question.age_group_tags.length === 0) {
            return true;
        }
        return question.age_group_tags.includes(clientAgeGroup);
    });

    const indexedQuestions = ageFilteredQuestions.map((question, index) => ({
        ...question,
        sequentialIndex: index + 1,
        originalIndex: sortedQuestions.indexOf(question) + 1
    }));
    return indexedQuestions;
});

const watchQuestion68Responses = () => {
    // Only proceed if we're on question 68
    if (currentQuestion.value?.id !== 68) return;

    const activeSubstances = currentQuestion.value.substances.filter(substance =>
        !disabledSubstances.value.includes(substance)
    );

    const question2Responses = testResponses.question2Responses || {};

    // Check if all active substances have been answered
    const allSubstancesAnswered = activeSubstances.every(substance =>
        question2Responses[substance]?.id !== undefined
    );

    if (!allSubstancesAnswered) return;

    // Check if ALL active substances are answered with 242
    const allNeverUsed = activeSubstances.every(substance =>
        question2Responses[substance]?.id === 242
    );

    if (allNeverUsed) {
        Swal.fire({
            title: 'No Recent Substance Use',
            text: 'The user has not used any substances in the past 3 months, skipping the next irrelevant questions.',
            icon: 'info',
            confirmButtonText: 'Proceed',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                currentQuestionIndex.value += 4; 
            }
        });
    }
};

function checkAllSubstancesDisabled() {
    if (alertShown) return; 
    if (currentQuestion.value) {
        const allSubstances = currentQuestion.value.substances;
        const enabledSubstances = allSubstances.filter(
            (substance) => !shouldDisableSubstance(substance)
        );

        if (enabledSubstances.length === 0) {
            alertShown = true;
            Swal.fire({
                title: 'No Substances Selected',
                text: 'No substances have been marked. The test for ASSIST will end here.',
                icon: 'info',
                confirmButtonText: 'Proceed',
                allowOutsideClick: false,
            }).then((result) => {
                if (result.isConfirmed) {
                    proceed();
                }
            });
        }
    }
}

watch(
    () => currentQuestion.value,
    () => {
        checkAllSubstancesDisabled();
    },
    { immediate: true }
);
</script>

<style scoped>
.questionnaire-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.5rem;
}

.question-header {
    margin-bottom: 2rem;
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    padding: 1.5rem;
    border-radius: 0.75rem;
    color: white;
}

.question-text {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    font-weight: 500;
}

.options-legend {
    display: flex;
    justify-content: space-around;
    gap: 1rem;
    margin-top: 0.5rem;
}

.option-label {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
}

.substances-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
}

.substance-card {
    background: white;
    border-radius: 0.75rem;
    padding: 1.25rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
}

.substance-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.substance-card.disabled {
    opacity: 0.2;
    background: #f5f5f5;
}

.substance-name {
    font-weight: 500;
    color: #2B656F;
    flex: 1;
}

.options-group {
    display: flex;
    gap: 2rem;
    align-items: center;
}

.radio-label {
    position: relative;
    cursor: pointer;
    padding: 0.5rem;
}

.radio-label input[type="radio"] {
    opacity: 0;
    position: absolute;
}

.radio-custom {
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 2px solid #2B656F;
    border-radius: 50%;
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease;
}

.radio-custom::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    width: 12px;
    height: 12px;
    background: #2B656F;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.radio-label input[type="radio"]:checked+.radio-custom::after {
    transform: translate(-50%, -50%) scale(1);
}

.radio-label:hover .radio-custom {
    border-color: #1D4851;
    box-shadow: 0 0 0 4px rgba(43, 101, 111, 0.1);
}

.other-input {
    width: 100%;
    max-width: 300px;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    font-size: 0.9rem;
}

.other-input:focus {
    outline: none;
    border-color: #2B656F;
    box-shadow: 0 0 0 2px rgba(43, 101, 111, 0.1);
}

.footer {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
}

.nav-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.next-btn {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    color: white;
}

.next-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(43, 101, 111, 0.2);
}

.back-btn {
    background: transparent;
    border: 2px solid #2B656F;
    color: #2B656F;
}

.back-btn:hover {
    background: rgba(43, 101, 111, 0.1);
}

.no-questions {
    text-align: center;
    padding: 3rem;
    color: #666;
}

@media (max-width: 768px) {
    .questionnaire-container {
        padding: 1rem;
    }

    .substance-card {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }

    .options-group {
        justify-content: center;
    }
}
</style>