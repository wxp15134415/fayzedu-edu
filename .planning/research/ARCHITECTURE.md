# Fayzedu 架构模式研究：Rust + Axum 模块集成

**研究项目：** Fayzedu 教务管理系统  
**研究类型：** 架构维度（Brownfield 集成）  
**研究日期：** 2026-03-30  
**整体置信度：** HIGH

## 执行摘要

本架构研究聚焦于如何将新功能模块（学生管理、教师管理、班级管理、课程管理、考试管理、成绩管理、排课管理、请假管理等）高效地集成到现有的 Rust + Axum 架构中。通过分析现有代码结构（auth 模块、users 模块）和 Rust/Axum 生态系统最佳实践，提出了一套可扩展的模块化架构方案。

**核心发现：**

- 现有架构采用**分层模块化设计**（api/、models/、middleware/、db/），新模块应遵循相同模式
- Axum 的**路由器嵌套**和**状态共享**机制是模块集成的关键技术
- 推荐采用**领域驱动模块组织**，按业务实体划分而非技术层次划分
- 构建顺序应遵循**依赖倒置原则**，从基础设施层到业务领域层

---

## 一、现有架构分析

### 1.1 当前代码结构

现有后端采用经典的 Rust 项目结构：

```
fayzedu-server/src/
├── main.rs           # 入口点，路由配置
├── api/              # API 路由处理
│   ├── mod.rs        # 模块导出
│   └── auth.rs       # 认证模块（已实现）
├── models/           # 数据模型
│   ├── mod.rs
│   └── user.rs
├── db/               # 数据库连接
│   └── mod.rs
├── error.rs          # 错误定义
└── middleware/       # 中间件
    └── mod.rs
```

### 1.2 现有集成模式

通过分析 `main.rs` 的路由配置方式：

```rust
// main.rs 中的路由注册方式
let app = Router::new()
    .route("/", get(root_handler))
    .route("/health", get(health_check))
    .route("/api/auth/login", post(api::auth::login))
    .route("/api/auth/refresh", post(api::auth::refresh))
    .route("/api/auth/logout", post(api::auth::logout))
    .route("/api/auth/me", get(api::auth::me))
    .layer(cors)
    .with_state(state);
```

**当前特点：**

- 所有路由直接在 `Router::new()` 中注册
- 使用 `Arc<AppState>` 通过 `with_state()` 共享数据库连接池
- 认证模块独立文件 `auth.rs`，包含处理器和请求/响应结构体

---

## 二、推荐架构模式

### 2.1 模块组织原则

新功能模块应采用**领域驱动模块组织**，每个业务领域作为一个独立模块：

```
api/
├── mod.rs
├── auth.rs        # 认证模块（已有）
├── users.rs       # 用户管理（已有）
├── students.rs    # 学生管理
├── teachers.rs   # 教师管理
├── classes.rs    # 班级管理
├── courses.rs    # 课程管理
├── exams.rs      # 考试管理
├── scores.rs     # 成绩管理
├── grades.rs     # 年级管理
├── schedules.rs  # 排课管理
└── leaves.rs     # 请假管理

models/
├── mod.rs
├── user.rs       # 用户模型（已有）
├── student.rs   # 学生模型
├── teacher.rs   # 教师模型
├── class.rs     # 班级模型
├── course.rs    # 课程模型
├── exam.rs      # 考试模型
├── score.rs     # 成绩模型
├── grade.rs     # 年级模型
├── schedule.rs  # 排课模型
└── leave.rs     # 请假模型
```

### 2.2 组件边界定义

| 组件 | 职责 | 通信协议 | 边界 |
|------|------|----------|------|
| **Router (main.rs)** | 路由组装、状态注入、全局中间件 | HTTP + State | 外部边界 |
| **API Handlers** | 请求验证、业务逻辑编排、响应构造 | 内部函数调用 | 领域边界 |
| **Models** | 数据结构定义、序列化、数据库映射 | FromRow/Serialize | 数据边界 |
| **Database** | 持久化操作 | SQLx Query | 基础设施边界 |
| **Error** | 错误类型定义、HTTP 状态码映射 | IntoResponse | 错误边界 |

### 2.3 模块间通信

```
┌─────────────────────────────────────────────────────────────────┐
│                        Router (main.rs)                          │
│              路由组装 + 全局状态 + CORS 中间件                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐   ┌────────────┐   ┌────────────┐
    │ auth.rs   │   │ students.rs│   │ teachers.rs│
    │  认证模块  │   │  学生模块  │   │  教师模块  │
    └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                    ┌────────────┐
                    │  AppState  │
                    │ (DB Pool)  │
                    └─────┬──────┘
                           │
                           ▼
                    ┌────────────┐
                    │  SQLx      │
                    │ (SQLite)   │
                    └────────────┘
```

