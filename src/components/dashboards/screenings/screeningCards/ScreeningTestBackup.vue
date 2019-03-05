<template>
	<div class="container-fluid screening-test p-0">
		<div class="card">
			<div class="card-header text-center">
				<div class="question-set-name" v-if="currentQuestion">
					<h4>{{ currentQuestionSetName }}</h4>
				</div>
			</div>

			<div class="card-body">
				<div class="progress-container py-3">
					<div class="progress" style="height: 10px; border-radius: 5px">
						<div class="progress-bar" role="progressbar" :style="{ width: progressPercentage + '%' }"
							aria-valuemin="0" aria-valuemax="100"></div>
					</div>
				</div>
				<div class="row">
					<div class="col-12">
						<div v-if="currentQuestionSetName !== 'School Environment (SCHOOL ENV)' && currentQuestionSetName !== 'Alcohol, Smoking and Substance Involvement Screening Test (ASSIST)'"
							class="card p-3 my-3 text-center bg-green">
							<h4>
								Over the last 2 weeks, how often have you been bothered by any of the
								following problems:
							</h4>
						</div>
					</div>
				</div>

				<div class="question-area text-center px-5" v-if="currentQuestion">
					<div class="row my-4 justify-content-center text-center">
						<div class="col d-flex justify-content-center align-items-center">
							<div class="icon-container d-inline-flex align-items-center">
								<img :src="iconURL" alt="Question Icon" style="max-width: 100px" class="mx-4 my-3" />
								<div class="question-text d-inline-block">
									<h2 class="text-capitalize" v-html="processedQuestionText"></h2>
								</div>
							</div>
						</div>
					</div>

					<div class="answer-options d-flex flex-wrap justify-content-center"
						v-if="currentQuestion.answers && currentQuestion.answers.length">
						<div class="answer-option" v-for="option in currentQuestion.answers" :key="option.id">
							<button :class="{ selected: selectedAnswer === option }" @click="selectAnswer(option)"
								class="btn btn-lg">
								{{ option.option }}
							</button>
						</div>
					</div>
					<div class="text-area-container text-center mt-4"
						v-if="!currentQuestion.answers || currentQuestion.answers.length === 0">
						<textarea v-model="textAnswer" placeholder="Your answer" class="text-input"></textarea>
						<button @click="nextQuestion" class="next-button btn my-4">Next</button>
					</div>
					<button v-if="isLastQuestion" @click="submitTest" class="btn btn-success mt-2">Submit</button>
				</div>
			</div>

			<div class="card-footer text-center">
				<div class="back-button-area my-0">
					<button @click="goBack" class="btn rounded-btn back-button">Back</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import axios from "axios";
import endpoints from "@/api";
import fallbackIcon from "@/assets/images/question.png";
import { useUserDetailsStore } from '@/stores/userDetails';
import Swal from 'sweetalert2';
import { useQuestionsStore } from '@/stores/useQuestionsStore';

const questionsStore = useQuestionsStore();
const userDetailsStore = useUserDetailsStore();
const userDetails = ref(userDetailsStore.$state);

const currentQuestionIndex = ref(0);
const questions = ref([]);
const selectedAnswer = ref(null);
const textAnswer = ref("");
const scores = ref({
	PHQ2: 0,
	GAD2: 0,
	currentSet: ''
});

// Adapted function for calculating age based on the reactive userDetails
function calculateAge(dob) {
	const birthDate = new Date(dob);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
}


// Reactive properties for user's age and age group
const userAge = computed(() => calculateAge(userDetails.value.dateOfBirth));
const userAgeGroup = computed(() => {
	const age = userAge.value;
	if (age < 14) return "Below 14";
	else if (age <= 18) return "14-18";
	else if (age <= 24) return "19-24";
	else return "25+";
});

console.log(userAge, userAgeGroup)

const questionSetNames = {
	1: "Patient Health Questionnaire-2 (PHQ-2)",
	2: "General Anxiety Disorder-2 (GAD-2)",
	3: "Patient Health Questionnaire-9 (PHQ-9)",
	4: "General Anxiety Disorder-7 (GAD-7)",
	5: "Alcohol, Smoking and Substance Involvement Screening Test (ASSIST)",
	6: "School Environment (SCHOOL ENV)",
};

const currentQuestionSetName = computed(() => {
	const questionSetId = questions.value[currentQuestionIndex.value]?.question_set || 1;
	return questionSetNames[questionSetId] || "Patient Health Questionnaire-2 (PHQ-2)";
});

const iconURL = computed(() => {
	const question = questions.value[currentQuestionIndex.value];
	return question && question.icon ? `${baseURL}${question.icon}` : fallbackIcon;
});

const nextQuestion = () => {
	if (currentQuestionIndex.value < questions.value.length - 1) {
		currentQuestionIndex.value += 1;
	}
	selectedAnswer.value = null;
	textAnswer.value = "";
};

