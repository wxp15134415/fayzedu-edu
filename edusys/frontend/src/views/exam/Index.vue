<template>
  <div class="exam-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增考试</el-button>
      <el-button @click="loadData">刷新</el-button>
    </div>

    <!-- 桌面端表格 -->
    <el-table :data="tableData" v-loading="loading" stripe :header-cell-style="{background: '#f5f7fa'}" v-if="!isMobile" fit>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="examName" label="考试名称" min-width="180" />
      <el-table-column prop="gradeName" label="所属年级" width="100" />
      <el-table-column prop="schoolYear" label="学年" width="120" />
      <el-table-column prop="semester" label="学期" width="100" />
      <el-table-column prop="examType" label="考试类型" width="100" />
      <el-table-column prop="examDate" label="考试日期" width="120" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ formatStatus(row.status, ['禁用', '启用']) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 移动端卡片 -->
    <div class="mobile-cards" v-if="isMobile && tableData.length > 0">
      <div class="exam-card" v-for="row in tableData" :key="row.id">
        <div class="exam-card-header">
          <span class="exam-card-title">{{ row.examName }}</span>
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ formatStatus(row.status, ['禁用', '启用']) }}
          </el-tag>
        </div>
        <div class="exam-card-info">
          <div class="exam-card-info-item">
            <span class="exam-card-info-label">年级:</span>
            <span>{{ row.gradeName || '-' }}</span>
          </div>
          <div class="exam-card-info-item">
            <span class="exam-card-info-label">学年:</span>
            <span>{{ row.schoolYear || '-' }}</span>
          </div>
          <div class="exam-card-info-item">
            <span class="exam-card-info-label">学期:</span>
            <span>{{ row.semester || '-' }}</span>
          </div>
          <div class="exam-card-info-item">
            <span class="exam-card-info-label">类型:</span>
            <span>{{ row.examType || '-' }}</span>
          </div>
          <div class="exam-card-info-item">
            <span class="exam-card-info-label">日期:</span>
            <span>{{ row.examDate || '-' }}</span>
          </div>
        </div>
        <div class="exam-card-actions">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <el-empty v-if="!loading && tableData.length === 0" description="暂无考试数据" />

    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="isMobile ? [5, 10, 20] : [10, 20, 50, 100]"
      :layout="isMobile ? 'total, prev, next' : 'total, sizes, prev, pager, next, jumper'"
      @change="loadData"
      style="margin-top: 20px"
      :class="{ 'mobile-pagination': isMobile }"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑考试' : '新增考试'" :width="isMobile ? '90%' : '500px'" :fullscreen="isMobile">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" :label-position="isMobile ? 'top' : 'right'">
        <el-form-item label="所属年级" prop="gradeId">
          <el-select v-model="form.gradeId" style="width: 100%" clearable placeholder="请选择年级" @change="handleGradeChange">
            <el-option v-for="g in gradeOptions" :key="g.id" :label="g.gradeName" :value="g.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="学年" prop="schoolYear">
          <el-select v-model="form.schoolYear" style="width: 100%" @change="handleGradeChange">
            <el-option label="2025-2026" value="2025-2026" />
            <el-option label="2026-2027" value="2026-2027" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-select v-model="form.semester" style="width: 100%" @change="handleGradeChange">
            <el-option label="第一学期" value="第一学期" />
            <el-option label="第二学期" value="第二学期" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试类型" prop="examType">
          <el-select v-model="form.examType" style="width: 100%" @change="handleGradeChange">
            <el-option label="月考" value="月考" />
            <el-option label="半期考" value="半期考" />
            <el-option label="期末考" value="期末考" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试名称" prop="examName">
          <el-input v-model="form.examName" placeholder="自动生成，也可手动修改" />
        </el-form-item>
        <el-form-item label="考试日期" prop="examDate">
          <el-date-picker v-model="form.examDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getExamList, createExam, updateExam, deleteExam } from '@/api/exam'
import { getGradeList } from '@/api/grade'
import { getSubjectList } from '@/api/subject'
import { batchCreateExamSession, updateExamSessionsByExam } from '@/api/exam-session'
import { formatStatus } from '@/utils/excel'

