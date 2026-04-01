<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import { NEmpty, NSpin } from 'naive-ui'
import { useWindowSize } from '@vueuse/core'

// 使用 VueUse 获取窗口尺寸，确保响应式更新
const windowSize = useWindowSize()
const windowWidth = computed(() => windowSize.width.value)

interface Props {
  columns: DataTableColumns<any>
  data: any[]
  loading?: boolean
  mobileCardTitle?: (row: any) => string
  rowKey?: string | ((row: any) => string | number)
  childrenKey?: string
  expandOnClick?: boolean
  checkedRowKeys?: number[]
  scrollX?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  mobileCardTitle: undefined,
  rowKey: 'id',
  childrenKey: 'children',
  expandOnClick: true,
  checkedRowKeys: () => [],
  scrollX: undefined,
})

const emit = defineEmits<{
  'update:checkedRowKeys': [keys: number[]]
}>()

const checkedRowKeys = computed({
  get: () => props.checkedRowKeys,
  set: (val) => emit('update:checkedRowKeys', val),
})

// 移动端展开状态管理
const expandedKeys = ref<Set<string | number>>(new Set())

// 切换展开状态
function toggleExpand(row: any) {
  const key = typeof props.rowKey === 'function' ? props.rowKey(row) : row[props.rowKey]
  if (expandedKeys.value.has(key)) {
    expandedKeys.value.delete(key)
  } else {
    expandedKeys.value.add(key)
  }
}

// 判断行是否展开
function isExpanded(row: any): boolean {
  const key = typeof props.rowKey === 'function' ? props.rowKey(row) : row[props.rowKey]
  return expandedKeys.value.has(key)
}

// 获取卡片标题
function getCardTitle(row: any): string {
  if (props.mobileCardTitle) {
    return props.mobileCardTitle(row)
  }
  // 默认取第一列作为标题
  const firstCol = props.columns[0]
  if (firstCol && 'key' in firstCol) {
    return String(row[firstCol.key] ?? '')
  }
  return ''
}

// 获取要显示的列（排除操作列）
function getDisplayColumns(): DataTableColumns<any>[] {
  return props.columns.filter(col => {
    if ('key' in col && col.key === 'actions') return false
    return true
  })
}

const displayColumns = computed(() => getDisplayColumns())

// 扁平化树形数据用于移动端展示
function flattenTree(data: any[], level = 0): (any & { _level: number })[] {
  const result: (any & { _level: number })[] = []
  data.forEach(item => {
    result.push({ ...item, _level: level })
    const children = item[props.childrenKey]
    if (children && Array.isArray(children) && children.length > 0) {
      result.push(...flattenTree(children, level + 1))
    }
  })
  return result
}

const flatData = computed(() => flattenTree(props.data))

// 根据展开状态过滤要显示的数据
function getFilteredFlatData() {
  const result: (any & { _level: number })[] = []
  let parentStack: any[] = []
  
  flatData.value.forEach(item => {
    if (item._level === 0) {
      result.push(item)
      // 检查是否展开
      const key = typeof props.rowKey === 'function' ? props.rowKey(item) : item[props.rowKey]
      if (item[props.childrenKey]?.length && expandedKeys.value.has(key)) {
        parentStack = item[props.childrenKey]
      } else {
        parentStack = []
      }
    } else {
      // 检查当前项是否应该显示（父级已展开）
      if (parentStack.length > 0) {
        result.push(item)
        // 更新父级栈
        const key = typeof props.rowKey === 'function' ? props.rowKey(item) : item[props.rowKey]
        if (item[props.childrenKey]?.length && expandedKeys.value.has(key)) {
          parentStack = item[props.childrenKey]
        }
      }
    }
  })
  
  return result
}

const filteredData = computed(() => getFilteredFlatData())
</script>

<template>
  <!-- 桌面端：表格模式 -->
  <div :style="{ display: windowWidth >= 768 ? 'block' : 'none' }">
    <n-data-table
      v-model:checked-row-keys="checkedRowKeys"
      :columns="columns"
      :data="data"
      :loading="loading"
      :bordered="false"
      :single-line="false"
      :row-key="typeof rowKey === 'function' ? rowKey : (row: any) => row[rowKey]"
      :scroll-x="scrollX"
    />
  </div>

  <!-- 移动端：卡片模式 -->
  <div :style="{ display: windowWidth < 768 ? 'block' : 'none' }" class="space-y-3">
    <n-spin :show="loading">
      <n-empty v-if="!data?.length && !loading" description="暂无数据" />
      
      <template v-else>
        <div
          v-for="(row, index) in filteredData"
          :key="row.id ?? index"
          class="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
          :style="{ marginLeft: `${row._level * 16}px` }"
        >
          <!-- 卡片标题 -->
          <div 
            class="font-semibold text-base text-gray-800 mb-3 pb-2 border-b border-gray-100 flex items-center"
            :class="{ 'cursor-pointer': row[childrenKey]?.length }"
            @click="row[childrenKey]?.length && toggleExpand(row)"
          >
            <span v-if="row[childrenKey]?.length" class="mr-2">
              <icon-park-outline-right 
                :class="['transition-transform', isExpanded(row) ? 'rotate-90' : '']" 
              />
            </span>
            {{ getCardTitle(row) }}
          </div>

          <!-- 卡片内容 -->
          <div class="space-y-2">
            <div
              v-for="col in displayColumns"
              :key="col.key"
              class="flex justify-between items-center text-sm"
            >
              <span class="text-gray-500">{{ col.title }}</span>
              <span class="text-gray-800 text-right">
                <!-- 自定义渲染 -->
                <component
                  v-if="col.render"
                  :is="col.render(row)"
                  :row="row"
                />
                <span v-else>{{ row[col.key] ?? '-' }}</span>
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <template v-if="columns.some(c => c.key === 'actions')">
            <div class="mt-3 pt-3 border-t border-gray-100 flex justify-center gap-2">
              <template v-for="(col, idx) in columns" :key="idx">
                <component
                  v-if="col.key === 'actions' && col.render"
                  :is="col.render(row)"
                />
              </template>
            </div>
          </template>
        </div>
      </template>
    </n-spin>
  </div>
</template>

<style scoped>
/* 移动端卡片样式 */
@media (max-width: 768px) {
  :deep(.n-data-table) {
    --n-th-padding: 8px 12px;
    --n-td-padding: 8px 12px;
  }
}
</style>