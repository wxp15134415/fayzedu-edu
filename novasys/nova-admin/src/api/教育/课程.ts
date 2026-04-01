/**
 * 教育模块 - 课程 API
 */
import { request } from '@/service/http'

/** 课程 DTO */
export interface CourseDTO {
  id?: number
  kechengbianhao: string
  kechengming: string
  kechengleixing?: string
  xuefen?: number
  xueshi?: number
  kechengmiaoshu?: string
  fuzeren_id?: number
  kaike_xueqi?: string
  kaikedanwei?: string
  kaikeshijian?: string
  kaikedidian?: string
  beizhu?: string
  zhuangtai?: number
}

export const 教育课程API = {
  /** 获取课程列表 */
  获取列表: (params?: { pageNum?: number; pageSize?: number }) =>
    request.Get<{ code: number; data: { list: CourseDTO[]; total: number }; message: string }>('/course/page', { params }),

  /** 获取课程详情 */
  获取详情: (id: number) =>
    request.Get<{ code: number; data: CourseDTO; message: string }>(`/course/${id}`),

  /** 新增课程 */
  新增: (data: CourseDTO) =>
    request.Post<{ code: number; data: null; message: string }>('/course', data),

  /** 修改课程 */
  修改: (id: number, data: CourseDTO) =>
    request.Patch<{ code: number; data: null; message: string }>(`/course/${id}`, data),

  /** 删除课程 */
  删除: (id: number) =>
    request.Delete<{ code: number; data: null; message: string }>(`/course/${id}`),
}
