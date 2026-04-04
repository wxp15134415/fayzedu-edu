/**
 * EduSys 本地数据库 - Dexie.js
 * 用于离线数据持久化和数据同步
 */

import Dexie, { type Table } from 'dexie'

// ============ 数据类型定义 ============

/** 学生信息 */
export interface Student {
  id?: number           // 本地自增 ID
  remoteId: number      // 后端 ID
  name: string
  studentNo: string     // 学号
  realName?: string     // 真实姓名
  gender?: string
  phone?: string
  email?: string
  classId: number
  className?: string
  gradeId?: number
  gradeName?: string
  status: 'studying' | 'graduated' | 'transferred' | 'left'  // 在读/毕业/转校/离校
  syncStatus: 'synced' | 'pending' | 'conflict' | 'local'     // 同步状态
  createdAt: number
  updatedAt: number
}

/** 年级信息 */
export interface Grade {
  id?: number
  remoteId: number
  name: string
  code?: string
  sortOrder?: number
  syncStatus: 'synced' | 'pending' | 'local'
  createdAt: number
  updatedAt: number
}

/** 班级信息 */
export interface Class {
  id?: number
  remoteId: number
  name: string
  code?: string
  gradeId: number
  gradeName?: string
  headTeacher?: string
  studentCount?: number
  sortOrder?: number
  syncStatus: 'synced' | 'pending' | 'local'
  createdAt: number
  updatedAt: number
}

/** 科目信息 */
export interface Subject {
  id?: number
  remoteId: number
  name: string
  code?: string
  sortOrder?: number
  syncStatus: 'synced' | 'pending' | 'local'
  createdAt: number
  updatedAt: number
}

/** 成绩信息 */
export interface Score {
  id?: number
  remoteId: number
  studentId: number
  studentName?: string
  studentNo?: string
  subjectId: number
  subjectName?: string
  examId?: number
  examName?: string
  score: number
  fullScore?: number
  rank?: number
  semester?: string
  syncStatus: 'synced' | 'pending' | 'local'
  createdAt: number
  updatedAt: number
}

/** 考试信息 */
export interface Exam {
  id?: number
  remoteId: number
  name: string
  type?: string
  semester?: string
  startDate?: number
  endDate?: number
  status: 'draft' | 'published' | 'completed'
  syncStatus: 'synced' | 'pending' | 'local'
  createdAt: number
  updatedAt: number
}

/** 用户信息 */
export interface User {
  id?: number
  remoteId: number
  username: string
  realName?: string
  email?: string
  phone?: string
  roleId: number
  roleName?: string
  status: 'active' | 'disabled'
  syncStatus: 'synced' | 'local'
  createdAt: number
  updatedAt: number
}

/** 角色信息 */
export interface Role {
  id?: number
  remoteId: number
  name: string
  code?: string
  description?: string
  sortOrder?: number
  syncStatus: 'synced' | 'pending' | 'local'
  createdAt: number
  updatedAt: number
}

/** 同步队列项 */
export interface SyncQueueItem {
  id?: number
  action: 'create' | 'update' | 'delete'
  tableName: string
  data: any
  localId?: number        // 本地记录的 ID
  remoteId?: number       // 远程记录的 ID
  timestamp: number
  retryCount: number
  error?: string
}

/** 用户设置 */
export interface UserSetting {
  key: string
  value: any
  updatedAt: number
}

// ============ 数据库类定义 ============

export class EduSysDB extends Dexie {
  // 表定义
  students!: Table<Student>
  grades!: Table<Grade>
  classes!: Table<Class>
  subjects!: Table<Subject>
  scores!: Table<Score>
  exams!: Table<Exam>
  users!: Table<User>
  roles!: Table<Role>
  syncQueue!: Table<SyncQueueItem>
  settings!: Table<UserSetting>

  constructor() {
    super('EduSysDB')

    // 表结构定义
    this.version(1).stores({
      // 主键是 auto-increment 的 id，同时建立索引
      students: '++id, remoteId, studentNo, name, classId, status, syncStatus',
      grades: '++id, remoteId, name, code, syncStatus',
      classes: '++id, remoteId, name, code, gradeId, syncStatus',
      subjects: '++id, remoteId, name, code, syncStatus',
      scores: '++id, remoteId, studentId, subjectId, examId, syncStatus',
      exams: '++id, remoteId, name, status, syncStatus',
      users: '++id, remoteId, username, roleId, syncStatus',
      roles: '++id, remoteId, name, code, syncStatus',
      syncQueue: '++id, action, tableName, timestamp, retryCount',
      settings: 'key'
    })
  }
}

// 导出数据库实例
export const db = new EduSysDB()

// 导出便捷方法
export const localDB = {
  // 通用方法
  async clear(tableName: string) {
    return await db[tableName as keyof EduSysDB].clear()
  },

  async clearAll() {
    await db.students.clear()
    await db.grades.clear()
    await db.classes.clear()
    await db.subjects.clear()
    await db.scores.clear()
    await db.exams.clear()
    await db.users.clear()
    await db.roles.clear()
    await db.syncQueue.clear()
  },

  // 获取数据库信息
  async getInfo() {
    return {
      students: await db.students.count(),
      grades: await db.grades.count(),
      classes: await db.classes.count(),
      subjects: await db.subjects.count(),
      scores: await db.scores.count(),
      exams: await db.exams.count(),
      users: await db.users.count(),
      roles: await db.roles.count(),
      syncQueue: await db.syncQueue.count()
    }
  }
}