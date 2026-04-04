import type { ImportConfig } from '@/types/import'

/**
 * 教师导入配置
 */
export const teacherImportConfig: ImportConfig = {
  module: 'teacher',
  title: '导入教师',
  templateName: '教师导入模板',
  fields: [
    { key: 'teacherNo', label: '工号', required: true, type: 'string', example: 'T001' },
    { key: 'teacherId', label: '教工号', required: false, type: 'string', example: '' },
    { key: 'name', label: '姓名', required: true, type: 'string', example: '张三' },
    { key: 'idCard', label: '身份证号', required: false, type: 'idCard', example: '110101199001011234' },
    { key: 'gender', label: '性别', required: true, type: 'string', example: '男' },
    { key: 'phone', label: '手机号', required: false, type: 'phone', example: '13800138000' },
    { key: 'email', label: '邮箱', required: false, type: 'email', example: 'teacher@example.com' },
    { key: 'subject', label: '任教科目', required: false, type: 'string', example: '数学' },
    { key: 'education', label: '学历', required: false, type: 'string', example: '本科' },
    { key: 'position', label: '岗位', required: false, type: 'string', example: '专任教师' },
    { key: 'title', label: '职称', required: false, type: 'string', example: '一级教师' }
  ],
  uniqueFields: ['teacherNo', 'idCard'],
  api: {
    parse: '/import/parse',
    preview: '/import/preview',
    confirm: '/import/confirm',
    cancel: '/import/cancel'
  }
}
