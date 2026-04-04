"""应用配置"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "成绩解析微服务"
    app_version: str = "1.0.0"
    max_file_size: int = 10 * 1024 * 1024  # 10MB

    class Config:
        env_file = ".env"


settings = Settings()
