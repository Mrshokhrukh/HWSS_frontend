<template>
    <div class="container py-4">
        <div class="row">
            <div class="col-lg-8 mx-auto">
                <div class="card">
                    <div class="card-header">
                        Profile Information
                    </div>
                    <div class="card-body">
                        <form>
                            <!-- Row 1 -->
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="firstName" class="form-label">First Name</label>
                                    <input type="text" class="form-control" id="firstName" v-model="userDetails.firstName">
                                </div>
                                <div class="col-md-6">
                                    <label for="lastName" class="form-label">Last Name</label>
                                    <input type="text" class="form-control" id="lastName" v-model="userDetails.lastName">
                                </div>
                            </div>

                            <!-- Row 2 -->
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="email" v-model="userDetails.email">
                                </div>
                                <div class="col-md-6">
                                    <label for="mobNumber" class="form-label">Mobile Number</label>
                                    <input type="tel" class="form-control" id="mobNumber" v-model="userDetails.mobNumber">
                                </div>
                            </div>

                            <!-- Submit Button -->
                            <div class="text-center">
                                <button type="submit" class="btn btn-primary">Update Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
import { useUserDetailsStore } from '@/stores/userDetails';

const userDetailsStore = useUserDetailsStore();
const userDetails = ref(userDetailsStore.$state);
</script>
  
<style scoped>
/* Additional styles if needed */
</style>
  