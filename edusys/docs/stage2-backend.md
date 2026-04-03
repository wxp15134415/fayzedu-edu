# 阶段二：后端核心

## 时间
2026-04-02

## 目标
实现后端核心功能：数据库实体、认证、CRUD API

## 数据库实体

### User (用户)
```typescript
@Entity('user')
- id: number (主键)
- username: string (用户名,唯一)
- password: string (密码,加密存储)
- realName: string (真实姓名)
- roleId: number (角色ID)
- phone: string (手机号)
- email: string (邮箱)
- status: number (状态: 1启用, 0禁用)
- lastLoginTime: Date (最后登录时间)
- createdAt: Date
- updatedAt: Date
- relations: role (Role)
```

### Role (角色)
```typescript
@Entity('role')
- id: number
- roleName: string (角色名称)
- roleCode: string (角色编码,唯一)
- roleDesc: string (角色描述)
- isSystem: number (是否系统角色)
- createdAt: Date
- updatedAt: Date
```

### Permission (权限)
```typescript
@Entity('permission')
- id: number
- permissionName: string (权限名称)
- permissionCode: string (权限编码,唯一)
- permissionDesc: string (权限描述)
- createdAt: Date
- updatedAt: Date
```

### RolePermission (角色权限关联)
```typescript
@Entity('role_permission')
- id: number
- roleId: number
- permissionId: number
- relations: role (Role), permission (Permission)
```

### 教育相关实体
- Grade (年级): gradeName, gradeYear, gradeLevel, description, status
- Class (班级): className, gradeId, description, status
- Student (学生): studentNo, name, gender, gradeId, classId, birthDate, phone
- Subject (科目): subjectName, subjectCode, description
- Score (成绩): studentId, subjectId, score, examDate

## 认证模块 (Auth)

### JWT策略
```typescript
// src/modules/auth/auth.guard.ts
- JwtStrategy extends PassportStrategy(Strategy)
- validate(payload): 返回用户信息
```

### 认证API
- POST /auth/login - 登录
- POST /auth/logout - 登出 (需JWT)
- GET /auth/current - 获取当前用户信息 (需JWT)

### 登录流程
1. 验证用户名存在
2. 验证账号状态
3. 验证密码 (bcrypt.compare)
4. 获取权限列表
5. 生成JWT token
6. 返回用户信息、权限、菜单

## 用户模块 (User)

### API
- GET /user/list - 用户列表 (分页)
- GET /user/:id - 用户详情
- POST /user - 新增用户
- PUT /user/:id - 更新用户
- DELETE /user/:id - 删除用户
- PUT /user/:id/status - 状态切换

## 角色模块 (Role)

### API
- GET /role/list - 角色列表
- GET /role/:id - 角色详情
- POST /role - 新增角色
- PUT /role/:id - 更新角色
- DELETE /role/:id - 删除角色
- GET /role/:id/permissions - 获取角色权限
- PUT /role/:id/permissions - 分配权限

## 权限模块 (Permission)

### API
- GET /permission/list - 权限列表
- GET /permission/:id - 权限详情
- POST /permission - 新增权限
- PUT /permission/:id - 更新权限
- DELETE /permission/:id - 删除权限

## 数据初始化 (seed.ts)

### 初始化数据
1. 5个角色: 超级管理员、管理员、教师、学生、家长
2. 30个权限: 用户管理、用户新增...成绩管理、首页
3. admin账号: admin/admin123
4. 角色权限关联

### 运行命令
```bash
cd backend
pnpm ts-node seed.ts
```

## 问题与解决

### 问题1: API返回格式不统一
- 部分接口直接返回数据，部分包装在data中
- 解决: 前端request.ts兼容两种格式