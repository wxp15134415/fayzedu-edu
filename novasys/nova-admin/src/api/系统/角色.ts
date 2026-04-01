/**
 * 系统角色 API
 */
import { request } from '@/service/http'

/** 角色 DTO */
export interface RoleDTO {
  id?: number
  roleName: string
  roleKey: string
  status?: number
  dataScope?: number
  remark?: string
  menuIds?: number[]
}

export const 系统角色API = {
  /** 获取角色列表 */
  获取列表: () =>
    request.Get<{ code: number; data: RoleDTO[]; message: string }>('/role/list'),

  /** 获取角色详情 */
  获取详情: (id: number) =>
    request.Get<{ code: number; data: RoleDTO; message: string }>(`/role/${id}`),

  /** 新增角色 */
  新增: (data: RoleDTO) =>
    request.Post<{ code: number; data: null; message: string }>('/role', data),

  /** 修改角色 */
  修改: (id: number, data: RoleDTO) =>
    request.Patch<{ code: number; data: null; message: string }>(`/role/${id}`, data),

  /** 删除角色 */
  删除: (id: number) =>
    request.Delete<{ code: number; data: null; message: string }>(`/role/${id}`),
}
