# EduSys 桌面端离线数据架构设计

## 一、需求分析

### 1.1 核心需求
- **离线使用**：网络断开时仍能查看和操作数据
- **数据持久化**：重要数据本地存储，不丢失
- **数据同步**：网络恢复后自动/手动同步数据

### 1.2 数据分类

| 数据类型 | 示例 | 离线策略 |
|---------|------|---------|
| **静态数据** | 权限配置、系统参数 | 首次加载缓存，长期可用 |
| **参考数据** | 年级、班级、科目 | 定时同步，本地缓存 |
| **业务数据** | 学生信息、成绩 | 本地可读，离线创建待同步 |
| **用户数据** | 登录信息、偏好设置 | 本地存储，自动加载 |

---

## 二、技术选型

### 2.1 本地数据库

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| **IndexedDB** | 原生、浏览器支持 | API 复杂 | 大量结构化数据 |
| **Dexie.js** | 简洁的 API | 需额外依赖 | ✅ 已采用 |
| **electron-store** | 简单易用 | 只适合小数据 | 配置、用户偏好 |
| **SQLite** (better-sqlite3) | 功能强大 | 需要编译 native 模块 | 需要复杂查询 |

**当前方案**：Dexie.js

### 2.2 数据同步策略

```
┌─────────────────────────────────────────────────────────┐
│                    数据同步流程                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────┐    网络可用    ┌─────────────┐          │
│   │  本地 DB │ ───────────► │  后端 API   │          │
│   │ (Dexie) │              │  (增量同步)  │          │
│   └────┬────┘              └──────┬──────┘          │
│        │                          │                  │
│        │ ◄─────────────────────── │                  │
│        │      拉取最新数据        │                  │
│        │                          │                  │
│   本地操作 ──► 待同步队列 ──► 网络恢复 ──► 上传        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 三、已实现内容

### 3.1 文件结构

```
src/
├── utils/
│   ├── db.ts            # ✅ Dexie 数据库配置（已完成）
│   ├── offline.ts        # ✅ 网络状态监控（已完成）
│   └── sync.ts           # ✅ 数据同步服务（已完成）
├── components/
│   └── OfflineIndicator.vue  # ✅ 离线状态指示器（已完成）
└── ...
```

### 3.2 数据库设计 (db.ts)

已实现的表结构：

| 表名 | 说明 | 索引 |
|------|------|------|
| `students` | 学生信息 | id, remoteId, studentNo, name, classId, status, syncStatus |
| `grades` | 年级信息 | id, remoteId, name, code, syncStatus |
| `classes` | 班级信息 | id, remoteId, name, code, gradeId, syncStatus |
| `subjects` | 科目信息 | id, remoteId, name, code, syncStatus |
| `scores` | 成绩信息 | id, remoteId, studentId, subjectId, examId, syncStatus |
| `exams` | 考试信息 | id, remoteId, name, status, syncStatus |
| `users` | 用户信息 | id, remoteId, username, roleId, syncStatus |
| `roles` | 角色信息 | id, remoteId, name, code, syncStatus |
| `syncQueue` | 同步队列 | id, action, tableName, timestamp, retryCount |
| `settings` | 用户设置 | key |

### 3.3 核心模块

#### 网络状态监控 (offline.ts)

```typescript
// 导出的功能和状态
export const isOnline = ref(navigator.onLine)  // 当前是否在线
export const wasOffline = ref(false)            // 之前是否离线（用于检测恢复）

export function setupOnlineListener()           // 设置网络监听
export function onNetworkStatusChange(callback)  // 添加状态变化回调
export function checkConnectivity()            // 检测连接可靠性
export function startConnectivityCheck()       // 定时检测
export function waitForOnline()                // 等待网络恢复
```

#### 同步服务 (sync.ts)

```typescript
// 同步状态
export const syncState = ref({
  isSyncing: false,
  lastSyncTime: 0,
  pendingCount: 0,
  errorCount: 0,
  lastError: ''
})

export async function syncAll()                 // 完整同步
export async function refreshTable(tableName)   // 刷新指定表
export async function queueLocalOperation()    // 添加到同步队列
export function startAutoSync()                // 启动自动同步
export function stopAutoSync()                 // 停止自动同步
export async function getPendingCount()        // 获取待同步数量
export async function clearSyncQueue()          // 清空同步队列
```

#### 离线指示器组件 (OfflineIndicator.vue)

- 显示离线状态横幅
- 显示待同步数量
- 同步中的加载提示

---

## 四、使用方法

### 4.1 在应用中初始化

```typescript
// main.ts 或 App.vue
import { setupOnlineListener, startConnectivityCheck } from '@/utils/offline'
import { startAutoSync, syncAll } from '@/utils/sync'
import OfflineIndicator from '@/components/OfflineIndicator.vue'

// 设置网络监听
setupOnlineListener()
startConnectivityCheck()

// 启动自动同步
startAutoSync()

// 首次同步
syncAll()
```

### 4.2 在组件中使用

```typescript
import { isOnline } from '@/utils/offline'
import { syncState, syncAll } from '@/utils/sync'

// 响应式状态
const online = isOnline
const syncing = computed(() => syncState.value.isSyncing)

// 手动同步
await syncAll()
```

### 4.3 离线操作示例

```typescript
import { db } from '@/utils/db'
import { queueLocalOperation } from '@/utils/sync'

// 离线时创建学生
async function createStudent(data) {
  // 1. 先保存到本地数据库
  const id = await db.students.add({
    ...data,
    syncStatus: 'local',
    createdAt: Date.now(),
    updatedAt: Date.now()
  })

  // 2. 添加到同步队列
  await queueLocalOperation('create', 'students', data, id)

  // 如果离线，操作会被保存在队列中
  // 网络恢复后会自动同步
}
```

---

## 五、实施步骤

### ✅ 第一阶段：基础功能（已完成）
1. [x] 安装 Dexie.js
2. [x] 配置本地数据库 (db.ts)
3. [x] 实现网络状态监听 (offline.ts)
4. [x] 基础数据缓存

### ⏳ 第二阶段：离线操作（进行中）
1. [x] 实现待同步队列
2. [ ] 实现冲突检测
3. [ ] 实现手动同步

### ⏳ 第三阶段：高级功能（待开发）
1. [ ] 实现增量同步
2. [ ] 实现数据压缩
3. [ ] 实现离线指示器 UI

---

## 六、依赖

```bash
# 已安装
pnpm add dexie
```

---

## 七、后续优化

### 7.1 待实现功能
- 冲突检测和解决策略
- 增量同步优化
- 数据压缩
- 离线创建时的数据校验

### 7.2 可选功能
- electron-store 用于用户偏好设置
- SQLite 用于更复杂的查询需求
- 数据加密存储

---

*文档更新时间: 2026-04-03*
