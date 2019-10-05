<template>
    <div class="container-fluid screening-test p-4 card">
        <!-- VueConfetti component -->
        <div style="z-index: 9999" class="text-center mx-auto d-none" v-if="showConfetti">
            <ConfettiExplosion :particleCount="200" :particleSize="10" :duration="5000" :force="0.8" />
        </div>
        <div class="card-inner">
            <!-- Progress bar -->
            <div class="card-body">
                <div class="progress-container py-1 mt-2 mb-4">
                    <div class="progress" style="height: 15px; border-radius: 20px">
                        <div class="progress-bar" role="progressbar" :style="{ width: progressPercentage + '%' }"
                            aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>

                <div v-if="currentQuestionSetName !== 'SCHOOL ENV' && currentQuestionSetName !== 'ASSIST'
                ">
                    <!-- Existing layout for other question sets -->
                    <div v-if="showBgGreen" class="card p-3 my-3 text-center bg-gradient-dark">
                        <h4 class="text-white">
                            Over the last 2 weeks, how often have you been bothered by any of the
                            following problems:
                        </h4>
                    </div>
                    <div class="question-area text-center px-5" v-if="currentQuestion">
                        <div class="row my-4 justify-content-center text-center">
                            <div class="col d-flex justify-content-center align-items-center">
                                <div class="icon-container d-inline-flex align-items-center">
                                    <img :src="iconURL" alt="Question Icon" style="max-width: 100px"
                                        class="mx-4 my-3 animated-icon" />
                                    <div class="question-text d-inline-block">
                                        <h2 class="text-capitalize">{{ processedQuestionText }}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="answer-options">
                            <div class="row justify-content-center">
                                <div class="answer-option col-md-6 col-sm-12" v-for="(option) in currentQuestion.answers"
                                    :key="option.id">
                                    <button :class="{ selected: isSelectedAnswer(option) }"
                                        @click="handleAnswerSelection(option)" class="btn btn-lg w-100 my-3">
                                        {{ option.option }}
                                        <span class="d-none">{{ option.points }}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Layout for "ASSIST" question set -->
                <div v-if="isAssistOrSchoolEnv && currentQuestionSetName === 'ASSIST'">
                    <h5 class="my-3 text-left text-black question">{{ currentQuestion.text }}</h5>
                    <table class="table table-borderless">
                        <thead class="border-bottom align-middle">
                            <tr>
                                <th></th>
                                <th v-for="option in currentQuestion.answers" :key="option.id"
                                    class="text-center text-capitalize fs-6 text-black">
                                    {{ option.option }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="substance in filterSubstances(currentQuestion.substances)" :key="substance"
                                :class="{ 'table-row-disabled': isSubstanceDisabled(substance) }">
                                <td class="text-capitalize text-black">
                                    {{ renderSubstanceOptions(substance) }}
                                </td>
                                <td v-for="option in currentQuestion.answers" :key="option.id" class="text-center">
                                    <input type="radio" :name="`substance-${substance}`" :value="option.id"
                                        @change="handleAnswerSelection(option, substance)" required
                                        :disabled="isSubstanceDisabled(substance)" />
                                    <span class="d-none">{{ option.points }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Layout for "SCHOOL ENV" question set -->
                <div v-if="currentQuestionSetName === 'SCHOOL ENV'" class="school-env-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th class="text-black">Question</th>
                                <th class="text-black">Strongly Agree</th>
                                <th class="text-black">Agree</th>
                                <th class="text-black">Neutral/Indifferent</th>
                                <th class="text-black">Disagree</th>
                                <th class="text-black">Strongly Disagree</th>
                                <th class="text-black" v-if="requiresTextInput()">Specify</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(question, index) in currentSetQuestions" :key="question.id">
                                <td class="text-black">{{ question.text }}</td>
                                <template v-if="index < 8">
                                    <td v-for="option in question.answers.slice().reverse()" :key="option.id"
                                        class="text-center">
                                        <input type="radio" :id="`question-${question.id}-answer-${option.id}`"
                                            :name="`question-${question.id}`" :value="option.option"
                                            v-model="answers[question.id]" @change="
                                                handleRadioClick(question.text, question.id, option.option)
                                                " required />

                                        <label :for="`question-${question.id}-answer-${option.id}`"></label>
                                    </td>
                                    <td v-if="requiresTextInput(question.id)">
                                        <input type="text" class="form-control" v-model="textResponses[question.id]"
                                            :required="requiresTextInput(question.id)" placeholder="Please Specify"
                                            @change="logQuestionAndResponseSchoolEnv(
                                                question.text,
                                                textResponses[question.id],
                                                question.id
                                            )" @blur="saveTextResponse(question.id)" />
                                    </td>

                                </template>

                                <template v-else>
                                    <td colspan="6">
                                        <input type="text" class="form-control mb-3" placeholder="Answer 1"
                                            v-model="textResponses[question.id + '_1']" required @change="
                                                logQuestionAndResponseSchoolEnv(
                                                    question.text,
                                                    $event.target.value,
                                                    question.id + '_1'
                                                )
                                                " />
                                        <input type="text" class="form-control" placeholder="Answer 2"
                                            v-model="textResponses[question.id + '_2']" required @change="
                                                logQuestionAndResponseSchoolEnv(
                                                    question.text,
                                                    $event.target.value,
                                                    question.id + '_2'
                                                )
                                                " />
                                    </td>
                                </template>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Footer buttons -->
            <div class="d-flex card-footer justify-content-end">
                <div class="button-group">
                    <button @click="goBack" class="btn rounded-btn back-button d-none">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <button v-if="currentQuestionSetName === 'SCHOOL ENV'"
                        @click="submitFormData(answerOption, question)" class="btn rounded-btn submit-button">
                        <i class="fas fa-check"></i> Submit
                    </button>

                    <button @click="flushStore" class="btn rounded-btn back-button">
                        <i class="fas fa-undo"></i> Reset Progress
                    </button>
                    <button v-if="currentQuestionSetName === 'ASSIST'" @click="jumpToNextQuestion"
                        class="btn rounded-btn submit-button">
                        Next <i class="fas fa-chevron-right ms-2"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive, nextTick, toRaw } from "vue";
