# 阶段三：前端核心

## 时间
2026-04-02 ~ 2026-04-03

## 目标
实现前端核心功能：路由、状态管理、请求封装、布局

## 路由配置 (src/router/index.ts)

### 路由结构
```
/login - 登录页 (无需认证)
/
  /dashboard - 首页
  /user - 用户管理
  /user/add - 新增用户
  /user/:id/edit - 编辑用户
  /role - 角色管理
  /permission - 权限管理
  /grade - 年级管理
  /class - 班级管理
  /student - 学生管理
  /subject - 科目管理
  /score - 成绩管理
```

### 路由守卫
```typescript
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})
```

## 状态管理 (src/stores/user.ts)

### Pinia Store
```typescript
export const useUserStore = defineStore('user', () => {
  // 状态
  token: localStorage.getItem('token')
  userInfo: localStorage恢复
  permissions: []
  menus: []

  // 方法
  login(params) - 登录
  logout() - 登出
  fetchUserInfo() - 获取用户信息
  hasPermission(permission) - 权限检查
})
```

### 数据持久化
- token存入localStorage
- userInfo存入localStorage (解决刷新丢失)
- logout时清除所有状态

## 请求封装 (src/utils/request.ts)

### Axios配置
```typescript
- baseURL: /api
- timeout: 30000
- Content-Type: application/json
```

### 请求拦截器
```typescript
- 添加Authorization头 (token)
```

### 响应拦截器
```typescript
- 200: 返回数据
- 401: 跳转登录
- 错误: 抛出异常
```

### 响应格式兼容
- 直接返回: { token, user, permissions }
- 包装返回: { data: { token, user, permissions } }

## 布局组件 (src/layouts/MainLayout.vue)

### 桌面端布局
- 侧边栏: 220px (收起64px)
- 顶部: 60px
- 内容区: 自适应

### 菜单结构
```
首页
系统管理
  - 用户管理
  - 角色管理
  - 权限组管理
教务管理
  - 年级管理
  - 班级管理
  - 学生管理
  - 科目管理
  - 成绩管理
```

### 权限控制
- hasPermission: 检查单个权限
- hasAnyPermission: 检查多个权限任一存在

## 问题与解决

### 问题1: 登录后只显示首页
- 原因: admin用户权限只有user:list等，没有教务管理权限
- 解决: 更新seed.ts添加所有权限，重新运行种子脚本

### 问题2: 用户名不显示
- 原因: 刷新页面后userStore.userInfo为空
- 解决: 登录时将userInfo存入localStorage，store初始化时恢复

### 问题3: 退出登录无跳转
- 原因: logout API调用失败时抛出异常
- 解决: logout函数catch异常，确保本地状态清除