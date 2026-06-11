<template>
  <div class="employee-management">
    <div class="toolbar">
      <el-button type="primary" @click="showAddModal = true">
        <el-icon><Plus /></el-icon>
        添加员工
      </el-button>
      <el-select v-model="filterGroup" placeholder="选择分组" class="filter-select">
        <el-option label="全部" value="" />
        <el-option v-for="group in groups" :key="group.id" :label="group.name" :value="group.id" />
      </el-select>
      <el-select v-model="filterPosition" placeholder="选择岗位" class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="收银" value="收银" />
        <el-option label="服务" value="服务" />
        <el-option label="厨房" value="厨房" />
        <el-option label="管理" value="管理" />
      </el-select>
    </div>

    <el-table :data="filteredEmployees" border>
      <el-table-column prop="employee_id" label="工号" width="100" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="position" label="岗位" width="100" />
      <el-table-column prop="group_name" label="所属分组" width="120" />
      <el-table-column prop="max_hours_per_week" label="每周最大工时" width="120" />
      <el-table-column prop="hourly_wage" label="时薪" width="80" />
      <el-table-column prop="annual_leave_days" label="年假天数" width="100" />
      <el-table-column prop="used_annual_leave" label="已用年假" width="100" />
      <el-table-column label="剩余年假" width="100">
        <template #default="scope">
          {{ scope.row.annual_leave_days - scope.row.used_annual_leave }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="editEmployee(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteEmployee(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="isEdit ? '编辑员工' : '添加员工'" :visible.sync="showAddModal" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="姓名" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="工号" required>
          <el-input v-model="form.employee_id" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="岗位" required>
          <el-select v-model="form.position">
            <el-option label="收银" value="收银" />
            <el-option label="服务" value="服务" />
            <el-option label="厨房" value="厨房" />
            <el-option label="管理" value="管理" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属分组">
          <el-select v-model="form.group_id">
            <el-option label="无" :value="null" />
            <el-option v-for="group in groups" :key="group.id" :label="group.name" :value="group.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="每周最大工时">
          <el-input v-model.number="form.max_hours_per_week" type="number" />
        </el-form-item>
        <el-form-item label="时薪">
          <el-input v-model.number="form.hourly_wage" type="number" />
        </el-form-item>
        <el-form-item label="年假天数">
          <el-input v-model.number="form.annual_leave_days" type="number" />
        </el-form-item>
        <el-form-item label="不可用时段">
          <el-checkbox-group v-model="form.unavailable_slots">
            <el-checkbox label="周二全天" :value="{ day: 2, type: 'all' }" />
            <el-checkbox label="周四全天" :value="{ day: 4, type: 'all' }" />
            <el-checkbox label="周二上午" :value="{ day: 2, type: 'am' }" />
            <el-checkbox label="周二下午" :value="{ day: 2, type: 'pm' }" />
            <el-checkbox label="周四上午" :value="{ day: 4, type: 'am' }" />
            <el-checkbox label="周四下午" :value="{ day: 4, type: 'pm' }" />
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="saveEmployee">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { employees, groups } from '../api'

const employeesData = ref([])
const groupsData = ref([])
const showAddModal = ref(false)
const isEdit = ref(false)
const form = ref({
  name: '',
  employee_id: '',
  position: '收银',
  group_id: null,
  max_hours_per_week: 40,
  hourly_wage: 15,
  annual_leave_days: 15,
  unavailable_slots: []
})
const filterGroup = ref('')
const filterPosition = ref('')

const initForm = () => {
  form.value = {
    name: '',
    employee_id: '',
    position: '收银',
    group_id: null,
    max_hours_per_week: 40,
    hourly_wage: 15,
    annual_leave_days: 15,
    unavailable_slots: []
  }
}

const loadEmployees = async () => {
  const res = await employees.getAll()
  employeesData.value = res.data
}

const loadGroups = async () => {
  const res = await groups.getAll()
  groupsData.value = res.data
}

const filteredEmployees = computed(() => {
  return employeesData.value.filter(emp => {
    if (filterGroup.value && emp.group_id != filterGroup.value) return false
    if (filterPosition.value && emp.position !== filterPosition.value) return false
    return true
  })
})

const editEmployee = (row) => {
  isEdit.value = true
  form.value = {
    ...row,
    unavailable_slots: JSON.parse(row.unavailable_slots || '[]')
  }
  showAddModal.value = true
}

const deleteEmployee = async (id) => {
  await employees.delete(id)
  loadEmployees()
}

const saveEmployee = async () => {
  if (isEdit.value) {
    await employees.update(form.value.id, form.value)
  } else {
    await employees.create(form.value)
  }
  showAddModal.value = false
  initForm()
  loadEmployees()
}

loadEmployees()
loadGroups()
</script>

<style scoped>
.employee-management {
  padding: 20px;
}

.toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  align-items: center;
}

.filter-select {
  width: 150px;
}
</style>