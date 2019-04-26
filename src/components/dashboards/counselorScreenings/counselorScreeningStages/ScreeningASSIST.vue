<template>
    <div>
        <table class="table mb-4 table-borderless">
            <thead class="border-bottom align-middle">
                <tr class="text-capitalize">
                    <th class="text-capitalize fs-6 text-black">{{ currentQuestion.text }}</th>
                    <th v-for="option in currentQuestion.answers" :key="option.id" class="text-center">
                        {{ option.option }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(substance, index) in currentQuestion.substances" :key="index">
                    <td class="text-capitalize"
                        :class="{ 'text-secondary': shouldDisableSubstance(substance) || disabledSubstancesQ345.includes(substance) }">

                        <template v-if="substance !== 'Other - specify'">
                            {{ substance }}
                        </template>
                        <template v-else>
                            <input type="text" placeholder="Other - specify" v-model="otherSubstance"
                                :readonly="isOtherSubstanceLocked"
                                :disabled="shouldDisableSubstance(substance) || disabledSubstancesQ345.includes(substance)">
                        </template>
                    </td>
                    <td v-for="option in currentQuestion.answers" :key="option.id" class="text-center">
                        <input type="radio" :value="option" @change="handleAnswerSelection(option, substance)"
                            :name="'question_' + index"
                            :disabled="shouldDisableSubstance(substance) || disabledSubstancesQ345.includes(substance)" />
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="footer d-flex">
            <button class="btn hwss-btn d-none" @click="goBack">Back</button>
            <div class="flex-grow-1"></div> <!-- This ensures the buttons span all the width -->
            <button v-if="isLastQuestion" class="btn hwss-btn" @click="proceed">Next</button>
            <button v-else class="btn hwss-btn" @click="jumpToNextQuestion">Next</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, inject, reactive } from 'vue';
// import ConfettiExplosion from "vue-confetti-explosion";
import Swal from 'sweetalert2';

const emit = defineEmits(['goToNext', 'goBack']);
const substanceAnswered = reactive({});
// const currentQuestionIndex = ref(0);
const questions = ref([]);
const answers = reactive({});
const showAnswerAllPrompt = ref(false);
const currentQuestionIndex = ref(1);
const showConfetti = ref(false);
const answeredSubstances = ref({});
const testResponses = reactive({
    responses: [],
    logs: []
});

const otherSubstance = ref('');

const isOtherSubstanceLocked = computed(() => {
    return currentQuestionIndex.value > 1;
});

const disabledSubstances = computed(() => {
    // Get the user's responses to question 1 from testResponses
    const question1Responses = testResponses.question1Responses || {};

    // Filter the substances based on the user's responses
    const disabledSubstances = currentQuestion.value.substances.filter(substance => {
        return question1Responses[substance] === 'No';
    });

    return disabledSubstances;
});

const disabledSubstancesQ345 = computed(() => {
    // Get the user's responses to question 2 from testResponses
    const question2Responses = testResponses.question2Responses || {};

    // Filter the substances based on the user's responses to question 2
    const disabledSubstances = currentQuestion.value.substances.filter(substance => {
        return question2Responses[substance] === 'Never, not used in the last 3 months';
    });

    return disabledSubstances;
});

// Function to check if a substance should be disabled
const shouldDisableSubstance = (substance) => {
    return disabledSubstances.value.includes(substance);
};

const currentQuestionSetName = computed(() => {
    return 'ASSIST';
});

const totalScore = computed(() => {
    let score = 0;
    for (const text of currentQuestion.value) {
        const selectedOption = text.selectedOption;
        if (selectedOption !== undefined) {
            score += selectedOption.points;
        }
    }
    return score;
});

const handleAnswerSelection = (option, substance) => {
    if (!option) {
        console.error('ASSIST: Null pointer exception in handleAnswerSelection. option is null');
        return;
    }
    if (!substance && currentQuestionSetName.value === 'ASSIST') {
        console.error('ASSIST: Null pointer exception in handleAnswerSelection. substance is null');
        return;
    }
    logQuestionAndResponse(option, substance);
    updateSubstanceAnswered(option, substance);
}

const counselorScreeningQuestions = ref(inject('counselorScreeningQuestions'));
const questionsWithIndex = counselorScreeningQuestions.value?.find(set => set.name === 'Case Screening').question_sets.find(set => set.name === 'CNE ASSIST').questions.map((question, index) => ({
    ...question,
    index: index + 1
}));

const currentQuestion = computed(() => {
    return questionsWithIndex.find(question => question.index === currentQuestionIndex.value);
});

const isLastQuestion = computed(() => {
    return currentQuestionIndex.value === questionsWithIndex.length;
});

// eslint-disable-next-line no-unused-vars
const interpretation = computed(() => {
    if (totalScore.value >= 0 && totalScore.value <= 4) {
        return 'Minimal';
    } else if (totalScore.value >= 5 && totalScore.value <= 9) {
        return 'Mild';
    } else if (totalScore.value >= 10 && totalScore.value <= 14) {
        return 'Moderate';
    } else {
        return 'Severe';
    }
});

// eslint-disable-next-line no-unused-vars
const interpretationClass = computed(() => {
    if (totalScore.value >= 0 && totalScore.value <= 4) {
        return 'bg-primary bg-opacity-50 text-primary';
    } else if (totalScore.value >= 5 && totalScore.value <= 9) {
        return 'bg-success bg-opacity-50 text-success';
    } else if (totalScore.value >= 10 && totalScore.value <= 14) {
        return 'bg-warning bg-opacity-50 text-warning';
    } else {
        return 'bg-danger bg-opacity-50 text-danger';
    }
});

// eslint-disable-next-line no-unused-vars

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
        substance: substance || null, // Set substance to null if not provided
        diagnosis: null,
    };

    // Push the logEntry object into the assistAnswer array
    assistAnswer.push(logEntry);

    const answer = response.trim();

    // Check if the question is from the ASSIST set
    if (questionSetName === 'ASSIST') {
        // Store the response to question 1 in question1Responses object
        if (currentQuestionIndex.value === 1) {
            // Initialize question1Responses if not already initialized
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
        console.log('Log Entry Replacing (same substance):', logEntry);
        testResponses.responses[index] = logEntry;
    } else {
        console.log('Log Entry:', logEntry);
        // Log even if substance is different
        console.log('(Substance different from existing entry)');
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

const jumpToNextQuestion = () => {
    try {
        if (!checkInvalidInputs()) {
            const allSubstancesNo = Object.values(substanceAnswered).every(answer => answer === 'No' || answer === 'Yes');
            if (allSubstancesNo) {
                jumpToNextRelevantSet('ASSIST');
            }
            currentQuestionIndex.value++;
        }
        currentQuestionIndex.value++;
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
        if (invalidInputs == null) {
            console.error('InvalidInputs is null');
            return false;
        }
        if (invalidInputs.length > 0) {
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
</script>

<style scoped>
.bg-m-severe {
    background: rgba(255, 99, 71, 0.5) !important;
}

.text-m-severe {
    color: tomato !important;
}

input[type="radio"] {
    scale: 1.5;
}
</style>