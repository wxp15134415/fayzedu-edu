import { request } from '@/utils/request'
import type { Permission, ApiResponse } from './types'

export const getPermissionList = (params?: any) => {
  return request<any[]>({
    url: '/permission/list',
    method: 'GET',
    params
  })
}

export const getPermissionDetail = (id: number) => {
  return request<Permission>({
    url: `/permission/${id}`,
    method: 'GET'
  })
}

export const createPermission = (data: Partial<Permission>) => {
  return request({
    url: '/permission',
    method: 'POST',
    data
  })
}

export const updatePermission = (id: number, data: Partial<Permission>) => {
  return request({
    url: `/permission/${id}`,
    method: 'PUT',
    data
  })
}

export const deletePermission = (id: number) => {
  return request({
    url: `/permission/${id}`,
    method: 'DELETE'
  })
}