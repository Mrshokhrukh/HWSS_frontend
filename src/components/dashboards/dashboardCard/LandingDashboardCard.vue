<template>
	<div>
		<div v-if="loading" class="loader"></div>
		<div class="container">
			<div class="row">
				<div class="text-center col-md-8">
					<h1 class=" my-3">
						Hi, <span class="text-capitalized">{{ fullName }}</span>!
					</h1>
					<h3 class="my-4">
						Welcome to <span class="text-capitalized">{{ appName }}</span> Dashboard!
					</h3>
					<div class="text-center">
						<button class="btn text-center custom-btn arrow-button" @click="navigateToScreening">
							Screen your mental Health
						</button>
					</div>
				</div>
				<div class="col-md-4 d-flex align-items-center justify-content-center">
					<div class="brain-icon-wrapper">
						<img src="@/assets/images/brainicon.png" class="img-fluid animated-icon" alt="" />
					</div>
				</div>
			</div>

			<!-- Modal Popup -->
			<div v-if="showModal" class="modal-overlay" @click="showModal = false">
				<div class="modal-content custom-modal-content" @click.stop>
					<div class="modal-header">
						<h5 class="modal-title">Hello {{ fullName }}!</h5>
						<button type="button" class="close-button" @click="showModal = false">×</button>
					</div>
					<div class="modal-body text-start">
						<p v-if="clusterTestStatus === 'inactive'">
							Currently, there are no tests available. In the mean time, consider reading these articles
							for
							mental health awareness:
						</p>
						<p v-if="clusterTestStatus === 'disabled'">
							This test does not exist yet. Consider reading these articles for mental health awareness:
						</p>
						<ul>
							<li><a href="https://www.helpguide.org/articles/depression/depression-symptoms-and-warning-signs.htm"
									target="_blank">Understanding Depression <i
										class="fas fa-external-link-alt"></i></a>
							</li>
							<li><a href="https://www.nimh.nih.gov/health/topics/anxiety-disorders"
									target="_blank">Anxiety
									Disorders <i class="fas fa-external-link-alt"></i></a></li>
							<li><a href="https://www.drugabuse.gov/publications/drugfacts/understanding-drug-use-addiction"
									target="_blank">Coping with Drug Use and Addiction <i
										class="fas fa-external-link-alt"></i></a></li>
							<li><a href="https://www.mentalhealth.gov/basics/what-is-mental-health"
									target="_blank">Mental
									Health and Wellness <i class="fas fa-external-link-alt"></i></a></li>
						</ul>
					</div>
					<div class="modal-footer">
						<button class="btn custom-btn" @click="showModal = false">Close</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useUserDetailsStore } from "@/stores/userDetails";
import endpoints from "@/api";
import Swal from 'sweetalert2';

const router = useRouter();
const userDetailsStore = useUserDetailsStore();
const appName = ref("");
const showModal = ref(false);
const loading = ref(true);
const clusterTestStatus = ref("");

const fullName = computed(() => {
	const { firstName, middleName, lastName } = userDetailsStore.user;
	return `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();
});

async function fetchAppName() {
	try {
		const response = await axios.get(endpoints.settings);
		appName.value = response.data[0].app_name;
		loading.value = false;
	} catch (error) {
		console.error("Error fetching app name:", error);
		loading.value = false;
	}
}

async function navigateToScreening() {
	loading.value = true;
	try {
		const response = await axios.get(endpoints.screeningPreTests);
		const clusterTest = response.data.find((test) => test.name === "Cluster Screening");
		if (clusterTest) {
			clusterTestStatus.value = clusterTest.status;
			showModalBasedOnStatus(clusterTest.status);
		} else {
			console.error("Cluster test not found");
		}
	} catch (error) {
		console.error("Error fetching cluster test status:", error);
	} finally {
		loading.value = false;
	}
}


function showModalBasedOnStatus(status) {
	if (status === "active") {
		Swal.fire('Congratulations!', 'The questions are now available to screen.', 'success').then(() => {
			router.push("/student-dashboard/screening");
		});
	} else {
		showModal.value = true;
	}
}

onMounted(async () => {
	await fetchAppName();
});
</script>

<style scoped>
.custom-modal-content {
	border: 1px solid #ccc;
	border-radius: 8px;
	padding: 20px;
	background-color: #fff;
	/* Added background color for consistency */
	box-shadow: 4px 8px 16px rgba(0, 0, 0, 0.4);
}

.custom-btn {
	background-color: #2b656f;
	color: #fff;
	font-size: inherit;
	border: none;
	border-radius: 5px;
	cursor: pointer;
	transition: background-color 0.3s ease;
	width: 100%;
}

span.text-capitalized {
	color: #2b656f;
	text-transform: uppercase;
}

.arrow-button {
	position: relative;
	display: flex;
	align-items: center;
	padding: 10px 20px;
	background-color: #2b656f;
	color: #fff;
	border: none;
	border-radius: 20px;
	cursor: pointer;
}

.arrow-button::after {
	content: "\2192";
	font-size: 25px;
	font-weight: 800;
	font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
	position: absolute;
	right: -10px;
}

.arrow-button::before {
	content: "";
	width: 40px;
	height: 40px;
	background-color: #2b656f;
	border-radius: 50%;
	position: absolute;
	right: 0;
	transform: translateX(50%);
	display: flex;
	justify-content: center;
	align-items: center;
	border: 2px solid #fff;
}

.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.6);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 999;
}

.modal-overlay {
	animation: fadeIn 0.3s;
}

.modal-content {
	padding: 1rem;
	border-radius: 15px;
	max-width: 600px;
	background: white;
	box-shadow: 4px 8px 16px rgba(0, 0, 0, 0.4);
}

.modal-content p {
	font-size: 16px;
	line-height: 1.6;
	color: #333;
}

.modal-header,
.modal-body,
.modal-footer {
	padding: 20px;
	text-align: center;
}

.modal-title {
	font-size: 1.5rem;
	color: #2b656f;
}

.close-button {
	position: absolute;
	top: 10px;
	right: 15px;
	background: #f44336;
	color: white;
	border: none;
	border-radius: 50%;
	width: 30px;
	height: 30px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
}

.custom-btn:hover,
.close-button:hover {
	background-color: darken(#2b656f, 10%);
}

ul {
	list-style-type: none;
	padding: 0;
}

ul li a {
	color: #2b656f;
	text-decoration: none;
	line-height: 2.2rem;
}

ul li a:hover {
	text-decoration: underline;
}

.modal-overlay {
	animation: fadeIn 0.3s;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}

.loader,
.loader:after {
	border-radius: 50%;
	width: 10em;
	height: 10em;
}

.loader {
	margin: 60px auto;
	font-size: 10px;
	position: relative;
	text-indent: -9999em;
	border-top: 1.1em solid rgba(255, 255, 255, 0.2);
	border-right: 1.1em solid rgba(255, 255, 255, 0.2);
	border-bottom: 1.1em solid rgba(255, 255, 255, 0.2);
	border-left: 1.1em solid #2b656f;
	transform: translateZ(0);
	animation: load8 1.1s infinite linear;
}

@keyframes load8 {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

.row {
	border-radius: 8px;
	padding: 20px;
	margin-bottom: 20px;
}
</style>