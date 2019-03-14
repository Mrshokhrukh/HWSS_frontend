<template>
	<div :class="{ sidebar: true, 'sidebar-open': sidebarStore.isOpen }">
		<!-- User Profile Section -->
		<div class="user-profile text-center my-3">
			<img :src="profilePictureUrl" alt="User" :class="profilePicClass" />
			<h5 class="user-name mb-0" v-if="sidebarStore.isOpen">{{ fullName }}</h5>
		</div>

		<!-- Menu Items -->
		<div>
			<nav class="menu-items">
				<router-link v-for="(menu, index) in menus" :key="index" :to="menu.route" class="side-btn"
					:class="{ active: $route.path === menu.route }" v-b-tooltip.hover.bottom="menu.text">
					<i :class="menu.iconClass"></i>
					<span class="link-text" v-if="sidebarStore.isOpen">{{ menu.text }}</span>
				</router-link>
			</nav>
		</div>

		<!-- Logout and Toggle Icon -->
		<div class="logout mt-auto p-0">
			<router-link to="#" class="side-btn" @click="logout">
				<i class="fas fa-sign-out-alt"></i>
				<span class="link-text" v-if="sidebarStore.isOpen">Log Out</span>
			</router-link>
			<router-link to="#" class="side-btn" @click="toggle">
				<i :class="[sidebarStore.isOpen ? 'fas fa-chevron-left' : 'fas fa-chevron-right']"></i>
				<span class="link-text" v-if="sidebarStore.isOpen">Collapse</span>
			</router-link>
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
  const role = userDetailsStore.user.role.toLowerCase();

  const removeSchoolClinicalCounselor = (str) => {
    return str.replace(/^(school|clinical)?\s*counselor$/i, 'counselor').trim();
  };

  const toSlug = (str) => {
    return str.replace(/\s+/g, '-').toLowerCase();
  };

  const sanitizedRole = removeSchoolClinicalCounselor(role);

  return toSlug(sanitizedRole);
});



const fetchedMenus = ref([]);

sidebarStore.initializeSidebarState();

const toggle = () => {
	sidebarStore.toggle();
};

const profilePicClass = computed(() => {
	return sidebarStore.isOpen ? "profile-pic" : "mini-profile-pic";
});

const logout = async () => {
	const progressStore = useProgressStore();
	progressStore.resetStore();
	try {
		const response = await axios.post(endpoints.logOutUser);
		if (response.data.message === "Logout successful") {
			localStorage.clear();
			sessionStorage.clear();
			userDetailsStore.clearUserDetails();

			// Use SweetAlert2 for a better user experience
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
	} catch (error) {
		console.error("Logout failed:", error);
		// Optionally, you can also use Swal here to show an error message
		await Swal.fire({
			title: 'Error',
			text: 'Logout failed. Please try again.',
			icon: 'error',
			confirmButtonText: 'OK'
		});
	}
};

const menus = computed(() => {
	let baseRoute = `/${userType.value}-dashboard`;
	let staticMenuItems = [
		{ text: "Dashboard", route: baseRoute, iconClass: "fa-solid fa-toolbox" },
		{ text: "Profile", route: `${baseRoute}/profile`, iconClass: "fas fa-user" },
	];

	// Assuming userType.value contains the current user's role
	const role = userType.value;

	// Filter fetchedMenus for the current role and map to the required structure
	let dynamicMenuItems = fetchedMenus.value
		.filter((menu) => menu.roles.some((r) => r.name === role))
		.map((menu) => ({
			text: menu.name,
			route: menu.route,
			iconClass: menu.icon_class,
		}));

	// Combine static and dynamic menu items
	return [...staticMenuItems, ...dynamicMenuItems];
});

// Function to fetch menu items from the API
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
			: "http://172.30.3.5";
	return profilePicture.value ? baseUrl + profilePicture.value : deFaultProfilePic;
});

onMounted(() => {
	fetchMenuItems();
});
</script>

<style scoped>
.mini-profile-pic {
	width: 30px;
	height: 30px;
	margin: 2rem auto;
	border-radius: 50%;
	border: 3px solid white;
	object-fit: cover;
	object-position: top;
}

.sidebar {
	background-color: #2c6975;
	color: white;
	transition: width 0.3s ease-in-out;
	display: flex;
	flex-direction: column;
	padding-bottom: 3rem;
	position: fixed;
	z-index: 9999;
	height: 100vh;
}

.sidebar-open {
	width: 16%;
	height: 100vh;
}

.user-profile {
	background-color: #2c6975;
	padding: 0.5rem 0;
	transition: all 0.3s ease-in-out;
	overflow: hidden;
	height: auto;
}

.profile-pic {
	width: 100px;
	height: 100px;
	border-radius: 50%;
	border: 5px solid white;
	object-fit: cover;
	object-position: top;
	margin: 10px auto;
}

.user-name {
	color: white;
	font-size: 1rem;
}

.menu-items {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
}

.side-btn {
	display: flex;
	align-items: center;
	padding: 1rem;
	color: white;
	text-decoration: none;
	transition: background-color 0.3s;
}

.side-btn.active,
.side-btn:hover {
	background-color: #cde0c9;
	color: #2c6975;
	border-radius: 50px 0 0 50px;
}

.side-btn i {
	min-width: 20px;
}

.link-text {
	padding-left: 1rem;
}

.logout {
	padding: 1rem;
}

/* Adjust sidebar width when collapsed */
.sidebar:not(.sidebar-open) {
	width: 50px;
	/* Adjust according to your icon size */
}
</style>