import { useProgressStore } from "@/stores/progressStore";
import Swal from "sweetalert2";
import axios from "axios";
import endpoints from "@/api";
import fallbackIcon from "@/assets/images/question.png";
import { useRouter } from "vue-router";
import ConfettiExplosion from "vue-confetti-explosion";

const progressStore = useProgressStore();
const currentQuestionIndex = ref(0);
const questions = ref([]);
const answers = reactive({});
const textResponses = reactive({});
const substanceAnswered = reactive({});
const stronglyDisagreeSelected = reactive({});
const router = useRouter();
const storedResponses = ref({});
const assistq2substances = ref([]);

const testResponses = reactive({
    responses: [],
    logs: [],
});

const schoolEnvFormData = ref({
    question1: {
        answer: "",
        question: "",
        specify: "",
    },
    question2: {
        answer: "",
        question: "",
        specify: "",
    },
    question3: {
        answer: "",
        question: "",
        specify: "",
    },
    question4: {
        answer: "",
        question: "",
        specify: "",
    },
    question5: {
        answer: "",
        question: "",
        specify: "",
    },
    question6: {
        answer: "",
        question: "",
        specify: "",
    },
    question7: {
        answer: "",
        question: "",
        specify: "",
    },
    question8: {
        answer: "",
        question: "",
        specify: "",
    },
    question9: {
        question: "",
        answer1: "",
        answer2: "",
    },
    question10: {
        question: "",
        answer1: "",
        answer2: "",
    },
});

let logEntry = {
    question: null,
    setName: null,
    response: null,
    point: null,
    substance: null,
    diagnosis: null,
    questionId: null,
    specify: "",
};

const showConfetti = ref(false);
const showMessage = ref(false);
const answeredSubstances = ref({});
// const answeredQ2Substances = ref({});

const userAgeData = JSON.parse(sessionStorage.getItem("userAgeData"));
const userAgeGroup = userAgeData ? userAgeData.ageGroup : null;

function isUserAgeGroupIncluded(ageGroupTags) {
    return ageGroupTags.includes(userAgeGroup);
}

onMounted(async () => {
    progressStore.loadProgress();
    currentQuestionIndex.value = progressStore.currentQuestionIndex;

    let storedQuestions = JSON.parse(sessionStorage.getItem("questions"));
    if (!storedQuestions) {
        const response = await axios.get(
            `${endpoints.screeningPreTests}?name=Cluster Screening`
        );
        storedQuestions = response.data;
        sessionStorage.setItem("questions", JSON.stringify(storedQuestions));
    }

    questions.value = storedQuestions.flatMap((data) =>
        data.question_sets.flatMap((set) =>
            set.questions.map((question) => ({
                ...question,
                setName: set.name,
            }))
        )
    );

    questions.value.forEach((question) => {
        answers[question.id] = question.answer_type === 5 ? "" : null;
    });

    if (currentQuestionSetName.value === "ASSIST") {
        currentQuestion.value.substances.forEach((substance) => {
            substanceAnswered[substance] = false;
        });
    }
});

