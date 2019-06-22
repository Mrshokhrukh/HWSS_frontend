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
                    <option v-for="dzongkhag in filteredDzongkhags" :key="dzongkhag" :value="dzongkhag">{{ dzongkhag }}
                    </option>
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
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const filters = ref({
    year: '',
    gender: '',
    region: '',
    dzongkhag: '',
    age: '',
    class: '',
    employmentHistory: ''
});

const regions = ref(['Western', 'Central', 'Eastern', 'Southern']);
const dzongkhags = ref({
    Western: ['Thimphu', 'Paro', 'Haa', 'Punakha', 'Gasa', 'Wangdue Phodrang'],
    Central: ['Trongsa', 'Bumthang', 'Zhemgang', 'Tsirang', 'Dagana', 'Sarpang'],
    Eastern: ['Mongar', 'Trashigang', 'Trashi Yangtse', 'Lhuentse', 'Pema Gatshel', 'Samdrup Jongkhar'],
    Southern: ['Chukha', 'Samtse', 'Dagana', 'Tsirang']
});

const updateDzongkhags = () => {
    filters.value.dzongkhag = '';
};

const filteredDzongkhags = computed(() => {
    return filters.value.region ? dzongkhags.value[filters.value.region] : [];
});

const applyFilters = () => {
    // Log the current filter values
    console.log("Current Filter Values:", filters.value);

    // Retrieve data from sessionStorage
    const storedData = JSON.parse(sessionStorage.getItem('reportData')) || [];
    console.log("Initial Stored Data:", storedData);

    // Apply filters
    let filteredData = storedData.filter(item => {
        // Log item for debugging
        console.log("Processing item:", item);

        // Filter by year
        if (filters.value.year && item.measurement && item.measurement.created_at) {
            const filterYear = parseInt(filters.value.year, 10);
            const measurementDate = new Date(item.measurement.created_at);
            console.log('Measurement Date:', measurementDate, 'Filter Year:', filterYear);

            // Check if the measurement date year matches the filter year
            if (measurementDate.getFullYear() !== filterYear) {
                console.log('Filtering out item due to year mismatch.');
                return false;
            }
        }

        // Additional filters can be added here for gender, region, age, etc.

        return true;
    });

    // Log filteredData to console for verification
    console.log("Filtered Data:", filteredData);

    // Return filtered data
    return filteredData;
};

// Ensure the filters object is reactive and updates correctly
watch(filters, (newFilters) => {
    console.log("Filters updated:", newFilters);
});

// Helper function to calculate age
const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

// Helper function to determine region from dzongkhag
const getRegion = (dzongkhag) => {
    for (const region in dzongkhags.value) {
        if (dzongkhags.value[region].includes(dzongkhag)) {
            return region;
        }
    }
    return '';
};

// Call applyFilters initially
const filteredData = applyFilters();

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