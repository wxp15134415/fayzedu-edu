<template>
  <div class="score-management">
    <div class="toolbar">
      <el-button type="primary" @click="openImportDialog">导入成绩</el-button>
      <el-button @click="loadData">刷新</el-button>
      <el-select v-model="filterExamId" placeholder="筛选考试" clearable style="width: 180px; margin-left: 10px" @change="handleExamFilter">
        <el-option v-for="exam in examList" :key="exam.id" :label="exam.examName" :value="exam.id" />
      </el-select>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索学生姓名/考号"
        clearable
        @keyup.enter="handleSearch"
        style="width: 220px; margin-left: auto"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch" />
        </template>
      </el-input>
    </div>

    <!-- 统计信息 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="24">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value" style="color: #409eff">{{ totalCount }}</div>
          <div class="stat-label">成绩记录总数</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 桌面端表格 -->
    <el-table v-if="!isMobile" :data="tableData" v-loading="loading" stripe :header-cell-style="{background: '#f5f7fa'}" fit>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="student" label="学生" width="100">
        <template #default="{ row }">
          {{ row.student?.name || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="student" label="考号" width="120">
        <template #default="{ row }">
          {{ row.student?.studentNo || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="student" label="班级" width="100">
        <template #default="{ row }">
          {{ row.student?.class?.className || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="chinese" label="语文" width="70" />
      <el-table-column prop="chineseRank" label="排名" width="60" />
      <el-table-column prop="math" label="数学" width="70" />
      <el-table-column prop="mathRank" label="排名" width="60" />
      <el-table-column prop="english" label="英语" width="70" />
      <el-table-column prop="englishRank" label="排名" width="60" />
      <el-table-column prop="physics" label="物理" width="70" />
      <el-table-column prop="physicsRank" label="排名" width="60" />
      <el-table-column prop="chemistry" label="化学" width="65" />
      <el-table-column prop="chemistryAssign" label="赋分" width="60" />
      <el-table-column prop="chemistryRank" label="排名" width="60" />
      <el-table-column prop="biology" label="生物" width="65" />
      <el-table-column prop="biologyAssign" label="赋分" width="60" />
      <el-table-column prop="biologyRank" label="排名" width="60" />
      <el-table-column prop="politics" label="政治" width="65" />
      <el-table-column prop="politicsAssign" label="赋分" width="60" />
      <el-table-column prop="politicsRank" label="排名" width="60" />
      <el-table-column prop="history" label="历史" width="65" />
      <el-table-column prop="historyRank" label="排名" width="60" />
      <el-table-column prop="geography" label="地理" width="65" />
      <el-table-column prop="geographyAssign" label="赋分" width="60" />
      <el-table-column prop="geographyRank" label="排名" width="60" />
      <el-table-column prop="totalScore" label="总分" width="70" />
      <el-table-column prop="totalScoreAssign" label="赋分" width="60" />
      <el-table-column prop="totalRank" label="排名" width="60" />
      <el-table-column prop="status" label="状态" width="70">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'warning'" size="small">
            {{ row.status === 1 ? '已确认' : '待确认' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 移动端卡片列表 -->
    <div v-else class="mobile-cards">
      <el-card v-for="row in tableData" :key="row.id" class="mobile-card" shadow="hover">
        <div class="card-header">
          <span class="student-name">{{ row.student?.name || '-' }}</span>
          <el-tag :type="row.status === 1 ? 'success' : 'warning'" size="small">
            {{ row.status === 1 ? '已确认' : '待确认' }}
          </el-tag>
        </div>
        <div class="card-info">
          <div class="info-row"><span class="label">考号:</span><span>{{ row.student?.studentNo || '-' }}</span></div>
          <div class="info-row"><span class="label">班级:</span><span>{{ row.student?.class?.className || '-' }}</span></div>
          <div class="info-row"><span class="label">语文:</span><span>{{ row.chinese || '-' }} ({{ row.chineseRank }})</span></div>
          <div class="info-row"><span class="label">数学:</span><span>{{ row.math || '-' }} ({{ row.mathRank }})</span></div>
          <div class="info-row"><span class="label">英语:</span><span>{{ row.english || '-' }} ({{ row.englishRank }})</span></div>
          <div class="info-row"><span class="label">物理:</span><span>{{ row.physics || '-' }} ({{ row.physicsRank }})</span></div>
          <div class="info-row"><span class="label">化学:</span><span>{{ row.chemistry || '-' }}/{{ row.chemistryAssign || '-' }} ({{ row.chemistryRank }})</span></div>
          <div class="info-row"><span class="label">生物:</span><span>{{ row.biology || '-' }}/{{ row.biologyAssign || '-' }} ({{ row.biologyRank }})</span></div>
          <div class="info-row"><span class="label">政治:</span><span>{{ row.politics || '-' }}/{{ row.politicsAssign || '-' }} ({{ row.politicsRank }})</span></div>
          <div class="info-row"><span class="label">历史:</span><span>{{ row.history || '-' }} ({{ row.historyRank }})</span></div>
          <div class="info-row"><span class="label">地理:</span><span>{{ row.geography || '-' }}/{{ row.geographyAssign || '-' }} ({{ row.geographyRank }})</span></div>
          <div class="info-row"><span class="label">总分:</span><span>{{ row.totalScore || '-' }}/{{ row.totalScoreAssign || '-' }} ({{ row.totalRank }})</span></div>
        </div>
        <div class="card-actions">
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && tableData.length === 0" description="暂无成绩数据">
      <el-button type="primary" @click="openImportDialog">导入成绩</el-button>
    </el-empty>

    <el-pagination v-if="tableData.length > 0" v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @change="loadData" style="margin-top: 20px; justify-content: flex-end" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getExamScoreList, deleteExamScore } from '@/api/score'
import { getExamList } from '@/api/exam'

const router = useRouter()

const loading = ref(false)
const isMobile = ref(window.innerWidth < 768)
const tableData = ref<any[]>([])
const examList = ref<any[]>([])
const searchKeyword = ref('')
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// 筛选
const filterExamId = ref<number | undefined>(undefined)

// 总数
const totalCount = computed(() => pagination.total)

// 加载考试列表
const loadExamList = async () => {
  try {
    const res: any = await getExamList({ page: 1, pageSize: 100 })
    examList.value = res.list || []
    // 默认选最新考试
    if (examList.value.length > 0) {
      const latestExam = examList.value.reduce((prev, curr) => (curr.id > prev.id) ? curr : prev)
      filterExamId.value = latestExam.id
    }
  } catch (error) { console.error('加载考试失败', error) }
}

onMounted(() => {
  loadExamList()
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    if (filterExamId.value) params.examId = filterExamId.value

    const res: any = await getExamScoreList(params)
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error: any) {
    console.error('加载失败', error)
    tableData.value = []
  }
  finally { loading.value = false }
}

const handleExamFilter = () => { pagination.page = 1; loadData() }
const handleSearch = () => { pagination.page = 1; loadData() }

const openImportDialog = () => {
  // 跳转到导入向导页面
  router.push('/score-import-wizard')
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该成绩记录吗？', '提示', { type: 'warning' })
    await deleteExamScore(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '删除失败')
  }
}
</script>

<style scoped>
.score-management { padding: 20px; }
.toolbar { margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; }
.stats-row { margin-bottom: 20px; }
.stat-card { text-align: center; }
.stat-value { font-size: 24px; font-weight: bold; color: #409eff; }
.stat-label { font-size: 14px; color: #909399; margin-top: 5px; }
:deep(.el-table) { table-layout: auto !important; width: 100% !important; }
.action-buttons { display: flex; gap: 4px; }
.action-buttons .el-button { padding: 4px 8px; font-size: 13px; }

.mobile-cards { display: flex; flex-direction: column; gap: 10px; }
.mobile-card { border-radius: 8px; }
.mobile-card .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.mobile-card .student-name { font-weight: bold; font-size: 16px; }
.mobile-card .card-info { font-size: 14px; }
.mobile-card .info-row { display: flex; justify-content: space-between; padding: 4px 0; }
.mobile-card .info-row .label { color: #909399; }
.mobile-card .card-actions { display: flex; gap: 10px; margin-top: 10px; justify-content: flex-end; }

@media (max-width: 768px) {
  .score-management { padding: 12px; }
  :deep(.el-dialog) { width: 95% !important; margin: 10px !important; }
}
</style>