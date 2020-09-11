<template>
    <div class="questionnaire-container">
        <div class="question-header">
            <h2 class="question-text">{{ mainQuestion }}</h2>
        </div>

        <div v-if="currentQuestions.length > 0" class="questions-container">
            <!-- Questions -->
            <div v-for="question in currentQuestions" :key="question.id" class="question-card">
                <div class="question-content">
                    <h3 class="question-title">{{ question.text }}</h3>
                    <div class="options-group">
                        <label v-for="option in question.answers" :key="option.id" class="radio-label">
                            <input 
                                type="radio" 
                                :value="option" 
                                @change="handleAnswerSelection(option, question)"
                                :name="'question_' + question.id" 
                                required 
                                class="radio-input" 
                            />
                            <span class="radio-custom"></span>
                            <span class="radio-text">{{ option.option }}</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Results card -->
            <div class="results-card">
                <div class="results-header">
                    <h3>Assessment Results</h3>
                </div>
                <div class="results-content">
                    <div class="result-item">
                        <span class="result-label">Total Score (Number of "Yes" answers):</span>
                        <span class="result-value score-badge">{{ totalScore }}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Interpretation:</span>
                        <span class="result-value interpretation-badge" :class="interpretationClass">
                            {{ interpretation }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="no-questions">
            <div class="loading-spinner">
                <div class="spinner"></div>
            </div>
            <p>Psychometric questions are not available or loading...</p>
        </div>

        <!-- Navigation buttons -->
        <div class="footer">
            <button class="nav-btn back-btn" @click="$emit('goBack')">
                <i class="fas fa-arrow-left"></i>
                Back
            </button>
            <div class="flex-grow-1"></div>
            <button class="nav-btn next-btn" @click="proceed">
                Next
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';

const emit = defineEmits(['goToNext', 'goBack']);

const counselorScreeningQuestions = inject('counselorScreeningQuestions', ref(null));
const mainQuestion = ref('Please answer the following questions:');

// *** CORRECTED DATA FETCHING FOR PSYCHOMETRIC ***
const currentQuestions = computed(() => {
    if (!counselorScreeningQuestions?.value) {
        return [];
    }
    
    // 1. Find the main "Gyalsung Screening" set
    const screeningSet = counselorScreeningQuestions.value.find(set => set.name === 'Gyalsung Screening');
    if (!screeningSet) {
        return [];
    }
    
    // 2. Find the "Psychometric" question set within it
    const psychometricSet = screeningSet.question_sets.find(set => set.name === 'Psychometric');
    if (!psychometricSet?.questions) {
        return [];
    }
    
    // 3. Return the questions, ensuring each has a placeholder for the selected answer
    return psychometricSet.questions.map(q => ({ ...q, selectedOption: null }));
});

// Calculate the total score by summing points from selected options
const totalScore = computed(() => {
    return currentQuestions.value.reduce((score, question) => {
        return score + (question.selectedOption ? question.selectedOption.points : 0);
    }, 0);
});

// *** CUSTOM INTERPRETATION FOR PSYCHOMETRIC ***
const interpretation = computed(() => {
    const score = totalScore.value;
    if (score === 0) {
        return 'No psychotic symptoms indicated';
    } else if (score >= 1 && score <= 2) {
        return 'Some symptoms indicated, further evaluation may be needed';
    } else {
        return 'Significant symptoms indicated, further evaluation is recommended';
    }
});

const interpretationClass = computed(() => {
    const score = totalScore.value;
    if (score === 0) {
        return 'success';
    } else if (score >= 1 && score <= 2) {
        return 'warning';
    } else {
        return 'danger';
    }
});

const handleAnswerSelection = (option, question) => {
    question.selectedOption = option;
};

const proceed = () => {
    const responses = currentQuestions.value.map(question => ({
        question: question.text,
        selectedOption: question.selectedOption ? question.selectedOption.option : null,
        score: question.selectedOption ? question.selectedOption.points : 0
    }));
    
    const data = {
        responses,
        totalScore: totalScore.value,
        interpretation: interpretation.value
    };
    
    localStorage.setItem('Psychometric_set_counselor_screening', JSON.stringify(data));
    emit('goToNext', 'Psychometric');
};
</script>

<style scoped>
.questionnaire-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 1rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.question-header {
    margin-bottom: 2rem;
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    padding: 2rem;
    border-radius: 1rem;
    color: white;
    box-shadow: 0 8px 32px rgba(43, 101, 111, 0.3);
    position: relative;
    overflow: hidden;
}

.question-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
    pointer-events: none;
}

