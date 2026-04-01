<script setup lang="tsx">
import type { DataTableColumns } from 'naive-ui'
import { useBoolean } from '@/hooks'
import { fetchDeptList, deleteDept } from '@/service'
import { NButton, NFlex, NPopconfirm, NTag } from 'naive-ui'
import ResponsiveTable from '@/components/common/ResponsiveTable.vue'
import TableModal from './components/TableModal.vue'

const { bool: loading, setTrue: startLoading, setFalse: endLoading } = useBoolean(false)

const tableData = ref<Entity.Dept[]>([])
const tableModalRef = ref<InstanceType<typeof TableModal>>()

onMounted(() => {
  getDeptList()
})

async function getDeptList() {
  startLoading()
  const res = await fetchDeptList()
  // isSuccess 为 false 时（code 非 200），res.data 是错误信息，需要用 res 获取原始数据
  const list = res.isSuccess ? (res.data || []) : (res.data || [])
  tableData.value = Array.isArray(list) ? list : []
  endLoading()
}

function handleAdd() {
  tableModalRef.value?.openModal('add')
}

function handleEdit(row: Entity.Dept) {
  tableModalRef.value?.openModal('edit', row)
}

async function handleDelete(id: number) {
  try {
    const { code } = await deleteDept(id)
    if (code === 200) {
      window.$message.success('删除成功')
      getDeptList()
    }
  }
  catch (error: any) {
    window.$message.error(error.message || '删除失败')
  }
}

const columns: DataTableColumns<Entity.Dept> = [
  {
    title: '部门ID',
    key: 'id',
    width: 80,
  },
  {
    title: '部门名称',
    key: 'deptName',
    width: 150,
  },
  {
    title: '上级部门',
    key: 'parentId',
    width: 100,
  },
  {
    title: '排序',
    key: 'sort',
    width: 80,
  },
  {
    title: '负责人',
    key: 'leader',
    width: 100,
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
      <NButton type="primary" secondary @click="getDeptList">
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
    />
  </n-card>
  <TableModal ref="tableModalRef" @close="getDeptList" />
</template>
