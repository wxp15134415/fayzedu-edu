# 桌面端离线优先数据架构设计

> **功能名称：** 桌面端离线优先数据源切换与同步机制

**目标：** 为 Fayzedu 桌面端实现本地 SQLite 优先的数据架构，支持本地/云端数据源切换、云端合并、定时同步、退出时同步功能。

**架构：** 全新设计数据层，包含 DataSourceController、LocalStore、CloudAPI、SyncEngine 四大核心模块。

**技术栈：** Rust + Dioxus + SQLite (rusqlite) + reqwest

---

## 1. 功能需求

| 需求 | 描述 |
|------|------|
| F1 | 全局数据源开关：Header 提供本地/云端切换按钮 |
| F2 | 首次进入默认本地模式，用户切换后记住选择 |
| F3 | 云端可用性检测：启动时尝试请求云端接口，不可用则自动切换本地 |
| F4 | 手动同步：Header 提供"同步到云端"按钮 |
| F5 | 定时同步：每隔 N 分钟自动执行同步 |
| F6 | 退出时同步：应用关闭前自动执行同步 |
| F7 | 冲突处理：时间戳为准，自动解决冲突 |
| F8 | 模式提示：Toast 轻提示 + 状态栏持续显示当前模式 |

---

## 2. 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      main.rs (App)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ use_signal!(data_source: DataSource)                │   │
│  │ use_signal!(sync_status: SyncStatus)                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
┌─────────────────────┐           ┌─────────────────────┐
│  DataSourceController  │         │      Header         │
│  ─────────────────────│         │  ─────────────────  │
│  - current_source    │         │  [本地/云端开关]     │
│  - sync_status       │         │  [同步到云端按钮]    │
│  - last_sync_time   │         │  [状态栏显示]        │
└─────────┬───────────┘         └─────────────────────┘
          │
          │ 根据 current_source 路由
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    DataRouter                               │
│  match current_source {                                    │
│    Local  => LocalStore.get_xxx()                          │
│    Cloud  => CloudAPI.get_xxx()                             │
│  }                                                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌─────────────────────┐       ┌─────────────────────┐
│   LocalStore       │       │   CloudAPI          │
│   (SQLite)         │       │   (HTTP)           │
│                    │       │                    │
│ - students 表      │       │ - /api/students    │
│ - teachers 表      │       │ - /api/teachers    │
│ - exams 表         │       │ - /api/exams       │
│ - scores 表        │       │ - /api/scores      │
│ - settings 表      │       │ - ...              │
│ - sync_log 表      │       │                    │
└─────────────────────┘       └─────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                      SyncEngine                             │
│  触发方式:                                                 │
│    1. 手动按钮 → 立即执行                                  │
│    2. 定时器   → 每 N 分钟执行                            │
│    3. 退出时   → 应用关闭前执行                            │
│                                                              │
│  合并逻辑:                                                 │
│    - 比较 local.updated_at vs cloud.updated_at             │
│    - 时间戳新的覆盖时间戳旧的                              │
│    - 无需用户干预                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 数据模型

### 3.1 DataSource 枚举

```rust
#[derive(Clone, Copy, PartialEq)]
pub enum DataSource {
    Local,   // 本地数据模式
    Cloud,   // 云端数据模式
}
```

### 3.2 SyncStatus 枚举

```rust
#[derive(Clone, PartialEq)]
pub enum SyncStatus {
    Idle,                    // 空闲
    Syncing,                 // 同步中
    Success(DateTime),       // 同步成功
    Failed(String),          // 同步失败
    CloudUnavailable,        // 云端不可用
}
```

### 3.3 AppSettings 表 (SQLite)

```sql
CREATE TABLE app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);
```

预设配置项：
- `data_source` - 当前数据源: "local" 或 "cloud"
- `sync_interval_minutes` - 同步间隔分钟数，默认 5
- `sync_on_exit` - 退出时同步: "true" 或 "false"
- `last_sync_time` - 上次同步时间戳

### 3.4 数据表 (复用现有设计)

```sql
CREATE TABLE students (
    id TEXT PRIMARY KEY,
    data BLOB NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE teachers (
    id TEXT PRIMARY KEY,
    data BLOB NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER NOT NULL DEFAULT 0
);

-- exams, scores, classes, courses 等类似
```

