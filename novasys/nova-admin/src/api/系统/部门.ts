/**
 * 系统部门 API
 */
import { request } from '@/service/http'

/** 部门 DTO */
export interface DeptDTO {
  id?: number
  parentId?: number
  ancestors?: string
  deptName: string
  sort?: number
  leader?: string
  phone?: string
  email?: string
  status?: number
  remark?: string
}

export const 系统部门API = {
  /** 获取部门列表 */
  获取列表: () =>
    request.Get<{ code: number; data: DeptDTO[]; message: string }>('/dept'),

  /** 获取部门选项（树形） */
  获取选项: () =>
    request.Get<{ code: number; data: DeptDTO[]; message: string }>('/dept/options'),

  /** 获取部门详情 */
  获取详情: (id: number) =>
    request.Get<{ code: number; data: DeptDTO; message: string }>(`/dept/${id}`),

  /** 新增部门 */
  新增: (data: DeptDTO) =>
    request.Post<{ code: number; data: null; message: string }>('/dept', data),

  /** 修改部门 */
  修改: (id: number, data: DeptDTO) =>
    request.Patch<{ code: number; data: null; message: string }>(`/dept/${id}`, data),

  /** 删除部门 */
  删除: (id: number) =>
    request.Delete<{ code: number; data: null; message: string }>(`/dept/${id}`),
}
