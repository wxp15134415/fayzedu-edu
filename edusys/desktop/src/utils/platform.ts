/**
 * 环境检测 - 判断运行平台
 */

import { ref } from 'vue'

// 检测是否在 Electron 桌面端
function checkIsElectron(): boolean {
  return typeof window !== 'undefined' &&
    !!(window as any).electronAPI &&
    (window as any).electronAPI.platform !== undefined
}

// 导出的平台状态
export const isElectron = ref(checkIsElectron())

// 检测是否在开发环境
export const isDev = import.meta.env.DEV

// 检测是否为生产环境
export const isProd = import.meta.env.PROD

// 当前平台信息
export const platform = isElectron.value ? 'electron' : 'web'

// 打印平台信息
if (isDev) {
  console.log(`[环境] 运行平台: ${platform}`)
}