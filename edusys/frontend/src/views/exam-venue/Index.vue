<template>
  <div class="exam-venue-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增考点</el-button>
      <el-button @click="loadData">刷新</el-button>
      <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
      <el-button @click="handleExport">导出</el-button>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索考点代码/名称"
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
    <el-table v-if="!isMobile" :data="tableData" v-loading="loading" stripe :header-cell-style="{background: '#f5f7fa'}" @selection-change="handleSelectionChange" fit>
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="venueCode" label="考点代码" width="100" />
      <el-table-column prop="venueName" label="考点名称" />
      <el-table-column prop="address" label="地址" />
      <el-table-column prop="contact" label="联系人" width="100" />
      <el-table-column prop="phone" label="联系电话" width="120" />
      <el-table-column prop="totalSeats" label="总座位数" width="100" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button :type="row.status === 1 ? 'danger' : 'success'" link @click="handleToggleStatus(row)">
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
          <span class="mobile-card-label">考点代码</span>
          <span class="mobile-card-value">{{ row.venueCode }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">考点名称</span>
          <span class="mobile-card-value">{{ row.venueName }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">地址</span>
          <span class="mobile-card-value">{{ row.address || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">联系人</span>
          <span class="mobile-card-value">{{ row.contact || '-' }}</span>
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
    <el-empty v-if="!loading && tableData.length === 0" description="暂无考点数据">
      <el-button type="primary" @click="handleAdd">新增考点</el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="考点代码" prop="venueCode">
          <el-input v-model="formData.venueCode" placeholder="如: 7001" />
        </el-form-item>
        <el-form-item label="考点名称" prop="venueName">
          <el-input v-model="formData.venueName" placeholder="考点名称" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="地址" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="formData.contact" placeholder="联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="联系电话" />
        </el-form-item>
        <el-form-item label="总座位数" prop="totalSeats">
          <el-input-number v-model="formData.totalSeats" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getExamVenueList, createExamVenue, updateExamVenue, deleteExamVenue, updateExamVenueStatus } from '@/api/exam-venue'
import { exportToExcel } from '@/utils/excel'

const loading = ref(false)
const isMobile = ref(window.innerWidth < 768)
const tableData = ref<any[]>([])
const searchKeyword = ref('')
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})
const selectedRows = ref<any[]>([])

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增考点')
const formRef = ref()
const submitLoading = ref(false)
const formData = reactive({
  id: 0,
  venueCode: '',
  venueName: '',
  address: '',
  contact: '',
  phone: '',
  totalSeats: 0,
  status: 1
})
const formRules = {
  venueCode: [{ required: true, message: '请输入考点代码', trigger: 'blur' }],
  venueName: [{ required: true, message: '请输入考点名称', trigger: 'blur' }]
}

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
    const res = await getExamVenueList({
      page: pagination.page,
      pageSize: pagination.pageSize,
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

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个考点吗？`, '批量删除', { type: 'warning' })
    for (const row of selectedRows.value) {
      await deleteExamVenue(row.id)
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

const handleExport = () => {
  const exportData = tableData.value.map(row => ({
    ID: row.id,
    考点代码: row.venueCode,
    考点名称: row.venueName,
    地址: row.address,
    联系人: row.contact,
    联系电话: row.phone,
    总座位数: row.totalSeats,
    状态: row.status === 1 ? '启用' : '禁用'
  }))
  exportToExcel(exportData, '考点数据')
}

const handleAdd = () => {
  formData.id = 0
  formData.venueCode = ''
  formData.venueName = ''
  formData.address = ''
  formData.contact = ''
  formData.phone = ''
  formData.totalSeats = 0
  formData.status = 1
  dialogTitle.value = '新增考点'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  formData.id = row.id
  formData.venueCode = row.venueCode
  formData.venueName = row.venueName
  formData.address = row.address || ''
  formData.contact = row.contact || ''
  formData.phone = row.phone || ''
  formData.totalSeats = row.totalSeats || 0
  formData.status = row.status
  dialogTitle.value = '编辑考点'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (formData.id) {
      await updateExamVenue(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      await createExamVenue(formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

const handleToggleStatus = async (row: any) => {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(`确定要${newStatus === 1 ? '启用' : '禁用'}该考点吗？`, '提示', { type: 'warning' })
    await updateExamVenueStatus(row.id, newStatus)
    ElMessage.success('状态更新成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该考点吗？', '删除', { type: 'warning' })
    await deleteExamVenue(row.id)
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
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.mobile-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-card {
  margin-bottom: 0;
}

.mobile-card-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.mobile-card-item:last-child {
  border-bottom: none;
}

.mobile-card-label {
  color: #999;
  font-size: 14px;
}

.mobile-card-value {
  color: #333;
  font-size: 14px;
}

.mobile-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.skeleton-container {
  margin-top: 20px;
}

@media (max-width: 768px) {
  :deep(.el-table) {
    table-layout: auto !important;
    width: 100% !important;
  }

  :deep(.el-table__header-wrapper),
  :deep(.el-table__body-wrapper) {
    overflow-x: auto;
  }

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
}
</style>
