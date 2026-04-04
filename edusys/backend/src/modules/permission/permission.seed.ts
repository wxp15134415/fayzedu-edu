import { DataSource } from 'typeorm'
import { Permission } from '../../entities'

export async function seedPermissions(dataSource: DataSource) {
  const permissionRepository = dataSource.getRepository(Permission)

  // 检查是否已有数据
  const count = await permissionRepository.count()
  if (count > 0) {
    console.log('权限数据已存在，跳过初始化')
    return
  }

  // 简化的模块级权限
  const permissions = [
    { permissionName: '首页', permissionCode: 'dashboard:view', permissionDesc: '查看首页' },
    { permissionName: '用户管理', permissionCode: 'user:list', permissionDesc: '用户管理' },
    { permissionName: '角色管理', permissionCode: 'role:list', permissionDesc: '角色管理' },
    { permissionName: '权限管理', permissionCode: 'permission:list', permissionDesc: '权限管理' },
    { permissionName: '菜单管理', permissionCode: 'menu:list', permissionDesc: '菜单管理' },
    { permissionName: '基础信息', permissionCode: 'system-info:view', permissionDesc: '基础信息' },
    { permissionName: '年级管理', permissionCode: 'grade:list', permissionDesc: '年级管理' },
    { permissionName: '班级管理', permissionCode: 'class:list', permissionDesc: '班级管理' },
    { permissionName: '学生管理', permissionCode: 'student:list', permissionDesc: '学生管理' },
    { permissionName: '教师管理', permissionCode: 'teacher:list', permissionDesc: '教师管理' },
    { permissionName: '科目管理', permissionCode: 'subject:list', permissionDesc: '科目管理' },
    { permissionName: '成绩管理', permissionCode: 'score:list', permissionDesc: '成绩管理' },
    { permissionName: '成绩导入', permissionCode: 'score-import:list', permissionDesc: '成绩导入' },
    { permissionName: '考试安排', permissionCode: 'exam:list', permissionDesc: '考试安排' },
    { permissionName: '考试场次', permissionCode: 'exam-session:list', permissionDesc: '考试场次' },
    { permissionName: '考点管理', permissionCode: 'exam-venue:list', permissionDesc: '考点管理' },
    { permissionName: '考场管理', permissionCode: 'exam-room:list', permissionDesc: '考场管理' },
    { permissionName: '考试编排', permissionCode: 'exam-arrangement:list', permissionDesc: '考试编排' },
    { permissionName: '成绩分析', permissionCode: 'score-analysis:list', permissionDesc: '成绩分析' },
  ]

  await permissionRepository.save(permissions)
  console.log('权限数据初始化完成')
}