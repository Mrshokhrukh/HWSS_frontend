<template>
  <div class="screening-top-component">
    <div class="container">
      <div class="helpline-bar mt-1">
        <a href="#" class="helpline-link mb-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
            <path
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z">
            </path>
          </svg>
          Call 1010 or 113 For The PEMA Helpline Services
        </a>
        <a href="#" class="helpline-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
            <path
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z">
            </path>
          </svg>
          Call 1098 for the Protection Services
        </a>
      </div>

      <div class="title-card">
        <h1 class="title">Screening for Health & Wellbeing</h1>
      </div>
    </div>
  </div>
</template>

<style scoped>
.screening-top-component {
  position: absolute;
  top: 0;
  right: 0;
  width: 83%;
}

.container {
  margin: 0 auto;
}

.helpline-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.helpline-link {
  display: flex;
  align-items: center;
  color: #2c6975;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s ease;
}

.helpline-link:hover {
  color: #1a4149;
}

.helpline-link .icon {
  margin-right: 0.5rem;
}

.title-card {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c6975;
  margin: 0;
  line-height: 1.2;
}

@media (max-width: 768px) {
  .helpline-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .title {
    font-size: 2rem;
  }
}
</style>