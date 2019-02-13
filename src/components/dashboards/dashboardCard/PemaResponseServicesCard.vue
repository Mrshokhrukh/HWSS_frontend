<template>
    <div class="container text-center">
        <div class="row">
            <div class="col-md-12 d-flex align-items-center justify-content-center mt-3">
                <!-- Bind logo src dynamically -->
                <img class="img-fluid logo" :src="logoUrl" alt="Company Logo">
                <!-- Company name from JavaScript -->
                <h3 class="company-name">{{ companyName }}</h3>
            </div>

        </div>

        <div class="row text-content-center">
            <!-- Sections and services populated dynamically -->
            <div v-for="(section, index) in serviceSections" :key="index">
                <h5 class="text-center">{{ section.title }}</h5>
                <hr />
                <ul>
                    <li v-for="(service, index) in section.services" :key="index">
                        <a href="">{{ service }}</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';

const logoUrl = ref('');
const companyName = ref('The Pema Services');
const serviceSections = ref([
    {
        title: "Response Services",
        services: [
            "Helpline Service",
            "Case Management Services",
            "Post-vention Services to Families and Friends Affected by Suicide",
            "Adoption and Alternative Care Services"
        ]
    },
    {
        title: "Restorative and Rehabilitation Services",
        services: [
            "Treatment and Rehabilitation Services",
            "Protection and Reintegration Services",
            "Community and Outreach Services",
            "Referral Directory for SUD Services"
        ]
    }
]);

onMounted(async () => {
    try {
        const response = await axios.get(endpoints.settings);
        if (response.data && response.data.length > 0) {
            const data = response.data[0];
            // Set the logo URL dynamically
            logoUrl.value = data.response_service_logo;
        }
    } catch (error) {
        console.error('Error fetching details:', error);
    }
});
</script>

<style scoped>
ul {
    list-style-type: none;
    padding: 0;
}

.logo {
    max-width: 100px;
}

.company-name {
    display: inline-block;
    vertical-align: middle;
    margin-left: 10px;
    /* Adjust the left margin as needed */
    margin-top: 20px;
    /* Adds spacing above the company name */
}

.text-content-center h5 {
    margin-top: 30px;
    /* Adds spacing above section titles */
}

hr {
    margin: 20px auto;
    /* Adjusts horizontal rule styling */
    width: 80%;
    /* Adjusts the width of the horizontal rule */
}

a {
    color: #2B656F;
    /* Customize link color */
    text-decoration: none;
    /* Removes underline */
    transition: color 0.3s;
    /* Smooth transition for color change */
}

a:hover {
    color: #1D4851;
    /* Darkens the link color on hover */
}

</style>
