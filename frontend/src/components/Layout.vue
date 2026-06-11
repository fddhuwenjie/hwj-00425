<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="logo">
        <h1>排班管理系统</h1>
      </div>
      <nav class="menu">
        <el-menu :default-active="activeMenu" mode="vertical" @select="handleMenuSelect">
          <el-menu-item index="/employees">
            <el-icon><User /></el-icon>
            <span>员工管理</span>
          </el-menu-item>
          <el-menu-item index="/shifts">
            <el-icon><Clock /></el-icon>
            <span>班次配置</span>
          </el-menu-item>
          <el-menu-item index="/schedule">
            <el-icon><Calendar /></el-icon>
            <span>排班视图</span>
          </el-menu-item>
          <el-menu-item index="/swap">
            <el-icon><Refresh /></el-icon>
            <span>调班申请</span>
          </el-menu-item>
          <el-menu-item index="/leave">
            <el-icon><Briefcase /></el-icon>
            <span>请假管理</span>
          </el-menu-item>
          <el-menu-item index="/reports">
            <el-icon><Histogram /></el-icon>
            <span>统计报表</span>
          </el-menu-item>
        </el-menu>
      </nav>
    </aside>
    <main class="main-content">
      <header class="header">
        <div class="header-content">
          <h2>{{ pageTitle }}</h2>
          <div class="header-right">
            <span class="current-date">{{ currentDate }}</span>
          </div>
        </div>
      </header>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { User, Clock, Calendar, Refresh, Briefcase, Histogram } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.path)

const pageTitles = {
  '/employees': '员工管理',
  '/shifts': '班次配置',
  '/schedule': '排班视图',
  '/swap': '调班申请',
  '/leave': '请假管理',
  '/reports': '统计报表'
}

const pageTitle = computed(() => pageTitles[route.path] || '排班管理系统')

const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

const handleMenuSelect = (index) => {
  router.push(index)
}
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 220px;
  background: linear-gradient(180deg, #1e3a5f 0%, #2d5a87 100%);
  color: white;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.menu {
  flex: 1;
  padding: 10px;
}

.el-menu {
  background: transparent;
  border: none;
}

.el-menu-item {
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 4px;
  border-radius: 8px;
}

.el-menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.el-menu-item.is-active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  overflow: hidden;
}

.header {
  background: white;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-date {
  font-size: 14px;
  color: #666;
}
</style>