---

## 三、数据流设计

### 3.1 请求处理流程

```
HTTP 请求
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Router 匹配                                              │
│    - 路径匹配 (/api/students)                               │
│    - 方法匹配 (GET/POST/PUT/DELETE)                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. State 注入 (Arc<AppState>)                               │
│    - 提取数据库连接池                                        │
│    - 提取配置信息                                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Handler 处理                                             │
│    a. Json/Path/Query 提取器解析请求体                       │
│    b. 业务逻辑处理（调用数据库）                             │
│    c. 构造响应                                                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Error 转换                                               │
│    - AppError → HTTP 状态码 + JSON 响应体                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
    HTTP 响应 (Json)
```

### 3.2 典型 CRUD 数据流

以学生管理为例：

```rust
// students.rs 中的 CRUD 处理器

// 1. 创建学生 (POST /api/students)
pub async fn create_student(
    State(state): State<Arc<AppState>>,  // 状态注入
    Json(req): Json<CreateStudentRequest>,  // 请求解析
) -> Result<Json<serde_json::Value>, AppError> {
    // 2. 验证请求数据
    // 3. 数据库插入
    let student: Student = sqlx::query_as(
        "INSERT INTO students (...) VALUES (...) RETURNING ..."
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_| AppError::DatabaseError)?;
    
    // 4. 构造响应
    Ok(Json(serde_json::json!({
        "code": 0,
        "message": "创建成功",
        "data": student
    })))
}

// 2. 查询学生列表 (GET /api/students)
pub async fn list_students(
    State(state): State<Arc<AppState>>,
    Query(params): Query<ListParams>,
) -> Result<Json<serde_json::Value>, AppError> {
    // 分页查询
    let students: Vec<Student> = sqlx::query_as(
        "SELECT * FROM students LIMIT ? OFFSET ?"
    )
    .bind(params.page_size)
    .bind(params.offset)
    .fetch_all(&state.db)
    .await
    .map_err(|_| AppError::DatabaseError)?;
    
    Ok(Json(serde_json::json!({
        "code": 0,
        "message": "成功",
        "data": students
    })))
}
```

---

## 四、构建顺序与依赖

### 4.1 推荐模块构建顺序

基于业务依赖关系和技术依赖关系，推荐以下构建顺序：

| 阶段 | 模块 | 依赖 | 构建原因 |
|------|------|------|----------|
| **Phase 1** | 基础设施层 | - | 错误定义、数据库模块、中间件 |
| **Phase 2** | 基础业务层 | Phase 1 | 用户管理（认证依赖）、字典管理 |
| **Phase 3** | 核心业务层 A | Phase 1-2 | 年级管理、班级管理（依赖用户） |
| **Phase 4** | 核心业务层 B | Phase 1-3 | 教师管理、学生管理（依赖班级） |
| **Phase 5** | 业务领域层 | Phase 1-4 | 课程管理、排课管理（依赖教师/班级） |
| **Phase 6** | 业务流程层 | Phase 1-5 | 考试管理、成绩管理、请假管理 |

### 4.2 模块依赖图

```
Phase 1: 基础设施
├── error.rs (错误定义)
├── db/mod.rs (数据库连接)
└── middleware/ (日志、认证中间件)
    │
    ▼
Phase 2: 基础业务
├── users.rs (用户管理)
├── roles.rs (角色权限)
├── dicts.rs (字典管理)
└── menus.rs (菜单管理)
    │
    ├── grades.rs (年级管理)
    │   │
    │   └── classes.rs (班级管理)
    │       │
    │       ├── teachers.rs (教师管理)
    │       │   │
    │       │   └── courses.rs (课程管理)
    │       │       │
    │       │       └── schedules.rs (排课管理)
    │       │
    │       └── students.rs (学生管理)
    │           │
    │           ├── exams.rs (考试管理)
    │           │   │
    │           │   └── scores.rs (成绩管理)
    │           │
    │           └── leaves.rs (请假管理)
```

### 4.3 技术依赖顺序

除了业务依赖，还有技术实现依赖：

1. **首先扩展 `api/mod.rs`** - 添加新模块导出
2. **然后创建 `models/xxx.rs`** - 定义数据结构
3. **接着实现 `api/xxx.rs`** - 实现处理器
4. **最后在 `main.rs` 注册路由** - 组装到路由器

