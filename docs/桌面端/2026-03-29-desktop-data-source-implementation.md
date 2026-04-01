# 桌面端离线优先数据架构实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为 Fayzedu 桌面端实现本地 SQLite 优先的数据架构，支持本地/云端数据源切换、云端合并、定时同步、退出时同步功能。

**架构：** 全新设计数据层，包含 DataSourceController、LocalStore、CloudAPI、SyncEngine 四大核心模块。

**技术栈：** Rust + Dioxus + SQLite (rusqlite) + reqwest

---

## 文件结构

在定义任务之前，先列出将要创建或修改的文件：

| 文件 | 操作 | 职责 |
|------|------|------|
| `edusys/desktop/src/data/mod.rs` | 创建 | 数据层模块导出 |
| `edusys/desktop/src/data/models.rs` | 创建 | 数据类型定义（DataSource、SyncStatus 等） |
| `edusys/desktop/src/data/local_store.rs` | 创建 | SQLite 本地存储 |
| `edusys/desktop/src/data/cloud_api.rs` | 创建 | 云端 API 客户端 |
| `edusys/desktop/src/data/controller.rs` | 创建 | 数据源控制器 |
| `edusys/desktop/src/data/sync_engine.rs` | 创建 | 同步引擎 |
| `edusys/desktop/src/components/mod.rs` | 修改 | 导出新组件 |
| `edusys/desktop/src/components/data_source.rs` | 创建 | 数据源切换组件 |
| `edusys/desktop/src/components/sync_button.rs` | 创建 | 同步按钮组件 |
| `edusys/desktop/src/components/toast.rs` | 创建 | Toast 提示组件 |
| `edusys/desktop/src/components/status_bar.rs` | 创建 | 状态栏组件 |
| `edusys/desktop/src/components/header.rs` | 修改 | 集成数据源开关和同步按钮 |
| `edusys/desktop/src/main.rs` | 修改 | 初始化 DataSourceController |
| `edusys/desktop/Cargo.toml` | 修改 | 添加依赖 |

---

## 第一阶段：基础数据类型（P0）

### 任务 1：创建数据模型

**文件：**
- 创建：`edusys/desktop/src/data/models.rs`
- 修改：`edusys/desktop/src/data/mod.rs`

- [ ] **步骤 1：创建 data/models.rs 文件**

```rust
// edusys/desktop/src/data/models.rs
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

// 数据源枚举
#[derive(Clone, Copy, PartialEq, Debug)]
pub enum DataSource {
    Local,
    Cloud,
}

impl Default for DataSource {
    fn default() -> Self {
        DataSource::Local
    }
}

impl std::fmt::Display for DataSource {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DataSource::Local => write!(f, "local"),
            DataSource::Cloud => write!(f, "cloud"),
        }
    }
}

impl std::str::FromStr for DataSource {
    type Err = String;
    
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "cloud" => Ok(DataSource::Cloud),
            _ => Ok(DataSource::Local),
        }
    }
}

// 同步状态枚举
#[derive(Clone, PartialEq, Debug)]
pub enum SyncStatus {
    Idle,
    Syncing,
    Success(DateTime<Utc>),
    Failed(String),
    CloudUnavailable,
}

impl Default for SyncStatus {
    fn default() -> Self {
        SyncStatus::Idle
    }
}

// 同步报告
#[derive(Clone, Debug, Default)]
pub struct SyncReport {
    pub uploaded: usize,
    pub downloaded: usize,
    pub conflicts_resolved: usize,
    pub errors: Vec<String>,
}

// 同步记录
#[derive(Clone, Debug)]
pub struct SyncRecord {
    pub table: String,
    pub id: String,
    pub data: Vec<u8>,
    pub updated_at: i64,
}

// 同步响应
#[derive(Clone, Debug)]
pub struct SyncResponse {
    pub uploaded: usize,
    pub downloaded: Vec<SyncRecord>,
}
```

- [ ] **步骤 2：创建 data/mod.rs**

