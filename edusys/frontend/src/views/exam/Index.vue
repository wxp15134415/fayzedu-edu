<template>
  <div class="exam-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增考试</el-button>
      <el-button @click="loadData">刷新</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe :header-cell-style="{background: '#f5f7fa'}">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="examName" label="考试名称" min-width="180" />
      <el-table-column prop="schoolYear" label="学年" width="120" />
      <el-table-column prop="semester" label="学期" width="100" />
      <el-table-column prop="examType" label="考试类型" width="100" />
      <el-table-column prop="examDate" label="考试日期" width="120" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
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

    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @change="loadData"
      style="margin-top: 20px; justify-content: flex-end"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑考试' : '新增考试'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="考试名称" prop="examName">
          <el-input v-model="form.examName" placeholder="如：高三下月考7" />
        </el-form-item>
        <el-form-item label="学年" prop="schoolYear">
          <el-select v-model="form.schoolYear" style="width: 100%">
            <el-option label="2025-2026" value="2025-2026" />
            <el-option label="2026-2027" value="2026-2027" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-select v-model="form.semester" style="width: 100%">
            <el-option label="第一学期" value="第一学期" />
            <el-option label="第二学期" value="第二学期" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试类型" prop="examType">
          <el-select v-model="form.examType" style="width: 100%">
            <el-option label="月考" value="月考" />
            <el-option label="半期考" value="半期考" />
            <el-option label="期末考" value="期末考" />
          </el-select>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getExamList, createExam, updateExam, deleteExam } from '@/api/exam'

const loading = ref(false)
const tableData = ref<any[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const editId = ref(0)

const form = reactive({
  examName: '',
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

const handleAdd = () => {
  isEdit.value = false
  form.examName = ''
  form.schoolYear = '2025-2026'
  form.semester = '第一学期'
  form.examType = '月考'
  form.examDate = ''
  form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  editId.value = row.id
  form.examName = row.examName
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
        if (isEdit.value) {
          await updateExam(editId.value, form)
          ElMessage.success('更新成功')
        } else {
          await createExam(form)
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
})
</script>

<style scoped>
.exam-management { padding: 20px; }
.toolbar { margin-bottom: 20px; display: flex; gap: 10px; }

.action-buttons {
  display: flex;
  gap: 4px;
}
</style>