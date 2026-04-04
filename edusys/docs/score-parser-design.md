# 成绩导入 Python 微服务 - 设计规格书

## 1. 项目概述

### 1.1 目标
创建 Python 微服务用于解析多系统考试成绩 Excel 文件，实现智能学生匹配，返回结构化数据供后端入库。

### 1.2 技术栈
- **框架**: FastAPI
- **Excel 处理**: pandas + openpyxl
- **端口**: 8000

### 1.3 项目状态
- [x] Python 微服务开发完成
- [x] 后端 API 开发完成
- [x] 前端页面开发完成
- [x] 多格式 Excel 解析支持
- [x] 学生多策略匹配
- [ ] Docker 容器化部署

---

## 2. 项目结构

```
score-parser/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 入口
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py        # API 路由
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py       # Pydantic 模型
│   ├── services/
│   │   ├── __init__.py
│   │   ├── parser.py        # Excel 解析器
│   │   ├── matcher.py       # 学生匹配器
│   │   └── detectors.py     # 系统检测器
│   ├── utils/
│   │   ├── __init__.py
│   │   └── constants.py     # 常量定义
│   └── core/
│       ├── __init__.py
│       └── config.py        # 配置
├── requirements.txt
├── .env.example
├── Dockerfile
└── README.md
```

---

## 3. API 设计

### 3.1 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/v1/parse | 解析 Excel 文件 |
| POST | /api/v1/match | 学生匹配 |
| GET | /api/v1/health | 健康检查 |

### 3.2 解析接口

```json
POST /api/v1/parse
Content-Type: multipart/form-data

{
  "file": Excel文件
}
```

### 3.3 匹配接口

```json
POST /api/v1/match
Content-Type: application/json

请求体:
{
  "existing_students": [
    {"id": 1, "studentNo": "考号", "studentId": "学籍辅号", "name": "姓名", "className": "班级"},
    ...
  ],
  "import_students": [
    {"row": 0, "student_no": "考号", "student_id": "学籍辅号", "name": "姓名", "class_name": "班级", "scores": {...}},
    ...
  ]
}

响应:
{
  "success": true,
  "message": "匹配完成，成功: 4, 未匹配: 2",
  "matched": [
    {"row": 0, "name": "张三", "matched_student_id": 1, "match_method": "考号", ...}
  ],
  "unmatched": [
    {"row": 1, "name": "李四", "student_no": "...", "class_name": "..."}
  ]
}
```

### 3.3 响应格式

```json
{
  "success": true,
  "data": {
    "exam_info": {
      "system": "好分数",
      "exam_name": "宁德市2025届高中毕业班5月份质量检测",
      "subjects": ["语文", "数学", "英语", ...]
    },
    "students": [
      {
        "row": 3,
        "student_no": "7001310209",       // 考号
        "student_id": "32270010052",       // 学籍辅号
        "name": "刘芝伶",
        "class_name": "20",
        "scores": {
          "总分": {"raw": 638, "weighted": 665.5, "school_rank": 13, "class_rank": 1},
          "语文": {"raw": 122.5, "school_rank": 1, "class_rank": 1},
          "数学": {"raw": 141, "school_rank": 8, "class_rank": 4},
          ...
        },
        "match_status": "matched",
        "matched_student_id": 123,
        "match_method": "student_no"
      }
    ],
    "unmatched": [
      {
        "row": 5,
        "student_no": "7001310209",
        "name": "张三",
        "reason": "未找到匹配学生"
      }
    ]
  }
}
```

---

## 4. 学生匹配策略

### 4.1 匹配优先级

| 优先级 | 字段 | 说明 |
|--------|------|------|
| 1 | 考号 (studentNo) | 直接匹配 |
| 2 | 学籍辅号 (studentId) | 去除 "H" 后匹配 |
| 3 | 学籍辅号 (studentId) | 原始值匹配 |
| 4 | 班级+姓名 | 班级名称+姓名精确匹配 |

### 4.2 匹配结果状态

| 状态 | 说明 |
|------|------|
| `matched` | 成功匹配，返回学生ID |
| `unmatched` | 未匹配到学生 |
| `multi_match` | 匹配到多个学生（需人工确认） |

---

## 5. 各系统解析规则

### 5.1 系统检测

根据表头特征自动识别：
- **好分数**: 首行包含 "排行榜"
- **睿芽**: 首行包含 "学校", "年级", "班级", "姓名", "学号"
- **七天**: 首行包含 "考号", "选科组合"
- **学校自定义**: 简单格式，首行为标题

### 5.2 表头行识别