const allSubstancesNo = computed(() => {
    if (!answeredSubstances.value) return false;

    const falseCount = Object.values(answeredSubstances.value).filter((answer) => !answer)
        .length;
    return falseCount === 10;
});

watch(allSubstancesNo, (allNo) => {
    if (allNo) {
        showConfetti.value = true;
        showMessage.value = true;
        setTimeout(() => {
            jumpToNextRelevantSet();
        }, 3000);
    }
});

watch(currentQuestionIndex, (newIndex) => {
    if (currentQuestionSetName.value === "ASSIST") {
        const currentQuestion = questions.value[newIndex];
        if (currentQuestion && (currentQuestion.id === 68 || currentQuestion.id === 69)) {
            const ageGroupTags = currentQuestion.age_group_tags;
            const includeUserAgeGroup = isUserAgeGroupIncluded(ageGroupTags);
            if (!includeUserAgeGroup) {
                jumpToNextRelevantSet();
            }
        }
    }
    if (currentQuestion.value.text === "In the past three months, how often have you used:") {
        setTimeout(() => {
            runAssistQ2Logic();
        }, 800);
    }
    if (
        currentQuestion.value.text ===
        "Has a friend or relative or anyone else ever expressed concern (or worry) about your use?"
    ) {
        assistq2substances.value.forEach((substance) => {
            substance.disabled = false;
        });
    }
});

const handleStorageChange = () => {
    const updatedAnsweredSubstances = JSON.parse(
        localStorage.getItem("answeredSubstances")
    );

    const answeredSubstancesArray = Object.values(updatedAnsweredSubstances);
    if (
        answeredSubstancesArray.length === 10 &&
        answeredSubstancesArray.every((state) => state === false)
    ) {
        Swal.fire({
            icon: null,
            title:
                '<div style="display: flex; justify-content: center; align-items: center;"><span style="font-size: 48px;">🎉</span> <span style="font-size: 24px;">Tashi Delek for not using any substances</span> <span style="font-size: 48px;">🎉</span></div>',
            html:
                "<div style='font-size: 18px; text-align: center; margin-top: 20px;'>We're proud of you!</div><div style='font-size: 48px; margin-top: 20px;'>👏🏼</div>",
            confirmButtonText: "Next",
            confirmButtonClass: "swal-button",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCloseButton: false,
            willClose: () => {
                showConfetti.value = true;
                setTimeout(() => {
                    jumpToNextRelevantSet("ASSIST");
                }, 200);
            },
            didClose: () => {
                showConfetti.value = false;
            },
            onOpen: () => {
                const modal = Swal.getPopup();
                modal.style.width = "80%";
                modal.style.maxWidth = "800px";
                modal.style.padding = "30px";
            },
        });
    }
    answeredSubstances.value = updatedAnsweredSubstances;
};

function findLoggedQuestionIndex(question, substance) {
    return testResponses.responses.findIndex(
        (entry) =>
            entry.question === question &&
            (entry.substance === undefined || entry.substance === substance)
    );
}

function findLoggedQuestionSchoolEnvIndex(question) {
    return testResponses.responses.findIndex(
        (entry) =>
            entry.question === question &&
            entry.setName === "SCHOOL ENV" &&
            entry.response === "Strongly Disagree"
    );
}

function logQuestionAndResponse(option, substance) {
    const questionText = currentQuestionText.value;
    const questionSetName = currentQuestionSetName.value;
    const response = option.option;
    const point = option.points;

    const index = findLoggedQuestionIndex(questionText, substance);

    const logEntry = {
        question: questionText,
        setName: questionSetName,
        response: response,
        point: point,
        substance: substance || null,
        diagnosis: null,
    };

    const answer = response.trim();

    if (questionSetName === "ASSIST") {
        if (answer) {
            logEntry.substance = substance;
            answers.substanceName = substance;
            substanceAnswered[substance] = answer === "Yes";
        }
    }

    if (index !== -1 && logEntry.substance === testResponses.responses[index].substance) {
        testResponses.responses[index] = logEntry;
    } else {
        testResponses.responses.push(logEntry);
    }
}

