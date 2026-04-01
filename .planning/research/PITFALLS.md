# Pitfalls Research

**Domain:** 教育管理系统后端 API (Education Management System Backend API)
**Researched:** 2026-03-30
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: 成绩批量录入事务不完整

**What goes wrong:**
批量录入学生成绩时，部分成功部分失败，导致数据库数据不一致。例如：录入 50 名学生成绩，30 名成功写入后出现错误，导致 20 名学生成绩丢失，但前端显示全部失败。

**Why it happens:**
- 使用循环逐条插入而非事务批量操作
- 单条插入失败未回滚已成功的记录
- 批量接口缺乏原子性保证

**How to avoid:**
```rust
// 使用 SQLx 事务
async fn batch_insert_scores(pool: &SqlxPool, scores: Vec<Score>) -> Result<()> {
    let mut tx = pool.begin().await?;
    for score in scores {
        sqlx::query("INSERT INTO scores (student_id, course_id, score) VALUES (?, ?, ?)")
            .bind(&score.student_id)
            .bind(&score.course_id)
            .bind(&score.score)
            .execute(&mut tx)
            .await?;
    }
    tx.commit().await?;  // 全部成功才提交
    Ok(())
}
```

**Warning signs:**
- 成绩录入接口返回成功但数据库记录不完整
- 学生查询成绩时发现分数为 0 或缺失
- 并发录入同一门课程时出现数据覆盖

**Phase to address:**
- 阶段 2：基础 CRUD 模块（成绩管理）

---

### Pitfall 2: 权限控制粒度过粗导致数据泄露

**What goes wrong:**
教师可以查看/修改非任教班级的学生成绩，班主任可以查看非本班学生信息。例如：数学老师能看到全校所有学生的数学成绩，而非仅限自己任教的班级。

**Why it happens:**
- API 缺少基于用户角色的数据过滤
- 查询语句未关联用户权限范围
- 所有教师账户共享同一套 API 权限

**How to避免:**
```rust
// 在查询时注入权限过滤条件
async fn get_scores(
    State(state): State<AppState>,
    UserRole(current_user): UserRole,  // 从 JWT 解析
    Query(params): Query<ScoreQuery>,
) -> Result<Json<Vec<Score>>> {
    let mut query = "SELECT * FROM scores WHERE 1=1".to_string();
    
    // 根据用户角色动态添加过滤条件
    match current_user {
        Role::Teacher(id) => {
            // 只返回教师任教的课程成绩
            query.push_str(&format!(
                " AND course_id IN (SELECT course_id FROM teacher_courses WHERE teacher_id = '{}')",
                id
            ));
        }
        Role::ClassTeacher(class_id) => {
            // 只返回班主任所在班级的成绩
            query.push_str(&format!(
                " AND student_id IN (SELECT id FROM students WHERE class_id = '{}')",
                class_id
            ));
        }
        Role::Admin => {}  // 管理员无限制
    }
    
    // ... 执行查询
}
```

**Warning signs:**
- 非班主任能在学生列表中看到其他班级学生
- 教师能通过 API 直接查询任意学生 ID 的成绩
- 权限测试用例覆盖不足

**Phase to address:**
- 阶段 3：角色权限模块

---

### Pitfall 3: 学生-班级-课程关系一致性未验证

**What goes wrong:**
为不在班级中的学生录入成绩、为未选修课程的学生分配成绩、系统允许删除正在使用中的班级或课程。例如：学生已离校但成绩仍存在，或删除班级后该班学生变成"无班级"状态。

**Why it happens:**
- 缺少外键约束或外键检查被禁用
- 删除操作未检查关联数据
- 业务逻辑层未做级联处理

**How to avoid:**
```rust
// 删除班级前检查关联数据
async fn delete_class(State(state): State<AppState>, Path(class_id): Path<String>) -> Result<Json<()>> {
    // 检查是否有学生关联
    let student_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM students WHERE class_id = ?"
    )
    .bind(&class_id)
    .fetch_one(&state.db)
    .await?;

    if student_count.0 > 0 {
        return Err(Error::Business(format!(
            "班级还有 {} 名学生，无法删除", 
            student_count.0
        )));
    }

    // 执行删除
    sqlx::query("DELETE FROM classes WHERE id = ?")
        .bind(&class_id)
        .execute(&state.db)
        .await?;

    Ok(Json(()))
}
```

**Warning signs:**
- 数据库中存在孤立记录（student.class_id 指向不存在的班级）
- 删除课程后成绩表中出现课程 ID 为 NULL 的记录
- 前端显示学生班级为"未知"或空值

**Phase to address:**
- 阶段 2：基础 CRUD 模块

---

### Pitfall 4: API 响应格式不一致

**What goes wrong:**
不同模块的 API 返回格式不统一，有的返回 `{code, message, data}`，有的返回错误时直接返回 HTTP 状态码，有的返回 `{error: "xxx"}`。前端需要针对每个接口做特殊处理。

