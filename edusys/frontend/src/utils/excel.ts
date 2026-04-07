import * as XLSX from 'xlsx'
import { ElMessage } from 'element-plus'

// ============ 复用工具函数 ============

/**
 * 格式化日期为文件名友好格式
 */
const formatDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  return `${year}${month}${day}${hour}${minute}`
}

/**
 * 格式化性别显示
 * @param gender 性别值，支持：'1', '2', '男', '女'
 * @param fallback 空值时的显示文本
 */
export const formatGender = (gender: string | number, fallback: string = '-'): string => {
  if (gender === '1' || gender === '男') return '男'
  if (gender === '2' || gender === '女') return '女'
  return fallback
}

/**
 * 格式化状态显示
 * @param status 状态值 (0/1 或 '0'/'1')
 * @param labels [禁用文本, 启用文本]
 * @param invert 是否反转标签顺序（用于切换按钮显示）
 */
export const formatStatus = (status: number | string, labels: [string, string] = ['禁用', '启用'], invert: boolean = false): string => {
  const actualLabels = invert ? [labels[1], labels[0]] : labels
  return status === 1 || status === '1' ? actualLabels[1] : actualLabels[0]
}

/**
 * 格式化日期字符串
 * @param date 日期字符串
 * @param fallback 空值时的显示文本
 */
export const formatDateStr = (date: string | undefined, fallback: string = '-'): string => {
  return date || fallback
}

/**
 * 格式化关联对象名称
 * @param obj 关联对象
 */
export const formatRelationName = (obj: any): string => {
  return obj?.name || obj?.className || obj?.gradeName || '-'
}

// ============ 通用导出配置 ============

export interface ExportField {
  key: string           // 导出后的字段名
  source?: string      // 数据源key（默认等于key）
  formatter?: (value: any, row: any) => any  // 格式化函数
}

export interface ExportConfig {
  fields: ExportField[]
  fileName: string
  defaultEmpty?: string
}

/**
 * 通用导出函数
 * @param data 源数据数组
 * @param config 导出配置
 */
export const genericExport = (data: any[], config: ExportConfig): void => {
  const { fields, fileName, defaultEmpty = '' } = config

  const exportData = data.map(row => {
    const obj: Record<string, any> = {}
    for (const field of fields) {
      const sourceKey = field.source || field.key
      let value = row[sourceKey]

      // 应用格式化函数
      if (field.formatter) {
        value = field.formatter(value, row)
      } else if (value === undefined || value === null) {
        value = defaultEmpty
      }

      obj[field.key] = value
    }
    return obj
  })

  exportToExcel(exportData, fileName)
}

// ============ 原有导出函数（保持兼容）===========

/**
 * 导出数据为 Excel 文件
 * @param data 要导出的数据数组
 * @param fileName 文件名（不含扩展名）
 * @param sheetName 工作表名
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  if (!data || data.length === 0) {
    ElMessage.warning('没有数据可导出')
    return
  }

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // 设置列宽
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }))
  worksheet['!cols'] = colWidths

  // 生成文件
  XLSX.writeFile(workbook, `${fileName}_${formatDate()}.xlsx`)
}

/**
 * 从文件导入 Excel 数据
 * @param file HTML 文件输入元素
 * @returns Promise 返回解析后的数据数组
 */
export const importFromExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsBinaryString(file)
  })
}
