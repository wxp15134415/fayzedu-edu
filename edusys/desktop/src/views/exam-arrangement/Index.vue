<template>
  <div class="exam-arrangement-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleSelectStudents">选择学生</el-button>
      <el-button type="success" @click="handleGenerate">生成编排</el-button>
      <el-button @click="handleGenerateExamNo">生成准考证号</el-button>
      <el-button @click="loadData">刷新</el-button>
      <el-button @click="handlePrintAdmission">打印准考证</el-button>
      <el-button @click="handlePrintCheckin">打印签到表</el-button>
      <el-select v-model="filterExamId" placeholder="选择考试" clearable style="width: 180px" @change="handleFilterChange">
        <el-option v-for="e in examList" :key="e.id" :label="e.examName" :value="e.id" />
      </el-select>
      <el-select v-model="filterVenueId" placeholder="选择考点" clearable style="width: 150px" @change="handleFilterChange">
        <el-option v-for="v in venueList" :key="v.id" :label="v.venueName" :value="v.id" />
      </el-select>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索姓名/学号/准考证号"
        clearable
        @keyup.enter="handleSearch"
        style="width: 220px; margin-left: auto"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch" />
        </template>
      </el-input>
    </div>

    <!-- 统计卡片 -->
    <div v-if="stats" class="stats-cards">
      <el-card class="stats-card">
        <div class="stats-value">{{ stats.totalStudents }}</div>
        <div class="stats-label">总考生数</div>
      </el-card>
      <el-card v-for="s in stats.sessions" :key="s.sessionId" class="stats-card">
        <div class="stats-value">{{ s.count }}</div>
        <div class="stats-label">{{ s.sessionName }}</div>
        <div class="stats-sub">考场: {{ s.roomCount }}</div>
      </el-card>
    </div>

    <!-- 桌面端表格 -->
    <el-table v-if="!isMobile" :data="tableData" v-loading="loading" stripe :header-cell-style="{background: '#f5f7fa'}" fit>
      <el-table-column prop="roomNo" label="考场号" width="100" />
      <el-table-column prop="seatNo" label="座位号" width="100" />
      <el-table-column prop="student" label="学生信息" min-width="150">
        <template #default="{ row }">
          <div v-if="row.student">
            <div>{{ row.student.name }}</div>
            <div class="text-gray">{{ row.student.studentNo }}</div>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="examNo" label="准考证号" width="150" />
      <el-table-column prop="venue" label="考点" width="120">
        <template #default="{ row }">
          {{ row.venue?.venueName || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="session" label="场次" width="120">
        <template #default="{ row }">
          {{ row.session?.sessionName || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '正常' : '取消' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" link @click="handleDeleteArrangement(row)">移除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 移动端卡片式列表 -->
    <div v-else-if="!loading && tableData.length > 0" class="mobile-card-list">
      <el-card v-for="row in tableData" :key="row.id" class="mobile-card">
        <div class="mobile-card-item">
          <span class="mobile-card-label">考场号</span>
          <span class="mobile-card-value">{{ row.roomNo }} - {{ row.seatNo }}号</span>
        </div>
        <div class="mobile-card-item" v-if="row.student">
          <span class="mobile-card-label">姓名</span>
          <span class="mobile-card-value">{{ row.student.name }}</span>
        </div>
        <div class="mobile-card-item" v-if="row.student">
          <span class="mobile-card-label">学号</span>
          <span class="mobile-card-value">{{ row.student.studentNo }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">准考证号</span>
          <span class="mobile-card-value">{{ row.examNo || '-' }}</span>
        </div>
        <div class="mobile-card-actions">
          <el-button type="danger" size="small" link @click="handleDeleteArrangement(row)">移除</el-button>
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
    <el-empty v-if="!loading && tableData.length === 0" description="暂无编排数据">
      <el-button type="primary" @click="handleSelectStudents">选择学生</el-button>
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

    <!-- 选择学生弹窗 -->
    <el-dialog v-model="selectStudentsDialogVisible" title="选择考试学生" width="800px">
      <el-form inline>
        <el-form-item label="年级">
          <el-select v-model="selectGradeId" placeholder="选择年级" @change="loadAvailableStudents" style="width: 150px">
            <el-option v-for="g in gradeList" :key="g.id" :label="g.gradeName" :value="g.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="loadAvailableStudents">刷新</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="availableStudents" max-height="400" @selection-change="handleStudentSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="studentNo" label="学号" width="100" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="class" label="班级">
          <template #default="{ row }">
            {{ row.class?.className || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="subjects" label="选科" />
      </el-table>
      <div style="margin-top: 10px">
        已选择: {{ selectedStudents.length }} 人
      </div>
      <template #footer>
        <el-button @click="selectStudentsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmSelectStudents" :loading="confirmSelectLoading">确认选择</el-button>
      </template>
    </el-dialog>

    <!-- 生成编排弹窗 -->
    <el-dialog v-model="generateDialogVisible" title="生成编排" width="500px">
      <el-form ref="generateFormRef" :model="generateFormData" :rules="generateFormRules" label-width="100px">
        <el-form-item label="考试" prop="examId">
          <el-select v-model="generateFormData.examId" placeholder="选择考试" @change="onExamChange">
            <el-option v-for="e in examList" :key="e.id" :label="e.examName" :value="e.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="场次" prop="sessionId">
          <el-select v-model="generateFormData.sessionId" placeholder="选择场次">
            <el-option v-for="s in sessionList" :key="s.id" :label="s.sessionName" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="考点" prop="venueId">
          <el-select v-model="generateFormData.venueId" placeholder="选择考点">
            <el-option v-for="v in venueList" :key="v.id" :label="v.venueName" :value="v.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="编排方式" prop="arrangeType">
          <el-radio-group v-model="generateFormData.arrangeType">
            <el-radio value="按选科">按选科</el-radio>
            <el-radio value="按班级">按班级</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="generateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleGenerateSubmit" :loading="generateLoading">生成</el-button>
      </template>
    </el-dialog>

    <!-- 生成准考证号弹窗 -->
    <el-dialog v-model="examNoDialogVisible" title="生成准考证号" width="400px">
      <el-form ref="examNoFormRef" :model="examNoFormData" label-width="100px">
        <el-form-item label="考试" prop="examId">
          <el-select v-model="examNoFormData.examId" placeholder="选择考试">
            <el-option v-for="e in examList" :key="e.id" :label="e.examName" :value="e.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="生成规则" prop="rule">
          <el-radio-group v-model="examNoFormData.rule">
            <el-radio :value="0">规则1: 年级+班级+考场+座位</el-radio>
            <el-radio :value="1">规则2: 年级+科目+班级+考场+座位</el-radio>
            <el-radio :value="2">规则3: 考点+年级+科目+考场+座位</el-radio>
            <el-radio :value="3">规则4: 使用学号</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="examNoDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleExamNoSubmit" :loading="examNoLoading">生成</el-button>
      </template>
    </el-dialog>

    <!-- 打印签到表弹窗 -->
    <el-dialog v-model="checkinDialogVisible" title="打印签到表" width="600px">
      <el-form inline>
        <el-form-item label="场次">
          <el-select v-model="checkinForm.sessionId" placeholder="选择场次" style="width: 180px">
            <el-option v-for="s in sessionList" :key="s.id" :label="s.sessionName" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="考点">
          <el-select v-model="checkinForm.venueId" placeholder="选择考点" style="width: 150px">
            <el-option v-for="v in venueList" :key="v.id" :label="v.venueName" :value="v.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadCheckinData">加载数据</el-button>
        </el-form-item>
      </el-form>

      <!-- 签到表预览 -->
      <div v-if="checkinData" class="checkin-preview">
        <div class="checkin-header">
          <h2>{{ checkinData.examName }} - {{ checkinData.sessionName }}</h2>
          <p>考点: {{ checkinData.venueName }} | 日期: {{ checkinData.examDate }} {{ checkinData.startTime }}-{{ checkinData.endTime }}</p>
        </div>
        <div v-for="(students, roomNo) in checkinData.rooms" :key="roomNo" class="checkin-room">
          <h3>考场号: {{ roomNo }} (共 {{ students.length }} 人)</h3>
          <table class="checkin-table">
            <thead>
              <tr>
                <th>座位号</th>
                <th>姓名</th>
                <th>学号</th>
                <th>班级</th>
                <th>身份证号</th>
                <th>签名</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in students" :key="s.seatNo">
                <td>{{ s.seatNo }}</td>
                <td>{{ s.studentName }}</td>
                <td>{{ s.studentNo }}</td>
                <td>{{ s.className }}</td>
                <td>{{ s.idCard }}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template #footer>
        <el-button @click="checkinDialogVisible = false">关闭</el-button>
        <el-button type="primary" onclick="window.print()">打印</el-button>
      </template>
    </el-dialog>

    <!-- 打印准考证弹窗 -->
    <el-dialog v-model="admissionDialogVisible" title="打印准考证" width="90%" destroy-on-close>
      <el-form inline style="margin-bottom: 20px">
        <el-form-item label="场次">
          <el-select v-model="admissionForm.sessionId" placeholder="选择场次" style="width: 180px" @change="loadAdmissionData">
            <el-option label="全部场次" :value="0" />
            <el-option v-for="s in sessionList" :key="s.id" :label="s.sessionName" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="考点">
          <el-select v-model="admissionForm.venueId" placeholder="选择考点" style="width: 150px" @change="loadAdmissionData">
            <el-option label="全部考点" :value="0" />
            <el-option v-for="v in venueList" :key="v.id" :label="v.venueName" :value="v.id" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 准考证预览 -->
      <div v-if="admissionData" class="admission-preview">
        <div v-for="(students, roomNo) in admissionData" :key="roomNo" class="admission-room">
          <h3>考场号: {{ roomNo }}</h3>
          <div class="admission-grid">
            <div v-for="s in students" :key="s.id" class="admission-card">
              <div class="admission-card-inner">
                <div class="admission-title">准考证</div>
                <div class="admission-info">
                  <p><strong>姓名:</strong> {{ s.studentName }}</p>
                  <p><strong>学号:</strong> {{ s.studentNo }}</p>
                  <p><strong>考场:</strong> {{ s.roomNo }}</p>
                  <p><strong>座位:</strong> {{ s.seatNo }}</p>
                  <p><strong>准考证号:</strong> {{ s.examNo }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="admissionDialogVisible = false">关闭</el-button>
        <el-button type="primary" onclick="window.print()">打印</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getExamArrangementList, generateExamArrangement, generateExamNo, getExamArrangementStats, getAvailableStudents, getPrintAdmission, getPrintCheckin, deleteExamArrangement } from '@/api/exam-arrangement'
import { getExamList } from '@/api/exam'
import { getExamVenueList } from '@/api/exam-venue'
import { getGradeList } from '@/api/grade'
import { getExamSessionsByExam } from '@/api/exam-session'

const loading = ref(false)
const isMobile = ref(window.innerWidth < 768)
const tableData = ref<any[]>([])
const examList = ref<any[]>([])
const venueList = ref<any[]>([])
const gradeList = ref<any[]>([])
const sessionList = ref<any[]>([])
const stats = ref<any>(null)
const searchKeyword = ref('')
const filterExamId = ref<number | null>(null)
const filterVenueId = ref<number | null>(null)
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 选择学生弹窗
const selectStudentsDialogVisible = ref(false)
const selectGradeId = ref<number | null>(null)
const availableStudents = ref<any[]>([])
const selectedStudents = ref<any[]>([])
const confirmSelectLoading = ref(false)

// 生成编排弹窗
const generateDialogVisible = ref(false)
const generateFormRef = ref()
const generateLoading = ref(false)
const generateFormData = reactive({
  examId: 0,
  sessionId: 0,
  venueId: 0,
  arrangeType: '按选科'
})
const generateFormRules = {
  examId: [{ required: true, message: '请选择考试', trigger: 'change' }],
  sessionId: [{ required: true, message: '请选择场次', trigger: 'change' }],
  venueId: [{ required: true, message: '请选择考点', trigger: 'change' }]
}

// 生成准考证号弹窗
const examNoDialogVisible = ref(false)
const examNoFormRef = ref()
const examNoLoading = ref(false)
const examNoFormData = reactive({
  examId: 0,
  rule: 0
})

// 签到表弹窗
const checkinDialogVisible = ref(false)
const checkinForm = reactive({
  sessionId: 0,
  venueId: 0
})
const checkinData = ref<any>(null)

// 准考证弹窗
const admissionDialogVisible = ref(false)
const admissionForm = reactive({
  sessionId: 0,
  venueId: 0
})
const admissionData = ref<any>(null)

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadExams()
  loadVenues()
  loadGrades()
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
      loadSessions(examList.value[0].id)
    }
  } catch (error) {
    console.error('加载考试失败', error)
  }
}

const loadVenues = async () => {
  try {
    const res = await getExamVenueList({ pageSize: 100 })
    venueList.value = res.list || []
    if (venueList.value.length > 0) {
      filterVenueId.value = venueList.value[0].id
    }
  } catch (error) {
    console.error('加载考点失败', error)
  }
}

const loadGrades = async () => {
  try {
    const res = await getGradeList({ pageSize: 100 })
    gradeList.value = res.list || []
  } catch (error) {
    console.error('加载年级失败', error)
  }
}

const loadSessions = async (examId: number) => {
  try {
    const res = await getExamSessionsByExam(examId)
    sessionList.value = res || []
  } catch (error) {
    console.error('加载场次失败', error)
  }
}

const onExamChange = (examId: number) => {
  loadSessions(examId)
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getExamArrangementList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      examId: filterExamId.value,
      venueId: filterVenueId.value,
      keyword: searchKeyword.value
    })
    tableData.value = res.list || []
    pagination.total = res.total || 0

    // 加载统计
    if (filterExamId.value) {
      const statsRes = await getExamArrangementStats(filterExamId.value)
      stats.value = statsRes
    }
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

// 选择学生
const handleSelectStudents = () => {
  if (gradeList.value.length > 0) {
    selectGradeId.value = gradeList.value[0].id
    loadAvailableStudents()
  }
  selectStudentsDialogVisible.value = true
}

const loadAvailableStudents = async () => {
  if (!selectGradeId.value || !filterExamId.value) return
  try {
    const res = await getAvailableStudents({
      gradeId: selectGradeId.value,
      examId: filterExamId.value,
      sessionId: sessionList.value[0]?.id || 0,
      venueId: venueList.value[0]?.id || 0
    })
    availableStudents.value = res || []
  } catch (error) {
    console.error('加载可选择学生失败', error)
  }
}

const handleStudentSelectionChange = (rows: any[]) => {
  selectedStudents.value = rows
}

const handleConfirmSelectStudents = async () => {
  if (selectedStudents.value.length === 0) {
    ElMessage.warning('请选择学生')
    return
  }
  confirmSelectLoading.value = true
  // 实际上选择学生后直接跳转到生成编排
  try {
    if (examList.value.length > 0) {
      generateFormData.examId = examList.value[0].id
      onExamChange(examList.value[0].id)
    }
    if (venueList.value.length > 0) {
      generateFormData.venueId = venueList.value[0].id
    }
    generateFormData.arrangeType = '按选科'
    selectStudentsDialogVisible.value = false
    generateDialogVisible.value = true
    ElMessage.success(`已选择 ${selectedStudents.value.length} 名学生，请设置编排参数`)
  } finally {
    confirmSelectLoading.value = false
  }
}

const handleGenerate = () => {
  if (examList.value.length > 0) {
    generateFormData.examId = examList.value[0].id
    onExamChange(examList.value[0].id)
  }
  if (venueList.value.length > 0) {
    generateFormData.venueId = venueList.value[0].id
  }
  generateFormData.arrangeType = '按选科'
  generateDialogVisible.value = true
}

const handleGenerateSubmit = async () => {
  await generateFormRef.value?.validate()
  generateLoading.value = true
  try {
    const res = await generateExamArrangement(generateFormData)
    ElMessage.success(`编排成功，安排 ${res.arrangedCount} 人到 ${res.roomCount} 个考场`)
    generateDialogVisible.value = false
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '生成失败')
  } finally {
    generateLoading.value = false
  }
}

const handleGenerateExamNo = () => {
  if (examList.value.length > 0) {
    examNoFormData.examId = examList.value[0].id
  }
  examNoFormData.rule = 0
  examNoDialogVisible.value = true
}

const handleExamNoSubmit = async () => {
  examNoLoading.value = true
  try {
    const res = await generateExamNo(examNoFormData)
    ElMessage.success(`准考证号生成完成，共 ${res.updatedCount} 个`)
    examNoDialogVisible.value = false
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '生成失败')
  } finally {
    examNoLoading.value = false
  }
}

const handlePrintCheckin = () => {
  if (sessionList.value.length > 0) {
    checkinForm.sessionId = sessionList.value[0].id
  }
  if (venueList.value.length > 0) {
    checkinForm.venueId = venueList.value[0].id
  }
  checkinData.value = null
  checkinDialogVisible.value = true
}

const loadCheckinData = async () => {
  if (!checkinForm.sessionId || !checkinForm.venueId) {
    ElMessage.warning('请选择场次和考点')
    return
  }
  try {
    const res = await getPrintCheckin({
      examId: filterExamId.value,
      sessionId: checkinForm.sessionId,
      venueId: checkinForm.venueId
    })
    checkinData.value = res
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  }
}

const handlePrintAdmission = () => {
  admissionForm.sessionId = 0
  admissionForm.venueId = 0
  admissionData.value = null
  admissionDialogVisible.value = true
  loadAdmissionData()
}

const loadAdmissionData = async () => {
  if (!filterExamId.value) return
  try {
    const res = await getPrintAdmission({
      examId: filterExamId.value,
      sessionId: admissionForm.sessionId || undefined,
      venueId: admissionForm.venueId || undefined
    })
    admissionData.value = res
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  }
}

const handleDeleteArrangement = async (row: any) => {
  try {
    await deleteExamArrangement(row.id)
    ElMessage.success('移除成功')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '移除失败')
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

.stats-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.stats-card {
  min-width: 120px;
  text-align: center;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.stats-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.stats-sub {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
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

.text-gray {
  font-size: 12px;
  color: #999;
}

.skeleton-container {
  margin-top: 20px;
}

/* 签到表样式 */
.checkin-preview {
  max-height: 500px;
  overflow-y: auto;
}

.checkin-header {
  text-align: center;
  margin-bottom: 20px;
}

.checkin-header h2 {
  margin: 0 0 10px 0;
}

.checkin-room {
  margin-bottom: 20px;
  page-break-inside: avoid;
}

.checkin-room h3 {
  margin: 10px 0;
  font-size: 16px;
}

.checkin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.checkin-table th,
.checkin-table td {
  border: 1px solid #333;
  padding: 6px;
  text-align: center;
}

.checkin-table th {
  background: #f5f5f5;
}

/* 准考证样式 */
.admission-preview {
  max-height: 500px;
  overflow-y: auto;
}

.admission-room {
  margin-bottom: 20px;
}

.admission-room h3 {
  margin: 10px 0;
}

.admission-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.admission-card {
  border: 1px solid #333;
  padding: 10px;
  page-break-inside: avoid;
}

.admission-card-inner {
  border: 2px solid #000;
  padding: 15px;
}

.admission-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.admission-info p {
  margin: 5px 0;
  font-size: 12px;
}

@media print {
  .admission-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .admission-card {
    page-break-inside: avoid;
  }
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

  .admission-grid {
    grid-template-columns: 1fr;
  }
}
</style>