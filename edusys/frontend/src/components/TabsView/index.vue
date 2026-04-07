<template>
  <div class="tabs-view">
    <!-- 标签栏 -->
    <div class="tabs-header">
      <div class="tabs-list">
        <div
          v-for="tab in tabStore.tabs"
          :key="tab.path"
          :class="['tab-item', { active: tabStore.activeTab === tab.path }]"
          @click="switchTab(tab.path)"
        >
          <span class="tab-title">{{ tab.title }}</span>
          <el-icon
            v-if="tab.closable !== false && tab.path !== '/dashboard'"
            class="tab-close"
            @click.stop="closeTab(tab.path)"
          >
            <Close />
          </el-icon>
        </div>
      </div>
      <div class="tabs-actions">
        <el-dropdown @command="handleCommand">
          <el-icon class="more-icon"><MoreFilled /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="closeCurrent">关闭当前</el-dropdown-item>
              <el-dropdown-item command="closeOthers">关闭其他</el-dropdown-item>
              <el-dropdown-item command="closeAll">关闭所有</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="tabs-content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" :key="$route.path" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Close, MoreFilled } from '@element-plus/icons-vue'
import { useTabStore } from '@/stores/tabs'

const route = useRoute()
const router = useRouter()
const tabStore = useTabStore()

// 切换标签
const switchTab = (path: string) => {
  tabStore.setActiveTab(path)
  router.push(path)
}

// 关闭标签
const closeTab = (path: string) => {
  if (path === '/dashboard') return

  const index = tabStore.tabs.findIndex(t => t.path === path)
  if (index > -1) {
    tabStore.removeTab(path)

    // 如果关闭的是当前激活的标签，切换到前一个
    if (tabStore.activeTab === path) {
      const newIndex = Math.max(0, index - 1)
      const newTab = tabStore.tabs[newIndex]
      if (newTab) {
        router.push(newTab.path)
        tabStore.setActiveTab(newTab.path)
      }
    }
  }
}

// 关闭其他
const closeOthers = (path: string) => {
  tabStore.closeOtherTabs(path)
  router.push(path)
}

// 关闭所有
const closeAll = () => {
  tabStore.closeAllTabs()
  router.push('/dashboard')
}

// 菜单命令处理
const handleCommand = (command: string) => {
  switch (command) {
    case 'closeCurrent':
      closeTab(tabStore.activeTab)
      break
    case 'closeOthers':
      closeOthers(tabStore.activeTab)
      break
    case 'closeAll':
      closeAll()
      break
  }
}

// 监听路由变化，自动添加标签
watch(
  () => route.path,
  (newPath) => {
    if (newPath) {
      const title = route.meta?.title as string || newPath
      // 检查标签是否已存在，避免重复添加
      const exists = tabStore.tabs.some(t => t.path === newPath)
      if (!exists) {
        tabStore.addTab(newPath, title, newPath !== '/dashboard')
      } else {
        // 如果已存在，只更新激活状态
        tabStore.setActiveTab(newPath)
      }
    }
  },
  { immediate: true }
)

// 初始化首页标签
onMounted(() => {
  if (tabStore.tabs.length === 0) {
    tabStore.addTab('/dashboard', '首页', false)
  }
})
</script>

<style scoped>
.tabs-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tabs-header {
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 10px;
  height: 40px;
}

.tabs-list {
  display: flex;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
}

.tabs-list::-webkit-scrollbar {
  display: none;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 40px;
  cursor: pointer;
  border-right: 1px solid #e6e6e6;
  background: #fff;
  color: #666;
  font-size: 13px;
  white-space: nowrap;
  transition: all 0.2s;
  position: relative;
}

.tab-item:hover {
  background: #f5f7fa;
  color: #333;
}

.tab-item.active {
  background: linear-gradient(135deg, #58c0fc 0%, #bd45fb 100%);
  color: #fff;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(135deg, #58c0fc 0%, #bd45fb 100%);
}

.tab-close {
  font-size: 12px;
  border-radius: 50%;
  padding: 2px;
}

.tab-close:hover {
  background: rgba(0, 0, 0, 0.2);
}

.tabs-actions {
  padding: 0 8px;
  flex-shrink: 0;
}

.more-icon {
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.more-icon:hover {
  background: #f5f7fa;
}

.tabs-content {
  flex: 1;
  overflow: auto;
  background: #f0f2f5;
}
</style>