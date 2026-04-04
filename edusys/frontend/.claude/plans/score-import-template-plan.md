# 临时成绩导入数据模板功能实现计划

## 需求概述
为临时成绩导入功能设计并实现一套完整的数据导入模板方案，包括模板下载、模板管理、字段映射配置等功能，支持好分数、睿芽、七天、学校自定义等多种数据来源的标准化导入。

## 实现方案

### 阶段 1：类型定义与工具函数 (2 个文件)

1. **创建成绩导入类型定义**
   - 文件：`src/types/score-import.ts`
   - 定义模板、字段、来源枚举等 TypeScript 接口
   - 需要定义的类型：
     - ScoreImportTemplate: 模板基本信息
     - TemplateField: 模板字段定义
     - TemplateSource: 数据来源枚举
     - FieldMapping: 字段映射关系
     - ParseResult: 解析结果
     - MatchResult: 匹配结果
     - TempScoreRecord: 临时成绩记录

2. **创建模板生成工具**
   - 文件：`src/utils/template-generator.ts`
   - 实现模板生成和导出功能
   - 需要实现的功能：
     - generateTemplate(source: TemplateSource): 生成指定来源的模板
     - exportTemplate(template: ScoreImportTemplate): 导出模板为 Excel
     - getDefaultFields(): 获取默认字段列表
     - getSourceFields(source: TemplateSource): 获取指定来源的字段

### 阶段 2：API 接口 (1 个文件)

3. **创建模板 API 接口**
   - 文件：`src/api/score-import-template.ts`
   - 模板的 CRUD 操作接口
   - 需要实现的接口：
     - getTemplateList(): 获取模板列表
     - getTemplate(id: number): 获取模板详情
     - createTemplate(data: ScoreImportTemplate): 创建模板
     - updateTemplate(id: number, data: ScoreImportTemplate): 更新模板
     - deleteTemplate(id: number): 删除模板
     - downloadTemplate(id: number): 下载模板
     - validateTemplate(file: File): 验证模板格式

### 阶段 3：模板下载组件 (1 个文件)

4. **创建模板下载组件**
   - 文件：`src/components/ScoreImportTemplate/TemplateDownload.vue`
   - 功能：
     - 显示可用的模板列表
     - 支持按数据来源筛选模板
     - 支持模板预览
     - 支持一键下载模板
     - 显示模板使用说明

### 阶段 4：字段映射组件 (1 个文件)

5. **创建字段映射组件**
   - 文件：`src/components/ScoreImportTemplate/FieldMapping.vue`
   - 功能：
     - 显示标准字段列表
     - 支持拖拽调整字段顺序
     - 支持设置字段是否必填
     - 支持设置字段默认值
     - 支持字段验证规则配置

### 阶段 5：模板管理组件 (1 个文件)

6. **创建模板管理组件**
   - 文件：`src/components/ScoreImportTemplate/TemplateManager.vue`
   - 功能：
     - 显示模板列表
     - 支持创建新模板
     - 支持编辑现有模板
     - 支持删除模板
     - 支持模板复制
     - 支持模板版本管理

### 阶段 6：集成到导入页面 (1 个文件)

7. **修改成绩导入页面**
   - 文件：`src/views/score-import/Index.vue`
   - 修改内容：
     - 在步骤1（上传文件）中添加"下载模板"按钮
     - 添加模板选择下拉框
     - 显示当前选择的模板信息
     - 根据选择的模板调整解析逻辑

### 阶段 7：模板使用说明 (1 个文件)

8. **创建模板使用说明组件**
   - 文件：`src/components/ScoreImportTemplate/TemplateGuide.vue`
   - 功能：
     - 显示模板使用步骤
     - 显示字段说明
     - 显示常见错误和解决方案
     - 提供示例数据

## 核心数据结构

### 模板数据结构

```typescript
interface ScoreImportTemplate {
  id: number
  name: string
  description: string
  source: TemplateSource  // 'haofenshu' | 'ruiya' | 'qitian' | 'custom'
  version: string
  fields: TemplateField[]
  createdAt: string
  updatedAt: string
  createdBy: number
}

interface TemplateField {
  id: string
  name: string
  label: string
  type: 'string' | 'number' | 'date'
  required: boolean
  defaultValue?: any
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  mapping?: string  // 对应的标准字段名
}
```

