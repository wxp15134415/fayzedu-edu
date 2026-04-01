<script setup lang="tsx">
import type { DataTableColumns } from 'naive-ui'
import CopyText from '@/components/custom/CopyText.vue'
import ResponsiveTable from '@/components/common/ResponsiveTable.vue'
import { useBoolean } from '@/hooks'
import { createDictData, createDictType, deleteDictData, deleteDictType, fetchDictList, fetchDictData, updateDictData, updateDictType } from '@/service'
import { useDictStore } from '@/store'
import { NButton, NFlex, NPopconfirm } from 'naive-ui'
import DictModal from './components/DictModal.vue'

const { bool: dictLoading, setTrue: startDictLoading, setFalse: endDictLoading } = useBoolean(false)
const { bool: contentLoading, setTrue: startContentLoading, setFalse: endContentLoading } = useBoolean(false)

const { getDictByNet } = useDictStore()

const dictRef = ref<InstanceType<typeof DictModal>>()
const dictContentRef = ref<InstanceType<typeof DictModal>>()

onMounted(() => {
  getDictList()
})

const dictData = ref<Entity.Dict[]>([])
const dictContentData = ref<Entity.Dict[]>([])

async function getDictList() {
  startDictLoading()
  const res = await fetchDictList()
  if (res.isSuccess) {
    const list = res.data?.records || res.data?.list || res.data || []
    dictData.value = Array.isArray(list) ? list.map((item: any) => ({
      id: item.id,
      code: item.type,
      label: item.name,
      isRoot: 1,
    })) : []
  } else {
    dictData.value = []
  }
  endDictLoading()
}

const lastDictCode = ref('')
async function getDictContent(code: string) {
  startContentLoading()
  const res = await fetchDictData(code)
  if (res.isSuccess) {
    const list = res.data || []
    dictContentData.value = Array.isArray(list) ? list.map((item: any) => ({
      id: item.id,
      code: item.dictType,
      label: item.name,
      value: item.value,
      isRoot: 0,
    })) : []
  } else {
    dictContentData.value = []
  }
  lastDictCode.value = code
  endContentLoading()
}

const dictColumns: DataTableColumns<Entity.Dict> = [
  {
    title: '字典项',
    key: 'label',
  },
  {
    title: '字典码',
    key: 'code',
    render: (row) => {
      return (
        <CopyText value={row.code} />
      )
    },
  },
  {
    title: '操作',
    key: 'actions',
    align: 'center',
    render: (row) => {
      return (
        <div class="flex-center">
          <NButton
            size="small"
            onClick={() => getDictContent(row.code)}
          >
            查看字典
          </NButton>
          <NButton
            size="small"
            onClick={() => dictRef.value!.openModal('edit', row)}
          >
            编辑
          </NButton>
            <NPopconfirm onPositiveClick={() => deleteDict(row.id!, true)}>
            {{
              default: () => (
                <span>
                  确认删除字典
                  <b>{row.label}</b>
                  {' '}
                  ？
                </span>
              ),
              trigger: () => <NButton size="small" type="error">删除</NButton>,
            }}
          </NPopconfirm>
        </div>
      )
    },
  },
]

const contentColumns: DataTableColumns<Entity.Dict> = [
  {
    title: '字典名称',
    key: 'label',
  },
  {
    title: '字典码',
    key: 'code',
  },
  {
    title: '字典值',
    key: 'value',
  },
  {
    title: '操作',
    key: 'actions',
    align: 'center',
    width: '15em',
    render: (row) => {
      return (
        <div class="flex-center">
          <NButton
            size="small"
            onClick={() => dictContentRef.value!.openModal('edit', row)}
          >
            编辑
          </NButton>
          <NPopconfirm onPositiveClick={() => deleteDict(row.id!, false)}>
            {{
              default: () => (
                <span>
                  确认删除字典值
                  <b>{row.label}</b>
                  {' '}
                  ？
                </span>
              ),
              trigger: () => <NButton size="small" type="error">删除</NButton>,
            }}
          </NPopconfirm>
        </div>
      )
    },
  },
]

function deleteDict(id: number, isRoot: boolean = true) {
  const api = isRoot ? deleteDictType : deleteDictData
  api(id).then(({ isSuccess, message }) => {
    if (isSuccess) {
      window.$message.success('删除成功')
      if (isRoot) {
        getDictList()
      } else {
        getDictContent(lastDictCode.value)
      }
    } else {
      window.$message.error(message || '删除失败')
    }
  })
}

function handleDictSuccess() {
  getDictList()
}

function handleDictContentSuccess() {
  getDictContent(lastDictCode.value)
}
</script>

<template>
  <div>
    <NFlex>
      <div class="basis-2/5">
        <n-card>
          <template #header>
            <NButton type="primary" @click="dictRef!.openModal('add')">
              <template #icon>
                <icon-park-outline-add-one />
              </template>
              新建
            </NButton>
          </template>
          <template #header-extra>
            <NFlex>
              <NButton type="primary" secondary @click="getDictList">
                <template #icon>
                  <icon-park-outline-refresh />
                </template>
                刷新
              </NButton>
            </NFlex>
          </template>
          <ResponsiveTable
            :columns="dictColumns" :data="dictData" :loading="dictLoading"
          />
        </n-card>
      </div>
      <div class="flex-1">
        <n-card>
          <template #header>
            <NButton type="primary" :disabled="!lastDictCode" @click="dictContentRef!.openModal('add')">
              <template #icon>
                <icon-park-outline-add-one />
              </template>
              新建
            </NButton>
          </template>
          <template #header-extra>
            <NFlex>
              <NButton type="primary" :disabled="!lastDictCode" secondary @click="getDictContent(lastDictCode)">
                <template #icon>
                  <icon-park-outline-refresh />
                </template>
                刷新
              </NButton>
            </NFlex>
          </template>
          <ResponsiveTable
            :columns="contentColumns" :data="dictContentData" :loading="contentLoading"
          />
        </n-card>
      </div>

      <DictModal ref="dictRef" modal-name="字典项" is-root @success="handleDictSuccess" />
      <DictModal ref="dictContentRef" modal-name="字典值" :dict-code="lastDictCode" @success="handleDictContentSuccess" />
    </NFlex>
  </div>
</template>

<style scoped></style>
