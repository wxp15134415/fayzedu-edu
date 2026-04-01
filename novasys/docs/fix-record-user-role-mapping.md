# 用户管理模块修复记录

## 问题描述

用户管理模块的角色功能异常：
- 前端下拉选择角色后，保存到数据库的角色关联不正确
- 表格显示的角色名称不正确
- 编辑用户时角色选择与实际不符

## 根本原因

**前后端角色 ID 映射不匹配**

前端使用硬编码的静态角色选项，ID 顺序为：
```
1 → 超级管理员
2 → 管理员
3 → 教师
4 → 学生
```

但数据库 `sys_role` 表中实际数据为：
```
id=1 → 超级管理员 (role_key: super)
id=3 → 学生 (role_key: student)
id=4 → 管理员 (role_key: admin)
id=5 → 教师 (role_key: teacher)
```

当用户在前端选择"管理员"(value=2)时，后端收到 roleId=2，但数据库中 id=2 不存在，导致角色关联失败。

## 修复内容

### 1. 修改前端角色选项映射 (`TableModal.vue`)

```diff
- { label: '超级管理员', value: 1 }
- { label: '管理员', value: 2 }
- { label: '教师', value: 3 }
- { label: '学生', value: 4 }
+ { label: '超级管理员', value: 1 }
+ { label: '管理员', value: 4 }
+ { label: '教师', value: 5 }
+ { label: '学生', value: 3 }
```

### 2. 修改表格角色显示映射 (`index.vue`)

同步修正了表格中显示角色时的映射关系。

## 验证方法

1. 启动后端服务：`pnpm start:dev` (nova-admin-nest)
2. 启动前端服务：`pnpm dev` (nova-admin)
3. 访问用户管理页面
4. 测试创建用户时选择不同角色
5. 检查数据库 `sys_user_role` 表确认角色关联正确
6. 检查表格显示的角色名称是否正确

## 相关文件

- `/Users/wangxiaoping/fayzedu/novasys/nova-admin/src/views/setting/account/components/TableModal.vue`
- `/Users/wangxiaoping/fayzedu/novasys/nova-admin/src/views/setting/account/index.vue`
- 数据库：nova2.sys_role

## 修复时间

2026-04-01