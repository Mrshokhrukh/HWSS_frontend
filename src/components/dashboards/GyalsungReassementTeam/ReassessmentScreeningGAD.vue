<template>
    <div class="ace-container">
        <div class="question-header p-4 mb-4 rounded-lg">
            <h4 class="text-white mb-0">{{ GADQuestion }}</h4>
        </div>

        <div class="questions-container">
            <!-- Static questions from GAD-2 -->
            <div v-for="(question, index) in staticQuestions" :key="'static-' + index"
                class="question-card mb-4 p-4 rounded-lg shadow-sm">
                <div class="question-content">
                    <h3 class="question-text mb-3">{{ question.text }}</h3>
                    <div class="options-grid">
                        <div v-for="option in question.answers" :key="option.id" class="option-item text-center">
                            <label class="radio-label">
                                <input type="radio" :value="option" v-model="staticAnswers[index]" 
                                    :name="'static_question_' + index" required class="radio-input" />
                                <span class="option-text">{{ option.option }}</span>
                                <span class="d-none">{{ option.points }}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dynamic questions from GAD-7 -->
            <div v-for="text in dynamicQuestions" :key="text.id" class="question-card mb-4 p-4 rounded-lg shadow-sm">
                <div class="question-content">
                    <h3 class="question-text mb-3">{{ text.text }}</h3>
                    <div class="options-grid">
                        <div v-for="option in text.answers" :key="option.id" class="option-item text-center">
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

const staticAnswers = ref([null, null]);
const counselorScreeningQuestions = inject('counselorScreeningQuestions', ref(null));

const getQuestionSet = (setName) => {
    if (!counselorScreeningQuestions?.value) return [];
    const screeningSet = counselorScreeningQuestions.value.find(set => set.name === 'Gyalsung Screening');
    if (!screeningSet) return [];
    const questionSet = screeningSet.question_sets.find(set => set.name === setName);
    return questionSet ? questionSet.questions : [];
};

// *** FIXED DATA PATH ***
// Get the first 2 questions from GAD2 set
const staticQuestions = computed(() => getQuestionSet('GAD2'));
// Get the remaining 5 questions from GAD7 set
const dynamicQuestions = computed(() => getQuestionSet('GAD7'));


const GADQuestion = ref('Over the last 2 weeks, how often have you been bothered by any of the following problems: ');

const totalScore = computed(() => {
    let score = 0;
    
    // Add static answers score
    staticAnswers.value.forEach(answer => {
        if (answer) score += answer.points;
    });
    
    // Add dynamic answers score
    dynamicQuestions.value.forEach(question => {
        if (question.selectedOption) {
            score += question.selectedOption.points;
        }
    });
    
    return score;
});

const interpretation = computed(() => {
    const score = totalScore.value;
    if (score >= 0 && score <= 4) return 'Minimal';
    if (score >= 5 && score <= 9) return 'Mild';
    if (score >= 10 && score <= 14) return 'Moderate';
    return 'Severe';
});

const interpretationClass = computed(() => {
    const score = totalScore.value;
    if (score >= 0 && score <= 4) return 'bg-primary';
    if (score >= 5 && score <= 9) return 'bg-success';
    if (score >= 10 && score <= 14) return 'bg-warning';
    return 'bg-danger';
});

const handleAnswerSelection = (option, question) => {
    question.selectedOption = option;
};

const goBack = () => {
    emit('goBack');
};

const proceed = () => {
    const responses = [];
    
    // Include static questions
    staticQuestions.value.forEach((question, index) => {
        const selectedOption = staticAnswers.value[index];
        responses.push({
            question: question.text,
            selectedOption: selectedOption ? selectedOption.option : null,
            score: selectedOption ? selectedOption.points : 0
        });
    });
    
    // Include dynamic questions
    dynamicQuestions.value.forEach(question => {
        responses.push({
            question: question.text,
            selectedOption: question.selectedOption ? question.selectedOption.option : null,
            score: question.selectedOption ? question.selectedOption.points : 0
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
.ace-container {
    max-width: 800px;
    margin: 0 auto;
}

.question-header {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    border-radius: 10px;
}

.question-card {
    background: white;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border-radius: 10px;
}

.question-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.question-text {
    color: #2B656F;
    font-size: 1.1rem;
    font-weight: 500;
    line-height: 1.5;
}

.options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
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

/* Additional styles for GAD7-specific needs */
.question-card {
    background: white;
    border-color: rgba(43, 101, 111, 0.1);
}

.question-text {
    color: #2B656F;
    font-weight: 500;
}

@media (max-width: 640px) {
    .options-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .question-text {
        font-size: 1rem;
    }
}
</style>