function logQuestionAndResponseWithDiagnosis(option) {
    const questionText = currentQuestionText.value;
    const questionSetName = currentQuestionSetName.value;

    const index = findLoggedQuestionIndex(questionText);

    logEntry.question = questionText;
    logEntry.setName = questionSetName;
    logEntry.response = option.option;
    logEntry.point = option.points;
    logEntry.substance = null;
    logEntry.diagnosis = null;

    Swal.fire({
        title: "Please specify",
        input: "text",
        inputLabel: "What were you diagnosed with?",
        showCancelButton: true,
        confirmButtonText: "Submit",
        inputValidator: (value) => {
            if (!value) {
                return "You need to write something!";
            }
        },
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            const diagnosis = result.value;
            logEntry.diagnosis = diagnosis;

            answers.diagnosis = diagnosis;
            progressStore.setDiagnosisDetail(currentQuestion.value.id, diagnosis);
            nextTick(() => {
                progressStore.setAnswer(currentQuestion.value.id, option);
                jumpToNextRelevantSet();
            });

            if (index !== -1) {
                testResponses.responses[index] = { ...logEntry };
            } else {
                testResponses.responses.push({ ...logEntry });
            }
        } else {
            Swal.fire({
                icon: "info",
                title: "No Diagnosis Entered",
                text:
                    "You have not entered a diagnosis. If you want to proceed without specifying a diagnosis, click OK.",
                showCancelButton: true,
                confirmButtonText: "OK",
                cancelButtonText: "Cancel",
            }).then((result) => {
                if (result.isConfirmed) {
                    nextTick(() => {
                        progressStore.setAnswer(currentQuestion.value.id, option);
                        jumpToNextRelevantSet();
                    });
                }
            });
        }
    });
}

function logQuestionAndResponseSchoolEnv(question, answerOption, questionId, value) {
    const questionSetName = currentQuestionSetName.value;

    answers[questionId] =
        answerOption === "Strongly Disagree" ? "Strongly Disagree" : answerOption;

    const existingIndex = findLoggedQuestionSchoolEnvIndex(question);

    const specifyValue = value || "";

    if (existingIndex !== -1 && answerOption !== "Strongly Disagree") {
        const isStandardOption = [
            "Strongly Agree",
            "Agree",
            "Neutral/Indifferent",
            "Disagree",
        ].includes(answerOption);
        if (!isStandardOption) {
            testResponses.responses[existingIndex].specify = answerOption;
        } else {
            testResponses.responses[existingIndex] = {
                question: question,
                setName: questionSetName,
                response: answerOption,
                questionId: questionId,
                specify: specifyValue,
            };
        }
    } else {
        const containsMentionTwoThings = question
            .toLowerCase()
            .includes("(mention two things)");
        if (containsMentionTwoThings) {
            const logEntry = {
                question: question,
                setName: questionSetName,
                response: answerOption,
                questionId: questionId,
                specify: specifyValue,
            };

            if (existingIndex === -1) {
                testResponses.responses.push({ ...logEntry });
            } else {
                testResponses.responses[existingIndex] = { ...logEntry };
            }
        } else {
            if (answerOption !== "Strongly Disagree") {
                textResponses[questionId + "_specify"] = "";
            } else {
                textResponses[questionId + "_specify"] = specifyValue;
            }

            const logEntry = {
                question: question,
                setName: questionSetName,
                response:
                    answerOption === "Strongly Disagree" ? "Strongly Disagree" : answerOption,
                questionId: questionId,
                specify: specifyValue,
            };

            if (existingIndex === -1) {
                testResponses.responses.push({ ...logEntry });
            } else {
                console.error("Log Entry:", logEntry);
            }
        }
    }
}

watch(currentQuestionIndex, (newIndex) => {
    progressStore.setQuestionIndex(newIndex);
    progressStore.saveProgress();
});

const currentQuestion = computed(() => {
    if (questions.value.length > 0) {
        const question = questions.value[currentQuestionIndex.value];
        if (!question) {
            console.error("Current question is undefined:", currentQuestionIndex.value);
        }
        return question;
    } else {
        return null;
    }
});

const currentQuestionText = computed(() => {
    return currentQuestion.value ? currentQuestion.value.text : "";
});

const currentQuestionSetName = computed(() => {
    return currentQuestion.value ? currentQuestion.value.setName : "";
});

const currentSetQuestions = computed(() => {
    const currentSetName = currentQuestionSetName.value;
    return questions.value.filter((question) => question.setName === currentSetName);
});