```rust
// edusys/desktop/src/data/mod.rs
pub mod models;
pub mod local_store;
pub mod cloud_api;
pub mod controller;
pub mod sync_engine;

pub use models::*;
pub use local_store::LocalStore;
pub use cloud_api::CloudAPI;
pub use controller::DataSourceController;
pub use sync_engine::SyncEngine;
```

- [ ] **步骤 3：验证编译**

运行：`cd /Users/wangxiaoping/fayzedu/edusys/desktop && cargo check`
预期：PASS（无错误）

---

## 第二阶段：本地存储（P0）

### 任务 2：实现 LocalStore

**文件：**
- 创建：`edusys/desktop/src/data/local_store.rs`

- [ ] **步骤 1：编写 local_store.rs 基础结构**

```rust
// edusys/desktop/src/data/local_store.rs
use rusqlite::{Connection, params};
use std::sync::Mutex;
use std::path::PathBuf;
use crate::data::models::{DataSource, SyncRecord};

pub struct LocalStore {
    conn: Mutex<Connection>,
}

impl LocalStore {
    pub fn new(db_path: &str) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let conn = Connection::open(db_path)?;
        Self::init_tables(&conn)?;
        Ok(Self { conn: Mutex::new(conn) })
    }
    
    fn init_tables(conn: &Connection) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // app_settings 表
        conn.execute(
            "CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at INTEGER NOT NULL
            )",
            [],
        )?;
        
        // 数据表（通用结构）
        let tables = ["students", "teachers", "exams", "scores", "classes", "courses"];
        for table in tables {
            conn.execute(
                &format!(
                    "CREATE TABLE IF NOT EXISTS {} (
                        id TEXT PRIMARY KEY,
                        data BLOB NOT NULL,
                        updated_at INTEGER NOT NULL,
                        deleted INTEGER NOT NULL DEFAULT 0
                    )",
                    table
                ),
                [],
            )?;
        }
        
        Ok(())
    }
    
    // 设置管理
    pub fn get_setting(&self, key: &str) -> Result<Option<String>, Box<dyn std::error::Error + Send + Sync>> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;
        let result: Result<String, _> = conn.query_row(
            "SELECT value FROM app_settings WHERE key = ?1",
            params![key],
            |row| row.get(0),
        );
        
        match result {
            Ok(v) => Ok(Some(v)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(Box::new(e)),
        }
    }
    
    pub fn set_setting(&self, key: &str, value: &str) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;
        let timestamp = chrono::Utc::now().timestamp();
        conn.execute(
            "INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?1, ?2, ?3)",
            params![key, value, timestamp],
        )?;
        Ok(())
    }
    
    // 通用 CRUD
    pub fn get_all<T: serde::de::DeserializeOwned>(
        &self,
        table: &str,
    ) -> Result<Vec<T>, Box<dyn std::error::Error + Send + Sync>> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;
        let mut stmt = conn.prepare(
            &format!(
                "SELECT data FROM {} WHERE deleted = 0 ORDER BY updated_at DESC",
                table
            )
        )?;
        
        let rows = stmt.query_map([], |row| row.get::<_, Vec<u8>>(0))?;
        let mut results = Vec::new();
        
        for row in rows {
            let data: Vec<u8> = row?;
            if let Ok(item) = serde_json::from_slice(&data) {
                results.push(item);
            }
        }
        
        Ok(results)
    }
    
    pub fn get<T: serde::de::DeserializeOwned>(
        &self,
        table: &str,
        id: &str,
    ) -> Result<Option<T>, Box<dyn std::error::Error + Send + Sync>> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;
        let result: Result<Vec<u8>, _> = conn.query_row(
            &format!("SELECT data FROM {} WHERE id = ?1 AND deleted = 0", table),
            params![id],
            |row| row.get(0),
        );
        
        match result {
            Ok(data) => Ok(Some(serde_json::from_slice(&data)?)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(Box::new(e)),
        }
    }
    
    pub fn save<T: serde::Serialize>(
        &self,
        table: &str,
        id: &str,
        data: &T,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;
        let timestamp = chrono::Utc::now().timestamp();
        let data_bytes = serde_json::to_vec(data)?;
        
        conn.execute(
            &format!(
                "INSERT OR REPLACE INTO {} (id, data, updated_at, deleted) VALUES (?1, ?2, ?3, 0)",
                table
            ),
            params![id, data_bytes, timestamp],
        )?;
        
        Ok(())
    }
    
    pub fn delete(
        &self,
        table: &str,
        id: &str,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;
        let timestamp = chrono::Utc::now().timestamp();
        
        conn.execute(
            &format!("UPDATE {} SET deleted = 1, updated_at = ?1 WHERE id = ?2", table),
            params![timestamp, id],
        )?;
        
        Ok(())
    }
    
    // 同步辅助
    pub fn get_records_since(
        &self,
        table: &str,
        timestamp: i64,
    ) -> Result<Vec<SyncRecord>, Box<dyn std::error::Error + Send + Sync>> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;
        let mut stmt = conn.prepare(
            &format!("SELECT id, data, updated_at FROM {} WHERE updated_at > ?1", table)
        )?;
        
        let rows = stmt.query_map(params![timestamp], |row| {
            Ok(SyncRecord {
                table: table.to_string(),
                id: row.get(0)?,
                data: row.get(1)?,
                updated_at: row.get(2)?,
            })
        })?;
        
        let mut results = Vec::new();
        for row in rows {
            results.push(row?);
        }
        
        Ok(results)
    }
    
    pub fn upsert_record(
        &self,
        table: &str,
        id: &str,
        data: &[u8],
        updated_at: i64,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;
        
        conn.execute(
            &format!(
                "INSERT OR REPLACE INTO {} (id, data, updated_at, deleted) VALUES (?1, ?2, ?3, 0)",
                table
            ),
            params![id, data, updated_at],
        )?;
        
        Ok(())
    }
}
```

