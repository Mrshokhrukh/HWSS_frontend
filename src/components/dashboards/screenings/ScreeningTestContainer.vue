<template>
	<div class="row main-card">
		<div class="mx-auto">
			<ScreeningPreTest class="mx-auto mt-5"  @continue="handleContinueAction" />
		</div>
	</div>
</template>

<script setup>
import ScreeningPreTest from "@/components/dashboards/screenings/screeningCards/ScreeningPreTest.vue";
import { useRouter } from "vue-router";

const router = useRouter();


const handleContinueAction = () => {
	router.push("/student-dashboard/screening-start");
};
</script>

<style scoped>
</style>
