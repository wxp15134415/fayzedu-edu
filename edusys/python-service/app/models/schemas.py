"""API 数据模型"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class ScoreData(BaseModel):
    raw: Optional[float] = None
    assign: Optional[float] = None
    school_rank: Optional[int] = None
    assign_rank: Optional[int] = None  # 赋分排名（年级排名）


class ExamInfo(BaseModel):
    system: str
    exam_name: str
    subjects: List[str]


class StudentScore(BaseModel):
    row: int
    student_no: Optional[str] = None
    student_id: Optional[str] = None
    name: str
    class_name: Optional[str] = None
    scores: Dict[str, ScoreData] = {}
    match_status: str  # matched, unmatched, multi_match
    matched_student_id: Optional[int] = None
    match_method: Optional[str] = None


class UnmatchedStudent(BaseModel):
    row: int
    student_no: Optional[str] = None
    student_id: Optional[str] = None
    name: str
    class_name: Optional[str] = None
    reason: str


class ParseResult(BaseModel):
    exam_info: ExamInfo
    students: List[StudentScore]
    unmatched: List[UnmatchedStudent]
    multi_match: List[Dict[str, Any]] = []


class ParseResponse(BaseModel):
    success: bool
    message: str = ""
    data: Optional[ParseResult] = None
    error_code: Optional[str] = None