# 技术栈研究报告：Rust 后端 API (2025)

**项目：** Fayzedu 教育管理系统  
**研究日期：** 2026-03-30  
**研究类型：** 技术栈维度（brownfield 后续开发）

---

## 执行摘要

本研究报告为 Fayzedu 教育管理系统的后续功能模块开发（用户管理、字典管理、菜单管理等）提供 Rust 后端技术栈推荐。基于现有项目已采用的 Axum + SQLx 技术栈，本研究验证了当前选择的合理性，并补充了 2025 年推荐的辅助库。

**核心结论：** 项目当前技术栈选择符合 2025 年 Rust 后端开发最佳实践，Axum + SQLx 组合是构建高性能 REST API 的推荐方案。

---

## 1. Web 框架

### 1.1 主框架：Axum

| 项目 | 推荐 |
|------|------|
| **库** | `axum` |
| **版本** | `0.8` |
| **MSRV** | 1.78.0 |

**推荐理由：**

- **异步优先**：Axum 构建于 Tower 和 Hyper 之上，天然支持异步，完美契合 Rust 的并发模型
- ** ergonomics**：提取器（Extractor）模式使请求处理直观简洁
- **生态成熟**：2025 年已成为 Rust Web 框架的事实标准，大量社区示例和教程
- **与 Tower 兼容**：可使用丰富的 Tower 中间件（如 CORS、限流、压缩等）

**替代方案：**

| 框架 | 适用场景 | 为何不推荐 |
|------|---------|-----------|
| Actix-web | 需要极高吞吐量的场景 | 生态不如 Axum 活跃，API 相对复杂 |
| Rocket | 喜欢声明式路由的开发者 | 异步支持不如 Axum 自然 |
| warp | 需要高度定制化的场景 | 学习曲线较陡 |

**置信度：** HIGH — 多个 2025 年技术文章和教程一致推荐

---

### 1.2 运行时：Tokio

| 项目 | 推荐 |
|------|------|
| **库** | `tokio` |
| **版本** | `1` |
| **特性** | `full` |

**推荐理由：**

- Rust 异步runtime 的标准选择
- 与 Axum 原生集成
- `full` 特性包含所有常用功能（同步原语、文件系统、网络等）

**置信度：** HIGH — 行业标准

---

### 1.3 HTTP 中间件：Tower HTTP

| 项目 | 推荐 |
|------|------|
| **库** | `tower-http` |
| **版本** | `0.6` |
| **特性** | `cors`, `trace`, `compress`, `add_extension` |

**推荐理由：**

- 提供开箱即用的 CORS 支持
- 内置请求追踪（OpenTelemetry 集成）
- 响应压缩、类型安全的 header 操作

**置信度：** HIGH — Axum 官方推荐

---

## 2. 数据库层

### 2.1 ORM：SQLx

| 项目 | 推荐 |
|------|------|
| **库** | `sqlx` |
| **版本** | `0.8` |
| **特性** | `runtime-tokio`, `sqlite`, `postgres`, `macros` |

**推荐理由：**

- **编译时检查**：SQL 查询在编译时验证，减少运行时错误
- **异步原生**：真正的异步数据库操作，无阻塞
- **多数据库支持**：SQLite（开发）、PostgreSQL（生产）无缝切换
- **类型安全**：从数据库列自动推断 Rust 类型

**替代方案：**

| ORM | 适用场景 | 为何不推荐 |
|-----|---------|-----------|
| Diesel | 偏好同步 API 的场景 | 异步支持不如 SQLx |
| SeaORM | 需要 ORM 完整功能的场景 | 复杂度较高，学习曲线陡 |
| rusqlite | 简单场景不需要异步 | 不支持异步连接池 |

**置信度：** HIGH — 2025 年 Rust + SQL 组合的标准选择

---

### 2.2 数据库迁移：SQLx CLI

| 项目 | 推荐 |
|------|------|
| **工具** | `sqlx-cli` |
| **版本** | 与 SQLx 匹配 |

**推荐理由：**

- 命令行管理数据库迁移
- 支持 SQLite 和 PostgreSQL
- 集成在 Cargo workflow 中

**置信度：** HIGH

---

## 3. 认证与安全

### 3.1 JWT 处理

| 项目 | 推荐 |
|------|------|
| **库** | `jsonwebtoken` |
| **版本** | `9` |

**推荐理由：**

