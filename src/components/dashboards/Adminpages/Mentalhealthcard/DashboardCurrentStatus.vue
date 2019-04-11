<template>
  <h3 class="text-center fw-bold my-4 hwss-primary">Current Status in Bhutan</h3>
  <div class="row d-flex justify-content-center">

    <div v-for="(status, index) in statuses" :key="index" class="card col-3 bg-light mx-auto h-100" style=" border-radius: 15px">
      <h4 class="card-title text-center fw-bold mt-3">{{ status.title }}</h4>
      <div class="card-body text-center d-flex align-items-center justify-content-center">
     
          <span class="material-symbols-outlined hwss-primary display-3" >{{status.iconClass}}</span>
          <p class="card-text display-3 fw-bold me-2 ms-2 ">{{ status.count }}</p>

      </div>
    </div>

  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const statuses = ref([
      { title: 'Total Case Ongoing', iconClass: 'description', count: 156 },
      { title: 'Total Case Discontinue', iconClass: 'credit_card_off', count: 166 },
      { title: 'Total Case Closed', iconClass: 'fact_check', count: 166 }
    ]);

    return {
      statuses
    };
  }
};
</script>