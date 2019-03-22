<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <strong>Test Submissions</strong>
                    </div>
                    <div class="card-body">
                        <table class="table table-striped" aria-label="A list of test submissions">
                            <thead>
                                <tr>
                                    <th scope="col">Student ID</th>
                                    <th scope="col">Test Date</th>
                                    <th scope="col">Severity Level</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="testSubmission in testSubmissions" :key="testSubmission.id">
                                    <td>{{ testSubmission.student_id }}</td>
                                    <td>{{ formatDate(testSubmission.created_at) }}</td>
                                    <td>{{ testSubmission.severity }}</td>
                                    <td>
                                        <!-- View button -->
                                        <router-link :to="{ name: 'ViewTestSubmission', params: { id: testSubmission.id } }"
                                            class="btn btn-sm btn-primary">View</router-link>
                                        <!-- Edit button -->
                                        <router-link :to="{ name: 'EditTestSubmission', params: { id: testSubmission.id } }"
                                            class="btn btn-sm btn-warning">Edit</router-link>
                                        <!-- Delete button -->
                                        <button @click="deleteTestSubmission(testSubmission.id)"
                                            class="btn btn-sm btn-danger">Delete</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios';
import endpoints from '@/api'

const testSubmissions = ref([]);

onMounted(() => {
    fetchTestSubmissions();
});

function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

function deleteTestSubmission(id) {
    axios.delete(`/test-submissions/${id}`)
        .then(() => {
            const index = testSubmissions.value.findIndex(testSubmission => testSubmission.id === id)
            testSubmissions.value.splice(index, 1)
        })
        .catch(error => console.error(error))
}

async function fetchTestSubmissions() {
    try {
        const response = await axios.get(endpoints.testSubmissions);
        testSubmissions.value = response.data;
    } catch (error) {
        console.error('Error fetching test submissions:', error);
    }
}

</script>

