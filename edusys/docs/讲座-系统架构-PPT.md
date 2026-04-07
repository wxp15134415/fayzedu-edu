# EduSys 学校管理系统
## 架构与实现

---

# 第一部分：项目概览

## 1.1 项目背景
- 面向中小学的综合性学校管理系统
- 核心模块：用户权限、教务管理、考试管理、成绩管理

## 1.2 技术栈
| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + TypeScript + Element Plus |
| 后端 | NestJS + TypeORM |
| 数据库 | PostgreSQL 15+ |
| Python | FastAPI + Pandas |
| 部署 | Docker |

---

# 第二部分：系统架构

## 2.1 整体架构
```
┌─────────────────────────────────┐
│       Vue.js Frontend          │
│   (Element Plus / Pinia)       │
└────────────┬────────────────────┘
             │ HTTP + JWT
┌────────────▼────────────────────┐
│       NestJS Backend           │
│  (Controller / Service / Repo) │
└────────────┬────────────────────┘
             │
    ┌────────┼────────┐
    ▼        ▼        ▼
 PostgreSQL Python  Nginx
```

## 2.2 分层架构
- Controller: 路由、参数校验
- Service: 业务逻辑、事务
- Repository: 数据访问

---

# 第三部分：前端实现

## 3.1 技术选型
- **Vue 3**: Composition API, `<script setup>`
- **Element Plus**: 成熟组件库
- **Pinia**: 状态管理
- **TypeScript**: 类型安全

## 3.2 目录结构
```
frontend/src/
├── api/         # API封装
├── components/  # 公共组件
├── layouts/    # 布局
├── router/     # 路由配置
├── stores/     # Pinia状态
└── views/      # 页面组件
```

---

# 第四部分：后端实现

## 4.1 NestJS 核心概念
- Module: 模块定义
- Controller: 路由处理
- Service: 业务逻辑

## 4.2 数据库设计
- Grade → Class → Student
- Exam → ExamSession → ExamRoom

## 4.3 核心实体
```typescript
@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ name: 'student_no' })
  studentNo: string

  @ManyToOne(() => Class)
  class: Class
}
```

---

# 第五部分：Python 微服务

## 5.1 为什么需要 Python？
- Excel 解析（多格式支持）
- 学生匹配算法

## 5.2 Excel 解析
- 好分数、睿芽、七天系统
- 自动检测系统类型

## 5.3 学生匹配
- 策略1: 考号精确匹配
- 策略2: 学籍号匹配
- 策略3: 班级+姓名匹配

---

# 第六部分：关键特性

## 6.1 权限系统 (RBAC)
- 用户 → 角色 → 权限
- 路由守卫检查权限

## 6.2 文件上传
- Multer 接收文件
- 转发 Python 服务解析

## 6.3 事务管理
- QueryRunner 事务
- 保证数据一致性

## 6.4 移动端适配
- 响应式布局
- 条件渲染表格/卡片

---

# 第七部分：部署运维

## 7.1 Docker Compose
```yaml
services:
  postgres:
    image: postgres:15
  backend:
    build: ./backend
  frontend:
    build: ./frontend
  python:
    build: ./python-service
```

## 7.2 环境变量
- DATABASE_*
- JWT_SECRET
- PYTHON_API_URL

---

# 第八部分：实战案例

## 成绩导入模块
1. 选择考试 → 2. 选择系统
3. 上传文件 → 4. Python解析
5. 学生匹配 → 6. 保存正式表

## 技术挑战
- 格式多样 → Pandas解析
- 学生匹配 → 多策略
- 数据安全 → 事务

---

# 第九部分：关键词总结

## 前端
Vue 3 / TypeScript / Element Plus / Pinia / Vue Router / axios / Vite / JWT

## 后端
NestJS / TypeORM / PostgreSQL / Swagger / Interceptor / Guard / Filter / QueryRunner

## Python
FastAPI / Pandas / openpyxl / Pydantic / Uvicorn

## 部署
Docker / Docker Compose / Nginx / PM2

---

# 第十部分：总结与展望

## 已完成
- ✅ 用户权限系统
- ✅ 教务管理
- ✅ 考试编排
- ✅ 成绩导入

## 后续规划
- 成绩分析报表
- 家校互通
- 数据导出
- 性能优化

---

# 谢谢！

## Q&A