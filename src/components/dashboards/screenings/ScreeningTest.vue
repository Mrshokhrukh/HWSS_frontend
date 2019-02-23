<template>
	<div class="row mt-1">
		<div class="col-md-12">
			<div class="mx-auto">
				<HelplineServices />
			</div>
			<div class="bg-white rounded mx-auto">
				<ScreeningPreTest class="mx-auto" style="width: 80vw" @continue="handleContinueAction" />
			</div>
		</div>
	</div>
</template>

<script setup>
import HelplineServices from "@/components/dashboards/screenings/screeningCards/HelplineServices.vue";
import ScreeningPreTest from "@/components/dashboards/screenings/screeningCards/ScreeningPreTest.vue";
import { useRouter } from "vue-router";

const router = useRouter();


const handleContinueAction = () => {
	router.push("/student-dashboard/screening-start");
};
</script>

<style scoped></style>
