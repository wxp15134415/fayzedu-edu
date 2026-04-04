# 考试编排模块 API 接口设计

## 一、考点管理 (ExamVenue)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /exam-venue/list | 考点列表 |
| GET | /exam-venue/:id | 考点详情 |
| POST | /exam-venue | 创建考点 |
| PUT | /exam-venue/:id | 更新考点 |
| DELETE | /exam-venue/:id | 删除考点 |

**请求示例**
```typescript
// POST /exam-venue
{
  "venueCode": "7001",
  "venueName": "第一中学",
  "address": "xxx路xxx号",
  "contact": "张老师",
  "phone": "138xxxxx",
  "totalSeats": 1000
}
```

---

## 二、考场管理 (ExamRoom)

> 考场属于考点（二级）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /exam-room/list?venueId=1 | 考场列表 |
| GET | /exam-room/:id | 考场详情 |
| POST | /exam-room | 创建考场 |
| PUT | /exam-room/:id | 更新考场 |
| DELETE | /exam-room/:id | 删除考场 |
| POST | /exam-room/batch | 批量创建考场 |

**请求示例**
```typescript
// POST /exam-room/batch
{
  "venueId": 1,
  "startRoomNo": 1,
  "endRoomNo": 30,
  "capacity": 30
}
```

---

## 三、考试场次 (ExamSession)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /exam-session/list?examId=1 | 场次列表 |
| GET | /exam-session/:id | 场次详情 |
| POST | /exam-session | 创建场次 |
| PUT | /exam-session/:id | 更新场次 |
| DELETE | /exam-session/:id | 删除场次 |
| POST | /exam-session/batch | 批量创建场次 |

**请求示例**
```typescript
// POST /exam-session/batch
{
  "examId": 1,
  "sessions": [
    { "sessionNo": 1, "sessionName": "第1场 语文", "subjectId": 1, "examDate": "2023-11-15", "startTime": "08:00", "endTime": "10:00" },
    { "sessionNo": 2, "sessionName": "第2场 数学", "subjectId": 2, "examDate": "2023-11-15", "startTime": "10:30", "endTime": "12:00" }
  ]
}
```

---

## 四、考试编排 (ExamArrangement) - 核心

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /exam-arrangement/list?examId=1 | 编排列表 |
| GET | /exam-arrangement/list-by-room?examId=1&roomNo=1 | 按考场查看 |
| GET | /exam-arrangement/list-by-student?examId=1&studentId=1 | 学生编排详情 |
| POST | /exam-arrangement/generate | 生成编排 |
| PUT | /exam-arrangement/update-seat | 手动调整座位 |
| DELETE | /exam-arrangement/:id | 删除编排 |
| POST | /exam-arrangement/regenerate | 重新编排 |

### 生成编排接口

```typescript
// POST /exam-arrangement/generate
{
  "examId": 1,
  "sessionId": 1,          // 场次ID
  "venueId": 1,           // 考点ID
  "gradeId": 1,           // 年级ID
  "subjectIds": [1,2,3],  // 科目ID列表(选考)
  "arrangeType": "按选科", // 编排方式
  "includeElective": true // 是否包含选科
}
```

### 响应示例

```typescript
{
  "code": 0,
  "message": "编排成功",
  "data": {
    "arrangedCount": 350,
    "roomCount": 12,
    "plan": {
      "id": 1,
      "studentCount": 350,
      "actualCount": 350,
      "startRoomNo": 1,
      "endRoomNo": 12
    }
  }
}
```

---

## 五、准考证号管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /exam-arrangement/generate-exam-no | 生成准考证号 |
| GET | /exam-arrangement/export-exam-no | 导出准考号规则 |

### 准考证号生成规则

| 规则 | 格式 | 示例 |
|------|------|------|
| 规则1 | 年级代码+班级+考场+座位 | 0120010101 |
| 规则2 | 年级代码+科目代码+班级+考场+座位 | 010120010101 |
| 规则3 | 考点代码+年级代码+科目代码+考场+座位 | 7001012010101 |
| 规则4 | 使用固定学号 | 直接使用studentNo |

```typescript
// POST /exam-arrangement/generate-exam-no
{
  "examId": 1,
  "rule": 3,  // 0-规则1, 1-规则2, 2-规则3, 3-规则4
  "sessionIds": [1,2,3]  // 需要生成的场次
}
```

---

## 六、导出功能

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /exam-arrangement/export-students?examId=1&type=byRoom | 导出考生信息表 |
| GET | /exam-arrangement/export-checkin?examId=1&sessionId=1 | 导出签到表 |
| GET | /exam-arrangement/export-admission?examId=1 | 导出准考证 |
| GET | /exam-arrangement/export-barcode?examId=1 | 导出条形码 |

### 导出参数

```typescript
// GET /exam-arrangement/export-students
?examId=1
&sessionId=1
&venueId=1
&type=byRoom|byClass    // 按考场/按班级
&subjectId=1            // 科目筛选

// 返回: Excel文件
```

---

## 七、导入功能

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /exam-arrangement/import-students | 导入学生信息 |
| POST | /exam-arrangement/import-year-score | 导入学业水平成绩 |

```typescript
// POST /exam-arrangement/import-students
// Body: FormData (包含Excel文件)
// 返回: 导入结果统计
{
  "success": 350,
  "failed": 2,
  "errors": [
    { "row": 5, "message": "学号重复" }
  ]
}
```

---

## 八、统计接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /exam-arrangement/stats?examId=1 | 编排统计 |
| GET | /exam-arrangement/stats-by-subject?examId=1 | 按科目统计 |
| GET | /exam-arrangement/stats-by-venue?examId=1 | 按考点统计 |

### 响应示例

```typescript
{
  "totalStudents": 500,
  "arrangedStudents": 500,
  "totalRooms": 17,
  "sessions": [
    { "sessionId": 1, "sessionName": "第1场 语文", "count": 500, "rooms": 17 },
    { "sessionId": 2, "sessionName": "第2场 数学", "count": 480, "rooms": 16 }
  ]
}
```
