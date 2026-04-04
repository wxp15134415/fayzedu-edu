import { request } from '@/utils/request'

export const getMenuTree = () => {
  return request<any[]>({
    url: '/menu/tree',
    method: 'GET'
  })
}

export const getMenuList = (params?: any) => {
  return request<any[]>({
    url: '/menu/list',
    method: 'GET',
    params
  })
}

export const getMenuDetail = (id: number) => {
  return request({
    url: `/menu/${id}`,
    method: 'GET'
  })
}

export const createMenu = (data: any) => {
  return request({
    url: '/menu',
    method: 'POST',
    data
  })
}

export const updateMenu = (id: number, data: any) => {
  return request({
    url: `/menu/${id}`,
    method: 'PUT',
    data
  })
}

export const deleteMenu = (id: number) => {
  return request({
    url: `/menu/${id}`,
    method: 'DELETE'
  })
}