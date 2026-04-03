<template>
  <div class="role-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增角色</el-button>
      <el-button @click="loadData">刷新</el-button>
      <el-button @click="handleExport">导出</el-button>
      <el-upload
        :show-file-list="false"
        :auto-upload="false"
        :on-change="handleImport"
        accept=".xlsx,.xls"
      >
        <el-button>导入</el-button>
      </el-upload>
    </div>

    <!-- 桌面端表格 -->
    <el-table v-if="!isMobile" :data="tableData" v-loading="loading" stripe :header-cell-style="{background: '#f5f7fa'}" fit>
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="roleName" label="角色名称" width="120" />
      <el-table-column prop="roleCode" label="角色编码" width="120" />
      <el-table-column prop="roleDesc" label="描述" />
      <el-table-column prop="isSystem" label="系统" width="70">
        <template #default="{ row }">
          <el-tag :type="row.isSystem === 1 ? 'warning' : 'info'">
            {{ row.isSystem === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleAssignPermissions(row)">分配权限</el-button>
            <el-button type="danger" link :disabled="row.isSystem === 1" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 移动端卡片式列表 -->
    <div v-else-if="!loading && tableData.length > 0" class="mobile-card-list">
      <el-card v-for="row in tableData" :key="row.id" class="mobile-card">
        <div class="mobile-card-item">
          <span class="mobile-card-label">角色名称</span>
          <span class="mobile-card-value">{{ row.roleName }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">角色编码</span>
          <span class="mobile-card-value">{{ row.roleCode }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">描述</span>
          <span class="mobile-card-value">{{ row.roleDesc || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">系统角色</span>
          <el-tag :type="row.isSystem === 1 ? 'warning' : 'info'" size="small">
            {{ row.isSystem === 1 ? '是' : '否' }}
          </el-tag>
        </div>
        <div class="mobile-card-actions">
          <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" size="small" link @click="handleAssignPermissions(row)">分配权限</el-button>
          <el-button type="danger" size="small" link :disabled="row.isSystem === 1" @click="handleDelete(row)">删除</el-button>
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
    <el-empty v-if="!loading && tableData.length === 0" description="暂无角色数据">
      <el-button type="primary" @click="handleAdd">新增角色</el-button>
    </el-empty>

    <!-- 权限分配对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="分配权限" width="500px">
      <el-checkbox-group v-model="selectedPermissions">
        <el-checkbox
          v-for="item in permissionList"
          :key="item.id"
          :value="item.id"
        >
          {{ item.permissionName }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermissions" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoleList, createRole, deleteRole, getRolePermissions, updateRolePermissions, getPermissionList } from '@/api/role'
import { exportToExcel, importFromExcel } from '@/utils/excel'

const router = useRouter()

const loading = ref(false)
const isMobile = ref(window.innerWidth < 768)
const tableData = ref<any[]>([])
const permissionDialogVisible = ref(false)
const saving = ref(false)
const currentRoleId = ref(0)
const permissionList = ref<any[]>([])
const selectedPermissions = ref<number[]>([])

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadData()
  loadPermissions()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getRoleList()
    tableData.value = res.list || res || []
  } catch (error) {
    console.error('加载失败', error)
  } finally {
    loading.value = false
  }
}

const loadPermissions = async () => {
  try {
    const res: any = await getPermissionList()
    const perms = res.list || res || []
    // 确保 id 是数字类型
    permissionList.value = (perms as any[]).map((p: any) => ({
      ...p,
      id: Number(p.id)
    }))
  } catch (error) {
    console.error('加载权限失败', error)
  }
}

const handleAdd = () => {
  router.push('/role/add')
}

const handleEdit = (row: any) => {
  router.push(`/role/${row.id}/edit`)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${row.roleName}" 吗？\n\n注意：该操作将同时删除该角色的所有权限配置。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleExport = () => {
  const exportData = tableData.value.map(row => ({
    角色名称: row.roleName,
    角色编码: row.roleCode,
    描述: row.roleDesc || '',
    系统角色: row.isSystem === 1 ? '是' : '否'
  }))
  exportToExcel(exportData, '角色数据')
}

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
        await createRole({
          roleName: item.角色名称,
          roleCode: item.角色编码,
          roleDesc: item.描述 || '',
          isSystem: item.系统角色 === '是' ? 1 : 0
        })
        successCount++
      } catch (e) {
        console.error('导入角色失败:', e)
      }
    }

    ElMessage.success(`成功导入 ${successCount} 条数据`)
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败')
  }
}

const handleAssignPermissions = async (row: any) => {
  currentRoleId.value = Number(row.id)
  try {
    const res: any = await getRolePermissions(row.id)
    // 确保 id 是数字类型
    selectedPermissions.value = (res || []).map((p: any) => Number(p.id))
  } catch (error) {
    selectedPermissions.value = []
  }
  permissionDialogVisible.value = true
}

const handleSavePermissions = async () => {
  saving.value = true
  try {
    await updateRolePermissions(currentRoleId.value, selectedPermissions.value)
    ElMessage.success('保存成功')
    permissionDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadData()
  loadPermissions()
})
</script>

<style scoped>
.role-management {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
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

.el-checkbox {
  display: block;
  margin-bottom: 10px;
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
  :deep(.el-dialog) { width: 90% !important; margin: 10px !important; }
  :deep(.el-pagination) { justify-content: center !important; }
  :deep(.el-table) { font-size: 12px; }

  .action-buttons {
    gap: 2px;
  }

  .action-buttons .el-button {
    padding: 2px 4px;
    font-size: 11px;
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