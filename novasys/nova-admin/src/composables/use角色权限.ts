/**
 * 角色权限 Composables
 */
import { ref } from 'vue'
import { 系统角色API, type RoleDTO } from '@/api/系统/角色'
import { message } from 'naive-ui'

export function use角色权限() {
  const 加载中 = ref(false)
  const 角色列表 = ref<RoleDTO[]>([])
  const 当前角色 = ref<RoleDTO | null>(null)

  /** 加载角色列表 */
  async function 加载列表() {
    加载中.value = true
    try {
      const res = await 系统角色API.获取列表()
      if (res.data.code === 0) {
        角色列表.value = res.data.data
      }
    } catch (error) {
      message.error('加载角色列表失败')
    } finally {
      加载中.value = false
    }
  }

  /** 保存角色 */
  async function 保存角色(data: RoleDTO) {
    加载中.value = true
    try {
      if (data.id) {
        await 系统角色API.修改(data.id, data)
        message.success('修改成功')
      } else {
        await 系统角色API.新增(data)
        message.success('新增成功')
      }
      await 加载列表()
    } catch (error) {
      message.error('保存失败')
    } finally {
      加载中.value = false
    }
  }

  /** 删除角色 */
  async function 删除角色(id: number) {
    try {
      await 系统角色API.删除(id)
      message.success('删除成功')
      await 加载列表()
    } catch (error) {
      message.error('删除失败')
    }
  }

  return {
    加载中,
    角色列表,
    当前角色,
    加载列表,
    保存角色,
    删除角色,
  }
}
