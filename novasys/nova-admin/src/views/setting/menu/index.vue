<script setup lang="tsx">
import type { DataTableColumns } from 'naive-ui'
import { useBoolean } from '@/hooks'
import { fetchAllRoutes, deleteMenu } from '@/service'
import { arrayToTree, createIcon } from '@/utils'
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui'
import { renderProCopyableText } from 'pro-naive-ui'
import TableModal from './components/TableModal.vue'
import ResponsiveTable from '@/components/common/ResponsiveTable.vue'

const { bool: loading, setTrue: startLoading, setFalse: endLoading } = useBoolean(false)

async function deleteData(id: number) {
  await deleteMenu(id)
  window.$message.success('删除成功')
  getAllRoutes()
}

const tableModalRef = ref()

const columns: DataTableColumns<AppRoute.RowRoute> = [
  {
    type: 'selection',
    width: 30,
  },
  {
    title: '名称',
    key: 'name',
    width: 200,
  },
  {
    title: '图标',
    align: 'center',
    key: 'icon',
    width: '6em',
    render: (row) => {
      const iconName = row.icon ? row.icon.replace('icon-park-outline:', '') : ''
      if (!iconName) {
        return <span>-</span>
      }
      return createIcon(iconName, { size: 20 })
    },
  },
  {
    title: '标题',
    align: 'center',
    key: 'title',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '路径',
    key: 'path',
    render: row => renderProCopyableText(row.path),
  },
  {
    title: '组件路径',
    key: 'componentPath',
    ellipsis: {
      tooltip: true,
    },
    render: (row) => {
      return <span>{row.componentPath || '-'}</span>
    },
  },
  {
    title: '排序值',
    key: 'order',
    align: 'center',
    width: '6em',
  },
  {
    title: '菜单类型',
    align: 'center',
    key: 'menuType',
    width: '6em',
    render: (row) => {
      const menuType = row.menuType || 'page'
      const menuTagType: Record<string, NaiveUI.ThemeColor> = {
        dir: 'primary',
        page: 'warning',
        button: 'success',
        link: 'info',
      }
      const tagType = menuTagType[menuType] || 'default'
      return <NTag type={tagType}>{menuType}</NTag>
    },
  },
  {
    title: '操作',
    align: 'center',
    key: 'actions',
    width: '15em',
    render: (row) => {
      return (
        <NSpace justify="center">
          <NButton
            size="small"
            onClick={() => tableModalRef.value.openModal('view', row)}
          >
            查看
          </NButton>
          <NButton
            size="small"
            onClick={() => tableModalRef.value.openModal('edit', row)}
          >
            编辑
          </NButton>
          <NPopconfirm onPositiveClick={() => deleteData(row.id)}>
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

const tableData = ref<AppRoute.RowRoute[]>([])

onMounted(() => {
  getAllRoutes()
})
async function getAllRoutes() {
  startLoading()
  const res = await fetchAllRoutes()
  // isSuccess 为 false 时（code 非 200），res.data 是错误信息，需要用 res 获取原始数据
  const data = res.isSuccess ? (res.data || []) : (res.data || [])
  const mappedData = (Array.isArray(data) ? data : []).map((item: any) => ({
    ...item,
    name: item.title,
    componentPath: item.component,
    pid: item.parentId,
    menuType: item.menuType === 'directory' ? 'dir' : item.menuType,
    order: item.sort,
  }))
  tableData.value = arrayToTree(mappedData) || []
  endLoading()
}

const checkedRowKeys = ref<number[]>([])
async function handlePositiveClick() {
  window.$message.success(`批量删除id:${checkedRowKeys.value.join(',')}`)
}
</script>

<template>
  <n-card>
    <template #header>
      <NButton type="primary" @click="tableModalRef.openModal('add')">
        <template #icon>
          <icon-park-outline-add-one />
        </template>
        新建
      </NButton>
    </template>

    <template #header-extra>
      <n-flex>
        <NButton type="primary" secondary @click="getAllRoutes">
          <template #icon>
            <icon-park-outline-refresh />
          </template>
          刷新
        </NButton>
        <NPopconfirm
          @positive-click="handlePositiveClick"
        >
          <template #trigger>
            <NButton type="error" secondary>
              <template #icon>
                <icon-park-outline-delete-five />
              </template>
              批量删除
            </NButton>
          </template>
          确认删除所有选中菜单？
        </NPopconfirm>
      </n-flex>
    </template>
    <ResponsiveTable
      v-model:checked-row-keys="checkedRowKeys"
      :row-key="(row:AppRoute.RowRoute) => row.id" :columns="columns" :data="tableData"
      :loading="loading"
      :scroll-x="1200"
      children-key="children"
      :mobile-card-title="(row: AppRoute.RowRoute) => row.name"
    />
    <TableModal ref="tableModalRef" :all-routes="tableData" modal-name="菜单" @refresh="getAllRoutes" />
  </n-card>
</template>