---

## 五、Axum 路由集成模式

### 5.1 当前模式改进

现有模式将所有路由直接注册在 `main.rs`。随着模块增加，建议采用**路由器合并**模式：

```rust
// main.rs - 改进后的路由配置

// 方式一：使用 merge 合并子路由（推荐）
use axum::Router;
use axum::routing::Router;

// 创建子路由
fn create_auth_router() -> Router {
    Router::new()
        .route("/api/auth/login", post(auth::login))
        .route("/api/auth/refresh", post(auth::refresh))
        .route("/api/auth/logout", post(auth::logout))
        .route("/api/auth/me", get(auth::me))
}

fn create_users_router() -> Router {
    Router::new()
        .route("/api/users", get(users::list))
        .route("/api/users", post(users::create))
        .route("/api/users/:id", get(users::get))
        .route("/api/users/:id", put(users::update))
        .route("/api/users/:id", delete(users::delete))
}

fn create_students_router() -> Router {
    Router::new()
        .route("/api/students", get(students::list))
        .route("/api/students", post(students::create))
        .route("/api/students/:id", get(students::get))
        .route("/api/students/:id", put(students::update))
        .route("/api/students/:id", delete(students::delete))
}

// 主路由组装
let app = Router::new()
    .route("/", get(root_handler))
    .route("/health", get(health_check))
    .merge(create_auth_router())
    .merge(create_users_router())
    .merge(create_students_router())
    // ... 其他模块
    .layer(cors)
    .with_state(state);
```

### 5.2 嵌套路由模式

对于有层级关系的资源（如班级下的学生），可以使用嵌套路由：

```rust
// classes.rs - 嵌套路由示例

fn create_classes_router() -> Router {
    Router::new()
        // 班级 CRUD
        .route("/api/classes", get(classes::list))
        .route("/api/classes", post(classes::create))
        .route("/api/classes/:id", get(classes::get))
        .route("/api/classes/:id", put(classes::update))
        .route("/api/classes/:id", delete(classes::delete))
        // 班级下的学生（嵌套路由）
        .route("/api/classes/:id/students", get(classes::list_students))
        // 班级下的课程
        .route("/api/classes/:id/courses", get(classes::list_courses))
}
```

### 5.3 路由分组与前缀

对于更复杂的模块，可以按功能分组：

```rust
fn create_api_router() -> Router {
    Router::new()
        .nest("/api/auth", create_auth_router())
        .nest("/api/system", create_system_router())  // users, roles, dicts, menus
        .nest("/api/education", create_education_router())  // grades, classes, students
        .nest("/api/teaching", create_teaching_router())  // teachers, courses, schedules
        .nest("/api/examination", create_exam_router())  // exams, scores
        .nest("/api/attendance", create_attendance_router())  // leaves
}
```

---

## 六、状态管理与依赖注入

### 6.1 应用状态定义

当前使用 `Arc<AppState>` 共享状态，新模块应遵循相同模式：

```rust
// main.rs

#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::SqlitePool,
    // 后续可扩展：
    // pub redis: redis::Client,
    // pub config: AppConfig,
}
```

### 6.2 模块内状态使用

每个处理器通过 `State<Arc<AppState>>` 提取器访问状态：

```rust
pub async fn list_students(
    State(state): State<Arc<AppState>>,
    Query(params): Query<PaginationParams>,
) -> Result<Json<Value>, AppError> {
    // 使用 state.db 执行数据库操作
    let students = sqlx::query_as::<_, StudentRow>(...)
        .fetch_all(&state.db)
        .await
        .map_err(|_| AppError::DatabaseError)?;
    
    Ok(Json(serde_json::json!({
        "code": 0,
        "message": "成功",
        "data": students
    })))
}
```

### 6.3 扩展状态（未来）

随着系统复杂度增加，可考虑添加更多状态：

```rust
#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::SqlitePool,
    pub redis: Option<redis::Client>,      // 缓存（可选）
    pub config: AppConfig,                  // 应用配置
    pub jwt_secret: String,                 // JWT 密钥
}

#[derive(Clone)]
pub struct AppConfig {
    pub server_port: u16,
    pub database_url: String,
    pub jwt_expiry: i64,
    // ... 其他配置
}
```

---

## 七、错误处理模式

### 7.1 现有错误类型

现有 `error.rs` 已定义基础错误类型：

