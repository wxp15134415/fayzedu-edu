/**
 * 数据同步服务 - 本地数据与后端同步
 */

import { ref } from 'vue'
import { db, type SyncQueueItem, type Student, type Grade, type Class, type Subject, type Score, type Exam, type User, type Role } from './db'
import { isOnline, onNetworkStatusChange, checkConnectivity } from './offline'
import axios from 'axios'

// 同步配置
const SYNC_CONFIG = {
  maxRetries: 3,           // 最大重试次数
  retryDelay: 2000,       // 重试延迟（毫秒）
  batchSize: 50,          // 批量同步大小
  syncInterval: 60000     // 自动同步间隔（毫秒）
}

// 同步状态
export const syncState = ref({
  isSyncing: false,
  lastSyncTime: 0,
  pendingCount: 0,
  errorCount: 0,
  lastError: ''
})

let syncInterval: ReturnType<typeof setInterval> | null = null

// ============ 同步队列操作 ============

/**
 * 添加到同步队列
 */
async function addToSyncQueue(action: 'create' | 'update' | 'delete', tableName: string, data: any, localId?: number, remoteId?: number) {
  const item: SyncQueueItem = {
    action,
    tableName,
    data,
    localId,
    remoteId,
    timestamp: Date.now(),
    retryCount: 0
  }

  await db.syncQueue.add(item)
  syncState.value.pendingCount = await db.syncQueue.count()
}

/**
 * 从同步队列移除
 */
async function removeFromSyncQueue(id: number) {
  await db.syncQueue.delete(id)
  syncState.value.pendingCount = await db.syncQueue.count()
}

/**
 * 更新同步队列项
 */
async function updateSyncQueueItem(id: number, updates: Partial<SyncQueueItem>) {
  await db.syncQueue.update(id, updates)
}

// ============ 数据同步方法 ============

/**
 * 同步单个表的数据
 */
async function syncTable(tableName: string, fetchAll = false): Promise<number> {
  const apiMap: Record<string, { url: string; key: string }> = {
    students: { url: '/api/students', key: 'students' },
    grades: { url: '/api/grades', key: 'grades' },
    classes: { url: '/api/classes', key: 'classes' },
    subjects: { url: '/api/subjects', key: 'subjects' },
    scores: { url: '/api/scores', key: 'scores' },
    exams: { url: '/api/exams', key: 'exams' },
    users: { url: '/api/users', key: 'users' },
    roles: { url: '/api/roles', key: 'roles' }
  }

  const config = apiMap[tableName]
  if (!config) {
    console.warn(`[同步] 未知表: ${tableName}`)
    return 0
  }

  try {
    // 获取本地数据的最大更新时间
    const table = db[tableName as keyof typeof db] as any
    const localData = await table.toArray()

    if (fetchAll || localData.length === 0) {
      // 首次同步：获取全部数据
      const response = await axios.get(config.url, { params: { page: 1, pageSize: 9999 } })
      const remoteData = response.data.data || response.data

      // 写入本地数据库
      for (const item of remoteData) {
        await table.put({
          ...item,
          remoteId: item.id,
          syncStatus: 'synced'
        })
      }

      return remoteData.length
    } else {
      // 增量同步：获取最新数据
      const lastUpdate = Math.max(...localData.map((item: any) => item.updatedAt || 0))
      const response = await axios.get(config.url, {
        params: { updatedAfter: lastUpdate, page: 1, pageSize: 9999 }
      })
      const remoteData = response.data.data || response.data

      for (const item of remoteData) {
        await table.put({
          ...item,
          remoteId: item.id,
          syncStatus: 'synced'
        })
      }

      return remoteData.length
    }
  } catch (error) {
    console.error(`[同步] ${tableName} 同步失败:`, error)
    throw error
  }
}

/**
 * 上传本地待同步数据到服务器
 */
