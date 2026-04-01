# Nova-Admin 前后端完整分析报告

## 一、项目概述

Nova-Admin 是一个**前后端分离的中后台管理系统完整解决方案**，包括：

| 项目 | 说明 | 地址 |
|------|------|------|
| **nova-admin** | 前端管理界面 (Vue3 + Naive UI) | https://github.com/chansee97/nova-admin |
| **nova-admin-nest** | 后端服务 (NestJS + TypeORM) | https://github.com/chansee97/nova-admin-nest |

**在线预览地址**: https://nova-admin.pages.dev/

**文档站点**: https://nova-admin-docs.pages.dev/

---

## 二、技术栈一览

### 2.1 前端技术栈 (nova-admin)

| 类别 | 技术选型 |
|------|----------|
| 框架 | Vue 3.4+ (Composition API + `<script setup>`) |
| 构建 | Vite 6+ |
| 语言 | TypeScript 5+ |
| UI 组件库 | Naive UI + pro-naive-ui |
| 样式 | UnoCSS (原子化 CSS) |
| 状态管理 | Pinia |
| 请求库 | alova |
| 路由 | Vue Router 4 |
| 图标 | @iconify/vue |
| 工具库 | @vueuse/core, dayjs |
| 国际化 | vue-i18n |

### 2.2 后端技术栈 (nova-admin-nest)

| 类别 | 技术选型 |
|------|----------|
| 框架 | NestJS |
| ORM | TypeORM 0.3 |
| 数据库 | PostgreSQL 17+ |
| 语言 | TypeScript 5.9 |
| API 文档 | Swagger |
| 认证 | JWT |

---

## 三、前端项目功能特性

### 3.1 核心功能

- **最新技术栈** - 基于 Vue3、Vite6、TypeScript、NaiveUI、UnoCSS 等最新技术栈开发
- **网络请求封装** - 基于 Alova 封装和配置，提供统一的响应处理和多场景能力
- **权限管理** - 完善的前后端权限管理方案
  - 菜单角色权限控制 (`roles` 字段)
  - `v-permission` 指令
  - `hasPermission` 方法
- **路由配置** - 支持本地静态路由和后台动态路由
- **组件封装** - 对日常使用频率较高的组件二次封装
- **主题适配** - 黑暗主题支持，保持 Naive 风格
- **多语言** - i18n 多语言支持

### 3.2 菜单结构 (8大分类)

```
├── 1. 仪表盘
│   ├── 工作台
│   └── 监控页
├── 2. 多级菜单演示
│   ├── 多级菜单子页
│   ├── 菜单详情页 (隐藏)
│   └── 多级菜单 (三级)
│       └── 多级菜单3-1 (四级)
├── 3. 列表页
│   ├── 常用列表
│   ├── 卡片列表
│   └── 拖拽列表
├── 4. 功能示例
│   ├── 请求示例
│   ├── ECharts 图表
│   ├── 地图示例
│   ├── 编辑器 (MarkDown/富文本)
│   ├── 剪贴板
│   ├── 图标选择器
│   ├── 二维码
│   ├── 省市区联动
│   └── 字典示例
├── 5. 外链文档
│   ├── Vue
│   ├── Vite
│   ├── VueUse (外链)
│   └── Nova docs (外链)
├── 6. 权限
│   ├── 权限示例
│   └── super可见 (角色权限演示)
├── 7. 系统设置
│   ├── 用户设置
│   ├── 字典设置
│   └── 菜单设置
└── 8. 关于
    └── 关于页
```

### 3.3 路由数据结构

```typescript
interface AppRoute.RowRoute {
  id: number           // 唯一标识
  pid: number | null  // 父级ID
  name: string        // 路由名称
  path: string        // 路由路径
  title: string       // 菜单标题
  menuType: 'dir' | 'page'  // 目录/页面
  componentPath?: string      // 组件路径
  requiresAuth?: boolean     // 是否需要认证
  roles?: string[]          // 角色权限
  hide?: boolean            // 是否隐藏
  keepAlive?: boolean       // 是否缓存
  pinTab?: boolean          // 是否固定标签
  href?: string            // 外链地址
  activeMenu?: string       // 激活菜单路径
}
```

### 3.4 权限控制

**三层防护**：
1. 全局守卫层面 (guard.ts) - TOKEN 检查
2. 路由层面 - hasPermission(roles)
3. 菜单层面 - 过滤无权限菜单项

**使用方式**：

```vue
<!-- 指令方式 -->
<n-button v-permission="'admin'">删除</n-button>

<!-- Hook 方式 -->
<script setup>
const { hasPermission } = usePermission()
</script>
<template>
  <n-button v-if="hasPermission('admin')">删除</n-button>
</template>
```

