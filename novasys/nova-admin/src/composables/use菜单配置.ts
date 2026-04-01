/**
 * 菜单配置 Composables
 */
import { ref } from 'vue'
import { 系统菜单API, type MenuDTO } from '@/api/系统/菜单'
import { message } from 'naive-ui'

export function use菜单配置() {
  const 加载中 = ref(false)
  const 菜单列表 = ref<MenuDTO[]>([])
  const 菜单树 = ref<MenuDTO[]>([])

  /** 加载菜单列表 */
  async function 加载列表() {
    加载中.value = true
    try {
      const res = await 系统菜单API.获取列表()
      if (res.data.code === 0) {
        菜单列表.value = res.data.data
      }
    } catch (error) {
      message.error('加载菜单列表失败')
    } finally {
      加载中.value = false
    }
  }

  /** 加载菜单树 */
  async function 加载树() {
    加载中.value = true
    try {
      const res = await 系统菜单API.获取树()
      if (res.data.code === 0) {
        菜单树.value = res.data.data
      }
    } catch (error) {
      message.error('加载菜单树失败')
    } finally {
      加载中.value = false
    }
  }

  /** 保存菜单 */
  async function 保存菜单(data: MenuDTO) {
    加载中.value = true
    try {
      if (data.id) {
        await 系统菜单API.修改(data.id, data)
        message.success('修改成功')
      } else {
        await 系统菜单API.新增(data)
        message.success('新增成功')
      }
      await 加载列表()
      await 加载树()
    } catch (error) {
      message.error('保存失败')
    } finally {
      加载中.value = false
    }
  }

  /** 删除菜单 */
  async function 删除菜单(id: number) {
    try {
      await 系统菜单API.删除(id)
      message.success('删除成功')
      await 加载列表()
    } catch (error) {
      message.error('删除失败')
    }
  }

  return {
    加载中,
    菜单列表,
    菜单树,
    加载列表,
    加载树,
    保存菜单,
    删除菜单,
  }
}
