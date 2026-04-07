"""
数据导入微服务 - FastAPI 入口
统一数据导入服务，支持成绩、学生、教师等数据导入
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import warnings

from app.api.routes import router as api_router
from app.core.config import settings
from app.core.logging import logger

warnings.filterwarnings('ignore')

app = FastAPI(
    title="数据导入微服务",
    description="统一数据导入服务，支持成绩、学生、教师等数据导入",
    version=settings.app_version
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """应用启动事件"""
    logger.info(f"数据导入微服务启动 - 版本: {settings.app_version}")
    logger.info(f"服务地址: {settings.host}:{settings.port}")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭事件"""
    logger.info("数据导入微服务关闭")


# 注册路由 - 按功能分组
app.include_router(api_router, prefix="/python")


@app.get("/")
async def root():
    return {
        "message": "数据导入微服务",
        "version": settings.app_version,
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    """全局健康检查"""
    return {
        "status": "healthy",
        "service": "python-service",
        "version": settings.app_version
    }


# 异常处理器
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """HTTP 异常处理"""
    logger.warning(f"HTTP异常: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "error_code": str(exc.status_code)
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    """通用异常处理"""
    logger.error(f"服务器内部错误: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "服务器内部错误",
            "error_code": "50000"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.host,
        port=settings.port,
        log_level="info"
    )
