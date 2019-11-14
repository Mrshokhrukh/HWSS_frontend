<template>
    <div class="gad-container">
        <div class="question-header p-4 mb-4 rounded-lg">
            <h4 class="text-white mb-0">{{ GADQuestion }}</h4>
        </div>

        <div class="questions-container">
            <!-- First two static questions -->
            <div v-for="(question, index) in staticQuestions" :key="index"
                class="question-card mb-4 p-4 rounded-lg shadow-sm">
                <div class="question-content">
                    <h6 class="question-text mb-3">{{ question }}</h6>
                    <div class="options-grid">
                        <div v-for="option in currentQuestion[0]?.answers || []" :key="option.id"
                            class="option-item text-center">
                            <label class="radio-label">
                                <input type="radio" :value="option.points" v-model="staticAnswers[index]" required
                                    class="radio-input" />
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
                    <span class="result-value">{{ !totalScore ? '0' : totalScore }}</span>
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
const staticQuestions = [
    'Feeling nervous, anxious, or on edge',
    'Not being able to stop or control worrying'
];

const staticAnswers = ref([null, null]);

// Compute total score based on selected options for all questions
const totalScore = computed(() => {
    let score = 0;
    score += parseInt(staticAnswers.value[0] || 0);
    score += parseInt(staticAnswers.value[1] || 0);

    for (const text of currentQuestion.value) {
        const selectedOption = text.selectedOption;
        if (selectedOption) {
            score += selectedOption.points;
        }
    }

    return score;
});

const handleAnswerSelection = (option, text) => {
    text.selectedOption = option;
};

const counselorScreeningQuestions = inject('counselorScreeningQuestions');

const currentQuestion = computed(() => {
    if (!counselorScreeningQuestions || !counselorScreeningQuestions.value) {
        return [];
    }
    const caseScreening = counselorScreeningQuestions.value.find(set => set.name === 'Case Screening');
    if (!caseScreening) {
        return [];
    }
    const gad7Set = caseScreening.question_sets.find(set => set.name === 'GAD7');
    if (!gad7Set) {
        return [];
    }
    return gad7Set.questions;
});

const GADQuestion = ref('Over the last 2 weeks, how often have you been bothered by any of the following problems: ');

const interpretation = computed(() => {
    if (totalScore.value >= 0 && totalScore.value <= 4 || totalScore.value === null || isNaN(totalScore.value)) {
        return 'Minimal';
    } else if (totalScore.value >= 5 && totalScore.value <= 9) {
        return 'Mild';
    } else if (totalScore.value >= 10 && totalScore.value <= 14) {
        return 'Moderate';
    } else {
        return 'Severe';
    }
});

const interpretationClass = computed(() => {
    if (totalScore.value >= 0 && totalScore.value <= 4 || totalScore.value === null || isNaN(totalScore.value)) {
        return 'bg-primary bg-opacity-50 text-primary';
    } else if (totalScore.value >= 5 && totalScore.value <= 9) {
        return 'bg-success bg-opacity-50 text-success';
    } else if (totalScore.value >= 10 && totalScore.value <= 14) {
        return 'bg-warning bg-opacity-50 text-warning';
    } else {
        return 'bg-danger bg-opacity-50 text-danger';
    }
});

const proceed = () => {
    const responses = [];

    // Include static questions
    staticQuestions.forEach((question, index) => {
        responses.push({
            question,
            selectedOption: staticAnswers.value[index],
            score: parseInt(staticAnswers.value[index] || 0)
        });
    });

    // Include dynamic questions
    currentQuestion.value.forEach(text => {
        responses.push({
            question: text.text,
            selectedOption: text.selectedOption ? text.selectedOption.option : null,
            score: text.selectedOption ? text.selectedOption.points : 0
        });
    });

    const totalScoreValue = totalScore.value;
    const interpretationValue = interpretation.value;

    const data = { responses, totalScore: totalScoreValue, interpretation: interpretationValue };
    localStorage.setItem('GAD_set_counselor_screening', JSON.stringify(data));

    emit('goToNext', 'GAD7');
};

</script>

<style scoped>
.gad-container {
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