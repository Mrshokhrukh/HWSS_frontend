<template>
	<div class="container-fluid">
		<header class="header">
			<!-- Header content goes here -->
		</header>

		<!-- General Dashboard View -->
		<div v-if="currentRoute === '/student-dashboard'">
			<div class="row g-4 my-2">
				<div class="col-md-8">
					<div class="card">
						<div class="card-body">
							<LandingDashboardCard :userName="userName" />
						</div>
					</div>
				</div>
				<div class="col-md-4">
					<div class="card h-100">
						<div class="card-body">
							<ContactDetailCard />
						</div>
					</div>
				</div>
			</div>
			<div class="row g-4 my-2">
				<div class="col-md-8">
					<div class="card m-0 p-0 h-100">
						<div class="card-body m-0 p-0">
							<ImageCard />
						</div>
					</div>
				</div>
				<div class="col-md-4">
					<div class="card h-100">
						<div class="container">
							<PemaResponseServicesCard />
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Screening Dashboard View -->
		<div v-if="currentRoute === '/student-dashboard/screening'" class="screening-dashboard">
			<ScreeningTest />
		</div>
		<!-- Screening Start Dashboard View -->
		<div v-if="currentRoute === '/student-dashboard/screening-start'" class="screening-dashboard">
			<ScreeningStart />
		</div>
		<!-- Screening Dashboard View -->
		<div v-if="currentRoute === '/student-dashboard/profile'" class="screening-dashboard">
			<StudentProfile />
		</div>

		<footer class="footer">
			<div class="container text-center my-4">
				<p>&copy; {{ currentYear }} {{ websiteName }}. All rights reserved.</p>
			</div>
		</footer>
	</div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import ContactDetailCard from "@/components/dashboards/dashboardCard/ContactDetailCard.vue";
import LandingDashboardCard from "@/components/dashboards/dashboardCard/LandingDashboardCard.vue";
import ImageCard from "@/components/dashboards/dashboardCard/ImageCard.vue";
import PemaResponseServicesCard from "@/components/dashboards/dashboardCard/PemaResponseServicesCard.vue";
import ScreeningTest from "@/components/dashboards/screenings/ScreeningTestContainer.vue";
import StudentProfile from "@/components/dashboards/profiles/StudentProfile.vue";
import ScreeningStart from "./screenings/ScreeningStart.vue";

const userName = ref("");
const route = useRoute();

const currentRoute = computed(() => route.path);

// Dynamically get the current year
const currentYear = new Date().getFullYear();

// Dynamically populate website name
const websiteName = "The PEMA HWSS";
</script>

<style scoped>
.container-fluid {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
}

.header {
	height: 8rem;
}

.footer {
	margin-top: auto;
}
</style>
