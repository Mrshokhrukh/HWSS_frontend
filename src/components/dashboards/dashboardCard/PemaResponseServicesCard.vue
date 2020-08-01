<template>
    <div class="services-container">
        <div class="header-section">
            <div class="logo-wrapper">
                <img class="logo" :src="logoUrl" alt="Company Logo">
                <h2 class="company-name">{{ companyName }}</h2>
            </div>
        </div>

        <div class="services-grid">
            <div v-for="(section, index) in serviceSections" :key="index" class="service-card"
                :class="{ 'hover-effect': isHovered === index }" @mouseenter="isHovered = index"
                @mouseleave="isHovered = null">
                <div class="service-header">
                    <h3 class="service-title">{{ section.title }}</h3>
                </div>
                <div class="services-list">
                    <div v-for="(service, serviceIndex) in section.services" :key="serviceIndex" class="service-item">
                        <div class="service-content">
                            <div class="bullet"></div>
                            <a href="#" class="service-link">{{ service }}</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import logoUrl from '@/assets/images/HWSS-logoAsset 1.png'

const isHovered = ref(null);
const companyName = ref('The PEMA Services');
const serviceSections = ref([
    {
        title: "All Services",
        services: [
            "Helpline Services",
            "Protection Services",
            "Counselling Services",
            "Adoption and Alternative Care Services",
            "PEMA Home",
            "The PEMA Centre",
            "Mitshey Yarab Lamzang",
            "Reintegration and Aftercare Services"
        ]
    }
]);
</script>

<style scoped>
.services-container {
    max-width: 1200px;
    margin: 0 auto;
}


.logo-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.5rem;
    margin-bottom: 2rem;
}

.logo {
    width: 80px;
    height: auto;
    object-fit: contain;
}

.company-name {
    color: #2B656F;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    padding-bottom: 1rem;
}

.service-card {
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    overflow: hidden;
}

.service-card.hover-effect:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(43, 101, 111, 0.1);
}

.service-header {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    padding: 1rem 1.5rem;
    border-radius: 12px 12px 0 0;
}

.service-title {
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
}

.services-list {
    padding: 1rem;
}

.service-item {
    margin-bottom: 0.75rem;
}

.service-item:last-child {
    margin-bottom: 0;
}

.service-content {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    border-radius: 6px;
    transition: background-color 0.3s ease;
}

.service-content:hover {
    background-color: rgba(43, 101, 111, 0.05);
}

.bullet {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #2B656F;
    margin-top: 0.5rem;
}

.service-link {
    color: #2B656F;
    text-decoration: none;
    line-height: 1.4;
    transition: color 0.3s ease;
}

.service-link:hover {
    color: #1D4851;
}

/* Responsive Design */
@media (max-width: 768px) {
    .services-grid {
        grid-template-columns: 1fr;
    }

    .service-card {
        margin-bottom: 1rem;
    }

    .logo-wrapper {
        flex-direction: column;
        text-align: center;
    }

    .company-name {
        font-size: 1.25rem;
    }
}
</style>