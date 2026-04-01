/**
 * 系统字典 API
 */
import { request } from '@/service/http'

/** 字典类型 DTO */
export interface DictTypeDTO {
  id?: number
  name: string
  type: string
  status?: number
  remark?: string
}

/** 字典数据 DTO */
export interface DictDataDTO {
  id?: number
  name: string
  value: string
  dictType: string
  sort?: number
  status?: number
  remark?: string
}

export const 系统字典API = {
  // ==================== 字典类型 ====================
  /** 获取字典类型列表 */
  获取类型列表: () =>
    request.Get<{ code: number; data: DictTypeDTO[]; message: string }>('/dict/types'),

  /** 获取字典类型详情 */
  获取类型详情: (id: number) =>
    request.Get<{ code: number; data: DictTypeDTO; message: string }>(`/dict/types/${id}`),

  /** 新增字典类型 */
  新增类型: (data: DictTypeDTO) =>
    request.Post<{ code: number; data: null; message: string }>('/dict/types', data),

  /** 修改字典类型 */
  修改类型: (id: number, data: DictTypeDTO) =>
    request.Patch<{ code: number; data: null; message: string }>(`/dict/types/${id}`, data),

  /** 删除字典类型 */
  删除类型: (id: number) =>
    request.Delete<{ code: number; data: null; message: string }>(`/dict/types/${id}`),

  // ==================== 字典数据 ====================
  /** 获取字典数据列表 */
  获取数据列表: (dictType: string) =>
    request.Get<{ code: number; data: DictDataDTO[]; message: string }>(`/dict/data/type/${dictType}`),

  /** 新增字典数据 */
  新增数据: (data: DictDataDTO) =>
    request.Post<{ code: number; data: null; message: string }>('/dict/data', data),

  /** 修改字典数据 */
  修改数据: (id: number, data: DictDataDTO) =>
    request.Patch<{ code: number; data: null; message: string }>(`/dict/data/${id}`, data),

  /** 删除字典数据 */
  删除数据: (id: number) =>
    request.Delete<{ code: number; data: null; message: string }>(`/dict/data/${id}`),
}
