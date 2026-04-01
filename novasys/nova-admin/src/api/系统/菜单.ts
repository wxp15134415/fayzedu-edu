/**
 * 系统菜单 API
 */
import { request } from '@/service/http'

/** 菜单 DTO */
export interface MenuDTO {
  id?: number
  title: string
  parentId?: number
  menuType?: 'directory' | 'page' | 'permission'
  sort?: number
  path?: string
  component?: string
  activePath?: string
  icon?: string
  menuVisible?: boolean
  tabVisible?: boolean
  pinTab?: boolean
  isLink?: boolean
  linkPath?: string
  keepAlive?: boolean
  perms?: string
  status?: number
  remark?: string
}

export const 系统菜单API = {
  /** 获取菜单列表 */
  获取列表: () =>
    request.Get<{ code: number; data: MenuDTO[]; message: string }>('/menu/list'),

  /** 获取菜单树 */
  获取树: () =>
    request.Get<{ code: number; data: MenuDTO[]; message: string }>('/menu/tree'),

  /** 获取菜单详情 */
  获取详情: (id: number) =>
    request.Get<{ code: number; data: MenuDTO; message: string }>(`/menu/${id}`),

  /** 新增菜单 */
  新增: (data: MenuDTO) =>
    request.Post<{ code: number; data: null; message: string }>('/menu', data),

  /** 修改菜单 */
  修改: (id: number, data: MenuDTO) =>
    request.Patch<{ code: number; data: null; message: string }>(`/menu/${id}`, data),

  /** 删除菜单 */
  删除: (id: number) =>
    request.Delete<{ code: number; data: null; message: string }>(`/menu/${id}`),
}
