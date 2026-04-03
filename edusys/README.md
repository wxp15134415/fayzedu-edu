# 学校管理系统 (EduSys) 开发文档

## 项目概述

| 项目 | 说明 |
|------|------|
| 项目名称 | 学校管理系统 |
| 类型 | Web全栈管理系统 |
| 目标用户 | 学校管理员、教师、学生 |

## 技术栈

### 前端
- **框架**: Vue 3 + Composition API
- **UI库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **构建工具**: Vite
- **语言**: TypeScript
- **测试**: Playwright

### 后端
- **框架**: NestJS
- **数据库**: PostgreSQL
- **ORM**: TypeORM
- **认证**: JWT + Passport
- **语言**: TypeScript

## 文档结构

### 现有文档 (docs/)
| 目录 | 内容 |
|------|------|
| [01-需求](docs/01-需求/) | 功能需求文档 |
| [02-设计](docs/02-设计/) | 系统设计文档 |
| [03-开发](docs/03-开发/) | 开发指南文档 |
| [04-测试](docs/04-测试/) | 测试计划文档 |
| [05-部署](docs/05-部署/) | 部署指南文档 |
| [06-运维](docs/06-运维/) | 运维指南文档 |
| [07-规范](docs/07-规范/) | 开发规范文档 |

### 开发阶段文档
| 阶段 | 标题 | 文档 |
|------|------|------|
| 阶段一 | 项目初始化 | [docs/stage1-init.md](docs/stage1-init.md) |
| 阶段二 | 后端核心 | [docs/stage2-backend.md](docs/stage2-backend.md) |
| 阶段三 | 前端核心 | [docs/stage3-frontend.md](docs/stage3-frontend.md) |
| 阶段四 | 页面开发 | [docs/stage4-pages.md](docs/stage4-pages.md) |
| 阶段五 | 移动端适配 | [docs/stage5-mobile.md](docs/stage5-mobile.md) |
| 阶段六 | 测试与修复 | [docs/stage6-test.md](docs/stage6-test.md) |

## 项目结构

```
edusys/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── api/            # API接口 (按模块划分)
│   │   ├── views/         # 页面组件
│   │   │   ├── auth/      # 登录相关
│   │   │   ├── user/      # 用户管理
│   │   │   ├── role/      # 角色管理
│   │   │   ├── permission/# 权限管理
│   │   │   ├── grade/     # 年级管理
│   │   │   ├── class/     # 班级管理
│   │   │   ├── student/   # 学生管理
│   │   │   ├── subject/   # 科目管理
│   │   │   ├── score/     # 成绩管理
│   │   │   └── dashboard/ # 首页
│   │   ├── stores/        # Pinia状态管理
│   │   ├── router/        # 路由配置
│   │   ├── layouts/       # 布局组件
│   │   └── utils/         # 工具函数
│   ├── vite.config.ts     # Vite配置
│   └── package.json
│
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── entities/      # 数据库实体
│   │   ├── modules/       # 业务模块 (auth/user/role/permission/grade/class/student/subject/score)
│   │   └── main.ts        # 入口文件
│   ├── seed.ts            # 数据初始化脚本
│   └── package.json
│
└── test-*.js              # Playwright测试脚本
```

## 功能模块

### 系统管理
- [x] 用户管理 (增删改查、状态切换)
- [x] 角色管理 (权限分配)
- [x] 权限组管理

### 教务管理
- [x] 年级管理
- [x] 班级管理
- [x] 学生管理
- [x] 科目管理
- [x] 成绩管理

### 核心功能
- [x] JWT认证
- [x] RBAC权限控制
- [x] 登录/登出
- [x] 移动端自适应
- [x] 路由守卫

## 开发流程记录

### 1. 项目初始化
- 手动创建Vue 3 + Vite + Element Plus前端项目
- 手动创建NestJS + TypeORM + PostgreSQL后端项目

### 2. 后端核心
- 创建数据库实体 (User, Role, Permission, RolePermission)
- 实现JWT认证 (Passport策略)
- 实现用户、角色、权限CRUD API
- 创建数据初始化脚本 (seed.ts)

