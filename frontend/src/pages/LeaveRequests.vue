<template>
  <div class="leave-requests">
    <div class="toolbar">
      <el-button type="primary" @click="showAddModal = true">
        <el-icon><Plus /></el-icon>
        提交请假申请
      </el-button>
    </div>

    <el-table :data="leaveRequestsData" border>
      <el-table-column prop="employee_name" label="申请人" width="120" />
      <el-table-column prop="position" label="岗位" width="100" />
      <el-table-column prop="type" label="请假类型" width="100">
        <template #default="scope">
          <el-tag :type="getLeaveType(scope.row.type)">
            {{ scope.row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="start_date" label="开始日期" width="120" />
      <el-table-column prop="end_date" label="结束日期" width="120" />
      <el-table-column label="请假天数" width="100">
        <template #default="scope">
          {{ getDays(scope.row.start_date, scope.row.end_date) }}天
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="申请时间" width="160" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <template v-if="scope.row.status === 'pending'">
            <el-button size="small" type="success" @click="approveRequest(scope.row.id)">通过</el-button>
            <el-button size="small" type="danger" @click="rejectRequest(scope.row.id)">拒绝</el-button>
          </template>
          <span v-else class="status-text">{{ getStatusText(scope.row.status) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="提交请假申请" v-model="showAddModal" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="申请人" required>
          <el-select v-model="form.employee_id">
            <el-option v-for="emp in employeesData" :key="emp.id" :label="emp.name" :value="emp.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="请假类型" required>
          <el-select v-model="form.type">
            <el-option label="事假" value="事假" />
            <el-option label="病假" value="病假" />
            <el-option label="年假" value="年假" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" required>
          <el-date-picker v-model="form.start_date" type="date" />
        </el-form-item>
        <el-form-item label="结束日期" required>
          <el-date-picker v-model="form.end_date" type="date" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="submitRequest">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { leaveRequests, employees } from '../api'

const leaveRequestsData = ref([])
const employeesData = ref([])
const showAddModal = ref(false)

const form = ref({
  employee_id: '',
  type: '事假',
  start_date: '',
  end_date: ''
})

const loadRequests = async () => {
  const res = await leaveRequests.getAll()
  leaveRequestsData.value = res.data
}

const loadEmployees = async () => {
  const res = await employees.getAll()
  employeesData.value = res.data
}

const getLeaveType = (type) => {
  switch (type) {
    case '事假': return 'primary'
    case '病假': return 'warning'
    case '年假': return 'success'
    default: return 'info'
  }
}

const getStatusType = (status) => {
  switch (status) {
    case 'approved': return 'success'
    case 'rejected': return 'danger'
    default: return 'warning'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'approved': return '已通过'
    case 'rejected': return '已拒绝'
    default: return '待审批'
  }
}

const getDays = (start, end) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
}

const approveRequest = async (id) => {
  await leaveRequests.update(id, { status: 'approved' })
  loadRequests()
}

const rejectRequest = async (id) => {
  await leaveRequests.update(id, { status: 'rejected' })
  loadRequests()
}

const submitRequest = async () => {
  await leaveRequests.create(form.value)
  showAddModal.value = false
  form.value = { employee_id: '', type: '事假', start_date: '', end_date: '' }
  loadRequests()
}

loadRequests()
loadEmployees()
</script>

<style scoped>
.leave-requests {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
}

.status-text {
  color: #666;
  font-size: 12px;
}
</style>