// Computed properties for UI elements
const isAssistOrSchoolEnv = computed(() =>
    ["ASSIST", "SCHOOL ENV"].includes(currentQuestionSetName.value)
);
const showBgGreen = computed(() =>
    ["PHQ2", "PHQ9", "GAD2", "GAD7"].includes(currentQuestionSetName.value)
);
function getIconBaseUrl() {
    if (import.meta.env.VITE_DEVELOPMENT_MODE === 'true') {
        const iconHost = import.meta.env.VITE_ICON_HOST || 'localhost';
        const iconPort = import.meta.env.VITE_ICON_PORT || '8686';
        const iconProtocol = import.meta.env.VITE_ICON_PROTOCOL || 'http';
        return `${iconProtocol}://${iconHost}:${iconPort}`;
    } else {
        return import.meta.env.VITE_PRODUCTION_ICON_URL || 'https://thepemasystem.gov.bt/api/screening';
    }
}

// Computed property for iconURL
const iconURL = computed(() => {
    const iconPath = currentQuestion.value?.icon || "";
    if (iconPath) {
        return `${getIconBaseUrl()}${iconPath}`;
    } else {
        return fallbackIcon;
    }
});

const processedQuestionText = computed(() => {
    const regex = /over the last 2 weeks, how often have you been bothered by any of the following problems[:?]\s*/i;
    return currentQuestion.value?.text.replace(regex, "");
});

const progressPercentage = computed(() => {
    return (currentQuestionIndex.value / (questions.value.length - 1)) * 100;
});

function handleAnswerSelection(option, substance) {
    const rawOption = toRaw(option);

    if (rawOption.option === "Never, not used in the last 3 months") {

        // Normalize substance name for comparison
        const normalizedSubstance = substance.toLowerCase().trim();

        // Find the index of the substance in the assistq2substances array
        const index = assistq2substances.value.findIndex(
            (sub) => sub.substance.toLowerCase().trim() === normalizedSubstance
        );

        // If the substance is found, update its disabled property to true
        if (index !== -1) {
            assistq2substances.value[index].disabled = true;
            assistq2substances.value[index].selectedOption = rawOption.option; // Optionally, update selected option
        }

    }

    if (currentQuestionSetName.value === "ASSIST") {
        logQuestionAndResponse(option, substance);
        updateSubstanceAnswered(option, substance);
        storedResponses[currentQuestion.value.id] = { option, substance };
    } else if (currentQuestion.value.question_set === 8 && option.option === "Yes") {
        logQuestionAndResponseWithDiagnosis(option);
    } else {
        logQuestionAndResponse(option);
        if (currentQuestionSetName.value === "SCHOOL ENV") {
            const questionId = currentQuestion.value.id;
            const answer = option.option;
            const question = option.text;
            const specify = option.specify ? option.specify : "";
            schoolEnvFormData.value[`question${questionId}`].answer = answer;
            schoolEnvFormData.value[`question${questionId}`].question = question;
            schoolEnvFormData.value[`question${questionId}`].specify = specify;
        }
        progressStore.setAnswer(currentQuestion.value.id, option);
        handleOtherQuestionSets(option);
    }
}

answers.substanceName = "";
function updateSubstanceAnswered(option, substance) {
    const answer = option.option.trim();
    if (answer === "Yes" || answer === "No") {
        substanceAnswered[substance] = answer === "Yes";
        saveSubstanceAnswersToLocalStorage();
        if (answer === "Yes" && substance === "Other - specify") {
            Swal.fire({
                title: "Specify Substance",
                input: "text",
                inputLabel: "Enter the substance name:",
                showCancelButton: true,
                confirmButtonText: "Submit",
                inputValidator: (value) => {
                    if (!value) {
                        return "You need to provide a substance name!";
                    }
                },
            }).then((result) => {
                if (result.isConfirmed && result.value) {
                    const logEntry = {
                        question: currentQuestionText.value,
                        setName: currentQuestionSetName.value,
                        response: answer,
                        substance: result.value,
                    };

                    testResponses.responses.push(logEntry);

                    localStorage.setItem("otherSubstanceName", result.value);
                    answers.substanceName = result.value;
                }
            });
        }
    }
}

function saveSubstanceAnswersToLocalStorage() {
    localStorage.setItem("answeredSubstances", JSON.stringify(substanceAnswered));
    handleStorageChange();
}

