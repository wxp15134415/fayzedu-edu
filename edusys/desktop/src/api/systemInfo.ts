import { request } from '@/utils/request'

export const getSystemInfo = () => {
  return request({
    url: '/system-info',
    method: 'GET'
  })
}

export const updateSystemInfo = (data: any) => {
  return request({
    url: '/system-info',
    method: 'PUT',
    data
  })
}

// 统计接口
export const getStatistics = () => {
  return request({
    url: '/system-info/statistics',
    method: 'GET'
  })
}