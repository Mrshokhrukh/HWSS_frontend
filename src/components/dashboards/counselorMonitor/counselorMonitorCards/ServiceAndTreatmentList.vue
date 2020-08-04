```vue
<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-content">
        <h4 class="dashboard-title">
          <i class="bi bi-clipboard2-pulse me-2"></i>
          Service and Treatment List
        </h4>
        <p class="dashboard-subtitle">Comprehensive view of patient records and treatments</p>
      </div>
      <div class="header-actions">
        <div class="stats-pills">
          <div class="stat-pill">
            <i class="bi bi-people-fill"></i>
            <span>Total: {{ processedRows.length }}</span>
          </div>
          <div class="stat-pill">
            <i class="bi bi-calendar-check"></i>
            <span>Active: {{ getActiveCount() }}</span>
          </div>
        </div>
        <select v-model="selectedYear" @change="getServiceList" class="year-filter">
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
        <Button class="refresh-btn" @click="getServiceList">
          <i class="bi bi-arrow-clockwise me-2"></i>
          Refresh List
        </Button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner-wrapper">
        <div class="spinner"></div>
        <p>Loading patient records...</p>
      </div>
    </div>

    <div v-else-if="hasError" class="error-state">
      <div class="error-content">
        <i class="bi bi-exclamation-triangle"></i>
        <p>Error loading data. Please try again.</p>
        <Button class="retry-btn" @click="getServiceList">Retry</Button>
      </div>
    </div>

    <div class="table-wrapper">
      <DataTable
        :value="processedRows"
        :paginator="true"
        :rows="10"
        :paginatorTemplate="paginatorTemplate"
        :sortField="sortField"
        :sortOrder="sortOrder"
        @sortChange="onSortChange"
        resizableColumns
        columnResizeMode="fit"
        class="custom-datatable"
        :scrollable="true"
        scrollHeight="calc(100vh - 280px)"
        :rowClass="rowClass"
        :loading="isLoading"
        v-model:filters="filters"
        :globalFilterFields="[
          'full_name',
          'age',
          'user.gender',
          'assessment_status',
          'case_status',
          'counseling',
          'follow_up'
        ]"
        ref="dt"
      >
        <Column field="date" header="Date" sortable>
          <template #body="slotProps">
            <div class="date-cell">
              <span class="date-primary">{{ formatDatePrimary(slotProps.data.date) }}</span>
              <span class="date-secondary">{{ formatDateSecondary(slotProps.data.date) }}</span>
            </div>
          </template>
        </Column>

        <Column field="full_name" header="Patient Details" sortable>
          <template #body="slotProps">
            <div class="patient-cell">
              <div class="patient-name">{{ slotProps.data.full_name }}</div>
              <div class="patient-details">
                <span class="age-gender">
                  {{ calculateAge(slotProps.data.user?.date_of_birth) }} yrs •
                  {{ slotProps.data.user?.gender }}
                </span>
              </div>
            </div>
          </template>
        </Column>
        <Column field="assessment_status" header="Assessment" sortable>
          <template #body="slotProps">
            <StatusBadge :status="slotProps.data.assessment_status" type="assessment" />
          </template>
        </Column>
        <Column field="case_status" header="Case Status" sortable>
          <template #body="slotProps">
            <StatusBadge :status="slotProps.data.case_status" type="case" />
          </template>
        </Column>
        <Column field="counseling" header="Counseling" sortable>
          <template #body="slotProps">
            <StatusBadge :status="slotProps.data.counseling" type="counseling" />
          </template>
        </Column>
        <Column field="follow_up" header="Follow Up" sortable>
          <template #body="slotProps">
            <div class="follow-up-cell">
              <StatusBadge :status="slotProps.data.follow_up" type="follow-up" />
              <span v-if="isRecentUpdate(slotProps.data.updated_at)" class="update-badge">
                Updated
              </span>
            </div>
          </template>
        </Column>

        <Column header="Actions" :exportable="false" style="min-width: 8rem">
          <template #body="slotProps">
            <div class="actions-cell">
              <Button
                class="action-btn view-btn"
                @click="viewDetails(slotProps.data, 'view')"
                v-tooltip.top="'View Details'"
              >
                <i class="bi bi-eye-fill"></i>
              </Button>
              <Button
                v-if="canEdit && slotProps.data.case_status !== 'Case Closed'"
                class="action-btn edit-btn"
                @click="viewDetails(slotProps.data, 'edit')"
                v-tooltip.top="'Edit Record'"
              >
                <i class="bi bi-pencil-fill"></i>
              </Button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="showModal"
      :modal="true"
      :closable="false"
      :style="{ width: '75vw', maxWidth: '1800px', height: '95vh' }"
      :breakpoints="{ '991px': '98vw' }"
      class="custom-modal"
    >
      <div class="modal-wrapper">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ isEditMode ? 'Edit Record' : 'View Record' }}
            <span class="modal-subtitle">{{ selectedUser?.full_name }}</span>
          </h3>
          <div class="modal-actions">
            <Button
              v-if="!isEditMode && canEdit"
              class="edit-mode-btn"
              @click="switchToEditMode"
            >
              <i class="bi bi-pencil-fill me-2"></i>
              Switch to Edit
            </Button>
            <Button
              icon="pi pi-times"
              @click="handleModalClose"
              class="p-button-rounded p-button-text"
            />
          </div>
        </div>

        <div class="d-flex position-relative" style="height: calc(100vh - 120px); overflow: hidden">
          <div class="modal-sidebar bg-light border-end overflow-auto" style="width: 320px">
            <div class="p-3">
              <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                  <div class="d-flex align-items-center">
                    <div
                      class="d-flex align-items-center justify-content-center bg-light rounded-circle p-3 me-4"
                      style="width: 64px; height: 64px"
                    >
                      <i class="bi bi-person-circle fs-1 hwss-primary"></i>
                    </div>

                    <div>
                      <h4 class="mb-1 fw-bold">
                        {{ selectedUser?.user?.first_name }} {{ selectedUser?.user?.last_name }}
                      </h4>
                      <div class="d-flex align-items-center">
                        <i class="bi bi-person-badge me-2 hwss-primary"></i>
                        <span class="fw-medium">{{ formatRole(selectedUser?.user?.role) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white py-3 border-bottom">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-person-badge fs-4 me-2 hwss-primary"></i>
                    <h5 class="mb-0 fw-semibold">Basic Information</h5>
                  </div>
                </div>

                <div class="card-body p-4">
                  <div class="row g-4 mb-4">
                    <div class="col-6">
                      <div class="d-flex align-items-center">
                        <div
                          class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                        >
                          <i class="bi bi-calendar3 hwss-primary"></i>
                        </div>
                        <div>
                          <small class="text-muted d-block">Age</small>
                          <span class="fw-medium">{{
                            calculateAge(selectedUser?.user?.date_of_birth)
                          }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="col-6">
                      <div class="d-flex align-items-center">
                        <div
                          class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                        >
                          <i class="bi bi-gender-ambiguous hwss-primary"></i>
                        </div>
                        <div>
                          <small class="text-muted d-block">Sex</small>
                          <span class="fw-medium">{{ selectedUser?.user?.gender }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="row g-4 mb-3">
                    <div class="col-12">
                      <div class="d-flex align-items-center">
                        <div
                          class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                        >
                          <i class="bi bi-person-badge-fill hwss-primary"></i>
                        </div>
                        <div>
                          <small class="text-muted d-block">Employee ID</small>
                          <span class="fw-medium">{{
                            selectedUser?.user?.academy_code || 'N/A'
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="row g-4">
                    <div class="col-12">
                      <div class="d-flex align-items-center">
                        <div
                          class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                        >
                          <i class="bi bi-credit-card-2-front hwss-primary"></i>
                        </div>
                        <div>
                          <small class="text-muted d-block">Citizen ID</small>
                          <span class="fw-medium">{{ selectedUser?.user?.identity_number }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white py-3 border-bottom">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-building fs-4 me-2 hwss-primary"></i>
                    <h5 class="mb-0 fw-semibold">Agency Information</h5>
                  </div>
                </div>

                <div class="card-body p-4">
                  <div class="d-flex align-items-center">
                    <div
                      class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                    >
                      <i class="bi bi-briefcase hwss-primary"></i>
                    </div>
                    <div>
                      <small class="text-muted d-block">Active Agency</small>
                      <span class="fw-medium">{{
                        selectedUser?.user?.active_agency?.agency_name
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white py-3 border-bottom">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-person-lines-fill fs-4 me-2 hwss-primary"></i>
                    <h5 class="mb-0 fw-semibold">Personal Details</h5>
                  </div>
                </div>

                <div class="card-body p-4">
                  <div class="d-flex flex-column gap-4">
                    <div class="d-flex align-items-center">
                      <div
                        class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                      >
                        <i class="bi bi-telephone hwss-primary"></i>
                      </div>
                      <div>
                        <small class="text-muted d-block">Contact Number</small>
                        <span class="fw-medium">{{ selectedUser?.user?.mob_number || 'N/A' }}</span>
                      </div>
                    </div>

                    <div class="d-flex align-items-center">
                      <div
                        class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                      >
                        <i class="bi bi-person-heart hwss-primary"></i>
                      </div>
                      <div>
                        <small class="text-muted d-block">Mother's Name</small>
                        <span class="fw-medium">{{
                          selectedUser?.user?.mother_name || 'N/A'
                        }}</span>
                      </div>
                    </div>

                    <div class="d-flex align-items-center">
                      <div
                        class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                      >
                        <i class="bi bi-person hwss-primary"></i>
                      </div>
                      <div>
                        <small class="text-muted d-block">Father's Name</small>
                        <span class="fw-medium">{{
                          selectedUser?.user?.father_name || 'N/A'
                        }}</span>
                      </div>
                    </div>

                    <div class="d-flex align-items-center">
                      <div
                        class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                      >
                        <i class="bi bi-briefcase-fill hwss-primary"></i>
                      </div>
                      <div>
                        <small class="text-muted d-block">Parents' Occupation</small>
                        <span class="fw-medium">{{
                          selectedUser?.user?.agency_details?.parent_occupation || 'N/A'
                        }}</span>
                      </div>
                    </div>

                    <div class="d-flex align-items-center">
                      <div
                        class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                      >
                        <i class="bi bi-people-fill hwss-primary"></i>
                      </div>
                      <div>
                        <small class="text-muted d-block">Parental Status</small>
                        <span class="fw-medium">{{
                          selectedUser?.user?.agency_details?.parent_status || 'N/A'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white py-3 border-bottom">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-geo-alt-fill fs-4 me-2 hwss-primary"></i>
                    <h5 class="mb-0 fw-semibold">Address Information</h5>
                  </div>
                </div>

                <div class="card-body p-4">
                  <div class="mb-4">
                    <div class="d-flex align-items-center mb-3">
                      <i class="bi bi-house-fill fs-5 me-2 hwss-primary"></i>
                      <h6 class="fw-semibold mb-0">Permanent Address</h6>
                    </div>

                    <div class="ps-4">
                      <div class="mb-3">
                        <div class="d-flex align-items-center">
                          <div
                            class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                          >
                            <i class="bi bi-signpost-2 hwss-primary"></i>
                          </div>
                          <div>
                            <small class="text-muted d-block">Village</small>
                            <span class="fw-medium">{{
                              selectedUser?.user?.perm_add_village || 'N/A'
                            }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="mb-3">
                        <div class="d-flex align-items-center">
                          <div
                            class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                          >
                            <i class="bi bi-geo hwss-primary"></i>
                          </div>
                          <div>
                            <small class="text-muted d-block">Gewog</small>
                            <span class="fw-medium">{{
                              selectedUser?.user?.perm_add_gewog || 'N/A'
                            }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="mb-3">
                        <div class="d-flex align-items-center">
                          <div
                            class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                          >
                            <i class="bi bi-building hwss-primary"></i>
                          </div>
                          <div>
                            <small class="text-muted d-block">Dzongkhag</small>
                            <span class="fw-medium">{{
                              selectedUser?.user?.perm_add_dzongkhag || 'N/A'
                            }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div class="d-flex align-items-center mb-3">
                      <i class="bi bi-house-door-fill fs-5 me-2 hwss-primary"></i>
                      <h6 class="fw-semibold mb-0">Present Address</h6>
                    </div>

                    <div class="ps-4">
                      <div class="mb-3">
                        <div class="d-flex align-items-center">
                          <div
                            class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                          >
                            <i class="bi bi-signpost-2 hwss-primary"></i>
                          </div>
                          <div>
                            <small class="text-muted d-block">Village</small>
                            <span class="fw-medium">{{
                              selectedUser?.user?.ps_add_village || 'N/A'
                            }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="mb-3">
                        <div class="d-flex align-items-center">
                          <div
                            class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                          >
                            <i class="bi bi-geo hwss-primary"></i>
                          </div>
                          <div>
                            <small class="text-muted d-block">Gewog</small>
                            <span class="fw-medium">{{
                              selectedUser?.user?.ps_add_gewog || 'N/A'
                            }}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div class="d-flex align-items-center">
                          <div
                            class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                          >
                            <i class="bi bi-building hwss-primary"></i>
                          </div>
                          <div>
                            <small class="text-muted d-block">Dzongkhag</small>
                            <span class="fw-medium">{{
                              selectedUser?.user?.ps_add_dzongkhag || 'N/A'
                            }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-main-content flex-grow-1 overflow-auto">
            <div class="p-4">
              <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white py-3 border-bottom">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-journal-medical fs-4 me-2 hwss-primary"></i>
                    <h5 class="mb-0 fw-semibold">Past Mental Health Records</h5>
                  </div>
                </div>

                <div class="card-body p-4">
                  <div v-if="selectedUser?.diagnosis?.length">
                    <div
                      v-for="(record, index) in selectedUser.diagnosis"
                      :key="index"
                      class="mb-3"
                    >
                      <div class="d-flex align-items-start p-3 bg-light rounded-3">
                        <div
                          class="d-flex align-items-center justify-content-center bg-white rounded-circle p-2 me-3"
                        >
                          <i class="bi bi-clipboard2-pulse hwss-primary"></i>
                        </div>
                        <div>
                          <span class="fw-medium">{{ record }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-center py-4">
                    <div class="d-flex flex-column align-items-center">
                      <div
                        class="d-flex align-items-center justify-content-center bg-light rounded-circle p-3 mb-3"
                      >
                        <i class="bi bi-clipboard-x fs-4 text-muted"></i>
                      </div>
                      <span class="text-muted">No past mental health records available</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white py-3 border-bottom">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-activity fs-4 me-2 hwss-primary"></i>
                    <h5 class="mb-0 fw-semibold">Mental Health Severity</h5>
                  </div>
                </div>

                <div class="card-body p-4">
                  <div class="row g-3">
                    <div class="col-12">
                      <div class="d-flex align-items-center">
                        <div
                          class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                        >
                          <i class="bi bi-clipboard2-pulse hwss-primary"></i>
                        </div>
                        <div class="flex-grow-1">
                          <small class="text-muted d-block">PHQ-9 Score</small>
                          <div class="d-flex align-items-center mt-1">
                            <span class="fw-medium">Depression Severity:</span>
                            <span
                              class="ms-2 badge"
                              :class="
                                getSeverityClass(
                                  selectedUser.screening_data?.phq_interpretation || 'None'
                                )
                              "
                            >
                              {{ selectedUser.screening_data?.phq_interpretation || 'None' }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-12">
                      <div class="d-flex align-items-center">
                        <div
                          class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                        >
                          <i class="bi bi-graph-up hwss-primary"></i>
                        </div>
                        <div class="flex-grow-1">
                          <small class="text-muted d-block">GAD-7 Score</small>
                          <div class="d-flex align-items-center mt-1">
                            <span class="fw-medium">Anxiety Severity:</span>
                            <span
                              class="ms-2 badge"
                              :class="
                                getSeverityClass(
                                  selectedUser.screening_data?.gad_interpretation || 'None'
                                )
                              "
                            >
                              {{ selectedUser.screening_data?.gad_interpretation || 'None' }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-12">
                      <div class="d-flex align-items-center">
                        <div
                          class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                        >
                          <i class="bi bi-shield-check hwss-primary"></i>
                        </div>
                        <div class="flex-grow-1">
                          <small class="text-muted d-block">ACE Score</small>
                          <div class="d-flex align-items-center mt-1">
                            <span class="fw-medium">Childhood Experience:</span>
                            <span
                              class="ms-2 badge"
                              :class="
                                getSeverityClass(
                                  selectedUser.screening_data?.ace_interpretation || 'None'
                                )
                              "
                            >
                              {{ selectedUser.screening_data?.ace_interpretation || 'None' }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white py-3 border-bottom">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-clipboard2-pulse-fill fs-4 me-2 hwss-primary"></i>
                    <h5 class="mb-0 fw-semibold">SUD Severity</h5>
                  </div>
                </div>

                <div class="card-body p-4">
                  <template v-if="selectedUser.substanceRisks">
                    <div class="row g-4">
                      <div
                        v-for="(value, key) in filteredSubstanceRisks"
                        :key="key"
                        class="col-12 col-md-6"
                      >
                        <div class="d-flex align-items-center h-100 bg-light rounded-3 p-3">
                          <div
                            class="d-flex align-items-center justify-content-center bg-white rounded-circle p-2 me-3"
                          >
                            <i class="bi bi-exclamation-diamond hwss-primary"></i>
                          </div>
                          <div>
                            <div class="fw-medium mb-1">{{ formatSubstanceName(key) }}</div>
                            <div class="d-flex align-items-center">
                              <span class="badge" :class="getRiskClass(value.measurement)">
                                {{ value.measurement }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>

                  <div v-else class="text-center py-4">
                    <div class="d-flex flex-column align-items-center">
                      <div
                        class="d-flex align-items-center justify-content-center bg-light rounded-circle p-3 mb-3"
                      >
                        <i class="bi bi-clipboard-x fs-4 text-muted"></i>
                      </div>
                      <span class="text-muted">No substance use risk data available</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white py-3 border-bottom">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-droplet-fill fs-4 me-2 hwss-primary"></i>
                    <h5 class="mb-0 fw-semibold">Drug Intake by Injection</h5>
                  </div>
                </div>

                <div class="card-body p-4">
                  <template
                    v-if="
                      selectedUser.injectionRisk &&
                      selectedUser.injectionRisk.measurement === 'High Risk'
                    "
                  >
                    <div class="d-flex align-items-center bg-light rounded-3 p-3">
                      <div
                        class="d-flex align-items-center justify-content-center bg-white rounded-circle p-2 me-3"
                      >
                        <i class="bi bi-heart-pulse hwss-primary"></i>
                      </div>
                      <div>
                        <div class="fw-medium mb-1">Injection Risk Level</div>
                        <div class="d-flex align-items-center">
                          <span
                            class="badge"
                            :class="getRiskClass(selectedUser.injectionRisk.measurement)"
                          >
                            {{ selectedUser.injectionRisk.measurement }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </template>

                  <template
                    v-else-if="
                      selectedUser.injectionRisk &&
                      selectedUser.injectionRisk.measurement === 'No Risk'
                    "
                  >
                    <div class="d-flex align-items-center bg-light rounded-3 p-3">
                      <div
                        class="d-flex align-items-center justify-content-center bg-white rounded-circle p-2 me-3"
                      >
                        <i class="bi bi-shield-check hwss-primary"></i>
                      </div>
                      <div>
                        <div class="fw-medium mb-1">Injection Risk Level</div>
                        <div class="d-flex align-items-center">
                          <span
                            class="badge"
                            :class="getRiskClass(selectedUser.injectionRisk.measurement)"
                          >
                            {{ selectedUser.injectionRisk.measurement }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <div class="card border-0 shadow-sm mb-4" :class="{ 'opacity-75': !isEditMode }">
                <div class="card-header bg-white py-3 border-bottom">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-clipboard2-check fs-4 me-2 hwss-primary"></i>
                      <h5 class="mb-0 fw-semibold">Services and Treatment</h5>
                    </div>
                    <div v-if="!isEditMode" class="badge bg-light text-secondary">View Mode</div>
                  </div>
                </div>

                <div class="card-body p-4">
                  <div class="row g-4">
                    <div class="col-md-6">
                      <div class="d-flex align-items-start">
                        <div
                          class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                        >
                          <i class="bi bi-clipboard-check hwss-primary"></i>
                        </div>
                        <div class="flex-grow-1">
                          <label for="assessmentStatus" class="form-label fw-medium mb-2"
                            >Assessment Status</label
                          >
                          <select
                            class="form-select"
                            id="assessmentStatus"
                            v-model="selectedUser.assessment_status"
                            :disabled="!isEditMode || selfRole === 'trained_professional'"
                          >
                            <option value="Not Conducted">Not Conducted</option>
                            <option value="Conducted">Conducted</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div class="col-md-6">
                      <div class="d-flex align-items-start">
                        <div
                          class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                        >
                          <i class="bi bi-folder-check hwss-primary"></i>
                        </div>
                        <div class="flex-grow-1">
                          <label for="caseStatus" class="form-label fw-medium mb-2"
                            >Case Status</label
                          >
                          <select
                            class="form-select"
                            id="caseStatus"
                            v-model="selectedUser.case_status"
                            :disabled="!isEditMode"
                          >
                            <option value="On Going">On Going</option>
                            <option value="Case Closed">Case Closed</option>
                            <option value="Case Discontinued">Case Discontinued</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div class="col-md-6">
                      <div class="d-flex align-items-start">
                        <div
                          class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                        >
                          <i class="bi bi-chat-right-text hwss-primary"></i>
                        </div>
                        <div class="flex-grow-1">
                          <label for="counselingStatus" class="form-label fw-medium mb-2"
                            >Counseling Status</label
                          >
                          <select
                            class="form-select"
                            id="counselingStatus"
                            v-model="selectedUser.counseling_status"
                            :disabled="!isEditMode || selfRole === 'trained_professional'"
                          >
                            <option value="Availed">Availed</option>
                            <option value="Not Required">Not Required</option>
                            <option value="Waiting List">Waiting List</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div class="col-md-6">
                      <div class="d-flex align-items-start">
                        <div
                          class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                        >
                          <i class="bi bi-calendar-check hwss-primary"></i>
                        </div>
                        <div class="flex-grow-1">
                          <label for="followUpStatus" class="form-label fw-medium mb-2"
                            >Follow Up Status</label
                          >
                          <select
                            class="form-select"
                            id="followUpStatus"
                            v-model="selectedUser.follow_up"
                            :disabled="!isEditMode"
                          >
                            <option value="Treatment Completed">Treatment Completed</option>
                            <option value="Undergoing Treatment">Undergoing Treatment</option>
                            <option value="Completed Counselling Sessions">
                              Completed Counselling Sessions
                            </option>
                            <option value="Unwilling to Undergo Treatment">
                              Unwilling to Undergo Treatment
                            </option>
                            <option value="Undergone Rehabilitation">
                              Undergone Rehabilitation
                            </option>
                            <option value="Undergoing Rehabilitation">
                              Undergoing Rehabilitation
                            </option>
                            <option
                              value="Hospital-based Outpatient SUD Treatment and Care (Primary Phase)"
                            >
                              Hospital-based Outpatient SUD Treatment and Care (Primary Phase)
                            </option>
                            <option
                              value="Hospital-based Outpatient SUD Treatment and Care (Continuing Care)"
                            >
                              Hospital-based Outpatient SUD Treatment and Care (Continuing Care)
                            </option>
                            <option value="School-based SUD Treatment and Care">
                              School-based SUD Treatment and Care
                            </option>
                            <option value="Institution-based SUD Treatment and Care">
                              Institution-based SUD Treatment and Care
                            </option>
                            <option value="Follow-up Drug Test Conducted">
                              Follow-up Drug Test Conducted
                            </option>
                            <option value="Detention-based SUD Treatment and Care">
                              Detention-based SUD Treatment and Care
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div class="col-12">
                      <div class="d-flex align-items-start">
                        <div
                          class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                        >
                          <i class="bi bi-chat-dots hwss-primary"></i>
                        </div>
                        <div class="flex-grow-1">
                          <label for="comments" class="form-label fw-medium mb-2">Comments</label>
                          <textarea
                            class="form-control"
                            id="comments"
                            v-model="selectedUser.comments"
                            rows="4"
                            :disabled="!isEditMode"
                            placeholder="Enter any additional comments or notes..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex justify-content-end mt-4">
                    <button class="btn btn-primary px-4" @click="saveChanges" v-if="isEditMode">
                      <i class="bi bi-check-lg me-2"></i>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>

              <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white py-3 border-bottom">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-arrow-right-circle fs-4 me-2 hwss-primary"></i>
                      <h5 class="mb-0 fw-semibold">Referral Status</h5>
                    </div>
                    <div v-if="!isEditMode" class="badge bg-light text-secondary">View Mode</div>
                  </div>
                </div>

                <div
                  class="card-body p-4"
                  :class="{ 'opacity-75': selectedUser.referred === 'Referred' || !isEditMode }"
                >
                  <div class="row g-4">
                    <div class="col-md-6">
                      <div class="d-flex align-items-start">
                        <div
                          class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                        >
                          <i class="bi bi-person-plus hwss-primary"></i>
                        </div>
                        <div class="flex-grow-1">
                          <label for="referTo" class="form-label fw-medium mb-2">Refer To</label>
                          <select
                            class="form-select"
                            id="referTo"
                            v-model="selectedUser.refer_to"
                            :disabled="!isEditMode || selectedUser.referred === 'Referred'"
                          >
                            <option value="" selected disabled>Select One</option>
                            <option value="clinical_counselor">Clinical Counselor</option>
                            <option value="psychiatrist">Psychiatrist</option>
                            <option value="medical_officer">Medical Officer</option>
                            <option value="school_counselor">School Counselor</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div class="col-md-6">
                      <div class="d-flex align-items-start">
                        <div
                          class="d-flex align-items-center justify-content-center bg-light rounded-circle p-2 me-3"
                        >
                          <i class="bi bi-person-badge hwss-primary"></i>
                        </div>
                        <div class="flex-grow-1">
                          <label for="official" class="form-label fw-medium mb-2">Official</label>
                          <AutoComplete
                            v-model="selectedUser.official"
                            :suggestions="filteredOfficials"
                            @complete="searchOfficials"
                            field="full_name"
                            placeholder="Type Official's Name"
                            class="w-100"
                            :forceSelection="true"
                            :disabled="!isEditMode || selectedUser.referred === 'Referred'"
                          >
                          </AutoComplete>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="selectedUser.referred === 'Referred'"
                    class="alert alert-warning d-flex align-items-center mt-4 mb-3"
                  >
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <span>User Already Referred</span>
                  </div>

                  <div class="d-flex justify-content-end mt-4">
                    <button
                      class="btn btn-primary px-4"
                      @click="referCase"
                      v-if="isEditMode"
                      :disabled="selectedUser.referred === 'Referred'"
                    >
                      <i class="bi bi-send me-2"></i>
                      Refer Case
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="footer-buttons">
            <Button
              label="Close"
              icon="pi pi-times"
              class="p-button-secondary"
              @click="handleModalClose"
            />
            <Button
              v-if="isEditMode"
              label="Save Changes"
              icon="pi pi-check"
              class="refresh-btn"
              @click="saveChanges"
            />
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect, watch } from 'vue'
import axios from 'axios'
import endpoints from '@/api'
import Swal from 'sweetalert2'
import AutoComplete from 'primevue/autocomplete'
import StatusBadge from './StatusBadge.vue'

const showModal = ref(false)
const selectedUser = ref({
  diagnosis: []
})
const officialOptions = ref([])
const filteredOfficials = ref([])
const selfRole = ref('')
const isLoading = ref(false)
const hasError = ref(false)

const rowData = ref([])
const searchQuery = ref('')
const selectedFields = ref([
  'date',
  'user.first_name',
  'user.middle_name',
  'user.last_name',
  'full_name',
  'age',
  'user.gender',
  'assessment_status',
  'case_status',
  'counseling',
  'follow_up',
  'comments'
])

const fullNames = ref(new Map())

const isEditMode = ref(false)
const canEdit = computed(() => !!selfRole.value)

const getActiveCount = () => {
  return (
    processedRows.value?.filter(
      (row) =>
        row.case_status?.toLowerCase() !== 'closed' &&
        row.case_status?.toLowerCase() !== 'completed'
    ).length || 0
  )
}

const formatDatePrimary = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const formatDateSecondary = (date) => {
  return new Date(date).getFullYear().toString()
}

const isRecentUpdate = (date) => {
  if (!date) return false
  const updateDate = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now - updateDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 3
}

const rowClass = (data) => {
  return {
    'recent-row': isRecentUpdate(data.updated_at),
    'closed-row':
      data.case_status?.toLowerCase() === 'closed' ||
      data.case_status?.toLowerCase() === 'completed'
  }
}

const getUserRole = () => {
  try {
    const userDetails = JSON.parse(localStorage.getItem('userDetailsStore'))
    selfRole.value = userDetails?.user?.role || ''
  } catch (error) {
    console.error('Error getting user role:', error)
  }
}

const formatFullName = async (record) => {
  try {
    if (!record || !record.user) {
      console.error('Invalid record structure:', record)
      return ''
    }

    const user = record.user
    const firstName = user.first_name || ''
    const middleName = user.middle_name ? ` ${user.middle_name}` : ''
    const lastName = user.last_name ? ` ${user.last_name}` : ''

    const fullName = `${firstName}${middleName}${lastName}`.trim()
    return fullName || ''
  } catch (error) {
    console.error('Error in formatFullName:', error)
    return ''
  }
}

// Replace the async fullNameTemplate with this synchronous version
const fullNameTemplate = (rowData) => {
  if (!rowData || !rowData.user) return ''

  const user = rowData.user
  const firstName = user.first_name || ''
  const middleName = user.middle_name ? ` ${user.middle_name}` : ''
  const lastName = user.last_name ? ` ${user.last_name}` : ''

  return `${firstName}${middleName}${lastName}`.trim()
}

const searchOfficials = (event) => {
  const query = event.query.toLowerCase()
  filteredOfficials.value = officialOptions.value.filter((official) =>
    official.full_name.toLowerCase().includes(query)
  )
}

const formatEmpty = (rowData, column) => {
  if (rowData[column.field] === 'follow_up' && rowData[column.field] === '') {
    return '----'
  }
  return rowData[column.field]
}

const getSeverityClass = (severity) => {
  if (!severity || severity === 'None' || severity === '') {
    return 'risk-none'
  }

  switch (severity?.toLowerCase()) {
    case 'severe':
    case 'high risk':
      return 'risk-high'
    case 'moderate':
    case 'moderately severe':
      return 'risk-moderate'
    case 'mild':
    case 'low risk':
    case 'none':
    case 'no risk':
    case 'none or minimal':
      return 'risk-low'
    default:
      return 'risk-none'
  }
}

const filterNonInjectionSubstances = (data) => {
  if (!data) return {}

  const substances = {}
  const excludedSubstances = ['injection']

  if (Array.isArray(data)) {
    data.forEach((substance) => {
      const nameKey = substance.substance__name || substance.substance_name

      if (
        nameKey &&
        !excludedSubstances.some((excluded) => nameKey.toLowerCase().trim().includes(excluded))
      ) {
        const riskLevel = formatRiskFlag(
          substance.risk_flag,
          substance.measurement,
          substance.total_score
        )

        substances[nameKey.toLowerCase().trim()] = {
          measurement: riskLevel,
          substanceName: nameKey
        }
      }
    })
  } else if (typeof data === 'object') {
    Object.entries(data).forEach(([key, value]) => {
      if (key.endsWith('_measurement')) {
        const substanceName = key.replace('_measurement', '')

        if (
          substanceName &&
          !excludedSubstances.some((excluded) =>
            substanceName.toLowerCase().trim().includes(excluded)
          )
        ) {
          const riskLevel = formatRiskFlag(
            value.risk_flag || 'none',
            value.measurement,
            value.total_score
          )

          substances[substanceName.toLowerCase().trim()] = {
            measurement: riskLevel,
            substanceName: formatSubstanceName(substanceName)
          }
        }
      }
    })
  }

  return substances
}

const getSubstanceRisks = (user) => {
  let risks = {}

  if (user.screening_data?.assist_data) {
    risks = filterNonInjectionSubstances(user.screening_data.assist_data)
  } else if (user.case_substance_risks) {
    risks = filterNonInjectionSubstances(user.case_substance_risks)
  } else if (user.event_substance_risks) {
    risks = filterNonInjectionSubstances(user.event_substance_risks)
  }

  return risks
}

const formatRole = (role) => {
  if (!role) return ''

  // Split by underscore and convert to array
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const formatRiskFlag = (riskFlag, measurement, totalScore) => {
  // Initialize variables
  let risk = ''
  let score = null

  // Case 1: Risk flag contains both risk and score e.g. "none (0)"
  if (typeof riskFlag === 'string' && riskFlag.includes('(')) {
    const matches = riskFlag.match(/(.*?)\s*\((\d+)\)/)
    if (matches) {
      risk = matches[1].trim()
      score = parseInt(matches[2])
    }
  }
  // Case 2: Separate risk flag and measurement e.g. "moderate" with measurement: 6.0
  else {
    risk = riskFlag
    // Try to get score from measurement or total_score
    score = measurement || totalScore || null
  }

  // Standardize risk levels
  risk = risk.toLowerCase()
  if (risk === 'none' || risk === 'no risk') {
    risk = 'none'
    score = score || 0
  }

  // Format the final string
  return score !== null ? `${risk} (${score})` : risk
}

const formatSubstanceName = (name) => {
  if (!name) return ''

  // Create a mapping for simplified names
  const nameMapping = {
    'tobacco products (cigarettes, chewing tobacco etc)': 'Tobacco',
    'alcoholic beverages (beer, wine, spirits, ara etc.)': 'Alcoholic',
    'cannabis (marijuana, pot, grass, hash, black etc.)': 'Cannabis',
    cocaine: 'Cocaine',
    'amphetamine-type stimulants (meth, ecstasy, diet pills etc.)': 'Amphetamine',
    'inhalants (dendrite, glue, petrol, paint thinner, etc.)': 'Inhalants',
    'sedatives or sleeping pills (n-10, diazepam etc.)': 'Sedatives',
    'hallucinogens (lsd, trips, ketamine, etc.)': 'Hallucinogens',
    'opioids (heroin, morphine, fentanyl, codeine, sp+, tramadol, bs etc)': 'Opioids',
    'other - specify': 'Other'
  }

  // Get the base name (before any parentheses)
  const baseName = name.split('(')[0].trim().toLowerCase()

  // Find the matching simplified name
  for (const [key, value] of Object.entries(nameMapping)) {
    if (baseName === key) {
      return value
    }
  }
  // If no match found, return the capitalized first word
  const words = baseName.split(' ')
  if (words.length > 0) {
    return words[0].charAt(0).toUpperCase() + words[0].slice(1)
  }
  return ''
}

const getRiskClass = (risk) => {
  if (!risk) return 'risk-low'

  // Extract just the risk level without the score
  const riskLevel = risk.split('(')[0].trim().toLowerCase()

  if (riskLevel.includes('severe') || riskLevel.includes('high')) {
    return 'risk-high'
  } else if (riskLevel.includes('moderate')) {
    return 'risk-moderate'
  } else {
    return 'risk-low'
  }
}

const myAgency = ref('')

const filteredRows = computed(() => {
  if (!searchQuery.value.trim() || !Array.isArray(rowData.value)) {
    return rowData.value
  }

  return rowData.value.filter((row) =>
    selectedFields.value.some((field) => {
      const fieldValue = row[field.split('.').pop()]
      return fieldValue?.toString().toLowerCase().includes(searchQuery.value.toLowerCase())
    })
  )
})

const processedRows = computed(() => {
  if (!rowData.value) return []

  const processed = rowData.value.map((row) => {
    const assessmentStatus =
      row.assessment_status == null || row.assessment_status === '' ? 'N/A' : row.assessment_status
    const caseStatus = row.case_status == null || row.case_status === '' ? 'N/A' : row.case_status

    //Handle both counseling and counseling status cases
    let counselingStatus = 'N/A'
    if (row.counseling != null && row.counseling !== '') {
      counselingStatus = row.counseling
    } else if (row.counseling_status != null && row.counseling_status !== '') {
      counselingStatus = row.counseling_status
    }

    const followUpStatus = row.follow_up == null || row.follow_up === '' ? 'N/A' : row.follow_up

    const processedRow = {
      ...row,
      full_name: fullNameTemplate(row),
      age: calculateAge(row.user?.date_of_birth),
      assessment_status: assessmentStatus,
      case_status: caseStatus,
      counseling: counselingStatus,
      follow_up: followUpStatus
    }
    return processedRow
  })
  return processed
})

const selectedYear = ref(new Date().getFullYear()) // Default to the current year
const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 10 }, (_, index) => currentYear - index) // Generate the past 10 years
})

const getServiceList = async () => {
  try {
    isLoading.value = true
    hasError.value = false
    const response = await axios.get(endpoints.newServiceAndTreatment)

    rowData.value = response.data.filter((row) => {
      const agencyMatch =
        row?.user?.active_agency?.agency_name?.trim().toLowerCase() ===
        myAgency.value.trim().toLowerCase()
      const screeningDate = row?.screening_data?.submission_date
      const submissionYear = screeningDate ? new Date(screeningDate).getFullYear() : null
      return agencyMatch && submissionYear === selectedYear.value
    })
  } catch (error) {
    hasError.value = true
    console.error('Error fetching data:', error)
  } finally {
    isLoading.value = false
  }
}

watchEffect(async () => {
  if (selectedUser.value && selectedUser.value.refer_to) {
    try {
      const response = await axios.get(
        `${endpoints.fetchReferralCounselors}?role=${selectedUser.value.refer_to}`
      )
      if (response && response.data && Array.isArray(response.data.data)) {
        officialOptions.value = response.data.data
      } else {
        console.error('Invalid response format:', response)
      }
    } catch (error) {
      console.error('Error fetching official options:', error)
    }
  }
})

const filteredSubstanceRisks = computed(() => {
  if (!selectedUser.value.substanceRisks) {
    return {}
  }
  return Object.fromEntries(
    Object.entries(selectedUser.value.substanceRisks).filter(
      ([key]) => key && typeof key === 'string' && key.toLowerCase().trim() !== 'any drug'
    )
  )
})

const viewDetails = async (user, mode = 'view') => {
  selectedUser.value = user
  isEditMode.value = mode === 'edit'
  selectedUser.value.substanceRisks = getSubstanceRisks(user)
  selectedUser.value.injectionRisk = getInjectionRisk(user)
  showModal.value = true
  await fetchUserdiagnosis(user.user.id)
}

const switchToEditMode = () => {
  isEditMode.value = true
}

const getInjectionRisk = (user) => {
  let hasInjectionUse = false

  // Ensure user object exists; if not, return a default "No Risk" state
  if (!user) {
    return { measurement: 'No Risk', flag: 'No Risk' }
  }

  // Check for "any drug" in case_substance_risks
  // Ensure case_substance_risks is an array before calling .find()
  if (Array.isArray(user.case_substance_risks)) {
    const anyDrugRisk = user.case_substance_risks.find(
      (substance) =>
        // Ensure substance and substance.substance_name are valid before processing
        substance &&
        typeof substance.substance_name === 'string' &&
        substance.substance_name.toLowerCase().trim() === 'any drug'
    )
    // Ensure anyDrugRisk exists and total_score is a number
    if (anyDrugRisk && typeof anyDrugRisk.total_score === 'number' && anyDrugRisk.total_score > 0) {
      hasInjectionUse = true
    }
  }

  // Check for "any drug" in event_substance_risks (if not already found)
  // Ensure event_substance_risks is an array before calling .find()
  if (!hasInjectionUse && Array.isArray(user.event_substance_risks)) {
    const anyDrugRisk = user.event_substance_risks.find(
      (substance) =>
        // Ensure substance and substance.substance_name are valid
        substance &&
        typeof substance.substance_name === 'string' &&
        substance.substance_name.toLowerCase().trim() === 'any drug'
    )
    if (anyDrugRisk && typeof anyDrugRisk.total_score === 'number' && anyDrugRisk.total_score > 0) {
      hasInjectionUse = true
    }
  }

  // Check for "any drug" in screening_data.assist_data (if not already found)
  // This is the critical part for the error:
  // 1. Check if user.screening_data exists.
  // 2. Check if user.screening_data.assist_data is an array.
  if (!hasInjectionUse && user.screening_data && Array.isArray(user.screening_data.assist_data)) {
    const anyDrugRisk = user.screening_data.assist_data.find(
      (substance) =>
        // Ensure substance and substance.substance__name are valid (note: substance__name for assist_data)
        substance &&
        typeof substance.substance__name === 'string' &&
        substance.substance__name.toLowerCase().trim() === 'any drug'
    )
    if (anyDrugRisk && typeof anyDrugRisk.total_score === 'number' && anyDrugRisk.total_score > 0) {
      hasInjectionUse = true
    }
  }

  return {
    measurement: hasInjectionUse ? 'High Risk' : 'No Risk',
    flag: hasInjectionUse ? 'High Risk' : 'No Risk' // 'flag' seems redundant if it's always same as measurement
  }
}

const handleModalClose = () => {
  selectedUser.value = null
  showModal.value = false
}

const formatDate = (rowData) => {
  return new Date(rowData.date).toLocaleDateString()
}

const calculateAge = (dob) => {
  if (!dob) {
    return 'N/A'
  }
  const birthDate = new Date(dob)
  if (isNaN(birthDate.getTime())) {
    return 'N/A'
  }

  const ageDifMs = Date.now() - birthDate.getTime()
  const ageDate = new Date(ageDifMs)
  return Math.abs(ageDate.getUTCFullYear() - 1970)
}

const saveChanges = () => {
  const counselor = JSON.parse(localStorage.getItem('userDetailsStore'))
  const counselorId = counselor.user.id

  const formData = {
    updateData: {
      assessment_status: selectedUser.value.assessment_status,
      counseling: selectedUser.value.counseling_status,
      follow_up: selectedUser.value.follow_up,
      comments: selectedUser.value.comments,
      case_status: selectedUser.value.case_status,
      id: selectedUser.value.user.id,
      updated_by: counselorId
    }
  }

  handleModalClose()
  Swal.fire({
    title: 'Confirm Save Changes!',
    text: 'All changes will be saved!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, save it!'
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .post(endpoints.updateServiceAndTreatment, JSON.stringify(formData))
        .then((response) => {
          if (response.status === 200) {
            Swal.fire({
              icon: 'success',
              title: 'Changes saved successfully!',
              showConfirmButton: false,
              timer: 1500
            })
            getServiceList()
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Something went wrong!',
              footer: 'Please try again later.',
              confirmButtonText: 'OK'
            })
          }
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
            footer: 'Please try again later.',
            confirmButtonText: 'OK'
          })
          console.error('Error saving data:', error)
        })
    }
  })
}

const referCase = async () => {
  if (!selectedUser.value) {
    console.error('Selected user is missing.')
    return
  }
  // Get self id from localstorage
  const counselor = JSON.parse(localStorage.getItem('userDetailsStore'))
  const counselorId = counselor.user.id
  const selectedUserData = selectedUser.value
  const referredToName = selectedUserData.official

  // Get form data - Fix: Use the correct user ID from the nested user object
  const formData = {
    referData: {
      referred_by: counselorId,
      referred_to_name: referredToName,
      user: selectedUserData.user.id
    }
  }

  handleModalClose()
  Swal.fire({
    title: 'Confirm Save Changes!',
    text: 'All Changes will be saved!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, save it!'
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .post(endpoints.updateReferralStatus, JSON.stringify(formData))
        .then((response) => {
          if (response.status === 200) {
            Swal.fire({
              icon: 'success',
              title: 'Referral saved successfully!',
              showConfirmButton: false,
              timer: 1500
            })
            // Refresh the component data
            getServiceList() // Call the method to refresh the list
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Something went wrong!',
              footer: 'Please try again later.',
              confirmButtonText: 'OK'
            })
          }
        })
        .catch((error) => {
          const errorMessage = error.response?.data?.error || 'Something went wrong!'
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: errorMessage,
            footer: 'Please try again later.',
            confirmButtonText: 'OK'
          })
          console.error('Error saving data:', error)
        })
    }
  })
}

const fetchUserdiagnosis = async (userId) => {
  try {
    const response = await axios.get(`${endpoints.getDiagnosis}${userId}/`)
    if (response.status === 200 && response.data) {
      selectedUser.value.diagnosis = response.data.diagnosis || []
    } else {
      selectedUser.value.diagnosis = ['No diagnosis']
    }
  } catch (error) {
    console.error('Error fetching diagnosis:', error)
    selectedUser.value.diagnosis = ['Error fetching diagnosis']
  }
}

onMounted(() => {
  getUserRole()
  const userDetails = JSON.parse(localStorage.getItem('userDetailsStore'))
  myAgency.value = userDetails?.agency?.agencyName || 'Unknown Agency'
  getServiceList()
})

watch(
  () => filteredRows.value,
  async (newRows) => {
    if (!newRows) return

    // Update all full names
    for (const row of newRows) {
      if (!fullNames.value.has(row.id)) {
        const formattedName = await formatFullName(row)
        fullNames.value.set(row.id, formattedName)
      }
    }
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>
.year-filter {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #ced4da;
  background-color: white;
  color: #2b656f;
  font-size: 0.9rem;
  margin-right: 1rem;
}

.year-filter:focus {
  border-color: #2b656f;
  box-shadow: 0 0 0 0.2rem rgba(43, 101, 111, 0.25);
  outline: none;
}

.dashboard-container {
  background: #f8f9fa;
  border-radius: 20px;
  padding: 2rem;
  height: 100%;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-content {
  flex: 1;
}

.dashboard-title {
  color: #2b656f;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dashboard-subtitle {
  color: #6c757d;
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stats-pills {
  display: flex;
  gap: 1rem;
}

.stat-pill {
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2b656f;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.refresh-btn {
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Table Styles */
.table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

:deep(.custom-datatable) {
  border: none;
}

:deep(.p-datatable-header) {
  background: white;
  border: none;
  padding: 1rem 1.5rem;
}

:deep(.p-datatable-thead > tr > th) {
  background: #f8f9fa;
  border: none;
  color: #2b656f;
  font-weight: 600;
  padding: 1rem;
}

:deep(.p-datatable-tbody > tr) {
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

/* Cell Styles */
.date-cell {
  display: flex;
  flex-direction: column;
}

.date-primary {
  color: #2b656f;
  font-weight: 500;
}

.date-secondary {
  color: #6c757d;
  font-size: 0.8rem;
}

.patient-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.patient-name {
  color: #2b656f;
  font-weight: 500;
}

.patient-details {
  font-size: 0.85rem;
  color: #6c757d;
}

.follow-up-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.update-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.comments-cell {
  max-width: 200px;
}

.comment-text {
  color: #4a4a4a;
  font-size: 0.9rem;
}

.no-comment {
  color: #9e9e9e;
  font-style: italic;
  font-size: 0.9rem;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.2s ease;
}

.view-btn {
  background: #e3f2fd;
  color: #1976d2;
}

.edit-btn {
  background: #e8f5e9;
  color: #2e7d32;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Status Badge Component Styles */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  display: inline-block;
}

.status-assessment {
  background: #e3f2fd;
  color: #1976d2;
}

.status-case {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-counseling {
  background: #fff3e0;
  color: #f57c00;
}

.status-follow-up {
  background: #f3e5f5;
  color: #7b1fa2;
}

.status-na {
  background: #f5f5f5;
  color: #757575;
}

/* Row States */
.recent-row {
  background: #fafffe !important;
}

.closed-row {
  background: #f8f9fa !important;
  opacity: 0.75;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .header-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .stats-pills {
    width: 100%;
    justify-content: space-between;
  }
}

.modal-wrapper {
  display: flex;
  flex-direction: column;
  height: 90vh;
}

.modal-content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: none;
}

.modal-sidebar {
  width: 350px;
  background: white;
  border-right: 1px solid #e0e0e0;
  height: 100%;
  overflow-y: auto;
}

.sidebar-content {
  padding: 1.5rem;
}

.sidebar-section {
  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-section:last-child {
  border-bottom: none;
}

.detail-row {
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-weight: 600;
  color: #2b656f;
  font-size: 0.9rem;
}

.detail-value {
  color: #4a4a4a;
}

.modal-main-content {
  flex: 1;
  overflow-y: auto;
  background: white;
}

.main-content-scroll {
  height: 100%;
  overflow-y: auto;
  padding-right: 1rem;
}

.content-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.modal-footer {
  padding: 1rem;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.footer-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.profile-card {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.profile-name {
  color: #2b656f;
  margin-bottom: 1rem;
}

.profile-details {
  list-style: none;
  padding: 0;
}

.profile-details li {
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
}

.address-block {
  margin-bottom: 1rem;
}

.address-block h6 {
  color: #2b656f;
  margin-bottom: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content-wrapper {
    flex-direction: column;
  }

  .modal-sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.dashboard-title {
  color: #2b656f;
}

.refresh-btn {
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  border: none;
  color: white;
}

.custom-datatable {
  background: white;
  border-radius: 8px;
}

.view-details-btn {
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  border: none;
  color: white;
}

.custom-modal {
  border-radius: 12px;
  overflow: hidden;
}

.modal-content {
  background: white;
}

.modal-header {
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px 8px 0 0;
  padding: 1rem;
}

.modal-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modal-subtitle {
  font-size: 0.9rem;
  opacity: 0.8;
  font-weight: normal;
}

.modal-body {
  padding: 2rem;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.edit-mode-btn {
  background: #e8f5e9;
  color: #2e7d32;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.edit-mode-btn:hover {
  background: #c8e6c9;
  transform: translateY(-1px);
}

.profile-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.profile-image {
  display: none;
}

.info-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.section-title {
  color: #2b656f;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.address-details p {
  margin-bottom: 0.5rem;
}

.severity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.severity-tag {
  display: flex;
  align-items: center;
  background: #f0f7f8;
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
}

.substance-name {
  margin-right: 0.5rem;
  font-weight: 600;
}

.highlight {
  color: #2b656f;
  font-weight: 600;
}

.greyout {
  opacity: 0.6;
  pointer-events: none;
}

.form-control {
  border: 1px solid #d1e0e3;
  border-radius: 4px;
  padding: 0.5rem;
}

.form-control:focus {
  border-color: #2b656f;
  box-shadow: 0 0 0 0.2rem rgba(43, 101, 111, 0.25);
}

.modal-footer {
  border-top: 1px solid #e6f3f5;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.save-btn,
.refer-btn {
  background: linear-gradient(135deg, #2b656f 0%, #1d4851 100%);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.save-btn:hover,
.refer-btn:hover {
  opacity: 0.9;
}

.severity-section {
  margin-bottom: 2rem;
}

.severity-section-title {
  color: #2b656f;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.severity-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.severity-pill {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 120px;
  text-align: center;
}

.risk-high {
  background-color: #ffe4e4 !important;
  color: #d32f2f !important;
}

.risk-moderate {
  background-color: #fff3e0 !important;
  color: #e65100 !important;
}

.risk-low,
.risk-none {
  background-color: #e8f5e9 !important;
  color: #2e7d32 !important;
}

:deep(.p-autocomplete) {
  width: 100%;
}

:deep(.p-autocomplete-input) {
  border: 1px solid #ced4da;
  border-radius: 4px;
  width: 100%;
  padding: 0.5rem;
}

:deep(.p-autocomplete-input:focus) {
  border-color: #2b656f;
  box-shadow: 0 0 0 0.2rem rgba(43, 101, 111, 0.25);
  outline: none;
}

:deep(.p-autocomplete-panel) {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.p-dialog-content) {
  padding: 0 !important;
}

:deep(.p-dialog-header) {
  padding: 0 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .profile-card {
    margin-bottom: 1rem;
  }
}

/* Loading and Error styles */
.loading-overlay,
.error-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: rgba(255, 255, 255, 0.8);
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2b656f;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 1rem;
  text-align: center;
}

.error-message i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.disabled-section {
  opacity: 0.6;
  pointer-events: none;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.disabled-section::after {
  content: 'Access restricted for trained professionals';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  display: none;
}

.disabled-section:hover::after {
  display: block;
}

.records-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.record-card {
  background: white;
  border-left: 4px solid #2b656f;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.record-content {
  color: #2c3e50;
  font-family: monospace;
  font-size: 0.95rem;
}

.no-records {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}
</style>
```