const checkInvalidInputs = () => {
    const invalidInputs = document.querySelectorAll("input:required:invalid");
    if (invalidInputs.length > 0) {
        Swal.fire({
            icon: "warning",
            title: "Incomplete Form",
            text: "Please fill in all required fields before proceeding.",
        });
        return true;
    }
    return false;
};

function requiresTextInput(questionId) {
    return stronglyDisagreeSelected[questionId];
}

function handleRadioClick(questionText, questionId, answerOption) {
    const value = "";
    if (answerOption === "Strongly Disagree") {
        stronglyDisagreeSelected[questionId] = true;
    } else {
        stronglyDisagreeSelected[questionId] = false;
    }
    logQuestionAndResponseSchoolEnv(questionText, answerOption, questionId, value);
}

function handleOtherQuestionSets(option) {
    progressStore.setAnswer(currentQuestion.value.id, option);

    setTimeout(() => {
        if (currentQuestion.value.question_set === 8 && option.option === "Yes") {
            logQuestionAndResponseWithDiagnosis(option);
        } else if (currentQuestionSetName.value === "GAD2" && progressStore.shouldSkipGAD7) {
            nextTick(() => {
                progressStore.setAnswer(currentQuestion.value.id, option);
                jumpToNextRelevantSet("GAD7");
            });
        } else if (currentQuestionSetName.value === "PHQ2" && progressStore.shouldSkipPHQ9) {
            nextTick(() => {
                progressStore.setAnswer(currentQuestion.value.id, option);
                jumpToNextRelevantSet("PHQ9");
            });
        } else {
            currentQuestionIndex.value++;
        }
    }, 500);
}

function filterSubstances(substances) {
    const answeredSubstances = JSON.parse(localStorage.getItem("answeredSubstances")) || {};
    if (Object.keys(answeredSubstances).length === 0) {
        return substances;
    }
    const filteredSubstances = substances.filter((substance) => {
        if (substance === "Any Drug") {
            return true;
        }
        return answeredSubstances[substance];
    });
    return filteredSubstances;
}

const jumpToNextQuestion = () => {
    if (currentQuestion.value.text === "In the past three months, how often have you used:") {
        const allSubstancesDisabled = assistq2substances.value.every(substance => substance.disabled);
        if (allSubstancesDisabled) {
            currentQuestionIndex.value += 4;
            return;
        }
    }

    if (currentQuestionSetName.value === "ASSIST") {
        if (!checkInvalidInputs()) {
            const allSubstancesNo = Object.values(substanceAnswered).every(
                (answer) => answer === "No" || answer === "Yes"
            );
            if (allSubstancesNo) {
                jumpToNextRelevantSet("ASSIST");
                return;
            }
        } else {
            return;
        }
    }

    currentQuestionIndex.value++;
};


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
        (question, index) =>
            question.setName !== setToSkip && index > currentQuestionIndex.value
    );
}

function goBack() {
    if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--;
    } else {
        Swal.fire({
            icon: "info",
            title: "Start of Screening",
            text: "This is the beginning of the screening, no more previous questions exist.",
        });
    }
}

