import { request } from '@/utils/request'

export const getSubjectList = (params?: any) => {
  return request({
    url: '/subject/list',
    method: 'GET',
    params
  })
}

export const getSubjectDetail = (id: number) => {
  return request({
    url: `/subject/${id}`,
    method: 'GET'
  })
}

export const createSubject = (data: any) => {
  return request({
    url: '/subject',
    method: 'POST',
    data
  })
}

export const updateSubject = (id: number, data: any) => {
  return request({
    url: `/subject/${id}`,
    method: 'PUT',
    data
  })
}

export const deleteSubject = (id: number) => {
  return request({
    url: `/subject/${id}`,
    method: 'DELETE'
  })
}