**Why it happens:**
- 未定义统一的错误处理中间件
- 各模块开发者按个人习惯返回响应
- 缺乏 API 响应规范约束

**How to避免:**
```rust
// 统一错误处理中间件
async fn handle_error(err: ApiError) -> Response {
    let (status, code, message) = match err {
        ApiError::Validation(msg) => (StatusCode::BAD_REQUEST, 400, msg),
        ApiError::NotFound(msg) => (StatusCode::NOT_FOUND, 404, msg),
        ApiError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, 401, msg),
        ApiError::Database(e) => (StatusCode::INTERNAL_SERVER_ERROR, 500, "数据库错误"),
        // ...
    };

    Json(ApiResponse::<()>::error(code, message)).into_response()
}

// 统一响应格式
#[derive(Serialize)]
struct ApiResponse<T> {
    code: i32,
    message: String,
    data: Option<T>,
}

impl<T> ApiResponse<T> {
    fn success(data: T) -> Self {
        Self { code: 0, message: "操作成功".to_string(), data: Some(data) }
    }
    
    fn error(code: i32, message: String) -> Self {
        Self { code, message, data: None }
    }
}
```

**Warning signs:**
- 前端需要为不同接口编写不同的错误处理逻辑
- API 文档中错误码定义不统一
- 单元测试难以验证错误响应格式

**Phase to address:**
- 阶段 1：基础架构（如果尚未完成）

---

### Pitfall 5: 业务规则验证缺失

**What goes wrong:**
- 成绩超出有效范围（如输入 150 分或负数）
- 学号重复或格式错误
- 课程时间冲突未检测
- 同一学生重复选修同一门课程

**Why it happens:**
- 仅依赖数据库字段类型验证（如 INT 类型）
- 缺少业务逻辑层的规则校验
- 未定义业务规则常量或配置

**How to避免:**
```rust
// 成绩验证器
fn validate_score(score: f64) -> Result<f64, ValidationError> {
    if !(0.0..=100.0).contains(&score) {
        return Err(ValidationError::new("成绩必须在 0-100 之间"));
    }
    // 检查是否为有效数字
    if score.is_nan() || score.is_infinite() {
        return Err(ValidationError::new("成绩必须是有效数字"));
    }
    Ok(score)
}

// 学号格式验证
fn validate_student_no(no: &str) -> Result<String, ValidationError> {
    // 示例：学号格式为 "2024" + 6位数字
    let regex = Regex::new(r"^\d{10}$").unwrap();
    if !regex.is_match(no) {
        return Err(ValidationError::new("学号格式不正确，应为10位数字"));
    }
    Ok(no.to_string())
}
```

**Warning signs:**
- 数据库中出现异常成绩值（999、-1 等）
- 学生列表中出现重复学号
- 排课出现同一教室同一时间多门课程

**Phase to address:**
- 阶段 2：基础 CRUD 模块

---

### Pitfall 6: 敏感数据未脱敏

**What goes wrong:**
API 返回学生敏感信息（身份证号、家庭住址、家长电话）未做脱敏处理，前端展示时直接显示完整信息，存在数据泄露风险。

**Why it happens:**
- 开发阶段为方便调试返回完整数据
- 未定义敏感字段列表
- 缺少数据脱敏中间件

**How to避免:**
```rust
// 敏感字段脱敏
fn sanitize_student(student: &Student) -> StudentResponse {
    StudentResponse {
        id: student.id.clone(),
        name: student.name.clone(),
        student_no: mask_student_no(&student.student_no),
        id_card: mask_id_card(&student.id_card),      // 脱敏
        phone: mask_phone(&student.phone),            // 脱敏
        address: mask_address(&student.address),      // 脱敏
        // ... 非敏感字段正常返回
    }
}

fn mask_id_card(id_card: &str) -> String {
    if id_card.len() < 8 {
        return "****".to_string();
    }
    format!("{}**********{}", &id_card[..4], &id_card[id_card.len()-4..])
}
```

**Warning signs:**
- API 文档中未标注哪些字段需要脱敏
- 开发环境可直接查询生产数据
- 日志中包含完整敏感信息