- [ ] **步骤 2：验证编译**

运行：`cd /Users/wangxiaoping/fayzedu/edusys/desktop && cargo check`
预期：PASS（可能需要添加 rusqlite 和 chrono 依赖）

- [ ] **步骤 3：更新 Cargo.toml 添加依赖**

修改：`edusys/desktop/Cargo.toml`

```toml
[dependencies]
rusqlite = { version = "0.31", features = ["bundled"] }
chrono = { version = "0.4", features = ["serde"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
reqwest = { version = "0.11", features = ["json", "blocking"] }
tokio = { version = "1.0", features = ["full"] }
```

---

## 第三阶段：云端 API（P0）

### 任务 3：实现 CloudAPI

**文件：**
- 创建：`edusys/desktop/src/data/cloud_api.rs`

- [ ] **步骤 1：编写 cloud_api.rs**

```rust
// edusys/desktop/src/data/cloud_api.rs
use reqwest::Client;
use std::time::Duration;
use crate::data::models::{SyncRecord, SyncResponse};
use fayzedu_shared::{Student, Teacher};

pub struct CloudAPI {
    client: Client,
    base_url: String,
    token: String,
}

impl CloudAPI {
    pub fn new(base_url: &str, token: &str) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(5))
            .build()
            .expect("Failed to create HTTP client");
        
        Self {
            client,
            base_url: base_url.to_string(),
            token: token.to_string(),
        }
    }
    
    pub async fn check_health(&self) -> bool {
        // 尝试请求实际数据接口，超时则不可用
        match self.client
            .get(&format!("{}/api/students?limit=1", self.base_url))
            .header("Authorization", format!("Bearer {}", self.token))
            .send()
            .await
        {
            Ok(resp) => resp.status().is_success(),
            Err(_) => false,
        }
    }
    
    pub async fn get_students(&self) -> Result<Vec<Student>, Box<dyn std::error::Error + Send + Sync>> {
        let resp = self.client
            .get(&format!("{}/api/students", self.base_url))
            .header("Authorization", format!("Bearer {}", self.token))
            .send()
            .await?;
        
        if !resp.status().is_success() {
            return Err(format!("API error: {}", resp.status()).into());
        }
        
        let students: Vec<Student> = resp.json().await?;
        Ok(students)
    }
    
    pub async fn save_student(&self, student: &Student) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let resp = self.client
            .post(&format!("{}/api/students", self.base_url))
            .header("Authorization", format!("Bearer {}", self.token))
            .json(student)
            .send()
            .await?;
        
        if !resp.status().is_success() {
            return Err(format!("API error: {}", resp.status()).into());
        }
        
        Ok(())
    }
    
    pub async fn get_teachers(&self) -> Result<Vec<Teacher>, Box<dyn std::error::Error + Send + Sync>> {
        let resp = self.client
            .get(&format!("{}/api/teachers", self.base_url))
            .header("Authorization", format!("Bearer {}", self.token))
            .send()
            .await?;
        
        if !resp.status().is_success() {
            return Err(format!("API error: {}", resp.status()).into());
        }
        
        let teachers: Vec<Teacher> = resp.json().await?;
        Ok(teachers)
    }
    
    pub async fn save_teacher(&self, teacher: &Teacher) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let resp = self.client
            .post(&format!("{}/api/teachers", self.base_url))
            .header("Authorization", format!("Bearer {}", self.token))
            .json(teacher)
            .send()
            .await?;
        
        if !resp.status().is_success() {
            return Err(format!("API error: {}", resp.status()).into());
        }
        
        Ok(())
    }
    
    pub async fn sync_records(&self, records: Vec<SyncRecord>) -> Result<SyncResponse, Box<dyn std::error::Error + Send + Sync>> {
        // 批量同步接口
        let resp = self.client
            .post(&format!("{}/api/sync/batch", self.base_url))
            .header("Authorization", format!("Bearer {}", self.token))
            .json(&records)
            .send()
            .await?;
        
        if !resp.status().is_success() {
            return Err(format!("Sync API error: {}", resp.status()).into());
        }
        
        let response: SyncResponse = resp.json().await?;
        Ok(response)
    }
}
```

