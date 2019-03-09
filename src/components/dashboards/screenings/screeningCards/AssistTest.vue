<template>
    <div v-if="currentQuestion" class="container-fluid screening-test p-0">
        <div class="card">
            <div class="card-body">
                <div class="progress-container py-3">
                    <div class="progress" style="height: 10px; border-radius: 5px">
                        <div class="progress-bar" role="progressbar" :style="{ width: progressPercentage + '%' }"
                            aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
                <h4 class="my-5 text-center">{{ currentQuestion.text }}</h4>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Substances</th>
                            <th v-for="answer in currentQuestion.answers" :key="answer.id" class="text-center">
                                {{ answer.option }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="substance in apiSubstances" :key="substance.name">
                            <td>{{ substance.name }}</td>
                            <td v-for="answer in currentQuestion.answers" :key="answer.id" class="text-center">
                                <input type="radio" :name="getRadioButtonName(substance.name)" :value="answer.id"
                                    @change="handleAnswerSelection(answer, substance.name)" />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <button v-if="allSubstancesAnswered()" @click="moveToNextQuestion" class="btn btn-primary">Next</button>
                <div v-else class="alert alert-warning" role="alert">
                    Please answer all substances before moving to the next question.
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Swal from 'sweetalert2';
import axios from 'axios';
import endpoints from "@/api";
import { useUserResponseStore } from '@/stores/userResponseStore';

const userResponseStore = useUserResponseStore();

const questions = ref([]);
const currentQuestionIndex = ref(0);
const progressPercentage = computed(() => (currentQuestionIndex.value + 1) / questions.value.length * 100);
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);

const answeredSubstancesMap = ref(new Map());

// Hardcoded substances with true or false values assigned
const hardcodedSubstances = [
    { name: "Tobacco products (cigarettes, chewing tobacco etc)", value: true, answered: false },
    { name: "Alcoholic beverages (beer, wine, spirits, ara etc.)", value: true, answered: false },
    { name: "Cannabis (marijuana, pot, grass, hash, black etc.)", value: true, answered: false },
    { name: "Cocaine (Cocaine, Coke, Blow, Snow)", value: true, answered: false },
    { name: "Amphetamine-type stimulants (speed, meth, ecstasy, ice, diet pills etc.)", value: true, answered: false },
    { name: "Inhalants (dendrite, glue, petrol, paint thinner, etc.)", value: true, answered: false },
    { name: "Sedatives or Sleeping Pills (Valium,Temazepam, Amitriptyline, N-10, diazepam etc.)", value: true, answered: false },
    { name: "Hallucinogens (LSD, acid,, trips, Ketamine, etc.)", value: true, answered: false },
    { name: "Opioids (heroin, morphine, fentanyl, codeine, SP+, tramadol, BS etc.)", value: true, answered: false },
    { name: "Other - specify", value: true, answered: false }
];


onMounted(async () => {
    try {
        const response = await axios.get(endpoints.assistTest);
        questions.value = response.data;

        // Initialize answered substances map with the hardcoded values
        for (const substance of hardcodedSubstances) {
            answeredSubstancesMap.value.set(substance.name, substance.value);
            // Set the answered status to false for each substance
            substance.answered = false;
        }
        // Log all substances, their status, and answered value
        console.log('All substances after component is loaded:');
        console.table(hardcodedSubstances);
    } catch (error) {
        console.error('Error fetching questions:', error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to fetch questions. Please try again later.',
        });
    }
});


// Watch for changes in user responses and update answeredSubstancesMap
watch(() => userResponseStore.responses, (responses) => {
    if (currentQuestion.value) {
        for (const response of responses) {
            if (response.question === currentQuestion.value.id) {
                answeredSubstancesMap.value.set(response.substance, true);
            }
        }
    }

    // Log the substances and their status
    console.log('Substances and their status:');
    const substanceStatus = Array.from(answeredSubstancesMap.value.entries());
    console.table(substanceStatus);
});

