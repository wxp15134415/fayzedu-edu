/**
 * 网络状态监控 - 离线/在线检测
 */

import { ref, onMounted, onUnmounted } from 'vue'

// 网络状态
export const isOnline = ref(navigator.onLine)
export const wasOffline = ref(false)  // 记录之前是否离线

// 回调函数集合
type StatusChangeCallback = (online: boolean) => void
const listeners: StatusChangeCallback[] = []

/**
 * 设置网络状态监听
 */
export function setupOnlineListener() {
  const handleOnline = () => {
    const online = navigator.onLine
    console.log('[网络状态] 在线:', online)
    isOnline.value = online

    // 如果从离线变为在线，触发回调
    if (!wasOffline.value && !online) {
      wasOffline.value = true
    } else if (wasOffline.value && online) {
      wasOffline.value = false
      // 通知监听器：网络恢复
      listeners.forEach(cb => cb(true))
    }
  }

  const handleOffline = () => {
    console.log('[网络状态] 离线')
    isOnline.value = false
    wasOffline.value = true
    // 通知监听器：网络断开
    listeners.forEach(cb => cb(false))
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // 返回清理函数
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

/**
 * 添加网络状态变化监听
 */
export function onNetworkStatusChange(callback: StatusChangeCallback) {
  listeners.push(callback)

  // 返回取消监听函数
  return () => {
    const index = listeners.indexOf(callback)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }
}

/**
 * 尝试连接检测（更可靠的检测方式）
 */
export async function checkConnectivity(): Promise<boolean> {
  try {
    // 尝试请求一个轻量级接口
    const response = await fetch('/api/health', {
      method: 'HEAD',
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000)
    })
    return response.ok
  } catch {
    // 检查 navigator.onLine 作为备用
    return navigator.onLine
  }
}

/**
 * 定时检测连接（用于更可靠的后端连通性检测）
 */
let connectivityInterval: ReturnType<typeof setInterval> | null = null

export function startConnectivityCheck(intervalMs = 30000) {
  if (connectivityInterval) return

  connectivityInterval = setInterval(async () => {
    const connected = await checkConnectivity()
    if (connected !== isOnline.value) {
      isOnline.value = connected
      if (connected) {
        listeners.forEach(cb => cb(true))
      }
    }
  }, intervalMs)
}

export function stopConnectivityCheck() {
  if (connectivityInterval) {
    clearInterval(connectivityInterval)
    connectivityInterval = null
  }
}

// ============ 组合式函数 - 方便组件使用 ============

/**
 * 使用网络状态的组合式函数
 */
export function useOnlineStatus() {
  onMounted(() => {
    setupOnlineListener()
    startConnectivityCheck()
  })

  onUnmounted(() => {
    stopConnectivityCheck()
  })

  return {
    isOnline,
    wasOffline
  }
}

/**
 * 等待网络恢复的 Promise 封装
 */
export function waitForOnline(timeoutMs = 0): Promise<boolean> {
  return new Promise((resolve) => {
    if (isOnline.value) {
      resolve(true)
      return
    }

    if (timeoutMs > 0) {
      setTimeout(() => resolve(false), timeoutMs)
    }

    const unsubscribe = onNetworkStatusChange((online) => {
      unsubscribe()
      resolve(online)
    })
  })
}
