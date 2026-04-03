import { request } from '@/utils/request'

export const getStudentList = (params?: any) => request({ url: '/student/list', method: 'GET', params })
export const getStudentDetail = (id: number) => request({ url: `/student/${id}`, method: 'GET' })
export const createStudent = (data: any) => request({ url: '/student', method: 'POST', data })
export const updateStudent = (id: number, data: any) => request({ url: `/student/${id}`, method: 'PUT', data })
export const deleteStudent = (id: number) => request({ url: `/student/${id}`, method: 'DELETE' })
export const updateStudentStatus = (id: number, status: number) => request({ url: `/student/${id}/status`, method: 'PUT', data: { status } })
export const getClassList = (params?: any) => request({ url: '/class/list', method: 'GET', params })