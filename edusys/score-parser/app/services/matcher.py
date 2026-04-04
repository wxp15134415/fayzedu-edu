"""
学生匹配器 - 多策略匹配学生
"""
import re
from typing import List, Dict, Optional, Tuple, Any
from app.models.schemas import StudentScore, UnmatchedStudent


class StudentMatcher:
    """学生匹配器"""

    def __init__(self, existing_students: List[Dict[str, Any]]):
        """
        初始化匹配器
        :param existing_students: 数据库中已有的学生列表
            [{"id": 1, "studentNo": "考号", "studentId": "学籍辅号", "name": "姓名", "className": "班级", "classId": 班级ID}, ...]
        """
        self.existing_students = existing_students

        # 构建索引以加速匹配
        self._build_indexes()

    def _build_indexes(self):
        """构建索引"""
        # 按考号索引
        self.student_no_index = {}
        # 按学籍辅号索引（去除H后）
        self.student_id_no_h_index = {}
        # 按学籍辅号索引（原始值）
        self.student_id_index = {}
        # 按班级+姓名索引
        self.class_name_index = {}

        for student in self.existing_students:
            student_no = student.get('studentNo')
            student_id = student.get('studentId')
            name = student.get('name')
            class_name = student.get('className')

            # 考号索引
            if student_no:
                if student_no not in self.student_no_index:
                    self.student_no_index[student_no] = []
                self.student_no_index[student_no].append(student)

            # 学籍辅号索引（去除H后）
            if student_id:
                student_id_clean = student_id.replace('H', '').replace('h', '')
                if student_id_clean not in self.student_id_no_h_index:
                    self.student_id_no_h_index[student_id_clean] = []
                self.student_id_no_h_index[student_id_clean].append(student)

                # 原始值索引
                if student_id not in self.student_id_index:
                    self.student_id_index[student_id] = []
                self.student_id_index[student_id].append(student)

            # 班级+姓名索引
            if class_name and name:
                key = f"{class_name}|{name}"
                if key not in self.class_name_index:
                    self.class_name_index[key] = []
                self.class_name_index[key].append(student)

    def match(self, student: StudentScore) -> StudentScore:
        """
        匹配单个学生
        :param student: 从Excel解析出的学生数据
        :return: 带匹配结果的学生数据
        """
        matched = None
        match_method = None

        # 策略1: 考号精确匹配
        if student.student_no:
            matches = self.student_no_index.get(student.student_no, [])
            if len(matches) == 1:
                matched = matches[0]
                match_method = '考号'
            elif len(matches) > 1:
                # 多个匹配，使用班级进一步筛选
                if student.class_name:
                    filtered = [m for m in matches if m.get('className') == student.class_name]
                    if len(filtered) == 1:
                        matched = filtered[0]
                        match_method = '考号+班级'
                    elif len(filtered) > 1:
                        matched = filtered[0]
                        match_method = '考号+班级(多选)'
                    else:
                        matched = matches[0]
                        match_method = '考号(多选)'
                else:
                    matched = matches[0]
                    match_method = '考号(多选)'

        # 策略2: 学籍辅号匹配（去除H后）
        if not matched and student.student_id:
            student_id_clean = student.student_id.replace('H', '').replace('h', '')
            matches = self.student_id_no_h_index.get(student_id_clean, [])
            if len(matches) == 1:
                matched = matches[0]
                match_method = '学籍辅号(去H)'
            elif len(matches) > 1:
                matched = matches[0]
                match_method = '学籍辅号(去H)(多选)'

        # 策略3: 学籍辅号原始值匹配
        if not matched and student.student_id:
            matches = self.student_id_index.get(student.student_id, [])
            if len(matches) == 1:
                matched = matches[0]
                match_method = '学籍辅号'
            elif len(matches) > 1:
                matched = matches[0]
                match_method = '学籍辅号(多选)'

        # 策略4: 班级+姓名匹配
        if not matched and student.class_name and student.name:
            key = f"{student.class_name}|{student.name}"
            matches = self.class_name_index.get(key, [])
            if len(matches) == 1:
                matched = matches[0]
                match_method = '班级+姓名'
            elif len(matches) > 1:
                matched = matches[0]
                match_method = '班级+姓名(多选)'

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

        return matched_list, unmatched_list


def create_matcher(existing_students: List[Dict[str, Any]]) -> StudentMatcher:
    """创建学生匹配器"""
    return StudentMatcher(existing_students)