- 轻量级 JWT 编解码
- 支持 RS256/HS256 等多种算法
- 活跃维护，漏洞修复及时

**替代方案：**

| 库 | 适用场景 | 为何不推荐 |
|-----|---------|-----------|
| `jwt-simple` | 需要更复杂验证逻辑 | API 相对复杂 |
| `biscuit-auth` | 需要授权令牌 | 超出单纯 JWT 需求 |

**置信度：** HIGH — crates.io 下载量领先

---

### 3.2 密码哈希

| 项目 | 推荐 |
|------|------|
| **库** | `argon2` |
| **版本** | `0.5` |
| **绑定** | `argon2` crate |

**推荐理由：**

- Argon2 是密码哈希竞赛（PHC）冠军
- 比 bcrypt 更抗 GPU 破解
- 官方提供安全参数默认值

**替代方案：**

| 库 | 适用场景 | 为何不推荐 |
|-----|---------|-----------|
| `bcrypt` | 遗留系统兼容 | 已被 Argon2 超越 |
| `scrypt` | 需要硬件兼容 | 参数配置复杂 |

**置信度：** HIGH — 行业标准

---

### 3.3 数据验证

| 项目 | 推荐 |
|------|------|
| **库** | `validator` + `axum-valid` |
| **版本** | `0.18` + `0.24` |

**推荐理由：**

- `validator` 提供丰富的验证宏（`#[validate(email)]`, `#[validate(length(min = 8))]` 等）
- `axum-valid` 将验证集成到 Axum 提取器中，自动返回 400 错误

**替代方案：**

| 库 | 适用场景 | 为何不推荐 |
|-----|---------|-----------|
| `garde` | 需要更强大规则 | API 相对复杂 |
| `validify` | 喜欢链式 API | 生态较小 |

**置信度：** MEDIUM — validator 是最流行的验证库，但 axum-valid 相对较新

---

## 4. 序列化与反序列化

### 4.1 JSON 处理

| 项目 | 推荐 |
|------|------|
| **库** | `serde` + `serde_json` |
| **版本** | `1` + `1` |

**推荐理由：**

- Rust 序列化的事实标准
- 几乎所有 Rust Web 库都基于 serde
- 零成本抽象

**置信度：** HIGH — 不可或缺

---

### 4.2 时间处理

| 项目 | 推荐 |
|------|------|
| **库** | `chrono` |
| **版本** | `0.4` |
| **特性** | `serde` |

**推荐理由：**

- 功能完整的时间库
- 时区支持
- 与 serde 无缝集成

**替代方案：**

| 库 | 适用场景 | 为何不推荐 |
|-----|---------|-----------|
| `time` | 简单场景 | 功能不如 chrono 完整 |
| `rustix` | 追求极致性能 | 不适合 Web 开发 |

**置信度：** HIGH — 成熟稳定

---

## 5. 日志与追踪

### 5.1 日志框架

| 项目 | 推荐 |
|------|------|
| **库** | `tracing` + `tracing-subscriber` |
| **版本** | `0.1` + `0.3` |
| **特性** | `env-filter`, `json`, `fmt` |

**推荐理由：**

- 结构化日志（类似 OpenTelemetry）
- 与异步代码完美集成
- 可输出 JSON 格式供日志收集系统解析

**替代方案：**

| 库 | 适用场景 | 为何不推荐 |
|-----|---------|-----------|
| `log` + `env_logger` | 简单控制台输出 | 不支持结构化日志 |
| `log4rs` | 需要日志轮转 | 配置复杂 |

**置信度：** HIGH — 2025 年结构化日志标准

**日志输出格式建议：**

```rust
// 开发环境：人类可读
tracing-subscriber::fmt()
// 生产环境：JSON 格式
tracing-subscriber::fmt().json()
```

---

### 5.2 请求追踪

| 项目 | 推荐 |
|------|------|
| **库** | `tower-http` + OpenTelemetry |

**推荐理由：**

- `tower-http` 提供基础的 trace layer
- 需要更完整的可观测性时，集成 OpenTelemetry

**置信度：** MEDIUM — 根据项目规模选择

---

## 6. 错误处理

### 6.1 错误类型

| 项目 | 推荐 |
|------|------|
| **库** | `thiserror` + `anyhow` |
| **版本** | `2` + `1` |

**推荐理由：**