### 数据来源枚举

```typescript
enum TemplateSource {
  HAOFENSHU = 'haofenshu',      // 好分数
  RUIYA = 'ruiya',              // 睿芽
  QITIAN = 'qitian',            // 七天
  CUSTOM = 'custom'             // 学校自定义
}
```

### 标准字段列表

```typescript
const STANDARD_FIELDS = [
  { id: 'name', label: '姓名', required: true, type: 'string' },
  { id: 'studentNo', label: '考号', required: true, type: 'string' },
  { id: 'studentId', label: '学籍号', required: false, type: 'string' },
  { id: 'className', label: '班级', required: false, type: 'string' },
  // 原始成绩
  { id: 'totalScore', label: '总分', required: false, type: 'number' },
  { id: 'totalRank', label: '排名', required: false, type: 'number' },
  { id: 'chinese', label: '语文', required: false, type: 'number' },
  { id: 'math', label: '数学', required: false, type: 'number' },
  { id: 'english', label: '英语', required: false, type: 'number' },
  { id: 'physics', label: '物理', required: false, type: 'number' },
  { id: 'chemistry', label: '化学', required: false, type: 'number' },
  { id: 'biology', label: '生物', required: false, type: 'number' },
  { id: 'history', label: '历史', required: false, type: 'number' },
  { id: 'geography', label: '地理', required: false, type: 'number' },
  { id: 'politics', label: '政治', required: false, type: 'number' },
  // 赋分成绩
  { id: 'totalScoreAssign', label: '赋分总分', required: false, type: 'number' },
  { id: 'totalRankAssign', label: '赋分排名', required: false, type: 'number' },
  { id: 'chineseAssign', label: '语文赋分', required: false, type: 'number' },
  { id: 'mathAssign', label: '数学赋分', required: false, type: 'number' },
  { id: 'englishAssign', label: '英语赋分', required: false, type: 'number' },
  { id: 'physicsAssign', label: '物理赋分', required: false, type: 'number' },
  { id: 'chemistryAssign', label: '化学赋分', required: false, type: 'number' },
  { id: 'biologyAssign', label: '生物赋分', required: false, type: 'number' },
  { id: 'historyAssign', label: '历史赋分', required: false, type: 'number' },
  { id: 'geographyAssign', label: '地理赋分', required: false, type: 'number' },
  { id: 'politicsAssign', label: '政治赋分', required: false, type: 'number' }
]
```

## 风险与缓解

- **Risk**: 不同数据来源的字段差异较大，难以统一
  - Mitigation: 使用灵活的字段映射机制，支持自定义字段

- **Risk**: 用户下载模板后修改了字段名，导致解析失败
  - Mitigation: 提供模板验证功能，在导入前检查字段名

- **Risk**: 模板版本管理复杂
  - Mitigation: 简化版本管理，只保留最新版本和历史版本

- **Risk**: 大量模板导致管理困难
  - Mitigation: 提供模板分类和搜索功能

## 验收标准

- [ ] 用户可以下载标准化的成绩导入模板
- [ ] 支持好分数、睿芽、七天、学校自定义等多种数据来源
- [ ] 用户可以自定义字段映射
- [ ] 模板可以预览和编辑
- [ ] 模板使用说明清晰易懂

## 文件路径汇总

| 文件 | 描述 |
|------|------|
| `src/types/score-import.ts` | 成绩导入类型定义 |
| `src/utils/template-generator.ts` | 模板生成工具 |
| `src/api/score-import-template.ts` | 模板 API 接口 |
| `src/components/ScoreImportTemplate/TemplateDownload.vue` | 模板下载组件 |
| `src/components/ScoreImportTemplate/FieldMapping.vue` | 字段映射组件 |
| `src/components/ScoreImportTemplate/TemplateManager.vue` | 模板管理组件 |
| `src/components/ScoreImportTemplate/TemplateGuide.vue` | 模板使用说明组件 |
| `src/views/score-import/Index.vue` | 成绩导入页面（需修改） |
