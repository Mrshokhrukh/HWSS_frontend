<template>
	<div :class="{ sidebar: true, 'sidebar-open': sidebarStore.isOpen }">
		<!-- User Profile Section -->
		<div class="user-profile text-center my-3">
			<div class="profile-image-container">
				<img :src="profilePictureUrl" alt="User" :class="profilePicClass" />
				<span class="status-indicator online"></span>
			</div>
			<transition name="fade">
				<div v-if="sidebarStore.isOpen" class="user-info mt-2">
					<h5 class="user-name mb-0">{{ fullName }}</h5>
					<small class="user-role text-light-green">{{ userType }}</small>
				</div>
			</transition>
		</div>

		<!-- Menu Items -->
		<div class="menu-container">
			<nav class="menu-items">
				<template v-for="(menu, index) in filteredMenus" :key="index">
					<router-link :to="menu.route" class="side-btn" :class="{ active: $route.path === menu.route }"
						v-b-tooltip.hover.right="{ title: menu.text, disabled: sidebarStore.isOpen }">
						<i :class="menu.iconClass" class="link-icon"></i>
						<span class="link-text" v-if="sidebarStore.isOpen">{{ menu.text }}</span>
					</router-link>
				</template>
			</nav>
		</div>

		<!-- Logout and Toggle Icon -->
		<div class="sidebar-footer mt-auto">
			<router-link to="#" class="side-btn logout-btn" @click="logout"
				v-b-tooltip.hover.right="{ title: 'Log Out', disabled: sidebarStore.isOpen }">
				<i class="fas fa-sign-out-alt me-3"></i>
				<span class="link-text" v-if="sidebarStore.isOpen">Log Out</span>
			</router-link>

			<button class="toggle-btn d-none" @click="toggle"
				v-b-tooltip.hover.right="{ title: sidebarStore.isOpen ? 'Collapse' : 'Expand', disabled: sidebarStore.isOpen }">
				<i :class="[sidebarStore.isOpen ? 'fas fa-chevron-left' : 'fas fa-chevron-right']"></i>
				<span class="link-text" v-if="sidebarStore.isOpen">Collapse</span>
			</button>
		</div>
	</div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useUserDetailsStore } from "@/stores/userDetails";
import { useProgressStore } from "@/stores/progressStore";
import deFaultProfilePic from "@/assets/images/icon.png";
import Swal from 'sweetalert2';

const router = useRouter();
const sidebarStore = useSidebarStore();
const userDetailsStore = useUserDetailsStore();

// Static menu definitions
const menuConfig = {
	student: [
		{ text: "Dashboard", route: "/student-dashboard", iconClass: "fas fa-tachometer-alt" },
		{ text: "Screening", route: "/student-dashboard/screening", iconClass: "fas fa-question-circle" },
		{ text: "Profile", route: "/student-dashboard/profile", iconClass: "fas fa-user" }
	],
	counselor: [
		{ text: "Dashboard", route: "/counselor-dashboard", iconClass: "fas fa-tachometer-alt" },
		{ text: "Screening", route: "/counselor-dashboard/counselor-screening", iconClass: "fa-solid fa-person-circle-question" },
		{ text: "Monitor", route: "/counselor-dashboard/counselor-monitor", iconClass: "fa-solid fa-clipboard-list" },
		{ text: "Reports", route: "/counselor-dashboard/counselor-reports", iconClass: "fa-solid fa-file-waveform" },
		{ text: "Help", route: "/counselor-dashboard/counselor-help", iconClass: "fa-solid fa-circle-question" },
		{ text: "Settings", route: "/counselor-dashboard/counselor-settings", iconClass: "fa-solid fa-gear" }
	],
	admin: [
		{ text: "Dashboard", route: "/admin-dashboard", iconClass: "fas fa-tachometer-alt" },
		{ text: "Approval", route: "/admin-dashboard/admin-approval", iconClass: "fa-regular fa-thumbs-up" },
		{ text: "Reports", route: "/admin-dashboard/admin-report", iconClass: "fa-regular fa-file-lines" },
		{ text: "Help", route: "/admin-dashboard/admin-help", iconClass: "fa-regular fa-circle-question" },
		{ text: "Settings", route: "/admin-dashboard/admin-settings", iconClass: "fa-solid fa-screwdriver-wrench" }
	],
	limited_admin: [
		{ text: "Dashboard", route: "/admin-dashboard", iconClass: "fas fa-tachometer-alt" },
		{ text: "Reports", route: "/admin-dashboard/admin-report", iconClass: "fa-regular fa-file-lines" },
		{ text: "Help", route: "/admin-dashboard/admin-help", iconClass: "fa-regular fa-circle-question" },
		{ text: "Settings", route: "/admin-dashboard/admin-settings", iconClass: "fa-solid fa-screwdriver-wrench" }
	],
	rnd_limited_admin: [
		{ text: "Dashboard", route: "/admin-dashboard", iconClass: "fas fa-tachometer-alt" },
		{ text: "Help", route: "/admin-dashboard/admin-help", iconClass: "fa-regular fa-circle-question" },
		{ text: "Settings", route: "/admin-dashboard/admin-settings", iconClass: "fa-solid fa-screwdriver-wrench" }
	]
};

