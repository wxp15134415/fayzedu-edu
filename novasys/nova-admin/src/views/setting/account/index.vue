<script setup lang="tsx">
import type { DataTableColumns } from 'naive-ui'
import CopyText from '@/components/custom/CopyText.vue'
import { useBoolean } from '@/hooks'
import { fetchUserPage, updateUser } from '@/service'
import { NButton, NInput, NPopconfirm, NSelect, NSpace, NSwitch, NTag } from 'naive-ui'
import ResponsiveTable from '@/components/common/ResponsiveTable.vue'
import TableModal from './components/TableModal.vue'

const { bool: loading, setTrue: startLoading, setFalse: endLoading } = useBoolean(false)

const modalRef = ref()

const deptOptions = [
  { label: '福安一中', value: 1 },
  { label: '教务处', value: 2 },
  { label: '政教处', value: 3 },
  { label: '总务处', value: 4 },
  { label: '办公室', value: 5 },
  { label: '高一', value: 6 },
  { label: '高二', value: 7 },
  { label: '高三', value: 8 },
  { label: '教师', value: 12 },
  { label: '学生', value: 13 },
]

const roleOptions = [
  { label: '超级管理员', value: 1 },
  { label: '管理员', value: 4 },
  { label: '教师', value: 5 },
  { label: '学生', value: 3 },
]

const editingKey = ref<string | null>(null)
const editingValue = ref('')

function startEditing(key: string, value: any, id: number) {
  editingKey.value = `${key}_${id}`
  editingValue.value = value
}

function cancelEditing() {
  editingKey.value = null
  editingValue.value = ''
}

async function saveEditing(row: Entity.User, key: string) {
  if (!editingKey.value) return
  
  console.log('saveEditing:', key, editingValue.value)
  
  const originalValue = row[key as keyof Entity.User]
  if (editingValue.value === originalValue) {
    cancelEditing()
    return
  }

  startLoading()
  try {
    const updateData = { [key]: editingValue.value }
    console.log('updateData:', updateData)
    const result = await updateUser(row.id!, updateData)
    console.log('result:', result)
    if (result.isSuccess) {
      window.$message.success('更新成功')
      ;(row as any)[key] = editingValue.value
      // 更新关联的dept对象
      if (key === 'deptId') {
        const dept = deptOptions.find(d => d.value === editingValue.value)
        if (dept) {
          row.dept = { deptId: editingValue.value, deptName: dept.label }
        }
      }
      // 更新关联的roles对象
      if (key === 'roleIds') {
        const roles = roleOptions.filter(r => editingValue.value.includes(r.value)).map(r => ({ id: r.value, roleName: r.label }))
        row.roles = roles
      }
      cancelEditing()
    } else {
      window.$message.error(result.message || '更新失败')
      cancelEditing()
    }
  } catch (error: any) {
    console.error('error:', error)
    window.$message.error(error.message || '更新失败')
    cancelEditing()
  } finally {
    endLoading()
  }
}

function delteteUser(id: number) {
  window.$message.success(`删除用户id:${id}`)
}

