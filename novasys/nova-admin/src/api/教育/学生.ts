/**
 * 教育模块 - 学生 API
 */
import { request } from '@/service/http'

/** 学生 DTO */
export interface StudentDTO {
  id?: number
  xuehao: string
  xingming: string
  xingbie?: string
  shengri?: string
  shenfenzheng?: string
  minzu?: string
  jiguandanwei?: string
  jiating_dizhi?: string
  jiazhangId?: number
  banjiId?: number
  ruxue_riqi?: string
  biye_riqi?: string
  xuejizhanghao?: string
  jiankangzhuangkuang?: string
  beizhu?: string
  zhuangtai?: number
}

export const 教育学生API = {
  /** 获取学生列表 */
  获取列表: (params?: { pageNum?: number; pageSize?: number }) =>
    request.Get<{ code: number; data: { list: StudentDTO[]; total: number }; message: string }>('/student/page', { params }),

  /** 获取学生详情 */
  获取详情: (id: number) =>
    request.Get<{ code: number; data: StudentDTO; message: string }>(`/student/${id}`),

  /** 新增学生 */
  新增: (data: StudentDTO) =>
    request.Post<{ code: number; data: null; message: string }>('/student', data),

  /** 修改学生 */
  修改: (id: number, data: StudentDTO) =>
    request.Patch<{ code: number; data: null; message: string }>(`/student/${id}`, data),

  /** 删除学生 */
  删除: (id: number) =>
    request.Delete<{ code: number; data: null; message: string }>(`/student/${id}`),
}
