import { request } from '../http'

// 获取所有路由信息 (调用后端 /menu 接口获取菜单列表)
export function fetchAllRoutes() {
  return request.Get<Service.ResponseResult>('/menu')
}

// 获取用户分页列表
export function fetchUserPage(pageNum = 1, pageSize = 10) {
  return request.Get<Service.ResponseResult>('/user/userPage', {
    params: { pageNum, pageSize },
  })
}

// 获取所有角色列表
export function fetchRoleList() {
  return request.Get<Service.ResponseResult>('/role/list')
}

export function createRole(data: any) {
  return request.Post<Service.ResponseResult>('/role', data)
}

export function updateRole(id: number, data: any) {
  return request.Patch<Service.ResponseResult>(`/role/${id}`, data)
}

export function deleteRole(id: number) {
  return request.Delete<Service.ResponseResult>(`/role/${id}`)
}

// 字典类型 API
export function fetchDictList() {
  return request.Get<Service.ResponseResult>('/dict/types')
}

export function createDictType(data: any) {
  return request.Post<Service.ResponseResult>('/dict/types', data)
}

export function updateDictType(id: number, data: any) {
  return request.Patch<Service.ResponseResult>(`/dict/types/${id}`, data)
}

export function deleteDictType(id: number) {
  return request.Delete<Service.ResponseResult>(`/dict/types/${id}`)
}

// 字典数据 API
export function fetchDictData(dictType: string) {
  return request.Get<Service.ResponseResult>(`/dict/data/type/${dictType}`)
}

export function createDictData(data: any) {
  return request.Post<Service.ResponseResult>('/dict/data', data)
}

export function updateDictData(id: number, data: any) {
  return request.Patch<Service.ResponseResult>(`/dict/data/${id}`, data)
}

export function deleteDictData(id: number) {
  return request.Delete<Service.ResponseResult>(`/dict/data/${id}`)
}

export function fetchDeptList() {
  return request.Get<Service.ResponseResult>('/dept')
}

export function fetchDeptOptions() {
  return request.Get<Service.ResponseResult>('/dept/options')
}

export function createDept(data: any) {
  return request.Post<Service.ResponseResult>('/dept', data)
}

export function updateDept(id: number, data: any) {
  return request.Patch<Service.ResponseResult>(`/dept/${id}`, data)
}

export function deleteDept(id: number) {
  return request.Delete<Service.ResponseResult>(`/dept/${id}`)
}

export function deleteMenu(id: number) {
  return request.Delete<Service.ResponseResult>(`/menu/${id}`)
}

export function createMenu(data: any) {
  return request.Post<Service.ResponseResult>('/menu', data)
}

export function updateMenu(id: number, data: any) {
  return request.Patch<Service.ResponseResult>(`/menu/${id}`, data)
}

// 用户 CRUD
export function createUser(data: any) {
  return request.Post<Service.ResponseResult>('/user', data)
}

export function updateUser(id: number, data: any) {
  return request.Patch<Service.ResponseResult>(`/user/${id}`, data)
}

export function deleteUser(id: number) {
  return request.Delete<Service.ResponseResult>(`/user/${id}`)
}