- [ ] **步骤 2：验证编译**

运行：`cd /Users/wangxiaoping/fayzedu/edusys/desktop && cargo check`
预期：PASS

---

## 第四阶段：数据源控制器（P0）

### 任务 4：实现 DataSourceController

**文件：**
- 创建：`edusys/desktop/src/data/controller.rs`

- [ ] **步骤 1：编写 controller.rs**

```rust
// edusys/desktop/src/data/controller.rs
use std::sync::Arc;
use dioxus::prelude::*;
use crate::data::models::{DataSource, SyncStatus, SyncReport};
use crate::data::{LocalStore, CloudAPI, SyncEngine};

pub struct DataSourceController {
    local: Arc<LocalStore>,
    cloud: Arc<CloudAPI>,
    pub current_source: Signal<DataSource>,
    pub sync_status: Signal<SyncStatus>,
    pub last_sync_time: Signal<Option<chrono::DateTime<chrono::Utc>>>,
}

impl DataSourceController {
    pub async fn new() -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        // 1. 初始化 LocalStore
        let local = Arc::new(LocalStore::new("fayzedu.db")?);
        
        // 2. 读取上次选择的数据源设置
        let saved_source = local.get_setting("data_source")?
            .map(|s| s.parse::<DataSource>())
            .unwrap_or(Ok(DataSource::Local))?;
        
        // 3. 初始化 CloudAPI
        let cloud = Arc::new(CloudAPI::new(
            "http://localhost:8080",
            "your-token-here",
        ));
        
        // 4. 如果设置是 Cloud，尝试检测云端可用性
        let mut final_source = saved_source;
        if saved_source == DataSource::Cloud {
            if !cloud.check_health().await {
                final_source = DataSource::Local;
                // 记录状态为云端不可用
                local.set_setting("data_source", "local")?;
            }
        }
        
        // 5. 初始化 SyncEngine
        let sync_engine = SyncEngine::new(local.clone(), cloud.clone());
        
        Ok(Self {
            local,
            cloud,
            current_source: Signal::new(final_source),
            sync_status: Signal::new(SyncStatus::Idle),
            last_sync_time: Signal::new(None),
        })
    }
    
    // 数据源切换
    pub fn set_source(&self, source: DataSource) {
        // 保存设置
        let _ = self.local.set_setting("data_source", &source.to_string());
        self.current_source.set(source);
    }
    
    pub fn get_source(&self) -> DataSource {
        *self.current_source.read()
    }
    
    // 同步到云端
    pub async fn sync_to_cloud(&self) -> Result<SyncReport, Box<dyn std::error::Error + Send + Sync>> {
        self.sync_status.set(SyncStatus::Syncing);
        
        let engine = SyncEngine::new(self.local.clone(), self.cloud.clone());
        let result = engine.sync().await;
        
        match result {
            Ok(report) => {
                self.sync_status.set(SyncStatus::Success(chrono::Utc::now()));
                self.last_sync_time.set(Some(chrono::Utc::now()));
                Ok(report)
            }
            Err(e) => {
                self.sync_status.set(SyncStatus::Failed(e.to_string()));
                Err(e)
            }
        }
    }
    
    pub fn get_sync_status(&self) -> SyncStatus {
        self.sync_status.read().clone()
    }
}
```

