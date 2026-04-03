<template>
  <div class="dashboard">
    <h2>欢迎使用学校管理系统</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-left">
              <div class="stat-icon-wrap" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <el-icon><User /></el-icon>
              </div>
            </div>
            <div class="stat-right">
              <div class="stat-number">{{ stats.totalUsers }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-left">
              <div class="stat-icon-wrap" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <el-icon><UserFilled /></el-icon>
              </div>
            </div>
            <div class="stat-right">
              <div class="stat-number">{{ stats.totalStudents }}</div>
              <div class="stat-label">学生数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-left">
              <div class="stat-icon-wrap" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <el-icon><School /></el-icon>
              </div>
            </div>
            <div class="stat-right">
              <div class="stat-number">{{ stats.totalClasses }}</div>
              <div class="stat-label">班级数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-left">
              <div class="stat-icon-wrap" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                <el-icon><Collection /></el-icon>
              </div>
            </div>
            <div class="stat-right">
              <div class="stat-number">{{ stats.totalGrades }}</div>
              <div class="stat-label">年级数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-left">
              <div class="stat-icon-wrap" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                <el-icon><Notebook /></el-icon>
              </div>
            </div>
            <div class="stat-right">
              <div class="stat-number">{{ stats.totalSubjects }}</div>
              <div class="stat-label">科目数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-left">
              <div class="stat-icon-wrap" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
                <el-icon><DataLine /></el-icon>
              </div>
            </div>
            <div class="stat-right">
              <div class="stat-number">{{ stats.totalScores }}</div>
              <div class="stat-label">成绩记录</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-left">
              <div class="stat-icon-wrap" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <el-icon><Key /></el-icon>
              </div>
            </div>
            <div class="stat-right">
              <div class="stat-number">{{ stats.totalRoles }}</div>
              <div class="stat-label">角色数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-left">
              <div class="stat-icon-wrap" style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);">
                <el-icon><Lock /></el-icon>
              </div>
            </div>
            <div class="stat-right">
              <div class="stat-number">{{ stats.totalPermissions }}</div>
              <div class="stat-label">权限数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-card shadow="hover" class="quick-actions" style="margin-top: 20px;">
      <template #header>
        <span>快速操作</span>
      </template>
      <div class="action-grid">
        <div class="action-item" @click="navigateTo('/user/add')">
          <el-icon><UserFilled /></el-icon>
          <span>新增用户</span>
        </div>
        <div class="action-item" @click="navigateTo('/student')">
          <el-icon><Plus /></el-icon>
          <span>新增学生</span>
        </div>
        <div class="action-item" @click="navigateTo('/score')">
          <el-icon><EditPen /></el-icon>
          <span>成绩录入</span>
        </div>
        <div class="action-item" @click="navigateTo('/grade')">
          <el-icon><FolderAdd /></el-icon>
          <span>年级管理</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getStatistics } from '@/api/systemInfo'
import {
  User,
  UserFilled,
  School,
  Collection,
  Notebook,
  DataLine,
  Key,
  Lock,
  Plus,
  EditPen,
  FolderAdd
} from '@element-plus/icons-vue'

const router = useRouter()

const stats = ref({
  totalUsers: 0,
  totalStudents: 0,
  totalClasses: 0,
  totalGrades: 0,
  totalSubjects: 0,
  totalScores: 0,
  totalRoles: 0,
  totalPermissions: 0
})

const loadStatistics = async () => {
  try {
    const res = await getStatistics()
    if (res) {
      stats.value = {
        totalUsers: res.totalUsers || 0,
        totalStudents: res.totalStudents || 0,
        totalClasses: res.totalClasses || 0,
        totalGrades: res.totalGrades || 0,
        totalSubjects: res.totalSubjects || 0,
        totalScores: res.totalScores || 0,
        totalRoles: res.totalRoles || 0,
        totalPermissions: res.totalPermissions || 0
      }
    }
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

const navigateTo = (path: string) => {
  router.push(path)
}

onMounted(() => {
  loadStatistics()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard h2 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 18px;
}

.stat-card {
  cursor: default;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-left {
  flex-shrink: 0;
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22px;
}

.stat-right {
  flex: 1;
  min-width: 0;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
}

.quick-actions .el-card__header {
  font-size: 15px;
  font-weight: 600;
}

.action-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 70px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  gap: 6px;
}

.action-item:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.action-item .el-icon {
  font-size: 20px;
}

.action-item span {
  font-size: 12px;
  color: #606266;
}

.action-item:hover span {
  color: #fff;
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .dashboard {
    padding: 12px;
  }

  .stat-card {
    margin-bottom: 12px;
  }

  .stat-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .stat-icon-wrap {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .stat-number {
    font-size: 20px;
  }

  .stat-label {
    font-size: 12px;
  }

  .quick-actions {
    margin-top: 16px;
  }

  .action-grid {
    flex-direction: column;
  }

  .action-item {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>