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
                :class="{ 'disabled': isSubstanceDisabled(substance) }">

                <div class="substance-name">
                    <div class="substance-icon">
                        <i class="fas fa-pills" v-if="substance.includes('Tobacco') || substance.includes('Cannabis')"></i>
                        <i class="fas fa-wine-bottle" v-else-if="substance.includes('Alcohol')"></i>
                        <i class="fas fa-capsules" v-else-if="substance.includes('Cocaine') || substance.includes('Amphetamine')"></i>
                        <i class="fas fa-syringe" v-else-if="substance.includes('Opioids') || substance.includes('Inhalants')"></i>
                        <i class="fas fa-prescription-bottle" v-else-if="substance.includes('Sedatives')"></i>
                        <i class="fas fa-question-circle" v-else></i>
                    </div>
                    <template v-if="substance !== 'Other - specify'">
                        {{ substance }}
                    </template>
                    <template v-else>
                        <input type="text" class="other-input" placeholder="Other - specify" v-model="otherSubstance"
                            :readonly="isOtherSubstanceLocked" :disabled="isSubstanceDisabled(substance)" />
                    </template>
                </div>

                <div class="options-group">
                    <label v-for="option in currentQuestion.answers" :key="option.id" class="radio-label">
                        <input 
                            type="radio"
                            :name="'substance_' + substance"
                            :value="option"
                            v-model="currentQuestion.answersBySubstance[substance]"
                            @change="handleAnswerSelection(option, substance)"
                            :disabled="isSubstanceDisabled(substance)" 
                        />
                        <span class="radio-custom"></span>
                        <span class="radio-text">{{ option.option }}</span>
                    </label>
                </div>
            </div>
        </div>

        <div class="footer">
            <button class="nav-btn back-btn" @click="goBack" :class="{'d-none': currentQuestionIndex === 0}">
                <i class="fas fa-arrow-left"></i>
                Back
            </button>
            <div class="flex-grow-1"></div>
            <button v-if="isLastQuestion" class="nav-btn next-btn finish-btn" @click="proceed">
                <i class="fas fa-check"></i>
                Finish
            </button>
            <button v-else class="nav-btn next-btn" @click="jumpToNextQuestion">
                Next
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    </div>
    <div v-else class="no-questions">
        <div class="loading-spinner">
            <div class="spinner"></div>
        </div>
        <p>Loading questions or no more questions for this screening...</p>
    </div>
</template>

<script setup>
import { ref, computed, inject, reactive, watchEffect } from 'vue';
import Swal from 'sweetalert2';

const emit = defineEmits(['goToNext', 'goBack']);

// Injected reactive data source
const counselorScreeningQuestions = inject('counselorScreeningQuestions');

// Component-specific state
const allAssistQuestions = ref([]);
const currentQuestionIndex = ref(0);
const otherSubstance = ref('');
const finalResponses = reactive([]); 

// State for skip/disable logic based on answers
const lifetimeUseResponses = reactive({}); // For Q1 (ID 54)
const recentUseResponses = reactive({});   // For Q2 (ID 55)

// --- DATA PREPARATION ---
watchEffect(() => {
    // Guard clause: wait for data to be loaded
    if (!counselorScreeningQuestions || !counselorScreeningQuestions.value || counselorScreeningQuestions.value.length === 0) {
        return;
    }

    // 1. Find the main "Gyalsung Screening" set from the top-level array
    const gyalsungScreening = counselorScreeningQuestions.value.find(set => set.name === 'Gyalsung Screening');
    if (!gyalsungScreening) {
        console.error('"Gyalsung Screening" set not found in the provided data.');
        return;
    }

    // 2. Find the "CNE ASSIST" question set within it
    const assistSet = gyalsungScreening.question_sets.find(set => set.name === 'CNE ASSIST');
    if (!assistSet || !assistSet.questions) {
        console.error('"CNE ASSIST" question set not found or is empty.');
        return;
    }
    
    // 3. Filter questions by age group and sort them
    const clientAgeGroup = sessionStorage.getItem('clientAgeGroup') || 'Above 18';
    const filtered = assistSet.questions
        .filter(q => q.age_group_tags.length === 0 || q.age_group_tags.includes(clientAgeGroup))
        .sort((a, b) => a.id - b.id);

    // 4. Prepare each question object to hold its own state for answers
    allAssistQuestions.value = filtered.map(q => ({
        ...q,
        answersBySubstance: q.substances.reduce((acc, sub) => {
            acc[sub] = null; // Initialize answer for each substance
            return acc;
        }, {})
    }));
});


// --- COMPUTED PROPERTIES ---
const currentQuestion = computed(() => {
    if (allAssistQuestions.value.length === 0) return null;
    return allAssistQuestions.value[currentQuestionIndex.value];
});

const isLastQuestion = computed(() => {
    return currentQuestionIndex.value >= allAssistQuestions.value.length - 1;
});

const isOtherSubstanceLocked = computed(() => {
    // Lock the "Other" substance name after the first question
    return currentQuestionIndex.value > 0;
});


// --- METHODS ---
function handleAnswerSelection(option, substance) {
    if (!currentQuestion.value) return;

    // Store responses specifically for skip/disable logic
    const questionId = currentQuestion.value.id;
    if (questionId === 54) { // "In your life, have you ever tried..."
        lifetimeUseResponses[substance] = option;
    }
    if (questionId === 55) { // "In the past three months, how often have you used..."
        recentUseResponses[substance] = option;
    }
}