---

## 四、后端项目功能特性

### 4.1 核心功能

- **JWT 认证** - 基于 JSON Web Token 的身份认证
- **RBAC 权限控制** - 用户 → 角色 → 权限的完整权限体系
- **菜单权限** - 动态菜单生成，精确到按钮级别的权限控制
- **接口权限** - 基于装饰器的接口权限验证
- **数据权限** - 支持部门数据权限隔离
- **验证码** - 内置图形验证码（支持数学、大小写敏感配置）

### 4.2 模块结构

```
src/
├── modules/           # 业务模块
│   ├── auth/          # 认证模块
│   ├── user/          # 用户管理
│   ├── role/          # 角色管理
│   ├── menu/          # 菜单管理
│   ├── dept/          # 部门管理
│   └── dict/          # 字典管理
├── common/            # 公共模块
│   ├── decorators/    # 装饰器
│   ├── filters/       # 异常过滤器
│   ├── guards/        # 守卫
│   ├── interceptors/  # 拦截器
│   └── enums/         # 枚举定义
└── utils/             # 工具函数
```

### 4.3 数据库设计

| 表名 | 说明 |
|------|------|
| sys_user | 用户表 |
| sys_role | 角色表 |
| sys_menu | 菜单表 |
| sys_dept | 部门表 |
| sys_dict_type | 字典类型表 |
| sys_dict_data | 字典数据表 |
| sys_user_role | 用户角色关联表 |
| sys_role_menu | 角色菜单关联表 |
| sys_role_dept | 角色部门关联表 |

### 4.4 权限装饰器

```typescript
// 公开接口（无需登录）
@Public()

// 仅权限校验
@RequirePermissions('system:user:query')

// 仅角色校验  
@RequireRoles('admin')

// 同时校验权限与角色
@RequireAuth(['system:user:assign'], ['admin'])
```

### 4.5 数据范围权限

支持以下数据范围类型：

| 类型 | 说明 |
|------|------|
| 全部数据权限 | 可以访问所有数据 |
| 自定数据权限 | 只能访问指定部门及其子部门 |
| 部门数据权限 | 只能访问本部门的数据 |
| 部门及以下 | 访问本部门及其子部门 |
| 仅本人数据 | 只能访问自己创建的数据 |

---

## 五、环境变量配置

### 5.1 前端环境变量

| 变量名 | 类型 | 默认值 | 说明 |
|-------|------|--------|------|
| VITE_BASE_URL | string | / | 项目运行的基础路径 |
| VITE_APP_NAME | string | Nova - Admin | 项目名称 |
| VITE_ROUTE_LOAD_MODE | dynamic \| static | dynamic | 路由加载模式 |
| VITE_HOME_PATH | string | /dashboard/workbench | 登录后跳转路径 |
| VITE_STORAGE_PREFIX | string | null | 存储前缀 |
| VITE_AUTO_REFRESH_TOKEN | Y \| N | Y | 自动刷新 Token |
| VITE_DEFAULT_LANG | zhCN \| enUS | enUS | 默认语言 |

### 5.2 后端环境配置

通过代码化配置区分环境（根据 `NODE_ENV` 读取）：

- 开发环境：`src/config/env/dev.ts`
- 生产环境：`src/config/env/prod.ts`

```typescript
// 开发环境配置示例
export default {
  server: { port: 3000 },
  database: {
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'root',
    password: 'postgres',
    database: 'nova_db',
    synchronize: true,
  },
  jwt: {
    secret: 'secret-key',
    expiresIn: '7d',
  },
}
```

---

## 六、项目目录结构

### 6.1 前端目录结构

```
nova-admin
├── src
│   ├── components/       # 公共组件
│   │   ├── common/      # 框架内部组件
│   │   └── custom/      # 自定义组件
│   ├── directives/      # 自定义指令
│   │   ├── copy.ts      # v-copy 指令
│   │   └── permission.ts # v-permission 指令
│   ├── hooks/           # 组合式函数
│   │   ├── usePermission.ts   # 权限
│   │   ├── useEcharts.ts       # ECharts
│   │   └── useLoading.ts       # Loading
│   ├── layouts/         # 全局布局
│   │   ├── leftMenu.layout.vue # 左菜单布局
│   │   └── topMenu.layout.vue  # 顶部菜单布局
│   ├── router/          # 路由配置
│   │   ├── routes.static.ts    # 本地静态路由
│   │   └── guard.ts            # 路由守卫
│   ├── service/         # 网络请求
│   │   ├── http/        # Alova 请求封装
│   │   └── api/        # 接口配置
│   ├── store/          # 状态管理
│   │   ├── auth.ts     # 用户权限
│   │   ├── route/      # 路由状态
│   │   └── tab.ts      # Tab 页签
│   └── views/          # 页面视图
├── locales/            # 多语言配置
├── build/              # 构建配置
└── public/            # 静态资源
```

