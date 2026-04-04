import { request } from '@/utils/request'

// 考场管理
export const getExamRoomList = (params?: any) => {
  return request({
    url: '/exam-room/list',
    method: 'GET',
    params
  })
}

export const getExamRoomDetail = (id: number) => {
  return request({
    url: `/exam-room/${id}`,
    method: 'GET'
  })
}

export const createExamRoom = (data: any) => {
  return request({
    url: '/exam-room',
    method: 'POST',
    data
  })
}

export const updateExamRoom = (id: number, data: any) => {
  return request({
    url: `/exam-room/${id}`,
    method: 'PUT',
    data
  })
}

export const deleteExamRoom = (id: number) => {
  return request({
    url: `/exam-room/${id}`,
    method: 'DELETE'
  })
}

export const batchCreateExamRoom = (data: any) => {
  return request({
    url: '/exam-room/batch',
    method: 'POST',
    data
  })
}

export const getExamRoomsByVenue = (venueId: number) => {
  return request({
    url: `/exam-room/by-venue/${venueId}`,
    method: 'GET'
  })
}

export const updateExamRoomStatus = (id: number, status: number) => {
  return request({
    url: `/exam-room/${id}/status`,
    method: 'PUT',
    data: { status }
  })
}