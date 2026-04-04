<template>
  <el-container class="main-layout">
    <!-- 移动端顶部导航 -->
    <el-header class="header mobile-header" v-if="isMobile">
      <el-icon class="menu-btn" @click="drawerVisible = true">
        <Menu />
      </el-icon>
      <span class="mobile-title">学校管理系统</span>
      <el-button type="danger" size="small" @click="handleLogout" class="mobile-logout">退出</el-button>
    </el-header>

    <!-- 移动端侧边栏抽屉 -->
    <el-drawer v-model="drawerVisible" direction="ltr" size="220px" :show-close="false" class="mobile-drawer">
      <template #header>
        <div class="drawer-header">学校管理系统</div>
      </template>
      <el-menu
        :default-active="activeMenu"
        router
        :unique-opened="true"
        class="sidebar-menu"
        @select="drawerVisible = false"
      >
        <!-- 使用后端返回的菜单（包括首页） -->
        <template v-for="menu in menus" :key="menu.id">
          <!-- 一级菜单 -->
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
            <template #title>
              <el-icon><Setting v-if="menu.name === '系统管理'" /><Document v-else-if="menu.name === '考试管理'" /><DataAnalysis v-else-if="menu.name === '成绩分析'" /><School v-else /><!-- 默认为School --></el-icon>
              <span>{{ menu.name }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item v-for="child in menu.children" :key="child.id" :index="child.path">
              <span>{{ child.name }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="menu.path">
            <el-icon><HomeFilled /></el-icon>
            <span>{{ menu.name }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-drawer>

    <!-- 桌面端布局 -->
    <el-container class="desktop-layout" v-if="!isMobile">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
        <div class="logo">
          <span v-if="!isCollapse">学校管理系统</span>
          <span v-else>Edu</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          router
          :unique-opened="true"
          class="sidebar-menu"
        >
          <!-- 使用后端返回的菜单（包括首页） -->
          <template v-for="menu in menus" :key="menu.id">
            <!-- 一级菜单 -->
            <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
              <template #title>
                <el-icon><Setting v-if="menu.name === '系统管理'" /><Document v-else-if="menu.name === '考试管理'" /><DataAnalysis v-else-if="menu.name === '成绩分析'" /><School v-else /></el-icon>
                <span>{{ menu.name }}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item v-for="child in menu.children" :key="child.id" :index="child.path">
                <span>{{ child.name }}</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="menu.path">
              <el-icon><HomeFilled /></el-icon>
              <span>{{ menu.name }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>

      <el-container>
        <!-- 顶部导航 -->
        <el-header class="header">
          <div class="header-left">
            <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="currentRoute">{{ currentRoute }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <div class="user-dropdown">
                <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                <span class="username">{{ userStore.userInfo?.realName || userStore.userInfo?.username }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>
                    个人设置
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 内容区 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>

    <!-- 移动端内容区 -->
    <el-main class="main-content mobile-content" v-if="isMobile">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, markRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { HomeFilled, Setting, Fold, Expand, School, Menu, ArrowDown, User, SwitchButton, DataAnalysis, Document } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 从用户 store 获取菜单
const menus = computed(() => userStore.menus || [])

// 响应式布局检测
const isMobile = ref(window.innerWidth < 768)
const drawerVisible = ref(false)

// 侧边栏折叠状态
const isCollapse = ref(false)

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  if (!userStore.userInfo) {
    userStore.fetchUserInfo()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 当前激活的菜单
const activeMenu = computed(() => route.path)

const currentRoute = computed(() => {
  return route.meta?.title as string || ''
})

// 菜单图标映射
const iconMap: Record<string, any> = {
  Setting: markRaw(Setting),
  School: markRaw(School),
  Document: markRaw(Document),
  DataAnalysis: markRaw(DataAnalysis),
  HomeFilled: markRaw(HomeFilled)
}

// 获取菜单图标
const getIcon = (iconName?: string) => {
  if (!iconName) return HomeFilled
  return iconMap[iconName] || HomeFilled
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await userStore.logout()
    router.push('/login')
  }).catch(() => {})
}

// 下拉菜单命令处理
const handleCommand = (command: string) => {
  if (command === 'logout') {
    handleLogout()
  } else if (command === 'profile') {
    ElMessage.info('个人中心功能开发中...')
  } else if (command === 'settings') {
    ElMessage.info('个人设置功能开发中...')
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

/* 桌面端布局 */
.desktop-layout {
  display: flex;
  height: 100%;
}

.sidebar {
  background-color: #1d1e1f;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.sidebar-menu {
  border-right: none;
  background-color: #1d1e1f;
}

/* 深色侧边栏菜单样式 */
:deep(.el-menu) {
  background-color: #1d1e1f;
  border-right: none;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  color: #cfd3dc;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: rgba(102, 126, 234, 0.15);
}

:deep(.el-menu-item.is-active) {
  color: #667eea;
  background-color: rgba(102, 126, 234, 0.2);
}

:deep(.el-menu-item.is-active)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

:deep(.el-sub-menu .el-menu-item) {
  color: #cfd3dc;
}

:deep(.el-sub-menu .el-menu-item.is-active) {
  color: #667eea;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

/* 大屏幕侧边栏 */
@media (min-width: 1920px) {
  .sidebar-menu:not(.el-menu--collapse) {
    width: 260px;
  }

  .logo {
    font-size: 20px;
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
}

:deep(.el-breadcrumb) {
  color: #fff;
}

:deep(.el-breadcrumb__item) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.el-breadcrumb__inner) {
  color: #fff !important;
}

:deep(.el-breadcrumb__separator) {
  color: rgba(255, 255, 255, 0.8) !important;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: #f5f7fa;
}

.username {
  color: #303133;
  font-size: 14px;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
}

/* 大屏幕 header 样式 */
@media (min-width: 1920px) {
  .header {
    padding: 0 30px;
  }

  .header-left {
    gap: 20px;
  }

  .header-right {
    gap: 20px;
  }

  .username {
    font-size: 15px;
  }

  .collapse-btn {
    font-size: 22px;
  }
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

/* 桌面端内容区最大宽度 - 移除限制以使用全宽 */
.desktop-layout .main-content {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
}

/* 大屏幕适配 */
@media (min-width: 1920px) {
  .desktop-layout .main-content {
    padding: 24px;
  }

  /* 表格样式 - 使用 flex 布局让表格占满整个容器 */
  :deep(.el-table) {
    width: 100% !important;
  }

  :deep(.el-table__header-wrapper),
  :deep(.el-table__body-wrapper) {
    width: 100%;
  }

  :deep(.el-table .el-table__header) {
    width: 100%;
  }

  :deep(.el-table__column-resize-proxy) {
    display: none;
  }

  :deep(.el-table) {
    font-size: 14px;
  }

  :deep(.el-button) {
    padding: 8px 14px;
    font-size: 13px;
  }

  :deep(.el-input) {
    font-size: 14px;
  }

  :deep(.el-dialog) {
    max-width: 700px;
  }

  :deep(.el-form-item__label) {
    font-size: 14px;
  }
}

/* 移动端样式 */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
}

.mobile-header .menu-btn {
  font-size: 22px;
  cursor: pointer;
}

.mobile-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.mobile-logout {
  padding: 4px 8px;
  font-size: 12px;
}

.mobile-content {
  padding: 12px;
}

.mobile-drawer .drawer-header {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 响应式表格 */
:deep(.el-table) {
  font-size: 12px;
}

:deep(.el-button) {
  padding: 6px 10px;
  font-size: 12px;
}

:deep(.el-input) {
  font-size: 13px;
}

@media (max-width: 768px) {
  .desktop-layout .header {
    display: none;
  }

  .sidebar {
    display: none;
  }
}
</style>