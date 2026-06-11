<template>
  <div class="shift-management">
    <div class="toolbar">
      <el-button type="primary" @click="showAddModal = true">
        <el-icon><Plus /></el-icon>
        添加班次
      </el-button>
    </div>

    <el-table :data="shifts" border>
      <el-table-column prop="name" label="班次名称" width="120" />
      <el-table-column prop="start_time" label="开始时间" width="100" />
      <el-table-column prop="end_time" label="结束时间" width="100" />
      <el-table-column label="时长" width="80">
        <template #default="scope">
          {{ getDuration(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column prop="is_holiday" label="节假日" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.is_holiday ? 'warning' : ''">
            {{ scope.row.is_holiday ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="岗位需求" width="200">
        <template #default="scope">
          <el-button size="small" @click="showRequirements(scope.row)">查看需求</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="editShift(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteShift(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="isEdit ? '编辑班次' : '添加班次'" :visible.sync="showAddModal" width="450px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="班次名称" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="开始时间" required>
          <el-time-picker v-model="form.start_time" format="HH:mm" />
        </el-form-item>
        <el-form-item label="结束时间" required>
          <el-time-picker v-model="form.end_time" format="HH:mm" />
        </el-form-item>
        <el-form-item label="节假日班次">
          <el-switch v-model="form.is_holiday" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="saveShift">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog title="岗位需求配置" :visible.sync="showReqsModal" width="500px">
      <div v-if="currentShift">
        <h4>{{ currentShift.name }} - 岗位需求</h4>
        <el-table :data="requirements" border style="margin-bottom: 16px;">
          <el-table-column prop="position" label="岗位" width="100" />
          <el-table-column prop="min_count" label="最少人数" width="100" />
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button size="small" @click="editRequirement(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteRequirement(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" size="small" @click="showAddReqModal = true">添加需求</el-button>
      </div>
      <template #footer>
        <el-button @click="showReqsModal = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog title="添加岗位需求" :visible.sync="showAddReqModal" width="400px">
      <el-form :model="reqForm" label-width="80px">
        <el-form-item label="岗位" required>
          <el-select v-model="reqForm.position">
            <el-option label="收银" value="收银" />
            <el-option label="服务" value="服务" />
            <el-option label="厨房" value="厨房" />
            <el-option label="管理" value="管理" />
          </el-select>
        </el-form-item>
        <el-form-item label="最少人数" required>
          <el-input v-model.number="reqForm.min_count" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddReqModal = false">取消</el-button>
        <el-button type="primary" @click="saveRequirement">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { shiftTemplates } from '../api'

const shifts = ref([])
const showAddModal = ref(false)
const showReqsModal = ref(false)
const showAddReqModal = ref(false)
const isEdit = ref(false)
const currentShift = ref(null)
const requirements = ref([])

const form = ref({
  name: '',
  start_time: '',
  end_time: '',
  is_holiday: 0
})

const reqForm = ref({
  position: '收银',
  min_count: 1
})

const editingReq = ref(null)

const initForm = () => {
  form.value = {
    name: '',
    start_time: '',
    end_time: '',
    is_holiday: 0
  }
}

const loadShifts = async () => {
  const res = await shiftTemplates.getAll()
  shifts.value = res.data
}

const getDuration = (shift) => {
  const [startH, startM] = shift.start_time.split(':').map(Number)
  const [endH, endM] = shift.end_time.split(':').map(Number)
  const hours = endH - startH + (endM - startM) / 60
  return `${hours}小时`
}

const showRequirements = async (shift) => {
  currentShift.value = shift
  const res = await shiftTemplates.getRequirements(shift.id)
  requirements.value = res.data
  showReqsModal.value = true
}

const editShift = (row) => {
  isEdit.value = true
  form.value = { ...row }
  showAddModal.value = true
}

const deleteShift = async (id) => {
  await shiftTemplates.delete(id)
  loadShifts()
}

const saveShift = async () => {
  if (isEdit.value) {
    await shiftTemplates.update(form.value.id, form.value)
  } else {
    await shiftTemplates.create(form.value)
  }
  showAddModal.value = false
  initForm()
  loadShifts()
}

const editRequirement = (row) => {
  editingReq.value = row
  reqForm.value = { position: row.position, min_count: row.min_count }
  showAddReqModal.value = true
}

const deleteRequirement = async (id) => {
  await shiftTemplates.deleteRequirement(id)
  await showRequirements(currentShift.value)
}

const saveRequirement = async () => {
  if (editingReq.value) {
    await shiftTemplates.updateRequirement(editingReq.value.id, { min_count: reqForm.value.min_count })
  } else {
    await shiftTemplates.addRequirement(currentShift.value.id, reqForm.value)
  }
  showAddReqModal.value = false
  editingReq.value = null
  reqForm.value = { position: '收银', min_count: 1 }
  await showRequirements(currentShift.value)
}

loadShifts()
</script>

<style scoped>
.shift-management {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
}
</style>