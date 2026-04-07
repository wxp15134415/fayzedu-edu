<template>
  <div class="dashboard page-container">
    <PageHeader title="欢迎使用学校管理系统" subtitle="实时了解系统运行状态" />

    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <StatCard :value="stats.totalUsers" label="用户总数" icon="User" gradient="linear-gradient(135deg, #58c0fc 0%, #bd45fb 100%)" />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <StatCard :value="stats.totalStudents" label="学生数" icon="UserFilled" gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <StatCard :value="stats.totalClasses" label="班级数" icon="School" gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <StatCard :value="stats.totalGrades" label="年级数" icon="Collection" gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" />
      </el-col>
    </el-row>

    <!-- 第二行 -->
    <el-row :gutter="20" class="mt-base">
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <StatCard :value="stats.totalSubjects" label="科目数" icon="Notebook" gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)" />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <StatCard :value="stats.totalScores" label="成绩记录" icon="DataLine" gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <StatCard :value="stats.totalRoles" label="角色数" icon="Key" gradient="linear-gradient(135deg, #58c0fc 0%, #bd45fb 100%)" />
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <StatCard :value="stats.totalPermissions" label="权限数" icon="Lock" gradient="linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" />
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-card shadow="hover" class="quick-actions">
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
import { StatCard, PageHeader } from '@/components/index'
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
  background-color: var(--color-bg-base);
}

.mt-base {
  margin-top: var(--spacing-base);
}

.quick-actions {
  margin-top: var(--spacing-base);
}

.quick-actions :deep(.el-card__header) {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}

.action-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-base);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: var(--spacing-md);
  background: var(--color-bg-page);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  gap: var(--spacing-xs);
}

.action-item:hover {
  background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
  color: var(--color-white);
}

.action-item .el-icon {
  font-size: 20px;
}

.action-item span {
  font-size: var(--font-size-xs);
  color: var(--color-text-regular);
}

.action-item:hover span {
  color: var(--color-white);
}

@media (max-width: 768px) {
  .action-grid {
    flex-direction: column;
  }

  .action-item {
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
    min-width: auto;
    padding: var(--spacing-sm) var(--spacing-base);
  }

  .action-item span {
    font-size: var(--font-size-sm);
  }
}
</style>
