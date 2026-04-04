"""
API 路由定义
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Dict, Any
from pydantic import BaseModel

from app.services.parser import parse_excel
from app.services.matcher import StudentMatcher
from app.models.schemas import ParseResponse, StudentScore, ScoreData

router = APIRouter()


# 请求模型
class MatchRequest(BaseModel):
    existing_students: List[Dict[str, Any]]
    import_students: List[Dict[str, Any]]


@router.post("/parse", response_model=ParseResponse)
async def parse_score_file(file: UploadFile = File(...), system: str = None):
    """
    解析成绩 Excel 文件

    支持的系统:
    - 好分数
    - 睿芽
    - 七天
    - 学校自定义格式
    """
    # 检查文件类型
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=400,
            detail="只支持 .xlsx 或 .xls 格式的文件"
        )

    # 读取文件内容
    content = await file.read()

    # 解析，传入指定的系统
    result = parse_excel(content, system)

    return result


@router.post("/match")
async def match_students(request: MatchRequest):
    """
    匹配学生

    :param existing_students: 数据库中已有的学生列表
        [{"id": 1, "studentNo": "考号", "studentId": "学籍辅号", "name": "姓名", "className": "班级"}, ...]
    :param import_students: 从Excel解析出的学生列表
    :return: 匹配结果
    """
    existing_students = request.existing_students
    import_students = request.import_students

    if not existing_students:
        raise HTTPException(
            status_code=400,
            detail="请提供已有学生数据"
        )

    if not import_students:
        raise HTTPException(
            status_code=400,
            detail="请提供导入学生数据"
        )

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


@router.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}
