<template>
    <div class="help-line-card">
        <ul>
            <li v-for="(helpline, index) in helplines" :key="index">
                <img src="@/assets/images/callicon.png" alt="Call Icon">
                <a :href="`tel:${helpline.number}`">Call {{ helpline.number }} {{ helpline.description }}</a>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import endpoints from '@/api';

const helplines = ref([]);

onMounted(async () => {
    try {
        const response = await axios.get(endpoints.settings);
        if (response.data && response.data.length > 0) {
            const data = response.data[0];
            helplines.value = [
                { number: data.helpline_number_1, description: "For The PEMA Helpline Services" },
                { number: data.helpline_number_2, description: "For The Protection Services" }
            ];
        }
    } catch (error) {
        console.error('Error fetching details:', error);
    }
});
</script>

<style scoped>
ul {
    list-style-type: none;
    /* Removes bullets */
    padding: 0;
    /* Removes default padding */
    margin: 0;
    /* Removes default margin */
}

li {
    margin-bottom: 10px;
    /* Adds space between list items */
    display: flex;
    /* Aligns the icon and text side by side */
    align-items: center;
    /* Centers items vertically */
}

li:last-child {
    margin-bottom: 0;
    /* Removes margin from the last item */
}

li img {
    margin-right: 10px;
    /* Adds space between the icon and the text */
}

a {
    color: #2B656F;
    /* Changes link color */
    text-decoration: none;
    /* Removes underline from links */
    line-height: 1.5;
    /* Improves line spacing for better readability */
    transition: color 0.3s ease;
    /* Smooth transition for link color on hover */
}

a:hover {
    color: #1D4851;
    /* Darkens link color on hover for visual feedback */
}
</style>
