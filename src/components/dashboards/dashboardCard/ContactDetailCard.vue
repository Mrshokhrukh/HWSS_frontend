<template>
    <div class="help-line-container">
        <div class="help-line-grid">
            <div v-for="(helpline, index) in helplines" :key="index" class="helpline-card"
                :class="{ 'pulse': isHovered === index }" @mouseenter="isHovered = index"
                @mouseleave="isHovered = null">
                <div class="card-content">
                    <div class="helpline-row">
                        <div class="icon-wrapper">
                            <div class="icon-circle">
                                <img :src="helpline.icon" :alt="helpline.description">
                            </div>
                        </div>
                        <div class="helpline-details">
                            <h3 class="helpline-name">{{ helpline.name }}</h3>
                            <a :href="`tel:${helpline.number}`" class="phone-number">
                                {{ formatPhoneNumber(helpline.number) }}
                            </a>
                            <p class="description">{{ helpline.description }}</p>
                        </div>
                        <div class="call-button-wrapper">
                            <a :href="`tel:${helpline.number}`" class="call-button">
                                Call Now
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';
import imgIcon from '@/assets/images/callicon.png';

const helplines = ref([]);
const isHovered = ref(null);

const formatPhoneNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `${match[1]} or ${match[2]}`;
    }
    return number;
};

onMounted(async () => {
    try {
        const response = await axios.get(endpoints.settings);
        if (response.data && response.data.length > 0) {
            const data = response.data[0];
            helplines.value = [
                {
                    number: data.helpline_number_1,
                    name: "PEMA Helpline",
                    description: "24/7 Emergency Assistance and Support Services",
                    icon: imgIcon
                },
                {
                    number: data.helpline_number_2,
                    name: "Protection Services",
                    description: "Immediate Protection and Safety Assistance",
                    icon: imgIcon
                }
            ];
        }
    } catch (error) {
        console.error('Error fetching details:', error);
    }
});
</script>

<style scoped>
.help-line-container {
    padding: 0.75rem;
    max-width: 1200px;
    margin: 0 auto;
    
}

.help-line-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.helpline-card {
    background: linear-gradient(135deg, #e6f3f5, #f0f7f8);
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    overflow: hidden;
}

.helpline-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-content {
    padding: 0.75rem;
}

.helpline-row {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.icon-wrapper {
    flex-shrink: 0;
}

.icon-circle {
    background: linear-gradient(135deg, #2B656F 0%, #1D4851 100%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
}

.icon-circle img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(0) invert(1);
}

.helpline-details {
    flex: 1;
    min-width: 0;
}

.helpline-name {
    font-size: 1rem;
    font-weight: 600;
    color: #1a202c;
    margin: 0 0 0.25rem 0;
}

.phone-number {
    display: block;
    font-size: 1rem;
    color: #2B656F;
    font-weight: 500;
    text-decoration: none;
    margin-bottom: 0.25rem;
}

.description {
    color: #4a5568;
    font-size: 0.875rem;
    line-height: 1.3;
    margin: 0;
}

.call-button-wrapper {
    flex-shrink: 0;
}

.call-button {
    display: inline-flex;
    align-items: center;
    background: #2B656F;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.875rem;
    transition: all 0.3s ease;
}

.call-button:hover {
    background: #1D4851;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(43, 101, 111, 0.4);
    }

    70% {
        box-shadow: 0 0 0 6px rgba(43, 101, 111, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(43, 101, 111, 0);
    }
}

.pulse {
    animation: pulse 2s infinite;
}

/* Responsive Design */
@media (max-width: 640px) {
    .helpline-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .call-button-wrapper {
        width: 100%;
    }

    .call-button {
        width: 100%;
        justify-content: center;
    }
}
</style>