### 6.2 后端目录结构

```
nova-admin-nest
├── src
│   ├── modules/        # 业务模块
│   │   ├── auth/       # 认证模块
│   │   ├── user/       # 用户管理
│   │   ├── role/       # 角色管理
│   │   ├── menu/       # 菜单管理
│   │   ├── dept/       # 部门管理
│   │   └── dict/       # 字典管理
│   ├── common/         # 公共模块
│   │   ├── decorators/ # 装饰器
│   │   ├── filters/    # 异常过滤器
│   │   ├── guards/    # 守卫
│   │   ├── interceptors/ # 拦截器
│   │   └── enums/     # 枚举定义
│   ├── utils/         # 工具函数
│   └── config/        # 配置文件
├── example.sql        # 示例数据
└── package.json
```

---

## 七、快速开始

### 7.1 前端安装

```bash
# 推荐 pnpm 10.x + Node.js 21.x
pnpm install

# 开发
pnpm dev

# 构建
pnpm build

# Docker 部署
docker compose -f docker-compose.product.yml up --build -d
```

### 7.2 后端安装

```bash
# 环境要求
# - Node.js >= 22.0.0
# - PostgreSQL >= 17.0
# - pnpm >= 9.0.0

pnpm install

# 开发环境
pnpm start:dev

# 生产环境
pnpm build
pnpm start:prod

# API 文档
# 启动后访问 http://localhost:3000/api-docs
```

---

## 八、前后端数据流

```
┌─────────────────────────────────────────────────────────────┐
│                         前端 (nova-admin)                     │
├─────────────────────────────────────────────────────────────┤
│  用户登录 → JWT Token → 本地存储                             │
│                                                              │
│  请求拦截 → 携带 Token → 后端 API                           │
│                                                              │
│  路由守卫 → Token 验证 → 权限校验 → 动态生成路由             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       后端 (nova-admin-nest)                 │
├─────────────────────────────────────────────────────────────┤
│  JWT 验证 → 用户认证                                         │
│                                                              │
│  权限装饰器 → 角色/权限校验                                  │
│                                                              │
│  数据权限 → 部门级别过滤                                     │
│                                                              │
│  响应数据 → 前端展示                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 九、核心文件清单

### 9.1 前端核心文件

| 文件路径 | 功能说明 |
|----------|----------|
| /src/router/routes.static.ts | 静态路由配置 |
| /src/router/index.ts | 路由入口 |
| /src/router/guard.ts | 路由守卫 |
| /src/store/router/index.ts | 路由状态管理 |
| /src/store/router/helper.ts | 路由辅助函数 |
| /src/layouts/index.vue | 主布局组件 |
| /src/hooks/usePermission.ts | 权限 Hook |
| /src/service/http/alova.ts | 请求封装 |

### 9.2 后端核心文件

| 文件路径 | 功能说明 |
|----------|----------|
| /src/modules/auth/ | 认证模块 |
| /src/modules/user/ | 用户管理 |
| /src/modules/role/ | 角色管理 |
| /src/modules/menu/ | 菜单管理 |
| /src/common/decorators/ | 权限装饰器 |
| /src/config/env/dev.ts | 开发配置 |

---

## 十、总结

Nova-Admin 是一个**前后端完整的中后台管理系统解决方案**，其核心特点：

### 前端特点
1. **扁平化路由配置** - 通过 `id` + `pid` 实现灵活的菜单层级
2. **动态路由生成** - 支持静态配置和动态从后端获取
3. **完善的权限体系** - 三层防护（守卫、路由、菜单）
4. **丰富的组件集成** - Naive UI + ECharts + 地图等
5. **响应式设计** - 支持多种布局模式

### 后端特点
1. **NestJS 架构** - 模块化、装饰器风格
2. **TypeORM** - 类型安全的数据库操作
3. **RBAC 权限** - 用户-角色-权限完整体系
4. **数据权限** - 部门级别数据隔离
5. **Swagger 文档** - 自动生成 API 文档

### 适用场景
- 快速搭建中后台管理系统
- 企业内部管理系统
- SaaS 平台管理后台
- 教育管理系统

该系统适合作为中后台管理系统的开发起点，可以快速在此基础上进行业务开发。

---

*报告生成时间：2026年3月31日*
*项目版本：nova-admin (前端) + nova-admin-nest (后端)*