function isSubstanceDisabled(substance) {
    // Rule 1: Disable substance if user answered "No" to ever using it in the first question.
    if (currentQuestion.value?.id > 54 && lifetimeUseResponses[substance]?.option === 'No') {
        return true;
    }

    // Rule 2: Disable for specific questions if user answered "Never" to recent use.
    const qIdsForRecentUseCheck = [56, 57, 58];
    if (qIdsForRecentUseCheck.includes(currentQuestion.value?.id) && recentUseResponses[substance]?.option.startsWith('Never')) {
        return true;
    }
    
    return false;
}

function validateCurrentQuestion() {
    if (!currentQuestion.value) return false;

    // Check if every *non-disabled* substance has an answer selected.
    const allAnswered = currentQuestion.value.substances.every(substance => {
        if (isSubstanceDisabled(substance)) {
            return true; // A disabled substance is considered "answered".
        }
        return currentQuestion.value.answersBySubstance[substance] !== null;
    });

    if (!allAnswered) {
        Swal.fire({
            icon: 'warning',
            title: 'Incomplete',
            text: 'Please provide an answer for each substance before proceeding.',
        });
        return false;
    }
    return true;
}

function logCurrentAnswers() {
    if (!currentQuestion.value) return;
    
    currentQuestion.value.substances.forEach(substance => {
        const selectedOption = currentQuestion.value.answersBySubstance[substance];
        
        if (selectedOption) {
            // Use the user-typed name for "Other" substance
            const substanceName = substance === 'Other - specify' ? (otherSubstance.value || 'Other - unspecified') : substance;

            const logEntry = {
                question: currentQuestion.value.text,
                setName: 'CNE ASSIST',
                response: selectedOption.option,
                point: selectedOption.points,
                substance: substanceName,
                diagnosis: null,
            };

            const existingIndex = finalResponses.findIndex(r => r.question === logEntry.question && r.substance === logEntry.substance);
            if (existingIndex > -1) {
                finalResponses[existingIndex] = logEntry; // Update existing
            } else {
                finalResponses.push(logEntry); // Add new
            }
        }
    });
}

function jumpToNextQuestion() {
    if (!validateCurrentQuestion()) return;
    logCurrentAnswers();

    let nextIndex = currentQuestionIndex.value + 1;

    // Skip Logic: If on question #2 (ID 55), check if all active substances were answered "Never".
    if (currentQuestion.value.id === 55) {
        const activeSubstances = currentQuestion.value.substances.filter(sub => !isSubstanceDisabled(sub));
        const allNever = activeSubstances.every(sub => recentUseResponses[sub]?.option.startsWith('Never'));

        if (allNever && activeSubstances.length > 0) {
             Swal.fire({
                title: 'No Recent Substance Use',
                text: 'Skipping questions about recent use patterns.',
                icon: 'info',
                timer: 2000,
                showConfirmButton: false,
            });
            // Skip next 3 questions (IDs 56, 57, 58)
            nextIndex += 3;
        }
    }

    if (nextIndex < allAssistQuestions.value.length) {
        currentQuestionIndex.value = nextIndex;
    }
}

function goBack() {
   
    if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--;
    }
}

function proceed() {
    if (!validateCurrentQuestion()) return;
    logCurrentAnswers();

    localStorage.setItem('ASSIST_set_counselor_screening', JSON.stringify(finalResponses));
    emit('goToNext', 'ASSIST');
}
</script>

<style scoped>
.questionnaire-container {
    max-width: 1200px;
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
    margin-bottom: 1.5rem;
    font-weight: 600;
    line-height: 1.4;
    position: relative;
    z-index: 1;
}

.options-legend {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: 1rem;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
}

.option-label {
    font-size: 0.875rem;
    padding: 0.75rem 1.25rem;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 0.75rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-weight: 500;
    text-align: center;
    flex: 1;
    min-width: 120px;
    transition: all 0.3s ease;
}

.option-label:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
}

.substances-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.substance-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    transition: all 0.3s ease;
    position: relative;
}

.substance-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    border-color: rgba(43, 101, 111, 0.2);
}

.substance-card.disabled {
    opacity: 0.5;
    background: #f8f9fa;
    pointer-events: none;
    transform: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.substance-name {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1.25rem;
    color: #2B656F;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #f0f0f0;
}

.substance-icon {
    font-size: 1.2rem;
    color: #2B656F;
    width: 24px;
    text-align: center;
}

.other-input {
    border: 2px solid #e0e0e0;
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
    font-weight: 500;
    color: #2B656F;
    background: white;
    flex: 1;
    transition: border-color 0.3s ease;
}

.other-input:focus {
    outline: none;
    border-color: #2B656F;
    box-shadow: 0 0 0 3px rgba(43, 101, 111, 0.1);
}

.other-input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
}

.options-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.radio-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #f8f9fa;
    border: 2px solid transparent;
    position: relative;
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

.radio-label input[type="radio"] {
    display: none;
}

.radio-custom {
    width: 20px;
    height: 20px;
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
    width: 8px;
    height: 8px;
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
    flex: 1;
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

.finish-btn {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.finish-btn:hover {
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
}

.d-none {
    display: none;
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
    
    .substances-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .options-legend {
        justify-content: center;
        gap: 0.5rem;
    }
    
    .option-label {
        font-size: 0.75rem;
        padding: 0.5rem 0.75rem;
        min-width: 80px;
    }
    
    .substance-card {
        padding: 1rem;
    }
    
    .question-text {
        font-size: 1.2rem;
    }
    
    .nav-btn {
        padding: 0.75rem 1.5rem;
        font-size: 0.9rem;
    }
}

@media (max-width: 480px) {
    .options-legend {
        flex-direction: column;
        align-items: center;
    }
    
    .option-label {
        width: 100%;
        max-width: 200px;
    }
    
    .footer {
        flex-direction: column;
        gap: 1rem;
    }
    
    .nav-btn {
        width: 100%;
        max-width: 200px;
    }
}
</style>