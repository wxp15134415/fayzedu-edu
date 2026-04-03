# EduSys 学校管理系统

## 项目简介

EduSys 是一个面向教育机构的综合管理系统，提供用户管理、角色权限、教务管理（年级、班级、学生、科目、成绩）等功能。

## 技术栈

### 后端
- **Framework**: NestJS
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT + Passport
- **Language**: TypeScript

### 前端
- **Framework**: Vue 3 + Composition API
- **UI Library**: Element Plus
- **State Management**: Pinia
- **Build Tool**: Vite
- **Language**: TypeScript
- **Testing**: Playwright (E2E)

## 功能特性

### 系统管理
- 用户管理（增删改查、禁用启用）
- 角色管理（系统角色/自定义角色）
- 权限组管理（RBAC 权限控制）
- 基础信息（学校名称、学年、学期）

### 教务管理
- 年级管理（学段：小学/初中/高中，入学年份、学年、学生数、班级数）
- 班级管理（班级编号，按入学年份和班级编号排序）
- 学生管理（学籍信息、选课组合、科类、座号）
- 科目管理（17门科目）
- 成绩管理（原始分、赋分、校内排名、联考排名）

### 考试管理
- 考试安排（考试名称、考试类型、所属年级、学期）
- 成绩录入（按考试查看学生成绩）

### 其他特性
- JWT 认证
- 响应式设计（支持移动端/4K大屏）
- 绿色主题配色

## 项目结构

```
edusys/
├── backend/          # 后端服务
│   ├── src/
│   │   ├── modules/  # 业务模块
│   │   ├── entities/ # 数据实体
│   │   └── main.ts  # 入口文件
│   └── package.json
├── frontend/         # 前端应用
│   ├── src/
│   │   ├── views/   # 页面组件
│   │   ├── api/     # API 接口
│   │   ├── stores/  # Pinia 状态管理
│   │   └── layouts/ # 布局组件
│   └── package.json
└── docs/             # 技术文档
```

## 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 14+
- npm 或 yarn

### 安装启动

1. **克隆项目**
```bash
cd /Users/wangxiaoping/fayzedu/edusys
```

2. **启动后端**
```bash
cd backend
npm install
npm run start:dev
# 后端服务运行在 http://localhost:3000
```

3. **启动前端**
```bash
cd frontend
npm install
npm run dev
# 前端服务运行在 http://localhost:5173
```

4. **默认账号**
- 用户名: admin
- 密码: admin123

## 开发指南

### 数据库配置
数据库连接配置在 `backend/.env` 文件中：
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=wangxiaoping
DB_PASSWORD=your_password
DB_DATABASE=edusys
```

### 主要配置文件
- 后端: `backend/src/main.ts` - 端口、CORS 配置
- 前端: `frontend/vite.config.ts` - 代理配置
- 前端: `frontend/src/utils/request.ts` - 请求拦截器

### 代码规范
- 使用 TypeScript 严格模式
- 使用 ESLint + Prettier
- 组件使用 Composition API + `<script setup>`

## 相关文档

- [数据库文档](./数据库文档.md)
- [API接口文档](./API接口文档.md)
- [目录结构文档](./目录结构文档.md)
- [常见错误文档](./常见错误.md)
- [常见错误文档](./常见错误.md)

## 许可

MIT License
