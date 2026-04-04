<template>
  <div class="exam-room-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增考场</el-button>
      <el-button type="success" @click="handleBatchAdd">批量创建</el-button>
      <el-button @click="loadData">刷新</el-button>
      <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
      <el-button @click="handleExport">导出</el-button>
      <el-select v-model="filterVenueId" placeholder="选择考点" clearable style="width: 150px" @change="handleFilterChange">
        <el-option v-for="v in venueList" :key="v.id" :label="v.venueName" :value="v.id" />
      </el-select>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索考场号/名称"
        clearable
        @keyup.enter="handleSearch"
        style="width: 200px; margin-left: auto"
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
      <el-table-column prop="venueId" label="考点" width="120">
        <template #default="{ row }">
          {{ getVenueName(row.venueId) }}
        </template>
      </el-table-column>
      <el-table-column prop="roomNo" label="考场号" width="100" />
      <el-table-column prop="roomName" label="考场名称" />
      <el-table-column prop="capacity" label="容纳人数" width="100" />
      <el-table-column prop="currentCount" label="当前人数" width="100" />
      <el-table-column prop="floor" label="楼层" width="80" />
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
          <span class="mobile-card-label">考点</span>
          <span class="mobile-card-value">{{ getVenueName(row.venueId) }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">考场号</span>
          <span class="mobile-card-value">{{ row.roomNo }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">考场名称</span>
          <span class="mobile-card-value">{{ row.roomName || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">容纳人数</span>
          <span class="mobile-card-value">{{ row.capacity }}</span>
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
          </el-card>
        </template>
      </el-skeleton>
      <el-skeleton v-else :rows="5" animated />
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && tableData.length === 0" description="暂无考场数据">
      <el-button type="primary" @click="handleAdd">新增考场</el-button>
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
        <el-form-item label="考点" prop="venueId">
          <el-select v-model="formData.venueId" placeholder="选择考点">
            <el-option v-for="v in venueList" :key="v.id" :label="v.venueName" :value="v.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="考场号" prop="roomNo">
          <el-input-number v-model="formData.roomNo" :min="1" />
        </el-form-item>
        <el-form-item label="考场名称" prop="roomName">
          <el-input v-model="formData.roomName" placeholder="考场名称" />
        </el-form-item>
        <el-form-item label="容纳人数" prop="capacity">
          <el-input-number v-model="formData.capacity" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="楼层" prop="floor">
          <el-input v-model="formData.floor" placeholder="如: 1楼" />
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

    <!-- 批量创建弹窗 -->
    <el-dialog v-model="batchDialogVisible" title="批量创建考场" width="400px">
      <el-form ref="batchFormRef" :model="batchFormData" :rules="batchFormRules" label-width="100px">
        <el-form-item label="考点" prop="venueId">
          <el-select v-model="batchFormData.venueId" placeholder="选择考点">
            <el-option v-for="v in venueList" :key="v.id" :label="v.venueName" :value="v.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="起始考场号" prop="startRoomNo">
          <el-input-number v-model="batchFormData.startRoomNo" :min="1" />
        </el-form-item>
        <el-form-item label="结束考场号" prop="endRoomNo">
          <el-input-number v-model="batchFormData.endRoomNo" :min="1" />
        </el-form-item>
        <el-form-item label="容纳人数" prop="capacity">
          <el-input-number v-model="batchFormData.capacity" :min="1" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchSubmit" :loading="batchLoading">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getExamRoomList, createExamRoom, updateExamRoom, deleteExamRoom, batchCreateExamRoom } from '@/api/exam-room'
import { getExamVenueList } from '@/api/exam-venue'
import { exportToExcel } from '@/utils/excel'

const loading = ref(false)
const isMobile = ref(window.innerWidth < 768)
const tableData = ref<any[]>([])
const venueList = ref<any[]>([])
const searchKeyword = ref('')
const filterVenueId = ref<number | null>(null)
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})
const selectedRows = ref<any[]>([])

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增考场')
const formRef = ref()
const submitLoading = ref(false)
const formData = reactive({
  id: 0,
  venueId: 0,
  roomNo: 1,
  roomName: '',
  capacity: 30,
  floor: '',
  status: 1
})
const formRules = {
  venueId: [{ required: true, message: '请选择考点', trigger: 'change' }],
  roomNo: [{ required: true, message: '请输入考场号', trigger: 'blur' }],
  capacity: [{ required: true, message: '请输入容纳人数', trigger: 'blur' }]
}

// 批量创建
const batchDialogVisible = ref(false)
const batchFormRef = ref()
const batchLoading = ref(false)
const batchFormData = reactive({
  venueId: 0,
  startRoomNo: 1,
  endRoomNo: 10,
  capacity: 30
})
const batchFormRules = {
  venueId: [{ required: true, message: '请选择考点', trigger: 'change' }],
  startRoomNo: [{ required: true, message: '请输入起始考场号', trigger: 'blur' }],
  endRoomNo: [{ required: true, message: '请输入结束考场号', trigger: 'blur' }]
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadVenues()
  loadData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const loadVenues = async () => {
  try {
    const res = await getExamVenueList({ pageSize: 100 })
    venueList.value = res.list || []
  } catch (error) {
    console.error('加载考点失败', error)
  }
}

const getVenueName = (venueId: number) => {
  const venue = venueList.value.find(v => v.id === venueId)
  return venue?.venueName || '-'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getExamRoomList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      venueId: filterVenueId.value,
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

const handleFilterChange = () => {
  pagination.page = 1
  loadData()
}

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个考场吗？`, '批量删除', { type: 'warning' })
    for (const row of selectedRows.value) {
      await deleteExamRoom(row.id)
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
    考点: getVenueName(row.venueId),
    考场号: row.roomNo,
    考场名称: row.roomName,
    容纳人数: row.capacity,
    当前人数: row.currentCount,
    楼层: row.floor,
    状态: row.status === 1 ? '启用' : '禁用'
  }))
  exportToExcel(exportData, '考场数据')
}

const handleAdd = () => {
  formData.id = 0
  formData.venueId = venueList.value[0]?.id || 0
  formData.roomNo = 1
  formData.roomName = ''
  formData.capacity = 30
  formData.floor = ''
  formData.status = 1
  dialogTitle.value = '新增考场'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  formData.id = row.id
  formData.venueId = row.venueId
  formData.roomNo = row.roomNo
  formData.roomName = row.roomName || ''
  formData.capacity = row.capacity
  formData.floor = row.floor || ''
  formData.status = row.status
  dialogTitle.value = '编辑考场'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (formData.id) {
      await updateExamRoom(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      await createExamRoom(formData)
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

const handleBatchAdd = () => {
  batchFormData.venueId = venueList.value[0]?.id || 0
  batchFormData.startRoomNo = 1
  batchFormData.endRoomNo = 10
  batchFormData.capacity = 30
  batchDialogVisible.value = true
}

const handleBatchSubmit = async () => {
  await batchFormRef.value?.validate()
  batchLoading.value = true
  try {
    const res = await batchCreateExamRoom(batchFormData)
    ElMessage.success(`创建成功 ${res.created} 个考场${res.conflicts.length > 0 ? '，冲突 ' + res.conflicts.length + ' 个' : ''}`)
    batchDialogVisible.value = false
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '创建失败')
  } finally {
    batchLoading.value = false
  }
}

const handleToggleStatus = async (row: any) => {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(`确定要${newStatus === 1 ? '启用' : '禁用'}该考场吗？`, '提示', { type: 'warning' })
    // 调用更新接口
    await updateExamRoom(row.id, { status: newStatus })
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
    await ElMessageBox.confirm('确定要删除该考场吗？', '删除', { type: 'warning' })
    await deleteExamRoom(row.id)
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
