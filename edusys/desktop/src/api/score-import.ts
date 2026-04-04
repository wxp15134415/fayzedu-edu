// 成绩导入 API
import request from '@/utils/request'

// 获取学生列表用于匹配
export function getStudentsForMatch() {
  return request({
    url: '/score-import/students-for-match',
    method: 'get'
  })
}

// 解析Excel文件（上传到Python微服务）
export function parseExcel(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/score-import/parse',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
}

// 匹配学生（调用Python微服务）
export function matchStudents(existingStudents: any[], importStudents: any[]) {
  return request({
    url: '/score-import/match',
    method: 'post',
    data: {
      existing_students: existingStudents,
      import_students: importStudents
    }
  })
}

// 预览导入数据
export function previewImport(params: { importBatch: string; page?: number; pageSize?: number; status?: number }) {
  return request({
    url: '/score-import/preview',
    method: 'get',
    params
  })
}

// 确认导入
export function confirmImport(importBatch: string) {
  return request({
    url: '/score-import/confirm',
    method: 'post',
    data: { importBatch }
  })
}

// 放弃导入
export function cancelImport(importBatch: string) {
  return request({
    url: '/score-import/cancel',
    method: 'post',
    data: { importBatch }
  })
}

// 手动匹配学生
export function manualMatch(tempId: number, studentId: number, importBatch: string) {
  return request({
    url: '/score-import/manual-match',
    method: 'post',
    data: { tempId, studentId, importBatch }
  })
}