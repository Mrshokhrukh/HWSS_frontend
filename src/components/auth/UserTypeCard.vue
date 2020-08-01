<template>
    <div class="card text-center p-3 cursor-pointer" :class="{ 'border-primary': isSelected }" style="width: 200px;"
        @click="$emit('select')">
        <img :src="type.icon" :alt="type.name" class="card-img-top mx-auto mb-3" style="width: 64px; height: 64px;">
        <h3 class="card-title h5 text-primary">{{ type.name }}</h3>
    </div>
</template>

<script setup>
defineProps({
    type: {
        type: Object,
        required: true
    },
    isSelected: {
        type: Boolean,
        default: false
    }
});
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}

.card:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.border-primary {
    border-color: #2B656F !important;
    border-width: 2px;
}

.text-primary {
    color: #2B656F !important;
}
</style>