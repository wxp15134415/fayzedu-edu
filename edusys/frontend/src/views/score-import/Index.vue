<template>
  <div class="score-import-temp">
    <div class="toolbar">
      <el-button type="primary" @click="openImportDialog">导入成绩</el-button>
      <el-button @click="loadData">刷新</el-button>
      <el-select v-model="filterStatus" placeholder="筛选状态" clearable style="width: 120px; margin-left: 10px" @change="handleFilter">
        <el-option label="待确认" :value="0" />
        <el-option label="已确认" :value="1" />
        <el-option label="已放弃" :value="2" />
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
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ stats[0] || 0 }}</div>
          <div class="stat-label">待确认</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value" style="color: #67c23a">{{ stats[1] || 0 }}</div>
          <div class="stat-label">已确认</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value" style="color: #909399">{{ stats[2] || 0 }}</div>
          <div class="stat-label">已放弃</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value" style="color: #f56c6c">{{ totalCount }}</div>
          <div class="stat-label">总计</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table v-if="!isMobile" :data="tableData" v-loading="loading" stripe :header-cell-style="{background: '#f5f7fa'}" fit>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="student" label="学生" width="120">
        <template #default="{ row }">
          {{ row.student?.name || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="studentNo" label="考号" width="120" />
      <el-table-column prop="totalScore" label="总分" width="80" />
      <el-table-column prop="totalRank" label="排名" width="60" />
      <el-table-column prop="chinese" label="语文" width="70" />
      <el-table-column prop="math" label="数学" width="70" />
      <el-table-column prop="english" label="英语" width="70" />
      <el-table-column prop="physics" label="物理" width="70" />
      <el-table-column prop="chemistry" label="化学" width="70" />
      <el-table-column prop="biology" label="生物" width="70" />
      <el-table-column prop="matchedMethod" label="匹配方式" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.matchedMethod" size="small" :type="row.studentId ? 'success' : 'warning'">
            {{ row.matchedMethod }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'warning' : row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 0 ? '待确认' : row.status === 1 ? '已确认' : '已放弃' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button v-if="!row.studentId" type="primary" link @click="handleManualMatch(row)">匹配</el-button>
            <el-button v-if="row.status === 0" type="success" link @click="handleConfirmSingle(row)">确认</el-button>
            <el-button v-if="row.status === 0" type="danger" link @click="handleCancelSingle(row)">放弃</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <el-empty v-if="!loading && tableData.length === 0" description="暂无导入数据">
      <el-button type="primary" @click="openImportDialog">导入成绩</el-button>
    </el-empty>

    <el-pagination v-if="tableData.length > 0" v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @change="loadData" style="margin-top: 20px; justify-content: flex-end" />

    <!-- 导入对话框 - 分步工作流 -->
    <el-dialog title="导入成绩" width="900px" :close-on-click-modal="false" :show-close="step > 0" v-model="importDialogVisible">
      <!-- 步骤条 -->
      <el-steps :active="step" finish-status="success" simple style="margin-bottom: 20px">
        <el-step title="选择考试" />
        <el-step title="选择系统" />
        <el-step title="上传文件" />
        <el-step title="解析数据" />
        <el-step title="学生匹配" />
        <el-step title="保存到临时表" />
      </el-steps>

      <div class="step-content">
        <!-- 步骤0: 选择考试 -->
        <div v-show="step === 0" class="step-exam">
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
                <el-date-picker v-model="newExam.examDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
              </el-form-item>
              <el-form-item label="所属年级">
                <el-select v-model="newExam.gradeId" placeholder="请选择年级">
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
          <el-form label-width="100px">
            <el-form-item label="选择系统">
              <el-select v-model="selectedSystem" placeholder="请选择成绩系统" filterable>
                <el-option label="好分数" value="haofenshu" />
                <el-option label="睿芽" value="ruiya" />
                <el-option label="七天" value="qitian" />
                <el-option label="学校自定义" value="custom" />
              </el-select>
            </el-form-item>
            <el-form-item label="系统说明">
              <el-alert type="info" :closable="false">
                <template #default>
                  <p v-if="selectedSystem === 'haofenshu'">好分数系统导出的成绩文件，包含考号、姓名、各科原始分、排名等信息</p>
                  <p v-if="selectedSystem === 'ruiya'">睿芽系统导出的成绩文件，包含学号、姓名、班级、各科成绩等信息</p>
                  <p v-if="selectedSystem === 'qitian'">七天系统导出的成绩文件，包含考号、姓名、选科组合等信息</p>
                  <p v-if="selectedSystem === 'custom'">学校自定义格式的Excel文件，请确保包含考号、姓名、班级和成绩列</p>
                  <p v-if="!selectedSystem">请先选择成绩系统</p>
                </template>
              </el-alert>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤2: 上传文件 -->
        <div v-show="step === 2" class="step-upload">
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
          <div v-if="parsing" class="parse-loading">
            <el-progress :percentage="parseProgress" :status="parseProgress === 100 ? 'success' : undefined" :indeterminate="false" :stroke-width="20" style="width: 300px; margin: 0 auto 20px" />
            <p>正在解析文件，请稍候...</p>
            <p style="font-size: 12px; color: #909399">正在识别成绩数据...</p>
          </div>
          <div v-else-if="parseResult">
            <el-alert v-if="parseResult.success" :title="parseResult.message" type="success" style="margin-bottom: 15px" />
            <el-alert v-else :title="parseResult.message" type="error" style="margin-bottom: 15px" />

            <el-descriptions v-if="parseResult.success" title="解析结果" :column="3" border>
              <el-descriptions-item label="考试名称">{{ parseResult.data?.exam_info?.exam_name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="数据来源">{{ parseResult.data?.exam_info?.system || '-' }}</el-descriptions-item>
              <el-descriptions-item label="学生人数">{{ parseResult.data?.students?.length || 0 }}</el-descriptions-item>
            </el-descriptions>

            <div v-if="parseResult.success" style="margin-top: 15px">
              <div class="subject-list">
                <el-tag v-for="subj in parseResult.data?.exam_info?.subjects" :key="subj" type="info" style="margin: 3px">
                  {{ subj }}
                </el-tag>
              </div>
            </div>

            <!-- 数据预览表格 -->
            <div v-if="parseResult.success && parseResult.data?.students?.length > 0" style="margin-top: 15px">
              <div style="margin-bottom: 10px; font-weight: 500">数据预览 (前5条)</div>
              <el-table :data="parseResult.data?.students?.slice(0, 5)" size="small" max-height="400" border>
                <el-table-column prop="name" label="姓名" width="65" fixed />
                <el-table-column prop="student_no" label="考号" width="100" />
                <el-table-column prop="class_name" label="班级" width="80" />
                <!-- 总分模块 -->
                <el-table-column label="总分" width="60">
                  <template #default="{ row }">
                    {{ row.scores?.总分?.raw || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="赋分总分" width="70" v-show="showAssignScores">
                  <template #default="{ row }">
                    {{ row.scores?.总分?.assign || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="赋分排名" width="70" v-show="showAssignScores">
                  <template #default="{ row }">
                    {{ row.scores?.总分?.assign_rank || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="总分排名" width="70">
                  <template #default="{ row }">
                    {{ row.scores?.总分?.school_rank || '-' }}
                  </template>
                </el-table-column>
                <!-- 语文模块 -->
                <el-table-column label="语文" width="55">
                  <template #default="{ row }">
                    {{ row.scores?.语文?.raw || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="语文排名" width="70">
                  <template #default="{ row }">
                    {{ row.scores?.语文?.school_rank || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="语文班级排名" width="80">
                  <template #default="{ row }">
                    {{ row.scores?.语文?.class_rank || '-' }}
                  </template>
                </el-table-column>
                <!-- 数学模块 -->
                <el-table-column label="数学" width="55">
                  <template #default="{ row }">
                    {{ row.scores?.数学?.raw || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="数学排名" width="70">
                  <template #default="{ row }">
                    {{ row.scores?.数学?.school_rank || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="数学班级" width="70">
                  <template #default="{ row }">
                    {{ row.scores?.数学?.class_rank || '-' }}
                  </template>
                </el-table-column>
                <!-- 英语模块 -->
                <el-table-column label="英语" width="55">
                  <template #default="{ row }">
                    {{ row.scores?.英语?.raw || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="英语排名" width="70">
                  <template #default="{ row }">
                    {{ row.scores?.英语?.school_rank || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="英语班级排名" width="80">
                  <template #default="{ row }">
                    {{ row.scores?.英语?.class_rank || '-' }}
                  </template>
                </el-table-column>
                <!-- 物理模块 -->
                <el-table-column label="物理" width="55">
                  <template #default="{ row }">
                    {{ row.scores?.物理?.raw || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="物理排名" width="70">
                  <template #default="{ row }">
                    {{ row.scores?.物理?.school_rank || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="物理班级排名" width="80">
                  <template #default="{ row }">
                    {{ row.scores?.物理?.class_rank || '-' }}
                  </template>
                </el-table-column>
                <!-- 化学模块 -->
                <el-table-column label="化学" width="55">
                  <template #default="{ row }">
                    {{ row.scores?.化学?.raw || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="化学赋分" width="60" v-show="showAssignScores">
                  <template #default="{ row }">
                    {{ row.scores?.化学?.assign || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="化学排名" width="70">
                  <template #default="{ row }">
                    {{ row.scores?.化学?.school_rank || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="化学赋分排名" width="80" v-show="showAssignScores">
                  <template #default="{ row }">
                    {{ row.scores?.化学?.assign_rank || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="化学班级排名" width="80">
                  <template #default="{ row }">
                    {{ row.scores?.化学?.class_rank || '-' }}
                  </template>
                </el-table-column>
                <!-- 生物模块 -->
                <el-table-column label="生物" width="55">
                  <template #default="{ row }">
                    {{ row.scores?.生物?.raw || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="生物赋分" width="60" v-show="showAssignScores">
                  <template #default="{ row }">
                    {{ row.scores?.生物?.assign || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="生物排名" width="70">
                  <template #default="{ row }">
                    {{ row.scores?.生物?.school_rank || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="生物赋分排名" width="80" v-show="showAssignScores">
                  <template #default="{ row }">
                    {{ row.scores?.生物?.assign_rank || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="生物班级排名" width="80">
                  <template #default="{ row }">
                    {{ row.scores?.生物?.class_rank || '-' }}
                  </template>
                </el-table-column>
                <!-- 政治模块 -->
                <el-table-column label="政治" width="55">
                  <template #default="{ row }">
                    {{ row.scores?.政治?.raw || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="政治赋分" width="60" v-show="showAssignScores">
                  <template #default="{ row }">
                    {{ row.scores?.政治?.assign || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="政治排名" width="70">
                  <template #default="{ row }">
                    {{ row.scores?.政治?.school_rank || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="政治赋分排名" width="80" v-show="showAssignScores">
                  <template #default="{ row }">
                    {{ row.scores?.政治?.assign_rank || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="政治班级排名" width="80">
                  <template #default="{ row }">
                    {{ row.scores?.政治?.class_rank || '-' }}
                  </template>
                </el-table-column>
                <!-- 历史模块 -->
                <el-table-column label="历史" width="55">
                  <template #default="{ row }">
                    {{ row.scores?.历史?.raw || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="历史排名" width="70">
                  <template #default="{ row }">
                    {{ row.scores?.历史?.school_rank || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="历史班级排名" width="80">
                  <template #default="{ row }">
                    {{ row.scores?.历史?.class_rank || '-' }}
                  </template>
                </el-table-column>
                <!-- 地理模块 -->
                <el-table-column label="地理" width="55">
                  <template #default="{ row }">
                    {{ row.scores?.地理?.raw || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="地理赋分" width="60" v-show="showAssignScores">
                  <template #default="{ row }">
                    {{ row.scores?.地理?.assign || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="地理排名" width="70">
                  <template #default="{ row }">
                    {{ row.scores?.地理?.school_rank || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="地理赋分排名" width="80" v-show="showAssignScores">
                  <template #default="{ row }">
                    {{ row.scores?.地理?.assign_rank || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="地理班级排名" width="80">
                  <template #default="{ row }">
                    {{ row.scores?.地理?.class_rank || '-' }}
                  </template>
                </el-table-column>
              </el-table>
              <div style="margin-top: 10px; font-size: 12px; color: #909399">
                共 {{ parseResult.data?.students?.length || 0 }} 条数据，可左右滑动查看更多列
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤3: 学生匹配 -->
        <div v-show="step === 3" class="step-match">
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
                  <div class="match-stat-value" style="color: #f56c6c">{{ matchResult.unmatched?.length || 0 }}</div>
                  <div class="match-stat-label">未匹配</div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 已匹配列表 -->
            <el-collapse v-if="matchResult.matched?.length > 0" v-model="activeMatchCollapse" style="margin-bottom: 15px">
              <el-collapse-item title="已匹配学生 (点击展开)" name="matched">
                <el-table :data="matchResult.matched" size="small" max-height="200">
                  <el-table-column prop="name" label="姓名" width="80" />
                  <el-table-column prop="student_no" label="考号" width="120" />
                  <el-table-column prop="class_name" label="班级" width="100" />
                  <el-table-column prop="matched_student_id" label="学生ID" width="80" />
                  <el-table-column prop="match_method" label="匹配方式" width="100">
                    <template #default="{ row }">
                      <el-tag size="small" type="success">{{ row.match_method }}</el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </el-collapse-item>
            </el-collapse>

            <!-- 未匹配列表 -->
            <el-collapse v-if="matchResult.unmatched?.length > 0" v-model="activeUnmatchCollapse">
              <el-collapse-item title="未匹配学生 (需要手动匹配)" name="unmatched">
                <el-table :data="matchResult.unmatched" size="small" max-height="200">
                  <el-table-column prop="name" label="姓名" width="80" />
                  <el-table-column prop="student_no" label="考号" width="120" />
                  <el-table-column prop="student_id" label="学籍号" width="120" />
                  <el-table-column prop="class_name" label="班级" width="100" />
                  <el-table-column label="操作" width="100">
                    <template #default="{ row }">
                      <el-button type="primary" size="small" link @click="openMatchDialog(row)">手动匹配</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>

        <!-- 步骤4: 保存到临时表 -->
        <div v-show="step === 4" class="step-save">
          <el-result
            icon="success"
            title="导入成功"
            :sub-title="`已将 ${savedCount} 条数据保存到临时表，可在前台页面确认或放弃`"
          >
            <template #extra>
              <el-button type="primary" @click="goToTempList">查看临时表</el-button>
            </template>
          </el-result>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="dialog-footer">
        <el-button @click="closeImportDialog">取消</el-button>
        <el-button v-if="step > 0 && step < 5" @click="prevStep">上一步</el-button>
        <el-button v-if="step === 0" type="primary" :disabled="!selectedExamId" @click="nextToSystem">下一步</el-button>
        <el-button v-if="step === 1" type="primary" :disabled="!selectedSystem" @click="nextToUpload">下一步</el-button>
        <el-button v-if="step === 2" type="primary" :disabled="!currentFile" @click="doParse">开始解析</el-button>
        <el-button v-if="step === 3 && parseResult?.success" type="primary" @click="doMatch">匹配学生</el-button>
        <el-button v-if="step === 4 && matchResult?.success" type="primary" @click="saveToTemp">保存到临时表</el-button>
      </div>
    </el-dialog>

    <!-- 手动匹配对话框 -->
    <el-dialog v-model="manualMatchVisible" title="手动匹配学生" width="500px">
      <div style="margin-bottom: 10px">
        当前未匹配: <strong>{{ currentUnmatchedRow?.name }}</strong> ({{ currentUnmatchedRow?.class_name }})
      </div>
      <el-input v-model="studentSearch" placeholder="搜索学生姓名/考号" clearable @input="searchStudent" style="margin-bottom: 10px" />
      <el-table :data="studentOptions" height="300" style="margin-top: 10px" @row-click="selectStudent" highlight-current-row>
        <el-table-column prop="name" label="姓名" width="80" />
        <el-table-column prop="studentNo" label="考号" width="120" />
        <el-table-column prop="studentId" label="学籍号" width="120" />
        <el-table-column prop="className" label="班级" width="100" />
      </el-table>
    </el-dialog>

    <!-- 重复数据确认对话框 -->
    <el-dialog v-model="showDuplicateDialog" title="检测到重复数据" width="500px">
      <el-alert type="warning" :closable="false" style="margin-bottom: 15px">
        检测到该考试已有 <strong>{{ duplicateCount }}</strong> 名学生的成绩记录
      </el-alert>
      <div style="max-height: 300px; overflow-y: auto">
        <el-table :data="duplicateStudents" size="small" border>
          <el-table-column prop="studentName" label="姓名" width="100" />
          <el-table-column prop="studentNo" label="考号" width="150" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="handleDuplicateAction('cancel')">取消</el-button>
        <el-button type="warning" @click="handleDuplicateAction('skip')">跳过</el-button>
        <el-button type="primary" @click="handleDuplicateAction('overwrite')">覆盖</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, UploadFilled, Loading } from '@element-plus/icons-vue'
import { previewImport, confirmImport, cancelImport, manualMatch as manualMatchApi, getStudentsForMatch, parseExcel, matchStudents, checkDuplicate } from '@/api/score-import'
import { getExamList, createExam } from '@/api/exam'
import { getGradeList } from '@/api/grade'

const router = useRouter()

const loading = ref(false)
const isMobile = ref(window.innerWidth < 768)
const tableData = ref<any[]>([])
const stats = reactive<Record<number, number>>({})
const searchKeyword = ref('')
const filterStatus = ref<number | undefined>(undefined)
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// 导入流程
const importDialogVisible = ref(false)
const step = ref(0)

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
const parseResult = ref<any>(null)
const matchResult = ref<any>(null)
const savedCount = ref(0)

// 手动匹配
const manualMatchVisible = ref(false)
const currentUnmatchedRow = ref<any>(null)
const studentSearch = ref('')
const studentOptions = ref<any[]>([])
const allStudents = ref<any[]>([])

// 折叠面板
const activeMatchCollapse = ref(['matched'])
const activeUnmatchCollapse = ref(['unmatched'])

// Python API
const PYTHON_API = import.meta.env.VITE_PYTHON_API || 'http://localhost:8000/api/v1'

const totalCount = computed(() => {
  return (stats[0] || 0) + (stats[1] || 0) + (stats[2] || 0)
})

// 计算属性
const computedSelectedExam = computed(() => {
  if (!selectedExamId.value) return null
  return examList.value.find(e => e.id === selectedExamId.value) || null
})

// 是否显示赋分字段（高二、高三才显示）
const showAssignScores = computed(() => {
  const gradeName = computedSelectedExam.value?.gradeName || computedSelectedExam.value?.grade?.gradeName || ''
  return gradeName.includes('高二') || gradeName.includes('高三')
})

// 加载考试和年级列表
const loadExamAndGradeList = async () => {
  try {
    const [examRes, gradeRes] = await Promise.all([
      getExamList({ page: 1, pageSize: 100 }),
      getGradeList({ page: 1, pageSize: 100 })
    ])
    examList.value = examRes.list || []
    gradeList.value = gradeRes.list || []
  } catch (error) { console.error('加载考试/年级失败', error) }
}

// 选择考试
const handleExamChange = (examId: number) => {
  selectedExamId.value = examId
  selectedExam.value = examList.value.find(e => e.id === examId) || null
}

// 创建考试
const handleCreateExam = async () => {
  if (!newExam.examName || !newExam.gradeId) {
    ElMessage.warning('请填写考试名称和选择年级')
    return
  }
  try {
    const res = await createExam(newExam)
    ElMessage.success('考试创建成功')
    showCreateExam.value = false
    // 重置表单
    newExam.examName = ''
    newExam.examDate = ''
    newExam.gradeId = null
    // 刷新考试列表
    await loadExamAndGradeList()
    // 自动选中新建的考试
    if (res?.id) {
      selectedExamId.value = res.id
      handleExamChange(res.id)
    }
  } catch (error) { ElMessage.error('创建考试失败') }
}

onMounted(() => {
  loadData()
  loadStudents()
  loadExamAndGradeList()
})

const loadData = async () => {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (filterStatus.value !== undefined) params.status = filterStatus.value
    const res: any = await previewImport(params)
    tableData.value = res.list || []
    pagination.total = res.total || 0
    const totalStats = res.stats || {}
    Object.assign(stats, { 0: totalStats['0'] || 0, 1: totalStats['1'] || 0, 2: totalStats['2'] || 0 })
  } catch (error) { console.error('加载失败', error) }
  finally { loading.value = false }
}

const loadStudents = async () => {
  try {
    const res: any = await getStudentsForMatch()
    allStudents.value = res || []
    studentOptions.value = allStudents.value
  } catch (error) { console.error('加载学生失败', error) }
}

const handleFilter = () => { pagination.page = 1; loadData() }
const handleSearch = () => { pagination.page = 1; loadData() }

const openImportDialog = () => {
  step.value = 0
  currentFile.value = null
  parseResult.value = null
  matchResult.value = null
  selectedExamId.value = null
  selectedExam.value = null
  selectedSystem.value = ''
  importDialogVisible.value = true
  // 刷新考试列表
  loadExamAndGradeList()
}

const closeImportDialog = () => {
  importDialogVisible.value = false
  if (step.value === 5) loadData()
}

const handleFileChange = (file: any) => {
  currentFile.value = file.raw
}

// 步骤导航
const nextToSystem = () => {
  if (!selectedExamId.value) {
    ElMessage.warning('请先选择考试')
    return
  }
  step.value = 1
}

const nextToUpload = () => {
  if (!selectedSystem.value) {
    ElMessage.warning('请先选择成绩系统')
    return
  }
  step.value = 2
}

const prevStep = () => {
  if (step.value > 0) {
    step.value--
  }
}

const doParse = async () => {
  if (!currentFile.value) return
  parsing.value = true
  parseProgress.value = 0

  // 模拟进度（实际解析在后端进行）
  const progressInterval = setInterval(() => {
    if (parseProgress.value < 90) {
      parseProgress.value += 10
    }
  }, 300)

  try {
    const res: any = await parseExcel(currentFile.value, selectedSystem.value)
    const data = res.data || res
    parseResult.value = data
    if (data.success) {
      parseProgress.value = 100
      step.value = 3
    }
  } catch (error: any) {
    ElMessage.error('解析失败: ' + error.message)
    parseProgress.value = 0
  } finally {
    clearInterval(progressInterval)
    parsing.value = false
    setTimeout(() => { parseProgress.value = 0 }, 500)
  }
}

const doMatch = async () => {
  const students = parseResult.value?.data?.students
  if (!students || students.length === 0) {
    ElMessage.warning('没有可匹配的学生数据')
    return
  }

  if (!allStudents.value || allStudents.value.length === 0) {
    ElMessage.warning('请先加载学生列表')
    return
  }

  matching.value = true
  matchProgress.value = 0

  // 模拟进度
  const progressInterval = setInterval(() => {
    if (matchProgress.value < 90) {
      matchProgress.value += 15
    }
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

    // 调用后端 API (后端会转发给 Python 微服务)
    const res: any = await matchStudents(allStudents.value, importStudents)
    const data = res.data || res
    matchResult.value = data
    if (data.success) {
      matchProgress.value = 100
      step.value = 4
    }
  } catch (error: any) {
    ElMessage.error('匹配失败: ' + error.message)
    matchProgress.value = 0
  } finally {
    clearInterval(progressInterval)
    matching.value = false
    setTimeout(() => { matchProgress.value = 0 }, 500)
  }
}

const saveToTemp = async () => {
  if (!selectedExamId.value) {
    ElMessage.warning('请先选择考试')
    return
  }

  const matchedStudents = matchResult.value?.matched || []
  const studentIds = matchedStudents.map((s: any) => s.matched_student_id).filter(Boolean)

  if (studentIds.length === 0) {
    ElMessage.warning('没有匹配的学生数据')
    return
  }

  try {
    // 检查是否有重复数据
    const checkRes: any = await checkDuplicate(selectedExamId.value, studentIds)
    const checkData = checkRes.data || checkRes

    if (checkData.exists) {
      // 弹出确认对话框
      showDuplicateDialog.value = true
      duplicateStudents.value = checkData.students || []
      duplicateCount.value = checkData.count || 0
    } else {
      // 没有重复，直接保存
      await doSaveToTemp()
    }
  } catch (error: any) {
    ElMessage.error('检查重复数据失败: ' + error.message)
  }
}

// 执行保存到临时表
const doSaveToTemp = async (overwrite: boolean = false) => {
  // TODO: 调用后端保存到临时表（需要传入 examId 和 overwrite 参数）
  savedCount.value = (matchResult.value.matched?.length || 0) + (matchResult.value.unmatched?.length || 0)
  step.value = 5
  showDuplicateDialog.value = false
  ElMessage.success('数据已保存到临时表')
}

// 处理重复数据选项
const handleDuplicateAction = async (action: 'overwrite' | 'skip' | 'cancel') => {
  if (action === 'cancel') {
    showDuplicateDialog.value = false
    return
  }
  await doSaveToTemp(action === 'overwrite')
}

// 重复数据对话框
const showDuplicateDialog = ref(false)
const duplicateStudents = ref<any[]>([])
const duplicateCount = ref(0)

const goToTempList = () => {
  closeImportDialog()
}

const openMatchDialog = (row: any) => {
  currentUnmatchedRow.value = row
  studentSearch.value = ''
  studentOptions.value = allStudents.value
  manualMatchVisible.value = true
}

const searchStudent = () => {
  if (!studentSearch.value) {
    studentOptions.value = allStudents.value
    return
  }
  const keyword = studentSearch.value.toLowerCase()
  studentOptions.value = allStudents.value.filter(s =>
    s.name?.includes(keyword) || s.studentNo?.includes(keyword) || s.studentId?.includes(keyword)
  )
}

const selectStudent = async (row: any) => {
  if (!currentUnmatchedRow.value) return
  // 临时处理：直接匹配成功
  manualMatchVisible.value = false
  ElMessage.success('匹配成功')
}

const handleManualMatch = (row: any) => {
  openMatchDialog({ name: row.student?.name || row.name, class_name: row.className })
}

const handleConfirmSingle = async (row: any) => {
  try {
    await confirmImport(row.importBatch)
    ElMessage.success('导入成功')
    loadData()
  } catch (error: any) { ElMessage.error(error.message || '导入失败') }
}

const handleCancelSingle = async (row: any) => {
  try {
    await cancelImport(row.importBatch)
    ElMessage.success('已放弃')
    loadData()
  } catch (error: any) { ElMessage.error(error.message || '操作失败') }
}
</script>

<style scoped>
.score-import-temp { padding: 20px; }
.toolbar { margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; }
.stats-row { margin-bottom: 20px; }
.stat-card { text-align: center; }
.stat-value { font-size: 24px; font-weight: bold; color: #409eff; }
.stat-label { font-size: 14px; color: #909399; margin-top: 5px; }
:deep(.el-table) { table-layout: auto !important; width: 100% !important; }
.action-buttons { display: flex; gap: 4px; }
.action-buttons .el-button { padding: 4px 8px; font-size: 13px; }

.step-content { min-height: 300px; padding: 10px 0; }
.step-upload { text-align: center; padding: 40px 0; }
.upload-center { width: 100%; max-width: 500px; margin: 0 auto; }
.parse-loading, .match-loading { text-align: center; padding: 40px 0; color: #909399; }
.parse-loading .el-icon, .match-loading .el-icon { margin-bottom: 10px; }
.subject-list { display: flex; flex-wrap: wrap; gap: 5px; }
.match-stat { text-align: center; }
.match-stat-value { font-size: 28px; font-weight: bold; }
.match-stat-label { font-size: 14px; color: #909399; margin-top: 5px; }

.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 20px; border-top: 1px solid #eee; }

@media (max-width: 768px) {
  .score-import-temp { padding: 12px; }
  :deep(.el-dialog) { width: 95% !important; margin: 10px !important; }
}
</style>