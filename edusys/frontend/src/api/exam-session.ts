import { request } from '@/utils/request'

// 考试场次管理
export const getExamSessionList = (params?: any) => {
  return request({
    url: '/exam-session/list',
    method: 'GET',
    params
  })
}

export const getExamSessionDetail = (id: number) => {
  return request({
    url: `/exam-session/${id}`,
    method: 'GET'
  })
}

export const createExamSession = (data: any) => {
  return request({
    url: '/exam-session',
    method: 'POST',
    data
  })
}

export const updateExamSession = (id: number, data: any) => {
  return request({
    url: `/exam-session/${id}`,
    method: 'PUT',
    data
  })
}

export const deleteExamSession = (id: number) => {
  return request({
    url: `/exam-session/${id}`,
    method: 'DELETE'
  })
}

export const batchCreateExamSession = (data: any) => {
  return request({
    url: '/exam-session/batch',
    method: 'POST',
    data
  })
}

export const getExamSessionsByExam = (examId: number) => {
  return request({
    url: `/exam-session/by-exam/${examId}`,
    method: 'GET'
  })
}

export const updateExamSessionsByExam = (examId: number, subjectList: any[]) => {
  return request({
    url: `/exam-session/by-exam/${examId}`,
    method: 'PUT',
    data: { subjectList }
  })
}

// ==================== 场次扩展API ====================

// 检查考场容量
export const checkSessionCapacity = (examId: number, sessionId?: number) => {
  return request({
    url: `/exam-session/check-capacity/${examId}`,
    method: 'GET',
    params: sessionId ? { sessionId } : undefined
  })
}