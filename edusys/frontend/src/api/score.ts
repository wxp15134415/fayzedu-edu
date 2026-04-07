import { request } from '@/utils/request'

export const getSubjectList = (params?: any) => request({ url: '/subject/list', method: 'GET', params })
export const createSubject = (data: any) => request({ url: '/subject', method: 'POST', data })
export const updateSubject = (id: number, data: any) => request({ url: `/subject/${id}`, method: 'PUT', data })
export const deleteSubject = (id: number) => request({ url: `/subject/${id}`, method: 'DELETE' })

// 成绩列表（临时表）
export const getScoreList = (params?: any) => request({ url: '/score-import/preview', method: 'GET', params })
// 原始成绩列表（正式表）
export const getExamScoreList = (params?: any) => request({ url: '/score-import/exam-score-list', method: 'GET', params })

export const createScore = (data: any) => request({ url: '/score', method: 'POST', data })
export const updateScore = (id: number, data: any) => request({ url: `/score/${id}`, method: 'PUT', data })
export const deleteScore = (id: number) => request({ url: `/score/${id}`, method: 'DELETE' })
export const deleteExamScore = (id: number) => request({ url: `/score-import/exam-score/${id}`, method: 'DELETE' })