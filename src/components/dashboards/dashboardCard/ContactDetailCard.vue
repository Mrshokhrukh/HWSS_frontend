<template>
    <div class="help-line-card">
        <div v-for="(helpline, index) in helplines" :key="index" class="helpline-item">
            <div class="icon-container">
                <img :src="helpline.icon" :alt="helpline.description">
            </div>
            <div class="helpline-info">
                <a :href="`tel:${helpline.number}`">
                    <h5>{{ helpline.name }}: {{ helpline.number }}</h5>
                </a>
                <p>{{ helpline.description }}</p>
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

onMounted(async () => {
    try {
        const response = await axios.get(endpoints.settings);
        if (response.data && response.data.length > 0) {
            const data = response.data[0];
            helplines.value = [
                {
                    number: data.helpline_number_1,
                    name: "PEMA Helpline",
                    description: "Call for PEMA Helpline Services",
                    icon: imgIcon
                },
                {
                    number: data.helpline_number_2,
                    name: "Protection Services",
                    description: "Call for Protection Services",
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
.help-line-card {
    display: flex;
    flex-direction: column;
}

.helpline-item {
    display: flex;
    align-items: center;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 10px;
}

.icon-container {
    margin-right: 1.5rem;
}

.icon-container img {
    width: 40px;
    height: 40px;
}

.helpline-info {
    flex: 1;
}

a {
    color: #2B656F;
    text-decoration: none;
    transition: color 0.3s ease;
}

a:hover {
    color: #1D4851;
}
</style>
  