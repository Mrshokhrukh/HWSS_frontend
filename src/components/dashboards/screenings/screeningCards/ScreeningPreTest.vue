<template>
	<div class="row container-fluid p-5">
		<div class="col-md-8">
			<div v-if="loading">
				<!-- Placeholder for loading animation -->
				<p>Loading...</p>
			</div>
			<div v-else>
				<h1 class="text-center bold mb-4" v-if="clusterTestStatus === 'active'">
					{{ clusterTestTitle }}
				</h1>
				<p class="custom-font mb-4" v-if="clusterTestStatus === 'active'">
					{{ clusterTestContent }}
				</p>
				<p class="custom-text-color mb-5" v-if="clusterTestStatus === 'active'">
					{{ clusterTestDisclaimer }}
				</p>
				<div class="d-flex justify-content-center" v-if="clusterTestStatus === 'active'">
					<button class="btn btn-primary btn-lg custom-size-btn" @click="continueAction">
						Continue
					</button>
				</div>
				<div v-if="clusterTestStatus !== 'active'">
					<p>
						Currently, there are no tests available. In the meantime, consider reading
						these articles for mental health awareness:
					</p>
					<ul>
						<li>
							<a
								href="https://www.helpguide.org/articles/depression/depression-symptoms-and-warning-signs.htm"
								target="_blank"
								>Understanding Depression <i class="fas fa-external-link-alt"></i>
							</a>
						</li>
						<li>
							<a
								href="https://www.nimh.nih.gov/health/topics/anxiety-disorders"
								target="_blank"
								>Anxiety Disorders <i class="fas fa-external-link-alt"></i
							></a>
						</li>
						<li>
							<a
								href="https://www.drugabuse.gov/publications/drugfacts/understanding-drug-use-addiction"
								target="_blank"
								>Coping with Drug Use and Addiction
								<i class="fas fa-external-link-alt"></i
							></a>
						</li>
						<li>
							<a
								href="https://www.mentalhealth.gov/basics/what-is-mental-health"
								target="_blank"
								>Mental Health and Wellness <i class="fas fa-external-link-alt"></i
							></a>
						</li>
					</ul>
				</div>
			</div>
		</div>
		<div class="col-md-4 text-center">
			<img :src="clusterTestIcon" :alt="app_name" class="img-fluid animated-icon" />
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import endpoints from "@/api";

const clusterTestTitle = ref("");
const clusterTestContent = ref("");
const clusterTestDisclaimer = ref("");
const clusterTestIcon = ref("");
const app_name = ref("");

const clusterTestStatus = ref("");
const loading = ref(true);
const cacheDuration = 5 * 60 * 1000;

const emit = defineEmits(["continue"]);

const continueAction = () => {
	emit("continue");
};

async function checkClusterTestStatus() {
	const cacheKey = "clusterTestStatusCache";
	const cached = localStorage.getItem(cacheKey);
	const now = new Date().getTime();

	if (cached) {
		const { expiry, status } = JSON.parse(cached);
		if (now < expiry) {
			clusterTestStatus.value = status;
			loading.value = false;
			return;
		}
	}

	try {
		const response = await axios.get(endpoints.ScreeningPreTests);
		const clusterTest = response.data.find((test) => test.name === "Cluster Screening");
		if (clusterTest) {
			clusterTestStatus.value = clusterTest.status;
			localStorage.setItem(
				cacheKey,
				JSON.stringify({ expiry: now + cacheDuration, status: clusterTest.status })
			);
		}
	} catch (error) {
		console.error("Error fetching cluster test status:", error);
	} finally {
		loading.value = false;
	}
}

// Fetch data from the API when the component is mounted
onMounted(async () => {
	checkClusterTestStatus();
	try {
		const response = await axios.get(endpoints.settings);
		if (response && response.data && response.data.length > 0) {
			const data = response.data[0];
			clusterTestTitle.value = data.cluster_test_title;
			clusterTestContent.value = data.cluster_test_content;
			clusterTestDisclaimer.value = data.cluster_test_disclaimer;
			clusterTestIcon.value = data.cluster_test_icon;
			app_name.value = data.app_name;
		}
	} catch (error) {
		console.error("There was an error fetching the data:", error);
	}
});
</script>

<style scoped>
.custom-size-btn {
	width: 100%;
	height: auto;
	font-size: 18px;
	background-color: #2c6975;
}

.custom-text-color {
	color: #2c6975;
	font-weight: 800;
}

.custom-font {
	font-weight: 600;
}

ul {
	list-style-type: none;
	/* Remo
		ve bullet points */
	padding: 0;
}

ul li a {
	color: #2b656f;
	/* Primary app color */
	text-decoration: none;
	/* Remove underline */
	line-height: 2.2rem;
}

ul li a:hover {
	text-decoration: underline;
	/* Optional: add underline on hover for b1.2remetter UX */
}

/* Add this to give links a slight underline on hover, making it clear t-ey are clickable */
ul li a:hover {
	text-decoration: underline;
}
</style>
