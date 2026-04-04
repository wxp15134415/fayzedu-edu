import { request } from '@/utils/request'
import type { User, LoginParams, LoginResponse, ApiResponse } from './types'

export const login = (data: LoginParams) => {
  return request<LoginResponse>({
    url: '/auth/login',
    method: 'POST',
    data
  })
}

export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'POST'
  })
}

export const getCurrentUser = () => {
  return request<{ user: User; permissions: string[]; menus: any[] }>({
    url: '/auth/current',
    method: 'GET'
  })
}