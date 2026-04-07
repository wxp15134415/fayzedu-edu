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
export function parseExcel(file: File, system?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (system) {
    formData.append('system', system)
  }
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
export function matchStudents(existingStudents: any[], importStudents: any[], examId?: number) {
  return request({
    url: '/score-import/match',
    method: 'post',
    data: {
      existing_students: existingStudents,
      import_students: importStudents,
      exam_id: examId
    }
  })
}

// 预览导入数据
export function previewImport(params: { importBatch?: string; page?: number; pageSize?: number; status?: number; examId?: number }) {
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

// 检查重复数据
export function checkDuplicate(examId: number, studentIds: number[]) {
  return request({
    url: '/score-import/check-duplicate',
    method: 'post',
    data: { examId, studentIds }
  })
}

// 保存到临时表
export function saveToTemp(examId: number, matched: any[], unmatched: any[] = []) {
  return request({
    url: '/score-import/save-to-temp',
    method: 'post',
    data: { examId, matched, unmatched }
  })
}

// 保存到原始成绩表
export function saveToExamScore(examId: number, matched: any[]) {
  return request({
    url: '/score-import/save-to-exam-score',
    method: 'post',
    data: { examId }
  })
}

// 确认原始成绩
export function confirmExamScore(examId: number, importBatch?: string) {
  return request({
    url: '/score-import/confirm-exam-score',
    method: 'post',
    data: { examId, importBatch }
  })
}

// 获取原始成绩列表
export function getExamScoreList(examId: number, status?: number, page?: number, pageSize?: number) {
  return request({
    url: '/score-import/exam-score-list',
    method: 'get',
    params: { examId, status, page, pageSize }
  })
}

// 删除原始成绩记录
export function deleteExamScore(id: number) {
  return request({
    url: `/score-import/exam-score/${id}`,
    method: 'delete'
  })
}

// 删除单条临时记录
export function deleteTemp(id: number) {
  return request({
    url: `/score-import/temp/${id}`,
    method: 'delete'
  })
}