const isLastQuestion = computed(() => {
	return currentQuestionIndex.value === questions.value.length - 1;
});


async function fetchQuestions() {
	try {
		const testTypeName = "Cluster Screening";
		const url = `${endpoints.ScreeningPreTests}?name=${testTypeName}`;
		const response = await axios.get(url);
		questionsStore.setQuestions(response.data[0].question_sets.flatMap(set => set.questions));
		const questionSetsDetails = response.data[0].question_sets_details;

		// Combine questions and assist questions
		const combinedQuestions = [];
		questionSetsDetails.forEach((setDetail) => {
			if (setDetail.question_set !== null) {
				// Add test name for each question
				setDetail.question_set.questions.forEach(q => {
					q.testName = questionSetNames[q.question_set];
					combinedQuestions.push(q);
				});
			}
			if (setDetail.assist_question_set !== null) {
				// Change question_set ID to 5 for ASSIST and add test name
				setDetail.assist_question_set.assist_questions.forEach(q => {
					q.question_set = 5; // Update ID for ASSIST
					q.testName = "Alcohol, Smoking and Substance Involvement Screening Test (ASSIST)";
					combinedQuestions.push(q);
				});
			}
		});

		// Update localStorage with the combined and updated list
		localStorage.setItem("combinedQuestions", JSON.stringify(combinedQuestions));
		questions.value = combinedQuestions; // Use the combined list directly
	} catch (error) {
		console.error("Error fetching questions:", error);
	}
}

const progressPercentage = computed(() => {
	return (currentQuestionIndex.value / (questions.value.length - 1)) * 100;
});

const currentQuestion = computed(() => {
	return questions.value[currentQuestionIndex.value] || {};
});

const processedQuestionText = computed(() => {
	let text = currentQuestion.value.text || "";
	const assistCommonPhrase = "In your life, have you ever tried the following? (NON-MEDICAL USE ONLY)";
	const commonPhrase = "Over the last 2 weeks, how often have you been bothered by any of the following problems?";

	// Remove the common phrase for PHQ/GAD questions
	if (currentQuestionSetName.value !== 'Alcohol, Smoking and Substance Involvement Screening Test (ASSIST)') {
		text = text.replace(commonPhrase, "").trim();
	} else {
		text = text.replace(assistCommonPhrase, "").trim();
	}

	if (text.includes(" or ")) {
		text = text.split(" or ").join(" OR ");
	}
	return text;
});


function selectAnswer(option) {
	selectedAnswer.value = option;
	// Update scores
	if (currentQuestionSetName.value.includes("PHQ-2")) {
		scores.value.PHQ2 += option.points;
		scores.value.currentSet = 'PHQ2';
	} else if (currentQuestionSetName.value.includes("GAD-2")) {
		scores.value.GAD2 += option.points;
		scores.value.currentSet = 'GAD2';
	}

	nextTick(() => {
		setTimeout(() => {
			if (scores.value.currentSet === 'PHQ2' && currentQuestionIndex.value === 1) {
				if (scores.value.PHQ2 < 3) {
					// Assuming GAD-2 has a different ID, for example, 2
					jumpToQuestionSet(2); // Use the correct ID for GAD-2
				} else {
					currentQuestionIndex.value += 1;
				}
			} else if (scores.value.currentSet === 'GAD2' && currentQuestionIndex.value === questions.value.findIndex(q => q.question_set === 2)) { // Assuming GAD-2 is ID 2
				if (scores.value.GAD2 < 3) {
					// Assuming School Environment has ID 6
					jumpToQuestionSet(6); // Jump directly to School Environment
				} else {
					currentQuestionIndex.value += 1;
				}
			} else {
				if (currentQuestionIndex.value < questions.value.length - 1) {
					currentQuestionIndex.value += 1;
				}
			}
		}, 800);
	});
}

// Adjusted Example: Using IDs directly
function jumpToQuestionSet(targetSetId) {
	const index = questions.value.findIndex(question => question.question_set === targetSetId);
	if (index !== -1) {
		currentQuestionIndex.value = index;
	} else {
		console.error("Set not found or logic error with ID:", targetSetId);
	}
}

const baseURL =
	window.location.hostname === "localhost" && window.location.port === "5173"
		? "http://127.0.0.1:8080"
		: "http://172.30.3.16";


async function loadQuestionsFromStorage() {
	const storedQuestions = JSON.parse(localStorage.getItem("combinedQuestions")) || [];
	if (storedQuestions.length > 0) {
		questions.value = storedQuestions;
	} else {
		await fetchQuestions();
	}
}

function goBack() {
	if (currentQuestionIndex.value > 0) {
		currentQuestionIndex.value -= 1;
	}
}

function submitTest() {
	Swal.fire('Congratulations!', 'Test completed!', 'success');
}

onMounted(() => {
	loadQuestionsFromStorage();
});
</script>

<style scoped>
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
