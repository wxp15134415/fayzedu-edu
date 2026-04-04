<template>
  <div class="score-import">
    <div class="toolbar">
      <el-button type="primary" @click="handleImport" :loading="uploading">
        上传Excel文件
      </el-button>
      <el-button @click="loadExamList" :icon="Refresh">刷新</el-button>
      <el-select v-model="selectedExamId" placeholder="选择考试" style="width: 200px; margin-left: 10px">
        <el-option v-for="exam in examList" :key="exam.id" :label="exam.examName" :value="exam.id" />
      </el-select>
    </div>

    <!-- 步骤条 -->
    <el-steps :active="step" finish-status="success" simple style="margin: 20px 0">
      <el-step title="上传文件" />
      <el-step title="解析数据" />
      <el-step title="匹配学生" />
      <el-step title="确认导入" />
    </el-steps>

    <!-- 步骤1: 上传文件 -->
    <div v-if="step === 0" class="upload-section">
      <el-upload
        class="upload-demo"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        accept=".xlsx,.xls"
        :limit="1"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 .xlsx 和 .xls 格式的Excel文件
          </div>
        </template>
      </el-upload>
    </div>

    <!-- 步骤2: 解析数据 -->
    <div v-if="step === 1" class="parse-section">
      <el-alert v-if="parseResult" :title="parseResult.message" :type="parseResult.success ? 'success' : 'error'" style="margin-bottom: 20px" />

      <el-descriptions v-if="parseResult && parseResult.success" title="解析结果" :column="2" border>
        <el-descriptions-item label="考试名称">{{ parseResult.data?.exam_info?.exam_name }}</el-descriptions-item>
        <el-descriptions-item label="数据来源">{{ parseResult.data?.exam_info?.system }}</el-descriptions-item>
        <el-descriptions-item label="学生人数">{{ parseResult.data?.students?.length }}</el-descriptions-item>
        <el-descriptions-item label="考试科目">{{ parseResult.data?.exam_info?.subjects?.join(', ') }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 步骤3: 匹配学生 -->
    <div v-if="step === 2" class="match-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card header="已匹配">
            <template #header>
              <div class="card-header">
                <span>已匹配 ({{ matchedStudents.length }})</span>
                <el-button type="success" size="small" @click="selectMatched">批量选择</el-button>
              </div>
            </template>
            <el-table :data="matchedStudents" size="small" max-height="400">
              <el-table-column prop="name" label="姓名" width="80" />
              <el-table-column prop="student_no" label="考号" width="120" />
              <el-table-column prop="class_name" label="班级" width="80" />
              <el-table-column prop="match_method" label="匹配方式" width="100">
                <template #default="{ row }">
                  <el-tag size="small" type="success">{{ row.match_method }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="matched_student_id" label="学生ID" width="80" />
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card header="未匹配">
            <template #header>
              <div class="card-header">
                <span>未匹配 ({{ unmatchedStudents.length }})</span>
                <el-button type="warning" size="small" @click="selectUnmatched">手动匹配</el-button>
              </div>
            </template>
            <el-table :data="unmatchedStudents" size="small" max-height="400">
              <el-table-column prop="name" label="姓名" width="80" />
              <el-table-column prop="student_no" label="考号" width="120" />
              <el-table-column prop="student_id" label="学籍号" width="120" />
              <el-table-column prop="class_name" label="班级" width="80" />
              <el-table-column label="操作" width="80">
                <template #default="{ row }">
                  <el-button type="warning" size="small" link @click="openManualMatch(row)">匹配</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 步骤4: 确认导入 -->
    <div v-if="step === 3" class="confirm-section">
      <el-alert title="请确认导入数据" type="info" style="margin-bottom: 20px">
        <template #default>
          共 {{ matchedStudents.length }} 条数据将被导入，{{ unmatchedStudents.length }} 条未匹配
        </template>
      </el-alert>

      <el-descriptions title="导入信息" :column="2" border>
        <el-descriptions-item label="考试">{{ selectedExamName }}</el-descriptions-item>
        <el-descriptions-item label="导入批次">{{ importBatch }}</el-descriptions-item>
        <el-descriptions-item label="成功匹配">{{ matchedStudents.length }}</el-descriptions-item>
        <el-descriptions-item label="未匹配">{{ unmatchedStudents.length }}</el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 20px; text-align: center">
        <el-button type="primary" @click="handleConfirm" :loading="importing">确认导入</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </div>

    <!-- 手动匹配对话框 -->
    <el-dialog v-model="manualMatchVisible" title="手动匹配学生" width="500px">
      <div style="margin-bottom: 10px">
        当前未匹配学生: <strong>{{ currentUnmatched?.name }}</strong> ({{ currentUnmatched?.class_name }})
      </div>
      <el-input v-model="studentSearch" placeholder="搜索学生姓名/学号" clearable @input="searchStudent" />
      <el-table :data="studentOptions" height="300" style="margin-top: 10px" @row-click="selectStudent">
        <el-table-column prop="name" label="姓名" width="80" />
        <el-table-column prop="studentNo" label="考号" width="120" />
        <el-table-column prop="studentId" label="学籍号" width="120" />
        <el-table-column prop="className" label="班级" width="100" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, UploadFilled } from '@element-plus/icons-vue'
import { getStudentsForMatch, previewImport, confirmImport, cancelImport, manualMatch } from '@/api/score-import'
import { list as examListApi } from '@/api/exam'

// Python API 基础URL
const PYTHON_API = import.meta.env.VITE_PYTHON_API || 'http://localhost:8000/api/v1'

// 步骤
const step = ref(0)
const uploading = ref(false)
const importing = ref(false)

// 文件
const currentFile = ref<File | null>(null)
const parseResult = ref<any>(null)

// 考试
const examList = ref<any[]>([])
const selectedExamId = ref<number | null>(null)

// 学生匹配
const existingStudents = ref<any[]>([])
const matchedStudents = ref<any[]>([])
const unmatchedStudents = ref<any[]>([])
const importBatch = ref('')

// 手动匹配
const manualMatchVisible = ref(false)
const currentUnmatched = ref<any>(null)
const studentSearch = ref('')
const studentOptions = ref<any[]>([])

const selectedExamName = computed(() => {
  const exam = examList.value.find(e => e.id === selectedExamId.value)
  return exam?.examName || ''
})

// 加载考试列表
async function loadExamList() {
  try {
    const res = await examListApi({ page: 1, pageSize: 100 })
    examList.value = res.list || []
  } catch (e) {
    console.error('加载考试列表失败', e)
  }
}

// 上传文件
function handleImport() {
  if (!currentFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  uploading.value = true
  step.value = 1

  // 调用Python微服务解析
  const formData = new FormData()
  formData.append('file', currentFile.value)

  fetch(`${PYTHON_API}/parse`, {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      parseResult.value = data
      if (data.success) {
        step.value = 2
        // 自动匹配学生
        doMatch(data.data?.students || [])
      }
    })
    .catch(err => {
      ElMessage.error('解析失败: ' + err.message)
      parseResult.value = { success: false, message: err.message }
    })
    .finally(() => {
      uploading.value = false
    })
}

function handleFileChange(file: any) {
  currentFile.value = file.raw
}

// 执行学生匹配
async function doMatch(importStudents: any[]) {
  try {
    // 获取现有学生列表
    const res = await getStudentsForMatch()
    existingStudents.value = res || []

    // 调用Python微服务匹配
    const matchRes = await fetch(`${PYTHON_API}/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        existing_students: existingStudents.value,
        import_students: importStudents.map(s => ({
          row: s.row,
          student_no: s.student_no,
          student_id: s.student_id,
          name: s.name,
          class_name: s.class_name,
          scores: s.scores
        }))
      })
    }).then(res => res.json())

    if (matchRes.success) {
      matchedStudents.value = matchRes.matched || []
      unmatchedStudents.value = matchRes.unmatched || []
      // 生成导入批次号
      importBatch.value = `import_${Date.now()}`
    }
  } catch (e: any) {
    ElMessage.error('匹配失败: ' + e.message)
  }
}

// 确认导入
async function handleConfirm() {
  if (!selectedExamId.value) {
    ElMessage.warning('请选择考试')
    return
  }

  importing.value = true
  try {
    // 保存到临时表（这里简化处理，直接确认）
    const res = await confirmImport(importBatch.value)
    if (res.success) {
      ElMessage.success(res.message)
      step.value = 0
      resetForm()
    } else {
      ElMessage.error(res.message || '导入失败')
    }
  } catch (e: any) {
    ElMessage.error('导入失败: ' + e.message)
  } finally {
    importing.value = false
  }
}

// 取消导入
async function handleCancel() {
  try {
    await cancelImport(importBatch.value)
    ElMessage.info('已取消导入')
  } catch (e) {}
  step.value = 0
  resetForm()
}

function resetForm() {
  currentFile.value = null
  parseResult.value = null
  matchedStudents.value = []
  unmatchedStudents.value = []
  importBatch.value = ''
}

// 手动匹配
function openManualMatch(row: any) {
  currentUnmatched.value = row
  studentSearch.value = ''
  studentOptions.value = existingStudents.value
  manualMatchVisible.value = true
}

function searchStudent() {
  if (!studentSearch.value) {
    studentOptions.value = existingStudents.value
    return
  }
  const keyword = studentSearch.value.toLowerCase()
  studentOptions.value = existingStudents.value.filter(s =>
    s.name?.includes(keyword) ||
    s.studentNo?.includes(keyword) ||
    s.studentId?.includes(keyword)
  )
}

async function selectStudent(row: any) {
  if (!currentUnmatched.value) return

  try {
    await manualMatch(currentUnmatched.value.row, row.id, importBatch.value)
    // 从未匹配列表移到已匹配列表
    const index = unmatchedStudents.value.findIndex(s => s.row === currentUnmatched.value.row)
    if (index > -1) {
      const [item] = unmatchedStudents.value.splice(index, 1)
      item.matched_student_id = row.id
      item.match_method = '手动匹配'
      matchedStudents.value.push(item)
    }
    manualMatchVisible.value = false
    ElMessage.success('匹配成功')
  } catch (e: any) {
    ElMessage.error('匹配失败: ' + e.message)
  }
}

function selectMatched() {
  // 全选已匹配的（简化处理）
}

function selectUnmatched() {
  // 处理未匹配的
}

onMounted(() => {
  loadExamList()
  getStudentsForMatch().then(res => {
    existingStudents.value = res || []
  })
})
</script>

<style scoped>
.score-import {
  padding: 20px;
}
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.upload-section {
  display: flex;
  justify-content: center;
  padding: 40px;
}
.parse-section {
  padding: 20px;
}
.match-section {
  padding: 20px;
}
.confirm-section {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