```rust
#[derive(Error, Debug)]
pub enum AppError {
    #[error("认证失败: {0}")]
    Unauthorized(String),
    
    #[error("无效的请求: {0}")]
    BadRequest(String),
    
    #[error("资源未找到: {0}")]
    NotFound(String),
    
    #[error("内部服务器错误: {0}")]
    InternalError(String),
    
    #[error("数据库错误")]
    DatabaseError,
    
    // ... 其他错误
}
```

### 7.2 模块特定错误

新模块可在 `error.rs` 中添加模块特定错误：

```rust
// error.rs 扩展

#[derive(Error, Debug)]
pub enum AppError {
    // ... 现有错误
    
    // 学生管理错误
    #[error("学生不存在: {0}")]
    StudentNotFound(String),
    
    #[error("学号已存在: {0}")]
    StudentNoExists(String),
    
    // 班级管理错误
    #[error("班级不存在: {0}")]
    ClassNotFound(String),
    
    #[error("班级人数已满")]
    ClassFull,
    
    // 排课错误
    #[error("课程时间冲突")]
    ScheduleConflict,
    
    #[error("教师时间冲突")]
    TeacherScheduleConflict,
}
```

### 7.3 错误响应统一

所有错误通过 `IntoResponse` 自动转换为统一格式：

```json
{
  "code": 404,
  "message": "学生不存在: 12345",
  "data": null
}
```

---

## 八、可扩展性考虑

### 8.1 模块数量增长

当模块超过一定数量（如 10+）时，可考虑按大领域分组：

```
api/
├── mod.rs
├── auth/           # 认证领域
│   ├── mod.rs
│   └── handlers.rs
├── system/         # 系统管理领域
│   ├── mod.rs
│   ├── users.rs
│   ├── roles.rs
│   ├── dicts.rs
│   └── menus.rs
├── education/      # 教育管理领域
│   ├── mod.rs
│   ├── grades.rs
│   ├── classes.rs
│   └── students.rs
└── teaching/       # 教学管理领域
    ├── mod.rs
    ├── teachers.rs
    ├── courses.rs
    └── schedules.rs
```

### 8.2 数据库迁移策略

新模块需要数据库表时，使用 SQLx 迁移：

```rust
// db/mod.rs 中的迁移管理

pub async fn run_migrations(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::migrate!("./migrations")
        .run(pool)
        .await
}
```

迁移文件命名规范：

```
migrations/
├── 001_create_users.sql
├── 002_create_students.sql
├── 003_create_teachers.sql
├── 004_create_classes.sql
├── 005_create_courses.sql
└── ...
```

### 8.3 性能优化路径

| 阶段 | 优化措施 | 适用场景 |
|------|----------|----------|
| 初期 | SQLite + 连接池 | 小规模用户 |
| 中期 | 添加 Redis 缓存 | 查询频繁的数据 |
| 后期 | 读写分离 + PostgreSQL | 大规模用户 |

---

## 九、置信度评估

| 评估维度 | 置信度 | 说明 |
|----------|--------|------|
| 组件边界定义 | HIGH | 基于现有代码分析和 Axum 官方模式 |
| 数据流设计 | HIGH | 遵循 Axum 官方推荐模式 |
| 构建顺序 | HIGH | 基于业务依赖关系和 Rust 模块系统特性 |
| 可扩展性考虑 | MEDIUM | 考虑了未来扩展，但需根据实际业务调整 |

---

## 十、结论与建议

### 10.1 核心建议

1. **采用渐进式模块集成** - 按依赖顺序逐步添加模块
2. **保持现有模式一致** - 新模块遵循现有代码风格
3. **使用路由器合并** - 用 `.merge()` 代替直接在 main.rs 注册
4. **统一错误处理** - 扩展现有 `AppError` 而非创建新的错误类型

### 10.2 实施检查清单

- [ ] 模块边界清晰定义
- [ ] 数据流方向明确（请求 → 处理器 → 数据库 → 响应）
- [ ] 构建顺序已标注（Phase 1-6）
- [ ] 使用 Router::merge() 模式
- [ ] 遵循现有错误处理模式
- [ ] 数据库迁移脚本命名规范

### 10.3 下一步行动

1. 在 `api/mod.rs` 中添加新模块导出
2. 按构建顺序依次实现各模块
3. 使用本架构文档作为代码审查的参考标准

---

**参考来源：**

- Axum 官方文档：Router 与 Handler
- Rust Web 项目最佳实践（LogRocket、Leapcell）
- 现有 Fayzedu 代码库结构分析
