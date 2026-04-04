import { request } from '@/utils/request'
import type { Role, Permission, ApiResponse } from './types'

export const getRoleList = (params?: any) => {
  return request<any[]>({
    url: '/role/list',
    method: 'GET',
    params
  })
}

export const getPermissionList = (params?: any) => {
  return request<any[]>({
    url: '/permission/list',
    method: 'GET',
    params
  })
}

export const getRoleDetail = (id: number) => {
  return request<Role>({
    url: `/role/${id}`,
    method: 'GET'
  })
}

export const createRole = (data: Partial<Role>) => {
  return request({
    url: '/role',
    method: 'POST',
    data
  })
}

export const updateRole = (id: number, data: Partial<Role>) => {
  return request({
    url: `/role/${id}`,
    method: 'PUT',
    data
  })
}

export const deleteRole = (id: number) => {
  return request({
    url: `/role/${id}`,
    method: 'DELETE'
  })
}

export const getRolePermissions = (id: number) => {
  return request<Permission[]>({
    url: `/role/${id}/permissions`,
    method: 'GET'
  })
}

export const updateRolePermissions = (id: number, permissionIds: number[]) => {
  return request({
    url: `/role/${id}/permissions`,
    method: 'PUT',
    data: { permissionIds }
  })
}