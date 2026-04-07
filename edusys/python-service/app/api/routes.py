"""
API 路由定义
按功能模块分组：score（成绩）、student（学生）、teacher（教师）等
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Request
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import time
import json

from app.services.parser import parse_excel
from app.services.matcher import StudentMatcher
from app.models.schemas import ParseResponse, StudentScore, ScoreData
from app.core.logging import logger
from app.core.matching_config import matching_config

# 成绩相关路由
score_router = APIRouter(tags=["成绩模块"])

# 请求模型
class MatchRequest(BaseModel):
    existing_students: Optional[List[Dict[str, Any]]] = None
    import_students: List[Dict[str, Any]]
    grade_id: Optional[int] = None
    grade_name: Optional[str] = None


def log_request(request: Request, method: str):
    """记录请求日志"""
    client_ip = request.client.host if request.client else "unknown"
    logger.info(f"请求 - {method} - 客户端: {client_ip}")


@score_router.post("/score/parse", response_model=ParseResponse)
async def parse_score_file(request: Request, file: UploadFile = File(...), system: str = Form(None)):
    """
    解析成绩 Excel 文件

    支持的系统:
    - 好分数
    - 睿芽
    - 七天
    - 学校自定义格式

    返回：
    - success: 是否成功
    - total: 总条数
    - success_count: 成功条数
    - fail_count: 失败条数
    - data: 解析出的数据
    """
    start_time = time.time()
    log_request(request, "score/parse")

    # 检查文件类型
    if not file.filename.endswith(('.xlsx', '.xls')):
        logger.warning(f"不支持的文件格式: {file.filename}")
        raise HTTPException(
            status_code=400,
            detail="只支持 .xlsx 或 .xls 格式的文件"
        )

    # 检查文件名
    logger.info(f"解析文件: {file.filename}, 指定系统: {system or '自动检测'}")

    try:
        # 读取文件内容
        content = await file.read()

        # 检查文件大小
        if len(content) == 0:
            logger.warning("上传文件为空")
            raise HTTPException(
                status_code=400,
                detail="上传文件为空"
            )

        # 解析
        result = parse_excel(content, system)

        # 记录结果
        elapsed = time.time() - start_time
        if result.success:
            logger.info(f"解析成功: {file.filename}, {len(result.data.students)} 条数据, 耗时: {elapsed:.2f}s")
        else:
            logger.warning(f"解析失败: {file.filename}, {result.message}")

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"解析异常: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"解析失败: {str(e)}"
        )


@score_router.post("/score/match")
async def match_students(request: Request, request_body: MatchRequest):
    """
    智能匹配学生

    :param existing_students: 数据库中已有的学生列表
        [{"id": 1, "studentNo": "考号", "studentId": "学籍辅号", "name": "姓名", "className": "班级"}, ...]
    :param import_students: 从Excel解析出的学生列表
    :return: 匹配结果

    返回：
    - success: 是否成功
    - matched: 匹配成功的列表
    - unmatched: 未匹配的列表
    """
    start_time = time.time()
    log_request(request, "score/match")

    existing_students = request_body.existing_students
    import_students = request_body.import_students
    grade_id = request_body.grade_id
    grade_name = request_body.grade_name

    logger.info(f"【Python】匹配请求: 导入学生 {len(import_students) if import_students else 0} 人")
    logger.info(f"【Python】年级参数: grade_id={grade_id}, grade_name={grade_name}")

    # 如果没有提供已有学生，但提供了年级ID，则从数据库查询
    if not existing_students and grade_id:
        from app.services.database import db_service
        existing_students = await db_service.get_students_by_grade(grade_id)
        logger.info(f"【Python】从数据库查询到年级ID={grade_id}的学生: {len(existing_students)} 人")

    logger.info(f"【Python】已有学生: {len(existing_students) if existing_students else 0} 人")
    logger.info(f"【Python】existing_students示例: {json.dumps(existing_students[:2] if existing_students else [], ensure_ascii=False)}")
    logger.info(f"【Python】import_students示例: {json.dumps(import_students[:2] if import_students else [], ensure_ascii=False)}")

    if not existing_students:
        logger.warning("未提供已有学生数据，也未指定年级ID")
        raise HTTPException(
            status_code=400,
            detail="请提供已有学生数据或指定年级ID"
        )

    if not import_students:
        logger.warning("未提供导入学生数据")
        raise HTTPException(
            status_code=400,
            detail="请提供导入学生数据"
        )

    try:
        # 创建匹配器
        matcher = StudentMatcher(existing_students)

        # 转换为 StudentScore 对象
        student_scores = []
        for s in import_students:
            # 将简单分数转换为 ScoreData 对象
            scores_dict = s.get('scores', {})
            scores_converted = {}
            for subj, score_val in scores_dict.items():
                if isinstance(score_val, dict):
                    scores_converted[subj] = ScoreData(**score_val)
                else:
                    # 简单数字转换为 ScoreData
                    scores_converted[subj] = ScoreData(raw=score_val)

            student_scores.append(StudentScore(
                row=s.get('row', 0),
                student_no=s.get('student_no'),
                student_id=s.get('student_id'),
                name=s.get('name', ''),
                class_name=s.get('class_name'),
                scores=scores_converted,
                match_status='unmatched',
                matched_student_id=None,
                match_method=None
            ))

        # 执行匹配
        matched, unmatched = matcher.match_all(student_scores)

        # 记录结果
        elapsed = time.time() - start_time
        logger.info(f"匹配完成: 成功 {len(matched)} 人, 未匹配 {len(unmatched)} 人, 耗时: {elapsed:.2f}s")

        return {
            "success": True,
            "message": f"匹配完成，成功: {len(matched)}, 未匹配: {len(unmatched)}",
            "matched": [
                {
                    "row": s.row,
                    "name": s.name,
                    "student_no": s.student_no,
                    "student_id": s.student_id,
                    "class_name": s.class_name,
                    "matched_student_id": s.matched_student_id,
                    "match_method": s.match_method,
                    "scores": s.scores
                }
                for s in matched
            ],
            "unmatched": [
                {
                    "row": s.row,
                    "name": s.name,
                    "student_no": s.student_no,
                    "student_id": s.student_id,
                    "class_name": s.class_name,
                    "match_method": s.match_method,
                    "scores": s.scores
                }
                for s in unmatched
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"匹配异常: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"匹配失败: {str(e)}"
        )


# ============================================
# ============================================
# 健康检查
# ============================================

@score_router.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "service": "python-service", "version": "1.0.0"}


# ============================================
# 匹配配置管理 API
# ============================================

config_router = APIRouter(tags=["配置管理"])


@config_router.get("/config/matching")
async def get_matching_config():
    """
    获取匹配配置
    """
    return matching_config.get_config_dict()


@config_router.post("/config/matching")
async def update_matching_config(config: Dict[str, Any]):
    """
    更新匹配配置
    """
    success = matching_config.update_config(config)

    if success:
        # 重新加载配置
        matching_config.reload()
        return {"success": True, "message": "配置更新成功", "data": matching_config.get_config_dict()}
    else:
        raise HTTPException(status_code=500, detail="配置更新失败")


@config_router.post("/config/matching/reload")
async def reload_matching_config():
    """
    重新加载匹配配置
    """
    matching_config.reload()
    return {"success": True, "message": "配置重新加载成功", "data": matching_config.get_config_dict()}


@config_router.put("/config/matching/strategy/{code}")
async def update_strategy(code: str, enabled: bool = None, priority: int = None):
    """
    更新单个匹配策略
    """
    success = matching_config.update_strategy(code, enabled, priority)

    if success:
        matching_config.reload()
        return {"success": True, "message": f"策略 {code} 更新成功", "data": matching_config.get_config_dict()}
    else:
        raise HTTPException(status_code=404, detail=f"策略 {code} 不存在")


# 主路由汇总 - 包含配置管理路由
from fastapi import APIRouter

router = APIRouter()
router.include_router(score_router)
router.include_router(config_router)
