import { request } from '@/utils/request'

export const getClassList = (params?: any) => request({ url: '/class/list', method: 'GET', params })
export const getClassDetail = (id: number) => request({ url: `/class/${id}`, method: 'GET' })
export const createClass = (data: any) => request({ url: '/class', method: 'POST', data })
export const updateClass = (id: number, data: any) => request({ url: `/class/${id}`, method: 'PUT', data })
export const deleteClass = (id: number) => request({ url: `/class/${id}`, method: 'DELETE' })
export const getGradeList = (params?: any) => request({ url: '/grade/list', method: 'GET', params })