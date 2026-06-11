<template>
  <div class="reports">
    <div class="toolbar">
      <el-select v-model="reportYear" class="year-select">
        <el-option v-for="year in years" :key="year" :label="year" :value="year" />
      </el-select>
      <el-select v-model="reportMonth" class="month-select">
        <el-option v-for="month in months" :key="month" :label="month + '月'" :value="month" />
      </el-select>
      <el-button type="primary" @click="loadReports">查询</el-button>
      <el-button @click="exportReport">
        <el-icon><Download /></el-icon>
        导出Excel
      </el-button>
    </div>

    <div class="report-section">
      <h3>月度工时统计</h3>
      <el-table :data="monthlyReport" border>
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="position" label="岗位" width="100" />
        <el-table-column prop="actual_hours" label="实际工时" width="120" />
        <el-table-column prop="contract_hours" label="合同工时" width="120" />
        <el-table-column prop="overtime_hours" label="加班工时" width="120" />
        <el-table-column prop="hourly_wage" label="时薪" width="80" />
        <el-table-column prop="labor_cost" label="人力成本" width="120" />
      </el-table>
    </div>

    <div class="report-section">
      <h3>岗位排班覆盖率</h3>
      <el-table :data="coverageReport" border>
        <el-table-column prop="shift_name" label="班次" width="120" />
        <el-table-column prop="position" label="岗位" width="100" />
        <el-table-column prop="required" label="需求人数" width="100" />
        <el-table-column prop="actual" label="实际人数" width="100" />
        <el-table-column prop="coverage" label="覆盖率" width="120">
          <template #default="scope">
            <el-progress :percentage="parseFloat(scope.row.coverage)" :color="getCoverageColor(scope.row.coverage)" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="report-section">
      <h3>年假统计</h3>
      <el-table :data="leaveSummary" border>
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="position" label="岗位" width="100" />
        <el-table-column prop="annual_leave_days" label="年假天数" width="120" />
        <el-table-column prop="used_annual_leave" label="已用年假" width="120" />
        <el-table-column prop="remaining_leave" label="剩余年假" width="120" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { reports } from '../api'

const now = new Date()
const reportYear = ref(now.getFullYear())
const reportMonth = ref(now.getMonth() + 1)

const years = [2024, 2025, 2026, 2027]
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const monthlyReport = ref([])
const coverageReport = ref([])
const leaveSummary = ref([])

const loadReports = async () => {
  const [monthlyRes, coverageRes, leaveRes] = await Promise.all([
    reports.monthly(reportYear.value, reportMonth.value),
    reports.coverage(reportYear.value, reportMonth.value),
    reports.leaveSummary()
  ])
  
  monthlyReport.value = monthlyRes.data
  coverageReport.value = coverageRes.data
  leaveSummary.value = leaveRes.data
}

const getCoverageColor = (coverage) => {
  const num = parseFloat(coverage)
  if (num >= 100) return '#52c41a'
  if (num >= 80) return '#faad14'
  return '#f5222d'
}

const exportReport = async () => {
  const res = await reports.export(reportYear.value, reportMonth.value)
  const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `月度报表_${reportYear.value}年${reportMonth.value}月.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

loadReports()
</script>

<style scoped>
.reports {
  padding: 20px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.year-select, .month-select {
  width: 100px;
}

.report-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.report-section h3 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
</style>