- [ ] **步骤 2：验证编译**

运行：`cd /Users/wangxiaoping/fayzedu/edusys/desktop && cargo check`
预期：PASS

---

## 第五阶段：同步引擎（P1）

### 任务 5：实现 SyncEngine

**文件：**
- 创建：`edusys/desktop/src/data/sync_engine.rs`

- [ ] **步骤 1：编写 sync_engine.rs**

```rust
// edusys/desktop/src/data/sync_engine.rs
use std::sync::Arc;
use crate::data::models::{SyncRecord, SyncResponse, SyncReport};

pub struct SyncEngine {
    local: Arc<crate::data::LocalStore>,
    cloud: Arc<crate::data::CloudAPI>,
}

impl SyncEngine {
    pub fn new(
        local: Arc<crate::data::LocalStore>,
        cloud: Arc<crate::data::CloudAPI>,
    ) -> Self {
        Self { local, cloud }
    }
    
    pub async fn sync(&self) -> Result<SyncReport, Box<dyn std::error::Error + Send + Sync>> {
        let mut report = SyncReport::default();
        
        // 获取上次同步时间
        let last_sync = self.local.get_setting("last_sync_time")?
            .and_then(|s| s.parse::<i64>().ok())
            .unwrap_or(0);
        
        // 定义要同步的表
        let tables = ["students", "teachers", "exams", "scores", "classes", "courses"];
        
        for table in tables {
            // 1. 获取本地自上次同步后的变更
            let local_changes = self.local.get_records_since(table, last_sync)?;
            
            // 2. 上传到云端
            if !local_changes.is_empty() {
                match self.cloud.sync_records(local_changes.clone()).await {
                    Ok(response) => {
                        report.uploaded += response.uploaded;
                        for downloaded in response.downloaded {
                            self.local.upsert_record(
                                &downloaded.table,
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
        }
        
        // 3. 更新最后同步时间
        let timestamp = chrono::Utc::now().timestamp();
        self.local.set_setting("last_sync_time", &timestamp.to_string())?;
        
        Ok(report)
    }
    
    pub async fn sync_on_exit(&self) -> Result<SyncReport, Box<dyn std::error::Error + Send + Sync>> {
        self.sync().await
    }
}
```

- [ ] **步骤 2：验证编译**

运行：`cd /Users/wangxiaoping/fayzedu/edusys/desktop && cargo check`
预期：PASS

---

## 第六阶段：UI 组件（P1）

### 任务 6：创建 UI 组件

**文件：**
- 创建：`edusys/desktop/src/components/data_source.rs`
- 创建：`edusys/desktop/src/components/sync_button.rs`
- 创建：`edusys/desktop/src/components/toast.rs`

- [ ] **步骤 1：创建 data_source.rs**