// Function to handle user's answer for the first question
const handleFirstQuestionAnswer = async (answer) => {
    // Check if the user selected "Yes"
    if (answer.option === 'Yes') {
        // Check if the user selected "Other - specify"
        const otherSpecifyIndex = currentQuestion.value.answers.findIndex(ans => ans.option === 'Other - specify');
        if (otherSpecifyIndex !== -1) {
            const otherSpecifyAnswer = currentQuestion.value.answers[otherSpecifyIndex];
            // Prompt the user to enter the name of the substance
            const { value: substanceName } = await Swal.fire({
                title: 'Enter Substance Name',
                input: 'text',
                inputPlaceholder: 'Enter the name of the substance',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                cancelButtonText: 'Cancel',
                inputValidator: (value) => {
                    if (!value) {
                        return 'Substance name is required!';
                    }
                }
            });

            // If the user entered a substance name, replace the substance in the array
            if (substanceName) {
                currentQuestion.value.substances[otherSpecifyIndex] = substanceName;
            }
        }
    } else if (answer.option === 'No') {
        // If the user selected "No", set the value of all substances to false
        currentQuestion.value.substances.forEach(substance => {
            const index = hardcodedSubstances.findIndex(item => item.name === substance);
            if (index !== -1) {
                hardcodedSubstances[index].value = false;
            }
        });
    }
};

// Watch for changes in user's response for the first question
watch(() => userResponseStore.responses, (responses) => {
    if (currentQuestion.value && currentQuestion.value.id === 2) {
        for (const response of responses) {
            const answer = currentQuestion.value.answers.find(ans => ans.id === response.answer);
            if (answer) {
                handleFirstQuestionAnswer(answer);
            }
        }
    }
});

const handleAnswerSelection = (answer, substance) => {
    // Track user answers by calling the store method
    userResponseStore.storeUserResponse(answer, substance);

    // Find the selected substance in the hardcodedSubstances array
    const selectedSubstance = hardcodedSubstances.find(sub => sub.name === substance);

    // Update the answered status of the selected substance
    if (selectedSubstance) {
        selectedSubstance.answered = true;
    }
};

const allSubstancesAnswered = () => {
    // Check if all substances for the current question have been answered
    const allAnswered = currentQuestion.value.answers.every(answer => {
        // Check if the substance has been answered
        const answered = answeredSubstancesMap.value.get(answer.option);
        console.log(`Substance: ${answer.option}, Answered: ${answered}`);
        return answered;
    });

    console.log('All substances status:', allAnswered);
    return allAnswered;
};


const moveToNextQuestion = () => {
    // Move to the next question
    currentQuestionIndex.value++;
    // Reset answeredSubstancesMap for the next question
    resetAnsweredSubstances();
};

// Method to move to the next question manually
const moveToNextQuestionManually = () => {
    if (allSubstancesAnswered()) {
        // Move to the next question
        moveToNextQuestion();
    } else {
        // Prompt the user to answer all substances before proceeding
        Swal.fire({
            icon: 'warning',
            title: 'Incomplete Answer',
            text: 'Please answer all substances before moving to the next question.',
        });
    }
};

const resetAnsweredSubstances = () => {
    // Reset the answered status to false for substances whose value is true
    hardcodedSubstances.forEach(substance => {
        if (substance.value) {
            substance.answered = false;
        }
    });
};

// Computed property to filter out valid substances based on the map
const validSubstances = computed(() => {
    return currentQuestion.value.substances.map(substance => {
        if (substance === 'Other - specify') {
            const otherSpecifyIndex = currentQuestion.value.answers.findIndex(ans => ans.option === 'Other - specify');
            if (otherSpecifyIndex !== -1) {
                return currentQuestion.value.substances[otherSpecifyIndex];
            }
        }
        return substance;
    }).filter(substance => answeredSubstancesMap.value.get(substance) === true);
});
</script>



<style scoped>
input {
    border-radius: 10px;
}

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

.submit-button {
    background-color: #2c6975;
    /* border: 2px solid #2c6975; */
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    border-radius: 5rem;
    transition: 800ms;
    box-shadow: none;
}

.submit-button:hover {
    background-color: transparent;
    color: #2c6975;
    border: 2px solid #2c6975;
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 20px;
    /* Adjust the gap as needed */
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
