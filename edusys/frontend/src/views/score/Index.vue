<template>
  <div class="score-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">录入成绩</el-button>
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
        placeholder="搜索学生/学号/科目"
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
    <el-table v-if="!isMobile" :data="tableData" v-loading="loading" stripe :header-cell-style="{background: '#f5f7fa'}" @selection-change="handleSelectionChange" fit>
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="student.name" label="学生" width="80" />
      <el-table-column prop="student.studentNo" label="学号" width="100" />
      <el-table-column prop="subject.subjectName" label="科目" width="80" />
      <el-table-column prop="score" label="成绩" width="60" />
      <el-table-column prop="semester" label="学期" width="70">
        <template #default="{ row }">{{ row.semester }}学期</template>
      </el-table-column>
      <el-table-column prop="schoolYear" label="学年" width="90" />
      <el-table-column label="操作" width="150" fixed="right">
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
          <span class="mobile-card-label">学生</span>
          <span class="mobile-card-value">{{ row.student?.name || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">学号</span>
          <span class="mobile-card-value">{{ row.student?.studentNo || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">科目</span>
          <span class="mobile-card-value">{{ row.subject?.subjectName || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">成绩</span>
          <span class="mobile-card-value">{{ row.score }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">学期</span>
          <span class="mobile-card-value">{{ row.semester }}学期</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">学年</span>
          <span class="mobile-card-value">{{ row.schoolYear }}</span>
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
    <el-empty v-if="!loading && tableData.length === 0" description="暂无成绩数据">
      <el-button type="primary" @click="handleAdd">录入成绩</el-button>
    </el-empty>

    <el-pagination v-if="tableData.length > 0" v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @change="loadData" style="margin-top: 20px; justify-content: flex-end" />

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑成绩' : '录入成绩'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="学生" prop="studentId">
          <el-select v-model="form.studentId" filterable placeholder="请选择学生">
            <el-option v-for="s in studentList" :key="s.id" :label="s.name + ' (' + s.studentNo + ')'" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="科目" prop="subjectId">
          <el-select v-model="form.subjectId" placeholder="请选择科目">
            <el-option v-for="s in subjectList" :key="s.id" :label="s.subjectName" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="成绩" prop="score"><el-input-number v-model="form.score" :min="0" :max="100" /></el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-select v-model="form.semester">
            <el-option label="第一学期" :value="1" />
            <el-option label="第二学期" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="学年" prop="schoolYear"><el-input-number v-model="form.schoolYear" :min="2020" :max="2030" /></el-form-item>
        <el-form-item label="备注" prop="remark"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getScoreList, createScore, updateScore, deleteScore } from '@/api/score'
import { getStudentList } from '@/api/student'
import { getSubjectList } from '@/api/score'
import { exportToExcel, importFromExcel } from '@/utils/excel'

const loading = ref(false)
const isMobile = ref(window.innerWidth < 768)
const tableData = ref<any[]>([])
const studentList = ref<any[]>([])
const subjectList = ref<any[]>([])
const searchKeyword = ref('')
const selectedRows = ref<any[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const editId = ref(0)

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadData()
  loadStudents()
  loadSubjects()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const form = reactive({ studentId: undefined as number | undefined, subjectId: undefined as number | undefined, score: 0, semester: 1, schoolYear: new Date().getFullYear(), remark: '' })

const rules: FormRules = {
  studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
  subjectId: [{ required: true, message: '请选择科目', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getScoreList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value
    })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) { console.error('加载失败', error) }
  finally { loading.value = false }
}

const loadStudents = async () => { try { const res = await getStudentList({ page: 1, pageSize: 100 }); studentList.value = res.list || [] } catch (error) { console.error('加载学生失败', error) } }
const loadSubjects = async () => { try { const res = await getSubjectList({ page: 1, pageSize: 100 }); subjectList.value = res.list || [] } catch (error) { console.error('加载科目失败', error) } }

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
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条成绩记录吗？`, '批量删除', { type: 'warning' })
    for (const row of selectedRows.value) {
      await deleteScore(row.id)
    }
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '删除失败')
  }
}

const handleAdd = () => { isEdit.value = false; form.studentId = undefined; form.subjectId = undefined; form.score = 0; form.semester = 1; form.schoolYear = new Date().getFullYear(); form.remark = ''; dialogVisible.value = true }
const handleEdit = (row: any) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, { ...row, score: row.score ? Number(row.score) : 0, studentId: row.studentId ? Number(row.studentId) : undefined, subjectId: row.subjectId ? Number(row.subjectId) : undefined })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try { if (isEdit.value) { await updateScore(editId.value, form); ElMessage.success('更新成功') } else { await createScore(form); ElMessage.success('创建成功') }; dialogVisible.value = false; loadData() }
      catch (error: any) { ElMessage.error(error.message || '保存失败') }
      finally { loading.value = false }
    }
  })
}

const handleDelete = async (row: any) => { try { await ElMessageBox.confirm('确定要删除该成绩吗？', '提示', { type: 'warning' }); await deleteScore(row.id); ElMessage.success('删除成功'); loadData() } catch (error: any) { if (error !== 'cancel') ElMessage.error(error.message || '删除失败') } }

const handleExport = () => {
  const exportData = tableData.value.map(row => ({
    学生: row.student?.name || '',
    学号: row.student?.studentNo || '',
    科目: row.subject?.subjectName || '',
    成绩: row.score,
    学期: row.semester + '学期',
    学年: row.schoolYear,
    备注: row.remark || ''
  }))
  exportToExcel(exportData, '成绩数据')
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
        // 查找匹配的学生和科目
        const student = studentList.value.find(s => s.name === item.学生 || s.studentNo === item.学号)
        const subject = subjectList.value.find(s => s.subjectName === item.科目)
        if (!student || !subject) {
          console.warn('找不到学生或科目:', item)
          continue
        }

        await createScore({
          studentId: student.id,
          subjectId: subject.id,
          score: Number(item.成绩) || 0,
          semester: Number(item.学期?.replace('学期', '')) || 1,
          schoolYear: Number(item.学年) || new Date().getFullYear(),
          remark: item.备注 || ''
        })
        successCount++
      } catch (e) {
        console.error('导入成绩失败:', e)
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
.score-management { padding: 20px; }
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
  .score-management { padding: 12px; }
  .toolbar { gap: 8px; }

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