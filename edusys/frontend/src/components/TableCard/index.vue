<template>
  <div class="table-card">
    <!-- 工具栏 -->
    <div class="table-toolbar" v-if="$slots.toolbar || showToolbar">
      <slot name="toolbar">
        <div class="toolbar-left">
          <slot name="toolbar-left" />
        </div>
        <div class="toolbar-right">
          <slot name="toolbar-right" />
        </div>
      </slot>
    </div>

    <!-- 表格 -->
    <el-table
      v-bind="$attrs"
      :data="data"
      v-loading="loading"
      :stripe="stripe"
      :border="border"
      :header-cell-style="{ background: '#f5f7fa' }"
      fit
      class="table"
    >
      <slot />
    </el-table>

    <!-- 分页 -->
    <div class="table-pagination" v-if="showPagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :total="total"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 空状态 -->
    <div class="table-empty" v-if="!loading && (!data || data.length === 0)">
      <slot name="empty">
        <el-empty :description="emptyText" />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  data?: any[]
  loading?: boolean
  stripe?: boolean
  border?: boolean
  showToolbar?: boolean
  showPagination?: boolean
  total?: number
  page?: number
  pageSize?: number
  pageSizes?: number[]
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
  stripe: true,
  border: false,
  showToolbar: false,
  showPagination: true,
  total: 0,
  page: 1,
  pageSize: 10,
  pageSizes: () => [10, 20, 50, 100],
  emptyText: '暂无数据'
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const currentPage = ref(props.page)
const currentPageSize = ref(props.pageSize)

// 移动端简化分页布局
const paginationLayout = computed(() => {
  const isMobile = window.innerWidth < 768
  return isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'
})

watch(() => props.page, (val) => {
  currentPage.value = val
})

watch(() => props.pageSize, (val) => {
  currentPageSize.value = val
})

const handleSizeChange = (size: number) => {
  currentPageSize.value = size
  emit('update:pageSize', size)
  emit('size-change', size)
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  emit('update:page', page)
  emit('page-change', page)
}
</script>

<style scoped>
.table-card {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.table-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: var(--spacing-base);
  border-bottom: 1px solid var(--color-border-lighter);
}

.toolbar-left {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
}

.toolbar-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
  margin-left: auto;
}

.table {
  width: 100%;
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-base);
  border-top: 1px solid var(--color-border-lighter);
}

.table-empty {
  padding: var(--spacing-xxxl);
  text-align: center;
}

@media (max-width: 768px) {
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
    margin-left: 0;
  }

  .table-pagination {
    justify-content: center;
  }

  .table-pagination :deep(.el-pagination__total),
  .table-pagination :deep(.el-pagination__sizes),
  .table-pagination :deep(.el-pagination__jumper) {
    display: none;
  }
}
</style>
