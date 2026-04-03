import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { permission: 'dashboard:view', title: '首页' }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/user/Index.vue'),
        meta: { permission: 'user:list', title: '用户管理' }
      },
      {
        path: 'user/add',
        name: 'UserAdd',
        component: () => import('@/views/user/Edit.vue'),
        meta: { permission: 'user:add', title: '新增用户' }
      },
      {
        path: 'user/:id/edit',
        name: 'UserEdit',
        component: () => import('@/views/user/Edit.vue'),
        meta: { permission: 'user:edit', title: '编辑用户' }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/role/Index.vue'),
        meta: { permission: 'role:list', title: '角色管理' }
      },
      {
        path: 'role/add',
        name: 'RoleAdd',
        component: () => import('@/views/role/Edit.vue'),
        meta: { permission: 'role:add', title: '新增角色' }
      },
      {
        path: 'role/:id/edit',
        name: 'RoleEdit',
        component: () => import('@/views/role/Edit.vue'),
        meta: { permission: 'role:edit', title: '编辑角色' }
      },
      {
        path: 'permission',
        name: 'Permission',
        component: () => import('@/views/permission/Index.vue'),
        meta: { permission: 'permission:list', title: '权限组管理' }
      },
      {
        path: 'permission/add',
        name: 'PermissionAdd',
        component: () => import('@/views/permission/Edit.vue'),
        meta: { permission: 'permission:add', title: '新增权限组' }
      },
      {
        path: 'permission/:id/edit',
        name: 'PermissionEdit',
        component: () => import('@/views/permission/Edit.vue'),
        meta: { permission: 'permission:edit', title: '编辑权限组' }
      },
      {
        path: 'system-info',
        name: 'SystemInfo',
        component: () => import('@/views/system-info/Index.vue'),
        meta: { permission: 'system-info:view', title: '基础信息' }
      },
      {
        path: 'grade',
        name: 'Grade',
        component: () => import('@/views/grade/Index.vue'),
        meta: { permission: 'grade:list', title: '年级管理' }
      },
      {
        path: 'class',
        name: 'Class',
        component: () => import('@/views/class/Index.vue'),
        meta: { permission: 'class:list', title: '班级管理' }
      },
      {
        path: 'student',
        name: 'Student',
        component: () => import('@/views/student/Index.vue'),
        meta: { permission: 'student:list', title: '学生管理' }
      },
      {
        path: 'subject',
        name: 'Subject',
        component: () => import('@/views/subject/Index.vue'),
        meta: { permission: 'subject:list', title: '科目管理' }
      },
      {
        path: 'exam',
        name: 'Exam',
        component: () => import('@/views/exam/Index.vue'),
        meta: { permission: 'exam:list', title: '考试安排' }
      },
      {
        path: 'exam-venue',
        name: 'ExamVenue',
        component: () => import('@/views/exam-venue/Index.vue'),
        meta: { permission: 'exam-venue:list', title: '考点管理' }
      },
      {
        path: 'exam-room',
        name: 'ExamRoom',
        component: () => import('@/views/exam-room/Index.vue'),
        meta: { permission: 'exam-room:list', title: '考场管理' }
      },
      {
        path: 'exam-arrangement',
        name: 'ExamArrangement',
        component: () => import('@/views/exam-arrangement/Index.vue'),
        meta: { permission: 'exam-arrangement:list', title: '考试编排' }
      },
      {
        path: 'score',
        name: 'Score',
        component: () => import('@/views/score/Index.vue'),
        meta: { permission: 'score:list', title: '成绩管理' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth !== false && !token) {
    return '/login'
  } else if (to.path === '/login' && token) {
    return '/'
  }
  return true
})

export default router