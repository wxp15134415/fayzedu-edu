# 阶段四：页面开发

## 时间
2026-04-03

## 目标
实现所有业务模块的页面

## 登录页 (src/views/auth/Login.vue)

### 组件结构
- 登录表单: username, password
- 验证规则: 必填
- 登录按钮: loading状态
- 回车登录支持

### 交互流程
1. 验证表单
2. 调用userStore.login
3. 成功提示 + 跳转首页
4. 失败提示错误信息

## 首页 (src/views/dashboard/Index.vue)

### 功能
- 显示统计数据 (待实现)
- 快捷操作入口 (待实现)

## 用户管理 (src/views/user/)

### Index.vue - 用户列表页
```vue
<template>
  <!-- 工具栏 -->
  <el-button>新增用户</el-button>
  <el-button>刷新</el-button>

  <!-- 用户表格 -->
  <el-table :data="tableData">
    <el-table-column prop="username" label="用户名" />
    <el-table-column prop="realName" label="姓名" />
    <el-table-column prop="roleName" label="角色" />
    <el-table-column prop="status" label="状态">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </el-table-column>
    <el-table-column label="操作">
      <el-button>编辑</el-button>
      <el-button>禁用/启用</el-button>
      <el-button>删除</el-button>
    </el-table-column>
  </el-table>

  <!-- 分页 -->
  <el-pagination />
</template>
```

### Edit.vue - 用户编辑页
- 新增/编辑表单
- 角色选择
- 密码加密
- 取消/保存按钮

## 角色管理 (src/views/role/Index.vue)

### 功能
- 角色列表
- 新增/编辑角色
- 分配权限 (复选框弹窗)

## 权限管理 (src/views/permission/Index.vue)

### 功能
- 权限组列表
- 新增/编辑权限

## 年级管理 (src/views/grade/Index.vue)

### 功能
- 年级列表
- 新增年级弹窗表单
- 编辑/删除

### 弹窗表单
- 年级名称
- 学年 (数字输入)
- 学段 (下拉: 小学/初中/高中)
- 描述
- 状态开关

## 班级管理 (src/views/class/Index.vue)

### 功能
- 班级列表
- 新增班级弹窗 (需选择年级)
- 编辑/删除

## 学生管理 (src/views/student/Index.vue)

### 功能
- 学生列表
- 新增学生弹窗
- 编辑/删除

## 科目管理 (src/views/subject/Index.vue)

### 功能
- 科目列表
- 新增科目弹窗
- 编辑/删除

## 成绩管理 (src/views/score/Index.vue)

### 功能
- 成绩列表
- 录入成绩弹窗
- 编辑/删除

## 共性问题

### 表格
- stripe样式
- v-loading加载状态
- 分页组件

### 弹窗
- el-dialog组件
- el-form表单验证
- 取消/确定按钮

### 交互
- 确认对话框 (ElMessageBox)
- 成功/错误提示 (ElMessage)