const loading = ref(false)
const tableData = ref<any[]>([])
const gradeOptions = ref<any[]>([])
const subjectOptions = ref<any[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const editId = ref(0)

// 移动端检测
const isMobile = ref(window.innerWidth < 769)
const handleResize = () => {
  isMobile.value = window.innerWidth < 769
}

const form = reactive({
  examName: '',
  gradeId: undefined as number | undefined,
  schoolYear: '2025-2026',
  semester: '第一学期',
  examType: '月考',
  examDate: '',
  status: 1
})

const rules: FormRules = {
  examName: [{ required: true, message: '请输入考试名称', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getExamList({ page: pagination.page, pageSize: pagination.pageSize })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('加载失败', error)
  } finally {
    loading.value = false
  }
}

const loadGrades = async () => {
  try {
    const res = await getGradeList({ pageSize: 100 })
    gradeOptions.value = res.list || []
  } catch (error) {
    console.error('加载年级失败', error)
  }
}

const loadSubjects = async () => {
  try {
    const res = await getSubjectList({ pageSize: 100 })
    // 按科目ID排序
    subjectOptions.value = (res.list || []).sort((a: any, b: any) => a.id - b.id)
  } catch (error) {
    console.error('加载科目失败', error)
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.examName = ''
  form.gradeId = undefined
  form.schoolYear = '2025-2026'
  form.semester = '第一学期'
  form.examType = '月考'
  form.examDate = new Date().toISOString().split('T')[0]
  form.status = 1
  dialogVisible.value = true
}

// 自动生成考试名称
const handleGradeChange = () => {
  if (isEdit.value) return

  const grade = gradeOptions.value.find((g: any) => g.id === form.gradeId)
  if (!grade || !form.schoolYear || !form.semester || !form.examType) {
    form.examName = ''
    return
  }

  // 生成考试名称：2025-2026学年第二学期高一月考
  const gradeName = grade.gradeName || ''
  form.examName = `${form.schoolYear}学年${form.semester}${gradeName}${form.examType}`
}

const handleEdit = (row: any) => {
  isEdit.value = true
  editId.value = row.id
  form.examName = row.examName
  form.gradeId = row.gradeId
  form.schoolYear = row.schoolYear || '2025-2026'
  form.semester = row.semester || '第一学期'
  form.examType = row.examType || '月考'
  form.examDate = row.examDate || ''
  form.status = row.status
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 处理空日期，转为null
        const submitData = {
          ...form,
          examDate: form.examDate || null
        }

        if (isEdit.value) {
          await updateExam(editId.value, submitData)
          // 编辑时同步更新考试场次
          if (subjectOptions.value.length > 0) {
            await updateExamSessionsByExam(editId.value, subjectOptions.value)
          }
          ElMessage.success('更新成功')
        } else {
          // 先创建考试
          const res = await createExam(submitData)
          const examId = res?.id || res?.list?.[0]?.id

          // 批量创建考试场次（按科目ID排序，只包含前9个科目：语数英物化生政史地）
          if (examId && subjectOptions.value.length > 0) {
            const filteredSubjects = subjectOptions.value.slice(0, 9)
            const sessions = filteredSubjects.map((subject: any, index: number) => ({
              sessionNo: index + 1,
              sessionName: `第${index + 1}场 ${subject.subjectName}`,
              subjectId: subject.id,
              status: 1
            }))
            await batchCreateExamSession({ examId, sessions })
          }

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
      `确定要删除考试 "${row.examName}" 吗？`,
      '删除确认',
      { type: 'warning' }
    )
    await deleteExam(row.id)
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
  loadGrades()
  loadSubjects()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.exam-management { padding: 20px; }
.toolbar { margin-bottom: 20px; display: flex; gap: 10px; }

.action-buttons {
  display: flex;
  gap: 4px;
}

/* 移动端响应式 */
@media (max-width: 769px) {
  .exam-management { padding: 12px; }

  .toolbar {
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .toolbar .el-button {
    flex: 1;
    min-width: calc(50% - 4px);
  }

  /* 移动端卡片列表 */
  .mobile-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .exam-card {
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }

  .exam-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .exam-card-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }

  .exam-card-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    font-size: 12px;
    color: #606266;
  }

  .exam-card-info-item {
    display: flex;
    gap: 4px;
  }

  .exam-card-info-label {
    color: #909399;
  }

  .exam-card-actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #f0f0f0;
  }

  .exam-card-actions .el-button {
    flex: 1;
  }

  /* 移动端分页 */
  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center !important;
    gap: 8px;
  }

  :deep(.el-pagination__total) {
    width: 100%;
    text-align: center;
  }

  :deep(.el-pagination__sizes) {
    width: 100%;
    justify-content: center;
  }

  :deep(.el-pagination__jump) {
    display: none;
  }

  /* 隐藏桌面端表格 */
  :deep(.el-table) {
    display: none;
  }
}

/* 桌面端 */
@media (min-width: 769px) {
  .mobile-cards {
    display: none;
  }
}
</style>