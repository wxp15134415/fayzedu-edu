import request from '@/utils/request'
import type { Teacher, TeacherForm } from './types'

export function getTeacherList(params?: any) {
  return request({
    url: '/teacher/list',
    method: 'get',
    params
  })
}

export function getTeacher(id: number) {
  return request({
    url: `/teacher/${id}`,
    method: 'get'
  })
}

export function createTeacher(data: TeacherForm) {
  return request({
    url: '/teacher',
    method: 'post',
    data
  })
}

export function updateTeacher(id: number, data: TeacherForm) {
  return request({
    url: `/teacher/${id}`,
    method: 'put',
    data
  })
}

export function deleteTeacher(id: number) {
  return request({
    url: `/teacher/${id}`,
    method: 'delete'
  })
}

export function getSubjectList() {
  return request({
    url: '/teacher/subjects/list',
    method: 'get'
  })
}

// 批量删除教师
export function batchDeleteTeacher(ids: number[]) {
  return request({
    url: '/teacher/batch-delete',
    method: 'post',
    data: { ids }
  })
}

// 批量更新教师状态
export function updateTeacherStatus(ids: number[], status: number) {
  return request({
    url: '/teacher/batch-status',
    method: 'post',
    data: { ids, status }
  })
}

// 检查工号是否存在
export function checkTeacherNoExists(teacherNo: string, excludeId?: number) {
  return request({
    url: '/teacher/check-no',
    method: 'get',
    params: { teacherNo, excludeId }
  })
}