- `thiserror`：定义应用程序错误类型，生成友好的 `Display` 实现
- `anyhow`：简化错误传播，适合应用程序代码

**使用场景：**

```rust
// 库/框架层：使用 thiserror
#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("数据库错误: {0}")]
    Database(#[from] sqlx::Error),
    
    #[error("未授权")]
    Unauthorized,
}

// 应用层：使用 anyhow
fn do_something() -> anyhow::Result<Response> {
    let user = get_user().await?;
    // ...
}
```

**置信度：** HIGH — Rust 社区最佳实践

---

## 7. 配置管理

### 7.1 环境变量

| 项目 | 推荐 |
|------|------|
| **库** | `dotenv` |
| **版本** | `0.15` |

**推荐理由：**

- 从 `.env` 文件加载环境变量
- 开发环境必备
- 与 `std::env` 无缝配合

**替代方案：**

| 库 | 适用场景 | 为何不推荐 |
|-----|---------|-----------|
| `figment` | 需要复杂配置层级 | 超出简单需求 |
| `config` | 多格式配置文件 | 依赖较多 |

**置信度：** HIGH — 简单直接

---

### 7.2 配置结构

| 项目 | 推荐 |
|------|------|
| **模式** | 使用 `serde` + `#[derive(Deserialize)]` |

**示例：**

```rust
#[derive(Deserialize, Debug)]
pub struct Config {
    #[serde(default = "default_port")]
    pub server_port: u16,
    
    #[serde(default = "default_jwt_secret")]
    pub jwt_secret: String,
    
    pub database: DatabaseConfig,
}

#[derive(Deserialize, Debug)]
pub struct DatabaseConfig {
    pub url: String,
}

fn default_port() -> u16 { 8080 }
fn default_jwt_secret() -> String { "dev-secret".to_string() }
```

**置信度：** HIGH

---

## 8. 工具库

### 8.1 UUID 生成

| 项目 | 推荐 |
|------|------|
| **库** | `uuid` |
| **版本** | `1` |
| **特性** | `v4`, `serde` |

**推荐理由：**

- 生成符合 RFC 4122 的 UUID
- v4（随机）适合大多数场景
- Serde 支持序列化

**置信度：** HIGH

---

### 8.2 懒加载

| 项目 | 推荐 |
|------|------|
| **库** | `once_cell` |
| **版本** | `1` |

**推荐理由：**

- 编译期或运行时一次性初始化
- 适合全局配置、连接池等

**替代方案：** Rust 1.70+ 内置 `std::sync::LazyLock`

**置信度：** MEDIUM — 根据 MSRV 选择

---

## 9. API 文档

### 9.1 OpenAPI/Swagger

| 项目 | 推荐 |
|------|------|
| **库** | `utoipa` + `utoipa-axum` |
| **版本** | 最新稳定版 |

**推荐理由：**

- 从代码注释自动生成 OpenAPI 文档
- 与 Axum 路由无缝集成
- 支持 Swagger UI 和 ReDoc

**何时使用：**

- 需要为前端提供 API 文档
- 与第三方开发者共享 API

**置信度：** MEDIUM — 2025 年 OpenAPI 生成的主流选择

---

## 10. 项目依赖汇总

### 10.1 完整推荐列表

```toml
[dependencies]
# Web 框架
axum = { version = "0.8", features = ["macros", "ws"] }
tokio = { version = "1", features = ["full"] }
tower = "0.5"
tower-http = { version = "0.6", features = ["cors", "trace", "compress", "add_extension"] }

# 数据库
sqlx = { version = "0.8", features = ["runtime-tokio", "sqlite", "postgres", "macros", "chrono", "uuid"] }

# 序列化
serde = { version = "1", features = ["derive"] }
serde_json = "1"

# 认证与安全
jsonwebtoken = "9"
argon2 = "0.5"

# 验证
validator = { version = "0.18", features = ["derive"] }
axum-valid = "0.24"

# 时间
chrono = { version = "0.4", features = ["serde"] }

# 日志
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter", "json", "fmt"] }

# 错误处理
thiserror = "2"
anyhow = "1"

# 配置
dotenv = "0.15"

# 工具
uuid = { version = "1", features = ["v4", "serde"] }
once_cell = "1"

# 可选：API 文档
utoipa = { version = "4", features = ["axum-extras"], optional = true }
utoipa-axum = { version = "0.4", optional = true }
utoipa-swagger-ui = { version = "7", optional = true }

[dev-dependencies]
tokio-test = "0.4"
tower = { version = "0.5", features = ["util"] }
```

