<template>
    <div class="filter-form mb-5">
        <form @submit.prevent="applyFilters" class="filter-form-container">
            <!-- Year Wise Filter -->
            <div class="filter-item">
                <label for="year">Year:</label>
                <input id="year" v-model="filters.year" type="text" placeholder="Enter year" />
            </div>

            <!-- Gender Wise Filter -->
            <div class="filter-item">
                <label for="gender">Gender:</label>
                <select id="gender" v-model="filters.gender">
                    <option value="">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </div>

            <!-- Region Wise Filter -->
            <div class="filter-item">
                <label for="region">Region:</label>
                <select id="region" v-model="filters.region" @change="updateDzongkhags">
                    <option value="">Select Region</option>
                    <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
                </select>
            </div>

            <!-- Dzongkhag Wise Filter -->
            <div class="filter-item" v-if="filters.region">
                <label for="dzongkhag">Dzongkhag:</label>
                <select id="dzongkhag" v-model="filters.dzongkhag">
                    <option value="">Select Dzongkhag</option>
                    <option v-for="dzongkhag in dzongkhags[filters.region]" :key="dzongkhag" :value="dzongkhag">{{
                        dzongkhag }}</option>
                </select>
            </div>

            <!-- Age Wise Filter -->
            <div class="filter-item">
                <label for="age">Age Group:</label>
                <select id="age" v-model="filters.age">
                    <option value="">Select Age Group</option>
                    <option value="0-10">0 - 10</option>
                    <option value="11-20">11 - 20</option>
                    <option value="21-30">21 - 30</option>
                    <option value="31-40">31 - 40</option>
                    <option value="41-50">41 - 50</option>
                    <option value="51+">51+</option>
                </select>
            </div>

            <!-- Class Wise Filter -->
            <div class="filter-item">
                <label for="class">Class:</label>
                <input id="class" v-model="filters.class" type="text" placeholder="Enter class" />
            </div>

            <!-- Employment History Filter -->
            <div class="filter-item">
                <label for="employment">Employment History:</label>
                <input id="employment" v-model="filters.employmentHistory" type="text"
                    placeholder="Enter employment history" />
            </div>

            <button type="submit" class="filter-button">Apply Filters</button>
        </form>

        <!-- Display filtered results -->
        <div v-if="filteredData.length === 0">
            No results found.
        </div>
        <ul v-else>
            <li v-for="person in filteredData" :key="person.id">
                ID: {{ person.id }}, Name: {{ person.name }}, Year: {{ person.year }}, Gender: {{ person.gender }},
                Region: {{ person.region }}, Dzongkhag: {{ person.dzongkhag }}, Age: {{ person.age }}, Class: {{
                    person.class }}, Employment History: {{ person.employmentHistory }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

// Define reactive state for filters
const filters = reactive({
    year: '',
    gender: '',
    region: '',
    dzongkhag: '',
    age: '',
    class: '',
    employmentHistory: ''
});

// Sample data with expanded fields
const data = JSON.parse(sessionStorage.getItem('reportData')) || []

// Compute unique regions for dropdown
const regions = ref(['Western', 'Central', 'Eastern', 'Southern']);

// Compute dzongkhags for each region
const dzongkhags = ref({
    Western: ['Thimphu', 'Paro', 'Haa', 'Punakha', 'Gasa', 'Wangdue Phodrang'],
    Central: ['Trongsa', 'Bumthang', 'Zhemgang', 'Tsirang', 'Dagana', 'Sarpang'],
    Eastern: ['Mongar', 'Trashigang', 'Trashi Yangtse', 'Lhuentse', 'Pema Gatshel', 'Samdrup Jongkhar'],
    Southern: ['Chukha', 'Samtse', 'Dagana', 'Tsirang']
});

// Reactive state for filtered data
const filteredData = ref([]);

// Function to update dzongkhags based on selected region
const updateDzongkhags = () => {
    const selectedRegion = filters.region;
    filters.dzongkhag = ''; // Reset dzongkhag when region changes
};

// Function to apply filters
const applyFilters = () => {
    filteredData.value = data.filter(item => {
        let matches = true;
        // if (filters.year && item.year.toString() !== filters.year) matches = false;
        if (filters.gender && item.gender !== filters.gender) matches = false;
        // if (filters.region && item.region !== filters.region) matches = false;
        // if (filters.dzongkhag && item.dzongkhag !== filters.dzongkhag) matches = false;
        // if (filters.age && item.age !== filters.age) matches = false;
        // if (filters.class && item.class.toLowerCase().indexOf(filters.class.toLowerCase()) === -1) matches = false;
        // if (filters.employmentHistory && item.employmentHistory.toLowerCase().indexOf(filters.employmentHistory.toLowerCase()) === -1) matches = false;
        return matches;
    });
};

</script>

<style scoped>
.filter-form {
    padding: 20px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.filter-form-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
}

.filter-item {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 150px;
}

.filter-item label {
    margin-bottom: 5px;
    font-weight: bold;
}

.filter-item input,
.filter-item select {
    padding: 8px;
    border: 1px solid #ddd;
    background-color: #f9f9f9;
    border-radius: 5px;
    font-size: 14px;
}

.filter-button {
    padding: 10px 20px;
    border: none;
    background-color: #007bff;
    color: white;
    font-size: 14px;
    font-weight: bold;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.filter-button:hover {
    background-color: #0056b3;
}
</style>