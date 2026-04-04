<template>
  <div class="class-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增班级</el-button>
      <el-button @click="loadData">刷新</el-button>
      <el-button @click="handleExport">导出</el-button>
      <el-upload
        :show-file-list="false"
        :auto-upload="false"
        :on-change="handleImport"
        accept=".xlsx,.xls"
      >
        <el-button>导入</el-button>
      </el-upload>
    </div>

    <!-- 桌面端表格 -->
    <el-table v-if="!isMobile" :data="tableData" v-loading="loading" stripe :header-cell-style="{background: '#f5f7fa'}" fit>
      <el-table-column type="selection" width="55" />
      <el-table-column prop="classNo" label="班级编号" width="80" />
      <el-table-column prop="className" label="班级名称" />
      <el-table-column prop="grade.gradeName" label="年级" />
      <el-table-column prop="grade.entranceYear" label="入学年份" width="90" />
      <el-table-column prop="grade.schoolYear" label="学年" width="100" />
      <el-table-column prop="grade.semester" label="学期" width="80" />
      <el-table-column prop="studentCount" label="人数" width="60" />
      <el-table-column prop="status" label="状态" width="70">
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
          <span class="mobile-card-label">班级编号</span>
          <span class="mobile-card-value">{{ row.classNo }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">班级名称</span>
          <span class="mobile-card-value">{{ row.className }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">年级</span>
          <span class="mobile-card-value">{{ row.grade?.gradeName || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">学年</span>
          <span class="mobile-card-value">{{ row.grade?.schoolYear || '-' }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">学生人数</span>
          <span class="mobile-card-value">{{ row.studentCount }}</span>
        </div>
        <div class="mobile-card-item">
          <span class="mobile-card-label">状态</span>
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
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
    <el-empty v-if="!loading && tableData.length === 0" description="暂无班级数据">
      <el-button type="primary" @click="handleAdd">新增班级</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑班级' : '新增班级'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="班级编号" prop="classNo">
          <el-input-number v-model="form.classNo" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="所属年级" prop="gradeId">
          <el-select v-model="form.gradeId" placeholder="请选择年级">
            <el-option v-for="g in gradeList" :key="g.id" :label="g.gradeName" :value="g.id" />
          </el-select>
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
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getClassList, createClass, updateClass, deleteClass, getGradeList } from '@/api/class'
import { exportToExcel, importFromExcel } from '@/utils/excel'

const loading = ref(false)
const isMobile = ref(window.innerWidth < 768)
const tableData = ref<any[]>([])
const gradeList = ref<any[]>([])
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
  loadGrades()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const form = reactive({ classNo: 1, gradeId: undefined as number | undefined, status: 1 })

const rules: FormRules = { classNo: [{ required: true, message: '请输入班级编号', trigger: 'blur' }], gradeId: [{ required: true, message: '请选择年级', trigger: 'change' }] }

const loadData = async () => {
  loading.value = true
  try {
    const res = await getClassList({ page: pagination.page, pageSize: pagination.pageSize })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) { console.error('加载失败', error) }
  finally { loading.value = false }
}

const loadGrades = async () => {
  try { const res = await getGradeList({ page: 1, pageSize: 100 }); gradeList.value = res.list || [] } catch (error) { console.error('加载年级失败', error) }
}

const handleAdd = () => {
  isEdit.value = false; form.classNo = 1; form.gradeId = undefined; form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true; editId.value = row.id
  form.classNo = row.classNo; form.gradeId = row.gradeId; form.status = row.status
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isEdit.value) { await updateClass(editId.value, form); ElMessage.success('更新成功') }
        else { await createClass(form); ElMessage.success('创建成功') }
        dialogVisible.value = false; loadData()
      } catch (error: any) { ElMessage.error(error.message || '保存失败') }
      finally { loading.value = false }
    }
  })
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除班级 "${row.className}" 吗？\n\n注意：该操作将同时删除该班级下的所有学生及其成绩记录。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    await deleteClass(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) { if (error !== 'cancel') ElMessage.error(error.message || '删除失败') }
}

const handleExport = () => {
  const exportData = tableData.value.map(row => ({
    班级编号: row.classNo,
    班级名称: row.className,
    年级: row.grade?.gradeName || '',
    入学年份: row.grade?.entranceYear || '',
    学年: row.grade?.schoolYear || '',
    学期: row.grade?.semester || '',
    学生人数: row.studentCount,
    状态: row.status === 1 ? '启用' : '禁用'
  }))
  exportToExcel(exportData, '班级数据')
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
        // 查找匹配的年级
        const grade = gradeList.value.find(g => g.gradeName === item.年级)
        if (!grade) {
          console.warn('找不到年级:', item.年级)
          continue
        }

        await createClass({
          classNo: Number(item.班级编号) || 1,
          gradeId: grade.id,
          status: item.状态 === '启用' ? 1 : 0
        })
        successCount++
      } catch (e) {
        console.error('导入班级失败:', e)
      }
    }

    ElMessage.success(`成功导入 ${successCount} 条数据`)
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败')
  }
}

onMounted(() => { loadData(); loadGrades() })
</script>

<style scoped>
.class-management { padding: 20px; }
.toolbar { margin-bottom: 20px; display: flex; gap: 10px; }

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
  :deep(.el-dialog) { width: 90% !important; margin: 10px !important; }

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

  :deep(.el-pagination) {
    --el-pagination-button-width: 28px;
    --el-pagination-button-height: 28px;
  }

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