# 阶段五：移动端适配

## 时间
2026-04-03

## 目标
实现移动端自适应布局

## 断点设置
```typescript
// 移动端断点: 768px
const isMobile = ref(window.innerWidth < 768)
```

## 布局变化

### 桌面端 (>768px)
- 固定侧边栏 (220px/64px)
- 顶部导航栏
- 内容区

### 移动端 (<768px)
- 隐藏侧边栏
- 顶部汉堡菜单
- 抽屉式导航
- 全屏内容区

## 实现代码

### MainLayout.vue
```vue
<template>
  <!-- 移动端头部 -->
  <el-header class="mobile-header">
    <el-icon class="menu-btn" @click="drawerVisible = true">
      <Menu />
    </el-icon>
    <span>学校管理系统</span>
    <el-button>退出</el-button>
  </el-header>

  <!-- 移动端抽屉 -->
  <el-drawer v-model="drawerVisible" direction="ltr">
    <el-menu>...</el-menu>
  </el-drawer>

  <!-- 桌面端布局 -->
  <el-container class="desktop-layout" v-if="!isMobile">
    <el-aside class="sidebar">...</el-aside>
    <el-header class="header">...</el-header>
  </el-container>

  <!-- 移动端内容区 -->
  <el-main class="mobile-content" v-if="isMobile">
    <router-view />
  </el-main>
</template>
```

### CSS适配
```css
@media (max-width: 768px) {
  .desktop-layout .header { display: none; }
  .sidebar { display: none; }
}

.mobile-header {
  display: none; /* 默认隐藏，JS控制显示 */
}
```

## 响应式组件

### 表格
- 字体缩小到12px
- 按钮padding减小
- 水平滚动支持

### 分页
- 移动端居中显示
- 简化布局

### 弹窗
- 宽度90%
- 居中显示

## 问题与解决

### 问题1: 移动端头部不显示
- 原因: @media规则错误，隐藏了所有header包括mobile-header
- 解决: 修改选择器为 .desktop-layout .header

### 问题2: useBreakpoints报错
- 原因: useBreakpoints API调用方式错误
- 解决: 改用原生window事件监听

### 问题3: 退出按钮重复
- 原因: 桌面端和移动端都有退出按钮
- 解决: 使用.desktop-layout选择器区分