export interface User {
  id: number
  username: string
  realName: string
  roleId: number
  roleName?: string
  gradeIds?: string[]
  classIds?: string[]
  studentId?: number
  status: number
  phone?: string
  email?: string
  lastLoginTime?: string
  createdAt?: string
  updatedAt?: string
}

export interface Role {
  id: number
  roleName: string
  roleCode: string
  roleDesc?: string
  isSystem: number
  createdAt?: string
  updatedAt?: string
  permissions?: Permission[]
}

export interface Permission {
  id: number
  permissionName: string
  permissionCode: string
  permissionDesc?: string
  createdAt?: string
  updatedAt?: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  permissions: string[]
  menus: any[]
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageResult<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ============ Teacher Types ============

export interface Teacher {
  id: number
  teacherNo: string
  teacherId?: string
  idCard?: string
  name: string
  subjectId?: number
  subject?: Subject
  gender: '男' | '女'
  birthDate?: string
  nation?: string
  nativePlace?: string
  phone?: string
  email?: string
  address?: string
  education?: string
  degree?: string
  hireDate?: string
  position?: string
  title?: string
  graduateSchool?: string
  remark?: string
  status: number
  createdAt?: string
  updatedAt?: string
}

export interface TeacherForm {
  teacherNo: string
  teacherId?: string
  idCard?: string
  name: string
  subjectId?: number
  gender: '男' | '女'
  birthDate?: string
  nation?: string
  nativePlace?: string
  phone?: string
  email?: string
  address?: string
  education?: string
  degree?: string
  hireDate?: string
  position?: string
  title?: string
  graduateSchool?: string
  remark?: string
  status: number
}

export interface Subject {
  id: number
  name: string
  code?: string
  sortOrder?: number
}