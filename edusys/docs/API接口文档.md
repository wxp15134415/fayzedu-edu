# API接口文档

## 概述

EduSys 系统采用 RESTful API 风格，所有接口以 `/api` 为前缀。

## 认证方式

采用 JWT Token 认证，在请求 Header 中添加：
```
Authorization: Bearer {token}
```

## 通用说明

### 请求头
| Header | 说明 |
|--------|------|
| Content-Type | application/json |
| Authorization | Bearer {token} |

### 响应格式
```json
// 成功
{ "data": {...} }

// 登录成功
{ "token": "...", "user": {...}, "permissions": [...], "menus": [...] }

// 错误
{ "statusCode": 500, "message": "错误信息" }
```

### 分页参数
| 参数 | 说明 | 默认值 |
|------|------|--------|
| page | 页码 | 1 |
| pageSize | 每页数量 | 10 |

---

## 1. 认证接口 (Auth)

### 1.1 登录
```
POST /api/auth/login
```

**请求体：**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应：**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "realName": "管理员",
    "roleId": "1"
  },
  "permissions": ["user:list", "user:add", ...],
  "menus": [...]
}
```

### 1.2 登出
```
POST /api/auth/logout
```

**请求头：** 需要认证

**响应：** `{ "message": "登出成功" }`

### 1.3 获取当前用户
```
GET /api/auth/current
```

**请求头：** 需要认证

**响应：**
```json
{
  "user": {...},
  "permissions": [...],
  "menus": [...]
}
```

---

## 2. 用户接口 (User)

### 2.1 用户列表
```
GET /api/user/list?page=1&pageSize=10
```

**响应：**
```json
{
  "list": [
    {
      "id": 1,
      "username": "admin",
      "realName": "管理员",
      "roleName": "超级管理员",
      "status": 1,
      "phone": "13800000000",
      "email": "admin@edu.com",
      "lastLoginTime": "2026-04-03T10:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

### 2.2 用户详情
```
GET /api/user/:id
```

### 2.3 新增用户
```
POST /api/user
```

**请求体：**
```json
{
  "username": "newuser",
  "password": "password123",
  "realName": "新用户",
  "roleId": 2,
  "phone": "13800000000",
  "email": "user@edu.com"
}
```

### 2.4 更新用户
```
PUT /api/user/:id
```

**请求体：**
```json
{
  "realName": "修改后的名字",
  "roleId": 2
}
```

### 2.5 删除用户
```
DELETE /api/user/:id
```

**响应：** `{ "message": "删除成功" }`

### 2.6 更新用户状态
```
PUT /api/user/:id/status
```

**请求体：**
```json
{ "status": 0 }
```

---

## 3. 角色接口 (Role)

### 3.1 角色列表
```
GET /api/role/list
```

**响应：**
```json
{
  "list": [
    {
      "id": "1",
      "roleName": "超级管理员",
      "roleCode": "super_admin",
      "roleDesc": "系统最高权限",
      "isSystem": 1
    }
  ]
}
```

### 3.2 角色详情
```
GET /api/role/:id
```

### 3.3 新增角色
```
POST /api/role
```

**请求体：**
```json
{
  "roleName": "自定义角色",
  "roleCode": "custom_role",
  "roleDesc": "描述"
}
```

### 3.4 更新角色
```
PUT /api/role/:id
```

### 3.5 删除角色
```
DELETE /api/role/:id
```

### 3.6 获取角色权限
```
GET /api/role/:id/permissions
```

### 3.7 分配角色权限
```
PUT /api/role/:id/permissions
```

**请求体：**
```json
{ "permissions": [1, 2, 3] }
```

---

## 4. 权限组接口 (Permission)

### 4.1 权限列表
```
GET /api/permission/list
```

### 4.2 权限详情
```
GET /api/permission/:id
```

### 4.3 新增权限组
```
POST /api/permission
```

**请求体：**
```json
{
  "permissionName": "用户管理",
  "permissionCode": "user:list",
  "permissionDesc": "查看用户列表"
}
```

### 4.4 更新权限组
```
PUT /api/permission/:id
```

### 4.5 删除权限组
```
DELETE /api/permission/:id
```

---

## 5. 年级接口 (Grade)

### 5.1 年级列表
```
GET /api/grade/list?page=1&pageSize=10
```

**响应：**
```json
{
  "list": [
    {
      "id": 1,
      "gradeName": "高一",
      "entranceYear": 2025,
      "gradeName": "年级",
      "schoolYear": "2025-2026",
      "period": "高中",
      "semester": "第一学期",
      "studentCount": 500,
      "classCount": 17,
      "status": 1,
      "description": ""
    }
  ],
  "total": 10,
  "page": 1,
  "pageSize": 10
}
```

### 5.2 年级详情
```
GET /api/grade/:id
```

### 5.3 新增年级
```
POST /api/grade
```

**请求体：**
```json
{
  "gradeName": "高一",
  "entranceYear": 2025,
  "schoolYear": "2025-2026",
  "period": "高中",
  "semester": "第一学期",
  "studentCount": 0,
  "classCount": 0,
  "status": 1,
  "description": ""
}
```

### 5.4 更新年级
```
PUT /api/grade/:id
```

### 5.5 删除年级
```
DELETE /api/grade/:id
```

**注意：** 删除年级会同时删除该年级下的所有班级、学生及其成绩记录

---

## 6. 班级接口 (Class)

### 6.1 班级列表
```
GET /api/class/list?page=1&pageSize=10
```

### 6.2 班级详情
```
GET /api/class/:id
```

### 6.3 新增班级
```
POST /api/class
```

**请求体：**
```json
{
  "classNo": 1,
  "className": "高一1班",
  "gradeId": 1,
  "studentCount": 0,
  "status": 1
}
```

### 6.4 更新班级
```
PUT /api/class/:id
```

### 6.5 删除班级
```
DELETE /api/class/:id
```

**注意：** 删除班级会同时删除该班级下的所有学生及其成绩记录

---

## 7. 学生接口 (Student)

### 7.1 学生列表
```
GET /api/student/list?page=1&pageSize=10
```

### 7.2 学生详情
```
GET /api/student/:id
```

### 7.3 新增学生
```
POST /api/student
```

**请求体：**
```json
{
  "name": "张三",
  "classId": 1,
  "studentNo": "20250001",
  "studentId": "学籍号",
  "idCard": "身份证号",
  "year1Class": "高一1班",
  "year2Class": "高二1班",
  "year3Class": "高三1班",
  "seatNo": 1,
  "gender": "男",
  "birthDate": "2010-01-01",
  "subjects": "物理类",
  "schoolType": "一中",
  "source": "",
  "subjectType": "物理类",
  "status": 1,
  "phone": "13800000001",
  "address": "",
  "userId": null
}
```

### 7.4 更新学生
```
PUT /api/student/:id
```

### 7.5 删除学生
```
DELETE /api/student/:id
```

**注意：** 删除学生会同时删除该学生的所有成绩记录

---

## 8. 科目接口 (Subject)

### 8.1 科目列表
```
GET /api/subject/list?page=1&pageSize=10
```

### 8.2 科目详情
```
GET /api/subject/:id
```

### 8.3 新增科目
```
POST /api/subject
```

**请求体：**
```json
{
  "subjectName": "语文",
  "subjectCode": "chinese",
  "credit": 4,
  "status": 1
}
```

### 8.4 更新科目
```
PUT /api/subject/:id
```

### 8.5 删除科目
```
DELETE /api/subject/:id
```

---

## 9. 成绩接口 (Score)

### 9.1 成绩列表
```
GET /api/score/list?page=1&pageSize=10
```

**查询参数：**
| 参数 | 说明 |
|------|------|
| examId | 考试ID |
| studentId | 学生ID |

### 9.2 成绩详情
```
GET /api/score/:id
```

### 9.3 新增成绩
```
POST /api/score
```

**请求体：**
```json
{
  "examId": 1,
  "studentId": 1,
  "totalScore": 650,
  "chinese": 110,
  "math": 120,
  "english": 125,
  "physics": 90,
  "chemistry": 85,
  "biology": 80,
  "politics": 75,
  "history": 70,
  "geography": 65
}
```

### 9.4 更新成绩
```
PUT /api/score/:id
```

### 9.5 删除成绩
```
DELETE /api/score/:id
```

---

## 10. 考试接口 (Exam)

### 10.1 考试列表
```
GET /api/exam/list?page=1&pageSize=10
```

**响应：**
```json
{
  "list": [
    {
      "id": 1,
      "examName": "高三下月考7",
      "gradeId": 3,
      "schoolYear": "2025-2026",
      "semester": "第二学期",
      "examType": "月考",
      "examDate": "2026-04-15",
      "status": 1
    }
  ],
  "total": 10,
  "page": 1,
  "pageSize": 10
}
```

### 10.2 考试详情
```
GET /api/exam/:id
```

### 10.3 新增考试
```
POST /api/exam
```

**请求体：**
```json
{
  "examName": "高三下月考7",
  "gradeId": 3,
  "schoolYear": "2025-2026",
  "semester": "第二学期",
  "examType": "月考",
  "examDate": "2026-04-15",
  "status": 1
}
```

### 10.4 更新考试
```
PUT /api/exam/:id
```

### 10.5 删除考试
```
DELETE /api/exam/:id
```

---

## 11. 基础信息接口 (SystemInfo)

### 11.1 获取基础信息
```
GET /api/system-info
```

**响应：**
```json
{
  "id": 1,
  "schoolName": "学校管理系统",
  "currentYear": "2025-2026",
  "currentSemester": 1,
  "address": "",
  "phone": "",
  "email": "",
  "description": ""
}
```

### 11.2 更新基础信息
```
PUT /api/system-info
```

**请求体：**
```json
{
  "schoolName": "学校名称",
  "currentYear": "2025-2026",
  "currentSemester": 1,
  "address": "地址",
  "phone": "电话",
  "email": "邮箱",
  "description": "学校简介"
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 401 | 登录过期或未授权 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 更新日志

- 2026-04-03: 初始化文档
- 2026-04-03: 更新年级接口，新增 schoolYear、entranceYear、period、semester、studentCount、classCount 字段
- 2026-04-03: 更新班级接口，新增 classNo 字段
- 2026-04-03: 更新学生接口，新增 studentNo、studentId、idCard、year1Class、year2Class、year3Class、seatNo、subjects、schoolType、source、subjectType 字段
- 2026-04-03: 更新成绩接口，改为存储单次考试所有科目成绩
- 2026-04-03: 新增考试接口 (Exam)
- 2026-04-03: 新增基础信息接口 (SystemInfo)