<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12 mt-3">
                <nav>
                    <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                        <button class="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home"
                            type="button" role="tab" aria-controls="nav-home" aria-selected="true">General Info</button>
                        <button class="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile"
                            type="button" role="tab" aria-controls="nav-profile" aria-selected="false">Counselor
                            Info</button>
                        <button class="nav-link" id="nav-contact-tab" data-bs-toggle="tab" data-bs-target="#nav-contact"
                            type="button" role="tab" aria-controls="nav-contact" aria-selected="false">Screening
                            Report</button>
                    </div>
                </nav>
                <div class="tab-content" id="nav-tabContent">
                    <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
                        <GeneralInfo />
                    </div>
                    <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">
                        <CounselorInfo />
                    </div>
                    <div class="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab">
                        <ScreeningReport />
                    </div>
                </div>
            </div>

        </div>
        <div class="row">
            <div class="col-12">
                <TopNavigationCards />
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <MonitorTable />
            </div>
        </div>
    </div>
</template>

<script setup>
import TopNavigationCards from "@/components/dashboards/counselorMonitor/counselorMonitorCards/TopNavigationCards.vue"
import MonitorTable from "@/components/dashboards/counselorMonitor/counselorMonitorCards/MonitorTable.vue"
</script>