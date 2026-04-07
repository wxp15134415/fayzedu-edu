"""应用配置"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "数据导入微服务"
    app_version: str = "1.0.0"
    host: str = "0.0.0.0"
    port: int = 8000

    # 文件限制
    max_file_size: int = 50 * 1024 * 1024  # 50MB

    # 日志配置
    log_level: str = "INFO"

    # CORS
    cors_origins: list = ["*"]

    # 数据库配置
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "wangxiaoping"
    db_password: str = ""
    db_name: str = "edusys"

    class Config:
        env_file = ".env"


settings = Settings()
