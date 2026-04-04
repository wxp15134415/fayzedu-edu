/**
 * Electron 桌面端初始化
 * 仅在桌面端加载时运行
 */

import { isElectron } from './platform'
import { setupOnlineListener, startConnectivityCheck } from './offline'
import { startAutoSync, syncAll, syncState } from './sync'

// 扩展 Window 类型
declare global {
  interface Window {
    __ELECTRON_INITIALIZED__?: boolean
  }
}

// 仅在 Electron 桌面端执行
if (isElectron.value) {
  console.log('[Electron] 初始化桌面端功能...')

  // 设置网络状态监听
  setupOnlineListener()
  startConnectivityCheck()

  // 启动自动同步
  startAutoSync()

  // 首次同步
  setTimeout(() => {
    syncAll().then(() => {
      console.log('[Electron] 首次同步完成，待同步:', syncState.value.pendingCount)
    })
  }, 3000)  // 延迟 3 秒等待应用完全加载

  // 导出桌面端初始化完成标志
  window.__ELECTRON_INITIALIZED__ = true
}

export { syncState }