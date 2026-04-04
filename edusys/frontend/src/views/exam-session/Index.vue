<template>
  <div class="exam-session-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增场次</el-button>
      <el-button type="success" @click="handleBatchAdd">批量创建</el-button>
      <el-button @click="loadData">刷新</el-button>
      <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
      <el-button @click="handleExport">导出</el-button>
      <el-select v-model="filterExamId" placeholder="选择考试" clearable style="width: 180px" @change="handleFilterChange">
        <el-option v-for="e in examList" :key="e.id" :label="e.examName" :value="e.id" />
      </el-select>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索场次名称"
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
      <el-table-column prop="sessionNo" label="场次号" width="80" />
      <el-table-column prop="sessionName" label="场次名称" />
      <el-table-column prop="exam" label="考试" width="150">
        <template #default="{ row }">
          {{ row.exam?.examName || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="subject" label="科目" width="100">
        <template #default="{ row }">
          {{ row.subject?.subjectName || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="examDate" label="考试日期" width="120" />
      <el-table-column prop="startTime" label="开始时间" width="100" />
      <el-table-column prop="endTime" label="结束时间" width="100" />
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
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 移动端卡片式列表 -->
    <div v-else-if="!loading && tableData.length > 0" class="mobile-card-list">
      <el-card v-for="row in tableData" :key="row.id" class="mobile-card">
        <div class="mobile-card-item">
          <span class="mobile-card-label">场次号</span>
          <span class="mobile-card-value">{{ row.sessionNo }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">场次名称</span>
          <span class="mobile-card-value">{{ row.sessionName }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">考试日期</span>
          <span class="mobile-card-value">{{ row.examDate || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">时间</span>
          <span class="mobile-card-value">{{ row.startTime || '' }} - {{ row.endTime || '' }}</span>
        </div>
        <div class="mobile-card-actions">
          <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && tableData.length === 0" description="暂无场次数据">
      <el-button type="primary" @click="handleAdd">新增场次</el-button>
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
        <el-form-item label="考试" prop="examId">
          <el-select v-model="formData.examId" placeholder="选择考试">
            <el-option v-for="e in examList" :key="e.id" :label="e.examName" :value="e.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="场次号" prop="sessionNo">
          <el-input-number v-model="formData.sessionNo" :min="1" />
        </el-form-item>
        <el-form-item label="场次名称" prop="sessionName">
          <el-input v-model="formData.sessionName" placeholder="如: 第1场 语文" />
        </el-form-item>
        <el-form-item label="科目" prop="subjectId">
          <el-select v-model="formData.subjectId" placeholder="选择科目" clearable>
            <el-option v-for="s in subjectList" :key="s.id" :label="s.subjectName" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试日期" prop="examDate">
          <el-date-picker v-model="formData.examDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker v-model="formData.startTime" placeholder="选择时间" value-format="HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker v-model="formData.endTime" placeholder="选择时间" value-format="HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量创建弹窗 -->
    <el-dialog v-model="batchDialogVisible" title="批量创建场次" width="600px">
      <el-alert type="info" :closible="false" style="margin-bottom: 15px">
        选择考试后，系统将根据科目自动创建对应场次
      </el-alert>
      <el-form ref="batchFormRef" :model="batchFormData" :rules="batchFormRules" label-width="100px">
        <el-form-item label="考试" prop="examId">
          <el-select v-model="batchFormData.examId" placeholder="选择考试">
            <el-option v-for="e in examList" :key="e.id" :label="e.examName" :value="e.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="起始场次" prop="startSessionNo">
          <el-input-number v-model="batchFormData.startSessionNo" :min="1" />
        </el-form-item>
        <el-form-item label="默认名称">
          <el-input v-model="batchFormData.defaultName" placeholder="如: 第{no}场 {subject}" />
        </el-form-item>
        <el-form-item label="包含科目">
          <el-checkbox-group v-model="batchFormData.includeSubjects">
            <el-checkbox v-for="s in subjectList" :key="s.id" :value="s.id">{{ s.subjectName }}</el-checkbox>
          </el-checkbox-group>
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
import { getExamSessionList, createExamSession, updateExamSession, deleteExamSession, batchCreateExamSession } from '@/api/exam-session'
import { getExamList } from '@/api/exam'
import { getSubjectList } from '@/api/subject'
import { exportToExcel } from '@/utils/excel'

const loading = ref(false)
const isMobile = ref(window.innerWidth < 768)
const tableData = ref<any[]>([])
const examList = ref<any[]>([])
const subjectList = ref<any[]>([])
const searchKeyword = ref('')
const filterExamId = ref<number | null>(null)
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})
const selectedRows = ref<any[]>([])

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增场次')
const formRef = ref()
const submitLoading = ref(false)
const formData = reactive({
  id: 0,
  examId: 0,
  sessionNo: 1,
  sessionName: '',
  subjectId: undefined as number | undefined,
  examDate: '',
  startTime: '',
  endTime: '',
  remark: '',
  status: 1
})
const formRules = {
  examId: [{ required: true, message: '请选择考试', trigger: 'change' }],
  sessionNo: [{ required: true, message: '请输入场次号', trigger: 'blur' }],
  sessionName: [{ required: true, message: '请输入场次名称', trigger: 'blur' }]
}

// 批量创建
const batchDialogVisible = ref(false)
const batchFormRef = ref()
const batchLoading = ref(false)
const batchFormData = reactive({
  examId: 0,
  startSessionNo: 1,
  defaultName: '第{no}场 {subject}',
  includeSubjects: [] as number[]
})
const batchFormRules = {
  examId: [{ required: true, message: '请选择考试', trigger: 'change' }]
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadExams()
  loadSubjects()
  loadData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const loadExams = async () => {
  try {
    const res = await getExamList({ pageSize: 100 })
    examList.value = res.list || []
    if (examList.value.length > 0) {
      filterExamId.value = examList.value[0].id
    }
  } catch (error) {
    console.error('加载考试失败', error)
  }
}

const loadSubjects = async () => {
  try {
    const res = await getSubjectList({ pageSize: 100 })
    subjectList.value = res.list || []
  } catch (error) {
    console.error('加载科目失败', error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getExamSessionList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      examId: filterExamId.value,
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
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个场次吗？`, '批量删除', { type: 'warning' })
    for (const row of selectedRows.value) {
      await deleteExamSession(row.id)
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
    场次号: row.sessionNo,
    场次名称: row.sessionName,
    考试: row.exam?.examName,
    科目: row.subject?.subjectName,
    考试日期: row.examDate,
    开始时间: row.startTime,
    结束时间: row.endTime,
    备注: row.remark,
    状态: row.status === 1 ? '启用' : '禁用'
  }))
  exportToExcel(exportData, '考试场次')
}

const handleAdd = () => {
  formData.id = 0
  formData.examId = examList.value[0]?.id || 0
  formData.sessionNo = 1
  formData.sessionName = ''
  formData.subjectId = undefined
  formData.examDate = ''
  formData.startTime = ''
  formData.endTime = ''
  formData.remark = ''
  formData.status = 1
  dialogTitle.value = '新增场次'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  formData.id = row.id
  formData.examId = row.examId
  formData.sessionNo = row.sessionNo
  formData.sessionName = row.sessionName
  formData.subjectId = row.subjectId
  formData.examDate = row.examDate
  formData.startTime = row.startTime
  formData.endTime = row.endTime
  formData.remark = row.remark || ''
  formData.status = row.status
  dialogTitle.value = '编辑场次'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (formData.id) {
      await updateExamSession(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      await createExamSession(formData)
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
  batchFormData.examId = examList.value[0]?.id || 0
  batchFormData.startSessionNo = 1
  batchFormData.defaultName = '第{no}场 {subject}'
  batchFormData.includeSubjects = subjectList.value.slice(0, 7).map(s => s.id)
  batchDialogVisible.value = true
}

const handleBatchSubmit = async () => {
  await batchFormRef.value?.validate()
  batchLoading.value = true

  const sessions = []
  let no = batchFormData.startSessionNo

  // 获取选中的科目
  const selectedSubjects = subjectList.value.filter(s =>
    batchFormData.includeSubjects.includes(s.id)
  )

  for (const subject of selectedSubjects) {
    let name = batchFormData.defaultName
      .replace('{no}', String(no))
      .replace('{subject}', subject.subjectName)

    sessions.push({
      sessionNo: no,
      sessionName: name,
      subjectId: subject.id,
      examDate: '',
      startTime: '',
      endTime: '',
      status: 1
    })
    no++
  }

  // 检查是否有冲突的场次号
  const conflicts: number[] = []
  for (const s of sessions) {
    const exists = tableData.value.find(t =>
      t.examId === batchFormData.examId && t.sessionNo === s.sessionNo
    )
    if (exists) {
      conflicts.push(s.sessionNo)
    }
  }

  if (conflicts.length > 0) {
    ElMessage.warning(`场次号 ${conflicts.join(', ')} 已存在`)
    batchLoading.value = false
    return
  }

  try {
    await batchCreateExamSession({
      examId: batchFormData.examId,
      sessions
    })
    ElMessage.success(`创建成功 ${sessions.length} 个场次`)
    batchDialogVisible.value = false
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '创建失败')
  } finally {
    batchLoading.value = false
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该场次吗？', '删除', { type: 'warning' })
    await deleteExamSession(row.id)
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