"""
学生匹配器 - 多策略匹配学生（配置化版本）
"""
import re
from typing import List, Dict, Optional, Tuple, Any
from app.models.schemas import StudentScore, UnmatchedStudent
from app.core.matching_config import matching_config
from app.core.logging import logger


class StudentMatcher:
    """学生匹配器 - 支持配置化匹配策略"""

    def __init__(self, existing_students: List[Dict[str, Any]]):
        """
        初始化匹配器
        :param existing_students: 数据库中已有的学生列表
            [{"id": 1, "studentNo": "考号", "studentId": "学籍辅号", "name": "姓名", "className": "班级", "classId": 班级ID}, ...]
        """
        self.existing_students = existing_students

        # 获取配置
        self.config = matching_config

        # 构建索引以加速匹配
        self._build_indexes()

        # 记录日志
        logger.info(f"学生匹配器初始化: {len(existing_students)} 名已有学生")
        logger.info(f"启用策略: {self.config.get_strategy_codes()}")

    def _build_indexes(self):
        """构建索引 - 根据配置动态创建"""
        # 清空索引
        self.indexes = {}

        for student in self.existing_students:
            student_no = student.get('studentNo')
            student_id = student.get('studentId')
            name = student.get('name')
            class_name = student.get('className')

            # 考号索引
            if student_no:
                self._add_to_index('student_no', student_no, student)

            # 学籍辅号索引（去除H后）
            if student_id:
                student_id_clean = student_id.replace('H', '').replace('h', '')
                self._add_to_index('student_id_no_h', student_id_clean, student)
                # 原始值索引
                self._add_to_index('student_id', student_id, student)

            # 班级+姓名索引
            if class_name and name:
                key = f"{class_name}|{name}"
                self._add_to_index('class_name', key, student)

            # 姓名索引（用于模糊匹配）
            if name:
                self._add_to_index('name', name, student)

    def _add_to_index(self, index_name: str, key: str, student: Dict[str, Any]):
        """添加数据到索引"""
        if index_name not in self.indexes:
            self.indexes[index_name] = {}

        if key not in self.indexes[index_name]:
            self.indexes[index_name][key] = []

        self.indexes[index_name][key].append(student)

    def _get_from_index(self, index_name: str, key: str) -> List[Dict[str, Any]]:
        """从索引获取数据"""
        if index_name not in self.indexes:
            return []

        # 不区分大小写的匹配
        key_lower = key.lower() if key else ''

        # 精确匹配
        if key in self.indexes[index_name]:
            return self.indexes[index_name][key]

        # 不区分大小写匹配（仅当精确匹配失败时）
        if key_lower:
            for k, v in self.indexes[index_name].items():
                if k.lower() == key_lower:
                    return v

        return []

    def _match_by_student_no(self, student: StudentScore) -> Tuple[Optional[Dict], Optional[str]]:
        """策略1: 考号匹配"""
        if not student.student_no:
            return None, None

        matches = self._get_from_index('student_no', student.student_no)
        if not matches:
            return None, None

        if len(matches) == 1:
            return matches[0], '考号'

        # 多个匹配，使用班级进一步筛选
        if student.class_name:
            filtered = [m for m in matches if m.get('className') == student.class_name]
            if len(filtered) == 1:
                return filtered[0], '考号+班级'
            elif len(filtered) > 1:
                return filtered[0], '考号+班级(多选)'

        return matches[0], '考号(多选)'

    def _match_by_student_id_no_h(self, student: StudentScore) -> Tuple[Optional[Dict], Optional[str]]:
        """策略2: 学籍辅号匹配（去除H后）"""
        if not student.student_id:
            return None, None

        student_id_clean = student.student_id.replace('H', '').replace('h', '')
        matches = self._get_from_index('student_id_no_h', student_id_clean)

        if not matches:
            return None, None

        if len(matches) == 1:
            return matches[0], '学籍辅号(去H)'

        return matches[0], '学籍辅号(去H)(多选)'

    def _match_by_student_id(self, student: StudentScore) -> Tuple[Optional[Dict], Optional[str]]:
        """策略3: 学籍辅号原始值匹配"""
        if not student.student_id:
            return None, None

        matches = self._get_from_index('student_id', student.student_id)

        if not matches:
            return None, None

        if len(matches) == 1:
            return matches[0], '学籍辅号'

        return matches[0], '学籍辅号(多选)'

    def _match_by_class_name(self, student: StudentScore) -> Tuple[Optional[Dict], Optional[str]]:
        """策略4: 班级+姓名匹配"""
        if not student.class_name or not student.name:
            return None, None

        key = f"{student.class_name}|{student.name}"
        matches = self._get_from_index('class_name', key)

        if not matches:
            return None, None

        if len(matches) == 1:
            return matches[0], '班级+姓名'

        return matches[0], '班级+姓名(多选)'

    def _match_by_name_fuzzy(self, student: StudentScore) -> Tuple[Optional[Dict], Optional[str]]:
        """策略5: 姓名模糊匹配"""
        if not student.name:
            return None, None

        # 获取姓名索引
        name_index = self.indexes.get('name', {})
        if not name_index:
            return None, None

        # 查找相似姓名
        student_name_lower = student.name.lower()
        threshold = 0.8  # 相似度阈值

        for name_key, students in name_index.items():
            if name_key.lower() == student_name_lower:
                # 精确匹配（不区分大小写）
                if len(students) == 1:
                    return students[0], '姓名'
                return students[0], '姓名(多选)'

        return None, None

    def match(self, student: StudentScore) -> StudentScore:
        """
        匹配单个学生 - 使用配置化的匹配策略
        :param student: 从Excel解析出的学生数据
        :return: 带匹配结果的学生数据
        """
        matched = None
        match_method = None

        # 检查匹配功能是否启用
        if not self.config.is_enabled():
            student.match_status = 'unmatched'
            student.matched_student_id = None
            student.match_method = '功能未启用'
            return student

        # 获取启用的策略列表（按优先级）
        strategies = self.config.get_enabled_strategies()

        # 按优先级依次尝试匹配
        for strategy in strategies:
            code = strategy.code

            if code == 'student_no':
                matched, match_method = self._match_by_student_no(student)
            elif code == 'student_id_no_h':
                matched, match_method = self._match_by_student_id_no_h(student)
            elif code == 'student_id':
                matched, match_method = self._match_by_student_id(student)
            elif code == 'class_name':
                matched, match_method = self._match_by_class_name(student)
            elif code == 'name_fuzzy':
                matched, match_method = self._match_by_name_fuzzy(student)

            # 如果匹配成功，跳出循环
            if matched:
                break

        # 设置匹配结果
        if matched:
            student.match_status = 'matched'
            student.matched_student_id = matched['id']
            student.match_method = match_method
        else:
            student.match_status = 'unmatched'
            student.matched_student_id = None
            student.match_method = None

        return student

    def match_all(self, students: List[StudentScore]) -> Tuple[List[StudentScore], List[StudentScore]]:
        """
        匹配所有学生
        :param students: 从Excel解析出的学生列表
        :return: (匹配成功的列表, 未匹配的列表)
        """
        matched_list = []
        unmatched_list = []

        for student in students:
            matched = self.match(student)
            if matched.match_status == 'matched':
                matched_list.append(matched)
            else:
                unmatched_list.append(matched)

        # 记录统计
        logger.info(f"匹配完成: 成功 {len(matched_list)} 人, 未匹配 {len(unmatched_list)} 人")

        return matched_list, unmatched_list


def create_matcher(existing_students: List[Dict[str, Any]]) -> StudentMatcher:
    """创建学生匹配器"""
    return StudentMatcher(existing_students)
