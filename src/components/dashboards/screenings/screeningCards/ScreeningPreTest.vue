<template>
	<div class="card shadow-lg border-0 rounded-3 overflow-hidden">
		<div class="card-body p-0">
			<div class="row g-0">
				<div class="col-lg-8 p-5">
					<div v-if="loading" class="d-flex justify-content-center align-items-center" style="height: 300px;">
						<div class="spinner-border text-primary" role="status">
							<span class="visually-hidden">Loading...</span>
						</div>
					</div>
					<div v-else>
						<div v-if="clusterTestStatus === 'active'">
							<h1 class="fw-bold mb-4 hwss-primary">{{ clusterTestTitle }}</h1>
							<p class="lead mb-4">{{ clusterTestContent }}</p>
							<div class="alert alert-info mb-4" role="alert">
								<i class="bi bi-info-circle-fill me-2"></i>
								{{ clusterTestDisclaimer }}
							</div>
							<button @click="continueAction"
								class="btn btn-primary btn-lg w-100 py-3 fw-bold text-uppercase">
								Continue <i class="bi bi-arrow-right-circle ms-2"></i>
							</button>
						</div>
						<div v-else>
							<h2 class="h3 mb-4">No Tests Available</h2>
							<p class="lead mb-4">Currently, there are no tests available. In the meantime, consider
								reading these articles for mental health awareness:</p>
							<div class="list-group">
								<a v-for="(article, index) in articles" :key="index" :href="article.url" target="_blank"
									class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
									{{ article.title }}
									<i class="bi bi-box-arrow-up-right"></i>
								</a>
							</div>
						</div>
					</div>
				</div>
				<div class="col-lg-4 d-flex align-items-center justify-content-center bg-light p-5">
					<img :src="clusterTestIcon" :alt="app_name" class="img-fluid animated-icon" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import endpoints from "@/api";
import { useRouter } from "vue-router";

const router = useRouter();
const clusterTestTitle = ref("");
const clusterTestContent = ref("");
const clusterTestDisclaimer = ref("");
const clusterTestIcon = ref("");
const app_name = ref("");

const clusterTestStatus = ref("");
const loading = ref(true);
const cacheDuration = 5 * 60 * 1000;

const articles = [
	{ title: "Understanding Depression", url: "https://www.helpguide.org/articles/depression/depression-symptoms-and-warning-signs.htm" },
	{ title: "Anxiety Disorders", url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders" },
	{ title: "Coping with Drug Use and Addiction", url: "https://www.drugabuse.gov/publications/drugfacts/understanding-drug-use-addiction" },
	{ title: "Mental Health and Wellness", url: "https://www.mentalhealth.gov/basics/what-is-mental-health" },
];

const continueAction = () => {
	if (clusterTestStatus.value === 'active') {
		router.push('/student-dashboard/screening-start')
	}
};

async function checkClusterTestStatus() {
	const cacheKey = "clusterTestStatus";
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
		const response = await axios.get(endpoints.screeningPreTests);
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
		setTimeout(() => {
			loading.value = false;
		}, 1200);
	}
}

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
.animated-icon {
	transition: transform 0.3s ease-in-out;
}

.animated-icon:hover {
	transform: scale(1.05);
}

.list-group-item {
	transition: background-color 0.2s ease-in-out;
}

.list-group-item:hover {
	background-color: #f8f9fa;
}
</style>

<style scoped>
.border-div {
	border: 1px solid #c9c9c9;
	border-radius: 10px;
}

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

/* Loading animation styles */
.loading-container {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
}

.loading-spinner {
	border: 5px solid #f3f3f3;
	/* Light grey */
	border-top: 5px solid #2c6975;
	/* Blue */
	border-radius: 50%;
	width: 50px;
	height: 50px;
	animation: spin 1s linear infinite;
	margin-bottom: 10px;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}
</style>
