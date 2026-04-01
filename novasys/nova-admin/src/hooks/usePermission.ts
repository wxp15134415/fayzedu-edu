import { isArray, isString } from 'radash'
import { useAuthStore } from '@/store'

/** 权限判断 */
export function usePermission() {
  const authStore = useAuthStore()

  function hasPermission(
    permission?: Entity.RoleType | Entity.RoleType[],
  ) {
    if (!permission)
      return true

    if (!authStore.userInfo)
      return true

    const { role } = authStore.userInfo

    if (!role || role.length === 0)
      return true

    let has = role.includes('super')
    if (!has) {
      if (isArray(permission))
        has = permission.some(i => role.includes(i))

      if (isString(permission))
        has = role.includes(permission)
    }
    return has
  }

  return {
    hasPermission,
  }
}