### 3. 前端核心
- 配置Vite代理 (解决API跨域)
- 实现Axios请求封装 (兼容多种响应格式)
- 实现Pinia状态管理 (用户信息持久化)
- 实现路由守卫 (权限控制)

### 4. 页面开发
- 登录页
- 主布局 (侧边栏 + 顶部导航 + 内容区)
- 各模块列表页 (表格 + 分页 + 弹窗)

### 5. 移动端适配
- 768px断点判断
- 抽屉式导航菜单
- 响应式表格和按钮

## 问题与解决方案

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| API 404错误 | Vite代理rewrite路径导致 | 移除rewrite配置 |
| 用户列表为空 | 响应格式解析错误 | request.ts兼容包装格式 |
| 角色页面空白 | 缺少导出函数 | 添加getPermissionList导出 |
| 登出无跳转 | API错误阻止执行 | catch错误后继续执行 |
| 用户名不显示 | 刷新后数据丢失 | 存入localStorage恢复 |
| 菜单不显示 | 权限数据未初始化 | 更新seed.ts添加所有权限 |
| 移动端头部不显示 | @media规则错误 | 修复CSS选择器 |
| useBreakpoints报错 | API调用方式错误 | 改用原生window监听 |

## 测试记录

### 自动化测试
- 使用Playwright模拟真实用户操作
- 13项核心功能全部通过

### 测试项
1. 登录功能 ✅
2. 用户名显示 ✅
3. 用户管理页面 ✅
4. 用户表格 ✅
5. 新增用户跳转 ✅
6. 取消返回 ✅
7. 年级管理页面 ✅
8. 新增年级弹窗 ✅
9. 科目管理页面 ✅
10. 成绩管理页面 ✅
11. 退出登录 ✅
12. 移动端头部显示 ✅
13. 移动端抽屉菜单 ✅

## 用户偏好记录 (根据开发过程总结)

### 开发习惯
1. **不询问直接执行**: 用户要求直接执行任务，不喜欢中途被问问题
2. **完整测试**: 要求真实模拟用户界面操作，不仅是API测试
3. **详细复盘**: 需要完整的项目文档和复盘记录
4. **直接投入使用**: 要求系统可以直接使用，不要半成品

### 技术偏好
1. 使用pnpm作为包管理工具
2. 手动创建项目结构，不使用脚手架
3. 前端不使用auto-import，手动引入组件
4. 响应式布局优先考虑移动端
5. 代码优先保证功能，后续再优化

## 启动命令

```bash
# 后端
cd backend
pnpm install
pnpm start:dev

# 前端
cd frontend
pnpm install
pnpm dev
```

## 访问地址

| 环境 | 地址 |
|------|------|
| 本地 | http://localhost:5173 |
| 局域网 | http://192.168.50.194:5173 |
| 账号 | admin / admin123 |

## 更新日志

### 2026-04-03 (UI优化版本v2)
- 表格固定表头样式（`:header-cell-style="{background: '#f5f7fa'}"`）
- 添加骨架屏加载（`el-skeleton`组件）
- 添加空状态页面（`el-empty`组件）
- 移动端表格改为卡片式呈现
- 所有列表页（用户、角色、权限、年级、班级、学生、科目、成绩）均已适配
- 后端统计数据API修复（`findAndCount()`返回数组改为count）

### 2026-04-03 (UI优化版本)
- 侧边栏改为深色系配色 (#1d1e1f)
- 添加渐变 Logo 配色 (#667eea → #764ba2)
- 侧边栏菜单添加激活态高亮（左侧边框）
- 添加侧边栏折叠功能（220px ↔ 64px）
- 添加面包屑导航
- 用户信息改为下拉菜单（个人中心、设置、退出）
- 添加数据统计 Dashboard（8项统计卡片）
- 添加快速操作入口
- 表单改为双列布局
- 路由 meta 添加 title 属性

### 2026-04-03
- 初始版本完成
- 实现所有CRUD功能
- 完成移动端适配
- 完成自动化测试

### 已知问题
- 无

### 待优化
- [ ] 生产环境构建配置
- [ ] 单元测试
- [ ] 数据备份/恢复
- [ ] 操作日志记录
- [ ] 深色模式支持
- [ ] 表格排序/筛选功能