const submitFormData = async () => {
    let submissionData;
    try {
        if (checkInvalidInputs()) {
            return;
        }

        const userData = JSON.parse(localStorage.getItem("userDetailsStore"));
        const userId = userData?.user?.id;

        submissionData = JSON.parse(localStorage.getItem("submissionData"));
        const submissionTimestamp = submissionData?.timestamp;

        if (
            submissionData &&
            submissionTimestamp &&
            new Date().getTime() - submissionTimestamp < 600000
        ) {
            submissionData = submissionData.data;
        } else {
            submissionData = {
                user: userId,
                test_type_name: "Cluster Screening",
            };

            const questionSetMap = new Map();

            for (const response of testResponses.responses) {
                const questionSetName = response.setName;
                if (!questionSetMap.has(questionSetName)) {
                    questionSetMap.set(questionSetName, []);
                }
                questionSetMap.get(questionSetName).push(response);
            }

            for (const [questionSetName, responses] of questionSetMap.entries()) {
                let questionIndex = 1;
                for (const response of responses) {
                    const questionKey = `${questionSetName}_question_${questionIndex++}`;
                    submissionData[questionKey] = {
                        question_set_name: questionSetName,
                        question: response.question ?? "",
                        answer: response.response ?? "",
                        score: response.point ?? null,
                        substance: response.substance ?? "",
                        specify: response.specify ?? "",
                        diagnosis: response.diagnosis ?? "",
                    };
                }
            }

            localStorage.setItem(
                "submissionData",
                JSON.stringify({ data: submissionData, timestamp: new Date().getTime() })
            );
        }

        // console.log("Submitting form data:", submissionData); // Log the submission data

        const response = await axios.post(endpoints.submitCluster, submissionData);
        console.error("Server response:", response.data);

        // Handle response from server
        if (response.data.error && response.data.error.includes("has already submitted")) {
            const confirmSubmit = await Swal.fire({
                icon: "warning",
                title: "You have already submitted for Cluster Screening",
                text: "Are you sure you want to submit again?",
                showCancelButton: true,
                confirmButtonText: "Yes, submit again",
                cancelButtonText: "Cancel",
            });

            if (confirmSubmit.isConfirmed) {
                submissionData.confirmation = true;
                const retryResponse = await axios.post(endpoints.submitCluster, submissionData);
                console.error("Retry Server response:", retryResponse.data);
                showConfetti.value = true;
                await Swal.fire({
                    icon: "success",
                    title: "Form Submitted Successfully!",
                    text: "Thank you for your submission.",
                    confirmButtonText: "OK",
                });
            }
        } else {
            showConfetti.value = true;
            await Swal.fire({
                icon: "success",
                title: "Form Submitted Successfully!",
                text: "Thank you for your submission.",
                confirmButtonText: "OK",
            });
        }

        progressStore.resetStore();
        localStorage.removeItem("answeredSubstances");
        localStorage.removeItem("otherSubstanceName");
        localStorage.removeItem("submissionData");
        localStorage.removeItem("progress");
        localStorage.removeItem("submissionData");
        testResponses.responses = [];
        router.push("/student-dashboard");
    } catch (error) {
        console.error("Error submitting form data:", error);
        if (
            error.response &&
            error.response.data &&
            error.response.data.error &&
            error.response.data.error.includes("has already submitted")
        ) {
            const confirmSubmit = await Swal.fire({
                icon: "warning",
                title: "You have already submitted for Cluster Screening",
                text: "Are you sure you want to submit again?",
                showCancelButton: true,
                confirmButtonText: "Yes, submit again",
                cancelButtonText: "Cancel",
            });

            if (confirmSubmit.isConfirmed) {
                submissionData.confirmation = true;
                const retryResponse = await axios.post(endpoints.submitCluster, submissionData);
                console.error("Retry Server response:", retryResponse.data);
                showConfetti.value = true;
                await Swal.fire({
                    icon: "success",
                    title: "Form Submitted Successfully!",
                    text: "Thank you for your submission.",
                    confirmButtonText: "OK",
                });
                progressStore.resetStore();
                localStorage.removeItem("answeredSubstances");
                localStorage.removeItem("otherSubstanceName");
                localStorage.removeItem("submissionData");
                localStorage.removeItem("progress");
                localStorage.removeItem("submissionData");
                testResponses.responses = [];
                router.push("/student-dashboard");
            }
        } else {
            await Swal.fire({
                icon: "error",
                title: "Submission Failed",
                text: "An error occurred while submitting the form. Please try again later.",
                confirmButtonText: "OK",
            });
            router.push("/student-dashboard/screening-start");
        }
    }
};

function isSelectedAnswer(option) {
    const existingAnswer = progressStore.answers.find(
        (a) => a.questionId === currentQuestion.value.id
    );
    return existingAnswer && existingAnswer.answer.id === option.id;
}

function flushStore() {
    Swal.fire({
        title: "Confirm Reset",
        text: "Are you sure you want to reset your progress?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, reset it!",
    }).then((result) => {
        if (result.isConfirmed) {
            progressStore.resetStore();
            localStorage.removeItem("answeredSubstances");
            localStorage.removeItem("otherSubstanceName");
            localStorage.removeItem("submissionData");
            localStorage.removeItem("progress");
            localStorage.removeItem("submissionData");
            testResponses.responses = [];
            testResponses.responses = [];
            Swal.fire({
                title: "Cleaned Successfully",
                text: "The store has been flushed successfully.",
                icon: "success",
                timer: 500,
                showConfirmButton: false,
            }).then(() => {
                location.reload();
            });
        }
    });
}

function renderSubstanceOptions(substance) {
    const otherSubstanceName = localStorage.getItem("otherSubstanceName");
    return substance === "Other - specify"
        ? otherSubstanceName
            ? otherSubstanceName
            : "Other - specify"
        : substance;
}

