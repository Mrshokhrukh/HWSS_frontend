<template>
  <div class="report-container">
    <div class="form-header">
      <h3 class="title">Comprehensive Reports</h3>
    </div>

    <div class="content-section">
      <!-- Section Header -->
      <div class="content-header">
        <h5 class="content-title">Report Generator</h5>
        <p class="content-subtitle">Select your criteria to generate a report.</p>
      </div>

      <!-- Filters Section -->
      <div class="filter-section">
        <div class="row g-3">
          <div class="col-md-6 col-lg-3">
            <label for="startDate" class="form-label">Start Date</label>
            <input type="date" class="form-control" id="startDate" v-model="filters.startDate">
          </div>
          <div class="col-md-6 col-lg-3">
            <label for="endDate" class="form-label">End Date</label>
            <input type="date" class="form-control" id="endDate" v-model="filters.endDate">
          </div>
          <div class="col-md-6 col-lg-3">
            <label for="statusFilter" class="form-label">Status</label>
            <select class="form-select" id="statusFilter" v-model="filters.status">
              <option value="">All Statuses</option>
              <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
            </select>
          </div>
          <div class="col-md-6 col-lg-3">
            <label for="hospitalFilter" class="form-label">Hospital / Agency</label>
            <select class="form-select" id="hospitalFilter" v-model="filters.hospital">
              <option value="">All Hospitals</option>
              <option v-for="hospital in hospitalOptions" :key="hospital" :value="hospital">{{ hospital }}</option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button class="action-btn action-btn-secondary" @click="resetFilters">Reset</button>
          <button class="action-btn action-btn-primary" @click="generateReport">
            <i class="fas fa-cogs me-1"></i> Generate Report
          </button>
        </div>
      </div>

      <!-- Report Display Section -->
      <div v-if="reportGenerated" class="report-display-section">
        <!-- Summary Cards (KPIs) -->
        <div class="row g-3 mb-4">
          <div class="col-sm-6 col-lg-3" v-for="kpi in reportData.kpis" :key="kpi.label">
            <div class="kpi-card">
              <div class="kpi-value">{{ kpi.value }}</div>
              <div class="kpi-label">{{ kpi.label }}</div>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="row g-4 mb-4">
          <div class="col-lg-7">
            <div class="chart-card">
              <div class="chart-header">Status Breakdown</div>
              <div class="chart-body">
                <apexchart v-if="barChartSeries.length" type="bar" height="350" :options="barChartOptions" :series="barChartSeries"></apexchart>
              </div>
            </div>
          </div>
          <div class="col-lg-5">
            <div class="chart-card">
              <div class="chart-header">Distribution by Hospital</div>
              <div class="chart-body">
                 <apexchart v-if="pieChartSeries.length" type="pie" height="350" :options="pieChartOptions" :series="pieChartSeries"></apexchart>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Data & Export -->
        <div class="content-header">
            <h5 class="content-title">Detailed Report Data</h5>
            <button class="action-btn action-btn-success" @click="exportToCSV" :disabled="!reportData.tableRows.length">
                <i class="fas fa-file-csv me-2"></i> Export to CSV
            </button>
        </div>
        <div class="table-wrapper">
          <table class="profiles-table">
            <thead>
              <tr>
                <th>Name</th><th>CID</th><th>Date</th><th>Status</th><th>Hospital / Agency</th><th>Counselor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reportData.tableRows.length === 0">
                <td colspan="6" class="state-cell">No detailed data found for the selected criteria.</td>
              </tr>
              <tr v-for="row in reportData.tableRows" :key="row.cid">
                <td>{{ row.name }}</td><td>{{ row.cid }}</td><td>{{ row.date }}</td><td>{{ row.status }}</td><td>{{ row.hospital }}</td><td>{{ row.counselor || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Initial State -->
      <div v-else class="initial-state">
          <i class="fas fa-chart-pie initial-icon"></i>
          <p class="lead">Please select your filters and click "Generate Report" to view data.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts'; // Using ApexCharts

// Renaming the component to avoid conflicts if you use it globally
const apexchart = VueApexCharts;

// --- STATE & REFS ---
const filters = ref({ startDate: '', endDate: '', status: '', hospital: '' });
const reportGenerated = ref(false);
const reportData = ref({ kpis: [], tableRows: [] });

// ApexCharts specific state
const barChartSeries = ref([]);
const barChartOptions = ref({
  chart: { id: 'status-breakdown', toolbar: { show: false } },
  xaxis: { categories: [] },
  colors: ['#2b656f'],
  plotOptions: { bar: { borderRadius: 4, horizontal: false, } },
  dataLabels: { enabled: false },
  tooltip: { y: { formatter: (val) => `${val} candidates` } }
});

const pieChartSeries = ref([]);
const pieChartOptions = ref({
  chart: { id: 'hospital-distribution' },
  labels: [],
  colors: ['#2b656f', '#36808a', '#4a9fa6', '#67c4cd', '#8ceaf0'],
  legend: { position: 'bottom' },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: { width: '100%' },
      legend: { position: 'bottom' }
    }
  }]
});

