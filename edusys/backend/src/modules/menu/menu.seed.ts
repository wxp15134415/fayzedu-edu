import { DataSource } from 'typeorm'
import { Menu } from '@/entities'

export async function seedMenus(dataSource: DataSource) {
  const menuRepository = dataSource.getRepository(Menu)

  // 检查是否已有数据
  const count = await menuRepository.count()
  if (count > 0) {
    console.log('菜单数据已存在，跳过初始化')
    return
  }

  const menus = [
    // 首页
    { id: 1, name: '首页', path: '/dashboard', parentId: 0, sortOrder: 1, icon: 'HomeFilled', permission: '', type: 'menu', status: 1 },

    // 系统管理
    { id: 2, name: '系统管理', path: '/system', parentId: 0, sortOrder: 2, icon: 'Setting', permission: '', type: 'menu', status: 1 },
    { id: 21, name: '用户管理', path: '/user', parentId: 2, sortOrder: 1, icon: '', permission: 'user:list', type: 'menu', status: 1 },
    { id: 22, name: '角色管理', path: '/role', parentId: 2, sortOrder: 2, icon: '', permission: 'role:list', type: 'menu', status: 1 },
    { id: 23, name: '权限管理', path: '/permission', parentId: 2, sortOrder: 3, icon: '', permission: 'permission:list', type: 'menu', status: 1 },
    { id: 24, name: '菜单管理', path: '/menu', parentId: 2, sortOrder: 4, icon: '', permission: 'menu:list', type: 'menu', status: 1 },
    { id: 25, name: '基础信息', path: '/system-info', parentId: 2, sortOrder: 5, icon: '', permission: 'system-info:view', type: 'menu', status: 1 },

    // 考试管理
    { id: 3, name: '考试管理', path: '/exam', parentId: 0, sortOrder: 3, icon: 'Calendar', permission: '', type: 'menu', status: 1 },
    { id: 31, name: '考试安排', path: '/exam', parentId: 3, sortOrder: 1, icon: '', permission: 'exam:list', type: 'menu', status: 1 },
    { id: 32, name: '考试场次', path: '/exam-session', parentId: 3, sortOrder: 2, icon: '', permission: 'exam-session:list', type: 'menu', status: 1 },
    { id: 33, name: '考点管理', path: '/exam-venue', parentId: 3, sortOrder: 3, icon: '', permission: 'exam-venue:list', type: 'menu', status: 1 },
    { id: 34, name: '考场管理', path: '/exam-room', parentId: 3, sortOrder: 4, icon: '', permission: 'exam-room:list', type: 'menu', status: 1 },
    { id: 35, name: '考试编排', path: '/exam-arrangement', parentId: 3, sortOrder: 5, icon: '', permission: 'exam-arrangement:list', type: 'menu', status: 1 },
    { id: 36, name: '成绩管理', path: '/score', parentId: 3, sortOrder: 6, icon: '', permission: 'score:list', type: 'menu', status: 1 },

    // 教务管理
    { id: 4, name: '教务管理', path: '/education', parentId: 0, sortOrder: 4, icon: 'Reading', permission: '', type: 'menu', status: 1 },
    { id: 41, name: '年级管理', path: '/grade', parentId: 4, sortOrder: 1, icon: '', permission: 'grade:list', type: 'menu', status: 1 },
    { id: 42, name: '班级管理', path: '/class', parentId: 4, sortOrder: 2, icon: '', permission: 'class:list', type: 'menu', status: 1 },
    { id: 43, name: '学生管理', path: '/student', parentId: 4, sortOrder: 3, icon: '', permission: 'student:list', type: 'menu', status: 1 },
    { id: 45, name: '教师管理', path: '/teacher', parentId: 4, sortOrder: 5, icon: '', permission: 'teacher:list', type: 'menu', status: 1 },
    { id: 44, name: '科目管理', path: '/subject', parentId: 4, sortOrder: 6, icon: '', permission: 'subject:list', type: 'menu', status: 1 },
  ]

  await menuRepository.save(menus)
  console.log('菜单数据初始化完成')
}