async function pushLocalChanges(): Promise<number> {
  const pendingItems = await db.syncQueue.orderBy('timestamp').limit(SYNC_CONFIG.batchSize).toArray()
  let successCount = 0

  for (const item of pendingItems) {
    try {
      const { action, tableName, data, remoteId } = item

      let response
      const baseUrl = `/api/${tableName}`

      switch (action) {
        case 'create':
          response = await axios.post(baseUrl, data)
          // 创建成功后，更新本地 remoteId
          if (response.data?.data?.id) {
            const table = db[tableName as keyof typeof db] as any
            await table.update(item.localId!, { remoteId: response.data.data.id, syncStatus: 'synced' })
          }
          break

        case 'update':
          response = await axios.put(`${baseUrl}/${remoteId}`, data)
          await (db[tableName as keyof typeof db] as any).update(item.localId!, { syncStatus: 'synced' })
          break

        case 'delete':
          response = await axios.delete(`${baseUrl}/${remoteId}`)
          break
      }

      // 成功，移除队列
      await removeFromSyncQueue(item.id!)
      successCount++
    } catch (error: any) {
      // 失败，更新重试次数
      const newRetryCount = item.retryCount + 1
      if (newRetryCount >= SYNC_CONFIG.maxRetries) {
        // 超过最大重试次数，记录错误
        await updateSyncQueueItem(item.id!, {
          retryCount: newRetryCount,
          error: error.message
        })
        syncState.value.errorCount++
      } else {
        await updateSyncQueueItem(item.id!, {
          retryCount: newRetryCount,
          error: error.message
        })
      }
    }
  }

  return successCount
}

// ============ 公开方法 ============

/**
 * 完整同步 - 拉取远程数据 + 上传本地变更
 */
export async function syncAll(): Promise<boolean> {
  if (!isOnline.value) {
    console.log('[同步] 当前离线，跳过同步')
    return false
  }

  if (syncState.value.isSyncing) {
    console.log('[同步] 同步进行中，跳过')
    return false
  }

  syncState.value.isSyncing = true
  syncState.value.lastError = ''

  try {
    console.log('[同步] 开始同步...')

    // 1. 上传本地变更
    const pushedCount = await pushLocalChanges()
    console.log(`[同步] 上传了 ${pushedCount} 条数据`)

    // 2. 拉取远程数据
    const tables = ['students', 'grades', 'classes', 'subjects', 'scores', 'exams', 'users', 'roles']
    for (const table of tables) {
      try {
        const count = await syncTable(table)
        console.log(`[同步] ${table}: ${count} 条`)
      } catch (error) {
        console.error(`[同步] ${table} 失败`)
      }
    }

    // 3. 更新同步状态
    syncState.value.lastSyncTime = Date.now()
    syncState.value.pendingCount = await db.syncQueue.count()

    console.log('[同步] 完成')
    return true
  } catch (error: any) {
    syncState.value.lastError = error.message
    console.error('[同步] 失败:', error)
    return false
  } finally {
    syncState.value.isSyncing = false
  }
}

/**
 * 强制刷新指定表
 */
export async function refreshTable(tableName: string): Promise<number> {
  if (!isOnline.value) {
    throw new Error('当前离线')
  }

  return await syncTable(tableName, true)
}

/**
 * 将本地操作添加到同步队列（用于离线时记录操作）
 */
export async function queueLocalOperation(
  action: 'create' | 'update' | 'delete',
  tableName: string,
  data: any,
  localId?: number,
  remoteId?: number
) {
  await addToSyncQueue(action, tableName, data, localId, remoteId)
  console.log(`[同步队列] 已添加 ${action} ${tableName}`)
}

/**
 * 启动自动同步
 */
export function startAutoSync(intervalMs = SYNC_CONFIG.syncInterval) {
  if (syncInterval) return

  // 监听网络恢复，自动同步
  onNetworkStatusChange(async (online) => {
    if (online) {
      console.log('[同步] 网络恢复，触发同步')
      await syncAll()
    }
  })

  // 定时同步
  syncInterval = setInterval(async () => {
    if (isOnline.value && !syncState.value.isSyncing) {
      await syncAll()
    }
  }, intervalMs)

  console.log(`[同步] 自动同步已启动，间隔 ${intervalMs}ms`)
}

/**
 * 停止自动同步
 */
export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
    console.log('[同步] 自动同步已停止')
  }
}

/**
 * 获取待同步数量
 */
export async function getPendingCount(): Promise<number> {
  return await db.syncQueue.count()
}

/**
 * 清空待同步队列（谨慎使用）
 */
export async function clearSyncQueue() {
  await db.syncQueue.clear()
  syncState.value.pendingCount = 0
  console.log('[同步队列] 已清空')
}