function runAssistQ2Logic() {
    const table = document.querySelector(".table-borderless");

    if (table) {
        const rows = table.querySelectorAll("tbody tr");

        const updatedSubstances = [];
        rows.forEach((row) => {
            const substanceName = row.querySelector("td:first-child").innerText.trim();
            const options = [];
            row.querySelectorAll('input[type="radio"]').forEach((input) => {
                options.push({
                    id: input.value,
                    option: input.nextSibling.textContent.trim(),
                });
            });
            updatedSubstances.push({
                substance: substanceName,
                disabled: false,
            });
        });

        assistq2substances.value = updatedSubstances;
    }
}

const isSubstanceDisabled = (substance) => {
    const foundSubstance = assistq2substances.value.find(
        (sub) => sub.substance.toLowerCase() === substance.toLowerCase()
    );
    return foundSubstance ? foundSubstance.disabled : false;
};

function saveTextResponse(questionId) {
    // Ensure the text response is saved without affecting the radio button selection
    const questionText = currentQuestionText.value;
    const value = textResponses[questionId] || "";
    logQuestionAndResponseSchoolEnv(questionText, "Strongly Disagree", questionId, value);
}

</script>

<style scoped>
.screening-test {
    max-width: 90vw;
    margin: auto;
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.progress-container .progress {
    height: 12px;
    border-radius: 6px;
    overflow: hidden;
}

.progress-bar {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.bg-gradient-dark {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
}

.question-area .icon-container img {
    max-width: 100px;
    transition: transform 0.3s ease;
}

.question-text h2 {
    color: #2B656F;
    font-size: 22px;
    font-weight: 600;
    margin-top: 20px;
}

.answer-options {
    margin: 30px 0;
}

.answer-option button {
    background-color: #f0f7f8;
    border: 2px solid #2B656F;
    border-radius: 25px;
    padding: 15px 25px;
    margin: 10px;
    font-size: 14px;
    transition: all 0.3s ease;
}

.answer-option button.selected,
.answer-option button:hover {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    color: white;
}

.assist-container,
.school-env-container {
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 30px;
}

.table {
    background-color: transparent;
    border-collapse: separate;
    border-spacing: 0 10px;
}

.table thead th {
    border: none;
    padding: 15px;
    font-weight: 600;
    text-transform: uppercase;
}

.table tbody tr {
    background-color: #ffffff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.table tbody tr:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.table td {
    border: none;
    padding: 15px;
    vertical-align: middle;
}

.substance-name {
    font-weight: 500;
    color: #2B656F;
}

input[type="radio"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 30px;
    height: 30px;
    border: 2px solid #2B656F;
    border-radius: 50%;
    outline: none;
    transition: all 0.3s ease;
}

input[type="radio"]:checked {
    background-color: #2B656F;
    box-shadow: 0 0 0 3px #f0f7f8 inset;
}

.question-column {
    width: 30%;
}

.question-text {
    font-weight: 500;
    line-height: 1.6;
}

.form-control {
    border: 2px solid #2B656F;
    border-radius: 20px;
    padding: 10px 15px;
    transition: all 0.3s ease;
}

.form-control:focus {
    box-shadow: 0 0 0 3px rgba(43, 101, 111, 0.25);
}

.button-group {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
}

.rounded-btn {
    border-radius: 25px;
    padding: 10px 25px;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.back-button {
    background-color: transparent;
    border: 2px solid #2B656F;
    color: #2B656F;
}

.back-button:hover {
    background-color: #2B656F;
    color: white;
}

.submit-button {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    border: none;
    color: white;
}

.submit-button:hover {
    opacity: 0.9;
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .screening-test {
        max-width: 95vw;
        padding: 20px;
    }

    .question-text h2 {
        font-size: 24px;
    }

    .answer-option button {
        width: 100%;
    }

    .table thead {
        display: none;
    }

    .table,
    .table tbody,
    .table tr,
    .table td {
        display: block;
        width: 100%;
    }

    .table tr {
        margin-bottom: 15px;
    }

    .table td {
        text-align: right;
        padding-left: 50%;
        position: relative;
    }

    .table td::before {
        content: attr(data-label);
        position: absolute;
        left: 6px;
        width: 45%;
        padding-right: 10px;
        white-space: nowrap;
        text-align: left;
        font-weight: bold;
    }

    .button-group {
        flex-direction: column;
    }

    .rounded-btn {
        width: 100%;
    }
}

.table-row-disabled {
    opacity: 0.5;
    /* pointer-events: none; */
}
</style>
