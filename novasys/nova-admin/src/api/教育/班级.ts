/**
 * 教育模块 - 班级 API
 */
import { request } from '@/service/http'

/** 班级 DTO */
export interface ClassDTO {
  id?: number
  banjibianhao: string
  banjimingcheng: string
  fu_banji_id?: number
  banjileixing?: string
  rongliang?: number
  dangji_nianji?: number
  suoxue_renshu?: number
  banji_zhuangtai?: string
  fudaoyuan_id?: number
  kaishi_riqi?: string
  jieshu_riqi?: string
  beizhu?: string
  zhuangtai?: number
}

export const 教育班级API = {
  /** 获取班级列表 */
  获取列表: (params?: { pageNum?: number; pageSize?: number }) =>
    request.Get<{ code: number; data: { list: ClassDTO[]; total: number }; message: string }>('/class/page', { params }),

  /** 获取班级树 */
  获取树: () =>
    request.Get<{ code: number; data: ClassDTO[]; message: string }>('/class/tree'),

  /** 获取班级详情 */
  获取详情: (id: number) =>
    request.Get<{ code: number; data: ClassDTO; message: string }>(`/class/${id}`),

  /** 新增班级 */
  新增: (data: ClassDTO) =>
    request.Post<{ code: number; data: null; message: string }>('/class', data),

  /** 修改班级 */
  修改: (id: number, data: ClassDTO) =>
    request.Patch<{ code: number; data: null; message: string }>(`/class/${id}`, data),

  /** 删除班级 */
  删除: (id: number) =>
    request.Delete<{ code: number; data: null; message: string }>(`/class/${id}`),
}