```rust
// edusys/desktop/src/components/data_source.rs
use dioxus::prelude::*;
use crate::data::models::DataSource;

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
                style: if current == DataSource::Local {
                    "background: #4F46E5; color: white; border: none; padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.8125rem;"
                } else {
                    "background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb; padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.8125rem;"
                },
                "📱 本地数据"
            }
            button {
                onclick: move |_| on_change.call(DataSource::Cloud),
                style: if current == DataSource::Cloud {
                    "background: #4F46E5; color: white; border: none; padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.8125rem;"
                } else {
                    "background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb; padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.8125rem;"
                },
                "☁️ 云端数据"
            }
        }
    }
}
```

- [ ] **步骤 2：创建 sync_button.rs**

```rust
// edusys/desktop/src/components/sync_button.rs
use dioxus::prelude::*;
use crate::data::models::SyncStatus;

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
            style: if is_syncing {
                "background: #f3f4f6; color: #9ca3af; border: 1px solid #e5e7eb; padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.8125rem; cursor: not-allowed;"
            } else {
                "background: white; color: #4F46E5; border: 1px solid #4F46E5; padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.8125rem; cursor: pointer;"
            },
            if is_syncing {
                span { "🔄 同步中..." }
            } else {
                span { "🔄 同步到云端" }
            }
        }
    }
}
```

- [ ] **步骤 3：创建 toast.rs**

```rust
// edusys/desktop/src/components/toast.rs
use dioxus::prelude::*;
use crate::data::models::DataSource;

#[component]
pub fn ModeToast(
    source: DataSource,
    visible: bool,
) -> Element {
    if !visible {
        return None;
    }
    
    rsx! {
        div {
            style: "position: fixed; top: 70px; left: 50%; transform: translateX(-50%); \
                    background: #1f2937; color: white; padding: 0.75rem 1.5rem; \
                    border-radius: 0.5rem; z-index: 1000; animation: fadeIn 0.3s; \
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);",
            if source == DataSource::Local {
                "📱 当前使用本地数据"
            } else {
                "☁️ 当前使用云端数据"
            }
        }
    }
}

#[component]
pub fn SyncStatusBar(
    status: SyncStatus,
    last_sync: Option<chrono::DateTime<chrono::Utc>>,
) -> Element {
    let (icon, text, color) = match &status {
        SyncStatus::Idle => ("⚪", "就绪", "#6b7280"),
        SyncStatus::Syncing => ("🔄", "同步中...", "#3b82f6"),
        SyncStatus::Success(_) => ("✅", "已同步", "#10b981"),
        SyncStatus::Failed(e) => ("❌", format!("失败: {}", e), "#ef4444"),
        SyncStatus::CloudUnavailable => ("⚠️", "云端不可用", "#f59e0b"),
    };
    
    let time_str = last_sync.map(|t| t.format("%H:%M:%S").to_string());
    
    rsx! {
        div {
            style: "display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem;",
            span { style: "color: {color};", "{icon}" }
            span { "{text}" }
            if let Some(time) = time_str {
                span { style: "color: #9ca3af;", "({time})" }
            }
        }
    }
}
```

- [ ] **步骤 4：更新 components/mod.rs**

```rust
// edusys/desktop/src/components/mod.rs
pub mod navbar;
pub mod layout;
pub mod theme;
pub mod sidebar;
pub mod header;
pub mod sync_status;
pub mod course_selection;
pub mod data_source;  // 新增
pub mod sync_button;   // 新增
pub mod toast;         // 新增

pub use navbar::*;
pub use layout::*;
pub use theme::*;
pub use sidebar::*;
pub use header::*;
pub use sync_status::*;
pub use course_selection::*;
pub use data_source::*;
pub use sync_button::*;
pub use toast::*;
```

- [ ] **步骤 5：验证编译**

运行：`cd /Users/wangxiaoping/fayzedu/edusys/desktop && cargo check`
预期：PASS

---

## 第七阶段：集成到 Header（P1）

### 任务 7：修改 Header 组件

**文件：**
- 修改：`edusys/desktop/src/components/header.rs`

- [ ] **步骤 1：修改 header.rs 添加数据源开关和同步按钮**

在 header.rs 中添加 Props 和渲染逻辑：

