import { request } from '@/utils/request'

// 考试编排管理
export const getExamArrangementList = (params?: any) => {
  return request({
    url: '/exam-arrangement/list',
    method: 'GET',
    params
  })
}

export const getExamArrangement = (id: number) => {
  return request({
    url: `/exam-arrangement/${id}`,
    method: 'GET'
  })
}

export const createExamArrangement = (data: any) => {
  return request({
    url: '/exam-arrangement',
    method: 'POST',
    data
  })
}

export const updateExamArrangement = (id: number, data: any) => {
  return request({
    url: `/exam-arrangement/${id}`,
    method: 'PUT',
    data
  })
}

export const deleteExamArrangement = (id: number) => {
  return request({
    url: `/exam-arrangement/${id}`,
    method: 'DELETE'
  })
}

export const batchDeleteExamArrangement = (ids: number[]) => {
  return request({
    url: '/exam-arrangement/batch-delete',
    method: 'POST',
    data: { ids }
  })
}

// 编排学生 - 根据选择的场次和考点自动分配考场和座位
export const arrangeStudents = (data: {
  examId: number
  sessionId: number
  studentIds: number[]
  venueId: number
}) => {
  return request({
    url: '/exam-arrangement/arrange',
    method: 'POST',
    data
  })
}

// 获取可选择的学生列表
export const getAvailableStudents = (params?: any) => {
  return request({
    url: '/exam-arrangement/available-students',
    method: 'POST',
    data: params
  })
}

// 获取打印数据
export const getPrintData = (examId: number, sessionId: number) => {
  return request({
    url: `/exam-arrangement/print-data/${examId}/${sessionId}`,
    method: 'GET'
  })
}

// 标记已打印
export const markPrinted = (ids: number[]) => {
  return request({
    url: '/exam-arrangement/mark-printed',
    method: 'POST',
    data: { ids }
  })
}

// 生成编排 - 自动分配考场和座位
export const generateExamArrangement = (data: {
  examId: number
  sessionId: number
  venueId: number
}) => {
  return request({
    url: '/exam-arrangement/generate',
    method: 'POST',
    data
  })
}

// 生成考试号 - 支持多种参数
export const generateExamNo = (data: {
  examId: number
  classIds?: number[]
  rule?: number
}) => {
  return request({
    url: '/exam-arrangement/generate-exam-no',
    method: 'POST',
    data
  })
}

// 获取编排统计
export const getExamArrangementStats = (examId: number) => {
  return request({
    url: `/exam-arrangement/stats/${examId}`,
    method: 'GET'
  })
}

// 获取打印入场证数据
export const getPrintAdmission = (params: {
  examId: number
  sessionId: number
  venueId?: number
}) => {
  return request({
    url: `/exam-arrangement/print-admission/${params.examId}/${params.sessionId}`,
    method: 'GET',
    params: params.venueId ? { venueId: params.venueId } : undefined
  })
}

// 获取打印签到表数据
export const getPrintCheckin = (params: {
  examId: number
  sessionId: number
  venueId?: number
}) => {
  return request({
    url: `/exam-arrangement/print-checkin/${params.examId}/${params.sessionId}`,
    method: 'GET',
    params: params.venueId ? { venueId: params.venueId } : undefined
  })
}