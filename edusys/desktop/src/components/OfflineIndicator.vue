<template>
  <Transition name="slide-down">
    <div v-if="!isOnline" class="offline-indicator">
      <el-icon><Connection /></el-icon>
      <span>当前处于离线模式，部分功能可能不可用</span>
      <span v-if="pendingCount > 0" class="pending-badge">
        {{ pendingCount }} 条待同步
      </span>
    </div>
  </Transition>

  <!-- 同步中的加载提示 -->
  <el-loading
    v-if="isSyncing"
    fullscreen
    :text="`正在同步... ${syncProgress}`"
    :spinner="'el-icon-loading'"
    :lock="true"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { Connection } from '@element-plus/icons-vue'
import { isOnline } from '@/utils/offline'
import { syncState } from '@/utils/sync'

const pendingCount = computed(() => syncState.value.pendingCount)
const isSyncing = computed(() => syncState.value.isSyncing)

const syncProgress = computed(() => {
  if (!syncState.value.lastSyncTime) return ''
  const date = new Date(syncState.value.lastSyncTime)
  return `上次同步: ${date.toLocaleTimeString()}`
})

onMounted(() => {
  // 组件挂载时不需要额外处理，因为 offline.ts 已经在全局设置了监听
})
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #e6a23c 0%, #f56c6c 100%);
  color: #fff;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.offline-indicator .el-icon {
  font-size: 18px;
}

.pending-badge {
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 12px;
}

/* 动画效果 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
