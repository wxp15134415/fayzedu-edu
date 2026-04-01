<script setup lang="tsx">
import type { DataTableColumns } from 'naive-ui'
import { useBoolean } from '@/hooks'
import { fetchRoleList, deleteRole } from '@/service'
import { NButton, NFlex, NPopconfirm, NTag } from 'naive-ui'
import ResponsiveTable from '@/components/common/ResponsiveTable.vue'
import TableModal from './components/TableModal.vue'

const { bool: loading, setTrue: startLoading, setFalse: endLoading } = useBoolean(false)

const tableData = ref<Entity.Role[]>([])
const tableModalRef = ref<InstanceType<typeof TableModal>>()

onMounted(() => {
  getRoleList()
})

async function getRoleList() {
  startLoading()
  try {
    const res = await fetchRoleList()
    const list = res.isSuccess ? (res.data?.list || []) : (res.data || [])
    tableData.value = Array.isArray(list) ? list : []
  }
  catch (e) {
    console.error('获取角色列表失败:', e)
    tableData.value = []
  }
  finally {
    endLoading()
  }
}

function handleAdd() {
  tableModalRef.value?.openModal('add')
}

function handleEdit(row: Entity.Role) {
  tableModalRef.value?.openModal('edit', row)
}

async function handleDelete(id: number) {
  try {
    const { code } = await deleteRole(id)
    if (code === 200) {
      window.$message.success('删除成功')
      getRoleList()
    }
  }
  catch (error: any) {
    window.$message.error(error.message || '删除失败')
  }
}

const columns: DataTableColumns<Entity.Role> = [
  {
    title: '角色ID',
    key: 'id',
    width: 80,
  },
  {
    title: '角色名称',
    key: 'roleName',
    width: 150,
  },
  {
    title: '角色权限',
    key: 'roleKey',
    width: 150,
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) => {
      const status = row.status ?? 0
      return <NTag type={status === 0 ? 'success' : 'error'}>{status === 0 ? '正常' : '停用'}</NTag>
    },
  },
  {
    title: '备注',
    key: 'remark',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    align: 'center',
    key: 'actions',
    width: 180,
    render: (row) => {
      return (
        <div class="flex-center">
          <NButton size="small" onClick={() => handleEdit(row)}>
            编辑
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.id!)}>
            {{
              default: () => '确认删除',
              trigger: () => <NButton size="small" type="error">删除</NButton>,
            }}
          </NPopconfirm>
        </div>
      )
    },
  },
]
</script>

<template>
  <div>
    <n-card>
      <template #header>
        <NButton type="primary" @click="handleAdd">
          <template #icon>
            <icon-park-outline-add-one />
          </template>
          新建
        </NButton>
      </template>

      <template #header-extra>
        <NButton type="primary" secondary @click="getRoleList">
          <template #icon>
            <icon-park-outline-refresh />
          </template>
          刷新
        </NButton>
      </template>
      <ResponsiveTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :mobile-card-title="(row: Entity.Role) => row.roleName"
      />
    </n-card>
    <TableModal ref="tableModalRef" @close="getRoleList" />
  </div>
</template>
