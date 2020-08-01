<template>
    <div class="not-found-container">
        <h1 class="not-found-title">404</h1>
        <p class="not-found-message">Page Not Found</p>
        <router-link to="/" class="home-link">Go to Home</router-link>
    </div>
</template>

<script setup>
</script>

<style scoped>
.not-found-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f8f9fa;
    text-align: center;
    color: #343a40;
}

.not-found-title {
    font-size: 10rem;
    margin: 0;
}

.not-found-message {
    font-size: 1.5rem;
    margin: 1rem 0;
}

.home-link {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: #fff;
    text-decoration: none;
    border-radius: 0.25rem;
    transition: background-color 0.3s;
}

.home-link:hover {
    background-color: #0056b3;
}
</style>