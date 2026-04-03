import { request } from '@/utils/request'

export const getExamList = (params?: any) => {
  return request({
    url: '/exam/list',
    method: 'GET',
    params
  })
}

export const getExamDetail = (id: number) => {
  return request({
    url: `/exam/${id}`,
    method: 'GET'
  })
}

export const createExam = (data: any) => {
  return request({
    url: '/exam',
    method: 'POST',
    data
  })
}

export const updateExam = (id: number, data: any) => {
  return request({
    url: `/exam/${id}`,
    method: 'PUT',
    data
  })
}

export const deleteExam = (id: number) => {
  return request({
    url: `/exam/${id}`,
    method: 'DELETE'
  })
}