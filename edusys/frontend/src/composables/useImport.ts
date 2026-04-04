import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ImportConfig, ImportRow, ParseResult, PreviewResult, ImportResult } from '@/types/import'
import request from '@/utils/request'

/**
 * 通用导入 Hook
 * 提供统一的导入流程逻辑
 */
export function useImport(config: ImportConfig) {
  // 状态
  const step = ref(0) // 0:上传 1:预览 2:确认 3:完成
  const loading = ref(false)
  const parsing = ref(false)
  const importing = ref(false)
  const progress = ref(0)

  // 数据
  const currentFile = ref<File | null>(null)
  const parseResult = ref<ParseResult | null>(null)
  const previewResult = ref<PreviewResult | null>(null)
  const importResult = ref<ImportResult | null>(null)
  const batch = ref('')

  // 筛选
  const filterStatus = ref<string>('all') // all, valid, invalid, new, update

  // 计算属性
  const filteredData = computed(() => {
    if (!parseResult.value?.data) return []

    const data = parseResult.value.data

    switch (filterStatus.value) {
      case 'valid':
        return data.filter(d => d.status === 'valid')
      case 'invalid':
        return data.filter(d => d.status === 'invalid')
      case 'new':
        return data.filter(d => d.isNew)
      case 'update':
        return data.filter(d => d.isUpdate)
      default:
        return data
    }
  })

  const stats = computed(() => {
    if (!parseResult.value?.data) {
      return { total: 0, valid: 0, invalid: 0, newCount: 0, updateCount: 0 }
    }

    const data = parseResult.value.data
    return {
      total: data.length,
      valid: data.filter(d => d.status === 'valid').length,
      invalid: data.filter(d => d.status === 'invalid').length,
      newCount: data.filter(d => d.isNew).length,
      updateCount: data.filter(d => d.isUpdate).length
    }
  })

  // 选择文件
  const handleFileSelect = (file: File) => {
    currentFile.value = file
    step.value = 0
    parseResult.value = null
    previewResult.value = null
    importResult.value = null
  }

  // 解析文件
  const handleParse = async () => {
    if (!currentFile.value) {
      ElMessage.warning('请选择文件')
      return
    }

    parsing.value = true

    try {
      const formData = new FormData()
      formData.append('file', currentFile.value)
      formData.append('module', config.module)

      const res: any = await request({
        url: config.api.parse,
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      })

      const result = res.data || res
      batch.value = result.batch
      parseResult.value = result
      step.value = 1
    } catch (error: any) {
      ElMessage.error(error.message || '解析失败')
    } finally {
      parsing.value = false
    }
  }

  // 预览数据
  const handlePreview = async (page = 1, pageSize = 20) => {
    if (!batch.value) return

    loading.value = true
    try {
      const res: any = await request({
        url: config.api.preview,
        method: 'get',
        params: { batch: batch.value, page, pageSize }
      })
      previewResult.value = res.data || res
    } catch (error: any) {
      ElMessage.error(error.message || '加载预览数据失败')
    } finally {
      loading.value = false
    }
  }

  // 确认导入
  const handleConfirm = async () => {
    if (!batch.value) return

    // 确认提示
    try {
      await ElMessageBox.confirm(
        `即将导入 ${stats.value.total} 条数据，其中新增 ${stats.value.newCount} 条，更新 ${stats.value.updateCount} 条。`,
        '确认导入',
        { type: 'warning' }
      )
    } catch {
      return
    }

    importing.value = true
    progress.value = 0

    try {
      const res: any = await request({
        url: config.api.confirm,
        method: 'post',
        data: { batch: batch.value },
        timeout: 0 // 不限制超时
      })

      const result = res.data || res
      importResult.value = result
      step.value = 3

      if (result.success) {
        ElMessage.success(`导入成功：成功 ${result.successCount} 条，失败 ${result.failedCount} 条`)
      } else {
        ElMessage.warning(`导入完成：成功 ${result.successCount} 条，失败 ${result.failedCount} 条`)
      }
    } catch (error: any) {
      ElMessage.error(error.message || '导入失败')
    } finally {
      importing.value = false
      progress.value = 100
    }
  }

  // 取消导入
  const handleCancel = async () => {
    if (!batch.value) return

    try {
      await ElMessageBox.confirm('确定要取消导入吗？已解析的数据将被清除。', '取消导入', { type: 'warning' })
    } catch {
      return
    }

    try {
      await request({
        url: config.api.cancel,
        method: 'post',
        data: { batch: batch.value }
      })
      reset()
      ElMessage.info('已取消导入')
    } catch (error: any) {
      ElMessage.error(error.message || '取消失败')
    }
  }

  // 下载模板
  const handleDownloadTemplate = () => {
    // 生成模板数据（两行：第一行是表头，第二行是示例）
    const headers = config.fields.map(f => f.label)
    const exampleRow = config.fields.map(f => f.example || '')

    // 使用 utils/excel 的导出功能
    import('@/utils/excel').then(({ exportToExcel }) => {
      const data = [headers, exampleRow]
      exportToExcel(data, config.templateName, '模板')
    })
  }

  // 导出错误报告
  const handleExportError = () => {
    if (!importResult.value?.failedData) return

    import('@/utils/excel').then(({ exportToExcel }) => {
      const headers = config.fields.map(f => f.label)
      const data = [headers]

      importResult.value.failedData!.forEach(row => {
        const rowData = config.fields.map(f => row.data[f.key] || '')
        data.push(rowData)
      })

      exportToExcel(data, `${config.templateName}-错误报告`)
    })
  }

  // 重置
  const reset = () => {
    step.value = 0
    loading.value = false
    parsing.value = false
    importing.value = false
    progress.value = 0
    currentFile.value = null
    parseResult.value = null
    previewResult.value = null
    importResult.value = null
    batch.value = ''
    filterStatus.value = 'all'
  }

  return {
    // 状态
    step,
    loading,
    parsing,
    importing,
    progress,
    filterStatus,

    // 数据
    currentFile,
    parseResult,
    previewResult,
    importResult,
    batch,

    // 计算属性
    filteredData,
    stats,

    // 方法
    handleFileSelect,
    handleParse,
    handlePreview,
    handleConfirm,
    handleCancel,
    handleDownloadTemplate,
    handleExportError,
    reset
  }
}