```rust
// 在 HeaderProps 中添加
pub data_source: DataSource,
pub on_data_source_change: EventHandler<DataSource>,
pub sync_status: SyncStatus,
pub on_sync_click: EventHandler<()>,
```

在 Header 组件渲染中添加（大约在功能按钮区域）：

```rust
// 数据源切换
DataSourceToggle {
    current: props.data_source,
    on_change: props.on_data_source_change,
}

// 同步按钮
SyncButton {
    status: props.sync_status,
    on_click: props.on_sync_click,
}
```

- [ ] **步骤 2：验证编译**

运行：`cd /Users/wangxiaoping/fayzedu/edusys/desktop && cargo check`
预期：PASS

---

## 第八阶段：主应用集成（P1）

### 任务 8：修改 main.rs

**文件：**
- 修改：`edusys/desktop/src/main.rs`

- [ ] **步骤 1：初始化 DataSourceController**

在 main.rs 中：

```rust
// 添加导入
use crate::data::DataSourceController;
use crate::components::{DataSourceToggle, SyncButton, ModeToast, SyncStatusBar};

// 修改 App 组件
#[component]
fn App() -> Element {
    let mut page = use_signal(|| NavPage::Home);
    let mut theme = use_signal(|| Theme::Light);
    let mut sidebar_collapsed = use_signal(|| false);
    let mut show_toast = use_signal(|| true);
    
    // 初始化 DataSourceController（需要 async）
    // 注意：Dioxus 中需要使用 Provider 或其他方式共享状态
    
    // ... 现有代码 ...
    
    // 在 Header 中传递新的 props
    Header {
        // ... 现有 props ...
        data_source: DataSource::Local,  // 临时硬编码
        on_data_source_change: move |_| {},
        sync_status: SyncStatus::Idle,
        on_sync_click: move |_| {},
    }
    
    // Toast 提示
    ModeToast {
        source: DataSource::Local,
        visible: *show_toast.read(),
    }
}
```

- [ ] **步骤 2：处理定时同步**

在 main.rs 中添加定时同步逻辑：

```rust
// 使用 tokio::spawn 处理定时同步
use tokio::time::{interval, Duration};

#[component]
fn App() -> Element {
    // ... existing code ...
    
    // 定时同步任务
    use_effect(|| {
        let mut sync_interval = interval(Duration::from_secs(300)); // 5分钟
        
        tokio::spawn(async move {
            loop {
                sync_interval.tick().await;
                // 执行同步
            }
        });
    });
}
```

- [ ] **步骤 3：处理退出时同步**

在 main.rs 中添加退出处理：

```rust
// 使用 dioxus-desktop 的窗口事件
use dioxus_desktop::tao::window::Window;

#[component]
fn App() -> Element {
    // ... existing code ...
    
    // 监听窗口关闭事件
    use_effect(|| {
        let window = use_window();
        window.on_window_event(move |event| {
            if let dioxus_desktop::tao::event::WindowEvent::CloseRequested { .. } = event {
                // 执行退出时同步
                // sync_engine.sync_on_exit().await;
            }
        });
    });
}
```

- [ ] **步骤 4：验证编译**

运行：`cd /Users/wangxiaoping/fayzedu/edusys/desktop && cargo check`
预期：PASS

- [ ] **步骤 5：运行应用测试**

运行：`cd /Users/wangxiaoping/fayzedu/edusys/desktop && cargo run`
预期：应用正常启动，显示数据源切换按钮

---

## 执行选项

计划已完成并保存到 `docs/superpowers/plans/2026-03-29-desktop-data-source-implementation.md`。

**两种执行方式：**

**1. 子代理驱动（推荐）** - 每个任务调度一个新的子代理，任务间进行审查，快速迭代

**2. 内联执行** - 在当前会话中使用 executing-plans 执行任务，批量执行并设有检查点

**选哪种方式？**

**如果选择子代理驱动：**
- **必需子技能：** 使用 superpowers:subagent-driven-development

**如果选择内联执行：**
- **必需子技能：** 使用 superpowers:executing-plans
