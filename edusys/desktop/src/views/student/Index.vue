<template>
  <div class="student-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增学生</el-button>
      <el-button @click="loadData">刷新</el-button>
      <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
      <el-button type="success" :disabled="selectedRows.length === 0" @click="handleBatchStatus(1)">批量在读</el-button>
      <el-button type="warning" :disabled="selectedRows.length === 0" @click="handleBatchStatus(0)">批量离校</el-button>
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
        placeholder="搜索学号/姓名/手机号"
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
      <el-table-column prop="studentNo" label="学籍辅号" :width="columnWidth" />
      <el-table-column prop="studentId" label="学籍号" :width="columnWidth" />
      <el-table-column prop="name" label="姓名" :width="columnWidth" />
      <el-table-column prop="class.className" label="班级" :width="columnWidth" />
      <el-table-column prop="seatNo" label="座号" width="50" />
      <el-table-column prop="gender" label="性别" width="50">
        <template #default="{ row }">
          {{ row.gender === '1' || row.gender === '男' ? '男' : '女' }}
        </template>
      </el-table-column>
      <el-table-column prop="schoolType" label="类型" :width="columnWidth" />
      <el-table-column prop="source" label="来源" :width="columnWidth" />
      <el-table-column prop="subjectType" label="科类" :width="columnWidth" />
      <el-table-column prop="status" label="状态" width="60">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '在读' : '离校' }}</el-tag>
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
          <span class="mobile-card-label">学籍辅号</span>
          <span class="mobile-card-value">{{ row.studentNo || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">姓名</span>
          <span class="mobile-card-value">{{ row.name }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">班级</span>
          <span class="mobile-card-value">{{ row.class?.className || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">座号</span>
          <span class="mobile-card-value">{{ row.seatNo || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">性别</span>
          <span class="mobile-card-value">{{ row.gender === '1' || row.gender === '男' ? '男' : '女' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">类型</span>
          <span class="mobile-card-value">{{ row.schoolType || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">状态</span>
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '在读' : '离校' }}</el-tag>
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
    <el-empty v-if="!loading && tableData.length === 0" description="暂无学生数据">
      <el-button type="primary" @click="handleAdd">新增学生</el-button>
    </el-empty>

    <el-pagination
      v-if="tableData.length > 0"
      v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
      :total="pagination.total" :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper" @change="loadData"
      style="margin-top: 20px; justify-content: flex-end"
    />

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑学生' : '新增学生'" width="700px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学籍辅号" prop="studentNo"><el-input v-model="form.studentNo" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学籍号" prop="studentId"><el-input v-model="form.studentId" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard"><el-input v-model="form.idCard" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name"><el-input v-model="form.name" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级" prop="classId">
              <el-select v-model="form.classId" placeholder="请选择班级" style="width: 100%">
                <el-option v-for="c in classList" :key="c.id" :label="c.className" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="座号" prop="seatNo"><el-input-number v-model="form.seatNo" :min="1" :max="100" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthDate">
              <el-date-picker v-model="form.birthDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="类型" prop="schoolType">
              <el-select v-model="form.schoolType" placeholder="请选择类型" style="width: 100%">
                <el-option label="一中" value="一中" />
                <el-option label="寄读" value="寄读" />
                <el-option label="教师子女" value="教师子女" />
                <el-option label="转入" value="转入" />
                <el-option label="转出" value="转出" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="来源" prop="source">
              <el-input v-model="form.source" placeholder="如：国际班" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="科类" prop="subjectType">
              <el-select v-model="form.subjectType" placeholder="请选择" style="width: 100%">
                <el-option label="物理类" value="物理类" />
                <el-option label="历史类" value="历史类" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选课" prop="subjects">
              <el-input v-model="form.subjects" placeholder="如：物化生" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone"><el-input v-model="form.phone" /></el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="地址" prop="address"><el-input v-model="form.address" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="在读" inactive-text="离校" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getStudentList, createStudent, updateStudent, deleteStudent, getClassList, updateStudentStatus } from '@/api/student'
import { exportToExcel, importFromExcel } from '@/utils/excel'

const loading = ref(false)
const isMobile = ref(window.innerWidth < 768)
const tableData = ref<any[]>([])
const classList = ref<any[]>([])
const searchKeyword = ref('')
const selectedRows = ref<any[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const tableRef = ref()
const columnWidth = ref(100)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const editId = ref(0)

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  calculateColumnWidth()
}

const calculateColumnWidth = async () => {
  await nextTick()
  if (!tableRef.value) return
  const tableWidth = tableRef.value?.$el?.clientWidth || window.innerWidth - 40
  // 减去固定列宽度: selection(50) + seatNo(50) + gender(50) + status(60) + 操作(120) = 330
  const fixedWidth = 330
  // 剩余11列平均分配
  const availableWidth = Math.max(tableWidth - fixedWidth, 200)
  columnWidth.value = Math.floor(availableWidth / 11)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadData()
  loadClasses()
  calculateColumnWidth()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const form = reactive({
  studentNo: '', studentId: '', idCard: '', name: '',
  classId: undefined as number | undefined, seatNo: undefined as number | undefined,
  gender: '男', birthDate: '', subjects: '', schoolType: '', source: '',
  subjectType: '', phone: '', address: '', status: 1
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getStudentList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value
    })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  }
  catch (error) { console.error('加载失败', error) }
  finally { loading.value = false }
}

const loadClasses = async () => { try { const res = await getClassList({ page: 1, pageSize: 100 }); classList.value = res.list || [] } catch (error) { console.error('加载班级失败', error) } }

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
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个学生吗？`, '批量删除', { type: 'warning' })
    for (const row of selectedRows.value) {
      await deleteStudent(row.id)
    }
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '删除失败')
  }
}

const handleBatchStatus = async (status: number) => {
  if (selectedRows.value.length === 0) return
  const text = status === 1 ? '在读' : '离校'
  try {
    await ElMessageBox.confirm(`确定要将选中的 ${selectedRows.value.length} 个学生设为${text}吗？`, `批量${text}`, { type: 'warning' })
    for (const row of selectedRows.value) {
      await updateStudentStatus(row.id, status)
    }
    ElMessage.success(`批量设置为${text}成功`)
    selectedRows.value = []
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '操作失败')
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.studentNo = ''; form.studentId = ''; form.idCard = ''; form.name = ''
  form.classId = undefined; form.seatNo = undefined; form.gender = '男'; form.birthDate = ''
  form.subjects = ''; form.schoolType = ''; form.source = ''; form.subjectType = ''
  form.phone = ''; form.address = ''; form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    studentNo: row.studentNo || '',
    studentId: row.studentId || '',
    idCard: row.idCard || '',
    name: row.name || '',
    classId: row.classId,
    seatNo: row.seatNo,
    gender: row.gender === '男' ? '男' : (row.gender === '女' ? '女' : row.gender),
    birthDate: row.birthDate || '',
    subjects: row.subjects || '',
    schoolType: row.schoolType || '',
    source: row.source || '',
    subjectType: row.subjectType || '',
    phone: row.phone || '',
    address: row.address || '',
    status: row.status
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try { if (isEdit.value) { await updateStudent(editId.value, form); ElMessage.success('更新成功') } else { await createStudent(form); ElMessage.success('创建成功') }; dialogVisible.value = false; loadData() }
      catch (error: any) { ElMessage.error(error.message || '保存失败') }
      finally { loading.value = false }
    }
  })
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除学生 "${row.name}" 吗？\n\n注意：该操作将同时删除该学生的所有成绩记录。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    await deleteStudent(row.id)
    ElMessage.success('删除成功')
    loadData()
  }
  catch (error: any) { if (error !== 'cancel') ElMessage.error(error.message || '删除失败') }
}

const handleExport = () => {
  const exportData = tableData.value.map(row => ({
    学籍辅号: row.studentNo,
    学籍号: row.studentId,
    姓名: row.name,
    班级: row.class?.className || '',
    座号: row.seatNo,
    性别: row.gender === '1' || row.gender === '男' ? '男' : '女',
    类型: row.schoolType || '',
    来源: row.source || '',
    科类: row.subjectType || '',
    状态: row.status === 1 ? '在读' : '离校'
  }))
  exportToExcel(exportData, '学生数据')
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
        await createStudent({
          studentNo: item.学籍辅号 || '',
          studentId: item.学籍号 || '',
          name: item.姓名,
          gender: item.性别 === '男' ? '男' : '女',
          schoolType: item.类型 || '',
          source: item.来源 || '',
          subjectType: item.科类 || '',
          classId: undefined,
          status: item.状态 === '在读' ? 1 : 0
        })
        successCount++
      } catch (e) {
        console.error('导入学生失败:', e)
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
.student-management { padding: 20px; }
.toolbar { margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; }

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
  .student-management { padding: 12px; }
  .toolbar { gap: 8px; }

  :deep(.el-dialog) { width: 90% !important; margin: 10px !important; }

  :deep(.el-pagination) {
    justify-content: center !important;
    padding: 8px 0 !important;
    flex-wrap: wrap;
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