<template>
    <div class="referral-manager">
      <div class="container-fluid p-4">
        <!-- Header Controls -->
        <div class="row g-3 mb-4 align-items-end">
          <!-- Search Box -->
          <div class="col-md-12">
            <div class="search-box">
              <div class="input-group input-group-lg shadow-sm">
                <span class="input-group-text bg-white border-end-0">
                  <i class="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  class="form-control border-start-0"
                  v-model="searchQuery"
                  placeholder="Search by name, status, etc..."
                  aria-label="Search referrals"
                />
                <Button
                  v-if="searchQuery"
                  icon="pi pi-times"
                  class="p-button-secondary p-button-text"
                  @click="searchQuery = ''"
                  aria-label="Clear search"
                />
              </div>
            </div>
          </div>
        </div>
  
        <!-- Tab Navigation -->
        <TabView v-model:activeIndex="activeTabIndex">
          <TabPanel header="My Referrals">
            <ReferralListTable
              v-if="currentUserId && activeTabIndex === 0"
              :user-id="currentUserId"
              :search-query="searchQuery"
              @refresh-needed="handleRefresh" 
            />
          </TabPanel>
          <TabPanel header="My Accepted Referrals">
            <ReferralAcceptedTable
              v-if="currentUserId && activeTabIndex === 1"
              :user-id="currentUserId"
              :search-query="searchQuery"
            />
          </TabPanel>
        </TabView>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import TabView from 'primevue/tabview';
  import TabPanel from 'primevue/tabpanel';
  import Button from 'primevue/button'; // For clear search button
  
  import ReferralListTable from './ReferralListTable.vue';
  import ReferralAcceptedTable from './ReferralAcceptedTable.vue';
  
  const searchQuery = ref('');
  const activeTabIndex = ref(0); // 0 for "My Referrals", 1 for "My Accepted Referrals"
  const currentUserId = ref(null);
  
  const getUserDetailsFromLocalStorage = () => {
    const userDetailsString = localStorage.getItem('userDetailsStore');
    if (userDetailsString) {
      try {
        const userDetails = JSON.parse(userDetailsString);
        currentUserId.value = userDetails.user.id;
      } catch (error) {
        console.error('Error parsing user details from local storage:', error);
        // Handle error, maybe redirect to login or show a message
      }
    } else {
      console.error('User details not found in local storage');
      // Handle error
    }
  };
  
  // A key to force re-render/re-fetch if needed, though child components should manage their own loading.
  // This is a simple way if a child emits an event that requires sibling/parent to know data changed.
  const refreshKey = ref(0);
  const handleRefresh = () => {
    refreshKey.value++; // If a child component (like ReferralListTable after accept/reject) needs to signal a general refresh.
                        // However, it's better if components refresh their own data.
                        // For now, we'll let child components handle their data re-fetch.
  };
  
  
  onMounted(() => {
    getUserDetailsFromLocalStorage();
  });
  
  // Watch for tab changes if you need to perform actions, though v-if handles component mounting.
  // watch(activeTabIndex, (newIndex) => {
  //   console.log('Switched to tab:', newIndex);
  // });
  </script>
  
  <style scoped>
  .referral-manager {
    background-color: #f8f9fa;
    min-height: 100%;
    padding: 1.5rem 0;
  }
  
  .search-box .input-group {
    background-color: white;
  }
  
  .search-box .input-group-text {
    border-color: #dee2e6;
  }
  
  .search-box .form-control {
    border-color: #dee2e6;
  }
  
  .search-box .form-control:focus {
    box-shadow: none;
    border-color: #86b7fe;
  }
  
  /* PrimeVue TabView Customization (Optional) */
  :deep(.p-tabview .p-tabview-nav) {
    background: #ffffff;
    border-bottom: 1px solid #dee2e6;
  }
  
  :deep(.p-tabview .p-tabview-nav li .p-tabview-nav-link) {
    background: #ffffff;
    border-color: transparent transparent #dee2e6 transparent !important;
    color: #495057;
    font-weight: 500;
  }
  
  :deep(.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link) {
    background: #ffffff;
    border-color: #2c6975 !important; /* Use your primary color */
    color: #2c6975; /* Use your primary color */
  }
  
  :deep(.p-tabview .p-tabview-panels) {
    background: #ffffff;
    padding: 1.5rem; /* Or use your table-container padding */
    border: 0 none;
    border-top: 1px solid #dee2e6; /* If tabs are above content */
    border-radius: 0 0 8px 8px; /* If you have rounded corners */
    margin-top: -1px; /* To align with nav border */
  }
  
  .table-container { /* This class was in your original referral-list, you might want to apply similar styling to p-tabview-panels */
      background-color: white;
      border: 1px solid #dee2e6;
      overflow: hidden;
      border-radius: 8px; /* Add border radius */
      box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* Add shadow */
      margin-top: 1rem; /* Add some space if not using TabView panels' default padding */
  }
  </style>