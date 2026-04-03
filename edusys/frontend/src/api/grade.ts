import { request } from '@/utils/request'

export const getGradeList = (params?: any) => {
  return request({
    url: '/grade/list',
    method: 'GET',
    params
  })
}

export const getGradeDetail = (id: number) => {
  return request({
    url: `/grade/${id}`,
    method: 'GET'
  })
}

export const createGrade = (data: any) => {
  return request({
    url: '/grade',
    method: 'POST',
    data
  })
}

export const updateGrade = (id: number, data: any) => {
  return request({
    url: `/grade/${id}`,
    method: 'PUT',
    data
  })
}

export const deleteGrade = (id: number) => {
  return request({
    url: `/grade/${id}`,
    method: 'DELETE'
  })
}