// --- MASTER DATA SOURCE ---
const allCandidates = ref([
    { name: 'Kinley Dorji', cid: '11204009876', date: '2025-02-01', status: 'Unfit', hospital: 'JDWNRH, Thimphu', counselor: null },
    { name: 'Ugyen Tshering', cid: '11808001122', date: '2025-03-20', status: 'Referred', hospital: 'JDWNRH, Thimphu', counselor: 'Dr. Yeshey Dorji' },
    { name: 'Jigme Singye', cid: '11405005566', date: '2025-03-05', status: 'Unfit', hospital: 'Gelephu CRRH, Gelephu', counselor: null },
    { name: 'Dawa Pem', cid: '10203004455', date: '2025-04-10', status: 'Transferred', hospital: 'Mongar RRH, Mongar', counselor: 'Ms. Pema Choden' },
    { name: 'Sangay Wangmo', cid: '11909007788', date: '2025-04-11', status: 'Unfit', hospital: 'Paro Hospital, Paro', counselor: null },
    { name: 'Tashi Wangchuk', cid: '11501001234', date: '2025-03-10', status: 'Fit', hospital: 'Paro Hospital, Paro', counselor: null },
]);

// --- COMPUTED PROPERTIES ---
const statusOptions = computed(() => [...new Set(allCandidates.value.map(c => c.status))]);
const hospitalOptions = computed(() => [...new Set(allCandidates.value.map(c => c.hospital))]);

// --- METHODS ---
const resetFilters = () => {
  filters.value = { startDate: '', endDate: '', status: '', hospital: '' };
  reportGenerated.value = false;
  reportData.value = { kpis: [], tableRows: [] };
  // Clear chart data
  barChartSeries.value = [];
  pieChartSeries.value = [];
};

const generateReport = () => {
  let filtered = [...allCandidates.value];
  if (filters.value.startDate) filtered = filtered.filter(c => new Date(c.date) >= new Date(filters.value.startDate));
  if (filters.value.endDate) filtered = filtered.filter(c => new Date(c.date) <= new Date(filters.value.endDate));
  if (filters.value.status) filtered = filtered.filter(c => c.status === filters.value.status);
  if (filters.value.hospital) filtered = filtered.filter(c => c.hospital === filters.value.hospital);
  
  // Calculate KPIs
  const kpis = [
    { label: 'Total Candidates', value: filtered.length },
    { label: 'Fit', value: filtered.filter(c => c.status === 'Fit').length },
    { label: 'Unfit (Initial)', value: filtered.filter(c => c.status === 'Unfit').length },
    { label: 'Referred / Monitored', value: filtered.filter(c => ['Referred', 'Transferred'].includes(c.status)).length }
  ];

  // Prepare data for Bar Chart (Status Breakdown)
  const statusCounts = filtered.reduce((acc, c) => ({ ...acc, [c.status]: (acc[c.status] || 0) + 1 }), {});
  barChartOptions.value = { ...barChartOptions.value, xaxis: { categories: Object.keys(statusCounts) } };
  barChartSeries.value = [{ name: 'Candidate Count', data: Object.values(statusCounts) }];
  
  // Prepare data for Pie Chart (Hospital Distribution)
  const hospitalCounts = filtered.reduce((acc, c) => ({ ...acc, [c.hospital]: (acc[c.hospital] || 0) + 1 }), {});
  pieChartOptions.value = { ...pieChartOptions.value, labels: Object.keys(hospitalCounts) };
  pieChartSeries.value = Object.values(hospitalCounts);
  
  // Set final report data
  reportData.value = { kpis, tableRows: filtered };
  reportGenerated.value = true;
};

