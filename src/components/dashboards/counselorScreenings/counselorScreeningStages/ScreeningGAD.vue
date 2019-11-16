<template>
    <div >
        <div class="question-header p-4 mb-4 rounded-lg">
            <h4 class="text-white mb-0">{{ GADQuestion }}</h4>
        </div>

        <div class="questions-container">
            <!-- Static questions -->
            <div v-for="(question, index) in staticQuestions" :key="index"
                class="question-card mb-4 p-4 rounded-lg shadow-sm">
                <div class="question-content">
                    <h6 class="question-text mb-3">{{ question }}</h6>
                    <div class="options-grid">
                        <div v-for="option in defaultAnswers" :key="option.id" class="option-item text-center">
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
            <div v-for="text in currentQuestion" :key="text.id" class="question-card mb-4 p-4 rounded-lg shadow-sm">
                <div class="question-content">
                    <h6 class="question-text mb-3">{{ text.text }}</h6>
                    <div class="options-grid">
                        <div v-for="option in defaultAnswers" :key="option.id" class="option-item text-center">
                            <label class="radio-label">
                                <input type="radio" :value="option" @change="handleAnswerSelection(option, text)"
                                    :name="'question_' + text.id" required class="radio-input" />
                                <span class="option-text">{{ option.option }}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Results card -->
            <div class="results-card p-4 rounded-lg shadow-sm">
                <div class="result-row mb-2">
                    <strong>Total:</strong>
                    <span class="result-value">{{ totalScore }}</span>
                </div>
                <div class="result-row">
                    <strong>Interpretation:</strong>
                    <span class="result-value" :class="interpretationClass">
                        {{ interpretation }}
                    </span>
                </div>
            </div>
        </div>

        <div class="footer d-flex mt-4">
            <button class="nav-button" @click="$emit('goBack')">Back</button>
            <div class="flex-grow-1"></div>
            <button class="nav-button" @click="proceed">Next</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';

const emit = defineEmits(['goToNext', 'goBack']);

// Initialize static questions with default data to prevent blank screen
const staticQuestions = [
    'Feeling nervous, anxious, or on edge',
    'Not being able to stop or control worrying'
];

const defaultAnswers = [
    { id: 0, option: "Not at all", points: 0 },
    { id: 1, option: "Several days", points: 1 },
    { id: 2, option: "More than half the days", points: 2 },
    { id: 3, option: "Nearly everyday", points: 3 }
];

// Define fallback questions in case injection fails
const fallbackQuestions = [
    { id: 14, text: 'Worrying too much about different things', answers: defaultAnswers },
    { id: 15, text: 'Trouble relaxing', answers: defaultAnswers },
    { id: 16, text: 'Being so restless that it is hard to sit still', answers: defaultAnswers },
    { id: 17, text: 'Becoming easily annoyed or irritable', answers: defaultAnswers },
    { id: 18, text: 'Feeling afraid, as if something awful might happen', answers: defaultAnswers }
];

const staticAnswers = ref([null, null]);
const counselorScreeningQuestions = inject('counselorScreeningQuestions', ref(null));

// Computed property with fallback
const currentQuestion = computed(() => {
    if (!counselorScreeningQuestions?.value) {
        return fallbackQuestions;
    }
    
    const caseScreening = counselorScreeningQuestions.value.find(set => set.name === 'Case Screening');
    if (!caseScreening) {
        return fallbackQuestions;
    }
    
    const gad7Set = caseScreening.question_sets.find(set => set.name === 'GAD7');
    if (!gad7Set?.questions) {
        return fallbackQuestions;
    }
    
    return gad7Set.questions;
});

const GADQuestion = ref('Over the last 2 weeks, how often have you been bothered by any of the following problems: ');

// Compute total score with null check
const totalScore = computed(() => {
    let score = 0;
    
    // Add static answers
    score += parseInt(staticAnswers.value[0] || 0);
    score += parseInt(staticAnswers.value[1] || 0);
    
    // Add dynamic answers
    for (const text of currentQuestion.value) {
        if (text.selectedOption) {
            score += parseInt(text.selectedOption.points || 0);
        }
    }
    
    return score;
});

const interpretation = computed(() => {
    const score = totalScore.value;
    if (score >= 0 && score <= 4 || score === null || isNaN(score)) {
        return 'Minimal';
    } else if (score >= 5 && score <= 9) {
        return 'Mild';
    } else if (score >= 10 && score <= 14) {
        return 'Moderate';
    } else {
        return 'Severe';
    }
});

const interpretationClass = computed(() => {
    const score = totalScore.value;
    if (score >= 0 && score <= 4 || score === null || isNaN(score)) {
        return 'bg-primary bg-opacity-50 text-primary';
    } else if (score >= 5 && score <= 9) {
        return 'bg-success bg-opacity-50 text-success';
    } else if (score >= 10 && score <= 14) {
        return 'bg-warning bg-opacity-50 text-warning';
    } else {
        return 'bg-danger bg-opacity-50 text-danger';
    }
});

const handleAnswerSelection = (option, text) => {
    if (text) {
        text.selectedOption = option;
    }
};

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
    
    const data = {
        responses,
        totalScore: totalScore.value,
        interpretation: interpretation.value
    };
    
    localStorage.setItem('GAD_set_counselor_screening', JSON.stringify(data));
    emit('goToNext', 'GAD7');
};
</script>

<style scoped>
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