```
好分数: 标题行(0) + 表头(1-2行) + 数据(3行起)
睿芽:   表头(0-1行) + 数据(2行起)
七天:   标题行(0) + 表头(1-2行) + 数据(3行起)
原始:   标题行(0) + 表头(1-2行) + 数据(3行起)
```

### 5.3 字段映射

| 系统 | 学号字段 | 姓名字段 | 班级字段 |
|------|----------|----------|----------|
| 好分数 | 考号(列1) / 学号(列2) | 姓名(列0) | 班级(列3) |
| 睿芽 | 学号(列4) | 姓名(列3) | 班级(列2) |
| 七天 | 考号(列0) | 姓名(列1) | 班级(列2) |
| 原始 | 考号(列0) | 姓名(列1) | 班级(列2) |

---

## 6. 数据库设计

### 6.1 新增临时表 (score_import_temp)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| exam_id | int | 考试ID |
| student_id | int | 学生ID (外键) |
| import_batch | varchar | 导入批次号 |
| total_score | decimal | 总分 |
| total_rank | int | 总分排名 |
| total_rank_class | int | 班级排名 |
| chinese | decimal | 语文成绩 |
| chinese_rank | int | 语文排名 |
| ... | ... | 其他科目 |
| status | int | 状态: 0待确认, 1已确认, 2已放弃 |
| matched_method | varchar | 匹配方式 |
| raw_data | json | 原始数据备份 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### 6.2 关联关系

```
exam (考试) ← score_import_temp (临时成绩) → student (学生)
```

---

## 7. 后端 API (NestJS)

### 7.1 成绩导入模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/score-import/students-for-match | 获取学生列表用于匹配 |
| POST | /api/score-import/parse | 解析Excel文件 |
| GET | /api/score-import/preview | 预览导入数据 |
| POST | /api/score-import/confirm | 确认导入 |
| POST | /api/score-import/cancel | 取消导入 |
| POST | /api/score-import/manual-match | 手动匹配学生 |

### 7.2 使用流程

```typescript
// 1. 获取学生列表
GET /api/score-import/students-for-match
// 响应: [{id, studentNo, studentId, name, className, classId}, ...]

// 2. 上传并解析
POST /api/score-import/parse
// 参数: file (Excel文件)

// 3. 预览
GET /api/score-import/preview?importBatch=xxx&page=1&pageSize=20

// 4. 确认导入
POST /api/score-import/confirm
// Body: { importBatch: "xxx" }

// 5. 取消导入
POST /api/score-import/cancel
// Body: { importBatch: "xxx" }

// 6. 手动匹配
POST /api/score-import/manual-match
// Body: { tempId: 1, studentId: 123, importBatch: "xxx" }
```

### 7.3 前端页面路由

| 路径 | 说明 |
|------|------|
| /score-import | 成绩导入页面 |

---

## 8. 错误处理

| 错误码 | 说明 |
|--------|------|
| 40001 | 文件格式错误 |
| 40002 | 文件过大 (超过 10MB) |
| 40003 | 无有效数据 |
| 40004 | 学生数据为空 |
| 50001 | 服务器内部错误 |

---

## 9. 测试结果

### 9.1 测试数据

| 格式 | 文件 | 学生数 | 状态 |
|------|------|--------|------|
| 原始格式 | 综合成绩表-总分-全体-2025-2026学年高一下第一次月考-原始分报告.xlsx | 844 | ✅ |
| 好分数 | 宁德市2025届高中毕业班5月份质量检测 - 总分 - 排行榜.xlsx | 823 | ✅ |
| 七天 | 综合成绩表-总分-全体-25-26上高二期末-新高考"312"赋分报告.xlsx | 823 | ✅ |

### 9.2 匹配测试

| 测试场景 | 预期结果 | 实际结果 |
|----------|----------|----------|
| 考号精确匹配 | matched (方法: 考号) | ✅ |
| 学籍辅号匹配(去H) | matched (方法: 学籍辅号(去H)) | ✅ |
| 班级+姓名匹配 | matched (方法: 班级+姓名) | ✅ |
| 无匹配数据 | unmatched | ✅ |

## 10. 部署

### 10.1 启动命令

```bash
# 开发环境
uvicorn app.main:app --reload --port 8000

# 生产环境
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Docker
docker build -t score-parser .
docker run -p 8000:8000 score-parser
```

---

## 11. 待优化项

- [ ] 支持更多考试系统
- [ ] 学生匹配规则配置化
- [ ] 批量导入自动识别考试
- [ ] 导入历史记录