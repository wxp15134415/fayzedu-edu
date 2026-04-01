/**
 * 教育模块 - 成绩 API
 */
import { request } from '@/service/http'

/** 成绩 DTO */
export interface ScoreDTO {
  id?: number
  xuesheng_id: number
  kecheng_id: number
  jiaoshi_id?: number
  xueqi: string
  chengguo_leixing?: string
  fenshu?: number
  dengji?: string
  paiming?: number
  beizhu?: string
}

export const 教育成绩API = {
  /** 获取成绩列表 */
  获取列表: (params?: { xueqi?: string; xuesheng_id?: number; kecheng_id?: number }) =>
    request.Get<{ code: number; data: ScoreDTO[]; message: string }>('/score/list', { params }),

  /** 获取成绩详情 */
  获取详情: (id: number) =>
    request.Get<{ code: number; data: ScoreDTO; message: string }>(`/score/${id}`),

  /** 新增成绩 */
  新增: (data: ScoreDTO) =>
    request.Post<{ code: number; data: null; message: string }>('/score', data),

  /** 批量导入成绩 */
  批量导入: (data: ScoreDTO[]) =>
    request.Post<{ code: number; data: null; message: string }>('/score/batch', data),

  /** 修改成绩 */
  修改: (id: number, data: ScoreDTO) =>
    request.Patch<{ code: number; data: null; message: string }>(`/score/${id}`, data),

  /** 删除成绩 */
  删除: (id: number) =>
    request.Delete<{ code: number; data: null; message: string }>(`/score/${id}`),
}