---

## 4. 核心模块设计

### 4.1 LocalStore (`src/data/local_store.rs`)

```rust
pub struct LocalStore {
    conn: Mutex<Connection>,
}

impl LocalStore {
    pub fn new(db_path: &str) -> Result<Self>;
    
    // 通用 CRUD
    pub fn get_all<T: DeserializeOwned>(&self, table: &str) -> Result<Vec<T>>;
    pub fn get<T: DeserializeOwned>(&self, table: &str, id: &str) -> Result<Option<T>>;
    pub fn save<T: Serialize>(&self, table: &str, id: &str, data: &T) -> Result<()>;
    pub fn delete(&self, table: &str, id: &str) -> Result<()>;
    
    // 设置管理
    pub fn get_setting(&self, key: &str) -> Result<Option<String>>;
    pub fn set_setting(&self, key: &str, value: &str) -> Result<()>;
    
    // 同步辅助
    pub fn get_records_since(&self, table: &str, timestamp: i64) -> Result<Vec<Record>>;
    pub fn upsert_record(&self, table: &str, id: &str, data: &[u8], updated_at: i64) -> Result<()>;
}
```

### 4.2 CloudAPI (`src/data/cloud_api.rs`)

```rust
pub struct CloudAPI {
    client: reqwest::Client,
    base_url: String,
    token: String,
}

impl CloudAPI {
    pub fn new(base_url: &str, token: &str) -> Self;
    
    // 健康检查
    pub async fn check_health(&self) -> bool;
    
    // 学生
    pub async fn get_students(&self) -> Result<Vec<Student>>;
    pub async fn save_student(&self, student: &Student) -> Result<()>;
    
    // 教师
    pub async fn get_teachers(&self) -> Result<Vec<Teacher>>;
    
    // 其他实体...
    
    // 批量同步
    pub async fn sync_records(&self, records: Vec<SyncRecord>) -> Result<SyncResponse>;
}
```

### 4.3 DataSourceController (`src/data/controller.rs`)

```rust
pub struct DataSourceController {
    local: Arc<LocalStore>,
    cloud: Arc<CloudAPI>,
    current_source: Signal<DataSource>,
    sync_status: Signal<SyncStatus>,
    last_sync_time: Signal<Option<DateTime>>,
}

impl DataSourceController {
    // 初始化 + 云端检测
    pub async fn new() -> Result<Self>;
    
    // 读取数据（根据当前数据源自动选择）
    pub async fn get_students(&self) -> Result<Vec<Student>>;
    pub async fn get_student(&self, id: Uuid) -> Result<Option<Student>>;
    
    // 写入数据（根据当前数据源自动选择）
    pub async fn save_student(&self, student: &Student) -> Result<()>;
    pub async fn delete_student(&self, id: Uuid) -> Result<()>;
    
    // 数据源切换
    pub fn set_source(&self, source: DataSource);
    pub fn get_source(&self) -> DataSource;
    
    // 同步到云端（无论当前源是什么）
    pub async fn sync_to_cloud(&self) -> Result<SyncReport>;
    
    // 定时同步
    pub fn start_auto_sync(&self, interval_minutes: u64) -> StoppableTask;
    
    // 状态
    pub fn get_sync_status(&self) -> SyncStatus;
}
```

### 4.4 SyncEngine (`src/data/sync_engine.rs`)

