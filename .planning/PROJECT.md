# Fayzedu 教务管理系统项目

## 项目概述

Fayzedu 是一套完整的教育管理系统，采用现代化的技术栈构建，支持 Web 管理端和跨平台桌面应用。

## 技术架构

### 技术栈

| 组件 | 技术 |
|------|------|
| 后端 | Rust + Axum (端口 8080) |
| 前端 | Vue3 + NaiveUI + UnoCSS (端口 9980) |
| 数据库 | SQLite |
| 认证 | JWT 双令牌机制 |
| ORM | SQLx (异步) |
| 密码加密 | Argon2 |

### API 响应格式

```json
{
  "code": 0,
  "message": "操作成功",
  "data": { ... }
}
```

## 现有代码

### 后端模块 (Rust/Axum)

已实现的模块：
- 认证模块 (`/api/auth/*`) - 登录/登出/刷新Token
- 用户管理 (`/api/users`) - CRUD

待实现的模块：
- 学生管理 (`/api/students`)
- 教师管理 (`/api/teachers`)
- 班级管理 (`/api/classes`)
- 课程管理 (`/api/courses`)
- 考试管理 (`/api/exams`)
- 成绩管理 (`/api/scores`)
- 年级管理 (`/api/grades`)
- 排课管理 (`/api/schedules`)
- 请假管理 (`/api/leaves`)
- 角色权限 (`/api/roles`, `/api/permissions`)
- 字典管理 (`/api/dicts`)
- 菜单管理 (`/api/menus`)

### 前端模块 (Vue3)

已完成的页面：
- `/dashboard/workbench` - 工作台
- `/dashboard/monitor` - 监控
- `/list/card-list` - 卡片列表
- `/demo/fetch` - 请求示例
- `/demo/echarts` - 图表
- `/demo/editor/rich` - 富文本编辑器
- `/demo/clipboard` - 剪贴板
- `/demo/icons` - 图标
- `/demo/qr-code` - 二维码
- `/demo/cascader` - 级联选择
- `/documents/vite` - Vite 文档
- `/permission/permission` - 权限示例
- `/about` - 关于
- `/user-center` - 个人中心

存在 API 错误的页面：
- `/list/common-list` - 需要 `/api/users` 接口
- `/list/draggable-list` - 需要 `/api/users` 接口
- `/demo/dict` - 需要 `/api/dicts` 接口
- `/setting/account` - 需要 `/api/users` 接口
- `/setting/dictionary` - 需要 `/api/dicts` 接口
- `/setting/menu` - 需要 `/api/menus` 接口
- `/demo/map` - 百度地图 API 配置问题
- `/demo/editor/md` - 外部资源加载问题
- `/documents/vue` - CSP 安全策略限制

## 需求

### 已验证

- ✓ 认证模块 - 登录/登出/Token刷新
- ✓ 用户管理基础 - 用户登录
- ✓ 前端框架搭建 - Vue3 + NaiveUI

### 进行中

- [ ] 用户管理 CRUD - 用户列表、增删改查
- [ ] 字典管理 - 字典数据 CRUD
- [ ] 菜单管理 - 动态路由配置
- [ ] 学生管理 - 学生信息管理
- [ ] 教师管理 - 教师信息管理
- [ ] 班级管理 - 班级创建、编排
- [ ] 课程管理 - 课程信息管理
- [ ] 成绩管理 - 成绩录入、统计
- [ ] 排课管理 - 智能排课
- [ ] 请假管理 - 请假申请与审批

### 范围之外

- 桌面客户端开发 - Dioxus
- 离线同步功能
- 第三方登录 (OAuth)
- 文档编写规范：~/fayzedu/文档模板指南.md

## 关键决策

| 决策 | 理由 | 结果 |
|------|------|------|
| 使用 Rust + Axum | 高性能、类型安全 | - 进行中 |
| 使用 Vue3 + NaiveUI | 现代化组件库 | - 进行中 |
| 使用 SQLite | 简单部署 | - 进行中 |
| JWT 双令牌 | 安全认证 | - 已完成 |

---



*最后更新: 2026-03-30 项目初始化*
