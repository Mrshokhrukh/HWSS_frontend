<template>
    <div class="phq-container">
        <div class="question-header p-4 mb-4 rounded-lg">
            <h4 class="text-white mb-0">{{ PHQQuestion }}</h4>
        </div>

        <div class="questions-container">
            <!-- First two static questions -->
            <div class="question-card mb-4 p-4 rounded-lg shadow-sm" v-for="(question, index) in [
                'Little interest or pleasure in doing things',
                'Feeling down, depressed or hopeless'
            ]" :key="index">
                <div class="question-content">
                    <h6 class="question-text mb-3">{{ question }}</h6>
                    <div class="options-grid">
                        <div v-for="(option, optIndex) in currentQuestion[0].answers" :key="option.id"
                            class="option-item text-center">
                            <label class="radio-label">
                                <input type="radio" :value="optIndex" :v-model="index === 0 ? question1 : question2"
                                    required class="radio-input" />
                                <span class="option-text">{{ option.option }}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dynamic questions -->
            <div v-for="text in currentQuestion" :key="text" class="question-card mb-4 p-4 rounded-lg shadow-sm">
                <div class="question-content">
                    <h6 class="question-text mb-3">{{ text.text }}</h6>
                    <div class="options-grid">
                        <div v-for="option in currentQuestion[0].answers" :key="option.id"
                            class="option-item text-center">
                            <label class="radio-label">
                                <input type="radio" :value="option" @change="handleAnswerSelection(option, text)"
                                    :name="'question_' + text.id" required class="radio-input" />
                                <span class="option-text">{{ option.option }}</span>
                                <span class="d-none">{{ option.points }}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Results card -->
            <div class="results-card p-4 rounded-lg shadow-sm">
                <div class="result-row mb-2">
                    <strong>Total:</strong>
                    <span class="result-value-1">{{ !totalScore ? '0' : totalScore }}</span>
                </div>
                <div class="result-row">
                    <strong>Interpretation:</strong>
                    <span class="result-value" :class="interpretationClass">
                        {{ interpretation }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Navigation buttons -->
        <div class="footer d-flex mt-4">
            <button class="nav-button" @click="goBack">Back</button>
            <div class="flex-grow-1"></div>
            <button class="nav-button" @click="proceed">Next</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';

const emit = defineEmits(['goToNext', 'goBack']);

// Define reactive variables for storing selected options for static questions
const question1 = ref(null);
const question2 = ref(null);

// Compute total score based on selected options for all questions
const totalScore = computed(() => {
    let score = 0;
    score += parseInt(question1.value || 0);
    score += parseInt(question2.value || 0);

    for (const text of currentQuestion.value) {
        const selectedOption = text.selectedOption;
        if (selectedOption) {
            score += selectedOption.points;
        }
    }

    return score;
});


// Handle selection of answer for dynamic questions
const handleAnswerSelection = (option, text) => {
    text.selectedOption = option;
};

// Retrieve PHQ questions from injected data
const counselorScreeningQuestions = ref(inject('counselorScreeningQuestions'));
const currentQuestion = ref(counselorScreeningQuestions.value?.find(set => set.name === 'Case Screening').question_sets.find(set => set.name === 'PHQ9').questions);

// Define PHQ question
const PHQQuestion = ref('Over the last 2 weeks, how often have you been bothered by any of the following problems: ');

// Compute interpretation based on total score
const interpretation = computed(() => {
    if (totalScore.value >= 0 && totalScore.value <= 4 || totalScore.value === null || isNaN(totalScore.value)) {
        return 'Non or Minimal';
    } else if (totalScore.value >= 5 && totalScore.value <= 9) {
        return 'Mild';
    } else if (totalScore.value >= 10 && totalScore.value <= 14) {
        return 'Moderate';
    } else if (totalScore.value >= 15 && totalScore.value <= 18) {
        return 'Moderately Severe';
    } else {
        return 'Severe';
    }
});

// Compute interpretation class based on total score
const interpretationClass = computed(() => {
    if (totalScore.value >= 0 && totalScore.value <= 4 || totalScore.value === null || isNaN(totalScore.value)) {
        return 'bg-primary bg-opacity-50 text-primary';
    } else if (totalScore.value >= 5 && totalScore.value <= 9) {
        return 'bg-success bg-opacity-50 text-success';
    } else if (totalScore.value >= 10 && totalScore.value <= 14) {
        return 'bg-warning bg-opacity-50 text-warning';
    } else if (totalScore.value >= 15 && totalScore.value <= 19) {
        return 'bg-m-severe text-m-severe';
    } else {
        return 'bg-danger bg-opacity-50 text-danger';
    }
});

// Proceed to the next step
const proceed = () => {
    const responses = [];
    for (const text of currentQuestion.value) {
        const response = {
            question: text.text,
            selectedOption: text.selectedOption ? text.selectedOption.option : null,
            score: text.selectedOption ? text.selectedOption.points : 0
        };
        responses.push(response);
    }

    // Get total score and interpretation from computed properties
    const totalScoreValue = totalScore.value;
    const interpretationValue = interpretation.value;

    // Save responses, total score, and interpretation to local storage
    const data = { responses, totalScore: totalScoreValue, interpretation: interpretationValue };
    localStorage.setItem('PHQ_set_counselor_screening', JSON.stringify(data));

    // Emit the goToNext event
    emit('goToNext', 'PHQ9');
};
</script>

<style scoped>
.phq-container {
    max-width: 800px;
    margin: 0 auto;
}

.question-header {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    border-radius: 10px;
}

.question-card {
    background: white;
    border-radius: 10px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.question-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.question-text {
    color: #2B656F;
    font-weight: 500;
}

.options-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-top: 1rem;
}

.radio-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.radio-input {
    cursor: pointer;
    width: 1.5rem;
    height: 1.5rem;
    margin: 0;
    transition: transform 0.2s ease;
}

.radio-input:hover {
    transform: scale(1.1);
}

.option-text {
    font-size: 0.9rem;
    color: #4a5568;
}

.results-card {
    background: #f8fafc;
    border-radius: 10px;
}

.result-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
}

.result-value-1 {
    font-size: 1.2rem;
    font-weight: 500;
}

.nav-button {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: opacity 0.2s ease;
}

.nav-button:hover {
    opacity: 0.9;
}

/* Interpretation classes with gradient backgrounds */
.bg-primary {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%) !important;
    color: white !important;
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
}

.bg-success {
    background: linear-gradient(135deg, #34D399 0%, #059669 100%) !important;
    color: white !important;
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
}

.bg-warning {
    background: linear-gradient(135deg, #FBBF24 0%, #D97706 100%) !important;
    color: white !important;
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
}

.bg-m-severe {
    background: linear-gradient(135deg, #FF6347 0%, #DC2626 100%) !important;
    color: white !important;
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
}

.bg-danger {
    background: linear-gradient(135deg, #EF4444 0%, #991B1B 100%) !important;
    color: white !important;
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
}

@media (max-width: 640px) {
    .options-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>