```rust
pub struct SyncEngine {
    local: Arc<LocalStore>,
    cloud: Arc<CloudAPI>,
}

pub struct SyncReport {
    pub uploaded: usize,
    pub downloaded: usize,
    pub conflicts_resolved: usize,
    pub errors: Vec<String>,
}

impl SyncEngine {
    // 执行同步
    pub async fn sync(&self) -> Result<SyncReport> {
        let mut report = SyncReport::default();
        
        // 1. 获取本地自上次同步后的变更
        for table in TABLES {
            let local_changes = self.local.get_records_since(table, self.last_sync_timestamp)?;
            
            // 2. 上传到云端
            if !local_changes.is_empty() {
                match self.cloud.sync_records(local_changes.clone()).await {
                    Ok(response) => {
                        report.uploaded += response.uploaded;
                        for downloaded in response.downloaded {
                            self.local.upsert_record(
                                downloaded.table,
                                &downloaded.id,
                                &downloaded.data,
                                downloaded.updated_at,
                            )?;
                            report.downloaded += 1;
                        }
                    }
                    Err(e) => report.errors.push(e.to_string()),
                }
            }
            
            // 3. 从云端拉取变更（时间戳为准）
            let remote_changes = self.cloud.get_changes_since(table, self.last_sync_timestamp)?;
            for remote in remote_changes {
                if let Some(local) = self.local.get_record(table, &remote.id)? {
                    // 冲突检测：时间戳为准
                    if remote.updated_at > local.updated_at {
                        self.local.upsert_record(table, &remote.id, &remote.data, remote.updated_at)?;
                        report.conflicts_resolved += 1;
                    }
                } else {
                    self.local.upsert_record(table, &remote.id, &remote.data, remote.updated_at)?;
                    report.downloaded += 1;
                }
            }
        }
        
        Ok(report)
    }
    
    // 退出时同步
    pub async fn sync_on_exit(&self) -> Result<SyncReport> {
        self.sync().await
    }
}
```

---

## 5. UI 交互设计

### 5.1 Header 布局

```
┌────────────────────────────────────────────────────────────────────────┐
│  Fayzedu  [🔍 搜索...]    │ ○本地数据 ●云端数据 │ [🔄同步到云端] │ ... │
└────────────────────────────────────────────────────────────────────────┘
                               ↑                      ↑
                          全局开关                  手动同步按钮
```

### 5.2 数据源开关组件

```rust
#[component]
pub fn DataSourceToggle(
    current: DataSource,
    on_change: EventHandler<DataSource>,
) -> Element {
    rsx! {
        div {
            style: "display: flex; gap: 0.5rem;",
            button {
                onclick: move |_| on_change.call(DataSource::Local),
                style: if current == DataSource::Local { active_style } else { normal_style },
                "○ 本地数据"
            }
            button {
                onclick: move |_| on_change.call(DataSource::Cloud),
                style: if current == DataSource::Cloud { active_style } else { normal_style },
                "● 云端数据"
            }
        }
    }
}
```

### 5.3 同步按钮组件

```rust
#[component]
pub fn SyncButton(
    status: SyncStatus,
    on_click: EventHandler<()>,
) -> Element {
    let is_syncing = matches!(status, SyncStatus::Syncing);
    
    rsx! {
        button {
            disabled: is_syncing,
            onclick: move |_| if !is_syncing { on_click.call(()) },
            style: "display: flex; align-items: center; gap: 0.375rem;",
            if is_syncing {
                span { "🔄 同步中..." }
            } else {
                span { "🔄 同步到云端" }
            }
        }
    }
}
```

### 5.4 状态栏显示

```rust
#[component]
pub fn SyncStatusBar(status: SyncStatus, last_sync: Option<DateTime>) -> Element {
    let (icon, text, color) = match &status {
        SyncStatus::Idle => ("⚪", "就绪", "gray"),
        SyncStatus::Syncing => ("🔄", "同步中...", "blue"),
        SyncStatus::Success(_) => ("✅", "已同步", "green"),
        SyncStatus::Failed(e) => ("❌", format!("失败: {}", e), "red"),
        SyncStatus::CloudUnavailable => ("⚠️", "云端不可用", "orange"),
    };
    
    rsx! {
        div {
            style: "display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem;",
            span { style: "color: {color};", "{icon}" }
            span { "{text}" }
            if let Some(time) = last_sync {
                span { style: "color: gray;", "({time})" }
            }
        }
    }
}
```

### 5.5 Toast 提示

```rust
#[component]
pub fn ModeToast(source: DataSource) -> Element {
    use_effect(move || {
        // 3秒后自动消失
    });
    
    rsx! {
        div {
            style: "position: fixed; top: 70px; left: 50%; transform: translateX(-50%); \
                    background: #1f2937; color: white; padding: 0.75rem 1.5rem; \
                    border-radius: 0.5rem; z-index: 1000; animation: fadeIn 0.3s;",
            if source == DataSource::Local {
                "📱 当前使用本地数据"
            } else {
                "☁️ 当前使用云端数据"
            }
        }
    }
}
```

