import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'
import EmployeeManagement from '../pages/EmployeeManagement.vue'
import ShiftManagement from '../pages/ShiftManagement.vue'
import ScheduleView from '../pages/ScheduleView.vue'
import ShiftSwap from '../pages/ShiftSwap.vue'
import LeaveRequests from '../pages/LeaveRequests.vue'
import Reports from '../pages/Reports.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', redirect: '/employees' },
      { path: '/employees', component: EmployeeManagement },
      { path: '/shifts', component: ShiftManagement },
      { path: '/schedule', component: ScheduleView },
      { path: '/swap', component: ShiftSwap },
      { path: '/leave', component: LeaveRequests },
      { path: '/reports', component: Reports }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router