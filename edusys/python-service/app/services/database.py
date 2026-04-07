"""数据库服务 - 直接连接后端数据库查询学生数据"""
import asyncpg
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger


class DatabaseService:
    """数据库服务 - 用于查询学生数据"""

    _pool: Optional[asyncpg.Pool] = None

    @classmethod
    async def get_pool(cls) -> asyncpg.Pool:
        """获取数据库连接池"""
        if cls._pool is None:
            cls._pool = await asyncpg.create_pool(
                host=settings.db_host,
                port=settings.db_port,
                user=settings.db_user,
                password=settings.db_password,
                database=settings.db_name,
                min_size=2,
                max_size=10
            )
            logger.info("数据库连接池已创建")
        return cls._pool

    @classmethod
    async def close_pool(cls):
        """关闭数据库连接池"""
        if cls._pool:
            await cls._pool.close()
            cls._pool = None
            logger.info("数据库连接池已关闭")

    @classmethod
    async def get_students_by_grade(cls, grade_id: int) -> List[Dict[str, Any]]:
        """
        根据年级ID获取学生列表

        :param grade_id: 年级ID
        :return: 学生列表 [{"id": 1, "studentNo": "考号", "studentId": "学籍辅号", "name": "姓名", "className": "班级"}, ...]
        """
        pool = await cls.get_pool()

        query = """
            SELECT
                s.id,
                s."studentNo",
                s."studentId",
                s.name,
                c."className"
            FROM student s
            LEFT JOIN class c ON s."classId" = c.id
            WHERE s.status = 1 AND c."gradeId" = $1
            ORDER BY s."studentNo"
        """

        async with pool.acquire() as conn:
            rows = await conn.fetch(query, grade_id)

        students = []
        for row in rows:
            students.append({
                "id": row["id"],
                "studentNo": row["studentNo"],
                "studentId": row["studentId"],
                "name": row["name"],
                "className": row["className"]
            })

        logger.info(f"查询到年级ID={grade_id}的学生: {len(students)} 人")
        return students


# 导出单例
db_service = DatabaseService()