**Phase to address:**
- 阶段 4：安全与合规

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| 暂时跳过权限验证，先实现功能 | 快速完成功能开发 | 后期补做容易遗漏，测试成本高 | 从未可接受 |
| 使用 String 存储日期而非 DATE 类型 | 避免时区问题 | 无法利用数据库日期函数，失去数据校验 | 从未可接受 |
| 字段验证全部放在前端 | 开发快速 | 可绕过，风险极高 | 从未可接受 |
| 不做 API 版本控制 | 前期简单 | 后期接口变更必 Breaking Change | 仅内部工具且确定无外部调用 |
| 用 JOIN 替代多次查询（N+1） | 减少请求次数 | SQL 复杂，调试困难 | 中小数据集优先优化 |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| 前端 API 调用 | 未处理 Token 过期导致无限循环刷新 | 实现 Token 自动刷新拦截器，设置最大重试次数 |
| 数据库连接池 | 连接池过小导致高并发超时 | 根据预估并发数配置，SQLx 默认 5 连接通常不足 |
| 批量导入 | 未限制单次导入数量导致内存溢出 | 设置单次最大导入条数（如 1000 条），支持分批处理 |
| 文件上传 | 未限制文件大小导致 DoS | 在 Axum 中配置 Payload 尺寸限制 |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 查询问题 | 循环中逐条查询学生成绩，100 学生 = 101 次查询 | 使用 JOIN 或批量查询 | 学生数 > 50 |
| 未分页的列表查询 | 班级学生列表返回全部数据，10000 学生 = 内存爆炸 | 实现分页，默认每页 20 条 | 学生数 > 1000 |
| 未建索引的关联查询 | 按学号查询成绩慢，按课程统计更慢 | 在外键和常用查询字段建索引 | 数据量 > 5000 |
| 同步阻塞操作 | 文件读取或 HTTP 调用在 async 上下文中阻塞 | 使用 tokio::spawn 或异步库 | 任何并发场景 |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| SQL 注入风险 | 恶意输入可获取全部数据 | 使用参数化查询（SQLx 默认支持），禁止拼接 SQL |
| 越权访问 | 用户可访问他人数据 | 所有查询必须携带用户身份过滤条件 |
| 敏感信息泄露 | API 返回脱敏数据被绕过 | 脱敏在服务端完成，禁止前端控制是否脱敏 |
| 密码存储不安全 | 密码Hash被暴力破解 | 已使用 Argon2（好），避免使用 MD5/SHA1 |
| 批量操作无限制 | 恶意脚本批量删除/修改数据 | 实现速率限制和操作审计 |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| 错误信息不明确 | "操作失败" 无法指导用户如何修复 | 返回具体错误原因和解决方案 |
| 删除操作无确认 | 误删班级后恢复困难 | 实现软删除或删除前确认提示 |
| 成绩录入无缓存 | 网络断开导致已录入数据丢失 | 前端实现草稿自动保存 |
| 列表无搜索筛选 | 1000 学生难以定位 | 实现服务端分页 + 字段搜索 |

---

## "Looks Done But Isn't" Checklist

- [ ] **成绩模块：** 批量录入未使用事务 — 验证部分失败时数据一致性
- [ ] **权限模块：** 教师只能看到任教班级 — 用非任教班级数据测试 API
- [ ] **删除操作：** 有关联数据时拒绝删除 — 测试删除有学生的班级
- [ ] **敏感字段：** API 响应中身份证/电话已脱敏 — 用 Postman 直接调用验证
- [ ] **错误处理：** 所有错误返回统一格式 — 用错误场景测试每个端点
- [ ] **分页：** 列表接口支持分页参数 — 不带分页参数调用验证默认值
- [ ] **validation：** 成绩可输入 200 分 — 用边界值测试验证逻辑

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| 成绩事务不完整 | HIGH | 停用系统，手动核对并补录数据，修复后重新导入 |
| 权限泄露 | MEDIUM | 审计访问日志，通知受影响用户，修复权限逻辑 |
| 敏感数据泄露 | HIGH | 评估泄露范围，按法规要求通知，重置相关凭证 |
| 重复数据 | LOW | 编写去重 SQL 脚本，执行后验证唯一性约束 |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 成绩批量事务不完整 | Phase 2: 成绩管理 CRUD | 测试批量插入部分失败场景 |
| 权限控制粒度过粗 | Phase 3: 角色权限模块 | 用不同角色账号测试数据访问边界 |
| 数据关系一致性 | Phase 2: 各 CRUD 模块 | 测试删除有关联数据的实体 |
| API 响应格式不一致 | Phase 1: 基础架构 | 审查各模块错误响应格式 |
| 业务规则验证缺失 | Phase 2: 各 CRUD 模块 | 用边界值和异常输入测试 |
| 敏感数据未脱敏 | Phase 4: 安全与合规 | 用 Postman 直接调用 API 检查响应 |
| N+1 查询问题 | Phase 2/3: 性能优化 | 用 SQLx 日志查看执行查询数 |
| 分页缺失 | Phase 2: 列表接口 | 测试大数据量列表响应 |

---

## Sources

- 教育管理系统常见安全漏洞：CVE-2026-1701 Student Management System SQLi
- Ed-Fi 教育数据安全规范：https://docs.ed-fi.org/
- Axum 官方文档：错误处理最佳实践
- SQLx 事务文档：https://docs.rs/sqlx/
- 教务系统数据对接常见问题：帆软 2025 年教育信息化报告
- Stack Overflow：事务回滚相关问答
- 社区讨论：Rust API 常见错误模式

---

*Pitfalls research for: 教育管理系统后端 API*
*Researched: 2026-03-30*
