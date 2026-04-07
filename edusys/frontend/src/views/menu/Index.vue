<template>
  <div class="menu-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd(null)">新增根菜单</el-button>
      <el-button @click="loadData">刷新</el-button>
    </div>

    <!-- 桌面端树形表格 -->
    <el-table v-if="!isMobile" :data="tableData" v-loading="loading" stripe :header-cell-style="{background: '#f5f7fa'}" row-key="id" :tree-props="{children: 'children'}" fit>
      <el-table-column prop="name" label="菜单名称" min-width="180" />
      <el-table-column prop="path" label="路由路径" min-width="150" />
      <el-table-column prop="icon" label="图标" width="100" />
      <el-table-column prop="permission" label="权限代码" width="150" />
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ formatStatus(row.status, ['禁用', '启用']) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button type="primary" link @click="handleAdd(row)">添加子菜单</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 移动端卡片列表 -->
    <div v-else-if="!loading && tableData.length > 0" class="mobile-card-list">
      <div class="menu-card" v-for="row in flattenMenus(tableData)" :key="row.id" :style="{ paddingLeft: (row.level - 1) * 20 + 'px' }">
        <div class="menu-card-header">
          <span class="menu-card-title">{{ row.name }}</span>
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ formatStatus(row.status, ['禁用', '启用']) }}
          </el-tag>
        </div>
        <div class="menu-card-info">
          <div class="menu-card-info-item">
            <span class="menu-card-info-label">路径:</span>
            <span>{{ row.path || '-' }}</span>
          </div>
          <div class="menu-card-info-item">
            <span class="menu-card-info-label">权限:</span>
            <span>{{ row.permission || '-' }}</span>
          </div>
          <div class="menu-card-info-item">
            <span class="menu-card-info-label">排序:</span>
            <span>{{ row.sortOrder }}</span>
          </div>
        </div>
        <div class="menu-card-actions">
          <el-button type="primary" size="small" @click="handleAdd(row)">子菜单</el-button>
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 加载骨架屏 -->
    <div v-if="loading" class="skeleton-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && tableData.length === 0" description="暂无菜单数据">
      <el-button type="primary" @click="handleAdd(null)">新增根菜单</el-button>
    </el-empty>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑菜单' : (form.parentId ? '添加子菜单' : '新增根菜单')" :width="isMobile ? '90%' : '500px'" :fullscreen="isMobile">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" :label-position="isMobile ? 'top' : 'right'">
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="form.path" placeholder="如：/user" />
        </el-form-item>
        <el-form-item label="父级菜单">
          <el-input :value="parentMenuName" disabled />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="图标名称，如：User" />
        </el-form-item>
        <el-form-item label="权限代码" prop="permission">
          <el-input v-model="form.permission" placeholder="如：user:list（叶子节点需要）" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getMenuTree, createMenu, updateMenu, deleteMenu } from '@/api/menu'
import { formatStatus } from '@/utils/excel'

const loading = ref(false)
const isMobile = ref(window.innerWidth < 768)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const editId = ref(0)
const parentMenuName = ref('根菜单')

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

const form = reactive({
  name: '',
  path: '',
  parentId: 0 as number | undefined,
  icon: '',
  permission: '',
  sortOrder: 0,
  status: 1
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMenuTree()
    tableData.value = res || []
  } catch (error) {
    console.error('加载失败', error)
  } finally {
    loading.value = false
  }
}

// 将树形数据扁平化，用于移动端展示
const flattenMenus = (menus: any[], level = 1): any[] => {
  const result: any[] = []
  for (const menu of menus) {
    result.push({ ...menu, level })
    if (menu.children && menu.children.length > 0) {
      result.push(...flattenMenus(menu.children, level + 1))
    }
  }
  return result
}

const handleAdd = (row: any) => {
  isEdit.value = false
  form.name = ''
  form.path = ''
  form.icon = ''
  form.permission = ''
  form.sortOrder = 0
  form.status = 1

  if (row) {
    form.parentId = row.id
    parentMenuName.value = row.name
  } else {
    form.parentId = 0
    parentMenuName.value = '根菜单'
  }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  editId.value = row.id
  form.name = row.name
  form.path = row.path || ''
  form.parentId = row.parentId
  form.icon = row.icon || ''
  form.permission = row.permission || ''
  form.sortOrder = row.sortOrder || 0
  form.status = row.status

  // 获取父级菜单名称
  if (row.parentId) {
    const findParent = (menus: any[]): any => {
      for (const menu of menus) {
        if (menu.id === row.parentId) return menu
        if (menu.children) {
          const found = findParent(menu.children)
          if (found) return found
        }
      }
      return null
    }
    const parent = findParent(tableData.value)
    parentMenuName.value = parent ? parent.name : '根菜单'
  } else {
    parentMenuName.value = '根菜单'
  }

  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const data = {
          name: form.name,
          path: form.path,
          parentId: form.parentId || 0,
          icon: form.icon,
          permission: form.permission,
          sortOrder: form.sortOrder,
          status: form.status,
          type: 'menu'
        }

        if (isEdit.value) {
          await updateMenu(editId.value, data)
          ElMessage.success('更新成功')
        } else {
          await createMenu(data)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error: any) {
        ElMessage.error(error.message || '保存失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除菜单 "${row.name}" 吗？${row.children && row.children.length > 0 ? '\n注意：该菜单包含子菜单，将一并删除。' : ''}`,
      '删除确认',
      { type: 'warning' }
    )
    await deleteMenu(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.menu-management {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .menu-management {
    padding: 12px;
  }

  .toolbar {
    flex-wrap: wrap;
    gap: 8px;
  }

  .toolbar .el-button {
    flex: 1;
    min-width: calc(50% - 4px);
  }

  /* 移动端卡片列表 */
  .mobile-card-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .menu-card {
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }

  .menu-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .menu-card-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }

  .menu-card-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    font-size: 12px;
    color: #606266;
  }

  .menu-card-info-item {
    display: flex;
    gap: 4px;
  }

  .menu-card-info-label {
    color: #909399;
  }

  .menu-card-actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #f0f0f0;
  }

  .menu-card-actions .el-button {
    flex: 1;
  }

  /* 隐藏桌面端表格 */
  :deep(.el-table) {
    display: none;
  }
}

/* 桌面端 */
@media (min-width: 769px) {
  .mobile-card-list {
    display: none;
  }
}
</style>