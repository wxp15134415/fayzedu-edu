<template>
  <div class="score-import-wizard">
    <div class="wizard-container">
      <!-- 侧边步骤条 -->
      <div class="wizard-sidebar">
        <div
          v-for="(s, i) in steps"
          :key="i"
          class="step-item"
          :class="{ active: step === i, done: step > i, clickable: canGoToStep(i) }"
          @click="canGoToStep(i) && (step = i)"
        >
          <div class="step-icon">
            <el-icon v-if="step > i"><Check /></el-icon>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <div class="step-info">
            <div class="step-title">{{ s.title }}</div>
            <div class="step-desc">{{ s.desc }}</div>
          </div>
        </div>
      </div>

      <!-- 步骤内容区域 -->
      <div class="wizard-content">
        <el-card class="step-card" shadow="hover">
          <!-- 步骤0: 选择考试 -->
          <div v-show="step === 0" class="step-exam">
            <div class="step-header">
              <el-icon :size="24" class="step-header-icon"><Calendar /></el-icon>
              <div>
                <h3>选择考试</h3>
                <p>请选择或创建要导入成绩的考试场次</p>
              </div>
            </div>
        <el-form label-width="100px">
          <el-form-item label="选择考试">
            <el-select v-model="selectedExamId" placeholder="请选择考试" filterable @change="handleExamChange">
              <el-option v-for="exam in examList" :key="exam.id" :label="exam.examName" :value="exam.id" />
            </el-select>
            <el-button style="margin-left: 10px" @click="showCreateExam = true">新建考试</el-button>
          </el-form-item>
          <el-form-item label="考试时间">
            <span>{{ selectedExam?.examDate || '-' }}</span>
          </el-form-item>
          <el-form-item label="所属年级">
            <span>{{ selectedExam?.gradeName || '-' }}</span>
          </el-form-item>
        </el-form>

            <!-- 新建考试对话框 -->
            <el-dialog v-model="showCreateExam" title="新建考试" width="500px" append-to-body>
              <el-form :model="newExam" label-width="80px">
                <el-form-item label="考试名称">
                  <el-input v-model="newExam.examName" placeholder="如：2024-2025学年第一学期期中考试" />
                </el-form-item>
                <el-form-item label="考试日期">
                  <el-date-picker v-model="newExam.examDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>
                <el-form-item label="所属年级">
                  <el-select v-model="newExam.gradeId" placeholder="请选择年级" style="width: 100%">
                    <el-option v-for="grade in gradeList" :key="grade.id" :label="grade.gradeName" :value="grade.id" />
                  </el-select>
                </el-form-item>
              </el-form>
              <template #footer>
                <el-button @click="showCreateExam = false">取消</el-button>
                <el-button type="primary" @click="handleCreateExam">创建</el-button>
              </template>
            </el-dialog>
          </div>

          <!-- 步骤1: 选择系统 -->
          <div v-show="step === 1" class="step-system">
            <div class="step-header">
              <el-icon :size="24" class="step-header-icon"><Monitor /></el-icon>
              <div>
                <h3>选择成绩系统</h3>
                <p>选择成绩数据来源的系统类型</p>
              </div>
            </div>
            <div class="system-grid">
              <div
                v-for="sys in systems"
                :key="sys.value"
                class="system-card"
                :class="{ selected: selectedSystem === sys.value }"
                @click="selectedSystem = sys.value"
              >
                <el-icon :size="32"><Monitor /></el-icon>
                <div class="system-name">{{ sys.label }}</div>
                <div class="system-desc">{{ sys.desc }}</div>
              </div>
            </div>
            <el-alert v-if="selectedSystem" type="info" :closable="false" style="margin-top: 20px">
              <template #default>
                <p>{{ systems.find(s => s.value === selectedSystem)?.help }}</p>
              </template>
            </el-alert>
          </div>

          <!-- 步骤2: 上传文件 -->
          <div v-show="step === 2" class="step-upload">
            <div class="step-header">
              <el-icon :size="24" class="step-header-icon"><UploadFilled /></el-icon>
              <div>
                <h3>上传成绩文件</h3>
                <p>上传 Excel 格式的成绩文件</p>
              </div>
            </div>
        <el-alert title="支持格式" type="info" :closable="false" style="margin-bottom: 15px">
          <template #default>
            支持 .xlsx 和 .xls 格式的Excel文件，支持好分数、睿芽、七天、学校自定义等多种格式
          </template>
        </el-alert>
        <el-upload
          class="upload-center"
          drag
          :auto-upload="false"
          :on-change="handleFileChange"
          accept=".xlsx,.xls"
          :limit="1"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">文件大小不超过10MB</div>
          </template>
        </el-upload>
          </div>

          <!-- 步骤3: 解析数据 -->
          <div v-show="step === 3" class="step-parse">
            <div class="step-header">
              <el-icon :size="24" class="step-header-icon"><Document /></el-icon>
              <div>
                <h3>解析数据</h3>
                <p>正在识别和解析成绩数据</p>
              </div>
            </div>
        <div v-if="parsing" class="parse-loading">
          <el-progress :percentage="parseProgress" :status="parseProgress === 100 ? 'success' : undefined" :indeterminate="false" :stroke-width="20" style="width: 300px; margin: 0 auto 20px" />
          <p>正在解析文件，请稍候...</p>
          <p style="font-size: 12px; color: #909399">正在识别成绩数据...</p>
        </div>
        <div v-else-if="parseResult">
          <el-alert v-if="isParseSuccess" :title="parseResult.data?.message || parseResult.message" type="success" style="margin-bottom: 15px" />
          <el-alert v-else :title="parseResult.message" type="error" style="margin-bottom: 15px" />

          <el-descriptions v-if="isParseSuccess" title="解析结果" :column="3" border>
            <el-descriptions-item label="考试名称">{{ parseResult.data?.exam_info?.exam_name || parseResult.exam_info?.exam_name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="数据来源">{{ parseResult.data?.exam_info?.system || parseResult.exam_info?.system || '-' }}</el-descriptions-item>
            <el-descriptions-item label="学生人数">{{ parseResult.data?.data?.students?.length || parseResult.data?.students?.length || 0 }}</el-descriptions-item>
          </el-descriptions>

          <div v-if="isParseSuccess" style="margin-top: 15px">
            <div class="subject-list">
              <el-tag v-for="subj in (parseResult.data?.data?.exam_info?.subjects || parseResult.data?.exam_info?.subjects)" :key="subj" type="info" style="margin: 3px">
                {{ subj }}
              </el-tag>
            </div>
          </div>
        </div>
          </div>
          <!-- 步骤4: 学生匹配 -->
          <div v-show="step === 4" class="step-match">
            <div class="step-header">
              <el-icon :size="24" class="step-header-icon"><User /></el-icon>
              <div>
                <h3>学生匹配</h3>
                <p>将导入的学生与系统学生进行匹配</p>
              </div>
            </div>
        <div v-if="matching" class="match-loading">
          <el-progress :percentage="matchProgress" :status="matchProgress === 100 ? 'success' : undefined" :indeterminate="false" :stroke-width="20" style="width: 300px; margin: 0 auto 20px" />
          <p>正在匹配学生，请稍候...</p>
          <p style="font-size: 12px; color: #909399">正在对比学生信息...</p>
        </div>
        <div v-else-if="matchResult">
          <el-alert :title="matchResult.message" :type="matchResult.success ? 'success' : 'error'" style="margin-bottom: 15px" />

          <el-row :gutter="20" style="margin-bottom: 15px">
            <el-col :span="12">
              <el-card shadow="hover" class="match-stat">
                <div class="match-stat-value" style="color: #67c23a">{{ matchResult.matched?.length || 0 }}</div>
                <div class="match-stat-label">成功匹配</div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card shadow="hover" class="match-stat">
                <div class="match-stat-value" style="color: #f56c6c">{{ matchResult?.unmatched?.length || 0 }}</div>
                <div class="match-stat-label">未匹配</div>
              </el-card>
            </el-col>
          </el-row>

          <el-collapse v-if="matchResult && matchResult.matched?.length > 0" v-model="activeMatchCollapse" style="margin-bottom: 15px">
            <el-collapse-item title="已匹配学生 (点击展开)" name="matched">
              <el-table :data="matchResult?.matched || []" size="small" max-height="200">
                <el-table-column prop="name" label="姓名" width="80" />
                <el-table-column prop="student_no" label="考号" width="120" />
                <el-table-column prop="class_name" label="班级" width="100" />
                <el-table-column prop="matched_student_id" label="学生ID" width="80" />
                <el-table-column prop="match_method" label="匹配方式" width="100" />
              </el-table>
            </el-collapse-item>
          </el-collapse>

          <el-collapse v-if="matchResult && matchResult.unmatched?.length > 0" v-model="activeUnmatchCollapse">
            <el-collapse-item title="未匹配学生 (需要手动匹配)" name="unmatched">
              <el-table :data="matchResult?.unmatched || []" size="small" max-height="200">
                <el-table-column prop="name" label="姓名" width="80" />
                <el-table-column prop="student_no" label="考号" width="120" />
                <el-table-column prop="class_name" label="班级" width="100" />
                <el-table-column label="操作" width="100">
                  <el-button type="primary" size="small" link @click="openMatchDialog(row)">手动匹配</el-button>
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </div>
          </div>

          <!-- 步骤5: 保存原始成绩 -->
          <div v-show="step === 5" class="step-save">
            <div class="step-header">
              <el-icon :size="24" class="step-header-icon"><Check /></el-icon>
              <div>
                <h3>导入完成</h3>
                <p>成绩数据已成功保存</p>
              </div>
            </div>
        <el-result
          icon="success"
          title="导入成功"
          :sub-title="`已将 ${savedCount} 条数据保存到原始成绩表`"
        >
          <template #extra">
            <el-button type="primary" @click="confirmScore">确认导入</el-button>
            <el-button @click="goToScoreList">查看成绩</el-button>
          </template>
        </el-result>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="wizard-footer">
      <el-button @click="goBack">返回</el-button>
      <el-button v-if="step > 0 && step < 5" @click="prevStep">上一步</el-button>
      <el-button v-if="step === 0" type="primary" :disabled="!selectedExamId" @click="nextToSystem">下一步</el-button>
      <el-button v-if="step === 1" type="primary" :disabled="!selectedSystem" @click="nextToUpload">下一步</el-button>
      <el-button v-if="step === 2" type="primary" :disabled="!currentFile" @click="doParse">开始解析</el-button>
      <el-button v-if="step === 3 && isParseSuccess" type="primary" @click="doMatch">匹配学生</el-button>
      <el-button v-if="step === 4 && isMatchSuccess" type="primary" @click="saveToExamScore">保存原始成绩</el-button>
    </div>

    <!-- 手动匹配对话框 -->
    <el-dialog v-model="manualMatchVisible" title="手动匹配学生" width="600px" @close="manualMatchVisible = false">
      <div style="margin-bottom: 15px">
        当前未匹配: <strong>{{ currentUnmatchedRow?.name }}</strong> ({{ currentUnmatchedRow?.class_name }})
      </div>
      <el-input v-model="studentSearch" placeholder="搜索学生姓名/考号" clearable @input="searchStudent" style="margin-bottom: 15px" />
      <div style="max-height: 300px; overflow-y: auto">
        <div v-for="student in studentOptions" :key="student.id" class="student-item" @click="handleSelectStudent(student)">
          <span>{{ student.name }}</span>
          <span>{{ student.studentNo }}</span>
          <span>{{ student.studentId }}</span>
          <span>{{ student.className }}</span>
          <el-button type="primary" size="small">选择</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UploadFilled, Calendar, Monitor, Document, User, Check, School } from '@element-plus/icons-vue'
import { getStudentsForMatch, parseExcel, matchStudents, saveToExamScore as saveToExamScoreApi, confirmExamScore as confirmExamScoreApi } from '@/api/score-import'
import { getExamList, createExam } from '@/api/exam'
import { getGradeList } from '@/api/grade'

const router = useRouter()

const step = ref(0)

// 步骤配置
const steps = [
  { title: '选择考试', desc: '选择或创建考试场次' },
  { title: '选择系统', desc: '选择成绩数据来源' },
  { title: '上传文件', desc: '上传 Excel 文件' },
  { title: '解析数据', desc: '识别成绩数据' },
  { title: '学生匹配', desc: '匹配系统学生' },
  { title: '导入完成', desc: '保存成绩数据' }
]

// 系统选项
const systems = [
  { value: 'haofenshu', label: '好分数', icon: 'Monitor', desc: '好分数系统导出文件', help: '好分数系统导出的成绩文件，包含考号、姓名、各科原始分、排名等信息' },
  { value: 'ruiya', label: '睿芽', icon: 'Monitor', desc: '睿芽系统导出文件', help: '睿芽系统导出的成绩文件，包含学号、姓名、班级、各科成绩等信息' },
  { value: 'qitian', label: '七天', icon: 'Monitor', desc: '七天系统导出文件', help: '七天系统导出的成绩文件，包含考号、姓名、选科组合等信息' },
  { value: 'custom', label: '自定义', icon: 'Monitor', desc: '学校自定义格式', help: '学校自定义格式的Excel文件，请确保包含考号、姓名、班级和成绩列' }
]

// 判断是否可以跳转到某一步骤
const canGoToStep = (targetStep: number) => {
  // 只能跳转到已完成的步骤或当前步骤的前一步
  return targetStep <= step.value
}

// 步骤0: 选择考试
const examList = ref<any[]>([])
const gradeList = ref<any[]>([])
const selectedExamId = ref<number | null>(null)
const selectedExam = ref<any>(null)
const showCreateExam = ref(false)
const newExam = reactive({
  examName: '',
  examDate: '',
  gradeId: null
})

// 步骤1: 选择系统
const selectedSystem = ref<string>('')

const currentFile = ref<File | null>(null)
const parsing = ref(false)
const parseProgress = ref(0)
const matching = ref(false)
const matchProgress = ref(0)
const savedCount = ref(0)

const parseResult = ref<any>(null)
const matchResult = ref<any>(null)
const allStudents = ref<any[]>([])

const activeMatchCollapse = ref(['matched'])
const activeUnmatchCollapse = ref(['unmatched'])

const manualMatchVisible = ref(false)
const currentUnmatchedRow = ref<any>(null)
const studentSearch = ref('')
const studentOptions = ref<any[]>([])

const showAssignScores = ref(true)

const isParseSuccess = computed(() => {
  const data = parseResult.value
  if (!data) return false
  if (data?.data?.data?.success === true) return true
  if (data?.data?.code === 0 && data?.data?.data?.success === true) return true
  if (data?.data?.success === true) return true
  if (data?.success === true) return true
  return false
})

const isMatchSuccess = computed(() => {
  const data = matchResult.value
  if (!data) return false
  if (data.matched !== undefined || data.unmatched !== undefined) return true
  if (data?.data?.data?.success === true) return true
  if (data?.data?.success === true) return true
  if (data?.success === true) return true
  return false
})

const loadExamAndGradeList = async () => {
  try {
    const [examRes, gradeRes] = await Promise.all([
      getExamList({ page: 1, pageSize: 100 }),
      getGradeList({ pageSize: 100 })
    ])
    examList.value = examRes.list || []
    gradeList.value = gradeRes.list || []
  } catch (error) {
    console.error('加载考试/年级失败', error)
  }
}

const handleExamChange = () => {
  selectedExam.value = examList.value.find(e => e.id === selectedExamId.value)
}

const handleCreateExam = async () => {
  if (!newExam.examName || !newExam.gradeId) {
    ElMessage.warning('请填写考试名称和选择年级')
    return
  }
  try {
    const res = await createExam(newExam)
    ElMessage.success('创建成功')
    showCreateExam.value = false
    newExam.examName = ''
    newExam.examDate = ''
    newExam.gradeId = null
    await loadExamAndGradeList()
    selectedExamId.value = res?.id || res?.list?.[0]?.id
  } catch (error: any) {
    ElMessage.error(error.message || '创建失败')
  }
}

const loadStudents = async () => {
  try {
    const res = await getStudentsForMatch()
    allStudents.value = res?.data || res || []
  } catch (error) {
    console.error('加载学生列表失败', error)
  }
}

const nextToSystem = () => { step.value = 1 }
const nextToUpload = () => { step.value = 2 }
const prevStep = () => { if (step.value > 0) step.value-- }

const handleFileChange = (file: any) => {
  currentFile.value = file.raw
}

const doParse = async () => {
  if (!currentFile.value) return
  parsing.value = true
  parseProgress.value = 0

  const progressInterval = setInterval(() => {
    if (parseProgress.value < 90) parseProgress.value += 10
  }, 300)

  try {
    const data: any = await parseExcel(currentFile.value, selectedSystem.value)
    parseResult.value = data

    const isSuccess =
      (data?.data?.data?.success === true) ||
      (data?.data?.success === true) ||
      (data?.success === true)

    if (isSuccess) {
      parseProgress.value = 100
      step.value = 3
    } else {
      ElMessage.error(data?.message || '解析失败')
    }
  } catch (error: any) {
    console.error('解析失败:', error)
    ElMessage.error('解析失败: ' + (error.message || '未知错误'))
  } finally {
    clearInterval(progressInterval)
    parsing.value = false
  }
}

const doMatch = async () => {
  const students =
    parseResult.value?.data?.data?.students ||
    parseResult.value?.data?.students ||
    parseResult.value?.students || []

  if (!students.length) {
    ElMessage.warning('没有可匹配的学生数据')
    return
  }

  if (!allStudents.value.length) {
    await loadStudents()
    if (!allStudents.value.length) {
      ElMessage.error('加载学生列表失败，无法匹配')
      return
    }
  }

  matching.value = true
  matchProgress.value = 0

  const progressInterval = setInterval(() => {
    if (matchProgress.value < 90) matchProgress.value += 15
  }, 200)

  try {
    const importStudents = students.map((s: any) => ({
      row: s.row,
      student_no: s.student_no,
      student_id: s.student_id,
      name: s.name,
      class_name: s.class_name,
      scores: s.scores || {}
    }))

    const data: any = await matchStudents(allStudents.value, importStudents, selectedExamId.value)

    const isSuccess =
      (data?.data?.data?.success === true) ||
      (data?.data?.success === true) ||
      (data?.success === true)

    if (isSuccess) {
      matchProgress.value = 100

      const matchedResult = data?.matched || data?.data?.matched || []
      const unmatchedResult = data?.unmatched || data?.data?.unmatched || []

      matchResult.value = {
        success: true,
        matched: matchedResult,
        unmatched: unmatchedResult,
        message: data?.message || '匹配成功'
      }

      step.value = 4
    } else {
      ElMessage.warning(data?.message || '匹配未完成')
    }
  } catch (error: any) {
    console.error('匹配失败:', error)
    ElMessage.error(error.message || '匹配失败')
  } finally {
    clearInterval(progressInterval)
    matching.value = false
  }
}

const saveToExamScore = async () => {
  if (!selectedExamId.value) {
    ElMessage.warning('请先选择考试')
    return
  }

  try {
    const data: any = await saveToExamScoreApi(selectedExamId.value, [])
    if (data.success !== false) {
      savedCount.value = data.count || 0
      ElMessage.success(data.message || '保存成功')
    } else {
      ElMessage.error(data.message || '保存失败')
    }
  } catch (error: any) {
    console.error('保存失败:', error)
    ElMessage.error(error.message || '保存失败')
  }
}

const confirmScore = async () => {
  try {
    await confirmExamScoreApi(selectedExamId.value!)
    ElMessage.success('确认成功')
    goToScoreList()
  } catch (error: any) {
    ElMessage.error(error.message || '确认失败')
  }
}

const goToScoreList = () => {
  router.push('/score')
}

const goBack = () => {
  router.push('/score')
}

const openMatchDialog = (row: any) => {
  currentUnmatchedRow.value = row
  studentOptions.value = allStudents.value
  manualMatchVisible.value = true
}

const searchStudent = () => {
  const keyword = studentSearch.value.toLowerCase()
  if (!keyword) {
    studentOptions.value = allStudents.value
    return
  }
  studentOptions.value = allStudents.value.filter(s =>
    s.name?.toLowerCase().includes(keyword) ||
    s.studentNo?.toLowerCase().includes(keyword)
  )
}

const selectStudent = async (row: any) => {
  if (!currentUnmatchedRow.value || !selectedExamId.value || !matchResult.value) return

  // 创建新的匹配记录
  const newMatched = {
    row: currentUnmatchedRow.value.row,
    name: currentUnmatchedRow.value.name,
    student_no: currentUnmatchedRow.value.student_no,
    student_id: currentUnmatchedRow.value.student_id,
    class_name: currentUnmatchedRow.value.class_name,
    matched_student_id: row.id,
    match_method: '手动匹配',
    scores: currentUnmatchedRow.value.scores || {}
  }

  // 初始化 matched 和 unmatched 数组
  if (!matchResult.value.matched) {
    matchResult.value.matched = []
  }
  if (!matchResult.value.unmatched) {
    matchResult.value.unmatched = []
  }

  matchResult.value.matched.push(newMatched)

  // 从未匹配列表中移除
  if (matchResult.value.unmatched) {
    const idx = matchResult.value.unmatched.findIndex((u: any) =>
      u.row === currentUnmatchedRow.value.row &&
      u.name === currentUnmatchedRow.value.name
    )
    if (idx >= 0) {
      matchResult.value.unmatched.splice(idx, 1)
    }
  }

  // 关闭对话框
  manualMatchVisible.value = false
  ElMessage.success(`已将 ${currentUnmatchedRow.value.name} 匹配到 ${row.name}`)
}

// 处理选择学生（对话框中的按钮）
const handleSelectStudent = (row: any) => {
  selectStudent(row)
}

onMounted(() => {
  loadExamAndGradeList()
  loadStudents()
})
</script>

<style scoped>
.score-import-wizard {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.step-content {
  min-height: 400px;
  padding: 20px 0;
}

.step-upload {
  text-align: center;
  padding: 40px 0;
}

.upload-center {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.parse-loading, .match-loading {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.match-stat {
  text-align: center;
}

.match-stat-value {
  font-size: 28px;
  font-weight: bold;
}

.match-stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.wizard-footer {
  display: flex;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.subject-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.student-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  gap: 15px;
}

.student-item:hover {
  background-color: #f5f7fa;
}

.student-item span {
  flex: 1;
}

.student-item .el-button {
  flex: 0;
}
</style>
