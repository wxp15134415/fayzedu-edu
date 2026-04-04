<template>
  <el-dialog
    v-model="visible"
    :title="config.title"
    width="800px"
    :close-on-click-modal="false"
    @closed="handleClose"
  >
    <!-- 步骤条 -->
    <el-steps :active="step" finish-status="success" simple style="margin-bottom: 20px">
      <el-step title="上传文件" />
      <el-step title="预览数据" />
      <el-step title="确认导入" />
      <el-step title="完成" />
    </el-steps>

    <!-- 步骤1: 上传文件 -->
    <div v-show="step === 0" class="step-upload">
      <el-alert
        title="文件格式说明"
        type="info"
        :closable="false"
        style="margin-bottom: 15px"
      >
        <template #default>
          支持 .xlsx、.xls 和 .csv 格式的 Excel 文件。请先
          <el-button type="primary" link @click="handleDownloadTemplate">下载模板</el-button>
          确保数据格式正确。
        </template>
      </el-alert>

      <el-upload
        ref="uploadRef"
        drag
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleFileChange"
        accept=".xlsx,.xls,.csv"
        class="upload-area"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处，或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">支持 xlsx/xls/csv 格式，不超过 10MB</div>
        </template>
      </el-upload>

      <div v-if="currentFile" class="file-info">
        <el-icon><Document /></el-icon>
        <span>{{ currentFile.name }}</span>
        <el-button type="danger" link @click="currentFile = null">删除</el-button>
      </div>

      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="parsing" :disabled="!currentFile" @click="handleParse">
          解析文件
        </el-button>
      </div>
    </div>

    <!-- 步骤2: 预览数据 -->
    <div v-show="step === 1" class="step-preview">
      <!-- 统计信息 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-statistic title="总数据" :value="stats.total" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="有效数据" :value="stats.valid" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="新增" :value="stats.newCount" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="更新" :value="stats.updateCount" />
        </el-col>
      </el-row>

      <!-- 筛选 -->
      <div class="filter-bar">
        <el-radio-group v-model="filterStatus" size="small">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button value="valid">有效</el-radio-button>
          <el-radio-button value="invalid">无效</el-radio-button>
          <el-radio-button value="new">新增</el-radio-button>
          <el-radio-button value="update">更新</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 数据表格 -->
      <el-table
        :data="filteredData.slice(0, 100)"
        v-loading="loading"
        max-height="300"
        stripe
      >
        <el-table-column type="index" width="50" label="序号" />
        <el-table-column
          v-for="field in config.fields"
          :key="field.key"
          :prop="field.key"
          :label="field.label"
          :min-width="100"
        >
          <template #default="{ row }">
            <span v-if="row.status === 'invalid'" class="invalid-cell">
              {{ row.data[field.key] || '-' }}
              <el-tooltip :content="row.errorMsg" placement="top">
                <el-icon class="error-icon"><WarningFilled /></el-icon>
              </el-tooltip>
            </span>
            <span v-else>{{ row.data[field.key] || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'valid'" type="success" size="small">有效</el-tag>
            <el-tag v-else-if="row.status === 'invalid'" type="danger" size="small">无效</el-tag>
            <el-tag v-else-if="row.isNew" type="primary" size="small">新增</el-tag>
            <el-tag v-else-if="row.isUpdate" type="warning" size="small">更新</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="filteredData.length > 100" class="table-tip">
        仅显示前 100 条，更多数据可在确认导入时处理
      </div>

      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button @click="visible = false">关闭</el-button>
        <el-button
          type="primary"
          :disabled="stats.valid === 0"
          @click="step = 2"
        >
          下一步
        </el-button>
      </div>
    </div>

    <!-- 步骤3: 确认导入 -->
    <div v-show="step === 2" class="step-confirm">
      <el-result
        icon="warning"
        title="确认导入"
      >
        <template #sub-title>
          <p>即将导入以下数据：</p>
          <ul>
            <li>总数据：{{ stats.total }} 条</li>
            <li>新增：{{ stats.newCount }} 条</li>
            <li>更新：{{ stats.updateCount }} 条</li>
          </ul>
        </template>
      </el-result>

      <!-- 进度条 -->
      <el-progress
        v-if="importing"
        :percentage="progress"
        :status="progress === 100 ? 'success' : undefined"
        :indeterminate="progress === 0"
        :stroke-width="20"
      />

      <div class="dialog-footer">
        <el-button @click="step = 1">上一步</el-button>
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          :loading="importing"
          @click="handleConfirm"
        >
          确认导入
        </el-button>
      </div>
    </div>

    <!-- 步骤4: 完成 -->
    <div v-show="step === 3" class="step-result">
      <el-result
        :icon="importResult?.success ? 'success' : 'warning'"
        :title="importResult?.success ? '导入成功' : '导入完成'"
      >
        <template #sub-title>
          <p v-if="importResult">
            成功：{{ importResult.successCount }} 条，失败：{{ importResult.failedCount }} 条
          </p>
          <p v-if="importResult?.failedCount > 0" class="error-tip">
            导入过程中有 {{ importResult.failedCount }} 条数据失败，可导出错误报告查看详情。
          </p>
        </template>
        <template #extra>
          <el-button
            v-if="importResult?.failedCount"
            type="warning"
            @click="handleExportError"
          >
            导出错误报告
          </el-button>
          <el-button type="primary" @click="visible = false">完成</el-button>
        </template>
      </el-result>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { UploadFilled, Document, WarningFilled } from '@element-plus/icons-vue'
import { useImport } from '@/composables/useImport'
import type { ImportConfig } from '@/types/import'

const props = defineProps<{
  modelValue: boolean
  config: ImportConfig
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': [result: any]
}>()

const visible = ref(false)
const uploadRef = ref()

// 使用通用导入 Hook
const {
  step,
  loading,
  parsing,
  importing,
  progress,
  filterStatus,
  currentFile,
  parseResult,
  importResult,
  stats,
  filteredData,
  handleFileSelect,
  handleParse,
  handleConfirm,
  handleCancel,
  handleDownloadTemplate,
  handleExportError,
  reset
} = useImport(props.config)

// 监听 visible 变化
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (!val) {
    reset()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 文件变化
const handleFileChange = (file: any) => {
  handleFileSelect(file.raw)
}

// 关闭
const handleClose = () => {
  reset()
}

// 暴露方法给父组件
defineExpose({
  reset
})
</script>

<style scoped>
.step-upload,
.step-preview,
.step-confirm,
.step-result {
  padding: 10px 0;
}

.upload-area {
  margin: 20px 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
}

.stats-row {
  margin-bottom: 15px;
}

.filter-bar {
  margin-bottom: 15px;
}

.table-tip {
  text-align: center;
  color: #909399;
  font-size: 12px;
  margin-top: 10px;
}

.error-tip {
  color: #e6a23c;
}

.invalid-cell {
  display: flex;
  align-items: center;
  gap: 5px;
}

.error-icon {
  color: #f56c6c;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style>