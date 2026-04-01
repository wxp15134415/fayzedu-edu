/**
 * 教育模块 - 教师 API
 */
import { request } from '@/service/http'

/** 教师 DTO */
export interface TeacherDTO {
  id?: number
  yonghuId?: number
  gonghao?: string
  xingming: string
  xingbie?: string
  shenfenzheng?: string
  shoujihao?: string
  youxiang?: string
  jiaoshileixing?: string
  ruzhi_riqi?: string
  zhuanye?: string
  zhicheng?: string
  jianli?: string
  beizhu?: string
  zhuangtai?: number
}

export const 教育教师API = {
  /** 获取教师列表 */
  获取列表: (params?: { pageNum?: number; pageSize?: number }) =>
    request.Get<{ code: number; data: { list: TeacherDTO[]; total: number }; message: string }>('/teacher/page', { params }),

  /** 获取教师详情 */
  获取详情: (id: number) =>
    request.Get<{ code: number; data: TeacherDTO; message: string }>(`/teacher/${id}`),

  /** 新增教师 */
  新增: (data: TeacherDTO) =>
    request.Post<{ code: number; data: null; message: string }>('/teacher', data),

  /** 修改教师 */
  修改: (id: number, data: TeacherDTO) =>
    request.Patch<{ code: number; data: null; message: string }>(`/teacher/${id}`, data),

  /** 删除教师 */
  删除: (id: number) =>
    request.Delete<{ code: number; data: null; message: string }>(`/teacher/${id}`),
}