const fullName = computed(() => {
	const { firstName, middleName, lastName } = userDetailsStore.user;
	return `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();
});

const profilePicture = computed(() => userDetailsStore.user.profilePicture);

const userType = computed(() => {
	const role = userDetailsStore.user.role?.toLowerCase() || "public_user";

	if (role.includes("admin")) {
		return "Administrator";
	}

	switch (role) {
		case "student":
			return "Student";
		default:
			if (role.includes("counselor") || role.includes("professional")) {
				return "Counselor";
			}
			return "Public User";
	}
});

const filteredMenus = computed(() => {
	const role = userDetailsStore.user.role?.toLowerCase();

	// Special handling for CECD_ADMIN
	if (role === 'cecd_admin') {
		return menuConfig.limited_admin;
	}

	// Special handling for RD_ADMIN
	if (role === 'rd_admin') {
		return menuConfig.rnd_limited_admin;
	}

	// Regular role-based menu selection
	if (role === 'student') return menuConfig.student;
	if (role.includes('counselor') || role.includes('trained')) return menuConfig.counselor;
	if (role.includes('admin')) return menuConfig.admin;

	return []; // Default empty menu if no role matches
});

const profilePicClass = computed(() => {
	return sidebarStore.isOpen ? "profile-pic" : "mini-profile-pic";
});

const profilePictureUrl = computed(() => {
	const baseUrl =
		window.location.hostname === "localhost" && window.location.port === "5173"
			? "http://localhost:8000"
			: "https://thepemasystem.gov.bt";
	return profilePicture.value ? baseUrl + profilePicture.value : deFaultProfilePic;
});

const toggle = () => {
	sidebarStore.toggle();
};

const logout = async () => {
	const progressStore = useProgressStore();
	if (progressStore) {
		progressStore.resetStore();
	}

	try {
		if (localStorage) {
			for (let key in localStorage) {
				if (key !== 'userScreenedToday') {
					localStorage.removeItem(key);
				}
			}
		}
		if (sessionStorage) {
			sessionStorage.clear();
		}
		if (userDetailsStore) {
			userDetailsStore.clearUserDetails();
		}

		await Swal.fire({
			title: 'Logged Out',
			text: 'You have been successfully logged out of the system.',
			icon: 'success',
			showConfirmButton: false,
			timer: 1200
		});

		router.push("/login");
	} catch (error) {
		console.error("Logout failed:", error);
		await Swal.fire({
			title: 'Error',
			text: 'Logout failed. Please try again.',
			icon: 'error',
			confirmButtonText: 'OK'
		});
	}
};
</script>

<style scoped>
.sidebar {
	background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
	color: white;
	display: flex;
	flex-direction: column;
	padding: 1rem 0 0 0;
	position: fixed;
	z-index: 999;
	height: 100vh;
	width: 4.5rem;
	overflow-x: hidden;
}

.sidebar-open {
	width: 16%;
}

.user-profile {
	padding: 0.5rem;
	transition: all 0.3s ease-in-out;
}

.profile-image-container {
	position: relative;
	display: inline-block;
}

.profile-pic,
.mini-profile-pic {
	width: 80px;
	height: 80px;
	border-radius: 50%;
	border: 3px solid #cde0c9;
	object-fit: cover;
	object-position: top;
	transition: all 0.3s ease-in-out;
}

.mini-profile-pic {
	width: 40px;
	height: 40px;
}

.status-indicator {
	position: absolute;
	bottom: 5px;
	right: 5px;
	width: 12px;
	height: 12px;
	border-radius: 50%;
	background-color: #4CAF50;
	border: 2px solid #2c6975;
}

.user-info {
	margin-top: 0.5rem;
}

.user-name {
	color: white;
	font-size: 1rem;
	margin-bottom: 0.2rem;
}

.user-role {
	font-size: 0.8rem;
	opacity: 0.8;
}

.menu-container {
	flex-grow: 1;
	overflow-y: auto;
	margin-top: 1rem;
}

.menu-items {
	display: flex;
	flex-direction: column;
}

.side-btn {
	display: flex;
	align-items: center;
	padding: 0.8rem 1rem;
	color: white;
	text-decoration: none;
	transition: all 0.3s ease;
	border-radius: 0 25px 25px 0;
	margin: 0.2rem 0;
}

.side-btn:hover,
.side-btn.active {
	background-color: #cde0c9;
	color: #2c6975;
}

.link-icon {
	font-size: 1.2rem;
	width: 1.5rem;
	text-align: center;
	margin-right: 1rem;
}

.link-text {
	font-size: 0.9rem;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sidebar-footer {
	margin-top: auto;
	padding: 0 1rem;
}

.logout-btn,
.toggle-btn {
	width: 100%;
	padding: 0.8rem;
	margin-top: 0.5rem;
	background: none;
	border: none;
	color: white;
	cursor: pointer;
	transition: all 0.3s ease;
	text-align: left;
	border-radius: 25px;
}

.logout-btn:hover,
.toggle-btn:hover {
	background-color: rgba(255, 255, 255, 0.1);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

/* Scrollbar styling */
.menu-container::-webkit-scrollbar {
	width: 5px;
}

.menu-container::-webkit-scrollbar-track {
	background: #2c6975;
}

.menu-container::-webkit-scrollbar-thumb {
	background: #cde0c9;
	border-radius: 5px;
}

.menu-container::-webkit-scrollbar-thumb:hover {
	background: #a8c7a4;
}
</style>