### 10.2 各模块推荐

| 模块 | 核心库 | 辅助库 |
|------|--------|--------|
| REST API | axum | tower-http, serde |
| 数据库 | sqlx | chrono, uuid |
| 认证 | jsonwebtoken, argon2 | validator |
| 日志 | tracing | tracing-subscriber |
| 错误处理 | thiserror, anyhow | - |
| 配置 | dotenv | serde |

---

## 11. 架构模式建议

### 11.1 分层架构

```
┌─────────────────────────────────────┐
│         API Layer (axum)            │
│   路由定义、请求处理、响应构建         │
├─────────────────────────────────────┤
│       Service Layer (业务逻辑)       │
│   业务规则、数据转换、事务管理         │
├─────────────────────────────────────┤
│       Repository Layer (sqlx)        │
│   数据库操作、查询构建                 │
├─────────────────────────────────────┤
│         Model Layer                  │
│   数据结构、验证规则                   │
└─────────────────────────────────────┘
```

### 11.2 错误传播模式

```rust
// 1. 定义应用错误
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("数据库错误: {0}")]
    Database(#[from] sqlx::Error),
    
    #[error("未授权")]
    Unauthorized,
    
    #[error("资源不存在: {0}")]
    NotFound(String),
}

// 2. 转换为 HTTP 响应
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::Database(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, self.to_string()),
            AppError::NotFound(id) => (StatusCode::NOT_FOUND, id),
        }.into_response()
    }
}
```

---

## 12. 生产环境检查清单

| 检查项 | 推荐工具/库 |
|--------|------------|
| 代码格式 | `cargo fmt` |
| 静态分析 | `cargo clippy` |
| 安全审计 | `cargo audit` |
| 依赖更新 | `cargo outdated` |
| 测试覆盖 | `cargo tarpaulin` |
| API 文档 | `cargo doc` + `utoipa` |
| 性能基准 | `cargo bench` |

---

## 13. 结论与建议

### 13.1 当前项目评估

Fayzedu 项目当前使用的技术栈：

```toml
axum = "0.8"
sqlx = "0.8"
jsonwebtoken = "9"
argon2 = "0.5"
validator = "0.18"
chrono = "0.4"
tracing = "0.1"
tower-http = "0.6"
thiserror = "2"
anyhow = "1"
uuid = "1"
```

**评估结论：** ✅ 技术栈选择完全符合 2025 年 Rust 后端开发最佳实践

### 13.2 改进建议

1. **添加 `axum-valid`**：简化请求验证
2. **添加 `utoipa`**：如果需要 API 文档
3. **配置结构化**：使用 `#[derive(Deserialize)]` 的配置结构
4. **统一错误处理**：采用 `thiserror` + `IntoResponse` 模式

### 13.3 不推荐的库

| 库 | 原因 |
|-----|------|
| `actix-web` | Axum 生态更活跃 |
| `diesel` | 异步支持不如 SQLx |
| `rocket` | 异步模型不如 Axum 自然 |
| `bcrypt` | 被 Argon2 超越 |
| `log` + `env_logger` | 不支持结构化日志 |

---

## 14. 参考来源

### 14.1 权威来源

- [Axum 官方文档](https://docs.rs/axum/latest/axum/)
- [SQLx 官方文档](https://docs.rs/sqlx/latest/sqlx/)
- [Rust Web 开发最佳实践 2025](https://reintech.io/blog/build-production-ready-api-axum-sqlx) (2026-02-17)
- [7 Essential Rust Libraries](https://dev.to/james_miller_8dc58a89cb9e/7-essential-rust-libraries-for-building-high-performance-backends-4o2j) (2026-01-08)

### 14.2 置信度评估

| 类别 | 置信度 | 说明 |
|------|--------|------|
| Web 框架 | HIGH | 多篇文章一致推荐 Axum |
| ORM | HIGH | SQLx 编译时检查是独特优势 |
| 认证 | HIGH | jsonwebtoken + argon2 是标准组合 |
| 验证 | MEDIUM | validator 流行但 axum-valid 较新 |
| 日志 | HIGH | tracing 是结构化日志标准 |
| 配置 | HIGH | dotenv 简单直接 |

---

*最后更新：2026-03-30*
