import { request } from '@/utils/request'

// 考点管理
export const getExamVenueList = (params?: any) => {
  return request({
    url: '/exam-venue/list',
    method: 'GET',
    params
  })
}

export const getExamVenueDetail = (id: number) => {
  return request({
    url: `/exam-venue/${id}`,
    method: 'GET'
  })
}

export const createExamVenue = (data: any) => {
  return request({
    url: '/exam-venue',
    method: 'POST',
    data
  })
}

export const updateExamVenue = (id: number, data: any) => {
  return request({
    url: `/exam-venue/${id}`,
    method: 'PUT',
    data
  })
}

export const deleteExamVenue = (id: number) => {
  return request({
    url: `/exam-venue/${id}`,
    method: 'DELETE'
  })
}

export const updateExamVenueStatus = (id: number, status: number) => {
  return request({
    url: `/exam-venue/${id}/status`,
    method: 'PUT',
    data: { status }
  })
}