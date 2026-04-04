<template>
  <div class="user-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增用户</el-button>
      <el-button @click="loadData">刷新</el-button>
      <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
      <el-button type="success" :disabled="selectedRows.length === 0" @click="handleBatchEnable">批量启用</el-button>
      <el-button type="warning" :disabled="selectedRows.length === 0" @click="handleBatchDisable">批量禁用</el-button>
      <el-button @click="handleExport">导出</el-button>
      <el-upload
        :show-file-list="false"
        :auto-upload="false"
        :on-change="handleImport"
        accept=".xlsx,.xls"
      >
        <el-button>导入</el-button>
      </el-upload>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户名/姓名/手机号/邮箱"
        clearable
        @keyup.enter="handleSearch"
        style="width: 240px; margin-left: auto"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch" />
        </template>
      </el-input>
    </div>

    <!-- 桌面端表格 -->
    <el-table v-if="!isMobile" :data="tableData" v-loading="loading" stripe :header-cell-style="{background: '#f5f7fa'}" @sort-change="handleSortChange" @selection-change="handleSelectionChange" fit>
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="60" sortable="custom" />
      <el-table-column prop="username" label="用户名" sortable="custom" />
      <el-table-column prop="realName" label="姓名" sortable="custom" />
      <el-table-column prop="roleName" label="角色" width="80" />
      <el-table-column prop="phone" label="手机号" width="120" sortable="custom" />
      <el-table-column prop="email" label="邮箱" sortable="custom" />
      <el-table-column prop="status" label="状态" width="70">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginTime" label="最后登录" width="150" sortable="custom">
        <template #default="{ row }">
          {{ row.lastLoginTime || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button
              :type="row.status === 1 ? 'danger' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 移动端卡片式列表 -->
    <div v-else-if="!loading && tableData.length > 0" class="mobile-card-list">
      <el-card v-for="row in tableData" :key="row.id" class="mobile-card">
        <div class="mobile-card-item">
          <span class="mobile-card-label">用户名</span>
          <span class="mobile-card-value">{{ row.username }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">姓名</span>
          <span class="mobile-card-value">{{ row.realName }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">角色</span>
          <span class="mobile-card-value">{{ row.roleName }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">手机号</span>
          <span class="mobile-card-value">{{ row.phone }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">状态</span>
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </div>
        <div class="mobile-card-actions">
          <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
          <el-button :type="row.status === 1 ? 'danger' : 'success'" size="small" link @click="handleToggleStatus(row)">
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
        </div>
      </el-card>
    </div>

    <!-- 加载骨架屏 -->
    <div v-if="loading" class="skeleton-container">
      <el-skeleton v-if="isMobile" :rows="3" animated>
        <template #template>
          <el-card v-for="i in 3" :key="i" class="mobile-card">
            <el-skeleton-item variant="text" style="width: 40%" />
            <el-skeleton-item variant="text" style="width: 60%; margin-top: 8px" />
            <el-skeleton-item variant="text" style="width: 50%; margin-top: 8px" />
          </el-card>
        </template>
      </el-skeleton>
      <el-skeleton v-else :rows="5" animated />
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && tableData.length === 0" description="暂无用户数据">
      <el-button type="primary" @click="handleAdd">新增用户</el-button>
    </el-empty>

    <el-pagination
      v-if="tableData.length > 0"
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @change="loadData"
      style="margin-top: 20px; justify-content: flex-end"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getUserList, updateUserStatus, deleteUser, createUser } from '@/api/user'
import { exportToExcel, importFromExcel } from '@/utils/excel'
import type { User } from '@/api/types'

const router = useRouter()

const loading = ref(false)
const isMobile = ref(window.innerWidth < 768)
const tableData = ref<User[]>([])
const searchKeyword = ref('')
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})
const sortField = ref('')
const sortOrder = ref('')
const selectedRows = ref<User[]>([])

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
      keyword: searchKeyword.value
    })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('加载失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleSortChange = ({ prop, order }: any) => {
  sortField.value = prop || ''
  sortOrder.value = order === 'ascending' ? 'ASC' : order === 'descending' ? 'DESC' : ''
  pagination.page = 1
  loadData()
}

const handleSelectionChange = (rows: User[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个用户吗？`, '批量删除', { type: 'warning' })
    for (const row of selectedRows.value) {
      await deleteUser(row.id)
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

const handleBatchEnable = async () => {
  if (selectedRows.value.length === 0) return
  try {
    await ElMessageBox.confirm(`确定要启用选中的 ${selectedRows.value.length} 个用户吗？`, '批量启用', { type: 'warning' })
    for (const row of selectedRows.value) {
      await updateUserStatus(row.id, 1)
    }
    ElMessage.success('批量启用成功')
    selectedRows.value = []
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleBatchDisable = async () => {
  if (selectedRows.value.length === 0) return
  try {
    await ElMessageBox.confirm(`确定要禁用选中的 ${selectedRows.value.length} 个用户吗？`, '批量禁用', { type: 'warning' })
    for (const row of selectedRows.value) {
      await updateUserStatus(row.id, 0)
    }
    ElMessage.success('批量禁用成功')
    selectedRows.value = []
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleExport = () => {
  const exportData = tableData.value.map(row => ({
    ID: row.id,
    用户名: row.username,
    姓名: row.realName,
    角色: row.roleName,
    手机号: row.phone,
    邮箱: row.email,
    状态: row.status === 1 ? '启用' : '禁用',
    最后登录: row.lastLoginTime || '-'
  }))
  exportToExcel(exportData, '用户数据')
}

const handleImport = async (file: any) => {
  try {
    const data = await importFromExcel(file.raw)
    if (!data || data.length === 0) {
      ElMessage.warning('导入文件为空')
      return
    }

    // 批量创建用户
    let successCount = 0
    for (const item of data) {
      try {
        await createUser({
          username: item.用户名,
          realName: item.姓名,
          phone: item.手机号 || '',
          email: item.邮箱 || '',
          roleId: 2, // 默认普通用户角色
          status: 1
        } as any)
        successCount++
      } catch (e) {
        console.error('导入用户失败:', e)
      }
    }

    ElMessage.success(`成功导入 ${successCount} 条数据`)
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败')
  }
}

const handleAdd = () => {
  router.push('/user/add')
}

const handleEdit = (row: User) => {
  router.push(`/user/${row.id}/edit`)
}

const handleToggleStatus = async (row: User) => {
  const newStatus = row.status === 1 ? 0 : 1
  const text = newStatus === 1 ? '启用' : '禁用'

  try {
    await ElMessageBox.confirm(`确定要${text}该用户吗？`, '提示', {
      type: 'warning'
    })
    await updateUserStatus(row.id, newStatus)
    ElMessage.success(`${text}成功`)
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || `${text}失败`)
    }
  }
}

const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      type: 'warning'
    })
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

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

/* 操作按钮在一行显示 */
.action-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: nowrap;
  align-items: center;
}

.action-buttons .el-button {
  padding: 4px 8px;
  font-size: 13px;
}

/* 大屏幕适配 */
@media (min-width: 1920px) {
  .action-buttons .el-button {
    padding: 6px 12px;
    font-size: 14px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .user-management {
    padding: 12px;
  }

  .toolbar {
    gap: 8px;
  }

  .action-buttons {
    gap: 2px;
  }

  .action-buttons .el-button {
    padding: 2px 4px;
    font-size: 11px;
  }

  :deep(.el-table) {
    font-size: 12px;
  }

  :deep(.el-button) {
    padding: 4px 8px;
    font-size: 12px;
  }

  :deep(.el-pagination) {
    justify-content: center !important;
    padding: 8px 0 !important;
  }

  :deep(.el-pagination__total) {
    display: none;
  }

  :deep(.el-pagination__sizes) {
    display: none;
  }

  :deep(.el-pagination__jumper) {
    display: none;
  }

  :deep(.el-pagination) {
    --el-pagination-button-width: 28px;
    --el-pagination-button-height: 28px;
  }
}

/* 移动端卡片列表样式 */
.mobile-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-card {
  border-radius: 8px;
}

.mobile-card-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.mobile-card-item:last-child {
  border-bottom: none;
}

.mobile-card-label {
  color: #909399;
  font-size: 13px;
}

.mobile-card-value {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.mobile-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

/* 骨架屏样式 */
.skeleton-container {
  padding: 10px 0;
}

.skeleton-container .mobile-card {
  margin-bottom: 12px;
}
</style>