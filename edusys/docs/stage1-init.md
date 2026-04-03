# 阶段一：项目初始化

## 时间
2026-04-02

## 目标
创建前后端基础项目结构

## 前端初始化

### 创建项目目录
```bash
mkdir -p edusys/frontend/src/{api,views,stores,router,layouts,utils}
```

### 安装依赖
```bash
cd edusys/frontend
pnpm add vue vue-router pinia axios element-plus @element-plus/icons-vue
pnpm add -D vite @vitejs/plugin-vue typescript vue-tsc
```

### 核心文件

#### package.json
- name: edusys-frontend
- 版本: 1.0.0
- 描述: 学校管理系统

#### vite.config.ts
- 端口: 5173
- 代理: /api -> http://localhost:3000
- 局域网访问: host: '0.0.0.0'

#### index.html
- 标题: 学校管理系统
- viewport: 移动端适配

#### src/main.ts
- 引入Vue, Pinia, Router, Element Plus
- 中文locale配置

#### src/App.vue
- 基础模板，router-view

## 后端初始化

### 创建项目目录
```bash
mkdir -p edusys/backend/src/{entities,modules/{auth,user,role,permission,grade,class,student,subject,score}}
```

### 安装依赖
```bash
cd edusys/backend
pnpm add @nestjs/core @nestjs/common @nestjs/platform-express @nestjs/typeorm @nestjs/jwt @nestjs/passport typeorm pg passport passport-jwt bcrypt class-validator class-transformer
pnpm add -D @nestjs/cli typescript ts-node @types/node @types/passport-jwt @types/bcrypt
```

### 核心文件

#### package.json
- name: edusys-backend
- 脚本: start:dev

#### tsconfig.json
- target: ES2020
- module: commonjs
- 路径别名: @ -> src

#### src/main.ts
- 端口: 3000
- 全局前缀: /api
- CORS: 开启
- 验证管道: ValidationPipe

#### src/app.module.ts
- 导入所有模块
- TypeORM配置 (PostgreSQL)

## 数据库配置

### PostgreSQL
- 主机: localhost
- 端口: 5432
- 用户名: wangxiaoping
- 数据库: edusys

## 初始账号
- 用户名: admin
- 密码: admin123
- 角色: 超级管理员