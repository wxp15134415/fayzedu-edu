import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

interface TabItem {
  path: string
  title: string
  closable?: boolean
}

const STORAGE_KEY = 'edusys_tabs'

// 从 localStorage 恢复标签数据
const loadTabsFromStorage = (): { tabs: TabItem[]; activeTab: string } | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      // 验证数据格式
      if (parsed.tabs && Array.isArray(parsed.tabs) && parsed.activeTab) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to load tabs from storage:', e)
  }
  return null
}

// 保存标签数据到 localStorage
const saveTabsToStorage = (tabs: TabItem[], activeTab: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs, activeTab }))
  } catch (e) {
    console.error('Failed to save tabs to storage:', e)
  }
}

export const useTabStore = defineStore('tabs', () => {
  // 从 localStorage 恢复数据，否则使用默认值
  const stored = loadTabsFromStorage()

  // 标签列表
  const tabs = ref<TabItem[]>(stored?.tabs || [
    { path: '/dashboard', title: '首页', closable: false }
  ])

  // 当前激活的标签
  const activeTab = ref(stored?.activeTab || '/dashboard')

  // 监听标签变化，自动保存到 localStorage
  watch(
    [tabs, activeTab],
    () => {
      saveTabsToStorage(tabs.value, activeTab.value)
    },
    { deep: true }
  )

  // 添加标签
  const addTab = (path: string, title: string, closable: boolean = true) => {
    const exists = tabs.value.find(t => t.path === path)
    if (!exists) {
      tabs.value.push({ path, title, closable })
    }
    activeTab.value = path
  }

  // 移除标签
  const removeTab = (path: string) => {
    const index = tabs.value.findIndex(t => t.path === path)
    if (index > -1) {
      tabs.value.splice(index, 1)
    }
  }

  // 设置激活标签
  const setActiveTab = (path: string) => {
    activeTab.value = path
  }

  // 关闭其他标签（保留首页）
  const closeOtherTabs = (path: string) => {
    const homeTab = tabs.value.find(t => t.path === '/dashboard')
    const currentTab = tabs.value.find(t => t.path === path)

    if (homeTab && currentTab) {
      tabs.value = [homeTab, currentTab]
      activeTab.value = path
    }
  }

  // 关闭所有标签（保留首页）
  const closeAllTabs = () => {
    const homeTab = tabs.value.find(t => t.path === '/dashboard')
    if (homeTab) {
      tabs.value = [homeTab]
      activeTab.value = '/dashboard'
    }
  }

  return {
    tabs,
    activeTab,
    addTab,
    removeTab,
    setActiveTab,
    closeOtherTabs,
    closeAllTabs
  }
})
