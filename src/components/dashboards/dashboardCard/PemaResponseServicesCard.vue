<template>
    <div class="container text-center py-3">
        <div class="row align-items-center justify-content-center">
            <img class="img-fluid logo" :src="logoUrl" alt="Company Logo">
            <h3 class="company-name">{{ companyName }}</h3>
        </div>

        <div class="row text-content-center">
            <div v-for="(section, index) in serviceSections" :key="index" class="col-md-12">
                <div class="section-container mb-4">
                    <h5>{{ section.title }}</h5>
                    <hr class="my-3">
                    <ul class="list-unstyled">
                        <li v-for="(service, index) in section.services" :key="index" class="my-2">
                            <a href="">{{ service }}</a>
                        </li>
                    </ul>
                </div>
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
            logoUrl.value = data.response_service_logo;
        }
    } catch (error) {
        console.error('Error fetching details:', error);
    }
});
</script>
  
<style scoped>
.logo {
    max-width: 100px;
    margin-right: 10px;
}

.company-name {
    color: #2B656F;
    font-size: 1.5rem;
}

.section-container {
    border: 1px solid #ccc;
    border-radius: 8px;
}

.text-content-center h5 {
    margin-top: 20px;
    font-weight: bold;
}

hr {
    margin: 15px auto;
    border-top: 1px solid #ccc;
    width: 80%;
}

a {
    color: #2B656F;
    text-decoration: none;
    transition: color 0.3s;
}

a:hover {
    color: #1D4851;
}
</style>
  