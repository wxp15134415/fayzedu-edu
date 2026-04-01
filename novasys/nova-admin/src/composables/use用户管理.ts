/**
 * 用户管理 Composables
 * 业务逻辑与 UI 分离
 */
import { ref, computed } from 'vue'
import { 系统用户API, type UserDTO } from '@/api/系统/用户'
import { message } from 'naive-ui'

export function use用户管理() {
  const 加载中 = ref(false)
  const 用户列表 = ref<UserDTO[]>([])
  const 当前用户 = ref<UserDTO | null>(null)
  const 总数 = ref(0)
  const 分页 = ref({ pageNum: 1, pageSize: 10 })

  /** 计算属性：用户数量 */
  const 用户数量 = computed(() => 用户列表.value.length)

  /** 加载用户列表 */
  async function 加载列表() {
    加载中.value = true
    try {
      const res = await 系统用户API.获取分页({
        pageNum: 分页.value.pageNum,
        pageSize: 分页.value.pageSize,
      })
      if (res.data.code === 0) {
        用户列表.value = res.data.data.list
        总数.value = res.data.data.total
      }
    } catch (error) {
      message.error('加载用户列表失败')
    } finally {
      加载中.value = false
    }
  }

  /** 保存用户（新增或修改） */
  async function 保存用户(data: UserDTO) {
    加载中.value = true
    try {
      if (data.id) {
        await 系统用户API.修改(data.id, data)
        message.success('修改成功')
      } else {
        await 系统用户API.新增(data)
        message.success('新增成功')
      }
      await 加载列表()
    } catch (error) {
      message.error('保存失败')
    } finally {
      加载中.value = false
    }
  }

  /** 删除用户 */
  async function 删除用户(id: number) {
    try {
      await 系统用户API.删除(id)
      message.success('删除成功')
      await 加载列表()
    } catch (error) {
      message.error('删除失败')
    }
  }

  /** 重置密码 */
  async function 重置密码(id: number) {
    try {
      await 系统用户API.重置密码(id)
      message.success('密码已重置为 123456')
    } catch (error) {
      message.error('重置密码失败')
    }
  }

  /** 翻页 */
  function 翻页(page: number) {
    分页.value.pageNum = page
    加载列表()
  }

  return {
    加载中,
    用户列表,
    当前用户,
    用户数量,
    总数,
    分页,
    加载列表,
    保存用户,
    删除用户,
    重置密码,
    翻页,
  }
}
