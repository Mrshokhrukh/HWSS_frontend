<template>
  <div class="container mt-5">
    <div class="row justify-content-center mb-3">
      <div class="col-md-8">
        <div class="card p-4" style="border: 1px solid #dee2e6;">
          <div class="row justify-content-center">
            <!-- Available Data -->
            <div class="col-md-5">
              <div class="data-list available">
                <div class="data-list-header">Available Data</div>
                <ul class="data-list-items">
                  <li v-for="item in availableData" :key="item.id" class="data-list-item" @click="toggleSelection(item)">
                    <div class="checkbox">
                      <input type="checkbox" :checked="isSelected(item)" />
                      <label>{{ item.name }}</label>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <!-- Selected Data -->
            <div class="col-md-5">
              <div class="data-list selected">
                <div class="data-list-header">Selected Data</div>
                <ul class="data-list-items">
                  <li v-for="item in selectedData" :key="item.id" class="data-list-item" @click="toggleSelection(item)">
                    <div class="checkbox">
                      <input type="checkbox" :checked="isSelected(item)" />
                      <label>{{ item.name }}</label>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <!-- Button to go to the next step -->
          <div class="text-center mt-4">
            <button class="btn btn-primary" @click="goToAttributes" :disabled="!selectedData.length">Next</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, getCurrentInstance } from 'vue'

// Inject selectedData from parent component
const selectedData = inject('selectedData')

const availableData = ref([
  { id: 1, name: 'Data 1', value: 'Value 1', number: 10 },
  { id: 2, name: 'Data 2', value: 'Value 2', number: 20 },
  { id: 3, name: 'Data 3', value: 'Value 3', number: 30 },
  { id: 4, name: 'Data 4', value: 'Value 4', number: 40 },
  { id: 5, name: 'Data 5', value: 'Value 5', number: 50 }
])

const toggleSelection = (item) => {
  const index = selectedData.value.findIndex(data => data.id === item.id)
  if (index === -1) {
    selectedData.value.push(item)
  } else {
    selectedData.value.splice(index, 1)
  }
}

const isSelected = (item) => {
  return selectedData.value.findIndex(data => data.id === item.id) !== -1
}

// Function to emit event to parent component to go to the next step (AttributesComponent)
const goToAttributes = () => {
  const { ctx } = getCurrentInstance()
  ctx.emit('goToAttributes')
}
</script>

<style scoped>
.container {
  font-family: Arial, sans-serif;
}

.card {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.data-list {
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.data-list-header {
  background-color: #343a40;
  color: #fff;
  padding: 8px 16px;
}

.data-list-items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.data-list-item {
  cursor: pointer;
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
}

.checkbox {
  margin-right: 8px;
}

.checkbox input[type="checkbox"] {
  margin-right: 8px;
}

.checkbox label {
  color: #212529;
}

.checkbox input[type="checkbox"]:checked + label {
  font-weight: bold;
}
</style>