const exportToCSV = () => {
  if (!reportData.value || reportData.value.tableRows.length === 0) return;
  const data = reportData.value.tableRows;
  const headers = ['Name', 'CID', 'Date', 'Status', 'Hospital', 'Counselor'];
  let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
  data.forEach(row => {
    const counselor = row.counselor ? `"${row.counselor}"` : 'N/A';
    const rowArray = [`"${row.name}"`, row.cid, row.date, row.status, `"${row.hospital}"`, counselor];
    csvContent += rowArray.join(",") + "\n";
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `gyalsung_report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style scoped>
/* Core Styles */
.report-container { background: linear-gradient(135deg, #e6f3f5, #f0f7f8); border-radius: 16px; padding: 2rem; font-family: sans-serif; }
.form-header { text-align: center; margin-bottom: 2rem; }
.title { color: #2b656f; font-weight: 600; }
.content-section { background: #ffffff; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 20px rgba(43, 101, 111, 0.08); }
.content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e9f1f3;
}
.content-header:last-of-type {
    margin-top: 2rem;
}
.content-title { color: #2b656f; font-weight: 600; margin: 0; }
.content-subtitle { color: #7d979d; font-size: 0.9rem; margin: 0.25rem 0 0 0; }
.table-wrapper { overflow-x: auto; }
.profiles-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
.profiles-table thead { background-color: #2b656f; color: #ffffff; }
.profiles-table th, .profiles-table td { padding: 1rem; text-align: left; vertical-align: middle; }
.profiles-table th { font-weight: 600; font-size: 0.85rem; text-transform: uppercase; }
.profiles-table td { color: #3e5a60; font-size: 0.9rem; }
.profiles-table tbody tr { border-bottom: 1px solid #e9f1f3; }
.profiles-table tbody tr:last-child { border-bottom: none; }
.state-cell { text-align: center; color: #7d979d; padding: 3rem 1rem; font-style: italic; }

/* Filter Section */
.filter-section {
    background-color: #f8fbfb;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid #e9f1f3;
}
.form-label { font-weight: 500; color: #3e5a60; font-size: 0.9rem; }
.form-control, .form-select {
    background: #fff;
    border-color: rgba(43, 101, 111, 0.2);
    transition: all 0.3s ease;
}
.form-control:focus, .form-select:focus {
    outline: none;
    border-color: #2b656f;
    box-shadow: 0 0 0 3px rgba(43, 101, 111, 0.1);
}
.filter-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }

/* Action Buttons */
.action-btn { border: none; padding: 0.5rem 1.25rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500; transition: all 0.2s ease; }
.action-btn-primary { background-color: #2b656f; color: #ffffff; }
.action-btn-primary:hover { background-color: #1d4851; }
.action-btn-secondary { background-color: #f5f9fa; color: #3e5a60; border: 1px solid #d3e0e3; }
.action-btn-secondary:hover { background-color: #e9f1f3; }
.action-btn-success { background-color: #43a047; color: #fff; }
.action-btn-success:hover { background-color: #388e3c; }

/* Report Display */
.report-display-section {
    padding-top: 2rem;
    border-top: 1px solid #e9f1f3;
}
.kpi-card {
    background-color: #fff;
    border: 1px solid #e9f1f3;
    border-radius: 8px;
    padding: 1.5rem 1rem;
    text-align: center;
    height: 100%;
}
.kpi-value { font-size: 2.5rem; font-weight: 700; color: #2b656f; }
.kpi-label { color: #7d979d; font-size: 0.9rem; }

.chart-card {
    border: 1px solid #e9f1f3;
    border-radius: 8px;
    overflow: hidden;
    height: 100%;
}
.chart-header { padding: 0.75rem 1rem; background-color: #f8fbfb; font-weight: 600; color: #2b656f; border-bottom: 1px solid #e9f1f3; }
.chart-body { padding: 1rem; } /* min-height is no longer needed as ApexCharts manages its own height */

.initial-state { text-align: center; padding: 4rem 1rem; background-color: #f8fbfb; border-radius: 8px; }
.initial-icon { font-size: 3rem; color: #d3e0e3; margin-bottom: 1rem; }
.initial-state .lead { color: #7d979d; }

</style>