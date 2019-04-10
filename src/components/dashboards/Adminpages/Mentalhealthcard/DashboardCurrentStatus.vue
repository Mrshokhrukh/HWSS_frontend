<template>
  
    <h1 class="text-center fw-bold mt-5 mb-4" style="color: #2c6975;">Current Status in Bhutan</h1>
    <div class="row justify-content-center">
      <div class="col-md-2 me-5">
        <div class="card bg-light mb-3" style="height: 160px; border-radius: 25px">
          <div class="card-body text-center">
            <h5 class="card-title" style="font-size: 16px;">Total Case Ongoing</h5>
            <div class="d-flex justify-content-between align-items-center">
              <i class="fas fa-user-injured ms-2" style="font-size: 60px;"></i>
              <!-- <p class="card-text display-4 fw-bold">{{ totalCaseOngoing }}</p> -->
              <p class="card-text display-4 fw-bold me-2 ms-2 " style="font-size: 65px;text-shadow: 0px 4px 4px #00000040">166</p>
            </div>
          </div>

        </div>
      </div>
      <div class="col-md-2 me-5">
        <div class="card bg-light mb-3" style="height: 160px; border-radius: 25px">
          <div class="card-body text-center">
            <h5 class="card-title" style="font-size: 16px;">Total Case Discontinue</h5>
            <div class="d-flex justify-content-between align-items-center">
              <i class="fas fa-exclamation-triangle me-2" style="font-size: 50px;"></i>
              <!-- <p class="card-text display-4 fw-bold">{{ totalCaseOngoing }}</p> -->
              <p class="card-text display-4 fw-bold me-2 ms-2" style="font-size: 65px;text-shadow: 0px 4px 4px #00000040">166</p>
            </div>
          </div>

        </div>
      </div>
      <div class="col-md-2">
        <div class="card bg-light mb-3" style="height: 160px; border-radius: 25px">
          <div class="card-body text-center">
            <h5 class="card-title" style="font-size: 16px;">Total Case Closed</h5>
            <div class="d-flex justify-content-between align-items-center">
              <i class="fas fa-check-circle me-2" style="font-size: 50px;"></i>
              <!-- <p class="card-text display-4 fw-bold">{{ totalCaseOngoing }}</p> -->
              <p class="card-text display-4 fw-bold me-2 ms-2" style="font-size: 65px;text-shadow: 0px 4px 4px #00000040">166</p>
            </div>
          </div>

        </div>
      </div>
      
    </div>
</template>
<style scoped>
/* Add custom styles here */
.display-4 {
  font-size: 2.5rem;
}

.card-title {
  font-size: 1.5rem;
}
</style>