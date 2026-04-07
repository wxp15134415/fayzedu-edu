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


def safe_float(value: Any, default: float = None) -> Optional[float]:
    """安全地将值转换为浮点数，非数字返回 default"""
    if value is None or pd.isna(value):
        return default
    try:
        # 尝试直接转换
        return float(value)
    except (ValueError, TypeError):
        # 如果是字符串，处理常见情况
        s = str(value).strip()
        if s in ['', '-', '--', '—', '缺考', '作弊', 'null', 'None', 'nan']:
            return default
        try:
            return float(s)
        except (ValueError, TypeError):
            return default


def safe_int(value: Any, default: int = None) -> Optional[int]:
    """安全地将值转换为整数，非数字返回 default"""
    result = safe_float(value)
    if result is None:
        return default
    try:
        return int(result)
    except (ValueError, TypeError):
        return default


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
        self.system = system if system and system.strip() else 'unknown'
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
        """获取表头行的起始和结束索引 - 动态检测"""
        system = self.system

        # 系统名称映射
        system_map = {
            'haofenshu': '好分数',
            'ruiya': '睿芽',
            'qitian': '七天',
            'custom': '原始',
        }
        system_key = system_map.get(system, system)

        if system_key == '睿芽':
            return 0, 1  # 表头在 0-1 行
        elif system_key == '七天':
            # 动态检测表头行数
            # 注意：此时 self.df 应该已经由 parse() 方法设置了
            if self.df is not None and len(self.df) >= 3:
                try:
                    # 检查第2行是否有"原始分"、"校内排名"等关键词
                    row2_values = []
                    for v in self.df.iloc[2].values:
                        if pd.notna(v):
                            row2_values.append(str(v))

                    has_subheaders = any('原始分' in v or '校内排名' in v or '班级排名' in v for v in row2_values)
                    if has_subheaders:
                        return 0, 2  # 3行表头: 考试名, 字段名, 子列名
                except Exception as e:
                    print(f"检测表头行数时出错: {e}")
            return 0, 1  # 默认2行表头
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

        # 系统名称映射
        system_map = {
            'haofenshu': '好分数',
            'ruiya': '睿芽',
            'qitian': '七天',
            'custom': '原始',
        }
        system_key = system_map.get(system, system)

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
                'score_start': 3,  # 成绩起始列（从总分开始）
            },
            '原始': {
                'student_no': 0,  # 考号
                'student_id': 0,  # 考号
                'name': 1,  # 姓名
                'class_name': 2,  # 班级
                'score_start': 3,  # 成绩起始列
            },
        }

        return field_maps.get(system_key, field_maps['原始'])

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

        # 系统名称映射
        system_map = {
            'haofenshu': '好分数',
            'ruiya': '睿芽',
            'qitian': '七天',
            'custom': '原始',
        }
        system_key = system_map.get(self.system, self.system)

        if system_key == '七天':
            return self._extract_scores_qitian(row)
        elif system_key == '好分数':
            return self._extract_scores_haofenshu(row)
        else:
            return scores

    def _extract_scores_qitian(self, row) -> Dict[str, ScoreData]:
        """提取七天系统的成绩"""
        scores = {}

        # 七天格式：3行表头
        # 第0行：考试名
        # 第1行：考号, 姓名, 班级, 选科组合, 总分, 语文, 数学, 英语...
        # 第2行：子列名 (原始分, 赋分, 校内排名, 班级排名...)
        # 数据从第3行开始

        # 通过分析表头行来动态确定列位置
        header_row1 = self.df.iloc[1] if len(self.df) > 1 else None  # 科目名行
        header_row2 = self.df.iloc[2] if len(self.df) > 2 else None  # 子列名行

        if header_row1 is None:
            return scores

        # 检测是否有赋分：检查总分后面的子列名
        has_fufen = False
        total_col = None

        # 找到总分所在的列
        for i, val in enumerate(header_row1):
            if pd.notna(val) and '总分' in str(val):
                total_col = i
                break

        if total_col is not None and header_row2 is not None:
            # 检查总分后的列是否有赋分
            if total_col + 1 < len(header_row2):
                header_val = header_row2.iloc[total_col + 1]
                if header_val and '赋分' in str(header_val):
                    has_fufen = True

        # 提取总分
        if total_col is not None and total_col < len(row):
            total_raw = row.iloc[total_col]
            raw_val = safe_float(total_raw)
            if raw_val is not None:
                if has_fufen:
                    # 有赋分格式：总分后有 赋分, 校内排名, 班级排名
                    assign_col = total_col + 1
                    rank_col = total_col + 2 if len(row) > total_col + 2 else None

                    # 检查是否有组合排名列
                    if header_row2 is not None and total_col + 2 < len(header_row2):
                        header_val = header_row2.iloc[total_col + 2]
                        if header_val and '组合' in str(header_val):
                            rank_col = total_col + 3  # 跳过组合排名

                    total_assign = row.iloc[assign_col] if assign_col < len(row) else None
                    total_rank = row.iloc[rank_col] if rank_col and rank_col < len(row) else None

                    scores['总分'] = ScoreData(
                        raw=raw_val,
                        assign=safe_float(total_assign),
                        school_rank=safe_int(total_rank),
                        assign_rank=safe_int(total_rank)
                    )
                else:
                    # 无赋分格式：总分后有 校内排名, 班级排名
                    rank_col = total_col + 1
                    total_rank = row.iloc[rank_col] if rank_col < len(row) else None
                    scores['总分'] = ScoreData(
                        raw=raw_val,
                        school_rank=safe_int(total_rank),
                        assign_rank=safe_int(total_rank)
                    )

        # 动态提取各科目
        subject_names = ['语文', '数学', '英语', '物理', '历史', '化学', '生物', '政治', '地理']

        for subj in subject_names:
            # 在表头中找到该科目的列位置
            subj_col = None
            for i, val in enumerate(header_row1):
                if pd.notna(val) and str(val) == subj:
                    subj_col = i
                    break

            if subj_col is None or subj_col >= len(row):
                continue

            raw_score = row.iloc[subj_col]
            raw_val = safe_float(raw_score)
            if raw_val is None:
                continue

            # 检查该科目是否有赋分
            subj_has_fufen = False
            if header_row2 is not None and subj_col + 1 < len(header_row2):
                header_val = header_row2.iloc[subj_col + 1]
                if header_val and '赋分' in str(header_val):
                    subj_has_fufen = True

            if subj_has_fufen and has_fufen:
                # 有赋分的科目：[原始, 赋分, 等级/排名, 校内排名, 班级排名]
                assign_score = row.iloc[subj_col + 1] if subj_col + 1 < len(row) else None
                # 赋分后可能是等级或直接是排名
                school_rank = row.iloc[subj_col + 3] if subj_col + 3 < len(row) else None
                scores[subj] = ScoreData(
                    raw=raw_val,
                    assign=safe_float(assign_score),
                    school_rank=safe_int(school_rank),
                    assign_rank=safe_int(school_rank)
                )
            else:
                # 无赋分：[原始, 校内排名, 班级排名]
                school_rank = row.iloc[subj_col + 1] if subj_col + 1 < len(row) else None
                rank_val = safe_int(school_rank)
                scores[subj] = ScoreData(
                    raw=raw_val,
                    school_rank=rank_val,
                    assign_rank=rank_val
                )

        return scores

    def _extract_scores_haofenshu(self, row) -> Dict[str, ScoreData]:
        """提取好分数系统的成绩"""
        scores = {}

        # 好分数格式
        header2 = self.df.iloc[2].values if len(self.df) > 2 else []

        # 总分 (列6-11): 6列 [原始成绩, 赋分成绩, 联考排名, 区县排名, 学校排名, 班级排名]
        total_raw = row.iloc[6] if len(row) > 6 else None
        total_assign = row.iloc[7] if len(row) > 7 else None
        total_school_rank = row.iloc[10] if len(row) > 10 else None

        # 使用安全的类型转换
        raw_val = safe_float(total_raw)
        if raw_val is not None:
            # 总分没有赋分排名时，用校内排名代替
            rank_val = safe_int(total_school_rank)
            scores['总分'] = ScoreData(
                raw=raw_val,
                assign=safe_float(total_assign),
                school_rank=rank_val,
                assign_rank=rank_val
            )

        # 科目列位置定义
        subject_config = {
            '语文': [20, 5, False],
            '数学': [25, 5, False],
            '英语': [30, 5, False],
            '物理': [35, 5, False],
            '历史': [40, 4, False],
            '化学': [44, 6, True],
            '生物': [50, 6, True],
            '政治': [56, 5, True],
            '地理': [61, 5, True],
        }

        for subj, config in subject_config.items():
            col_start, col_count, has_assign = config
            if col_start + col_count > len(row):
                continue

            raw_score = row.iloc[col_start]
            # 使用安全的类型转换
            raw_val = safe_float(raw_score)
            if raw_val is None:
                continue

            if has_assign:
                assign_score = row.iloc[col_start + 1] if col_start + 1 < len(row) else None
                assign_rank = row.iloc[col_start + 2] if col_start + 2 < len(row) else None
                school_rank = row.iloc[col_start + 4] if col_start + 4 < len(row) else None
                # 赋分排名没有时用校内排名代替
                rank_val = safe_int(school_rank)
                scores[subj] = ScoreData(
                    raw=raw_val,
                    assign=safe_float(assign_score),
                    assign_rank=safe_int(assign_rank) or rank_val,
                    school_rank=rank_val
                )
            else:
                assign_rank = row.iloc[col_start + 1] if col_start + 1 < len(row) else None
                school_rank = row.iloc[col_start + 3] if col_start + 3 < len(row) else None
                # 赋分排名没有时用校内排名代替
                rank_val = safe_int(school_rank)
                scores[subj] = ScoreData(
                    raw=raw_val,
                    assign_rank=safe_int(assign_rank) or rank_val,
                    school_rank=rank_val
                )

        return scores


def parse_excel(content: bytes, system: str = None) -> ParseResponse:
    """解析 Excel 文件的主函数"""
    parser = ExcelParser(content, system)
    return parser.parse()