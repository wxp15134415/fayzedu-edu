<template>
  <div class="teacher-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增教师</el-button>
      <el-button @click="loadData">刷新</el-button>
      <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
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
        placeholder="搜索工号/姓名/手机号"
        clearable
        @keyup.enter="handleSearch"
        style="width: 220px; margin-left: auto"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch" />
        </template>
      </el-input>
    </div>

    <!-- 桌面端表格 -->
    <el-table
      ref="tableRef"
      v-if="!isMobile"
      :data="tableData"
      v-loading="loading"
      stripe
      :header-cell-style="{background: '#f5f7fa'}"
      @selection-change="handleSelectionChange"
      :fit="false"
      style="width: 100%"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="teacherNo" label="工号" :width="columnWidth" />
      <el-table-column prop="teacherId" label="教工号" :width="columnWidth" />
      <el-table-column prop="name" label="姓名" :width="columnWidth" />
      <el-table-column prop="subject.name" label="任教科目" :width="columnWidth" />
      <el-table-column prop="gender" label="性别" width="60">
        <template #default="{ row }">
          {{ row.gender === '1' || row.gender === '男' ? '男' : (row.gender === '2' || row.gender === '女' ? '女' : '-') }}
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" :width="columnWidth" />
      <el-table-column prop="position" label="岗位" :width="columnWidth" />
      <el-table-column prop="title" label="职称" :width="columnWidth" />
      <el-table-column prop="status" label="状态" width="60">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '在岗' : '离职' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 移动端卡片式列表 -->
    <div v-else-if="!loading && tableData.length > 0" class="mobile-card-list">
      <el-card v-for="row in tableData" :key="row.id" class="mobile-card">
        <div class="mobile-card-item">
          <span class="mobile-card-label">工号</span>
          <span class="mobile-card-value">{{ row.teacherNo || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">姓名</span>
          <span class="mobile-card-value">{{ row.name }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">任教科目</span>
          <span class="mobile-card-value">{{ row.subject?.name || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">性别</span>
          <span class="mobile-card-value">{{ row.gender === '1' || row.gender === '男' ? '男' : (row.gender === '2' || row.gender === '女' ? '女' : '-') }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">手机号</span>
          <span class="mobile-card-value">{{ row.phone || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">岗位</span>
          <span class="mobile-card-value">{{ row.position || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">状态</span>
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '在岗' : '离职' }}</el-tag>
        </div>
        <div class="mobile-card-actions">
          <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
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
    <el-empty v-if="!loading && tableData.length === 0" description="暂无教师数据">
      <el-button type="primary" @click="handleAdd">新增教师</el-button>
    </el-empty>

    <el-pagination
      v-if="tableData.length > 0"
      v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
      :total="pagination.total" :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper" @change="loadData"
      style="margin-top: 20px; justify-content: flex-end"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getTeacherList, createTeacher, deleteTeacher, getSubjectList, batchDeleteTeacher, updateTeacherStatus } from '@/api/teacher'
import { exportToExcel, importFromExcel } from '@/utils/excel'

const router = useRouter()
const loading = ref(false)
const isMobile = ref(window.innerWidth < 768)
const tableData = ref<any[]>([])
const subjectList = ref<any[]>([])
const searchKeyword = ref('')
const selectedRows = ref<any[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const tableRef = ref()
const columnWidth = ref(100)

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  calculateColumnWidth()
}

const calculateColumnWidth = async () => {
  await nextTick()
  if (!tableRef.value) return
  const tableWidth = tableRef.value?.$el?.clientWidth || window.innerWidth - 40
  const fixedWidth = 290
  const availableWidth = Math.max(tableWidth - fixedWidth, 200)
  columnWidth.value = Math.floor(availableWidth / 9)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadData()
  loadSubjects()
  calculateColumnWidth()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getTeacherList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value
    })
    // 防御性处理：确保返回的是数组
    const list = res?.data?.list || res?.list || res || []
    tableData.value = Array.isArray(list) ? list : []
    pagination.total = res?.data?.total || res?.total || 0
  }
  catch (error) {
    console.error('加载失败', error)
    tableData.value = []
  }
  finally { loading.value = false }
}

const loadSubjects = async () => {
  try {
    const res: any = await getSubjectList()
    subjectList.value = res || []
  } catch (error) { console.error('加载科目失败', error) }
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
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 位教师吗？`, '批量删除', { type: 'warning' })
    for (const row of selectedRows.value) {
      await deleteTeacher(row.id)
    }
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '删除失败')
  }
}

const handleAdd = () => {
  router.push('/teacher/add')
}

const handleEdit = (row: any) => {
  router.push(`/teacher/${row.id}/edit`)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除教师 "${row.name}" 吗？`,
      '删除确认',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    await deleteTeacher(row.id)
    ElMessage.success('删除成功')
    loadData()
  }
  catch (error: any) { if (error !== 'cancel') ElMessage.error(error.message || '删除失败') }
}

const handleExport = () => {
  const exportData = tableData.value.map(row => ({
    工号: row.teacherNo,
    教工号: row.teacherId,
    姓名: row.name,
    任教科目: row.subject?.name || '',
    性别: row.gender === '1' || row.gender === '男' ? '男' : '女',
    手机号: row.phone,
    邮箱: row.email,
    岗位: row.position || '',
    职称: row.title || '',
    学历: row.education || '',
    学位: row.degree || '',
    入职日期: row.hireDate || '',
    毕业院校: row.graduateSchool || '',
    状态: row.status === 1 ? '在岗' : '离职'
  }))
  exportToExcel(exportData, '教师数据')
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
        await createTeacher({
          teacherNo: item.工号 || '',
          teacherId: item.教工号 || '',
          name: item.姓名,
          gender: item.性别 === '男' ? '男' : '女',
          phone: item.手机号 || '',
          email: item.邮箱 || '',
          position: item.岗位 || '',
          title: item.职称 || '',
          education: item.学历 || '',
          degree: item.学位 || '',
          graduateSchool: item.毕业院校 || '',
          status: item.状态 === '在岗' ? 1 : 0
        })
        successCount++
      } catch (e) {
        console.error('导入教师失败:', e)
      }
    }

    ElMessage.success(`成功导入 ${successCount} 条数据`)
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败')
  }
}
</script>

<style scoped>
.teacher-management { padding: 20px; }
.toolbar { margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; }

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

@media (min-width: 1920px) {
  .action-buttons .el-button {
    padding: 6px 12px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .teacher-management { padding: 12px; }
  .toolbar { gap: 8px; }

  :deep(.el-dialog) { width: 90% !important; margin: 10px !important; }

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

  :deep(.el-table) { font-size: 12px; }

  .action-buttons { gap: 2px; }
  .action-buttons .el-button { padding: 2px 4px; font-size: 11px; }
}

.mobile-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-card { border-radius: 8px; }

.mobile-card-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.mobile-card-item:last-child { border-bottom: none; }

.mobile-card-label { color: #909399; font-size: 13px; }
.mobile-card-value { color: #303133; font-size: 14px; font-weight: 500; }

.mobile-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.skeleton-container { padding: 10px 0; }
.skeleton-container .mobile-card { margin-bottom: 12px; }
</style>
