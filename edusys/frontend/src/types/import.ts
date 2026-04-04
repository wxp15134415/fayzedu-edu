// 通用导入类型定义
export type ImportStatus = 'pending' | 'parsing' | 'preview' | 'confirming' | 'success' | 'error'

// 字段验证类型
export interface FieldValidation {
  key: string // 字段key
  label: string // 显示标签
  required: boolean
  type?: 'string' | 'number' | 'date' | 'email' | 'phone' | 'idCard'
  pattern?: RegExp
  min?: number
  max?: number
  example?: string // 示例值
}

// 导入配置
export interface ImportConfig {
  module: string // 模块名：teacher, student, class 等
  title: string // 导入对话框标题
  templateName: string // 模板文件名
  fields: FieldValidation[] // 字段配置
  uniqueFields: string[] // 唯一字段，用于判断重复
  api: {
    parse: string // 解析接口
    preview: string // 预览接口
    confirm: string // 确认导入接口
    cancel: string // 取消导入接口
  }
}

// 单行导入数据
export interface ImportRow {
  id?: number
  data: Record<string, any>
  status: 'pending' | 'valid' | 'invalid' | 'success' | 'failed'
  errorMsg?: string
  isNew?: boolean // 是否新数据
  isUpdate?: boolean // 是否更新数据
}

// 解析结果
export interface ParseResult {
  batch: string
  total: number
  headers: string[]
  data: ImportRow[]
}

// 预览结果
export interface PreviewResult {
  batch: string
  total: number
  valid: number
  invalid: number
  newCount: number
  updateCount: number
  data: ImportRow[]
}

// 导入结果
export interface ImportResult {
  success: boolean
  total: number
  successCount: number
  failedCount: number
  errors: Array<{ row: number; message: string }>
  failedData?: ImportRow[] // 失败的行数据，用于导出错误报告
}

// 模板字段
export interface TemplateField {
  key: string
  label: string
  required: boolean
  type: 'string' | 'number' | 'date'
  example?: string
}