const columns: DataTableColumns<Entity.User> = [
  {
    title: 'ID',
    align: 'center',
    key: 'id',
    width: 80,
  },
  {
    title: '用户名',
    align: 'center',
    key: 'username',
    render: (row) => {
      const editKey = `username_${row.id}`
      const isEditing = editingKey.value === editKey
      if (isEditing) {
        return (
          <NInput
            v-model:value={editingValue.value}
            size="small"
            onBlur={() => saveEditing(row, 'username')}
          />
        )
      }
      return (
        <NTag type="default" round class="cursor-pointer" onClick={() => startEditing('username', row.username || '', row.id!)}>
          {row.username}
        </NTag>
      )
    },
  },
  {
    title: '昵称',
    align: 'center',
    key: 'nickName',
    render: (row) => {
      const editKey = `nickName_${row.id}`
      const isEditing = editingKey.value === editKey
      if (isEditing) {
        return (
          <NInput
            v-model:value={editingValue.value}
            size="small"
            onBlur={() => saveEditing(row, 'nickName')}
          />
        )
      }
      return (
        <NTag type="default" round class="cursor-pointer" onClick={() => startEditing('nickName', row.nickName || '', row.id!)}>
          {row.nickName || '-'}
        </NTag>
      )
    },
  },
  {
    title: '部门',
    align: 'center',
    key: 'deptId',
    render: (row) => {
      const editKey = `deptId_${row.id}`
      const isEditing = editingKey.value === editKey
      if (isEditing) {
        return (
          <NSelect
            v-model:value={editingValue.value}
            size="small"
            options={deptOptions}
            onBlur={() => saveEditing(row, 'deptId')}
            style="width: 100%"
          />
        )
      }
      const deptName = row.dept?.deptName || (row.deptId ? `部门ID:${row.deptId}` : '-')
      return (
        <NTag type="default" round class="cursor-pointer" onClick={() => startEditing('deptId', row.deptId || '', row.id!)}>
          {deptName}
        </NTag>
      )
    },
  },
  {
    title: '角色',
    align: 'center',
    key: 'roles',
    render: (row) => {
      const editKey = `roleIds_${row.id}`
      const isEditing = editingKey.value === editKey
      if (isEditing) {
        return (
          <NSelect
            v-model:value={editingValue.value}
            size="small"
            multiple
            options={roleOptions}
            onBlur={() => saveEditing(row, 'roleIds')}
            style="width: 100%"
          />
        )
      }
      const roleNames = row.roles?.map((r: any) => r.roleName || r.role).join(', ') || '-'
      return (
        <NTag type="info" round class="cursor-pointer" onClick={() => startEditing('roleIds', row.roles?.map((r: any) => r.id) || [], row.id!)}>
          {roleNames}
        </NTag>
      )
    },
  },
  {
    title: '状态',
    align: 'center',
    key: 'status',
    render: (row) => {
      return (
        <NSwitch
          value={row.status === 1}
          onUpdateValue={(checked: boolean) => {
            startEditing('status', checked ? 1 : 0, row.id!)
            saveEditing(row, 'status')
          }}
        >
          {{
            checked: () => '正常',
            unchecked: () => '停用',
          }}
        </NSwitch>
      )
    },
  },
  {
    title: '创建时间',
    align: 'center',
    key: 'createTime',
    width: 160,
  },
  {
    title: '更新时间',
    align: 'center',
    key: 'updateTime',
    width: 160,
  },
  {
    title: '操作',
    align: 'center',
    key: 'actions',
    render: (row) => {
      return (
        <NSpace justify="center">
          <NButton
            size="small"
            onClick={() => modalRef.value.openModal('edit', row)}
          >
            编辑
          </NButton>
          <NPopconfirm onPositiveClick={() => delteteUser(row.id!)}>
            {{
              default: () => '确认删除',
              trigger: () => <NButton size="small" type="error">删除</NButton>,
            }}
          </NPopconfirm>
        </NSpace>
      )
    },
  },
]

const count = ref(0)
const listData = ref<Entity.User[]>([])
const pageParams = ref({ pageNum: 1, pageSize: 10 })

async function getUserList() {
  startLoading()
  await fetchUserPage(pageParams.value.pageNum, pageParams.value.pageSize).then((res: any) => {
    listData.value = res.data?.list || []
    count.value = res.data?.total || 0
    endLoading()
  })
}

onMounted(() => {
  getUserList()
})

function changePage(page: number, size: number) {
  pageParams.value = { pageNum: page, pageSize: size }
  getUserList()
}
</script>

<style scoped>
</style>

<template>
  <NSpace vertical class="flex-1">
    <n-card>
      <template #header>
        <NButton type="primary" @click="modalRef.openModal('add')">
          <template #icon>
            <icon-park-outline-add-one />
          </template>
          新建用户
        </NButton>
      </template>
      <template #header-extra>
        <NButton type="primary" secondary @click="getUserList">
          <template #icon>
            <icon-park-outline-refresh />
          </template>
          刷新
        </NButton>
      </template>
      <ResponsiveTable
        :columns="columns"
        :data="listData"
        :loading="loading"
        :children-key="undefined"
      />
      <Pagination :count="count" @change="changePage" />
    </n-card>
    <TableModal ref="modalRef" modal-name="用户" @refresh="getUserList" />
  </NSpace>
</template>
