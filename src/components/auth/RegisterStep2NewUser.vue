<template>
    <div class="container mt-5 text-center">
        <h2 class="mb-4">Step 2: New User Registration</h2>
        <form @submit.prevent="fetchCitizenDetails">
            <div class="form-group">
                <label for="cid">CID Number:</label>
                <input type="text" id="cid" v-model="cid" class="form-control" required
                    :class="{ 'is-invalid': errorMessage }">
                <div class="invalid-feedback" v-if="errorMessage">{{ errorMessage }}</div>
            </div>
            <button type="submit" class="btn btn-primary">Next</button>
        </form>
        <div v-if="showSuccessMessage" class="alert alert-success mt-3" role="alert">
            Details fetched successfully!
        </div>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
import axios from 'axios';

const cid = ref('');
const errorMessage = ref('');
const showSuccessMessage = ref(false);
const emit = defineEmits(['go-to-next-step']);

const fetchCitizenDetails = async () => {
    try {
        const response = await axios.get(`http://localhost:8000/api/v1/access/get-citizen-details/${cid.value}`);
        if (response.data) {
            const citizenDetails = response.data;
            const mappedData = {
                identity_number: citizenDetails.cid,
                first_name: citizenDetails.firstName,
                middle_name: citizenDetails.middleName || '',
                last_name: citizenDetails.lastName,
                date_of_birth: formatDOB(citizenDetails.dob),
                gender: mapGender(citizenDetails.gender),
                mob_number: citizenDetails.mobileNumber,
                perm_add_village: citizenDetails.villageName,
                perm_add_gewog: citizenDetails.gewogName,
                perm_add_dzongkhag: citizenDetails.dzongkhagName,
                nationality: mapNationality(citizenDetails.country)
            };

            emit('go-to-next-step', 'step-three', mappedData);


            console.log('Response from Django:', citizenDetails);
            showSuccessMessage.value = true;

            setTimeout(() => {
                moveToStep3(citizenDetails);
            }, 3000);
        } else {
            errorMessage.value = 'Citizen details not found';
        }
    } catch (error) {
        errorMessage.value = error.response?.data?.error || 'An error occurred during fetching details';
    }
};

// Helper functions
function formatDOB(dob) {
    return dob.split('/').reverse().join('-'); 
}

function mapGender(gender) {
    return gender === 'F' ? 'Female' : 'Male';
}
function mapNationality(country) {
    if (!country || country.trim() === '') {
        return 'Bhutanese';
    }
    return country;
}

const moveToStep3 = (citizenDetails) => {
    emit('go-to-next-step', 'step-three', citizenDetails);
};

</script>

  