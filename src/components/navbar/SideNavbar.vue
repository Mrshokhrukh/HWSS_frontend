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
		<div v-if="isRNDAdmin === 'rd_admin'" class="menu-container">
			<nav class="menu-items">
				<router-link class="side-btn" :class="{ active: $route.path === '/rd-admin' }"
					v-b-tooltip.hover.right="{ title: 'RD Admin Dashboard', disabled: sidebarStore.isOpen }">
					<i class="fas fa-tachometer-alt link-icon"></i>
					<span class="link-text" v-if="sidebarStore.isOpen">RD Admin Dashboard</span>
				</router-link>
			</nav>
		</div>
		<div v-else class="menu-container">
			<nav class="menu-items">
				<router-link v-for="(menu, index) in menus" :key="index" :to="menu.route" class="side-btn"
					:class="{ active: $route.path === menu.route }"
					v-b-tooltip.hover.right="{ title: menu.text, disabled: sidebarStore.isOpen }">
					<i :class="menu.iconClass" class="link-icon"></i>
					<span class="link-text" v-if="sidebarStore.isOpen">{{ menu.text }}</span>
				</router-link>
			</nav>
		</div>

		<!-- Logout and Toggle Icon -->
		<div class="sidebar-footer mt-auto">
			<router-link to="#" class="side-btn logout-btn" @click="logout"
				v-b-tooltip.hover.right="{ title: 'Log Out', disabled: sidebarStore.isOpen }">
				<i class="fas fa-sign-out-alt"></i>
				<span class="link-text" v-if="sidebarStore.isOpen">Log Out</span>
			</router-link>

			<button class="toggle-btn" @click="toggle"
				v-b-tooltip.hover.right="{ title: sidebarStore.isOpen ? 'Collapse' : 'Expand', disabled: sidebarStore.isOpen }">
				<i :class="[sidebarStore.isOpen ? 'fas fa-chevron-left' : 'fas fa-chevron-right']"></i>
				<span class="link-text" v-if="sidebarStore.isOpen">Collapse</span>
			</button>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import endpoints from "@/api";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useUserDetailsStore } from "@/stores/userDetails";
import { useProgressStore } from "@/stores/progressStore";
import deFaultProfilePic from "@/assets/images/icon.png";
import Swal from 'sweetalert2';

const router = useRouter();
const sidebarStore = useSidebarStore();
const userDetailsStore = useUserDetailsStore();

const fullName = computed(() => {
	const { firstName, middleName, lastName } = userDetailsStore.user;
	return `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();
});

const profilePicture = computed(() => userDetailsStore.user.profilePicture);

const userType = computed(() => {
	const role = userDetailsStore.user.role?.toLowerCase();
	if (!role) return "Public User";

	if (role.includes("admin")) return "Administrator";
	if (role.includes("counselor") || role.includes("professional")) return "Counselor";
	if (role === "student") return "Student";
	return role.charAt(0).toUpperCase() + role.slice(1);
});

const fetchedMenus = ref([]);

sidebarStore.initializeSidebarState();

const toggle = () => {
	sidebarStore.toggle();
};

const profilePicClass = computed(() => {
	return sidebarStore.isOpen ? "profile-pic" : "mini-profile-pic";
});

const menus = computed(() => {
	const baseRoute = `/${userType.value.toLowerCase()}-dashboard`;

	const staticMenuItems = [
		{ text: "Dashboard", route: baseRoute, iconClass: "fas fa-tachometer-alt" },
	];

	const role = userType.value.toLowerCase();

	const dynamicMenuItems = fetchedMenus.value
		.filter((menu) => menu.roles.some((r) => r.name === role))
		.map((menu) => ({
			text: menu.name,
			route: menu.route,
			iconClass: menu.icon_class,
		}));

	return [...staticMenuItems, ...dynamicMenuItems];
});

const fetchMenuItems = async () => {
	try {
		const response = await axios.get(endpoints.menuItem);
		fetchedMenus.value = response.data;
	} catch (error) {
		console.error("Error fetching menu items:", error);
	}
};

const profilePictureUrl = computed(() => {
	const baseUrl =
		window.location.hostname === "localhost" && window.location.port === "5173"
			? "http://localhost:8000"
			: "https://app.thepemasystem.gov.bt";
	return profilePicture.value ? baseUrl + profilePicture.value : deFaultProfilePic;
});

const adminRole = JSON.parse(localStorage.getItem('userDetailsStore'));
const userOriginalRole = adminRole.user.role;

const isRNDAdmin = computed(() => userOriginalRole === 'rd_admin');

const logout = async () => {
	const progressStore = useProgressStore();
	if (progressStore) {
		progressStore.resetStore();
	}

	try {
		if (endpoints.logOutUser) {
			const response = await axios.post(endpoints.logOutUser);
			if (response && response.data) {
				if (response.data.message === "Logout successful") {
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
				} else {
					console.error("Logout failed:", response.data.message);
				}
			}
		}
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

onMounted(() => {
	fetchMenuItems();
});
</script>

<style scoped>
.sidebar {
	background-color: #2c6975;
	color: white;
	transition: all 0.3s ease-in-out;
	display: flex;
	flex-direction: column;
	padding: 1rem 0;
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
	padding: 1rem;
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