---

## 6. 启动流程

```
┌─────────────────────────────────────────────────────────────┐
│                      应用启动 (main)                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  1. 初始化 LocalStore                                       │
│     - 打开/创建 SQLite 数据库                               │
│     - 创建表（如果不存在）                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2. 读取上次选择的数据源设置                                 │
│     - 从 app_settings 表读取 data_source                   │
│     - 如果没有记录，默认 Local                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  3. 尝试连接云端（如果设置是 Cloud）                        │
│     - 调用 cloud.check_health() 或请求实际数据接口           │
│     - 超时设置：5秒                                         │
│     - 如果失败：                                            │
│       - 自动切换为 Local                                    │
│       - 记录状态 CloudUnavailable                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  4. 初始化 DataSourceController                             │
│     - 设置初始数据源                                        │
│     - 启动定时同步任务（如果启用）                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  5. 渲染 App + Header                                       │
│     - Header 显示当前模式                                    │
│     - 首次渲染 Toast 提示当前模式                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  6. 用户登录                                                │
│     - Toast 提示当前模式                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 退出流程

```
┌─────────────────────────────────────────────────────────────┐
│                      用户关闭应用                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  检查 sync_on_exit 设置                                      │
│  （从 app_settings 表读取）                                │
└─────────────────────────┬───────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
         sync_on_exit           sync_on_exit
         = "true"                = "false"
              │                       │
              ▼                       ▼
┌─────────────────────┐    ┌─────────────────────┐
│  执行 SyncEngine    │    │  直接退出           │
│  .sync_on_exit()   │    │                     │
│                     │    │                     │
│  - 上传本地变更    │    │                     │
│  - 拉取云端变更    │    │                     │
│  - 时间戳冲突解决  │    │                     │
└─────────────────────┘    └─────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                      应用退出                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. 文件结构

```
edusys/desktop/src/
├── main.rs                          # 入口，初始化 DataSourceController
├── lib.rs                           # 导出模块
│
├── data/                            # 新增：数据层
│   ├── mod.rs                      # 导出
│   ├── local_store.rs              # SQLite 本地存储
│   ├── cloud_api.rs                # 云端 API 客户端
│   ├── controller.rs               # 数据源控制器
│   ├── sync_engine.rs              # 同步引擎
│   └── models.rs                   # 数据类型定义
│
├── components/                      # 现有组件
│   ├── mod.rs
│   ├── header.rs                   # 修改：添加数据源开关、同步按钮
│   ├── theme.rs
│   └── ...
│
└── pages/                           # 现有页面（使用 DataSourceController）
    ├── students.rsx
    ├── teachers.rsx
    └── ...
```

---

## 9. 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| data_source | String | "local" | 当前数据源 |
| sync_interval_minutes | u32 | 5 | 自动同步间隔 |
| sync_on_exit | bool | true | 退出时是否同步 |
| cloud_timeout_seconds | u32 | 5 | 云端请求超时 |
| last_sync_time | i64 | 0 | 上次同步时间戳 |

---

## 10. 错误处理

| 场景 | 处理方式 |
|------|----------|
| 云端连接超时 | 自动切换 Local，显示 Toast 提示 |
| 同步失败 | 显示错误状态，继续使用本地数据 |
| 本地数据库错误 | 回退到只读模式，提示用户 |
| 写入冲突 | 时间戳自动解决，无需用户干预 |

---

## 11. 实现优先级

1. **P0 - 核心功能**
   - LocalStore 完整 CRUD
   - CloudAPI 基础请求
   - DataSourceController 路由逻辑
   - Header 数据源开关

2. **P1 - 同步功能**
   - SyncEngine 同步逻辑
   - 手动同步按钮
   - 定时同步

3. **P2 - 增强功能**
   - 退出时同步
   - Toast 模式提示
   - 状态栏显示

4. **P3 - 优化**
   - 错误重试
   - 离线队列
   - 冲突日志
