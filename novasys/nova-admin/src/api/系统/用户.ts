/**
 * 系统用户 API
 * 重构自 service/api/system.ts
 */
import { request } from '@/service/http'

/** 用户 DTO */
export interface UserDTO {
  id?: number
  username: string
  password?: string
  nickName?: string
  email?: string
  phone?: string
  gender?: 'male' | 'female' | 'unknown'
  deptId?: number
  status?: number
  remark?: string
  /** 新增字段 */
  xingming?: string
  shenfenzheng?: string
  yonghuleixing?: string
}

/** 用户分页结果 */
export interface UserPageResult {
  list: UserDTO[]
  total: number
  pageNum: number
  pageSize: number
}

export const 系统用户API = {
  /** 获取分页列表 */
  获取分页: (params: { pageNum?: number; pageSize?: number } = {}) =>
    request.Get<{ code: number; data: UserPageResult; message: string }>('/user/userPage', {
      params: { pageNum: 1, pageSize: 10, ...params },
    }),

  /** 获取列表 */
  获取列表: () =>
    request.Get<{ code: number; data: UserDTO[]; message: string }>('/user/list'),

  /** 获取详情 */
  获取详情: (id: number) =>
    request.Get<{ code: number; data: UserDTO; message: string }>(`/user/${id}`),

  /** 新增用户 */
  新增: (data: UserDTO) =>
    request.Post<{ code: number; data: null; message: string }>('/user', data),

  /** 修改用户 */
  修改: (id: number, data: UserDTO) =>
    request.Patch<{ code: number; data: null; message: string }>(`/user/${id}`, data),

  /** 删除用户 */
  删除: (id: number) =>
    request.Delete<{ code: number; data: null; message: string }>(`/user/${id}`),

  /** 重置密码 */
  重置密码: (id: number) =>
    request.Post<{ code: number; data: null; message: string }>(`/user/${id}/resetPassword`),
}
