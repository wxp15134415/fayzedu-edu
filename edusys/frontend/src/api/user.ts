import { request } from '@/utils/request'
import type { User, ApiResponse, PageResult } from './types'

export const getUserList = (params: any) => {
  return request<PageResult<User>>({
    url: '/user/list',
    method: 'GET',
    params
  })
}

export const getUserDetail = (id: number) => {
  return request<User>({
    url: `/user/${id}`,
    method: 'GET'
  })
}

export const createUser = (data: Partial<User>) => {
  return request({
    url: '/user',
    method: 'POST',
    data
  })
}

export const updateUser = (id: number, data: Partial<User>) => {
  return request({
    url: `/user/${id}`,
    method: 'PUT',
    data
  })
}

export const deleteUser = (id: number) => {
  return request({
    url: `/user/${id}`,
    method: 'DELETE'
  })
}

export const updateUserStatus = (id: number, status: number) => {
  return request({
    url: `/user/${id}/status`,
    method: 'PUT',
    data: { status }
  })
}

export const getAllRoles = () => {
  return request<any[]>({
    url: '/role/list',
    method: 'GET'
  })
}