.question-text {
    font-size: 1.4rem;
    margin: 0;
    font-weight: 600;
    line-height: 1.4;
    position: relative;
    z-index: 1;
}

.questions-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.question-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    transition: all 0.3s ease;
    position: relative;
}

.question-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    border-color: rgba(43, 101, 111, 0.2);
}

.question-content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.question-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2B656F;
    margin: 0;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #f0f0f0;
    line-height: 1.4;
}

.options-group {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-start;
    max-width: 300px;
}

.radio-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #f8f9fa;
    border: 2px solid transparent;
    position: relative;
    flex: 1;
    justify-content: center;
    min-width: 80px;
}

.radio-label:hover {
    background: #e8f4f6;
    border-color: rgba(43, 101, 111, 0.2);
}

.radio-label:has(input[type="radio"]:checked) {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    color: white;
    border-color: #2B656F;
    box-shadow: 0 4px 15px rgba(43, 101, 111, 0.3);
}

.radio-input {
    display: none;
}

.radio-custom {
    width: 18px;
    height: 18px;
    border: 2px solid #d0d0d0;
    border-radius: 50%;
    position: relative;
    transition: all 0.3s ease;
    background: white;
    flex-shrink: 0;
}

.radio-label:hover .radio-custom {
    border-color: #2B656F;
}

.radio-label:has(input[type="radio"]:checked) .radio-custom {
    border-color: white;
    background: white;
}

.radio-custom::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2B656F;
    transition: transform 0.3s ease;
}

.radio-label:has(input[type="radio"]:checked) .radio-custom::after {
    transform: translate(-50%, -50%) scale(1);
    background: #2B656F;
}

.radio-text {
    font-size: 0.95rem;
    font-weight: 500;
    line-height: 1.3;
}

.results-card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    border: 2px solid rgba(43, 101, 111, 0.1);
}

.results-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 1.5rem;
    border-bottom: 2px solid #e0e0e0;
}

.results-header h3 {
    margin: 0;
    color: #2B656F;
    font-size: 1.2rem;
    font-weight: 600;
}

.results-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f0f0f0;
}

.result-item:last-child {
    border-bottom: none;
}

.result-label {
    font-weight: 600;
    color: #495057;
    font-size: 0.95rem;
}

.result-value {
    font-weight: 500;
}

.score-badge {
    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    min-width: 40px;
    text-align: center;
}

.interpretation-badge {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
    color: white;
    text-align: center;
    min-width: 120px;
    font-size: 0.85rem;
    line-height: 1.2;
}

.interpretation-badge.success {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.interpretation-badge.warning {
    background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
}

.interpretation-badge.danger {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.footer {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 2rem 0;
    border-top: 2px solid #f0f0f0;
}

.flex-grow-1 {
    flex-grow: 1;
}

.nav-btn {
    padding: 0.875rem 2rem;
    border: none;
    border-radius: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 120px;
    justify-content: center;
}

.back-btn {
    background: #6c757d;
    color: white;
}

.back-btn:hover {
    background: #5a6268;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
}

.next-btn {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    color: white;
}

.next-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(43, 101, 111, 0.4);
}

.no-questions {
    text-align: center;
    padding: 4rem 2rem;
    color: #6c757d;
}

.loading-spinner {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #2B656F;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
    .questionnaire-container {
        padding: 0.5rem;
    }
    
    .question-header {
        padding: 1.5rem;
    }
    
    .question-text {
        font-size: 1.2rem;
    }
    
    .question-card {
        padding: 1rem;
    }
    
    .question-title {
        font-size: 1rem;
    }
    
    .options-group {
        max-width: none;
        justify-content: center;
    }
    
    .result-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
        text-align: left;
    }
    
    .interpretation-badge,
    .score-badge {
        align-self: flex-end;
    }
    
    .nav-btn {
        padding: 0.75rem 1.5rem;
        font-size: 0.9rem;
    }
}

@media (max-width: 480px) {
    .footer {
        flex-direction: column;
        gap: 1rem;
    }
    
    .nav-btn {
        width: 100%;
        max-width: 200px;
    }
    
    .options-group {
        flex-direction: column;
        max-width: 200px;
        margin: 0 auto;
    }
    
    .radio-label {
        justify-content: flex-start;
    }
    
    .results-content {
        padding: 1rem;
    }
    
    .results-header {
        padding: 1rem;
    }
}
</style>