<template>
  <div class="schedule-view">
    <div class="toolbar">
      <el-button @click="prevPeriod">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <span class="period-label">{{ periodLabel }}</span>
      <el-button @click="nextPeriod">
        <el-icon><ArrowRight /></el-icon>
      </el-button>
      <el-select v-model="viewMode" class="view-select">
        <el-option label="日视图" value="day" />
        <el-option label="周视图" value="week" />
        <el-option label="月视图" value="month" />
      </el-select>
      <el-button type="primary" @click="showGenerateModal = true">
        <el-icon><Refresh /></el-icon>
        一键生成排班
      </el-button>
    </div>

    <div class="gantt-container">
      <div class="gantt-header">
        <div class="employee-column">员工</div>
        <div class="dates-row">
          <div v-for="date in visibleDates" :key="date.str" class="date-cell">
            <div class="date-label">{{ date.day }}</div>
            <div class="weekday-label">{{ date.weekday }}</div>
          </div>
        </div>
      </div>
      <div class="gantt-body">
        <div v-for="employee in employees" :key="employee.id" class="employee-row">
          <div class="employee-column">
            <span class="employee-name">{{ employee.name }}</span>
            <span class="employee-position">{{ employee.position }}</span>
          </div>
          <div class="schedule-row">
            <div v-for="date in visibleDates" :key="date.str" class="schedule-cell">
              <div 
                v-for="(shift, idx) in getEmployeeShifts(employee.id, date.str)" 
                :key="idx"
                class="shift-block"
                :class="getShiftClass(shift)"
              >
                <span class="shift-name">{{ shift.shift_name }}</span>
                <span class="shift-time">{{ shift.start_time }}-{{ shift.end_time }}</span>
              </div>
              <div v-if="hasConflict(employee.id, date.str)" class="conflict-indicator">
                <el-icon class="conflict-icon"><Warning /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="legend">
      <span class="legend-title">班次图例：</span>
      <span class="legend-item morning">早班</span>
      <span class="legend-item afternoon">中班</span>
      <span class="legend-item evening">晚班</span>
      <span class="legend-item all-day">全天</span>
      <span class="legend-item conflict">冲突</span>
    </div>

    <el-dialog title="生成周排班" :visible.sync="showGenerateModal" width="400px">
      <el-form :model="generateForm" label-width="100px">
        <el-form-item label="开始日期" required>
          <el-date-picker v-model="generateForm.start_date" type="date" />
        </el-form-item>
        <el-form-item label="结束日期" required>
          <el-date-picker v-model="generateForm.end_date" type="date" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showGenerateModal = false">取消</el-button>
        <el-button type="primary" @click="generateSchedule">生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowLeft, ArrowRight, Refresh, Warning } from '@element-plus/icons-vue'
import { employees, schedules, autoSchedule } from '../api'

const employeesData = ref([])
const scheduleData = ref([])
const viewMode = ref('week')
const currentDate = ref(new Date())
const showGenerateModal = ref(false)

const generateForm = ref({
  start_date: '',
  end_date: ''
})

const loadEmployees = async () => {
  const res = await employees.getAll()
  employeesData.value = res.data
}

const loadSchedules = async () => {
  const dates = visibleDates.value
  if (dates.length === 0) return
  const start = dates[0].str
  const end = dates[dates.length - 1].str
  const res = await schedules.getByDateRange(start, end)
  scheduleData.value = res.data
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const visibleDates = computed(() => {
  const dates = []
  let startDate = new Date(currentDate.value)
  
  if (viewMode.value === 'week') {
    startDate.setDate(startDate.getDate() - startDate.getDay())
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      dates.push({
        str: d.toISOString().split('T')[0],
        day: d.getDate(),
        weekday: weekDays[d.getDay()]
      })
    }
  } else if (viewMode.value === 'month') {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i)
      dates.push({
        str: d.toISOString().split('T')[0],
        day: i,
        weekday: weekDays[d.getDay()]
      })
    }
  } else {
    dates.push({
      str: currentDate.value.toISOString().split('T')[0],
      day: currentDate.value.getDate(),
      weekday: weekDays[currentDate.value.getDay()]
    })
  }
  
  return dates
})

