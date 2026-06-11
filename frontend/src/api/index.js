import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const employees = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getByPosition: (position) => api.get(`/employees/position/${position}`),
  getByGroup: (group_id) => api.get(`/employees/group/${group_id}`)
}

export const groups = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`)
}

export const shiftTemplates = {
  getAll: () => api.get('/shift-templates'),
  getById: (id) => api.get(`/shift-templates/${id}`),
  create: (data) => api.post('/shift-templates', data),
  update: (id, data) => api.put(`/shift-templates/${id}`, data),
  delete: (id) => api.delete(`/shift-templates/${id}`),
  getRequirements: (id) => api.get(`/shift-templates/${id}/requirements`),
  addRequirement: (id, data) => api.post(`/shift-templates/${id}/requirements`, data),
  updateRequirement: (id, data) => api.put(`/shift-templates/requirements/${id}`, data),
  deleteRequirement: (id) => api.delete(`/shift-templates/requirements/${id}`)
}

export const schedules = {
  getAll: () => api.get('/schedules'),
  getByDateRange: (start, end) => api.get(`/schedules/range?start_date=${start}&end_date=${end}`),
  getByEmployee: (id) => api.get(`/schedules/employee/${id}`),
  getByDate: (date) => api.get(`/schedules/date/${date}`),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
  deleteByRange: (start, end) => api.delete(`/schedules/range?start_date=${start}&end_date=${end}`)
}

export const shiftSwapRequests = {
  getAll: () => api.get('/shift-swap-requests'),
  getById: (id) => api.get(`/shift-swap-requests/${id}`),
  create: (data) => api.post('/shift-swap-requests', data),
  update: (id, data) => api.put(`/shift-swap-requests/${id}`, data),
  delete: (id) => api.delete(`/shift-swap-requests/${id}`)
}

export const leaveRequests = {
  getAll: () => api.get('/leave-requests'),
  getById: (id) => api.get(`/leave-requests/${id}`),
  create: (data) => api.post('/leave-requests', data),
  update: (id, data) => api.put(`/leave-requests/${id}`, data),
  delete: (id) => api.delete(`/leave-requests/${id}`),
  getByEmployee: (id) => api.get(`/leave-requests/employee/${id}`)
}

export const reports = {
  monthly: (year, month) => api.get(`/reports/monthly?year=${year}&month=${month}`),
  coverage: (year, month) => api.get(`/reports/coverage?year=${year}&month=${month}`),
  export: (year, month) => api.get(`/reports/export?year=${year}&month=${month}`, { responseType: 'blob' }),
  leaveSummary: () => api.get('/reports/leave-summary')
}

export const autoSchedule = {
  generate: (start, end) => api.post('/auto-schedule/generate', { start_date: start, end_date: end })
}

export default api