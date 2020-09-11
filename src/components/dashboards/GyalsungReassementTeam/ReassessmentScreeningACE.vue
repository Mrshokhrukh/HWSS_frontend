<template>
    <div class="ace-container">
        <div class="question-header p-4 mb-4 rounded-lg">
            <h4 class="text-white mb-0">{{ mainQuestion }}</h4>
        </div>

        <div v-if="currentQuestions.length > 0" class="questions-container">
            <!-- Questions -->
            <div v-for="question in currentQuestions" :key="question.id" class="question-card mb-4 p-4 rounded-lg shadow-sm">
                <div class="question-content">
                    <h3 class="question-text mb-3">{{ question.text }}</h3>
                    <div class="options-grid">
                        <!-- *** CRITICAL FIX WAS HERE *** -->
                        <!-- Now correctly loops through each question's own answers -->
                        <div v-for="option in question.answers" :key="option.id" class="option-item text-center">
                            <label class="radio-label">
                                <input 
                                    type="radio" 
                                    :value="option" 
                                    @change="handleAnswerSelection(option, question)"
                                    :name="'question_' + question.id" 
                                    required 
                                    class="radio-input" 
                                />
                                <span class="option-text">{{ option.option }}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Results card -->
            <div class="results-card p-4 rounded-lg shadow-sm">
                <div class="result-row mb-2">
                    <strong>Total Score (Number of "Yes" answers):</strong>
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
        
        <div v-else class="text-center p-5">
          <h4 class="text-muted">ACE questions are not available.</h4>
          <p class="text-muted">Please ensure the 'ACE' question set is included in the screening data.</p>
        </div>

        <!-- Navigation buttons -->
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
const counselorScreeningQuestions = ref(inject('counselorScreeningQuestions'));

const mainQuestion = ref('While you were growing up:');

// Correctly finds the ACE question set from the provided JSON
const currentQuestions = computed(() => {
    if (!counselorScreeningQuestions.value) return [];
    
    const screeningSet = counselorScreeningQuestions.value.find(set => set.name === 'Gyalsung Screening');
    if (!screeningSet) return [];
    
    const aceSet = screeningSet.question_sets.find(set => set.name === 'ACE');
    if (!aceSet || !aceSet.questions) return [];
    
    // Initialize each question with a property to hold its answer
    return aceSet.questions.map(q => ({ ...q, selectedOption: null }));
});

const handleAnswerSelection = (option, question) => {
    question.selectedOption = option;
};

// ACE scoring is the count of "Yes" answers
const totalScore = computed(() => {
    return currentQuestions.value.reduce((score, question) => {
        return score + (question.selectedOption ? question.selectedOption.points : 0);
    }, 0);
});

const interpretation = computed(() => {
    const score = totalScore.value;
    if (score === 0) return 'Mild';
    if (score >= 1 && score <= 3) return 'Intermediate';
    return 'Severe';
});

const interpretationClass = computed(() => {
    if (totalScore.value === 0) return 'bg-primary';
    if (totalScore.value >= 1 && totalScore.value <= 3) return 'bg-success';
    return 'bg-danger';
});

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
    
    localStorage.setItem('ACE_set_counselor_screening', JSON.stringify(data));
    emit('goToNext', 'ACE');
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
    
    .question-text {
        font-size: 1rem;
    }
}
</style>