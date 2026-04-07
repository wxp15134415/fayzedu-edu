import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000
})

service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res: any = response.data

    // 处理后端直接返回的数据格式（如登录接口）
    if (res.token && res.user) {
      return response
    }

    // 处理标准格式 { code: 0, message: '', data: ... }
    if (res.code === 0 || res.code === undefined) {
      return response
    }

    if (res.code === 401) {
      ElMessage.error('登录已过期，请重新登录')
      localStorage.removeItem('token')
      router.push('/login')
      return Promise.reject(new Error(res.message || '登录已过期'))
    }

    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error: any) => {
    const msg = error.response?.data?.message || error.message || '网络错误'
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default service

export function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  return service.request(config).then((res) => {
    const data: any = res.data
    // 如果是登录接口直接返回的数据（有token字段），直接返回
    if (data && data.token && data.user) {
      return data as any
    }
    // 如果有 data 字段，说明是标准格式 { code, message, data: {...} }
    if (data && data.data !== undefined) {
      return data.data as T
    }
    // 否则直接返回整个 response data
    return data as T
  })
}