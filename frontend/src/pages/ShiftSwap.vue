<template>
  <div class="shift-swap">
    <div class="toolbar">
      <el-button type="primary" @click="showAddModal = true">
        <el-icon><Plus /></el-icon>
        提交调班申请
      </el-button>
    </div>

    <el-table :data="swapRequests" border>
      <el-table-column prop="requester_name" label="申请人" width="120" />
      <el-table-column prop="requester_position" label="申请人岗位" width="120" />
      <el-table-column prop="target_name" label="目标员工" width="120" />
      <el-table-column prop="target_position" label="目标岗位" width="120" />
      <el-table-column prop="swap_date" label="调班日期" width="120" />
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

    <el-dialog title="提交调班申请" :visible.sync="showAddModal" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="申请人" required>
          <el-select v-model="form.requester_id">
            <el-option v-for="emp in employees" :key="emp.id" :label="emp.name" :value="emp.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标员工" required>
          <el-select v-model="form.target_id">
            <el-option v-for="emp in employees.filter(e => e.id !== form.requester_id)" :key="emp.id" :label="emp.name" :value="emp.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="调班日期" required>
          <el-date-picker v-model="form.swap_date" type="date" />
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
import { shiftSwapRequests, employees } from '../api'

const swapRequests = ref([])
const employeesData = ref([])
const showAddModal = ref(false)

const form = ref({
  requester_id: '',
  target_id: '',
  swap_date: ''
})

const loadRequests = async () => {
  const res = await shiftSwapRequests.getAll()
  swapRequests.value = res.data
}

const loadEmployees = async () => {
  const res = await employees.getAll()
  employeesData.value = res.data
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

const approveRequest = async (id) => {
  await shiftSwapRequests.update(id, { status: 'approved' })
  loadRequests()
}

const rejectRequest = async (id) => {
  await shiftSwapRequests.update(id, { status: 'rejected' })
  loadRequests()
}

const submitRequest = async () => {
  await shiftSwapRequests.create(form.value)
  showAddModal.value = false
  form.value = { requester_id: '', target_id: '', swap_date: '' }
  loadRequests()
}

loadRequests()
loadEmployees()
</script>

<style scoped>
.shift-swap {
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