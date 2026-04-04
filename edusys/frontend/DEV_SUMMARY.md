# EduSys 前端开发规范总结

## 一、已实现的核心功能

### 1. 用户管理 (user/Index.vue)
- 表格排序（升序/降序）
- 多字段搜索（用户名、姓名、手机号、邮箱）
- 批量操作（删除、启用、禁用）
- Excel 导入/导出
- 响应式适配（桌面端/移动端）

### 2. 学生管理 (student/Index.vue)
- 批量操作（删除、在读/离校状态）
- Excel 导入/导出
- 动态列宽计算（根据页面宽度平均分配）
- 分页组件移动端简化

### 3. 成绩管理 (score/Index.vue)
- 批量删除
- Excel 导入/导出

### 4. 班级管理 (class/Index.vue)
- Excel 导入/导出

### 5. 年级管理 (grade/Index.vue)
- Excel 导入/导出

### 6. 科目管理 (subject/Index.vue)
- Excel 导入/导出

### 7. 角色管理 (role/Index.vue)
- Excel 导入/导出

### 8. 权限管理 (permission/Index.vue)
- Excel 导入/导出

---

## 二、开发规范

### 1. 表格组件规范

**基础结构:**
```vue
<el-table
  ref="tableRef"
  v-if="!isMobile"
  :data="tableData"
  v-loading="loading"
  stripe
  :header-cell-style="{background: '#f5f7fa'}"
  @selection-change="handleSelectionChange"
  fit
  style="width: 100%"
>
  <el-table-column type="selection" width="50" />
  <el-table-column prop="xxx" label="标题" :width="columnWidth" />
  ...
</el-table>
```

**动态列宽计算 (推荐):**
```typescript
import { ref, nextTick } from 'vue'

const tableRef = ref()
const columnWidth = ref(100)

const calculateColumnWidth = async () => {
  await nextTick()
  if (!tableRef.value) return
  const tableWidth = tableRef.value?.$el?.clientWidth || window.innerWidth - 40
  const fixedWidth = 330 // 固定列宽度总和
  const availableWidth = Math.max(tableWidth - fixedWidth, 200)
  columnWidth.value = Math.floor(availableWidth / 11) // 剩余列数
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  calculateColumnWidth()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  calculateColumnWidth()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
```

### 2. 移动端适配规范

**响应式 CSS:**
```css
/* 表格自适应布局 */
:deep(.el-table) {
  table-layout: auto !important;
  width: 100% !important;
}

:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper) {
  overflow-x: auto;
}

:deep(.el-table .cell) {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/* 分页移动端简化 */
@media (max-width: 768px) {
  :deep(.el-pagination) {
    justify-content: center !important;
    padding: 8px 0 !important;
    flex-wrap: wrap;
  }

  :deep(.el-pagination__total),
  :deep(.el-pagination__sizes),
  :deep(.el-pagination__jumper) {
    display: none;
  }

  :deep(.el-pagination) {
    --el-pagination-button-width: 28px;
    --el-pagination-button-height: 28px;
  }
}
```

### 3. Excel 导入/导出规范

**工具函数位置:** `/src/utils/excel.ts`

```typescript
import { exportToExcel, importFromExcel } from '@/utils/excel'

// 导出
const handleExport = () => {
  const exportData = tableData.value.map(row => ({
    字段1: row.field1,
    字段2: row.field2,
    // ...
  }))
  exportToExcel(exportData, '数据名称')
}

// 导入
const handleImport = async (file: any) => {
  try {
    const data = await importFromExcel(file.raw)
    if (!data || data.length === 0) {
      ElMessage.warning('导入文件为空')
      return
    }

    let successCount = 0
    for (const item of data) {
      try {
        await createData({
          字段1: item.标题1,
          字段2: item.标题2,
          // ...
        })
        successCount++
      } catch (e) {
        console.error('导入失败:', e)
      }
    }

    ElMessage.success(`成功导入 ${successCount} 条数据`)
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败')
  }
}
```

### 4. 批量操作规范

```typescript
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条数据吗？`,
      '批量删除',
      { type: 'warning' }
    )
    for (const row of selectedRows.value) {
      await deleteData(row.id)
    }
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}
```

### 5. 搜索功能规范

```typescript
const searchKeyword = ref('')

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const loadData = async () => {
  const res = await getDataList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    keyword: searchKeyword.value
  })
  // ...
}
```

---

## 三、注意事项

1. **不要使用 exam/Index.vue** - 该页面不存在，已从路由中移除
2. **类型问题** - 使用 `as any` 处理类型不兼容的情况
3. **路由懒加载** - 使用 `() => import('@/views/xxx/Index.vue')` 格式
4. **权限控制** - 使用 `v-if="hasPermission('xxx:list')"` 控制菜单显示
5. **保持响应式** - 所有新页面都需要添加移动端适配 CSS

---

## 四、文件位置参考

| 功能 | 文件路径 |
|------|---------|
| 工具函数 | `/src/utils/excel.ts` |
| 类型定义 | `/src/api/types.ts` |
| API 接口 | `/src/api/*.ts` |
| 路由配置 | `/src/router/index.ts` |
| 状态管理 | `/src/stores/user.ts` |
| 布局组件 | `/src/layouts/MainLayout.vue` |