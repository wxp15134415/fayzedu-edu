import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi, getCurrentUser } from '@/api/auth'
import type { User, LoginParams } from '@/api/types'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  // 从 localStorage 恢复用户信息
  const savedUserInfo = localStorage.getItem('userInfo')
  const userInfo = ref<User | null>(savedUserInfo ? JSON.parse(savedUserInfo) : null)
  // 从 localStorage 恢复权限和菜单
  const savedPermissions = localStorage.getItem('permissions')
  const savedMenus = localStorage.getItem('menus')
  const permissions = ref<string[]>(savedPermissions ? JSON.parse(savedPermissions) : [])
  const menus = ref<any[]>(savedMenus ? JSON.parse(savedMenus) : [])

  const isLoggedIn = computed(() => !!token.value)

  async function login(params: LoginParams) {
    const res: any = await loginApi(params)
    // 后端直接返回 { token, user, permissions, menus }，不在 data 里
    // 需要判断 res 本身是否有 token（直接返回）还是 res.data 有 token（包装格式）
    const loginData = res.token ? res : (res.data?.token ? res.data : res)
    token.value = loginData.token
    localStorage.setItem('token', loginData.token)
    // 保存用户信息
    userInfo.value = loginData.user
    permissions.value = loginData.permissions || []
    menus.value = loginData.menus || []
    // 保存用户信息、权限和菜单到 localStorage，确保页面刷新后也能显示
    localStorage.setItem('userInfo', JSON.stringify(loginData.user))
    localStorage.setItem('permissions', JSON.stringify(loginData.permissions || []))
    localStorage.setItem('menus', JSON.stringify(loginData.menus || []))
    return res
  }

  async function logout() {
    try {
      await logoutApi()
    } catch (error) {
      // 忽略登出API错误，确保本地状态被清除
      console.log('登出API调用失败', error)
    }
    token.value = ''
    userInfo.value = null
    permissions.value = []
    menus.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('permissions')
    localStorage.removeItem('menus')
  }

  async function fetchUserInfo() {
    try {
      const res: any = await getCurrentUser()
      // 处理两种响应格式：直接返回 { user, permissions, menus } 或包装格式 { data: { user, permissions, menus } }
      const userData = res.user ? res : (res.data?.user ? res.data : res)
      userInfo.value = userData.user
      permissions.value = userData.permissions || []
      menus.value = userData.menus || []
      // 更新 localStorage 中的权限
      localStorage.setItem('permissions', JSON.stringify(userData.permissions || []))
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }

  function hasPermission(permission: string): boolean {
    if (!permission) return true
    return permissions.value.includes(permission)
  }

  return {
    token,
    userInfo,
    permissions,
    menus,
    isLoggedIn,
    login,
    logout,
    fetchUserInfo,
    hasPermission
  }
})