const periodLabel = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  
  if (viewMode.value === 'week') {
    const start = visibleDates.value[0]
    const end = visibleDates.value[visibleDates.value.length - 1]
    return `${year}年${month}月 ${start.day}-${end.day}日`
  } else if (viewMode.value === 'month') {
    return `${year}年${month}月`
  } else {
    return `${year}年${month}月${currentDate.value.getDate()}日`
  }
})

const prevPeriod = () => {
  const d = new Date(currentDate.value)
  if (viewMode.value === 'week') {
    d.setDate(d.getDate() - 7)
  } else if (viewMode.value === 'month') {
    d.setMonth(d.getMonth() - 1)
  } else {
    d.setDate(d.getDate() - 1)
  }
  currentDate.value = d
}

const nextPeriod = () => {
  const d = new Date(currentDate.value)
  if (viewMode.value === 'week') {
    d.setDate(d.getDate() + 7)
  } else if (viewMode.value === 'month') {
    d.setMonth(d.getMonth() + 1)
  } else {
    d.setDate(d.getDate() + 1)
  }
  currentDate.value = d
}

const getEmployeeShifts = (employeeId, date) => {
  return scheduleData.value.filter(s => s.employee_id === employeeId && s.date === date)
}

const hasConflict = (employeeId, date) => {
  const shifts = getEmployeeShifts(employeeId, date)
  return shifts.length > 1
}

const getShiftClass = (shift) => {
  const name = shift.shift_name
  if (name.includes('早')) return 'morning'
  if (name.includes('中')) return 'afternoon'
  if (name.includes('晚')) return 'evening'
  if (name.includes('全天')) return 'all-day'
  return 'morning'
}

const generateSchedule = async () => {
  await autoSchedule.generate(generateForm.value.start_date, generateForm.value.end_date)
  showGenerateModal.value = false
  loadSchedules()
}

loadEmployees()

const handleDateChange = () => {
  loadSchedules()
}

currentDate.value = new Date()
handleDateChange()
</script>

<style scoped>
.schedule-view {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.period-label {
  font-size: 16px;
  font-weight: 600;
  min-width: 150px;
}

.view-select {
  width: 120px;
}

.gantt-container {
  flex: 1;
  overflow: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.gantt-header {
  display: flex;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.employee-column {
  width: 150px;
  min-width: 150px;
  padding: 12px;
  border-right: 1px solid #eee;
  font-weight: 600;
}

.dates-row {
  display: flex;
  flex: 1;
}

.date-cell {
  flex: 1;
  min-width: 100px;
  padding: 8px;
  text-align: center;
  border-right: 1px solid #eee;
}

.date-label {
  font-weight: 600;
  font-size: 14px;
}

.weekday-label {
  font-size: 12px;
  color: #999;
}

.gantt-body {
  overflow-y: auto;
  max-height: calc(100vh - 280px);
}

.employee-row {
  display: flex;
  border-bottom: 1px solid #eee;
}

.employee-row .employee-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px;
}

.employee-name {
  font-weight: 500;
}

.employee-position {
  font-size: 12px;
  color: #999;
}

.schedule-row {
  display: flex;
  flex: 1;
}

.schedule-cell {
  flex: 1;
  min-width: 100px;
  height: 60px;
  border-right: 1px solid #eee;
  padding: 4px;
  position: relative;
}

.shift-block {
  padding: 4px 6px;
  border-radius: 4px;
  margin-bottom: 2px;
  cursor: pointer;
}

.shift-name {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.shift-time {
  display: block;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
}

.shift-block.morning {
  background: #52c41a;
}

.shift-block.afternoon {
  background: #1890ff;
}

.shift-block.evening {
  background: #722ed1;
}

.shift-block.all-day {
  background: #fa8c16;
}

.conflict-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
}

.conflict-icon {
  color: #f5222d;
}

.legend {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
}

.legend-title {
  font-size: 14px;
  color: #666;
}

.legend-item {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.legend-item.morning { background: #52c41a; }
.legend-item.afternoon { background: #1890ff; }
.legend-item.evening { background: #722ed1; }
.legend-item.all-day { background: #fa8c16; }
.legend-item.conflict { background: #f5222d; }
</style>