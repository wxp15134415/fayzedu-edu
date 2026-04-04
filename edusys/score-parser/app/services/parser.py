"""
Excel 解析器 - 支持多系统成绩导入
"""
import pandas as pd
import numpy as np
from io import BytesIO
from typing import List, Dict, Any, Optional, Tuple
import re

from app.models.schemas import (
    ParseResponse, ParseResult, ExamInfo,
    StudentScore, UnmatchedStudent, ScoreData
)


class ExcelParser:
    """Excel 解析器"""

    # 科目映射 - 标准化科目名称
    SUBJECT_MAP = {
        '语文': 'chinese',
        '数学': 'math',
        '英语': 'english',
        '物理': 'physics',
        '化学': 'chemistry',
        '生物': 'biology',
        '政治': 'politics',
        '历史': 'history',
        '地理': 'geography',
    }

    # 系统检测特征
    SYSTEM_PATTERNS = {
        '好分数': ['排行榜', '考号', '学号'],
        '睿芽': ['学校', '年级', '班级', '学号'],
        '七天': ['考号', '选科组合'],
        '原始': ['考号', '姓名', '班级'],
    }

    def __init__(self, content: bytes, system: str = None):
        self.content = content
        self.df = None
        # 如果指定了系统，直接使用；否则自动检测
        self.system = system if system else 'unknown'
        self.exam_name = ''
        self.subjects = []
        self._system_patterns = {
            '好分数': ['排行榜', '考号', '学号'],
            '睿芽': ['学校', '年级', '班级', '学号'],
            '七天': ['考号', '选科组合'],
            '原始': ['考号', '姓名', '班级'],
        }

    def detect_system(self) -> str:
        """自动检测考试系统"""
        first_row = str(self.df.iloc[0].fillna('').values)

        for system, patterns in self._system_patterns.items():
            if any(p in first_row for p in patterns):
                return system

        # 默认尝试原始格式
        return '原始'

    def get_header_rows(self) -> Tuple[int, int]:
        """获取表头行的起始和结束索引"""
        system = self.system

        if system == '睿芽':
            return 0, 1  # 表头在 0-1 行
        else:
            return 1, 2  # 表头在 1-2 行

    def parse(self) -> ParseResponse:
        """解析 Excel 文件"""
        try:
            # 读取 Excel
            self.df = pd.read_excel(BytesIO(self.content), header=None)

            if self.df.empty:
                return ParseResponse(
                    success=False,
                    message="文件为空",
                    error_code="40003"
                )

            # 如果没有指定系统，则自动检测
            if self.system == 'unknown':
                self.system = self.detect_system()

            # 提取考试名称
            self.exam_name = self._extract_exam_name()

            # 提取科目列表
            self.subjects = self._extract_subjects()

            # 提取学生成绩
            students, unmatched = self._extract_students()

            result = ParseResult(
                exam_info=ExamInfo(
                    system=self.system,
                    exam_name=self.exam_name,
                    subjects=self.subjects
                ),
                students=students,
                unmatched=unmatched
            )

            return ParseResponse(
                success=True,
                message=f"解析成功，共 {len(students)} 条数据",
                data=result
            )

        except Exception as e:
            return ParseResponse(
                success=False,
                message=f"解析失败: {str(e)}",
                error_code="50001"
            )

    def _extract_exam_name(self) -> str:
        """提取考试名称"""
        first_cell = str(self.df.iloc[0, 0]) if len(self.df.columns) > 0 else ''
        if pd.isna(first_cell) or first_cell == 'nan':
            return '未知考试'
        return first_cell

    def _extract_subjects(self) -> List[str]:
        """提取科目列表"""
        subjects = []
        header_start, _ = self.get_header_rows()

        for col_idx in range(3, len(self.df.columns)):
            subject_name = self.df.iloc[header_start, col_idx]
            if pd.notna(subject_name) and str(subject_name).strip():
                subjects.append(str(subject_name).strip())

        return subjects

    def _extract_students(self) -> Tuple[List[StudentScore], List[UnmatchedStudent]]:
        """提取学生成绩数据"""
        students = []
        unmatched = []

        _, header_end = self.get_header_rows()
        data_start = header_end + 1

        # 字段位置映射
        field_map = self._get_field_map()

        for row_idx in range(data_start, len(self.df)):
            row = self.df.iloc[row_idx]

            # 获取关键字段
            student_no = self._get_cell(row, field_map['student_no'])
            student_id = self._get_cell(row, field_map['student_id'])
            name = self._get_cell(row, field_map['name'])
            class_name = self._get_cell(row, field_map['class_name'])

            # 跳过空行
            if not name or pd.isna(row.iloc[0]):
                continue

            # 提取各科成绩
            scores = self._extract_scores(row, field_map)

            student = StudentScore(
                row=row_idx,
                student_no=student_no,
                student_id=student_id,
                name=name,
                class_name=class_name,
                scores=scores,
                match_status='unmatched',  # 初始为未匹配，后端处理匹配
                matched_student_id=None,
                match_method=None
            )

            students.append(student)

        return students, unmatched

    def _get_field_map(self) -> Dict[str, int]:
        """获取字段位置映射"""
        system = self.system

        field_maps = {
            '好分数': {
                'student_no': 1,  # 考号
                'student_id': 2,  # 学号
                'name': 0,  # 姓名
                'class_name': 3,  # 班级
                'score_start': 6,  # 成绩起始列
            },
            '睿芽': {
                'student_no': 4,  # 学号
                'student_id': 4,  # 学号（没有考号字段）
                'name': 3,  # 姓名
                'class_name': 2,  # 班级
                'score_start': 5,  # 成绩起始列
            },
            '七天': {
                'student_no': 0,  # 考号
                'student_id': 0,  # 考号（没有学籍辅号）
                'name': 1,  # 姓名
                'class_name': 2,  # 班级
                'score_start': 4,  # 成绩起始列
            },
            '原始': {
                'student_no': 0,  # 考号
                'student_id': 0,  # 考号
                'name': 1,  # 姓名
                'class_name': 2,  # 班级
                'score_start': 3,  # 成绩起始列
            },
        }

        return field_maps.get(system, field_maps['原始'])

    def _get_cell(self, row, idx: int) -> Optional[str]:
        """安全获取单元格值"""
        if idx >= len(row):
            return None
        val = row.iloc[idx]
        if pd.isna(val):
            return None
        return str(val).strip()

    def _extract_scores(self, row, field_map: Dict) -> Dict[str, ScoreData]:
        """提取各科成绩"""
        scores = {}

        # 好分数格式：
        # 第1行是科目名，第2行是子列名
        # 各科目列数不同，需要根据header2来确定
        header2 = self.df.iloc[2].values if len(self.df) > 2 else []

        # 总分 (列6-11): 6列 [原始成绩, 赋分成绩, 联考排名, 区县排名, 学校排名, 班级排名]
        total_raw = row.iloc[6] if len(row) > 6 else None
        total_assign = row.iloc[7] if len(row) > 7 else None
        total_school_rank = row.iloc[10] if len(row) > 10 else None
        total_class_rank = row.iloc[11] if len(row) > 11 else None

        if pd.notna(total_raw):
            try:
                scores['总分'] = ScoreData(
                    raw=float(total_raw),
                    assign=float(total_assign) if pd.notna(total_assign) else None,
                    school_rank=int(total_school_rank) if pd.notna(total_school_rank) else None,
                    class_rank=int(total_class_rank) if pd.notna(total_class_rank) else None
                )
            except (ValueError, TypeError):
                pass

        # 科目列位置定义
        # 格式: [起始列, 列数, 是否有赋分成绩]
        subject_config = {
            '语文': [20, 5, False],    # [分数, 联考排名, 区县排名, 学校排名, 班级排名]
            '数学': [25, 5, False],    # [分数, 联考排名, 区县排名, 学校排名, 班级排名]
            '英语': [30, 5, False],    # [分数, 联考排名, 区县排名, 学校排名, 班级排名]
            '物理': [35, 5, False],    # [分数, 联考排名, 区县排名, 学校排名, 班级排名]
            '历史': [40, 4, False],    # [分数, 联考排名, 学校排名, 班级排名]
            '化学': [44, 6, True],     # [原始成绩, 赋分成绩, 联考排名, 区县排名, 学校排名, 班级排名]
            '生物': [50, 6, True],     # [原始成绩, 赋分成绩, 联考排名, 区县排名, 学校排名, 班级排名]
            '政治': [56, 5, True],     # [原始成绩, 赋分成绩, 联考排名, 学校排名, 班级排名]
            '地理': [61, 5, True],     # [原始成绩, 赋分成绩, 联考排名, 学校排名, 班级排名]
        }

        for subj, config in subject_config.items():
            col_start, col_count, has_assign = config
            if col_start + col_count > len(row):
                continue

            raw_score = row.iloc[col_start]
            if pd.isna(raw_score) or str(raw_score).strip() == '--':
                continue

            try:
                raw_val = float(raw_score)

                if has_assign:
                    # 有赋分成绩的科目（化学、生物、政治、地理）
                    assign_score = row.iloc[col_start + 1] if col_start + 1 < len(row) else None
                    assign_rank = row.iloc[col_start + 2] if col_start + 2 < len(row) else None

                    # 找到学校排名和班级排名的位置
                    school_rank = None
                    class_rank = None
                    if col_count == 6:  # 化学、生物
                        school_rank = row.iloc[col_start + 4] if col_start + 4 < len(row) else None
                        class_rank = row.iloc[col_start + 5] if col_start + 5 < len(row) else None
                    elif col_count == 5:  # 政治、地理
                        school_rank = row.iloc[col_start + 3] if col_start + 3 < len(row) else None
                        class_rank = row.iloc[col_start + 4] if col_start + 4 < len(row) else None

                    scores[subj] = ScoreData(
                        raw=raw_val,
                        assign=float(assign_score) if pd.notna(assign_score) else None,
                        assign_rank=int(assign_rank) if pd.notna(assign_rank) else None,
                        school_rank=int(school_rank) if pd.notna(school_rank) else None,
                        class_rank=int(class_rank) if pd.notna(class_rank) else None
                    )
                else:
                    # 没有赋分成绩的科目（语文、数学、英语、物理、历史）
                    # 列结构: [分数, 联考排名, 区县排名, 学校排名, 班级排名] 或 [分数, 联考排名, 学校排名, 班级排名]
                    assign_rank = row.iloc[col_start + 1] if col_start + 1 < len(row) else None

                    school_rank = None
                    class_rank = None
                    if col_count == 5:  # 语文、数学、英语、物理
                        school_rank = row.iloc[col_start + 3] if col_start + 3 < len(row) else None
                        class_rank = row.iloc[col_start + 4] if col_start + 4 < len(row) else None
                    elif col_count == 4:  # 历史
                        school_rank = row.iloc[col_start + 2] if col_start + 2 < len(row) else None
                        class_rank = row.iloc[col_start + 3] if col_start + 3 < len(row) else None

                    scores[subj] = ScoreData(
                        raw=raw_val,
                        assign_rank=int(assign_rank) if pd.notna(assign_rank) else None,
                        school_rank=int(school_rank) if pd.notna(school_rank) else None,
                        class_rank=int(class_rank) if pd.notna(class_rank) else None
                    )
            except (ValueError, TypeError):
                pass

        return scores


def parse_excel(content: bytes, system: str = None) -> ParseResponse:
    """解析 Excel 文件的主函数"""
    parser = ExcelParser(content, system)
    return parser.parse()